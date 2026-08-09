# KNSCL HOMEPAGE — VISUAL DIRECTION

**Date:** 9 August 2026
**Status:** Art direction. No implementation has been carried out.
**Governing documents:**
`.claude/skills/knscl-visual-design/SKILL.md` — design authority
`KNSCL_VISUAL_AUDIT.md` — problem set and scope
`KNSCL_HOMEPAGE_UX_DIRECTION.md` — approved information architecture

This document translates the approved architecture into a visual direction. It
introduces no external design system. It works inside the existing KNSCL tokens
and extends them only where the direction requires it.

---

## 1. VISUAL CONCEPT

### The problem, stated visually

A generated website has no point of view. It assembles: a hero, then containers,
then more containers, each softened with radius and shadow, each the same size,
each centred. Nothing is committed to. Nothing is at an extreme. The result is
competent and anonymous.

A designed page **commits to a device** — one structural idea it returns to, so
that the page could not be mistaken for another.

### The device — **THE BOARD**

KNSCL's homepage is a **matchday board**.

Not a metaphor for decoration — a structural principle. Think of the results
board outside a ground, a hand-ruled fixture list, a teamsheet, a league ladder
painted on a clubhouse wall. Football administration has its own visual culture,
and it is the opposite of software: it is **ruled, numerical, typographic, dense
and completely unornamented**.

Three principles follow, and they govern every decision in this document.

### Principle 1 — Ruled, not boxed

Structure comes from **hairlines and shared edges**, never from floating
containers. Cells touch. Rules divide. Nothing hovers.

> A box says "this is a component." A rule says "this is a record."

This alone removes the card-grid character the audit identifies in `H4`, `H5`
and `M4`, and it satisfies §12, §13 and §14 of the design direction at once.

### Principle 2 — The number is the image

KNSCL has no photography yet (`H6`). Rather than treat that as a deficiency to
be papered over with stock imagery, the direction makes a virtue of it:

> **Until photographs exist, the numerals are the visual content.**

The score, the league position, the points total, the kickoff time — set at
monumental scale, in tabular figures, with tight tracking — become the page's
imagery. A `2` set at 120px is a stronger visual object than a mediocre
photograph, and it is *honest to the subject*.

When photography arrives, it joins the composition rather than replacing it.

### Principle 3 — The clubs bring the colour

KNSCL has no official palette (`L4`), and inventing a louder one would be
decoration standing in for identity (§11, §25).

But the league already owns sixteen pieces of genuine colour: **the club crests.**
Bright, handmade, wildly inconsistent, unmistakably local — Bata Bullets' red
shield, Green Berrets' green disc, Mida Creek's blue, Kanani's purple.

> **The system stays ink, paper and teal. The clubs supply all the chroma.**

No decorative colour appears anywhere on the page. Every saturated pixel is
either a club crest, a match state, or the single teal accent. This is a real
identity decision, specific to KNSCL, and impossible to arrive at generically.

### The one-line summary

> **A ruled board, where numbers are the imagery and the clubs are the colour.**

---

## 2. ART DIRECTION — SECTION BY SECTION

### Full-page composition

