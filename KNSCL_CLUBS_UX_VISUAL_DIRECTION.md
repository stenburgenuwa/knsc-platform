# KNSCL CLUBS PAGE — UX & VISUAL DIRECTION

**Date:** 9 August 2026
**Status:** Design direction. No implementation has been carried out.
**Governing documents:**
`.claude/skills/knscl-visual-design/SKILL.md` · `KNSCL_VISUAL_AUDIT.md` ·
`KNSCL_HOMEPAGE_UX_DIRECTION.md` · `KNSCL_HOMEPAGE_VISUAL_DIRECTION.md`
**Visual reference:** the implemented homepage (THE BOARD)

---

## 1. DESIGN OBJECTIVE

Replace the repetitive club card grid (`H4`) with a page that reads as the
**official register of clubs competing in the Kilifi North Sub County League**.

### What exists today

`app/(public)/clubs/page.tsx` renders sixteen `ClubCard`s in a 1/2/3-column
grid. Each card is a bordered box containing a 52px crest, the club name, the
home ground, and a label/value list of Manager, Founded and Squad.

Three faults, all of them structural:

1. **Sixteen identical boxes.** The audit's `H4`, and §6 and §12 of the design
   direction: "repetitive three-column card layouts" and "everything is a card".
2. **The crest is an icon, not an identity.** At 52px beside a 19px name inside a
   bordered box, the badge is decoration attached to a label.
3. **Administrative data on a public page.** Manager name is on the index; the
   club profile additionally publishes the manager's **email address**. That is
   staff contact information, not editorial content. See §13 and §19.

### The objective, in one line

> **The page should feel like the competition's register — every club in Kilifi
> North, in one ruled document, with the crests carrying the colour.**

---

## 2. UX GOALS

| # | Goal | Measure of success |
|---|---|---|
| 1 | Show the whole competition at once | All 16 clubs reachable without pagination or filtering |
| 2 | Make finding *my* club fast | A supporter locates their club by crest in under two seconds |
| 3 | Answer where each club plays | Home ground visible on every record, at every breakpoint |
| 4 | Convey competition status | League position and form present in-season, absent pre-season |
| 5 | Get out of the way | One click from the register to any club profile |
| 6 | Stay editorial, not administrative | No staff contact details anywhere on the index |

### The structural advantage

Sixteen clubs is small enough to **show rather than paginate**. A professional
league must abstract its clubs behind search and filters; KNSCL can put the
entire competition on one screen. The design should exploit that, not hide it
behind a grid that could equally hold four clubs or four hundred.

---

## 3. USER QUESTIONS

Ranked by how often they are asked on arrival.

| Rank | Question | Answered by |
|---|---|---|
| 1 | "Which clubs are in this league?" | The register itself — all 16 visible |
| 2 | "Where is my club?" | Crest column, scanned vertically |
| 3 | "What is this club's crest?" | Crest at 56px, unframed, on every record |
| 4 | "Where do they play?" | Home ground on the record |
| 5 | "How are they doing?" | Position + form, in-season only |
| 6 | "How big is the squad?" | Squad numeral, right-aligned |
| 7 | "Take me to the club" | The whole record is the link |

### Deliberately not answered here

**Manager name, manager email, founding year, club colours.** These belong on the
club profile, not the index. The founding year in particular is currently
unreliable (§15 of the audit records 1900, 1909 and 1926) and putting it on
sixteen consecutive records would draw attention to bad data.

> The public Clubs page is an editorial directory, not a database viewer.

---

## 4. INFORMATION ARCHITECTURE

```
Clubs
│
├── 01  PAGE HEAD ─────────── compact. title, one line, season, count.
│                             no hero. the register starts high on the page.
│
├── 02  THE REGISTER ──────── the page. one ruled record per club.
│        │
│        ├── crest        identity, 56px, unframed
│        ├── club name    the record's headline
│        ├── home ground  where they play
│        ├── squad        registered players
│        └── status       position + form (in-season only)
│
└── 03  FOOT NOTE ─────────── one quiet line into Players / Table.
```

**Three parts, one of which is a single line.** The page is deliberately short in
structure and long in content — the opposite of the homepage, which is five
sections of varied rhythm. That difference is what stops it reading as a clone.

### Ordering

| State | Order | Why |
|---|---|---|
| **In-season** | League position | The register becomes a standings-aware document; the club at the top is the club at the top |
| **Pre-season** | Alphabetical | No position exists; alphabetical is what a register does |

