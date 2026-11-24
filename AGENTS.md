# AGENTS.md

**App:** `musicUI` · **Template:** `adaptive` · **flet-box@1.1.3**
FletBox is a vanilla-JS UI framework: ESM only, zero runtime dependencies,
fully offline. There is no build step to learn and no compiler to blame.

This file is the contract. Read it before writing any code in this project.
You do **not** need to read the whole framework to work here — sections 1 to 3
tell you where the authoritative answers live, the design system in section 4
fixes every size and color you may use, and the checker in section 5
proves you right or wrong in seconds.

If you are an agent **writing code** in this app rather than reading it,
[AGENTS_FOR_CODE_GEN.md](AGENTS_FOR_CODE_GEN.md) is the shorter contract:
the golden rule (a prop that is not in the cheatsheet does not exist), what
may never be written, the ten design rules that survive a review, what gets
rejected and why, and the verification protocol. Read that one first; this
file is its long form.

## 0. Start here — the skills folder

Everything this framework knows about building a professional screen is grouped
in four files under `skills/`, one per subject. They are copied byte-for-byte
into `.claude/skills/` and `.qoder/skills/` so those assistants load them
automatically, and into `.cursor/rules/` as pointer rules — `skills/` is the
text, the rest are mirrors of it. Open the file your task touches before
writing code, not after:

| Skill | What it owns | Read it when |
| --- | --- | --- |
| [fletbox-rules](skills/fletbox-rules/SKILL.md) | FletBox syntax only: no widget or prop from React, Vue, Svelte or Flutter; look an API up before using it; the rem contract; aliases; cleanup; the two gates | always, first |
| [fletbox-design](skills/fletbox-design/SKILL.md) | the numbered design rules — tokens, the scale, hierarchy, the four states, measured contrast, the framework traps, the dated tells, density | any screen, form, list, dialog or hero |
| [fletbox-motion](skills/fletbox-motion/SKILL.md) | whether a thing may move at all, and through which of `AnimatedBox`, `AnimatedText`, `ParallaxBox` or `animate` | any transition, entrance, pulse or parallax |
| [fletbox-memory](skills/fletbox-memory/SKILL.md) | the journal that hands progress from one AI to the next | at the start and at the end of every session |

Sections 1 to 7 below are the short version of those files, kept here because a
session that stops reading early still gets the rules that break the build. When
a summary here and a skill disagree, the skill is the longer argument and wins.

## 1. The API is a fact, not a guess

Never invent a widget, prop, hook or helper. Look it up:

| I want to know… | Look here |
| --- | --- |
| Which widgets exist and which props each accepts | `.fletbox/api/cheatsheet.md` (generated, covers every widget) |
| Everything for one widget | `npm run check -- --props <Widget>` |
| Whether a prop actually reaches the DOM, or is typed but dead | `flet-box unpack <Widget>` |
| A call that is safe to paste | `flet-box unpack <Widget> --example` |
| Prose, types and a worked example | `node_modules/flet-box/docs/widget/<Widget>.md` |
| Every public export of the package | `npm run check -- --list` |
| The whole surface as data, to build calls from | `.fletbox/api/api.json` |

**If a name is not in those files, it does not exist.** A prop that silently
does nothing is worse than a compile error: it renders as a broken layout and
nobody finds it for weeks.

- Do not edit `node_modules/flet-box`. It is a dependency, not source.
- The cheatsheet is generated output. Regenerate it with
  `flet-box check-api --emit-api` after upgrading the package; never hand-edit it.
- `.fletbox/api/api.json` and `api.md` are generated the same way:
  `npm run api`. They carry one entry per prop with its engine target, default,
  aliases and a `sample` value, so a call can be written from data instead of
  memory.

## 2. FletBox syntax only — no other framework

A widget is a **function call that returns an HTMLElement**. That is the whole
model. Do not mix in syntax from another ecosystem:

```js
// Correct
Text({ text: 'Hello', size: 18, color: colors.primary })
Button({ text: 'Save', onPress: save, bgColor: colors.primary })
Container({ child: Text({ text: count }), padding: 12 })
```