```
┌═══════════════════════════════════════════════════════════════════┐
║  KILIFI COUNTY · KENYA                          CONTACT   SIGN IN ║  INK
║  ┌──┐                                                             ║
║  │KN│ KILIFI NORTH   FIXTURES RESULTS TABLE CLUBS PLAYERS   [⌕]  ║
║  └──┘ SUB COUNTY LEAGUE                                           ║
╠═══════════════════════════════════════════════════════════════════╣
║  MATCHDAY 04 · SUNDAY 9 AUGUST                          FULL TIME ║  INK
║                                              │                    ║
║   ┌──┐                                       │  NEXT              ║
║   │MU│  MALINDI UNITED                 2     │  ────────────────  ║
║   └──┘                                       │  WED 13 AUG        ║
║   ┌──┐                                       │  Watamu FC         ║
║   │MF│  MTWAPA FC                      0     │  Malindi United    ║
║   └──┘                                       │  15:00 · Watamu    ║
║                                              │                    ║
║   MALINDI MUNICIPAL STADIUM   MATCH REPORT → │  ALSO THIS ROUND   ║
║                                              │  Kanani    1–1 …   ║
║                                              │  Sokoke    3–1 …   ║
╠══════════════════════════════════════════════╧════════════════════╣
│  TABLE                                       │  LEADING SCORER    │  PAPER
│  ─────────────────────────────────────────   │  ────────────────  │
│   1  ⬤ Malindi United   1 1 0 0  +2     3    │  ⬤ Omar Salim     │
│   2  ⬤ Marereni United  1 1 0 0  +2     3    │     11  goals      │
│   3  ⬤ Sokoke Rangers   1 1 0 0  +2     3    │  ────────────────  │
│   4  ⬤ Kilifi Township  1 0 1 0   0     1    │   16  CLUBS        │
│   5  ⬤ Watamu FC        1 0 1 0   0     1    │   30  FIXTURES     │
│  FULL TABLE →                                │                    │
├──────────────────────────────────────────────┴────────────────────┤
│  CLUBS                                            ALL 16 CLUBS →  │  PAPER
│  ┌────────┬────────┬────────┬────────┬────────┬────────┐          │
│  │   ⬤    │   ⬤   │   ⬤   │   ⬤   │   ⬤   │   ⬤   │          │
│  │ 3 BROS │  BATA  │  BIG   │ BLACK  │ CHUGG  │ GREEN  │          │
│  ├────────┼────────┼────────┼────────┼────────┼────────┤          │
│  │   ⬤    │   ⬤   │   ⬤   │   ⬤   │   ⬤   │   ⬤   │          │
│  │ KANANI │ KIRIBA │ MGAND  │  MIDA  │ NGALA  │  PANA  │          │
│  └────────┴────────┴────────┴────────┴────────┴────────┘          │
├───────────────────────────────────────────────────────────────────┤
│  NEWS                                                NEWSROOM →   │  PAPER
│  ┌──────────────────────────────┐ │ LEAGUE NEWS                   │
│  │                              │ │ Second story headline sits    │
│  │      [  IMAGE  16:10  ]      │ │ here across two lines         │
│  │                              │ │ 7 AUG                         │
│  └──────────────────────────────┘ │ ───────────────────────────   │
│  LEAGUE NEWS                      │ ANNOUNCEMENTS                 │
│  A headline that runs             │ Third story headline          │
│  across two lines                 │ 6 AUG                         │
│  Standfirst sits here, quieter.   │ ───────────────────────────   │
│  8 AUGUST 2026                    │ …                             │
╠═══════════════════════════════════════════════════════════════════╣
║  KILIFI NORTH      COMPETITION    THE LEAGUE      CONTACT         ║  INK
║  SUB COUNTY LEAGUE Fixtures       Clubs           Kilifi, Kenya   ║
║                    Results        Players         info@knscl…     ║
║  ─────────────────────────────────────────────────────────────    ║
║  PARTNERS   ┌────────┬────────┬────────┐                          ║
║             │  LOGO  │  LOGO  │  LOGO  │                          ║
╚═══════════════════════════════════════════════════════════════════╝
```

*Illustrative. Proportions are directional, not measurements.*

### Section-by-section direction

| | **02 MATCHDAY** |
|---|---|
| **Visual purpose** | The event. The page's single monument. |
| **Composition** | Full-bleed ink. 12-col grid: match on cols 1–8, vertical hairline, rail on cols 9–12. Club names left-aligned; numerals in a locked right-hand column. |
| **Relative size** | ~55–60% of first viewport. Largest section on the page. |
| **Typography** | Score at `clamp(72px, 11vw, 128px)` / 800 / tracking `-0.05em` / tabular. Club names at `clamp(20px, 2.6vw, 32px)` / 700. Labels at 11px uppercase. |
| **Image treatment** | Optional ground photograph at low luminance behind the ink, using the existing overlay technique. Must look finished with none. |
| **Colour** | Ink ground, white type, crests supply colour. Status label in teal, or `--color-live` red when live. |
| **Density** | Spacious. The most generous section on the page. |
| **Alignment** | Club names flush left; numerals flush right in a fixed column so both scores align perfectly. |
| **Relationship** | Runs directly out of the masthead with no gap — one uninterrupted ink field from the top of the page. |
| **Desktop** | Two-part split at 8/4. |
| **Mobile** | Rail moves below. Score scales *up* proportionally. Stacked layout survives untouched — see §11. |

| | **03 COMPETITION** |
|---|---|
| **Visual purpose** | League infrastructure. The page's density peak. |
| **Composition** | Paper ground. Table on cols 1–8, vertical hairline, rail on cols 9–12 carrying leading scorer and season figures. |
| **Relative size** | ~25% of page height. |
| **Typography** | Header row 11px uppercase. Body 14px. Points 17px / 800 / tabular. Position 14px tabular, neutral. |
| **Image treatment** | None. Crests at 22px inline only. |
| **Colour** | Paper. Form badges carry win/draw/loss. Nothing else. |
| **Density** | **Highest on the page.** Deliberately un-softened. |
| **Alignment** | Numeric columns right-aligned, tabular figures, fixed widths so digits never shift. |
| **Relationship** | Hard cut from ink to paper. The contrast *is* the section break — no divider needed. |
| **Desktop** | 8/4 split, mirroring Matchday so the page has a spine. |
| **Mobile** | Rail below table; table drops optional columns. |

| | **04 CLUBS** |
|---|---|
| **Visual purpose** | Identity. Proof the competition is real. The page's only chroma. |
| **Composition** | One ruled matrix, edge to edge within the container. |
| **Relative size** | ~15%. Two rows of six on desktop. |
| **Typography** | Club names 11px / 600 / uppercase / `0.06em`. Deliberately small so crests dominate. |
| **Image treatment** | Crests at 44–52px, centred, unmodified. Never cropped, never circle-masked, never recoloured. |
| **Colour** | Paper cells; **all colour comes from the crests**. |
| **Density** | High, even, rhythmic. |
| **Alignment** | Centred within cells; cells on a strict modular grid. |
| **Relationship** | Sits between two typographic sections as a visual palate-cleanser. |
| **Desktop** | 6 across. |
| **Mobile** | 3 across, crest 40px, name 10px. |

