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

## D. UI principles (type: Usability — Low unless it blocks a demo task)

Added 2026-11-08 from Figma's article "Princípios de design de UI" (https://www.figma.com/pt-br/resource-library/principios-design-ui/), written in our own words and tied to what went wrong in Spindle. Use them to look at a screen as a whole; a finding still needs a screenshot or a design page as evidence.

- **Hierarchy:** the most important thing on the screen (the answer, the primary action) is the strongest by size, weight, colour and space; look at the screenshot squinting: is it the first thing seen? Content is ordered by what the user needs first.
- **Progressive disclosure:** a long task is split into steps, each showing only what that step needs, and the user can tell where they are and what is left (sell flow, checkout). Detail that is not needed yet stays out of sight.
- **Consistency:** the same kind of element looks and behaves the same everywhere (buttons, cards, tags, back buttons, "Try again"); a deviation needs a reason recorded in `DECISIONS.md`.
- **Contrast and balance of colour:** strong contrast only for what must be noticed (the primary action, a warning); softer for the rest. Across the whole page, dark and light weight should be spread evenly, not clustered, and colours should not all be the same family (the old home page: three beige crates and one dark card looked flat and lopsided). Compare against the colours of the design page.
- **Accessibility:** contrast measured, not guessed (WCAG AA: 4.5:1 for body text, 3:1 for large text and controls); alt text for images that carry meaning; visible focus; everything reachable by keyboard; tap targets of at least 44 px; meaning never carried by colour alone.
- **Proximity:** related things sit together and unrelated things apart, so groups are read correctly and the wrong thing is not tapped (a tag next to the name it belongs to; "Change" next to the thing it changes; destructive actions apart from safe ones).
- **Alignment:** blocks on a page share one grid and the same left and right edges; rows of cards have equal sizes and gaps (the old home page: three equal columns above, a 3:2 split below, a card with an empty gap at its bottom).
- **Flow (perspective):** the screen leads the eye through the steps in the order the user's goal needs, and the next action is where the eye ends up.
- **Effortless use:** navigation is the same on every page, every action gives visible feedback (selected, loading, saved, failed) and common tasks have a shortcut (search in the header on desktop).
- **Test with people:** when the check is about how it feels, say so in the report and propose watching someone use the screen (the Product Owner's own eye counts: her "this is not balanced" on the home page was a valid finding).