```js
// Wrong — never write any of these
<Text>Hello</Text>                      // JSX
h('div', ...)                            // hyperscript
Text("Hello")                            // positional args
Text('Hello', size: 18)                  // Dart / Flutter named args
new Text(...)                            // classes
t('div')                                 // Vue template
```

- No `react`, `vue`, `svelte`, `@angular/core`, `solid-js`, `lit`, `jquery`,
  `tailwindcss` or `bootstrap` imports. This app is offline: nothing installs
  at runtime and nothing fetches a CDN.
- No `.jsx`, `.tsx`, `.vue` or `.svelte` files. Plain `.js`, ESM imports with a
  explicit `.js` extension.
- Styling is props (`bgColor`, `borderRadius`, `padding`), not class strings or
  `styled-components`.
- `child` takes one widget; `children` takes an array or string. Swapping them
  is the most common silent bug.
- Prop aliases (`bgColor` ≡ `backgroundColor`, `onPress` ≡ `onClick`) are
  intentional. Pick one per file and stay consistent; do not "dedupe" them.

## 3. Architecture the framework expects

```
app.js                      -> runApp(App, 'root')
screens/                    -> one exported widget per route
components/                 -> reusable, stateless unless they own state
components/layouts/         -> appBar, drawer, sidebar, bottomBar
```

The app root is `Scaffold`, which owns navigation and chrome. Use it:

```js
Scaffold({
  routes,
  appBar: AppBarComponent({ title: 'FletBox', isMobile }),
  drawer: isMobile ? DrawerMenu() : null,
  // Functions, not elements: Scaffold re-runs a bar on every route change,
  // which is how the active item learns where the reader is.
  bottomBar: isMobile ? () => BottomNav() : null,
  leftNavBar: !isMobile ? () => Sidebar() : null,   // NOT `sidebar:`
  leftNavBarWidth: 240,
  fab: isMobile ? ActionButton({ icon: 'add', onPress: open }) : null,
  body: isMobile ? null : HomeScreen(),
})
```

Real `Scaffold` props: `appBar body bottomBar fab drawer leftNavBar
leftNavBarWidth rightNavBar rightNavBarWidth routes basePath backgroundColor
closeDrawerOnNavigate`. (`--props Scaffold` is authoritative.)
For a responsive app, branch in JS on the breakpoint table, not on CSS alone:
`useState` seeded from `atLeast("md")` plus one `onBreakpointChange()` at
module scope — it fires when the viewport crosses a step, not on every pixel
of a resize. `md` is 768, the same line `AdaptiveScaffold` crosses, so a
screen and its shell cannot disagree. A number that really wants to be
different at 400px and 1400px comes from `pick({ xs: 16, md: 24 })`.
See `src/app.js` in this project.

Custom widgets follow the same shape every framework widget uses
(`QRCode.js` is the reference):

```js
export const MyWidget = (props = {}) => {
  const widget = WidgetFactory("div", { ...props, widgetName: "MyWidget" });
  // children, then composeUpdate(widget, ...), then return
};
```

- Use `composeUpdate()`; never overwrite `container.update`.
- Register resources (listeners, timers, RAF, observers) and release them in an
  idempotent `onUnmount` disposer. Never monkey-patch `_cleanup`.
- State is key-based: `useState("key", 0)` plus subscribers. There is no
  component re-render tree to reason about.
