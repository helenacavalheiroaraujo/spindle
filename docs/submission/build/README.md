# Submission PDF

`build.py` turns `docs/submission/spindle-submission.md` into `docs/submission/spindle-submission.pdf` (A4, cream page,
navy text, contents with page numbers, numbered figures, relationship diagram).

```bash
python3 docs/submission/build/build.py
```

- Needs `python3`, `node` with Playwright (already installed by `npm install`), `swift` on macOS (for the page numbers in
  the contents; without it the contents has none) and an internet connection (Google Fonts and the mermaid library load
  while printing).
- The look is in `print.css`. The markdown is the single source: change the text there, then run the build again.
- The PDF is not committed.