Ordering by position in-season is the single cheapest way to make the page feel
like a competition rather than a list.

---

## 5. THREE CANDIDATE DIRECTIONS

### Direction A — League Register

A ruled editorial directory. One club per horizontal record, columns for crest,
name, ground, squad, status.

```
──────────────────────────────────────────────────────────────
 1   ⬤   Malindi United      Malindi Municipal   24   W W D
──────────────────────────────────────────────────────────────
 2   ⬤   Marereni United     Marereni Ground     19   W L W
──────────────────────────────────────────────────────────────
```

**Strengths** — highest information density; genuinely football-native (this is
what a competition handbook looks like); ruled records, no boxes; scannable;
scales to any number of clubs; excellent on mobile.

**Weaknesses** — the crest risks becoming a small icon in a table cell, which is
exactly the failure being corrected. Sixteen rows of uniform height can read as
flat and administrative — a spreadsheet rather than a page.

---

### Direction B — Crest Index

The sixteen crests as the primary object and the primary navigation, in the
manner of the homepage crest wall but larger and carrying more metadata.

```
┌──────────┬──────────┬──────────┬──────────┐
│    ⬤     │    ⬤    │    ⬤    │    ⬤    │
│ MALINDI  │ MARERENI │  SOKOKE  │  KILIFI  │
│ Malindi  │ Marereni │  Sokoke  │ Township │
│    24    │    19    │    21    │    17    │
└──────────┴──────────┴──────────┴──────────┘
```

**Strengths** — maximum crest presence; the strongest identity statement
available; the colour of the league is the content of the page.

**Weaknesses** — **it is a grid of sixteen equal cells, which is the pattern the
audit asked us to remove**, and it duplicates the homepage crest wall almost
exactly. It also cannot carry ground, position and form without each cell
becoming a card. Rejected largely on those two grounds.

---

### Direction C — Hybrid Editorial Directory

A crest index band across the top for identity, then a register beneath for
information.

**Strengths** — combines identity and density.

**Weaknesses as usually built** — the crests appear **twice**, once in the band
and again in the register. That is redundancy, not hybridity, and it makes the
page longer without making it clearer. A hybrid that simply stacks two solutions
is weaker than either.

---

## 6. RECOMMENDED DIRECTION

### C — Hybrid Editorial Directory, resolved so the two halves are one object

The hybrid is right, but only if the index and the register stop being two
things. The resolution:

> **The register's crest column *is* the crest index.**

Give the crest enough scale (56px in a ~84px record) and the left edge of the
page becomes an unbroken vertical column of sixteen real badges — read as a wall
— while the same rows extend rightward into ground, squad and status, read as a
register. One object, two readings, no duplication.

```
   ╷
 1 │ ⬤  Malindi United          Malindi Municipal    24    W W D
   │ ↑
 2 │ ⬤  Marereni United         Marereni Ground      19    W L W
   │ ↑
 3 │ ⬤  Sokoke Rangers          Kilifi Township      21    W W W
   │ ↑
   │ └── this column is the crest wall, read vertically
   ╵     the rows are the register, read horizontally
```

This takes A's density and football-native structure, and B's crest presence,
without B's card grid or C's duplication. It is also a genuinely different object
from the homepage crest wall — that is a *matrix* read in two dimensions; this is
a *column* read down one.

---

## 7. PAGE WIREFRAME

