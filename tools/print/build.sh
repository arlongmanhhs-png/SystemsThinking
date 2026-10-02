#!/usr/bin/env bash
# Build the Phase A workbook from print/src: A4 PDF, A3 booklet, a measure of every page, and page images.
# usage: tools/print/build.sh <label>      outputs go to tools/print/out/<label>/
#        INSTALL=1 tools/print/build.sh <label>   also copies the PDFs to print/ and the joined HTML to print/src/
# Needs: node with playwright (cd tools && npm install && npx playwright install chromium),
#        python 3 with pypdf and pymupdf (pip install pypdf pymupdf).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
SRC="$REPO/print/src"
FONTS="$REPO/prototype/design-system/assets/fonts"
LABEL="${1:-build}"
if command -v py >/dev/null 2>&1; then PY="py -3"; else PY="${PYTHON:-python3}"; fi
# A short build folder: Chromium on Windows cannot open paths longer than 260 characters.
B="${TMPDIR:-/tmp}/wbb-$LABEL"
O="$HERE/out/$LABEL"
export NODE_PATH="${NODE_PATH:-$REPO/tools/node_modules}"
rm -rf "$B" "$O"; mkdir -p "$B/fonts" "$O/png"
cp "$SRC"/*.html "$SRC"/*.css "$SRC"/render.js "$SRC"/impose.py "$B/"
cp "$FONTS"/*.woff2 "$B/fonts/"
cp "$HERE/measure.js" "$HERE/zones.js" "$B/"
cd "$B"
cat wb-part-a.html wb-part-b.html wb-part-c.html > workbook-phase-a.html
node render.js workbook-phase-a.html a4wb "$B/Workbook_PhaseA.pdf" wb
node measure.js workbook-phase-a.html "$B/measure.json" | tee "$B/measure.txt"
$PY impose.py "$B/Workbook_PhaseA.pdf" "$B/Workbook_PhaseA_booklet-A3.pdf"
cat > "$B/raster.py" <<'PY'
import sys, os, pymupdf
b = sys.argv[1]
for name in ("Workbook_PhaseA.pdf", "Workbook_PhaseA_booklet-A3.pdf"):
    d = pymupdf.open(os.path.join(b, name))
    print(name, "pages:", d.page_count, "size(pt):", [round(x) for x in d[0].rect[2:]])
d = pymupdf.open(os.path.join(b, "Workbook_PhaseA.pdf"))
os.makedirs(os.path.join(b, "png"), exist_ok=True)
for i, p in enumerate(d, 1):
    p.get_pixmap(dpi=110).save(os.path.join(b, "png", f"p{i:02d}.png"))
PY
$PY "$B/raster.py" "$B"
cp -r "$B"/Workbook_PhaseA.pdf "$B"/Workbook_PhaseA_booklet-A3.pdf "$B"/measure.* "$B"/png "$B"/workbook-phase-a.html "$O/"
if [ "${INSTALL:-0}" = "1" ]; then
  cp "$O/Workbook_PhaseA.pdf" "$O/Workbook_PhaseA_booklet-A3.pdf" "$REPO/print/"
  cp "$O/workbook-phase-a.html" "$REPO/print/src/"
  echo "installed into print/"
fi
echo "built $LABEL"