- The package exports 123 helpers next to the widgets and they are the short
  form of the code you would otherwise write: `mapList` (an array, a number or
  an object), `createList`, `range`, `repeat`, `sort`, `unique`, `chunk`,
  `shadow`, `gradient`, `rgba`, `transform`, `transition`, `filter` (a CSS
  filter, not a list filter), `color(hex).darken(12).hex()`, `random.*`,
  `shortId`, `uuid`, `formatDate`, `formatTimeAmPm`, `relativeTime`, `timeAgo`,
  `addDays`, `subtractDays`, `dateDiff`, `dayOfWeek`, `isWeekend`, `today`,
  `seconds`, `days`, `parseDate`, `timer`, `every`, `everySecond`, `waitUntil`,
  `split`, `join`, `trim`, `startsWith`, `endsWith`, `includes`,
  `delay`, `withMinDelay`,
  `retry`, `memo`, `dict`, `print`, `ref`, `atLeast`, `pick`,
  `onBreakpointChange`, `loadFont`, `clipboard`. Hand-write the long version
  only when it is genuinely shorter or clearer. `npm run check -- --list`
  prints the set for the version actually installed.
  The trap: a routed prop already IS the short form. `padding: 16` reaches the
  rem contract; `padding(16)` returns a pixel string. Use the helpers for a
  CSS value a prop cannot express, never instead of a number.
  Second trap: `months(1)` is 30 days and `years(1)` is 365, and `addDays`
  counts calendar days while `addHours` counts real elapsed ones.

One rendering engine exists: `src/widget-factory/`. Never add a second one, and
never style by reaching around the factory. **If you believe the engine is
broken, prove it with a minimal repro and record the finding in memory** — do
not work around it silently.

## 4. Design system — one scale, three colors

A screen is designed, not decorated. Every size and every color on this app
comes from the two lists below. A value outside them is a bug you have to
justify, and `padding: 13` or `#4f46e5` written by hand is the usual sign a
screen drifted away from the rest.

**Color: three roles, no more.**

| Role | Token | Where it may appear |
| --- | --- | --- |
| Brand | `colors.primary` | the one action the screen asks for: primary button, active tab, focus ring, links |
| Emphasis | `colors.secondary` | a deliberate second voice: gradients, badges, a highlighted stat |
| Feedback | `colors.success` / `colors.warning` / `colors.danger` / `colors.dangerStrong` | status only — never as decoration; the last one is the red you may write words in |

Everything else is neutral: `colors.background`, `colors.surface`,
`colors.card`, `colors.text`, `colors.textSecondary`, `colors.textDisabled`,
`colors.border`, `colors.divider`, plus the `gray50`…`gray900` ramp. Rules:

- A screen uses **one** brand color. Two accent colors competing on one view
  means one of them is wrong.
- The brand is an **accent**, not a value on the screen: this app opens on the
  `neutral` family (`applyAccentPreference` at the bottom of
  `src/database/themes.js`) and the reader can move it on the Preferences
  screen, where `ThemePicker` lives. To ship a hue, change that id or register
  a family with `registerAccent` — never write the hex into a screen.
- Never type a hex or `rgb()` literal. If a token is missing, add it to a
  `theme.js` in this app that re-exports `colors` — do not scatter the value.
- A frosted surface is `colors.glass` with `colors.glassBorder` plus a
  `backdropFilter`. It reads through to whatever is behind it, so there
  should be imagery or a gradient there, never body copy.
- Text on a dark or brand fill is white, and it stays white: hierarchy comes
  from size and weight, not from fading the ink to `rgba(255,255,255,.72)` —
  faded white on `colors.primary` measures 3.16:1 and stops being body text.
- `error` ≡ `danger`, and `*Bg` variants exist for alert fills. As **words**,
  `colors.danger` is 3.76:1 on white and fails AA: write `colors.dangerStrong`
  for the label of a delete or an inline error (6.47:1 on white, 5.42:1 inside
  `colors.errorBg`), and keep `colors.danger` for the dot, the border, the icon.
  Same reason `colors.warning` and `colors.success` are plates, never sentences.
  Measure any pair before arguing about it: `npm run ui -- --tokens`.

**Space and type: an 8-based scale.** Use these numbers and nothing between
them. They are plain props (`padding`, `gap`, `margin`, `width`, `height`,
`size`, `borderRadius`) — the factory takes the number, no unit and no `px` string.