| | **05 NEWS** |
|---|---|
| **Visual purpose** | The page's editorial voice and its emotional register. |
| **Composition** | Asymmetric 7/5 split with a vertical hairline. |
| **Relative size** | ~20%. |
| **Typography** | Lead headline `clamp(28px, 3.4vw, 44px)` / 700. Secondary 17px / 600. Meta 12px. |
| **Image treatment** | Lead only. 16:10, hard-cropped, 2px radius maximum. Secondary stories carry no images — restraint is what makes the lead read as the lead. |
| **Colour** | Paper. Category eyebrows in teal. |
| **Density** | Split — spacious left, dense right. |
| **Alignment** | Both columns flush left; hairline between. |
| **Relationship** | The only section where an image may dominate. |
| **Desktop** | 7/5. |
| **Mobile** | Lead full width, list below. |

| | **06 THE LEAGUE** |
|---|---|
| **Visual purpose** | Institutional close. |
| **Composition** | Ink ground, four dense link columns, partner row beneath a hairline. |
| **Relative size** | ~10%. |
| **Typography** | Column labels 10px uppercase `0.14em`. Links 14px. |
| **Image treatment** | Partner logos only, in ruled cells, greyscale until hover. |
| **Colour** | Ink. |
| **Density** | High. |
| **Relationship** | Closes on the ground the page opened on. |

---

## 3. GRID & COMPOSITION

### Three width modes — not one container

The audit's `M4` and §6 failure is that *every* section sits in the same box. The
fix is structural: the page has three width modes, and sections choose one.

```
FULL BLEED   ├───────────────────────────────────────────────────┤   100vw
             Matchday ground · footer ground · section grounds

CONTAINED    │      ├─────────────────────────────────────┤      │   1240px
             Matchday content · competition · clubs · news

MEASURE      │              ├─────────────────┤                  │   660px
             Long-form copy only (not used on the homepage)
```

The **ground** is full-bleed; the **content** is contained. That is what allows a
dark section to reach the window edge while its type stays aligned with everything
else — the single most important compositional mechanic on the page.

### Column grid

| | Desktop ≥1024 | Tablet 640–1023 | Mobile <640 |
|---|---|---|---|
| Columns | 12 | 8 | 4 |
| Gutter | 24px | 20px | 16px |
| Outer margin | 32px | 24px | 20px |
| Max content | 1240px | — | — |

### The spine

Two sections share an **8 / 4 split with a vertical hairline** — Matchday and
Competition. This repetition is intentional: it gives the upper page a consistent
spine, so Clubs (full 12) and News (7/5) read as deliberate departures rather
than as inconsistency.

```
02 MATCHDAY      ████████████████████████████│████████████     8 / 4
03 COMPETITION   ████████████████████████████│████████████     8 / 4
04 CLUBS         ████████████████████████████████████████     12
05 NEWS          ████████████████████████│████████████████     7 / 5
```

### Vertical rhythm

Section padding is **not** uniform — uniform padding is what makes a page feel
like a stack of components.

| Section | Top/bottom padding | Rationale |
|---|---|---|
| Matchday | 64 / 56px | The monument needs air |
| Competition | 56 / 56px | Dense content, moderate frame |
| Clubs | 48 / 48px | Compact |
| News | 56 / 64px | Editorial breathing room |
| The League | 56 / 32px | Closes down |

### Section breaks

Breaks are made by **ground change**, then by rule, and never by a gap alone.

```
Masthead    ▓▓▓ ink
Matchday    ▓▓▓ ink        ← no break: one continuous field
Competition ░░░ paper      ← hard cut. The contrast is the break.
Clubs       ░░░ paper      ← 1px rule + label
News        ░░░ paper      ← 1px rule + label
The League  ▓▓▓ ink        ← hard cut
```

---

## 4. MATCHDAY VISUAL DIRECTION

The most important composition on the site. It must feel like an **event**, not a
database row.

### The core decision — a board, not a mirror

Almost every football site centres the match: `HOME — score — AWAY`, mirrored
about an axis. It is the expected solution, and it has two costs: it wastes the
horizontal centre of a wide screen, and it collapses badly on mobile, where the
crests and names get squeezed toward the middle.

KNSCL does the opposite:

> **Clubs stack. Names run flush left. Scores lock into a single flush-right
> numeral column.**

```
   ┌──┐                                    ╷
   │MU│   MALINDI UNITED               2   │
   └──┘                                    │  ← numerals share one
   ┌──┐                                    │     flush-right column
   │MF│   MTWAPA FC                    0   │
   └──┘                                    ╵
```

