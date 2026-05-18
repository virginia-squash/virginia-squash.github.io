#!/bin/bash
# Optimize Squash Rocks photos into web-friendly JPEGs for the Squash Rocks page.
# Usage: bash scripts/optimize-squash-rocks.sh
# Add/remove photos in assets-original/squash-rocks/ and re-run to regenerate.

SRC="assets-original/squash-rocks"
DEST="assets/squash-rocks"
LONG_EDGE=1600
QUALITY=80

# Clean and recreate output directory
rm -rf "$DEST"
mkdir -p "$DEST"

i=1
for f in $(ls "$SRC" | sort); do
  full="$SRC/$f"
  # Skip non-image files
  case "${f##*.}" in
    jpg|jpeg|JPG|JPEG|png|PNG|heic|HEIC) ;;
    *) continue ;;
  esac

  idx=$(printf "%02d" $i)
  out="$DEST/${idx}.jpg"

  # Get dimensions to decide which edge to resample on
  w=$(sips --getProperty pixelWidth "$full" 2>/dev/null | tail -1 | awk '{print $2}')
  h=$(sips --getProperty pixelHeight "$full" 2>/dev/null | tail -1 | awk '{print $2}')

  if [ -z "$w" ] || [ -z "$h" ]; then
    echo "SKIP (unreadable): $f"
    continue
  fi

  # Resample so the long edge equals LONG_EDGE, preserve aspect ratio
  if [ "$w" -ge "$h" ]; then
    if [ "$w" -gt "$LONG_EDGE" ]; then
      sips --resampleWidth $LONG_EDGE -s formatOptions $QUALITY -s format jpeg "$full" --out "$out" 2>/dev/null > /dev/null
    else
      sips -s formatOptions $QUALITY -s format jpeg "$full" --out "$out" 2>/dev/null > /dev/null
    fi
  else
    if [ "$h" -gt "$LONG_EDGE" ]; then
      sips --resampleHeight $LONG_EDGE -s formatOptions $QUALITY -s format jpeg "$full" --out "$out" 2>/dev/null > /dev/null
    else
      sips -s formatOptions $QUALITY -s format jpeg "$full" --out "$out" 2>/dev/null > /dev/null
    fi
  fi

  new_w=$(sips --getProperty pixelWidth "$out" 2>/dev/null | tail -1 | awk '{print $2}')
  new_h=$(sips --getProperty pixelHeight "$out" 2>/dev/null | tail -1 | awk '{print $2}')
  size=$(du -h "$out" | awk '{print $1}')
  echo "OK: $f -> ${idx}.jpg  (${new_w}x${new_h}, $size)"
  i=$((i + 1))
done

count=$((i - 1))
echo "$count" > "$DEST/count.txt"
echo "--- Done: $count images in $DEST/ ---"
