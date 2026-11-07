# Findings register — `docs/spec-review/findings.json`

One JSON file holds the whole review history. The report is built from it, so anything not in the register does not exist.

```json
{
  "meta": {
    "project": "Spindle MVP",
    "spec": "SPEC.md",
    "report_url": null,
    "iteration": 1,
    "updated": "2026-11-07T18:00:00+00:00"
  },
  "iterations": [
    { "n": 1, "date": "2026-11-07", "note": "First review of all stories" }
  ],
  "findings": [
    {
      "id": 1,
      "stories": ["3"],
      "type": "Inconsistency",
      "severity": "High",
      "title": "Condition is scored per version, but condition belongs to each copy",
      "evidence": [
        { "source": "SPEC.md", "where": "Story 3 · How the pick is made", "quote": "Each version has a score from 1 to 5 for each criterion: sound, price, original, condition" },
        { "source": "SPEC.md", "where": "Story 5 · Data used", "quote": "Listing: … condition …" }
      ],
      "proposal": {
        "file": "SPEC.md",
        "section": "Story 3 · How the pick is made",
        "current": "…",
        "proposed": "…"
      },
      "question": null,
      "status": "open",
      "first_seen": 1,
      "resolution": null
    }
  ],
  "coverage": [
    {
      "story": "1",
      "title": "Search for an album",
      "tested": false,
      "template": { "story": true, "scope": true, "precondition": false, "criteria": true },
      "checks": { "criteria": "done", "states": "done", "data": "done", "design": "done" }
    }
  ],
  "questions": [
    { "id": "Q1", "finding": 5, "question": "…", "status": "open", "answer": null }
  ],
  "todo": [
    { "id": "T1", "text": "…", "finding": 5, "done": false }
  ]
}
```

## Field rules

- `id` — integer, unique, never reused or renumbered. Next id = highest id ever used + 1.
- `stories` — story numbers as strings; `["all"]` for a finding about every story.
- `type` — `Gap` | `Inconsistency` | `Ambiguity`
- `severity` — `Blocker` | `High` | `Low`
- `evidence` — at least one item; `source` is a file name or a design screen (e.g. `HappyPath.png · screen 4`); `quote` is verbatim.
- `proposal` — current vs. proposed text; `current` is `""` when adding new text. `null` when the finding needs a decision first (then `question` is set).
- `status` — `open` | `resolved` | `wont-fix` | `new-story`
- `resolution` — `null` while open; otherwise `{ "iteration": 2, "date": "…", "decision": "…" }`
- `coverage.checks.*` — `done` | `n/a` | `todo`
- `questions.status` — `open` | `answered`
- `todo.done` — `true` / `false`