This gives four things a mirrored layout cannot:

1. **A vertical numeral column** — two enormous digits stacked, forming a strong
   compositional edge on the right. This is the "board" reading.
2. **Perfect mobile survival.** The layout is already vertical; it needs no
   restructuring at any width.
3. **Long club names cause no problem.** "Kilifi Township FC" and "Tezo Stars
   Junior" have room to breathe instead of colliding with a centred score.
4. **It is not what everyone else does.** That matters.

### The numeral column never empties

The mechanism that makes one composition serve both season states:

| State | Numeral column holds |
|---|---|
| **B — result** | The two scores. `2` / `0` |
| **B — upcoming** | Kickoff time. `15:00` |
| **A — pre-season** | Kickoff time of the opening fixture. `15:00` |

The composition is **identical** in every state. Only the content of the numeral
column changes. There is no second layout, no empty state, and nothing to hide.

### Anatomy

```
┌─ MATCHDAY 04 · SUNDAY 9 AUGUST ────────────── FULL TIME ─┐  ① eyebrow rail
│                                                          │
│   ┌────┐                                                 │
│   │ MU │   MALINDI UNITED                       2        │  ② the board
│   └────┘                                                 │
│   ┌────┐                                                 │
│   │ MF │   MTWAPA FC                            0        │
│   └────┘                                                 │
│                                                          │
│   ──────────────────────────────────────────────         │  ③ hairline
│   MALINDI MUNICIPAL STADIUM          MATCH REPORT →      │  ④ footing
└──────────────────────────────────────────────────────────┘
```

**① Eyebrow rail** — 11px uppercase, `0.14em` tracking, 62% white. Round and date
left; status right. Status is the only place `--color-live` red appears.

**② The board** — crest 56px at 2px radius (a plate, not a circle); club name
`clamp(20px, 2.6vw, 32px)` / 700 / tracking `-0.02em`; numeral
`clamp(72px, 11vw, 128px)` / 800 / tracking `-0.05em` / tabular.

The losing side recedes to 60% white — the winner is not shouted, the loser is
quieted. This is already the established KNSCL treatment and should be preserved.

**③ Hairline** — `rgb(255 255 255 / 0.14)`.

**④ Footing** — venue 13px uppercase; match report link right, in `accent-300`.

### Negative space

The single most important instruction for this section:

> **Leave the area beneath the club names empty.**

The temptation will be to fill it — with a stat strip, a form guide, a ticket
call-to-action. Do not. The monument requires silence around it. An empty lower
third is what separates an event from a data row.

### Background treatment

- **Default:** flat ink `#0c1613`. No gradient, no texture, no pattern.
- **With photography:** a ground image at `linear-gradient(rgb(12 22 19 / 0.88),
  rgb(12 22 19 / 0.94))` over `cover`/`center` — the technique already proven on
  club pages. Type contrast is unaffected either way.
- **Never:** a gradient used decoratively, a mesh, a blur, an abstract shape.

---

## 5. TYPOGRAPHY HIERARCHY

Families are unchanged: **Archivo** (display, numerals) and **IBM Plex Sans**
(text, labels). The direction is in the *scale relationships*, not new fonts.

### The governing decision — section headings get smaller

The current build sets section headings at 32px, competing with the data beneath
them. That is the "oversized headings" failure in §9 of the design direction.

> **Section headings become 13px uppercase labels.**

A sports publication labels its sections quietly and lets the content be loud.
"LATEST RESULTS" at 13px above a score at 128px is a hierarchy. Both at 32px is
a stack.

### The scale — extremes, with a gap in the middle

```
128 ████████████████████████████████  score / primary numeral
 56 ██████████████                    state-A stat numerals
 44 ██████████                        news lead headline
 32 ███████                           match club names
 17 ███                               points · secondary headlines
 14 ██                                table body · links
 13 ██                                SECTION LABELS
 11 █                                 eyebrows · metadata · status
```

Very large and very small, with deliberately little between 17 and 32. Generated
pages cluster everything between 14 and 32 — that cluster is precisely what makes
them read as generated.

### Roles

| Role | Family | Size | Weight | Treatment |
|---|---|---|---|---|
| Masthead wordmark | Archivo | 17 | 800 | uppercase, `-0.02em` |
| Masthead sub-lockup | IBM Plex | 10 | 600 | uppercase, `0.14em`, teal |
| Navigation | Archivo | 13 | 600 | uppercase, `0.06em` |
| **Match score / numeral** | Archivo | `clamp(72,11vw,128)` | 800 | **tabular, `-0.05em`** |
| Match club name | Archivo | `clamp(20,2.6vw,32)` | 700 | `-0.02em` |
| Matchday label / status | IBM Plex | 11 | 700 | uppercase, `0.14em` |
| **Section label** | Archivo | 13 | 700 | uppercase, `0.12em` |
| News lead headline | Archivo | `clamp(28,3.4vw,44)` | 700 | `-0.025em`, leading 1.08 |
| News secondary headline | Archivo | 17 | 600 | `-0.01em` |
| Table points | Archivo | 17 | 800 | tabular, right |
| Table body | IBM Plex | 14 | 500 | tabular for numerics |
| Table position | Archivo | 14 | 700 | tabular, neutral-600 |
| Club name (crest wall) | IBM Plex | 11 | 600 | uppercase, `0.06em` |
| State-A stat numeral | Archivo | `clamp(32,5vw,56)` | 800 | tabular, `-0.04em` |
| Metadata | IBM Plex | 12 | 500 | neutral-600 |

