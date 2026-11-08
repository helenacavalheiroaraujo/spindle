# docs/PROGRESS.md template

Fill every `[…]`. Keep the headings and the order. Plain language, no jargon.

```markdown
<!-- page: [progress page URL] -->
# MVP progress

Updated [YYYY-MM-DD] after [story N / "on request"] · Deadline 15 Nov 2026 · **[N] days left**

## Summary
- **Stories:** [N] of [N] MVP stories built ([N] with gaps), [N] in progress, [N] not started
- **Tests:** unit [passed]/[total] · end-to-end [passed]/[total] ([N] skipped) — [all pass / N failing]
- **Demo:** [happy path runs end to end / breaks at: …]
- **Next:** [story N · what must happen before it starts]
- **Risk:** [days left vs stories left; what would be cut first]

## Against the brief
| Criterion | Status | Evidence / what is missing |
|---|---|---|
| 1 · Core features work end to end | [Done / Partly / Missing / Not checked] | […] |
| … (all 7 criteria, then S1 link and S2 PDF) | … | … |

### Missing for the brief, by impact on the grade
1. […]

## Build phases
| Phase | Stories | Status |
|---|---|---|
| 1 · Core | 1, 2, 3, 5, 6 | [Done / Done with gaps / In progress / Not started] |
| … | … | … |

## Stories
| Story | Status | Requirements with automated test | Open findings |
|---|---|---|---|
| 1 · Search for an album | Built | 5 of 5 | #36 |
| … | … | … | … |

## Outside the MVP
Not counted in the figures above.

### Specified, not in the build order
| Story | Spec file | Status | Note |
|---|---|---|---|
| [N] · [title] | `specs/story-N-….md` | [Not started / …] | [open points, missing design; needs a place in the build order] |

### Not in this MVP
| Story | Spec file | What the repo says |
|---|---|---|
| [N] · [title or "No title in the repo"] | [path or "None"] | [where it is mentioned, e.g. "Filters (story 1 out of scope)"] |

## Gaps (not tested automatically)
- Story [N]: [requirement]

## Before the next story can start
- [open findings to decide, missing designs, pending rows from earlier stories]
```