```
┌═══════════════════════════════════════════════════════════════════┐
║  KILIFI COUNTY · KENYA                          CONTACT   SIGN IN ║
║  ┌──┐                                                             ║
║  │KN│ KILIFI NORTH   FIXTURES RESULTS TABLE CLUBS PLAYERS   [⌕]  ║
║  └──┘ SUB COUNTY LEAGUE                                           ║
╠═══════════════════════════════════════════════════════════════════╣
│  Home / Clubs                                                     │
│                                                                   │
│  CLUBS                                              SEASON 2026   │  ← 01 head
│  ───────────────────────────────────────────────────────────────  │
│  Sixteen clubs compete in the Kilifi North Sub County League.      │
│                                                                   │
│  #    CLUB                     HOME GROUND        SQUAD    FORM   │  ← column rule
│  ═══════════════════════════════════════════════════════════════  │
│                                                                   │
│   1   ⬤   Malindi United       Malindi Municipal    24   W W D    │  ← 02 register
│  ───────────────────────────────────────────────────────────────  │
│   2   ⬤   Marereni United      Marereni Ground      19   W L W    │
│  ───────────────────────────────────────────────────────────────  │
│   3   ⬤   Sokoke Rangers       Kilifi Township      21   W W W    │
│  ───────────────────────────────────────────────────────────────  │
│   4   ⬤   Kilifi Township FC   Kilifi Township      17   D L D    │
│  ───────────────────────────────────────────────────────────────  │
│   5   ⬤   Watamu FC            Watamu Community     16   D W L    │
│  ───────────────────────────────────────────────────────────────  │
│   …                                                               │
│  ───────────────────────────────────────────────────────────────  │
│  16   ⬤   Young Hiroz          Ground TBC           —    —        │
│  ═══════════════════════════════════════════════════════════════  │
│                                                                   │
│  Every registered player →        Full league table →             │  ← 03 foot
│                                                                   │
╠═══════════════════════════════════════════════════════════════════╣
║  KILIFI NORTH      COMPETITION    THE LEAGUE      CONTACT         ║
╚═══════════════════════════════════════════════════════════════════╝
```

*Illustrative. Proportions are directional, not measurements.*

---

## 8. DESKTOP COMPOSITION — 1440px

### Grid

Contained at 1240px, matching the homepage. The register runs the full content
width; nothing is centred and nothing floats.

### Record structure

```
 ├─ 44 ─┼─ 76 ─┼──────── 1fr ────────┼──── 280 ────┼─ 80 ─┼─ 110 ─┤
   pos    crest        club name        home ground   squad   form
```

| Column | Width | Alignment | Treatment |
|---|---|---|---|
| Position | 44px | Left | Tabular numeral, `neutral-600`. In-season only. |
| Crest | 76px | Centre | 56px badge, unframed |
| Club name | fluid | Left | The record's headline — 20px, heading font, 600 |
| Home ground | 280px | Left | 13px, `neutral-600`, uppercase-free |
| Squad | 80px | **Right** | Tabular numeral, 17px |
| Form | 110px | Left | W/D/L badges. In-season only. |

**Record height ≈ 84px.** Enough for a 56px crest to breathe with 14px of air
above and below. Rows share hairlines; there are no gaps and no boxes.

### The head

Title at h1 scale, a single line of context, season and count to the right. No
banner, no illustration, no statistics band. The first record sits within the
first screen.

### Why no columns for Manager or Founded

See §3. Both are removed from the index; manager stays on the profile, founding
year stays on the profile where its unreliability is less conspicuous.

---

## 9. TABLET COMPOSITION — 768px

The register survives intact; two columns retire.

```
 ├─ 40 ─┼─ 64 ─┼────────── 1fr ──────────┼─ 64 ─┤
   pos    crest    club name / ground       squad
```

| Change | Reason |
|---|---|
| **Form column drops** | Lowest information value per pixel |
| **Home ground moves under the club name** | Second line, 12px, `neutral-600` |
| Crest 56 → 48px | Keeps the record near 72px |
| Squad retained, right-aligned | One numeral is cheap and useful |

The record becomes two lines of text beside a crest. It has not become a card:
records still share hairlines and span the full width.

---

## 10. MOBILE COMPOSITION — 390px

**The register must not become a stack of cards.** This is the failure mode the
homepage refinement pass had to correct, and it is the one to watch here.