### Numeral treatment — the signature

Every numeral on the page uses **tabular figures** and **negative tracking that
increases with size**:

| Size | Tracking |
|---|---|
| ≥72px | `-0.05em` |
| 32–56px | `-0.04em` |
| 17–24px | `-0.02em` |
| ≤14px | `0` |

Large numerals set tight read as a designed mark. Large numerals at default
tracking read as unstyled text. This is the difference between a scoreboard and
a spreadsheet, and it costs one CSS property.

### Prohibitions

- No third font family.
- No weight below 500 for Archivo (the loaded range is 500–800).
- No heading larger than the score, anywhere on the page.
- No italic. No letter-spaced lowercase. No text shadow. No gradient text.

---

## 6. COLOUR STRATEGY

### The palette — unchanged, but re-governed

| Token | Value | Role |
|---|---|---|
| `--color-ink` | `#0c1613` | Structural dark. Grounds. |
| `--color-bg` | `#f6f5f2` | Warm paper. Never pure white. |
| `--color-surface` | `#ffffff` | Cells that must lift off paper. |
| `--color-divider` | `#d9d6cf` | Every hairline. |
| `--color-accent` | `#0d6e5e` | League teal. Links, active states. |
| `--color-accent-2` | `#b07d10` | Gold. Emphasis only. |
| `--color-win/draw/loss` | teal / grey / red | Match state only. |
| `--color-live` | `#c8102e` | Live status only. |

### The rules

**1. Colour is structural, never decorative.**
Ink and paper define zones. Teal marks interaction. Gold marks the current
section. Match-state colours encode outcome. There is no fifth job for colour.

**2. Two accents maximum per viewport.**
If teal and gold are both visible, no third accent may appear.

**3. The crests are the chroma.**
Every saturated pixel on the page is a club crest, a form badge, or a live
indicator. Nothing else is coloured. This is the identity decision — see §1.

**4. Grounds carry sections; boxes do not.**
A section is dark or light. It is not a coloured card.

### Surface strategy

| Surface | Treatment |
|---|---|
| Section ground | Ink or paper, full-bleed |
| Table rows | Transparent on paper; 1px bottom hairline |
| Crest cells | White on paper, shared hairlines |
| News lead | No container — image, then type on paper |
| Partner cells | White, shared hairlines |
| Cards | **Only for a news story.** Nothing else on this page. |

### Radius

| Element | Radius |
|---|---|
| Structural cells, bands, rows, rules | **0** |
| Crest plates, score chips, form badges | **2px** |
| News image | **2px** |
| Buttons | **3px** |
| Anything else | **0** |

Nothing on this page exceeds 3px. Consistency matters more than softness (§13).

### Shadow

**None. Zero shadows on the homepage.**

Elevation is communicated by ground change and rule weight. `--shadow-*` tokens
are not to be used in homepage work (§14).

---

## 7. CREST WALL DIRECTION

### What it must not be

```
┌──────────┐  ┌──────────┐  ┌──────────┐      ✗  sixteen cards
│  ⬤       │  │  ⬤       │  │  ⬤       │      ✗  gaps between them
│  Club    │  │  Club    │  │  Club    │      ✗  radius and shadow
│  Manager │  │  Manager │  │  Manager │      ✗  label/value lists
└──────────┘  └──────────┘  └──────────┘
```

### What it is

**One object, made of sixteen parts.** Cells share hairlines; there are no gaps.
The wall reads as a single ruled matrix — a competition directory.

```
CLUBS                                              ALL 16 CLUBS →
┌────────┬────────┬────────┬────────┬────────┬────────┐
│¹       │²       │³       │⁴       │⁵       │⁶       │
│   ⬤    │   ⬤   │   ⬤   │   ⬤   │   ⬤   │   ⬤   │
│ 3 BROS │  BATA  │  BIG   │ BLACK  │ CHUGG  │ GREEN  │
├────────┼────────┼────────┼────────┼────────┼────────┤
│⁷       │⁸       │⁹       │¹⁰      │¹¹      │¹²      │
│   ⬤    │   ⬤   │   ⬤   │   ⬤   │   ⬤   │   ⬤   │
│ KANANI │ KIRIBA │ MGAND  │  MIDA  │ NGALA  │  PANA  │
├────────┼────────┼────────┼────────┼────────┼────────┤
│¹³      │¹⁴      │¹⁵      │¹⁶      │        │        │
│   ⬤    │   ⬤   │   ⬤   │   ⬤   │        │        │
│  REAL  │ TAKAU  │  TEZO  │ YOUNG  │        │        │
└────────┴────────┴────────┴────────┴────────┴────────┘
```

