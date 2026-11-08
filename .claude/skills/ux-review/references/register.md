# Findings register — `docs/ux-review/findings.json`

One JSON file holds the screen inventory and the whole review history. The report and the capture script both read it, so anything not in the register does not exist.

```json
{
  "meta": {
    "project": "Spindle MVP",
    "report_url": null,
    "iteration": 1,
    "updated": "2026-11-08T12:00:00+00:00"
  },
  "iterations": [
    { "n": 1, "date": "2026-11-08", "note": "First UX review" }
  ],
  "screens": [
    {
      "key": "recommendation",
      "name": "Recommendation",
      "story": "3",
      "phase": 1,
      "design": "Spindle_mockups_by_section.pdf · p. 5",
      "route": "/albums/10000000-0000-0000-0000-000000000001/recommendation?priorities=price,sound",
      "auth": false,
      "status": "built",
      "note": ""
    },
    {
      "key": "checkout",
      "name": "Checkout (Buy with protection)",
      "story": "7",
      "phase": 2,
      "design": "Spindle_mockups_by_section.pdf · p. 9",
      "route": null,
      "auth": true,
      "status": "missing",
      "note": ""
    }
  ],
  "findings": [
    {
      "id": 1,
      "screens": ["recommendation"],
      "stories": ["3"],
      "type": "Rule broken",
      "severity": "High",
      "title": "Illustrative data is not labelled on the recommendation",
      "evidence": [
        { "source": "screenshot", "where": ".ux-review/shots/recommendation-375.png", "quote": "" },
        { "source": "CLAUDE.md", "where": "Visual direction", "quote": "illustrative data is always labelled" }
      ],
      "proposal": "Add the line \"Illustrative data\" under the version details, as on the listing check screen.",
      "question": null,
      "status": "open",
      "first_seen": 1,
      "resolution": null
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

### screens
- `key` — unique, lowercase-with-hyphens; used for screenshot file names (`.ux-review/shots/<key>-375.png`)
- `story` — story number as a string; `phase` — 1–4 from `SPEC.md` build order (4 = if time allows)
- `design` — where the screen is in `docs/design`, or `null` if the design has none
- `route` — path with seed IDs, or `null` when not built. Only screens with a route are captured
- `auth` — `true` if the screen needs a signed-in user
- `search` — optional text typed into the search box before the picture (for search results and suggestions)
- `status` — `built` | `partial` | `missing` | `later`

### findings
- `id` — integer, unique, never reused or renumbered. Next id = highest id ever used + 1
- `screens` — screen keys; `stories` — story numbers as strings (`["all"]` for app-wide)
- `type` — `Missing screen` | `Design mismatch` | `Rule broken` | `Usability`
- `severity` — `Blocker` | `High` | `Low` (`Usability` is `Low` unless it blocks a demo-flow task)
- `evidence` — at least one item. For a screenshot: `source: "screenshot"`, `where` = the image path, `quote` may be empty. For a design: `source` = file, `where` = page/screen. For a rule: verbatim `quote`
- `proposal` — plain-words change, or `null` when `question` is set
- `status` — `open` | `resolved` | `wont-fix`
- `resolution` — `null` while open; otherwise `{ "iteration": 2, "date": "…", "decision": "…" }`
