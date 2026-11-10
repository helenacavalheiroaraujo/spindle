#!/usr/bin/env python3
"""Count MVP progress from SPEC.md (build order + Traceability) and the open findings.

Prints JSON. Read-only: changes no file. Test results are added by the skill, not here.
Usage: python3 .claude/skills/mvp-progress/scripts/progress.py [repo_root]
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

DEADLINE = date(2026, 11, 15)
NOT_TESTED = "not tested automatically"

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
spec = (root / "SPEC.md").read_text(encoding="utf-8")

# Build order: "1. **Core:** stories 1, 2, 3, 5, 6"
phases = []
order = spec.split("## Build order", 1)[1].split("\n## ", 1)[0]
for line in order.splitlines():
    m = re.match(r"\s*\d+\.\s+\*\*(.+?):\*\*\s*(.+)", line)
    if m:
        # Drop "(…)" notes and "step N" so only story numbers are left
        bare = re.sub(r"\([^)]*\)|step\s+\d+", "", m.group(2))
        phases.append({"name": m.group(1), "text": m.group(2).strip(),
                       "stories": re.findall(r"\d+", bare)})

# "Not in this MVP: stories 10, 11, 13"
m_out = re.search(r"Not in this MVP:\s*stories?\s*([\d,\s]+)", spec)
outside = re.findall(r"\d+", m_out.group(1)) if m_out else []
in_phases = {s for p in phases for s in p["stories"]}

# Story titles from the Stories table: "Story 1 · Search for an album"
titles = dict(re.findall(r"\|\s*Story (\d+) · ([^|]+?)\s*\|", spec))

# Traceability rows
rows = {}
trace = spec.split("## Traceability", 1)[1]
for line in trace.splitlines():
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if len(cells) != 4 or not cells[0].isdigit():
        continue
    story, req, impl, test = cells
    rows.setdefault(story, []).append({"requirement": req, "implemented": impl, "test": test})


def status(story_rows):
    real = [r for r in story_rows if r["requirement"]]
    if not real:
        return "Not started", 0, 0, []
    pending = [r["requirement"] for r in real
               if not r["test"] or r["test"].lower().startswith("written with")]
    untested = [r["requirement"] for r in real if NOT_TESTED in r["test"].lower()]
    tested = len(real) - len(pending) - len(untested)
    if pending:
        return "In progress", tested, len(real), untested
    return ("Built with gaps" if untested else "Built"), tested, len(real), untested


# Open findings per story
open_findings = {}
fpath = root / "docs/spec-review/findings.json"
if fpath.exists():
    for f in json.loads(fpath.read_text(encoding="utf-8"))["findings"]:
        if f.get("status") == "open":
            for s in f["stories"]:
                open_findings.setdefault(s, []).append(
                    {"id": f["id"], "severity": f["severity"], "title": f["title"]})

# Where each outside story is mentioned in specs/ ("- Filters (story 10)"): the only clue to what it is
mentions = {}
for f in sorted((root / "specs" / "stories").glob("story-*.md")):
    for line in f.read_text(encoding="utf-8").splitlines():
        if line.lstrip().startswith("- "):
            for n in re.findall(r"story (\d+)", line, flags=re.I):
                if n in outside or n not in in_phases:
                    mentions.setdefault(n, []).append(f"{f.name}: {line.strip()[2:]}")

stories = {}
for s in sorted(set(titles) | set(rows) | set(outside), key=lambda x: int(x)):
    scope = ("mvp" if s in in_phases else
             "outside_mvp" if s in outside else "specified_not_scheduled")
    st, tested, total, untested = status(rows.get(s, []))
    stories[s] = {"title": titles.get(s, ""), "scope": scope,
                  "has_spec_file": any((root / "specs" / "stories").glob(f"story-{s}-*.md")),
                  "mentioned_in": mentions.get(s, []), "status": st, "tested_rows": tested,
                  "total_rows": total, "not_tested_automatically": untested,
                  "pending_rows": [r["requirement"] for r in rows.get(s, [])
                                   if r["requirement"] and (not r["test"] or r["test"].lower().startswith("written with"))],
                  "open_findings": open_findings.get(s, [])}

print(json.dumps({"today": date.today().isoformat(), "deadline": DEADLINE.isoformat(),
                  "days_left": (DEADLINE - date.today()).days, "phases": phases,
                  "stories": stories}, indent=2, ensure_ascii=False))
