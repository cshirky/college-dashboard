"""
Build src/data/all_schools.csv: every institution in data/output/institutions.csv with a
yield rate and a 6-year graduation rate both between 2% and 98% (dropping outliers at
either end). Unlike good_schools.csv there is no curation beyond that.

Run from the repo root: python3 data/pipeline/build_all_schools.py
"""
import csv

INSTITUTIONS = "data/output/institutions.csv"
OUT = "src/data/all_schools.csv"
LO, HI = 2, 98


def in_range(x):
    try:
        v = float(x)
    except (TypeError, ValueError):
        return False
    return LO <= v <= HI  # also excludes NaN


with open(INSTITUTIONS, newline="") as f:
    reader = csv.DictReader(f)
    fields = reader.fieldnames
    rows = [r for r in reader if in_range(r["yield_rate"]) and in_range(r["grad_rate_6yr"])]

with open(OUT, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)

print(f"{len(rows)} schools -> {OUT}")