```
spacing   4  ·  hairline, icon inset
          8  ·  tight gaps, chip padding
         12  ·  control padding (input/button height − text)
         16  ·  default card padding, section gap, screen gutter
         18  ·  card-to-card rhythm on a dense grid
         24  ·  between sections, page gutter
         32  ·  between page blocks
         40  ·  the smallest tap target, a roomy control
         48  ·  hero spacing
         64 / 96  ·  a full-bleed section, a landing hero
radius     4 / 8 / 12 / 16 / 20 / 24 / 999 (pill)
type      12 caption · 14 body-small · 16 body · 18 subtitle · 24 title
          32 headline · 40 / 48 display (a hero, a big number)
weight    400 body · 500 label · 600 title · 700 headline
line-height  1.5 body · 1.2 heading
```

- Padding inside a card is `16`; the gap between cards is `16` or `24`. Never
  mix the two on the same list.
- One text size per element, one weight per role. If a label and its value are
  the same size, the hierarchy is carried by color, not by a fourth size.
- Tap targets are at least `40` on a side; get there with `height`, not padding.
- `useState` bindings, `flex` and `gap` do the layout. Reach for an absolute
  offset only for overlays, and use `stackPosition` rather than raw coordinates.

**The phone range is the test device — strict.** Every phone is `xs` in the
breakpoint table, so nothing in the shell changes between 320 and 430; the
layout has to. Compose at `360×640` and prove the screen at `320×568` (the
floor), `375×667`, `390×844`, `393×852`, `412×915` and `430×932` (the
ceiling), in portrait. At 320 nothing overflows or clips: no horizontal
scroll, no label cut because its row ran out of room. A heading whose text
the app does not control — a lesson name, a chapter, a user title — is `24`
on a phone and `32` only from `atLeast("md")`: at 360 a long name at `32` is
four lines and pushes the controls under it off the first screen. Fixed
chrome is inside the 320 budget: an app bar title plus its actions, a tab
strip, a labeled bottom bar. If one needs more than 320, shorten what it
says — never let it scroll sideways.

## 5. Verification loop (required)

After every edit, before you say a task is done:

```bash
npm run verify        # parses first, then every gate, then your test scripts
                       # — one report, one exit code; this is the command to
                       # run after every edit
npm run verify -- --fix   # the same, after the mechanical repair: it rewrites
                       # a mistyped prop, a wrong relative path and your
                       # spacing first, so a typo never reaches you as work
                       # to do
npm run lint           # the rules a formatter does not decide (tabs,
                       # final newline, CRLF); `npm run format -- --write`
                       # repairs the whitespace between tokens
npm run check          # static gate: invented widgets/props, positional args,
                       # foreign imports, and broken imports between your own
                       # modules (a name a file never exports)
npm run ui             # clean-UI gate: the tokens and the scale above, 40px
                       # targets, labels, contrast — every finding cites the
                       # rule number it broke
npm run metrics        # the north metric: how much code passed the gate with
                       # no correction, and which failures keep coming back
flet-box report        # lost? every file of this project, its verdict, and
                       # the one next step — read-only, writes no metrics row
flet-box tools         # the map: which command answers which question
npm run dev            # serve on :8000 — check the UI actually renders
```

`npm run verify` parses every module first (`node --check`, the parser the
runtime uses: a missing `)` comes back as `file:line:column` with a caret
under the character and a hint), then runs those two gates, the type gate
(your own `jsconfig.json` through TypeScript, the same service the editor
uses: a widget declared as a bare `HTMLElement` makes `widget.update()` an
error here and there), the lint gate (the rules a formatter does not
decide: no trailing whitespace, no tab indentation, LF line endings, a
final newline) and the format gate (every module in canonical form: the
formatter normalises the whitespace between tokens and never re-indents),
the structural gate (a cycle between two of your own modules, a module
outside the project folders, markup written by hand) and the prop
contract in parallel, and prints one report: the gate that failed, the
file at `line:column`, and what to do about it. A project that declares
its own test scripts gets those run too; a created app declares none.
All of them read the installed package, so they are always in sync with what
runs. They exit non-zero on a real error: fix the code, not the checker. A
warning is allowed to stay only when you can justify it in one sentence.

