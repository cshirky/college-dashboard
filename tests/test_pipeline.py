"""Tests for the IPEDS data pipeline."""

import pandas as pd
import sys
import os
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "data", "pipeline"))

from build_dataset import (
    load_institutions,
    join_admissions,
    join_graduation_rates,
    join_enrollment_demographics,
    join_pell,
    add_labels,
    build_programs,
    main,
)

RAW_DIR = "data/raw"


# --- Task 3: Load and filter institutions ---

def test_load_institutions_filters_to_4year():
    df = load_institutions(RAW_DIR)
    assert set(df["SECTOR"].unique()).issubset({1, 2, 3})
    assert len(df) > 0


def test_load_institutions_has_required_columns():
    df = load_institutions(RAW_DIR)
    required = [
        "UNITID", "INSTNM", "STABBR", "CITY", "SECTOR", "LOCALE",
        "C18BASIC", "INSTSIZE", "CONTROL", "HBCU", "LONGITUD", "LATITUDE",
    ]
    for col in required:
        assert col in df.columns, f"Missing column: {col}"


# --- Task 4: Join admissions data ---

def test_join_admissions_adds_rate():
    inst = load_institutions(RAW_DIR)
    df = join_admissions(inst, RAW_DIR)
    assert "admission_rate" in df.columns
    valid = df["admission_rate"].dropna()
    assert valid.min() >= 0
    assert valid.max() <= 100


def test_join_admissions_preserves_institutions():
    inst = load_institutions(RAW_DIR)
    df = join_admissions(inst, RAW_DIR)
    assert len(df) == len(inst)


# --- Task 5: Join graduation rate data ---

def test_join_grad_rates_adds_columns():
    inst = load_institutions(RAW_DIR)
    df = join_graduation_rates(inst, RAW_DIR)
    assert "grad_rate_6yr" in df.columns
    valid = df["grad_rate_6yr"].dropna()
    assert valid.min() >= 0
    assert valid.max() <= 100


# --- Task 6: Join enrollment and demographics ---

def test_join_enrollment_adds_demographics():
    inst = load_institutions(RAW_DIR)
    df = join_enrollment_demographics(inst, RAW_DIR)
    required = [
        "enrollment_total", "enrollment_ug", "pct_women", "pct_white",
        "pct_black", "pct_hispanic", "pct_asian", "pct_aian", "pct_nhpi",
        "pct_two_or_more", "pct_unknown", "pct_nonresident",
    ]
    for col in required:
        assert col in df.columns, f"Missing column: {col}"
    assert len(df) == len(inst)


# --- Task 7: Join Pell grant data ---

def test_join_pell_adds_percentage():
    inst = load_institutions(RAW_DIR)
    df = join_pell(inst, RAW_DIR)
    assert "pct_pell" in df.columns
    valid = df["pct_pell"].dropna()
    assert valid.min() >= 0
    assert valid.max() <= 100


# --- Task 8: Add locale and sector labels ---

def test_add_labels_creates_readable_columns():
    inst = load_institutions(RAW_DIR)
    df = add_labels(inst)
    assert "sector_label" in df.columns
    assert "locale_group" in df.columns
    assert df["sector_label"].iloc[0] in ["Public", "Private nonprofit", "Private for-profit"]
    assert df["locale_group"].iloc[0] in ["City", "Suburb", "Town", "Rural", "Unknown"]


# --- Task 9: Build programs dataset ---

def test_build_programs_filters_to_bachelors():
    df = build_programs(RAW_DIR)
    assert "cip_family" in df.columns
    assert "cip_label" in df.columns
    assert "total_awards" in df.columns
    assert len(df) > 0


def test_build_programs_has_cip_families():
    df = build_programs(RAW_DIR)
    assert df["cip_family"].str.len().max() == 2


# --- Task 10: Wire up main() ---

def test_main_produces_output_files():
    with tempfile.TemporaryDirectory() as tmpdir:
        main(raw_dir=RAW_DIR, output_dir=tmpdir)
        inst_path = os.path.join(tmpdir, "institutions.csv")
        prog_path = os.path.join(tmpdir, "programs.csv")
        assert os.path.exists(inst_path), "institutions.csv not created"
        assert os.path.exists(prog_path), "programs.csv not created"
        inst = pd.read_csv(inst_path)
        assert len(inst) > 500
        assert "admission_rate" in inst.columns
        assert "grad_rate_6yr" in inst.columns
        assert "pct_pell" in inst.columns
        assert "sector_label" in inst.columns