### Specification

| Property | Value |
|---|---|
| Structure | `border-top` + `border-left` on the container; `border-right` + `border-bottom` on each cell. No gap. |
| Cell ratio | ~1 : 0.85 — near-square, so it reads as a matrix, not a strip |
| Crest | 44–52px, centred, unmodified, 2px radius plate |
| Club name | 11px / 600 / uppercase / `0.06em` / neutral-700 |
| Position indicator | In State B only: league position as a small tabular numeral, top-left, neutral-400 |
| Ground | `--color-surface` on `--color-bg` |
| Columns | 6 desktop · 4 tablet · 3 mobile |

### Hover — "the board flips"

```
resting                    hover
┌────────┐                ┌────────┐
│   ⬤    │      →         │███⬤███ │   cell ground → ink
│ 3 BROS │                │▓3 BROS▓│   name → white
└────────┘                └────────┘   crest unchanged
```

Background and text colour transition over **120ms**. No lift, no scale, no
shadow, no border colour change. The cell *fills*, like a flipping board tile.

### Why the position indicator matters

Adding the league position turns a directory into a **competition** object. It
also does quiet double duty: it means the crest wall carries standings
information, reinforcing the Competition section above it rather than repeating it.

Omitted pre-season, when position is meaningless.

### Mobile

3 across, crest 40px, name 10px. Never a horizontal scroller — the wall's value
is seeing the whole competition at once.

---

## 8. COMPETITION SECTION DIRECTION

### The principle — one object, not five stat cards

The audit records isolated statistic cards as a failure (`M4`). The competition
area must read as **league infrastructure**: a single ruled instrument.

### State B — active season

```
TABLE                                    │  LEADING SCORER
─────────────────────────────────────────│  ─────────────────────
 #  CLUB              P  W  D  L  GD  PTS│   ⬤  Omar Salim
─────────────────────────────────────────│      Malindi United
 1  ⬤ Malindi United  1  1  0  0  +2   3 │      11  goals
════════════════════════════════════════ │  ─────────────────────
 2  ⬤ Marereni United 1  1  0  0  +2   3 │   16  CLUBS
 3  ⬤ Sokoke Rangers  1  1  0  0  +2   3 │   30  FIXTURES
 4  ⬤ Kilifi Township 1  0  1  0   0   1 │    4  PLAYED
 5  ⬤ Watamu FC       1  0  1  0   0   1 │
─────────────────────────────────────────│
FULL TABLE →                             │
```

- **No card.** The table sits directly on paper.
- Header row: 11px uppercase, neutral-600, 2px ink bottom rule.
- Rows: 1px divider hairline. Leader row closes with a **2px ink rule** — the
  leader is marked by structure, not by a coloured wash.
- Points column: 17px / 800 / tabular / right-aligned, widest visual weight.
- Numeric columns: fixed widths, tabular figures — digits never shift between rows.
- Right rail separated by a **vertical hairline**, not by a gap.

### State A — pre-season

Same slot, same rails, same hairline. The table is replaced by a **numeral band**:

```
THE SEASON                               │  FIRST MATCHDAY
─────────────────────────────────────────│  ─────────────────────
                                         │
  16          30          13             │   SUNDAY
  CLUBS       FIXTURES    PLAYERS        │   9 AUGUST
                                         │   2026
─────────────────────────────────────────│
FIXTURE LIST →                           │
```

Numerals at `clamp(32px, 5vw, 56px)` / 800 / tabular. Labels at 11px uppercase.

**Every figure shown is non-zero.** Any statistic evaluating to zero is omitted
entirely rather than displayed — the rule from the UX direction, enforced here.

### Why this works across both states

Identical grid, identical rails, identical hairline, identical typographic roles.
Only the content of the left column changes. No second template.

---

## 9. EDITORIAL / NEWS DIRECTION

### Composition — asymmetric, hairline-divided

```
NEWS                                              NEWSROOM →
──────────────────────────────────────────────────────────────
┌────────────────────────────────┐ ╷
│                                │ │  LEAGUE NEWS
│      [   IMAGE   16:10   ]     │ │  Second story headline
│                                │ │  runs to two lines here
└────────────────────────────────┘ │  7 AUG
                                   │  ──────────────────────
LEAGUE NEWS                        │  ANNOUNCEMENTS
A headline that runs across        │  Third story headline
two or three lines at scale        │  6 AUG
                                   │  ──────────────────────
Standfirst sits here, quieter      │  MATCH REPORT
and shorter, two lines at most.    │  Fourth story headline
                                   │  5 AUG
8 AUGUST 2026                      ╵
        ← 7 cols →                     ← 5 cols →
```

### Rules

**One image only.** The lead story carries a photograph; the secondary stories
carry none. Restraint is what makes the lead read as the lead — four images of
equal size is a card grid wearing a different name.

