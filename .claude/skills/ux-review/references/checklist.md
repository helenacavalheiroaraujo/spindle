# UX review checklist

Go through each section for every built screen. Quote the rule in the finding's evidence.

## A. CLAUDE.md rules (type: Rule broken)

Visual direction (`CLAUDE.md` · Visual direction):
- Warm cream background; dark navy for primary buttons and selected states; dark brown for emphasis cards
- Rounded cards with thin borders; pill-shaped buttons and tags
- Headings in a bold condensed sans-serif; body in a plain readable sans-serif
- **The traffic light always shows its word (Match / Check / No match), never colour alone**
- **Illustrative data is always labelled**
- Phone first: one column, large tap targets (aim for ≥ 44 × 44 px)
- On desktop, listings sit beside the recommendation

Build rules (`CLAUDE.md` · Keep it simple / Safety):
- Loading and errors use the shared `LoadingMask` and `ErrorScreen` (check `loading.tsx` / `error.tsx` per data route)
- Error screens say what failed in plain language and have "Try again"; forms keep what was typed (`SPEC.md` · Shared rules)
- No card or bank details asked for anywhere
- All UI text in English

Layout at both widths:
- No horizontal scroll at 375 px; nothing cut off or overlapping
- Desktop (1280 px) uses the width sensibly — not a stretched phone column with unreadable line lengths, unless the design shows that

## B. Fidelity to the Assignment 1 designs (type: Design mismatch)

For each screen, find its page in `Spindle_mockups_by_section.pdf` (and its place in `HappyPath.png` / `Spindle_user_flow_desktop.png`):
- Elements present in the design but missing on screen, or the reverse
- Different texts (headings, button labels, messages)
- Different order of sections, or a different screen following an action
- Visual hierarchy noticeably different (what is the primary action)

Skip differences that `DECISIONS.md` or the story explains.

## C. Usability heuristics (type: Usability — Low unless it blocks a demo task)

- **Visibility of status:** the user can tell where they are, what is selected, what is loading
- **Match with the real world:** words a non-specialist buyer understands; jargon has a plain explanation (glossary)
- **User control:** a clear way back from every screen; "Change" where a choice can be revised
- **Consistency:** same action, same label and style across screens
- **Error prevention:** disabled actions explain why, or what is missing is visible
- **Recognition over recall:** the chosen album / version / priorities stay visible on later screens
- **Minimalist design:** nothing on screen competes with the primary action without reason
- **Help with errors:** messages say what happened and what to do

Basic accessibility:
- Text contrast looks sufficient (body text on cream, white on navy); flag doubtful pairs, do not guess ratios without measuring
- Interactive elements look interactive; focus is visible
- Images that carry meaning have text (album cover, photos); icons have labels
