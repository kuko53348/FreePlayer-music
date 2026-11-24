# CLAUDE.md

The rules for this project live in [AGENTS.md](../AGENTS.md). Read it first and
follow it exactly — FletBox syntax only, real props only.

Two shortcuts replace guessing:

- `flet-box unpack <Widget>` prints every prop the widget really honors, with
  its type, default and engine target. `--example` gives a call you can paste,
  `--diff` lists the props that are documented but dead or used but undeclared.
  `.fletbox/api/api.json` is the same surface for all widgets, as data.
- Design is not improvised. The rules are a file: read
  [skills/fletbox-design/SKILL.md](skills/fletbox-design/SKILL.md) before writing
  a screen (the same text is mirrored to `.claude/skills/` and `.qoder/skills/`,
  so those loaders find it by themselves). The set is four files: `fletbox-rules`
  for the API contract, `fletbox-design` for the screen, `fletbox-motion` before
  anything moves, `fletbox-memory` for the journal.
  `npm run ui` proves the part a checker can prove (tokens,
  the scale, 40px targets, labels, contrast) and cites the rule number it
  broke; AGENTS.md §4 has the tables. Scale: 4 · 8 · 12 · 16 · 18 · 24 · 32 ·
  40 · 48 · 64 · 96 spacing, radii 4/8/12/16/999, type 12 · 14 · 16 · 18 · 24
  · 32 · 40 · 48.

After every edit: `npm run check` (does it exist), `npm run ui` (is it clean),
then look at the screen — the checker has no eyes.

Memory: read `.fletbox/memory/MEMORY.md` and `notes/current-status.md` before
working, and write what you learn there — `fletbox-memory` is the format — when
the next session should not have to rediscover it.
