#!/usr/bin/env python3
"""Impose an A4 workbook PDF as an A3 saddle-stitched booklet.

Two A4 portrait pages side by side on each A3 landscape sheet, in the order that
makes a folded and stapled booklet. A4 is exactly half of A3, so nothing is
scaled and nothing is cropped.

    python3 impose.py out/Workbook_PhaseA.pdf out/Workbook_PhaseA_booklet-A3.pdf

Print the result on A3, double sided, FLIP ON THE SHORT EDGE, at 100% (actual
size, no "fit to page"). Then fold the stack in half and staple on the fold.
"""
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

A4_W, A4_H = 595.276, 841.890          # points
A3L_W, A3L_H = A4_W * 2, A4_H          # A3 landscape


def main(src, dst):
    reader = PdfReader(src)
    n = len(reader.pages)
    padded = n + (-n % 4)              # up to the next multiple of four
    writer = PdfWriter()

    def source_page(i):                # 1-indexed; None for a padded blank
        return reader.pages[i - 1] if i <= n else None

    sheets = padded // 2               # two sides per sheet of paper
    for i in range(1, sheets // 2 + 1):
        # front of sheet i, then back of sheet i
        for left, right in ((padded - 2 * i + 2, 2 * i - 1),
                            (2 * i, padded - 2 * i + 1)):
            sheet = writer.add_blank_page(width=A3L_W, height=A3L_H)
            for page_no, x in ((left, 0), (right, A4_W)):
                p = source_page(page_no)
                if p is None:
                    continue
                p.mediabox = RectangleObject((0, 0, A4_W, A4_H))
                sheet.merge_translated_page(p, x, 0)

    with open(dst, "wb") as fh:
        writer.write(fh)
    print(f"{src}: {n} pages, padded to {padded}, "
          f"imposed onto {sheets} A3 sides ({sheets // 2} sheets) -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
