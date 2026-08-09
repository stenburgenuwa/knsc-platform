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
| **Composition** | Full-bleed ink. 12-col grid: match on cols 1–8, vertical hairline, rail on cols 9–12. Within the match: **club → score/status → club**, the status always centred between the clubs. |
| **Relative size** | ~55–60% of first viewport. Largest section on the page. |
| **Typography** | Score at `clamp(72px, 11vw, 128px)` / 800 / tracking `-0.05em` / tabular. Club names at `clamp(20px, 2.6vw, 32px)` / 700. Labels at 11px uppercase. |
| **Image treatment** | Optional ground photograph at low luminance behind the ink, using the existing overlay technique. Must look finished with none. |
| **Colour** | Ink ground, white type, crests supply colour. Status label in teal, or `--color-live` red when live. |
| **Density** | Spacious. The most generous section on the page. |
| **Alignment** | Symmetrical about the score. Crests and club names balanced either side; the numeral optically centred. |
| **Relationship** | Runs directly out of the masthead with no gap — one uninterrupted ink field from the top of the page. |
| **Desktop** | Two-part split at 8/4; match on a horizontal axis. |
| **Mobile** | Rail moves below. Match axis rotates to vertical, keeping club → score → club order and the score central. Score scales *up* proportionally — see §11. |

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

### The core decision — the status always sits between the clubs

*Revised 9 August 2026 following design validation. See §15.4 for the reasoning
behind the change from the earlier flush-right variant.*

The hero match expresses one relationship, and it must be legible at every width:

> **CLUB → SCORE / STATUS → CLUB**

The score or status is **always the centre of the composition**, physically
between the two clubs. This is how a fan says a fixture aloud, and it is what
makes the block read as a *match* rather than as a list entry.

What changes across breakpoints is the **axis**, not the arrangement.

```
DESKTOP — horizontal axis
   ┌────┐                                      ┌────┐
   │ MU │            2  —  0                   │ MF │
   └────┘                                      └────┘
 Malindi United                              Mtwapa FC


MOBILE — vertical axis, identical order
   ┌────┐  Malindi United
   └────┘
   ══════════   2 — 0   ══════════        ← status band, still central
   ┌────┐  Mtwapa FC
   └────┘
```

This is **not** a stacked card layout. The three parts keep their order and the
centre element keeps its dominance; only the reading axis rotates. Nothing is
re-parented, nothing is hidden, and the score never leaves the middle.

### The centre never empties

The mechanism that lets one composition serve both season states:

| State | Centre holds | Example |
|---|---|---|
| **B — full time** | The score | `2 — 0` |
| **B — upcoming** | Kickoff time | `15:00` |
| **B — live** | Live score + minute | `1 — 1` · `67'` |
| **A — pre-season** | Opening fixture kickoff | `15:00` |

The composition is **identical** in every state. Only the content of the centre
changes. There is no second layout, no empty state, and nothing to hide.

### Where the flush-right numeral column survives

The earlier flush-right treatment is not discarded — it moves to where it is
genuinely superior. **Secondary match lists** (the "also this round" rail, the
fixtures and results pages) keep club names flush left with scores locked into a
single right-hand numeral column, because that is what makes a *list* scannable:
every score in one vertical line.

```
HERO MATCH          club → score → club        (centred, monumental)
MATCH LISTS         club ............ score    (flush-right column, scannable)
```

Two treatments, each doing the job it is best at — and together they form part of
the KNSCL signature described in §15.3.

### Anatomy — desktop

```
┌─ MATCHDAY 04 · SUNDAY 9 AUGUST ────────────── FULL TIME ─┐  ① eyebrow rail
│                                                          │
│                                                          │
│    ┌──────┐                              ┌──────┐        │
│    │  MU  │        2   —   0             │  MF  │        │  ② the match
│    └──────┘                              └──────┘        │
│  Malindi United                        Mtwapa FC         │
│                                                          │
│                                                          │
│   ──────────────────────────────────────────────         │  ③ hairline
│   MALINDI MUNICIPAL STADIUM          MATCH REPORT →      │  ④ footing
└──────────────────────────────────────────────────────────┘
```

**① Eyebrow rail** — 11px uppercase, `0.14em` tracking, 62% white. Round and date
left; status right. Status is the only place `--color-live` red appears.

