"""Work order, verify item 4: the words and dashes no file may contain, outside CLAUDE.md,
core/decisions.md, and the two design documents (the work order and the reconciliation)."""
import os, re, sys
ROOT = sys.argv[1]
os.chdir(ROOT)
skip_files = {'CLAUDE.md', 'core/decisions.md', 'design/WORK-ORDER-2026-10-01.md', 'design/reconciliation.md', 'tools/tests/words.py'}
pats = [
    ('em or en dash', re.compile('[–—]')),
    ('gate or gated', re.compile(r'\bgated?\b', re.I)),
    ('bear or bearing', re.compile(r'\bbear(s|ing)?\b', re.I)),
    ('cashed', re.compile(r'\bcashed\b', re.I)),
    ('problem statement', re.compile(r'problem statement', re.I)),
    ('Step 1 statement', re.compile(r'step 1 statement', re.I)),
    ('lower-case step and a digit', re.compile(r'(?<![A-Za-z/._-])step \d')),
]
hits = {}
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ('vendor', 'node_modules', '.git', '_superseded', 'design-system', 'out', '_retired')]
    for f in files:
        if not f.endswith(('.md', '.html', '.js', '.mjs', '.css', '.yaml', '.py')):
            continue
        p = os.path.join(root, f)[2:].replace(os.sep, '/')
        if p in skip_files:
            continue
        try:
            lines = open(p, encoding='utf-8').read().split('\n')
        except Exception:
            continue
        for i, l in enumerate(lines, 1):
            for name, rx in pats:
                if rx.search(l):
                    hits.setdefault(name, []).append(f'{p}:{i}: {l.strip()[:160]}')
for k, v in hits.items():
    print('==', k, len(v))
    for x in v[:60]:
        print('  ', x)
if not hits:
    print('no hits')