```
┌─────────────────────────────────────┐
│  1  ⬤   Malindi United        24    │
│         Malindi Municipal           │
├─────────────────────────────────────┤   ← hairline, full width
│  2  ⬤   Marereni United       19    │
│         Marereni Ground             │
├─────────────────────────────────────┤
│  3  ⬤   Sokoke Rangers        21    │
│         Kilifi Township             │
└─────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Record height | ~68px |
| Crest | 44px |
| Club name | 16px, heading, 600 |
| Home ground | 12px, `neutral-600`, second line |
| Squad | Tabular numeral, right-aligned, 15px |
| Position | Retained, 13px — it is only two characters |
| Form | Hidden below 480px |

### Rules

- **Records span edge to edge** — no side margins on the row, so the hairlines
  read as continuous rules rather than as card borders.
- **No radius, no shadow, no background on the record.** The only surface change
  is the hover/active fill.
- **The crest column stays aligned** down the page, preserving the vertical wall
  reading on a phone.
- Touch target ≥ 44px — satisfied by the 68px record.

**Metadata goes before content goes.** Form drops first, then position if space
demands it. The crest, name, ground and squad never drop.

---

## 11. CREST TREATMENT

The crest is the identity object, and on this page it is also the navigation.

| Context | Size | Frame |
|---|---|---|
| Desktop record | 56px | **None** |
| Tablet record | 48px | None |
| Mobile record | 44px | None |

### Rules

1. **Unframed.** No rounded square, no plate, no border. `object-fit: contain`
   in a square box so differently shaped badges — circles, shields, wide
   banners — are normalised by *bounding box*, never by cropping or masking.
2. **Never cropped, never recoloured, never given a background.** A pale crest
   sits on paper; that is the crest's business, not the page's.
3. **Optical centring in a fixed column** is what creates the vertical wall. The
   column width is constant even though badge widths vary.
4. **Missing crest** uses the homepage fallback exactly: a quiet outlined
   monogram, `neutral-500` on transparent, visibly lighter than any real badge.
   No invented logo, no generic football icon, no coloured placeholder.
5. **On hover** the crest does not change. The record fills; the badge is
   constant. The club's identity is not a hover state.

> If a real crest and a fallback monogram sit in adjacent records, the real one
> must obviously win. That is the test.

---

## 12. TYPOGRAPHY HIERARCHY

Inherited from the homepage. **No new type system.**

| Role | Family | Desktop | Tablet | Mobile | Weight |
|---|---|---|---|---|---|
| Page title | Archivo | 40px | 34px | 30px | 700 |
| Page lead | IBM Plex | 16px | 15px | 15px | 400 |
| Column header | IBM Plex | 11px | 11px | — | 700, uppercase, `0.09em` |
| **Club name** | Archivo | **20px** | 18px | 16px | 600 |
| Home ground | IBM Plex | 13px | 12px | 12px | 500 |
| Position | Archivo | 15px | 14px | 13px | 700, tabular |
| Squad | Archivo | 17px | 16px | 15px | 700, tabular |
| Form badge | Archivo | 11px | 11px | — | 700 |
| Foot links | Archivo | 13px | 13px | 13px | 600, uppercase |

### The one rule that matters

> **The club name is the largest thing in the register, and the page title is
> the largest thing on the page. Nothing else competes.**

The homepage rule "no heading exceeds the score" has no analogue here — there is
no score. Its equivalent: **no metadata approaches the club name.** Ground,
squad and position are all visibly subordinate.

The 14–32px cluster remains forbidden as a *body* of sizes: the register uses
20 / 17 / 13 / 11, which is spread, not cluster.

---

## 13. COLOUR RULES

Unchanged from the homepage. The palette is closed.

| Element | Colour |
|---|---|
| Page ground | `--color-bg` paper |
| Record ground | Transparent on paper |
| Hairlines | `--color-divider` |
| Column-header rule | 2px `--color-ink` |
| Club name | `--color-ink` |
| Metadata | `--color-neutral-600` |
| Links | `--color-accent` teal |
| Form badges | `--color-win / draw / loss` |
| Record hover | Fill `--color-ink`, text `#fff` |
| **Everything else** | **The club crests** |

### Rules

1. **No per-club colour.** Do not tint a record, a rule or a position numeral
   with a club's colours. The `Club.colours` field is free text
   (`"Red and white"`) and cannot be parsed reliably — and even if it could, the
   crests already supply the chroma.
2. **No alternating row shading.** Zebra striping is a spreadsheet convention and
   would flatten the crest column's effect.
3. **No status colour beyond form.** Position is not colour-coded; no promotion
   or relegation tinting until the league actually has those rules.

---

## 14. INTERACTION RULES

The minimum that communicates state.

| Interaction | Behaviour | Duration |
|---|---|---|
| Record hover | Ground → ink, text → white, crest unchanged | 120ms |
| Record focus | 2px `--color-accent-2` outline, 1px offset | instant |
| Record activate | Whole record is one link to `/clubs/[id]` | — |
| Foot links | Colour change only | 140ms |

### Rules

- **The entire record is the link.** No "View club →" affordance on each row —
  sixteen repeated call-to-action labels are exactly the decorative navigation
  the homepage pass removed.
- **Only `color` and `background-color` transition.** Nothing moves, lifts,
  scales or fades. A register does not animate.
