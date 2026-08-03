#!/usr/bin/env bash
# Downscale + convert PNG/JPG images to .webp for web use.
# Usage: scripts/optimize-images.sh [dir] [max-width] [quality]
set -euo pipefail

TARGET_DIR="${1:-static/img/showcase}"
MAX_WIDTH="${2:-1280}"
QUALITY="${3:-82}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but was not found on PATH" >&2
  exit 1
fi

shopt -s nullglob nocaseglob globstar

for src in "$TARGET_DIR"/**/*.png "$TARGET_DIR"/**/*.jpg "$TARGET_DIR"/**/*.jpeg; do
  [ -f "$src" ] || continue

  dir=$(dirname "$src")
  base=$(basename "$src")
  name="${base%.*}"
  dest="$dir/$name.webp"

  if [ -f "$dest" ]; then
    echo "skip (already optimized): $src"
    continue
  fi

  echo "optimizing: $src -> $dest"
  ffmpeg -y -loglevel error -i "$src" \
    -vf "scale='min(${MAX_WIDTH},iw)':'-2'" \
    -quality "$QUALITY" \
    "$dest"
  rm "$src"
done

echo "done."