**② The match** — crest **72–88px** at 2px radius (a plate, not a circle); club
name `clamp(18px, 2.2vw, 28px)` / 700 / tracking `-0.02em`, **title case, never
uppercase**; numeral `clamp(72px, 11vw, 128px)` / 800 / tracking `-0.05em` /
tabular.

Crests are deliberately large. They carry identity, colour and football all at
once — the three things a ruled page is otherwise short of (see §15.2).

The losing side recedes to 60% white — the winner is not shouted, the loser is
quieted. This is already the established KNSCL treatment and should be preserved.

**③ Hairline** — `rgb(255 255 255 / 0.14)`.

**④ Footing** — venue 13px uppercase; match report link right, in `accent-300`.

### Matchday temperature

A fixture is an **appointment**, and that is most of what separates football from
editorial. The eyebrow rail carries relative time, not just a date:

| Condition | Eyebrow reads |
|---|---|
| Match in progress | `LIVE · 67'` — in `--color-live` |
| Today | `TODAY · KICKOFF 15:00` |
| Tomorrow | `TOMORROW · 15:00` |
| Within 7 days | `IN 3 DAYS · SUN 9 AUGUST` |
| Further out | `SUNDAY 9 AUGUST` |
| Completed | `FULL TIME` |

This costs one date calculation and no pixels of decoration, and it is the single
cheapest way to make the page feel like a competition rather than a record.

**Vocabulary is part of the art direction.** Use football language throughout:
`MATCHDAY 04` not "Round 4"; `FULL TIME` not "Completed"; `KICKOFF` not "Start
time"; `FIXTURES` not "Upcoming events".

### Negative space

The single most important instruction for this section:

> **Leave the area beneath the match empty.**

The temptation will be to fill it — with a stat strip, a form guide, a ticket
call-to-action. Do not. The monument requires silence around it. An empty lower
third is what separates an event from a data row.

The one permitted exception: a **form strip** (`W D L`) beneath each club name,
in State B only, using the existing `--color-win/draw/loss` badges. It is
competition information rather than decoration, it is three 19px squares, and it
adds the only other colour on the ink ground besides the crests.

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

### Uppercase discipline

The ruled aesthetic has a failure mode: if labels, navigation, club names and
headlines are *all* uppercase with wide tracking, the page stops reading as
football and starts reading as a legal form or a government notice.

> **Uppercase is for furniture only — labels, navigation, eyebrows, metadata,
> status and table headers.**
>
> **Clubs, people and headlines keep their natural case.**

| Uppercase | Natural case |
|---|---|
| `MATCHDAY 04` · `FULL TIME` | Malindi United |
| `TABLE` · `CLUBS` · `NEWS` | Omar Salim |
| `LEAGUE NEWS` (category) | "Club registration window opens…" |
| `P W D L GD PTS` | Malindi Municipal Stadium |

The one exception is the crest wall, where club names are set at 11px uppercase
because at that size they function as labels beneath the crests rather than as
names in their own right.

### Prohibitions

- No third font family.
- No weight below 500 for Archivo (the loaded range is 500–800).
- No heading larger than the score, anywhere on the page.
- No italic. No letter-spaced lowercase. No text shadow. No gradient text.
- No uppercase on club names, player names or headlines outside the crest wall.

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
│ MD 04 · IN 3 DAYS   FT  │  ← eyebrow condenses, keeps temperature
│                         │
│  ┌────┐                 │
│  │ MU │ Malindi United  │  ← club
│  └────┘  W D W          │
│ ═══════════════════════ │
│         2 — 0           │  ← score/status stays CENTRAL
│ ═══════════════════════ │
│  ┌────┐                 │
│  │ MF │ Mtwapa FC       │  ← club
│  └────┘  L D L          │
│                         │
│  MALINDI MUNICIPAL      │
│  MATCH REPORT →         │
├─────────────────────────┤
│ NEXT · WED 13 AUG       │  ← rail moves below
│ Watamu v Malindi 15:00  │
└─────────────────────────┘
```

**The axis rotates; the relationship does not.** Club → score → club survives
intact, the score remains physically between the two clubs, and it remains the
largest object on the screen. This is explicitly **not** a stacked card layout —
nothing is boxed, nothing is re-parented, and the centre never moves to a corner.

The score band is bounded by two hairlines rather than by a container, so the
mobile treatment stays inside the ruled language of the page.

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

## 15. DESIGN VALIDATION

*Added 9 August 2026, before implementation.*

---

### 15.1 KNSCL brand authenticity

**Question:** do official KNSCL identity assets already exist that the direction
should adopt rather than invent around?

**Method:** searched the repository for image assets, inspected the Prisma schema
for league-level branding fields, and reviewed the CMS-editable content keys.

#### Findings

| Checked | Result |
|---|---|
| Image assets in repo | **One file only** — `app/icon.svg` |
| League logo field in schema | **None.** `logoUrl` exists on `Club` and `Sponsor` only |
| League brand colour field | **None** |
| CMS-editable branding keys | **None.** `EDITABLE_KEYS` carries no logo or colour key |
| Official typography specification | **None** |
| Brand guidelines in repo | **None** |

**Conclusion: no official KNSCL visual identity assets exist.**

The `KN` wordmark, the teal and the gold were all inferred during the earlier
redesign. They are placeholders of my authorship, not league property.

#### One genuine defect found

`app/icon.svg` — the site favicon — is still drawn in `#b68235`, the **old
Classical gold** that was removed from the design system when the tokens were
rewritten. The current accent is `#0d6e5e`. The favicon is therefore the one
surviving element of a retired palette.

