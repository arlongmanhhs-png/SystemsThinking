"""Extract the participant-facing wording of the built workbook into a module the
prototype reads.

The printed wording is the wording the screen uses (design/platform-phase-a.md,
section 2), so the screen does not carry its own copy of any instruction: it
reads this file, and this file is generated from print/src/wb-part-*.html.

    python tools/extract-workbook.py

Run it from the prototype folder after any change to the workbook sources. It
writes src/definitions/workbook.js. Nothing in that file is edited by hand.
"""

import json
import re
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROTO = HERE.parent
SRC = PROTO.parent / "print" / "src"
PARTS = ["wb-part-a.html", "wb-part-b.html", "wb-part-c.html"]
OUT = PROTO / "src" / "definitions" / "workbook.js"

VOID = {"br", "img", "meta", "link", "col", "input", "hr"}


class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []
        self.parent = parent

    @property
    def cls(self):
        return self.attrs.get("class", "").split()

    def has(self, c):
        return c in self.cls

    def find_all(self, pred):
        out = []
        for ch in self.children:
            if isinstance(ch, Node):
                if pred(ch):
                    out.append(ch)
                out.extend(ch.find_all(pred))
        return out

    def first(self, pred):
        r = self.find_all(pred)
        return r[0] if r else None


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", [])
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.parent
        if n is not None and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def norm(s):
    return re.sub(r"\s+", " ", s)


def inline(node):
    """Inline content as a list of strings and marks: {"b": [...]}, {"i": [...]},
    {"ref": "s1ref"} for a generated page number."""
    out = []
    for ch in node.children:
        if isinstance(ch, str):
            out.append(norm(ch))
        elif ch.tag in ("script", "style"):
            continue
        elif ch.tag == "span" and ch.has("pg"):
            out.append({"ref": ch.attrs.get("data-to")})
        elif ch.tag == "b":
            out.append({"b": inline(ch)})
        elif ch.tag == "i":
            out.append({"i": inline(ch)})
        elif ch.tag == "br":
            out.append(" ")
        else:
            out.extend(inline(ch))
    # merge adjacent strings and trim the ends
    merged = []
    for x in out:
        if isinstance(x, str) and merged and isinstance(merged[-1], str):
            merged[-1] = norm(merged[-1] + x)
        else:
            merged.append(x)
    if merged and isinstance(merged[0], str):
        merged[0] = merged[0].lstrip()
    if merged and isinstance(merged[-1], str):
        merged[-1] = merged[-1].rstrip()
    return [x for x in merged if x != ""]


def text(node):
    parts = []
    for x in inline(node):
        parts.append(flat(x))
    return norm("".join(parts)).strip()


def flat(x):
    if isinstance(x, str):
        return x
    if "ref" in x:
        return "{p:" + x["ref"] + "}"
    return "".join(flat(y) for y in (x.get("b") or x.get("i") or []))


def table(node):
    rows = []
    for tr in node.find_all(lambda n: n.tag == "tr"):
        cells = [c for c in tr.children if isinstance(c, Node) and c.tag in ("td", "th")]
        rows.append({"head": all(c.tag == "th" for c in cells), "cells": [inline(c) for c in cells]})
    head = [r["cells"] for r in rows if r["head"]]
    body = [r["cells"] for r in rows if not r["head"]]
    return {"table": {"head": head[0] if head else None, "rows": body}}


def blocks(section):
    """The instruction page as a sequence of blocks, in printed order."""
    out = []

    def walk(n):
        for ch in n.children:
            if not isinstance(ch, Node):
                continue
            c = ch.cls
            if ch.tag in ("script", "style"):
                continue
            if "tab" in c or "overline" in c and ch.parent is section or "rule-top" in c or "spacer" in c:
                continue
            if ch.tag == "h1":
                continue
            if "lead" in c:
                continue
            if "opposite" in c:
                out.append({"opposite": inline(ch)})
            elif ch.tag == "h3":
                out.append({"h": inline(ch)})
            elif ch.tag == "p":
                out.append({"p": inline(ch)})
            elif ch.tag in ("ol", "ul"):
                items = [inline(li) for li in ch.children if isinstance(li, Node) and li.tag == "li"]
                out.append({"list": items, "ordered": ch.tag == "ol"})
            elif ch.tag == "table":
                out.append(table(ch))
            elif "q" in c:
                out.append({"template": inline(ch)})
            elif "callout" in c:
                out.append({"callout": inline(ch)})
            elif ch.tag == "div":
                walk(ch)
            else:
                out.append({"p": inline(ch)})

    walk(section)
    return out


