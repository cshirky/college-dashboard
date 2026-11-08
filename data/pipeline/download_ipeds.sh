#!/bin/bash
set -euo pipefail

RAW_DIR="$(dirname "$0")/../raw"
mkdir -p "$RAW_DIR"

BASE_URL="https://nces.ed.gov/ipeds/datacenter/data"

FILES=(
  "HD2023"
  "drvadm2023"
  "drvgr2023"
  "C2023_A"
  "drvef2023"
  "SFA2223"
  "IC2023_AY"
  "ADM2023"
)

for f in "${FILES[@]}"; do
  if [ -f "$RAW_DIR/$f.zip" ]; then
    echo "Already downloaded $f.zip, skipping..."
  else
    echo "Downloading $f..."
    curl -sL -o "$RAW_DIR/$f.zip" "$BASE_URL/$f.zip"
  fi
  unzip -o "$RAW_DIR/$f.zip" -d "$RAW_DIR"
done

echo "Done. Files in $RAW_DIR:"
ls "$RAW_DIR"/*.csv