```
app/icon.svg      stroke="#b68235"    ← retired Classical gold
styles.css        --color-accent:     #0d6e5e   ← current league teal
```

Recorded here rather than fixed, since this pass is documentation only. It should
be corrected during implementation — a one-line colour change, not a redesign.

#### Direction

Per the brief: **no new colours are to be invented.** The restrained
ink / paper / teal system is retained exactly as specified in §6.

**When official assets do arrive**, THE BOARD absorbs them without conceptual
change, because the concept is structural rather than chromatic:

| Asset | How THE BOARD incorporates it |
|---|---|
| Official badge | Replaces the `KN` lettermark in the masthead lockup and the favicon. The board is unaffected — it never depended on the mark. |
| Official primary colour | Replaces `--color-accent`. One token. Every link, active state and win indicator follows automatically. |
| Official secondary colour | Replaces `--color-accent-2`. Used for emphasis only. |
| Official typeface | Replaces `--font-heading` / `--font-body`. The scale relationships in §5 hold regardless of family. |
| Brand photography | Fills the slots already designed for it in §10 |

> The concept survives a rebrand because **THE BOARD is a structure, not a
> palette.** Rules, alignment, numerals and shared edges are colour-agnostic.

#### One unused real asset worth noting

`Club.colours` exists in the schema (a free-text field) and is currently unused by
the design. Club kit colours are how supporters identify teams, and a 3px colour
edge on a club's row would be genuinely footballing.

**Not adopted now**, because the field is free text (`"Red and white"`) and cannot
be parsed into a colour reliably. Recorded as a future option that would require a
structured colour field first. Flagged rather than guessed at.

---

### 15.2 Football identity

**Question:** does THE BOARD read as a modern football competition platform, or as
a newspaper / government portal / generic editorial site?

**This is the most serious risk in the direction, and the critique is fair.**

#### The risk, stated honestly

Hairline rules, tabular data, small uppercase labels, no shadows, no motion and a
restrained palette describe THE BOARD accurately — and they equally describe a
financial newspaper, a national statistics portal, or a Swiss-style editorial
site. **The device is not inherently football.** Executed without correction, it
could produce something austere and bureaucratic: a fixtures PDF with better type.

That would be a different failure from AI slop, but still a failure.

#### What actually makes an interface feel like football

| Signal | Present in the direction? |
|---|---|
| Confident numerals at scale | ✅ Yes — §5, the core of the concept |
| Club crests and colour | ✅ Yes — §1 principle 3, crest wall |
| Match state as urgent and time-bound | ⚠️ **Was missing** |
| Competition tension — form, position, streaks | ⚠️ **Was under-used** |
| Named people — scorers, players | ✅ Yes — leading scorer rail |
| Place — grounds, venues | ✅ Yes — matchday footing |
| Football vocabulary | ⚠️ **Was unspecified** |

#### Five adjustments made

**A — Matchday temperature.** The eyebrow rail now carries relative time —
`LIVE · 67'`, `TODAY`, `IN 3 DAYS` — rather than a bare date. A fixture is an
appointment; a newspaper is not. Added to §4.

