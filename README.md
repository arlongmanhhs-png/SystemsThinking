# Systems process

A step-by-step process for analysing a system and deciding how to change it:
thirteen steps in five phases, each with a critical check that has to be met
before the next step opens.

It is built to be used two ways at once: on paper, in a room, and on a platform
where a participant works a case step by step. The two are designed together and
use the same wording. It is a general tool. One course (ADVO4 at The Hague
University of Applied Sciences) is its first setting, and everything true only of
that course is confined to `courses/advo4/`.

## What is where

| Path | Holds |
| --- | --- |
| `core/` | The rules that apply to every step |
| `steps/NN-name/` | One folder per step: `description.md`, `paper.md`, `spec.md` |
| `purposes/` | Retired: why there is no purpose field |
| `courses/advo4/` | Everything true only of that course |
| `design/` | The design basis, the printed artwork, and the screen form |
| `sources/` | Every citation, with its verification status |
| `CLAUDE.md` | Instructions for a code build working in this folder |

## The order the work is done in

Decided 28 September 2026, replacing the earlier rule of description, then paper
format, then online version, one step at a time.

1. **The workbook, phase by phase, to the end.** Each step gets its description
   and then its workbook pages, and the book grows. Nothing else is built until
   the workbook is complete, so that the whole process can be read and taught on
   paper before anything is committed to a screen or to a set of classroom sheets.
2. **The large versions, once the workbook is complete.** Which worksheets are
   worth printing large is decided phase by phase, by running through the finished
   workbook, rather than assumed step by step while it is being written.
3. **The digital version, last.** See `design/workbook.md` for why the platform
   has to be able to export the workbook's own shape. Phase A is the exception,
   decided 2 October 2026: it goes online now, as a claude.ai artifact.

## Status, 2 October 2026

- **Phase A is complete.** Steps 1, 2, and 3 have their descriptions and their
  pages in the workbook, and the phase has its critical checks page and its
  summary page.
- Steps 4 to 13 hold what they are for, their critical check criteria, outputs,
  dependencies, and sources only. Their descriptions and workbook pages are not
  written yet.
- The Phase A workbook is printable: `print/Workbook_PhaseA.pdf`, 28 pages, A4
  double sided. `print/Workbook_PhaseA_booklet-A3.pdf` is the same book imposed
  for saddle stitching: seven A3 sheets, printed duplex and folded.
- The situation sketch stays outside the book and is printed large:
  `print/Step2_A1_sketch-sheet.pdf` for a group, or the A2 version alone.
- The two Word review copies are in `review/`. They are generated from this
  folder, so they are only as current as the last build.
- The design basis is settled. See `design/basis.md` and `design/workbook.md`.
  The display face is Outfit, in print and on screen, since 2 October.
- Steps 1, 2, and 3 each have a functional specification, Step 1's rewritten in
  the workbook's order, and every field key in the three is settled rather than
  proposed (1 October).
- **Step 3 is fully settled.** The four questions that stood open on it are
  answered, and it is the first step in the process with nothing open.
- **Phase A goes online now, as a claude.ai artifact** (2 October), built from the
  prototype in `prototype/` and the step specifications, under the working title
  "Systems Thinking Process". `design/platform-phase-a.md` is its specification,
  and what the prototype reported back is in `prototype/FINDINGS.md`. Students
  log in; hosting on a website of its own comes once the platform is complete.
  Ashley works the first real case through the artifact, and the specification
  for the online version is written after that reading.
- The project goes into a private hosted repository later. For now the folder
  stays as it is, without version control.
- `sources/sources.md` is a pointer, not yet the full list.

## Where the reasoning lives

The working document "Systems Thinking Process", in the Claude project
"Advocacy: Influencing Multi-Level Governance", holds the reasoning, the
alternatives considered, the literature, and the open questions. This folder holds
only what is settled, in the shortest form that is still unambiguous. Where the
two disagree, the document is right and this folder is out of date.

## Conventions

British English. No em or en dashes. Step numbers and field keys are permanent.
Nothing in this process is scored automatically.
