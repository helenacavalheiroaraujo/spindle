#!/usr/bin/env python3
"""Build the spec-review HTML report from the findings register.

Usage (from the project root):
    python3 .claude/skills/spec-review/scripts/build_report.py

Reads  docs/spec-review/findings.json
Writes .spec-review/report.html
"""
import json
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
ROOT = Path.cwd()
REGISTER = ROOT / "docs" / "spec-review" / "findings.json"
TEMPLATE = SKILL_DIR / "assets" / "report-template.html"
OUT = ROOT / ".spec-review" / "report.html"

TYPES = {"Gap", "Inconsistency", "Ambiguity"}
SEVERITIES = {"Blocker", "High", "Low"}
STATUSES = {"open", "resolved", "wont-fix", "new-story"}


def check(data):
    errors = []
    ids = [f.get("id") for f in data.get("findings", [])]
    if len(ids) != len(set(ids)):
        errors.append("duplicate finding ids")
    for f in data.get("findings", []):
        fid = f.get("id")
        if f.get("type") not in TYPES:
            errors.append(f"#{fid}: type must be one of {sorted(TYPES)}")
        if f.get("severity") not in SEVERITIES:
            errors.append(f"#{fid}: severity must be one of {sorted(SEVERITIES)}")
        if f.get("status") not in STATUSES:
            errors.append(f"#{fid}: status must be one of {sorted(STATUSES)}")
        if not f.get("evidence"):
            errors.append(f"#{fid}: needs at least one piece of evidence")
        if f.get("status") != "open" and not f.get("resolution"):
            errors.append(f"#{fid}: closed findings need a resolution")
    return errors


def main():
    if not REGISTER.exists():
        sys.exit(f"Register not found: {REGISTER}")
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    errors = check(data)
    if errors:
        sys.exit("Register problems:\n- " + "\n- ".join(errors))
    html = TEMPLATE.read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace("/*__DATA__*/null", payload)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Report written: {OUT}")


if __name__ == "__main__":
    main()