**B — Larger crests.** The matchday crest increases from 56px to **72–88px**.
Crests deliver identity, colour and football simultaneously, which is exactly what
a ruled page is otherwise short of. Added to §4.

**C — Form strips on the matchday board.** `W D L` badges beneath each club name
in State B, using the existing win/draw/loss colours. Competition information, not
decoration — and the only other colour on the ink ground besides the crests. Added
to §4 as the single permitted exception to the negative-space rule.

**D — Football vocabulary as art direction.** `MATCHDAY 04`, `FULL TIME`,
`KICKOFF` — not "Round 4", "Completed", "Start time". Language carries as much
football identity as layout does, and it costs nothing. Added to §4.

**E — Uppercase discipline.** A real danger of the ruled aesthetic is that
*everything* becomes uppercase with wide tracking, at which point the page reads
as a legal form. Resolved explicitly:

> **Uppercase is for labels, navigation, eyebrows and metadata only.
> Club names, player names and headlines stay in title or sentence case.**

The `clubs`, the `people` and the `stories` keep their natural case. Only the
furniture is uppercase. Added to §5.

#### Verdict

With these five adjustments, **THE BOARD holds.** The concept was structurally
sound but tonally cold; the corrections restore energy through *content* — time
pressure, crests, form, language — rather than through gradients, glassmorphism,
animation or decorative effects. No prohibited technique was used to fix it.

The youth and community character is carried by the crests themselves — sixteen
handmade, inconsistent, unmistakably local badges — and by naming real people and
real grounds. That is more authentic than any stylistic gesture could be.

---

### 15.3 Visual distinctiveness

**Question:** will implementing this direction actually avoid the AI-slop patterns
in the audit?

#### Verification against each pattern

The test is not "will we remember not to?" but **"does the structure make it
impossible?"**

| Slop pattern | Structurally prevented by |
|---|---|
| Repeated card grids | §1 principle 1 — cells share hairlines, so a "card" cannot exist without violating the construction |
| Identical section structures | §3 — four distinct column splits (8/4, 8/4, 12, 7/5) and five different padding values |
| Generic SaaS layouts | §1 — the device is a results board; there is no sidebar, no widget, no tile |
| Excessive rounded containers | §6 — hard ceiling of 3px, structural elements at 0 |
| Excessive shadows | §6 — **zero shadows**; `--shadow-*` tokens forbidden on this page |
| Generic hero sections | §2 and the UX direction — the hero is deleted, not replaced |
| Generic profile cards | §7 — crest wall is a ruled matrix; players are not on the homepage as avatars |
| Stock photography | §10 — absolute prohibition; every slot degrades to type |
| Excessive pills | §6 — only form badges and the score chip, both at 2px |
| Decorative gradients | §6 — colour is structural only; the sole gradient permitted is a photographic overlay |
| "Dashboard everywhere" | §3 — three width modes and a deliberate spine, not a uniform container |

#### The KNSCL visual signature

Distinctiveness means a viewer could identify the site from a fragment. Three
elements do that work:

**1. The centred monumental score.** `club → 2 — 0 → club` with the numeral at
128px, tabular, tracked to `-0.05em`, on flat ink. No card, no shadow, no
gradient. This is the page's monument and its most memorable frame.

**2. The hairline matrix.** The same construction — shared edges, no gaps, no
radius — recurs in the crest wall, the league table, the partner row and the
fixture lists. **One construction technique used everywhere** is what makes a
design system read as authored rather than assembled.

**3. Crest-only chroma.** An ink-and-paper page whose entire colour comes from
sixteen amateur club badges. No other football site looks like this, because no
other football site has *these* sixteen crests. This is the most defensible
element of the identity: it is literally unrepeatable.

Supporting signature: the **flush-right numeral column** in match lists, so every
score on a page falls in one vertical line.

> A screenshot of any section should be identifiable as KNSCL by construction —
> ruled edges, monumental tabular numerals, and crest colour on ink or paper.

---

### 15.4 Responsive integrity

**Question:** does the concept survive at desktop, tablet and mobile — and does
the Matchday Board avoid degrading into a conventional stacked card layout?

#### The change this validation produced

The earlier draft specified a **flush-right numeral column** for the hero match:
clubs stacked, names flush left, both scores locked into a right-hand column.

That was reconsidered against two of this pass's requirements — the football
identity concern in §15.2, and the instruction to preserve
`club → score/status → club`.