**Headline scale carries the hierarchy.** 44px against 17px. Not colour, not a
badge, not a border.

**Hairline, not gap.** A vertical rule divides the columns, in keeping with the
board principle.

### Designing for photography that does not exist yet

The composition must be complete **now** and better **later** — no redesign when
real images arrive.

```
WITH IMAGE                          WITHOUT IMAGE
┌──────────────────┐                ══════════════════   ← 3px ink rule
│   [  IMAGE  ]    │                LEAGUE NEWS
└──────────────────┘                A headline that runs
LEAGUE NEWS                         across two lines at
A headline that runs                slightly larger scale
across two lines
```

Without an image, the lead takes a **3px ink rule above it** and its headline
steps up from 44px to 48px. The story carries itself typographically. This
pattern is already implemented (`.story-textled`) and should be retained.

**Never** substitute stock photography, an illustration, a pattern or a coloured
block for a missing image. An honest typographic lead is stronger than a
dishonest picture.

### Image treatment when photography exists

- 16:10, hard crop, 2px radius maximum.
- Documentary crops — subject may bleed off-frame. Faces need not be centred.
- No filters, no duotone, no overlay except where type sits on the image.
- Never decorative. If an image does not add information or emotion, omit it.

---

## 10. PHOTOGRAPHY DIRECTION

### Ranked slots

| # | Slot | Treatment | Degrades to |
|---|---|---|---|
| 1 | Matchday ground | Full-bleed, ink overlay at 88–94% | Flat ink |
| 2 | News lead | 16:10, contained, hard crop | 3px rule + larger headline |
| 3 | Season feature *(optional)* | Full-bleed band between Competition and Clubs | Section omitted entirely |
| 4 | Club page banner | Already implemented | Flat ink |

### Subject direction

Kilifi grounds · matchday crowds · players in club colours · coaches on the
touchline · youth football · training · celebration · the coast where it is
visible. **Documentary, not advertising** (§10).

### Absolute rules

- **No stock photography.** Ever. It reintroduces exactly the quality being removed.
- **No image to fill space.**
- **Every slot must look finished with no image.**
- One image per section maximum.

Until real photographs exist, the crest wall and the numerals carry the page.
That is by design, not by compromise.

---

## 11. MOBILE COMPOSITION

Mobile is the majority case and is not a narrowed desktop (§17).

### What remains dominant

**The Matchday board.** Its share of the viewport *increases* on mobile. The
score does not shrink below 72px; it scales with `vw` and remains the largest
object on the screen at every width.

```
┌─────────────────────────┐
│ MD 04 · SUN 9 AUG   FT  │  ← eyebrow condenses
│                         │
│  ┌──┐                   │
│  │MU│ MALINDI      2    │  ← unchanged structure
│  └──┘ UNITED            │     names wrap, numerals hold
│  ┌──┐                   │
│  │MF│ MTWAPA FC    0    │
│  └──┘                   │
│                         │
│  MALINDI MUNICIPAL      │
│  MATCH REPORT →         │
├─────────────────────────┤
│ NEXT · WED 13 AUG       │  ← rail moves below
│ Watamu v Malindi 15:00  │
└─────────────────────────┘
```

**This is the payoff of the stacked board.** A mirrored layout would have to be
rebuilt for mobile; this one simply narrows.

### Per-section behaviour

| Section | Behaviour |
|---|---|
| Masthead | Wordmark + menu; search into drawer *(implemented)* |
| Matchday | Rail moves below; score scales up proportionally; structure unchanged |
| Competition | Rail below table; table drops W/D/L/GF/GA; form hidden <480px |
| Competition (State A) | Numerals become a 2×2 grid |
| Clubs | 6 → 3 columns; crest 40px, name 10px; **never a scroller** |
| News | Lead full width; secondary list below |
| The League | 4 → 2 → 1 columns |

### What becomes denser

Section padding tightens from 56–64px to 32–40px. Mobile users scroll; excessive
whitespace costs them more than it costs desktop users (§16).

### What disappears

Referee names · founding years · form strips below 480px · the position indicator
on crest cells. **Metadata goes before content goes.**

### Hard rules

- No horizontal page overflow at any width. The table scrolls inside its own
  container; the body never does.
- Touch targets ≥44px — especially crest cells, the primary route for supporters.
- The score is never smaller than 72px.

---

## 12. INTERACTION & MOTION DIRECTION

Motion communicates meaning or it does not exist (§18).

### Permitted

| Interaction | Behaviour | Duration |
|---|---|---|
| Crest cell hover | Ground → ink, name → white | 120ms |
| Table row hover | Ground → neutral-100 | instant |
| Match row hover | Border colour → accent | 140ms |
| Link hover | Colour change only | 140ms |
| Nav hover | Underline rule appears | 120ms |
| Focus | 2px gold outline, 1px offset | instant |

### Forbidden

Card lift on hover · scale transforms · scroll-triggered reveals · parallax ·
fade-in on load · animated counters · carousels · auto-advancing content ·
skeleton shimmer on the homepage · anything over 200ms.