Fix what the report names, and nothing else. Every finding carries a file and
a line: change that line. Do not rewrite the file to make it pass, and do not
reformat or rename a line the report did not name. If the same error survives
two attempts, the diagnosis was wrong: revert and hand the report back.

`npm run ui` proves what is *written*; the rules it cites are the numbered ones
in [skills/fletbox-design/SKILL.md](skills/fletbox-design/SKILL.md),
and that file is the part a checker cannot do — hierarchy, copy, whether the
screen solves the problem. Read it before writing a screen, not after.

Every `npm run verify` also appends a row to
`.fletbox/metrics/generations.md` — green or not — and `npm run metrics`
reads those rows: the share of code that passed the gate with no correction
at all, plus the failures that recur most often. When the same code comes
back a third time with no rule behind it, the command fails: that is the
signal to write the rule, not to fix the same line again.

When the error is a mistyped name, `npm run fix` rewrites it for you — a
relative path that does not resolve, a name the target module never exports,
an identifier used without its `import`, and a prop key the API does not know
(`chilldren` → `children`, `bgColr` → `bgColor`). It only rewrites when exactly
one real name is close enough; anything ambiguous is printed untouched for you
to decide. Run `npm run check` again after it, and read the diff.

When you are lost, do not guess which gate to run: `flet-box report` names
every file of this project (clean ones included), its verdict, its widgets,
and a ranked next step; `flet-box tools` is the catalogue that maps a
question to the command. Both are read-only — no repair, no metrics row —
and the only file they can write is the report page, when `--html` asks for
it, into `.fletbox/reports/` (generated output, not committed).

## 6. Memory — do not relearn the same thing

The full format lives in [skills/fletbox-memory/SKILL.md](skills/fletbox-memory/SKILL.md).
The short version: at the start of every session read
`.fletbox/memory/MEMORY.md` and the entries it points at, including
`notes/current-status.md`. That is how this agent remembers the app between
chats — and between models — instead of rediscovering it each time.

- When you learn something non-obvious about this app or the framework, write
  `.fletbox/memory/notes/<kebab-case-topic>.md` with: what (fact or rule), **Why:**
  (the incident or constraint behind it), **How to apply:** (when it kicks in),
  and an absolute date for anything time-bound.
- Add a one-line pointer to it in `MEMORY.md`. Keep the index short.
- One entry per topic, under 10 lines. Update or delete an entry that turns out
  to be wrong rather than appending a correction beside it.
- Commit memory files with the code change they describe.

## 7. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | static dev server on port 8000 |
| `npm run verify` | parses every module, then every gate, then your test scripts: one report, one exit code |
| `npm run check` | anti-hallucination gate over `src/` |
| `npm run fix` | rewrite mistyped imports and prop names it can prove |
| `npm run metrics` | the north metric: how much code passed the gate with no correction |
| `flet-box report` | every file with its verdict, the widget ledger, and a ranked next step (read-only) |
| `flet-box report --html` | the same report as one self-contained page in `.fletbox/reports/` |
| `flet-box tools` | the catalogue: which command answers which question (`--emit` writes `.fletbox/api/tools.json`) |
| `flet-box mcp` | the same read-only tools over MCP stdio, for an assistant with no shell |
| `npm run check -- --props Button` | print the real props of a widget |
| `flet-box unpack Button` | everything Button accepts **and that actually works** |
| `flet-box unpack Button --example` | a paste-ready call using only live props |
| `flet-box unpack Button --diff` | doc vs code gaps: dead, invented, undocumented |
| `npm run api` | rebuild `.fletbox/api/api.json` + `api.md` for the whole surface |
| `npm run build` | esbuild bundle into `dist/` |
| `flet-box build android` / `ios` | Capacitor native build |
| `flet-box run-native android` | compile and launch on device/emulator |

Generated by `flet-box create`. To refresh the guide and cheatsheet after a
framework upgrade: `flet-box check-api --emit-api`.