**Assessment:** the flush-right treatment was the better *list* layout and the
weaker *event* layout. Reading `Malindi United ....... 2` is how a results column
reads; it is not how a match feels. The centred score is the more footballing
composition, and it directly addresses the "too newspaper" risk.

**Resolution — both are kept, each where it is stronger:**

| Context | Treatment |
|---|---|
| **Hero match** | `club → score/status → club`, centred, monumental |
| **Match lists** (also-this-round rail, fixtures, results) | Flush-right numeral column, scannable |

§4 has been revised accordingly. Nothing was discarded; the flush-right column
moved to where it earns its place.

#### Breakpoint validation

| | Desktop ≥1024 | Tablet 640–1023 | Mobile <640 |
|---|---|---|---|
| Grid | 12 col | 8 col | 4 col |
| Matchday | 8/4 split, horizontal match axis | 8/4 retained, crests 64px | Rail below; **match axis rotates to vertical** |
| Score | 128px | ~96px | ≥72px, still the largest object on screen |
| Competition | 8/4, full table | 8/4, table drops GF/GA | Rail below; table keeps pos/club/P/GD/PTS |
| Clubs | 6 across | 4 across | 3 across, crest 40px |
| News | 7/5 hairline split | 7/5 retained | Lead full width, list below |
| The League | 4 columns | 2 columns | 1 column |

#### The Matchday Board on mobile — the critical case

**Requirement:** must not become a conventional stacked card layout; must preserve
`club → score/status → club`.

**How the direction satisfies it:**

1. **The order is preserved literally.** Club, then score/status, then club — top
   to bottom instead of left to right.
2. **The score stays physically between the clubs.** It does not move to a corner,
   a badge or a right-hand column. It remains the centre of the composition.
3. **The score remains dominant.** Minimum 72px, scaling with viewport width. It
   is the largest object on the screen at every size.
4. **Nothing becomes a card.** The score band is bounded by two hairlines, not by
   a container. No radius, no shadow, no padding-box. The mobile treatment stays
   inside the ruled language.
5. **Only the axis rotates.** No re-parenting, no hiding, no alternate component.

```
   DESKTOP                              MOBILE
   club ─── score ─── club              club
                                          │
                                        score      ← same relationship,
                                          │           rotated axis
                                        club
```

#### Other responsive risks checked

| Risk | Mitigation |
|---|---|
| Long club names ("Tezo Stars Junior") colliding with a centred score | Names sit *below* crests on their own line, not beside the score. Wrapping is free. |
| Crest wall becoming a scroller | Fixed at 3 columns on mobile; the wall's value is seeing the whole competition at once |
| Table overflowing the page | Scrolls inside its own `overflow-x` container; body never scrolls horizontally |
| Uppercase labels wrapping awkwardly at 390px | Labels stay 11px and do not scale; eyebrow abbreviates (`MATCHDAY 04` → `MD 04`) |
| Form strips crowding club names on mobile | Permitted to drop below 480px — metadata goes before content goes |

**Verdict: the concept holds at all three sizes.** The mobile Matchday Board is a
rotation of the desktop composition, not a substitution for it.

---

## 16. IMPLEMENTATION GUARDRAILS

Binding rules for the implementation phase. These are not suggestions.

### The governing rule

> **Improve hierarchy before decoration.
> Improve composition before components.
> Improve typography before effects.**

If a section is not working, the answer is never a visual effect. It is the
hierarchy, the composition or the type — in that order.

### Do not

1. **Do not add UI elements without a documented purpose.** Every element on the
   page must trace to a user need in `KNSCL_HOMEPAGE_UX_DIRECTION.md` §2 or a
   treatment in this document. If it appears in neither, it does not ship.
2. **Do not convert every section into a card.** Cards are permitted for a news
   story. Nothing else on this page.
3. **Do not add decorative effects to compensate for weak hierarchy.** A section
   that needs a shadow to separate it from its neighbour has a spacing or ground
   problem, not a depth problem.
4. **Do not introduce gradients** unless specifically justified. The only
   permitted gradient on this page is the ink overlay on a photographic ground,
   specified in §4. No decorative, mesh, radial or text gradients.
5. **Do not introduce stock photography.** Ever. No illustrations, patterns or
   placeholder images substituting for real photographs either.