- **No sort controls, no filter bar, no search box.** Sixteen clubs do not need
  them, and adding them would make the page a data table UI. If the league ever
  exceeds ~30 clubs, revisit.
- `prefers-reduced-motion` remains honoured globally.

---

## 15. DATA-STATE BEHAVIOUR

State is derived from data, exactly as on the homepage — no configuration flag.

### In-season *(any fixture `COMPLETED`)*

Full register: position, crest, name, ground, squad, form. Ordered by league
position.

### Pre-season *(no completed fixture)*

| Column | Behaviour |
|---|---|
| Position | **Removed entirely** — not shown as blank or as a dash |
| Form | **Removed entirely** |
| Squad | Retained where non-zero |
| Order | Alphabetical |
| Head line | "Sixteen clubs compete in the 2026 season. The season opens 26 July." |

The register narrows from six columns to four. It does not show empty columns
where competition data will later appear — an empty column is a promise the page
cannot keep.

### Partial season

Position and form appear as soon as a single match is complete. Clubs that have
not yet played show `—` in the form column, never an empty box.

---

## 16. EMPTY / INCOMPLETE STATE BEHAVIOUR

The production data is incomplete by design at this stage (audit Scope Note), so
this section is load-bearing rather than theoretical.

| Missing | Treatment |
|---|---|
| **Crest** | Quiet outlined monogram, per §11 |
| **Home ground** | `Ground TBC` in `neutral-500` — same size as a real ground, not a placeholder style |
| **Squad = 0** | Em dash `—`, right-aligned in the numeral column. Never `0 players`. |
| **Form, no matches** | `—` |
| **Manager** | Not shown on this page at all |
| **No clubs at all** | One sentence: "Clubs will be listed here once the league office registers them." No box, no illustration, no dashed border. |

### The governing rule

> **Incomplete data must make the register look *unfinished*, never *broken*.**

A register with fourteen grounds marked TBC is a league still organising itself.
Fourteen empty boxes with dashed borders is a website that does not work. The
difference is entirely in the treatment.

Critically: **the page must not be designed around today's gaps.** When all
sixteen grounds and squads are filled, the register should look its best — not
merely acceptable.

---

## 17. ACCESSIBILITY CONSIDERATIONS

| Concern | Requirement |
|---|---|
| Semantics | A real `<table>` with `<caption class="sr-only">`, `<th scope="col">` — the content is tabular and should be announced as such |
| Row linking | One `<a>` wrapping the club name, with the record clickable via that anchor; **never** a `<div onclick>` |
| Crest images | `alt=""` — decorative, since the club name is adjacent text. Fallback monogram `aria-hidden="true"`. |
| Form badges | `aria-label="Recent form: win, win, draw"`; letters themselves `aria-hidden` |
| Contrast | Ink on paper ≈ 15:1. `neutral-600` metadata on paper ≈ 5.9:1 — passes AA at 13px. Metadata must not go lighter than `neutral-600`. |
| Hover state | Ink fill with white text ≈ 15:1 — contrast holds in the hover state, which is where many designs fail |
| Focus | Visible 2px outline, never removed; focus order follows visual order |
| Touch | Records ≥ 44px tall at every breakpoint |
| Reduced motion | Colour transitions only; nothing to disable |
| Zoom | Register reflows to 320px without horizontal page scroll; if columns must scroll, they scroll inside their own container |

---

## 18. ANTI-AI-SLOP RULES

Tested against the required checklist.

| Test | Result |
|---|---|
| Does it look like a card grid? | **No** — one ruled register, records share edges |
| Does every item have the same visual box? | **No boxes at all** |
| Too many rounded rectangles? | **Zero** — nothing on this page has a radius except form badges at 2px |
| Is every section visually identical? | **No** — head, register and foot are three different objects; the page is deliberately dominated by one |
| Does it resemble a SaaS directory? | **No** — no filter bar, no search, no sort controls, no per-row action buttons, no avatars |
| Does it look like a generated component library? | **No** — the composition depends on a specific fact (16 clubs) that a generic solution would not exploit |
| Unnecessary decoration? | **None** — no icons, no illustrations, no dividers that divide nothing |
| Is hierarchy obvious without shadows? | **Yes** — scale, weight, rule weight and the crest column carry it |
| Does it feel like football? | **Yes** — crests, grounds, positions, form; ordered by league position |
| Does it feel like KNSCL? | **Yes** — sixteen real badges are the page's entire chroma |