def zones(section):
    """The exercises on a working page: number, label, title, hints, and every piece
    of printed text inside the zone, which the wording check reads."""
    out = []
    for z in section.find_all(lambda n: n.has("zone")):
        num = z.first(lambda n: n.has("num"))
        lab = z.first(lambda n: n.has("exlab"))
        zh = z.first(lambda n: n.tag == "h2" and n.has("zh"))
        hints = [text(h) for h in z.find_all(lambda n: n.has("hint"))]
        texts = sorted({norm(t).strip() for t in strings(z) if norm(t).strip()})
        out.append({
            "number": text(num) if num else None,
            "label": text(lab) if lab else None,
            "title": text(zh) if zh else None,
            "hints": hints,
            "hintsInline": [inline(h) for h in z.find_all(lambda n: n.has("hint"))],
            "texts": texts,
        })
    return out


def strings(n):
    for ch in n.children:
        if isinstance(ch, str):
            yield ch
        elif ch.tag not in ("script", "style"):
            # an element's own text, joined, so that "There is <b>x</b>" reads whole
            if ch.tag in ("p", "span", "div", "td", "th", "li", "label", "h2", "h3") and not any(
                isinstance(g, Node) and g.tag in ("div", "p", "table", "ul", "ol") for g in ch.children
            ):
                yield text(ch)
            yield from strings(ch)


def main():
    html = "".join((SRC / p).read_text(encoding="utf-8") for p in PARTS)
    tb = TreeBuilder()
    tb.feed(html)
    sections = tb.root.find_all(lambda n: n.tag == "section")
    pages = {}
    order = []
    for i, s in enumerate(sections, start=1):
        sid = s.attrs.get("id")
        order.append(sid)
        tab = s.first(lambda n: n.has("tab"))
        over = next((c for c in s.children if isinstance(c, Node) and c.has("overline")), None)
        h1 = s.first(lambda n: n.tag == "h1")
        lead = s.first(lambda n: n.tag == "p" and n.has("lead"))
        kind = "instruction" if s.has("instr") else ("summary" if s.has("sum") else "work")
        page = {
            "id": sid,
            "page": i,
            "kind": kind,
            "tab": text(tab) if tab else None,
            "overline": text(over) if over else None,
            "title": text(h1) if h1 else None,
            "lead": inline(lead) if lead else None,
        }
        if kind == "instruction":
            page["blocks"] = blocks(s)
        else:
            page["zones"] = zones(s)
            page["texts"] = sorted({norm(t).strip() for t in strings(s) if norm(t).strip()})
        if sid == "checks":
            groups = []
            for h in s.find_all(lambda n: n.tag == "h3"):
                ul = h.parent.children[h.parent.children.index(h) + 1:]
                ul = next((x for x in ul if isinstance(x, Node) and x.tag == "ul"), None)
                groups.append({
                    "heading": text(h),
                    "criteria": [text(li) for li in ul.children if isinstance(li, Node) and li.tag == "li"],
                })
            page["checks"] = groups
        if sid == "glossary":
            terms = []
            g = s.first(lambda n: n.has("gloss"))
            cells = [c for c in g.children if isinstance(c, Node)]
            for k in range(0, len(cells) - 2, 3):
                t, d, w = cells[k], cells[k + 1], cells[k + 2]
                ref = w.first(lambda n: n.has("pg"))
                terms.append({"term": text(t), "definition": text(d), "ref": ref.attrs.get("data-to") if ref else None})
            page["terms"] = terms
            page["blocks"] = [b for b in blocks(s) if b.get("p") != []]
        pages[sid] = page

    body = json.dumps({"order": order, "pages": pages}, ensure_ascii=False, indent=1)
    OUT.write_text(
        "// GENERATED by tools/extract-workbook.py from print/src/wb-part-*.html.\n"
        "// Do not edit. The printed wording is the wording the screen uses.\n"
        "export const WORKBOOK = " + body + ";\n",
        encoding="utf-8",
    )
    print("wrote", OUT.relative_to(PROTO), "with", len(order), "pages")


if __name__ == "__main__":
    main()