6. **Do not introduce arbitrary colours.** The palette in §6 is closed. No new
   token, no inline hex, no third accent. Colour is structural or it does not
   appear.
7. **Do not introduce unnecessary animations.** Only `color`, `background-color`
   and `border-color` may transition, at ≤200ms. Nothing moves, scales or fades.
8. **Do not change the visual concept during implementation.** THE BOARD is
   approved. If something cannot be built within it, raise it — do not quietly
   substitute a different idea mid-build.
9. **Do not add a section to fill space.** The page is deliberately shorter than
   the one it replaces.
10. **Do not display a zero-value statistic.** Suppress it. A zero is not
    information.
11. **Do not let any heading exceed the score.** Section labels stay at 13px.
12. **Do not create a parallel class system.** Extend the existing tokens and
    utilities. No new dependency, icon set or design system.

### Preserve

13. **Preserve the typography hierarchy.** The scale in §5 — extremes with a
    deliberate gap between 17px and 32px — is load-bearing. Filling that gap
    reintroduces the generated look.
14. **Preserve the ruled / shared-edge composition.** Structure comes from
    hairlines and touching cells. No gaps between grid cells, no floating
    containers.
15. **Preserve the Matchday Board as the primary visual anchor.** Nothing on the
    page may compete with it — not a heading, not an image, not a promotion.
16. **Preserve the distinction between data records and UI containers.**

    > A **record** is ruled, shares edges with its neighbours, and carries data.
    > A **container** is boxed, floats, and carries interface.
    >
    > Match rows, table rows, crest cells and partner cells are **records**.
    > Treating a record as a container is the specific mistake that produced the
    > current site.

17. **Preserve `club → score/status → club`** at every breakpoint. The axis may
    rotate; the relationship may not break.
18. **Preserve crest-only chroma.** Every saturated pixel is a crest, a match
    state or the single teal accent.
19. **Preserve the empty space beneath the match.** Only the form strip may
    occupy it.
20. **Preserve existing functionality** — routes, data, the private-field boundary
    in `lib/public-data.ts`, server rendering of public pages, and the dashboards
    that share these tokens.

### Fix in passing

21. `app/icon.svg` still uses the retired Classical gold `#b68235`. Update it to
    `--color-accent` `#0d6e5e` during implementation. One-line change.

### The three tests, restated

Before adding any element:

- **The rule test.** Could this be a rule instead of a box? Then make it a rule.
- **The removal test.** Would removing this effect make the interface clearer?
  Then remove it.
- **The extreme test.** Is this at an extreme of the type scale? If it sits in the
  middle with everything else, it is not carrying hierarchy.

---

## Appendix — Summary of visual decisions

| Decision | Rationale |
|---|---|
| **The board** as the governing device | Football administration has its own visual culture — ruled, numerical, unornamented. It is the opposite of SaaS. |
| Ruled, never boxed | Removes the card-grid character in one structural move |
| Numbers as imagery | Honest response to having no photography; a `2` at 128px beats a mediocre photo |
| Crests as the only chroma | KNSCL's real, specific, unrepeatable colour asset |
| Score always centred between the clubs | `club → score → club` is how a match is read aloud; the centred score is the *event* layout. Axis rotates on mobile; relationship never breaks. *(Revised in §15.4)* |
| Flush-right numeral column kept for match **lists** | Best layout for scanning many scores; both treatments retained, each where it is stronger |
| The centre never empties | One composition serves both season states |
| Matchday temperature — `LIVE`, `TODAY`, `IN 3 DAYS` | A fixture is an appointment; this is what separates football from editorial *(added §15.2)* |
| Crests enlarged to 72–88px | Crests carry identity, colour and football at once — what a ruled page is otherwise short of |
| Uppercase for furniture only | Clubs, people and headlines keep natural case, or the page reads as a legal form |
| Section labels drop to 13px | Stops headings competing with data — the key anti-slop typographic move |
| Type at extremes, gap in the middle | The 14–32px cluster is what makes pages read as generated |
| Zero shadows | Elevation by ground change and rule weight only |
| Three width modes | Allows editorial composition instead of one repeated container |
| 8/4 spine, then departures | Repetition establishes a rhythm; Clubs and News read as deliberate variation |
| Empty space beneath the score | An event needs silence around it; a data row does not |
| Only colour properties transition | A board changes state; it does not animate |