### Prohibited outright

- Card, tile or panel per club
- Grid of equal cells
- Alternating row shading
- "View club →" repeated on every record
- Filter/sort/search UI
- Per-club colour theming
- Any shadow; any radius above 2px
- Icons beside metadata (a pin for the ground, a person for the squad)
- Cover images or club banners on the index
- Skeleton shimmer

---

## 19. IMPLEMENTATION GUARDRAILS

### Governing rule, unchanged

> **Improve hierarchy before decoration. Improve composition before components.
> Improve typography before effects.**

### Do

1. **Reuse the homepage system.** `ClubCrest` (with a new `register` variant),
   `Form`, the `home-*` rule and numeral conventions, existing tokens. Extend;
   do not fork.
2. **Scope new CSS under a `clubs-` prefix**, as the homepage used `home-`, so no
   other page inherits these decisions.
3. **Build the register as a real `<table>`.** The content is tabular.
4. **Derive season state from the data** — reuse the homepage's rule (any
   `COMPLETED` fixture), do not add a setting.
5. **Merge standings into the club list** at the data layer. `getPublicClubs()`
   and `getStandings()` both exist; the page needs position, form and squad
   count. No schema change, no new table, no new dependency.

### Do not

6. Do not create a generic `Card` or `ListItem` abstraction.
7. Do not modify the homepage, its components, or `components/public/index.tsx`
   in ways that alter other pages.
8. Do not change the database schema, the CMS, or production data.
9. Do not show manager name or **manager email** on this page.
10. Do not introduce pagination, filtering or sorting.
11. Do not add a hero, a banner image, or a statistics band.
12. Do not display a zero — squad `0` renders as `—`.
13. Do not let any breakpoint collapse the register into stacked cards.
14. Do not install dependencies.

### One flagged conflict, for your decision

An earlier brief explicitly required **"Manager's Name / Manager's Contact"** in
the club directory, and the club profile currently publishes the manager's email
address. This document recommends removing both from the public index on privacy
and editorial grounds — a Team Manager's personal email on a public page invites
scraping and is administrative rather than editorial content.

**This is your call, not mine.** The direction above assumes removal from the
index. If you want manager contact retained, say so and I will fold it into the
record as a fourth metadata field — but I would recommend a league office address
instead of a personal one.

---

## 20. VISUAL QA CHECKLIST

To be run before the Clubs page is considered done.

### Structure
- [ ] No club is rendered inside a card, tile or panel
- [ ] Records share hairlines with no gaps between them
- [ ] Nothing on the page has a radius above 2px
- [ ] Zero shadows
- [ ] The register is a semantic `<table>` with a screen-reader caption

### Hierarchy
- [ ] Club name is the largest element within a record
- [ ] Page title is the largest element on the page
- [ ] Ground, squad and position are visibly subordinate
- [ ] The crest column reads as a continuous vertical wall

### Crests
- [ ] Real crests are unframed and uncropped
- [ ] Differently shaped badges are normalised by bounding box, not by masking
- [ ] A real crest visibly dominates a fallback monogram in an adjacent record
- [ ] The crest column stays aligned at all three breakpoints

### Data states
- [ ] In-season: position and form present, ordered by position
- [ ] Pre-season: position and form columns absent entirely, ordered alphabetically
- [ ] Squad of zero renders `—`, never `0 players`
- [ ] Missing ground renders `Ground TBC`, not an empty cell
- [ ] Page looks correct with all 16 clubs complete, not merely with today's gaps

### Responsive
- [ ] 1440px — six columns, 84px records
- [ ] 768px — form dropped, ground on a second line
- [ ] 390px — records edge to edge, ~68px, crest column aligned
- [ ] No horizontal page scroll at 390px or at 320px
- [ ] Records ≥ 44px tall everywhere

### Interaction
- [ ] Whole record links to the club profile
- [ ] Hover fills the record to ink; the crest does not change
- [ ] Focus outline visible and never removed
- [ ] Only colour properties transition

### Privacy
- [ ] No manager name on the index
- [ ] **No email address anywhere on the index**
- [ ] No administrative or registration data exposed

### Regression
- [ ] Homepage unchanged
- [ ] Club profile page unchanged unless separately approved
- [ ] `npm run test` and `npm run build` pass
- [ ] Public pages remain server-rendered
