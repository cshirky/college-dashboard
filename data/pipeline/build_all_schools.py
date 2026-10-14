"""
Build src/data/all_schools.csv: every institution in data/output/institutions.csv that
awarded at least one Bachelor's degree (IPEDS Completions 2023) and has both a yield rate
and a 6-year graduation rate. Unlike good_schools.csv there is no curation beyond that.

Run from the repo root: python3 data/pipeline/build_all_schools.py
"""
import csv
import gzip
from collections import Counter

INSTITUTIONS = "data/output/institutions.csv"
COMPLETIONS = "data/raw/C2023_a.csv.gz"
OUT = "src/data/all_schools.csv"


def has_value(x):
    try:
        v = float(x)
    except (TypeError, ValueError):
        return False
    return v == v  # excludes NaN


# Bachelor's degrees awarded per institution: AWLEVEL 5, first majors, CIPCODE 99 = all programs.
bachelors = Counter()
with gzip.open(COMPLETIONS, "rt", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        row = {k.strip(): v.strip() for k, v in row.items()}
        if row["AWLEVEL"] == "5" and row["MAJORNUM"] == "1" and row["CIPCODE"] in ("99", "99.0000"):
            bachelors[row["UNITID"]] += int(row["CTOTALT"] or 0)

with open(INSTITUTIONS, newline="") as f:
    reader = csv.DictReader(f)
    fields = reader.fieldnames
    rows = [
        r for r in reader
        if bachelors[r["UNITID"]] > 0 and has_value(r["yield_rate"]) and has_value(r["grad_rate_6yr"])
    ]

with open(OUT, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)

print(f"{len(rows)} schools -> {OUT}")