### The budget

> **Only `color`, `background-color` and `border-color` may transition.
> Nothing moves. Nothing scales. Nothing fades.**

A board does not animate. It changes state.

`prefers-reduced-motion` is already honoured globally and must remain so.

---

## 13. ANTI-PATTERNS — WHAT WE ARE NOT BUILDING

Explicit prohibitions for implementation.

### Structure
- ✗ Generic SaaS dashboard layout
- ✗ Hero → 3 cards → 3 cards → 3 cards → news → footer
- ✗ Repetitive card grids
- ✗ Template-like three-column sections
- ✗ Every section inside a container
- ✗ Uniform section padding throughout
- ✗ A replacement hero of any kind

### Containers
- ✗ Excessive rounded cards
- ✗ Anything above 3px radius
- ✗ Everything inside cards
- ✗ Floating cards
- ✗ Glassmorphism
- ✗ Shadows of any kind on this page

### Colour
- ✗ Gradient backgrounds
- ✗ Gradient text
- ✗ Glowing or blurred backgrounds
- ✗ Colourful cards
- ✗ More than two accents in one viewport
- ✗ Decorative colour of any kind

### Decoration
- ✗ Decorative blobs
- ✗ Random geometric shapes
- ✗ Abstract backgrounds
- ✗ Decorative lines that divide nothing
- ✗ Generic icon grids
- ✗ Excessive pills or badges

### Content presentation
- ✗ Generic avatar grids
- ✗ Circle-cropped players presented as user accounts
- ✗ Oversized marketing copy
- ✗ Two CTA buttons under a headline
- ✗ Statistics displayed as zero
- ✗ Empty-state boxes as top-level page content
- ✗ Stock photography

### Typography
- ✗ Oversized headings used to create hierarchy
- ✗ A third font family
- ✗ Section headings larger than the score
- ✗ Everything clustered between 14px and 32px

---

## 14. IMPLEMENTATION PRINCIPLES

### The three tests

Before any element is added, it must pass all three:

1. **The rule test.** Could this be a rule instead of a box? If yes, make it a rule.
2. **The removal test.** If this visual effect were removed, would the interface
   be clearer? If yes, remove it (§5).
3. **The extreme test.** Is this element at an extreme of the scale — very large
   or very small? If it sits in the middle with everything else, it is not
   carrying hierarchy.

### Order of work

Following §23 — remove, reorganise, improve type and spacing, compose, then
introduce imagery.

1. Remove the hero, the standalone player grid, the misplaced stat band.
2. Establish the grid: three width modes, 12 columns, the 8/4 spine.
3. Set the type scale — **section labels down to 13px first**, before anything
   else is built. It reframes every other decision.
4. Build the Matchday board. Get the numeral column right before moving on.
5. Build Competition, both states, on the same rails.
6. Build the crest wall.
7. Refine News to the 7/5 hairline split.
8. Fold The League into the footer region.
9. Responsive pass against §11.
10. Verify both season states against real data.

### Reuse before creation

The existing system already provides `.bleed` / `.bleed-inner`, `.on-dark`,
`.list-rule`, `.stat-band`, `.table-standings`, `.form-badge`, `.story*` and the
`--font-numeric` / `.num` tabular treatment. Extend these. **Do not create a
parallel set of classes**, and do not introduce a dependency, icon set or design
system.

### Preserve

Routes · data · the private-field boundary in `lib/public-data.ts` · server
rendering of public pages · existing dashboards, which share these tokens.

### Definition of done

- Renders correctly with zero completed fixtures, and with completed fixtures.
- No zero-value statistic appears in either state.
- No section is a repeated card grid.
- No shadow anywhere on the page.
- No radius above 3px.
- No heading larger than the score.
- No horizontal overflow at 390px.
- Only colour properties transition.
- `npm run test` and `npm run build` pass.

---

## Appendix — Summary of visual decisions

| Decision | Rationale |
|---|---|
| **The board** as the governing device | Football administration has its own visual culture — ruled, numerical, unornamented. It is the opposite of SaaS. |
| Ruled, never boxed | Removes the card-grid character in one structural move |
| Numbers as imagery | Honest response to having no photography; a `2` at 128px beats a mediocre photo |
| Crests as the only chroma | KNSCL's real, specific, unrepeatable colour asset |
| Stacked board, not mirrored score | Creates a vertical numeral column; survives mobile untouched; not what everyone else does |
| Numeral column never empties | One composition serves both season states |
| Section labels drop to 13px | Stops headings competing with data — the key anti-slop typographic move |
| Type at extremes, gap in the middle | The 14–32px cluster is what makes pages read as generated |
| Zero shadows | Elevation by ground change and rule weight only |
| Three width modes | Allows editorial composition instead of one repeated container |
| 8/4 spine, then departures | Repetition establishes a rhythm; Clubs and News read as deliberate variation |
| Empty space beneath the score | An event needs silence around it; a data row does not |
| Only colour properties transition | A board changes state; it does not animate |
