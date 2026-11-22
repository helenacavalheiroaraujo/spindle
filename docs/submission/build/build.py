#!/usr/bin/env python3
"""Builds docs/submission/spindle-submission.pdf from docs/submission/spindle-submission.md.

Run from anywhere:  python3 docs/submission/build/build.py
Needs: python3, node with Playwright (npm install has it), swift (macOS, for the page numbers in the contents) and an
internet connection (Google Fonts and the mermaid library are loaded while printing). Nothing is installed or changed.
The PDF is written next to the markdown. It is not committed.
"""
import html, json, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
MD = REPO / "docs/submission/spindle-submission.md"
PDF = REPO / "docs/submission/spindle-submission.pdf"
SHOTS = (REPO / "docs/screenshots").as_uri() + "/"


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", re.sub(r"[`*]", "", text).lower()).strip("-")


def inline(text):
    codes = []
    text = re.sub(r"`([^`]+)`", lambda m: (codes.append(m.group(1)), f"\0{len(codes) - 1}\0")[1], text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"(https://[^\s<)]+)", r'<a href="\1">\1</a>', text)
    return re.sub(r"\0(\d+)\0", lambda m: "<code>" + html.escape(codes[int(m.group(1))], quote=False) + "</code>", text)


def render(pages):
    """Markdown -> one HTML page. `pages` maps a heading to its page number (empty on the first pass)."""
    lines = MD.read_text().replace("../screenshots/", SHOTS).split("\n")
    out, toc, i, first_h1, fig = [], [], 0, True, 0
    # The cover is everything above <!-- cover-end -->: title, course and date, author, app link and one paragraph.
    end = lines.index("<!-- cover-end -->")
    cover_lines = [l for l in lines[:end] if l.strip()]
    lines = lines[end + 1:]
    title = re.sub(r"^# ", "", cover_lines[0])
    kicker = cover_lines[1].split(" · ")                      # Assignment 2 · ASI, MESG/FEUP · 23 Nov 2026
    author, number = cover_lines[2].split(" · Student number: ")
    app = re.sub(r"^\*\*App:\*\* ", "", cover_lines[3])
    lead = cover_lines[4]
    meta = [("Author", author), ("Student number", number), ("Course", kicker[1]), ("Date", kicker[2]), ("Application", app)]
    vinyl = (HERE / "cover-vinyl.svg").read_text()
    cover = (
        f'<section class="cover"><div class="disc">{vinyl}</div><div class="top"><div class="kicker">{html.escape(kicker[0])}</div>'
        f'<h1 class="title">{html.escape(title)}</h1><p class="lead">{inline(lead)}</p></div><dl class="meta">'
        + "".join(f"<div><dt>{html.escape(k)}</dt><dd>{inline(v)}</dd></div>" for k, v in meta) + "</dl></section>"
    )
    out.append(cover)
    first_h1 = False

    def number_figures(row):
        nonlocal fig

        def one(m):
            nonlocal fig
            fig += 1
            return f'<b class="cap"><span class="fig">Figure {fig}</span> {m.group(1)}</b>'

        return re.sub(r"<b>(.*?)</b>", one, row)

    while i < len(lines):
        line = lines[i]
        if line.strip() == "<!-- toc -->":
            out.append("@@TOC@@"); i += 1; continue
        if line.startswith("```"):
            j, buf = i + 1, []
            while not lines[j].startswith("```"):
                buf.append(lines[j]); j += 1
            if line.startswith("```mermaid"):
                out.append('<div class="diagram"><pre class="mermaid">' + "\n".join(buf) + "</pre></div>")
            else:
                out.append("<pre><code>" + html.escape("\n".join(buf), quote=False) + "</code></pre>")
            i = j + 1; continue
        m = re.match(r"(#{1,4}) (.*)", line)
        if m:
            n, txt = len(m.group(1)), m.group(2)
            plain = re.sub(r"[`*]", "", txt)
            cls = ""
            if n == 1:
                cls = ' class="pb"'
            elif plain.startswith("At a glance"):
                cls = ' class="pb"'
            if n <= 2 and not plain.startswith(("At a glance", "How to read")):
                toc.append((n, plain, slug(plain)))
            out.append(f'<h{n}{cls} id="{slug(plain)}">{inline(txt)}</h{n}>'); i += 1; continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(lines[i]); i += 1
            cells = lambda r: [c.strip() for c in r.strip().strip("|").split("|")]
            head, body = cells(rows[0]), [cells(r) for r in rows[2:]]
            out.append(
                '<table class="data"><thead><tr>' + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead><tbody>"
                + "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body) + "</tbody></table>"
            )
            continue
        if line.startswith("<table"):
            cap = ""
            if out and out[-1].startswith("<p><strong>") and out[-1].endswith("</strong></p>"):
                cap = out.pop()[3:-4].replace("<strong>", "<b>").replace("</strong>", "</b>")
            out.append('<div class="shots">' + number_figures(cap + line) + "</div>"); i += 1; continue
        if line.strip() == "---" or line.strip() == "":
            i += 1; continue
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(lines[i][2:]); i += 1
            out.append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in items) + "</ul>"); continue
        buf = [line]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"(#|\||<table|- |```|<!--)", lines[i]):
            buf.append(lines[i]); i += 1
        para = f'<p>{inline(" ".join(buf))}</p>'
        if " ".join(buf).startswith("*Note:") and out and out[-1].startswith('<div class="shots">'):
            out[-1] = out[-1][: -len("</div>")] + para + "</div>"   # a note about a figure stays with the figure
        else:
            out.append(para)

    contents = '<section class="toc"><h1 class="pb tochead">Contents</h1><ol>' + "".join(
        f'<li class="l{n}"><a href="#{sl}"><span class="t">{html.escape(t)}</span><span class="d"></span>'
        f'<span class="p">{pages.get(t, "")}</span></a></li>' for n, t, sl in toc) + "</ol></section>"
    body = "\n".join(out).replace("@@TOC@@", contents)
    mermaid = ('mermaid.initialize({startOnLoad:true,theme:"base",er:{useMaxWidth:true},themeVariables:{primaryColor:"#f1e6d0",'
               'primaryBorderColor:"#1d2433",primaryTextColor:"#1d2433",lineColor:"#1d2433",secondaryColor:"#f4efe6",'
               'tertiaryColor:"#fbf8f2",fontFamily:"Inter, sans-serif",fontSize:"13px"}});')
    page = (
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spindle MVP Submission</title>'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600&family=Inter:wght@400;600&display=swap">'
        f'<style>{(HERE / "print.css").read_text()}</style>'
        '<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>'
        f"<script>{mermaid}</script></head><body>{body}</body></html>"
    )
    return page, [t for _, t, _ in toc], fig


def print_pdf(page_html, tmp):
    src = Path(tmp) / "submission.html"
    src.write_text(page_html)
    subprocess.run(["node", str(HERE / "export.mjs"), str(src), str(PDF)], check=True, cwd=REPO)


def find_pages(titles, tmp):
    """The page of each heading, found in the printed PDF (swift, PDFKit). Empty if swift is not available."""
    titles_file, out_file = Path(tmp) / "titles.json", Path(tmp) / "pages.json"
    titles_file.write_text(json.dumps(titles))
    try:
        subprocess.run(["swift", str(HERE / "findpages.swift"), str(PDF), str(titles_file), str(out_file)], check=True,
                       capture_output=True)
    except (OSError, subprocess.CalledProcessError):
        print("swift is not available: the contents will have no page numbers", file=sys.stderr)
        return {}
    return json.loads(out_file.read_text())


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmp:
        page, titles, figures = render({})
        print_pdf(page, tmp)                    # first pass: find where each heading lands
        pages = find_pages(titles, tmp)
        page, titles, figures = render(pages)
        print_pdf(page, tmp)                    # second pass: the contents with page numbers
        again = find_pages(titles, tmp)
        if pages and again != pages:
            print("warning: page numbers moved after the second pass; run the build again", file=sys.stderr)
    print(f"{PDF.relative_to(REPO)}: {figures} figures")
