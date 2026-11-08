#!/usr/bin/env python3
"""Build the UX review HTML report from the findings register.

Usage (from the project root):
    python3 .claude/skills/ux-review/scripts/build_report.py

Reads  docs/ux-review/findings.json and .ux-review/shots/*.png
Writes .ux-review/report.html (screenshots embedded, so the page stands alone)
"""
import base64
import json
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
ROOT = Path.cwd()
REGISTER = ROOT / "docs" / "ux-review" / "findings.json"
SHOTS = ROOT / ".ux-review" / "shots"
TEMPLATE = SKILL_DIR / "assets" / "report-template.html"
OUT = ROOT / ".ux-review" / "report.html"

TYPES = {"Missing screen", "Design mismatch", "Rule broken", "Usability"}
SEVERITIES = {"Blocker", "High", "Low"}
STATUSES = {"open", "resolved", "wont-fix"}
SCREEN_STATUSES = {"built", "partial", "missing", "later"}


def check(data):
    errors = []
    keys = [s.get("key") for s in data.get("screens", [])]
    if len(keys) != len(set(keys)):
        errors.append("duplicate screen keys")
    for s in data.get("screens", []):
        if s.get("status") not in SCREEN_STATUSES:
            errors.append(f"screen {s.get('key')}: status must be one of {sorted(SCREEN_STATUSES)}")
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
        for k in f.get("screens", []):
            if k not in keys:
                errors.append(f"#{fid}: unknown screen key {k}")
    return errors


def shots(data):
    """Embed every captured screenshot of a screen in the register, keyed by file name."""
    out = {}
    for s in data.get("screens", []):
        for w in (375, 1280):
            p = SHOTS / f"{s['key']}-{w}.png"
            if p.exists():
                out[p.name] = "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()
    return out


def main():
    if not REGISTER.exists():
        sys.exit(f"Register not found: {REGISTER}")
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    errors = check(data)
    if errors:
        sys.exit("Register problems:\n- " + "\n- ".join(errors))
    data["_shots"] = shots(data)
    html = TEMPLATE.read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace("/*__DATA__*/null", payload)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Report written: {OUT} ({len(data['_shots'])} screenshots, {OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
