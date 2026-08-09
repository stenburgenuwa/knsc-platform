# KNSCL HOMEPAGE — UX & INFORMATION ARCHITECTURE DIRECTION

**Date:** 9 August 2026
**Status:** Design direction. No implementation has been carried out.
**Authorities:** `.claude/skills/knscl-visual-design/SKILL.md` (design authority),
`KNSCL_VISUAL_AUDIT.md` (problem set and scope)

This document decides **what the KNSCL homepage should be** before any decision is
made about how it should look. It does not introduce a new design system; it works
within the KNSCL DESIGN DIRECTION and resolves the homepage problems recorded in
the audit (`H3`, `H4`, `M3`, `M4`, `M5`, §2.5, §2.6).

Per the audit Scope Note, this is designed for the **intended production state** —
real clubs, complete squads, named managers, assigned venues, published results —
not for today's placeholder data.

---

## 1. HOMEPAGE OBJECTIVE

The KNSCL homepage is **the front page of a competition**, not a marketing landing
page and not a dashboard.

Its job, in one sentence:

> **Show what is happening in Kilifi North football right now, and prove the
> competition is real and active.**

Three things follow from that.

**It is a record, not a pitch.** Nobody arrives at KNSCL needing to be sold on
Kilifi North football. They arrive because they already care — they support a club,
play for one, run one, or are checking a result. The homepage should assume
interest and deliver information, not spend its most valuable space explaining
what a league is.

**Its audience is unusually close to the subject.** This is a sub-county league of
sixteen clubs. Supporters know the players personally. Players and club officials
are themselves a large share of the traffic. That is materially different from a
professional club site, where the audience is distant and anonymous — and it
changes the hierarchy. Clubs and squads deserve more homepage prominence here
than they would on a Premier League site.

**Sixteen clubs is small enough to show, not just link to.** A professional league
must abstract its clubs behind a "Clubs" link. KNSCL can display the entire
competition on the homepage. This is a genuine structural advantage and the
architecture below exploits it.

### The first five seconds

A visitor should understand, without scrolling and without reading a paragraph:

1. **This is the Kilifi North Sub County League** — official, current season.
2. **Football is imminent or has just happened** — a real date, a real fixture or
   a real scoreline.
3. **Where to go next** — the match, the table, or their club.

They should *not* have to read a tagline to learn any of that.

---

## 2. USER PRIORITIES

The homepage hierarchy is derived from what each audience actually arrives asking.

### Fans and club supporters *(largest group, highest priority)*

| Question | Where it is answered |
|---|---|
| "When is the next match?" | Matchday — above the fold |
| "Who is playing?" | Matchday — above the fold |
| "Who won?" | Matchday — above the fold, in-season |
| "Where is the match?" | Matchday — secondary line |
| "How is my club performing?" | Competition — table position and form |
| "What is happening with my club?" | Clubs — direct crest link to club page |

### Players *(distinctive to grassroots football)*

| Question | Where it is answered |
|---|---|
| "Where is my club?" | Clubs — crest wall |
| "Who are the players?" | Club page, one click from the crest wall |
| "What are my statistics?" | Player page, via club or Players |

Players are not a homepage-terminal audience — they need a fast, obvious route
*out* of the homepage into their club. The crest wall is that route.

### General visitors *(smallest group, but they decide whether the site is credible)*

| Question | Where it is answered |
|---|---|
| "What is KNSCL?" | Masthead identity + The League section (low, quiet) |
| "Which clubs participate?" | Clubs — crest wall, answered visually and immediately |
| "What is happening in the league?" | Matchday and News |

### Resulting priority order

```
P1  Matchday            — is there football, and what happened
P2  Competition state   — where clubs stand
P3  Clubs               — who is in this league, route to my club
P4  Stories             — league news
P5  League information  — what KNSCL is, partners, contact
```

Note what is **not** in the top five: the league's own name as a headline, a
mission statement, and calls-to-action. All three currently occupy the most
valuable space on the page.

---

## 3. PRE-SEASON EXPERIENCE — STATE A

**Available:** clubs, squads (partially), upcoming fixtures, announcements, venues,
league information.
**Absent:** results, standings, goals, top scorers, form, match reports.

### The governing rule

> **Pre-season is a state to be designed for, not an error to be reported.**

Today the homepage treats missing results as a fault and announces it: a large
empty box reading "No results published yet", followed by a table of zeros. The
page leads with absence. A visitor's first impression is of a broken site rather
than a league about to start.

The correct behaviour is that **pre-season has its own content**, and it is
genuinely interesting:

- The season has a start date. That is news.
- Sixteen clubs are confirmed. That is the competition.
- The opening round of fixtures exists. That is a matchday.
- Squads are being registered. That is momentum.

### How each slot behaves in State A

| Slot | State A content |
|---|---|
| Matchday | **Opening fixture**, framed as the season opener with a countdown to the date. Not "next match" — "Season opens Sunday 9 August". |
| Competition | **Season status**, not a table: 16 clubs, X fixtures scheduled, first matchday date, squads registered. Real numbers about a real season. |
| Clubs | Crest wall — at its most valuable here, because it is the only complete dataset. |
| News | Announcements and season previews. |
| League | Unchanged. |

### What must never happen in State A

- A league table where every column is zero.
- "Top of the table — 0 pts from 0 matches."
- A stat band in which half the figures are `0`.
- An empty-state box as the first content below the hero.

Zero-value statistics must be **suppressed**, not displayed. A statistic with no
data is not information; it is noise that actively signals a dead site.

---

## 4. ACTIVE-SEASON EXPERIENCE — STATE B

**Available:** results, standings, scorers, form, match reports, fixtures, news.

### How each slot behaves in State B

| Slot | State B content |
|---|---|
| Matchday | **Most recent result** at full scale, plus the next fixture. The scoreline becomes the largest object on the page. |
| Competition | **League table** (top six, linked to full table) plus leading scorer. |
| Clubs | Crest wall — retained, but visually quieter; the table now carries club identity. |
| News | Match reports and league news. |
| League | Unchanged. |

### The state transition

The architecture does **not** change between states. The same six sections appear
in the same order with the same visual weights. Two slots — Matchday and
Competition — swap their *content*, not their position or treatment.

This matters for three reasons:

1. The season transition requires no redesign and no separate template.
2. Returning users find the same things in the same places all year.
3. It prevents the common failure where a pre-season site is quietly abandoned
   because it "doesn't work yet".

The switch is data-driven: **if any fixture has status `COMPLETED`, the page is in
State B.** No manual toggle, no configuration.

---

## 5. CURRENT HOMEPAGE PROBLEMS

Assessed against the current live build.

### Keep

| Element | Why it works |
|---|---|
| Dark identity band as the page opening | Gives the page a ground and a top; distinct from the body |
| Next-match board | Correct instinct — matchday given real prominence |
| Stat band attached to the identity band | Correctly attached rather than floating as a card row |
| News lead + rule list split | The one genuinely editorial composition on the page |
| League table with a dominant points column | Typographically correct |

### Remove

| Element | Why |
|---|---|
| `h1` "Kilifi North Sub County League" | Duplicates the masthead wordmark directly above it. The most valuable space on the page repeats information already given. |
| Hero subtitle "Every fixture, every result, every player…" | Generic marketing copy that answers no user question (`M5`) |
| "View Fixtures" / "League Table" buttons | Duplicate the primary navigation two rows above |
| Stat band **when values are zero** | Two of four cells currently read `0` |
| "Players to Watch" as a 4-up avatar card grid | Meaningless pre-season; in-season it should be a scorers list, not cards (`H5`, `M4`) |
| Standalone empty-state boxes | Absence should be handled by suppression, not announcement (`H3`) |

Removing the hero block reclaims roughly the top third of the viewport — the
single largest available gain on the page.

### Reorder

| Element | From → To |
|---|---|
| Matchday | Right column of hero → **primary anchor, full width** |
| Stat band | Position 2 → below Competition, and only in State B |
| Clubs | Absent from homepage → **position 4, as a crest wall** |

### Combine

| Combine | Into | Why |
|---|---|---|
| "Next match" + "Also Coming Up" + "Latest Results" | **One Matchday section** | Three sections currently answer one question. Football sites have a matchday module, not three separate blocks. |
| "League Table" + "Top of the table" aside + "Leading scorer" aside | **One Competition section** | The asides are consequences of the table and belong inside it |

That is six current sections reduced to two stronger ones.

### Redesign

| Element | Required change |
|---|---|
| Latest Results (3 cards in a row) | Becomes a rule-separated result list inside Matchday, with the most recent result at hero scale (`M4`) |
| Players to Watch (card grid) | Becomes a compact ranked scorers list inside Competition (`H5`) |
| Pre-season handling | Becomes State A content rather than empty states (`H3`) |

### Introduce

Only two additions, both justified by unanswered user questions:

| New element | Justification |
|---|---|
| **Clubs crest wall** | Answers "which clubs participate?" and "where is my club?" — currently unanswerable from the homepage without using the nav. Also the site's only genuine imagery until photography exists. |
| **Season status block** (State A only) | Occupies the Competition slot pre-season so the page never shows a zero table |

No section is added to make the page longer. The proposal has **fewer** sections
than the current homepage.

---

## 6. PROPOSED INFORMATION ARCHITECTURE

```
Homepage
│
├── 01  MASTHEAD ─────────────────── identity, navigation, search
│                                    (existing — unchanged)
│
├── 02  MATCHDAY ─────────────────── PRIMARY VISUAL ANCHOR
│        │                           state-aware
│        ├── State A: season opener + opening-round fixtures
│        └── State B: latest result (hero scale) + next fixture + recent results
│
├── 03  COMPETITION ──────────────── SECONDARY ANCHOR
│        │                           state-aware
│        ├── State A: season status — clubs, fixtures, first matchday
│        └── State B: league table (top six) + leading scorer
│
├── 04  CLUBS ────────────────────── crest wall, all 16 clubs
│                                    constant across both states
│
├── 05  NEWS ─────────────────────── EDITORIAL MOMENT
│                                    lead story + rule list
│
└── 06  THE LEAGUE ───────────────── season facts, partners, contact
                                     quiet, dense, closes the page
```

Six sections. Two swap content by state. None is a card grid.

### 01 — MASTHEAD

- **Purpose:** Identity and navigation.
- **User need:** "What is this?" / "Take me to fixtures."
- **Priority:** Constant.
- **Content:** Wordmark, season, competition nav, search, sign-in.
- **Position:** Fixed at top. Already carries the league name — which is why the
  hero must not repeat it.
- **Visual treatment:** Unchanged. Dark ground, rule-marked active section.

### 02 — MATCHDAY

- **Purpose:** Answer the single question most visitors arrive with.
- **User need:** "When is the next match?" / "Who won?" / "Where?"
- **Priority:** **P1 — the most important section on the site.**
- **Content required:** Home and away clubs with crests; score *or* kickoff time;
  date; venue; competition round; link to the match report. Plus a short list of
  surrounding fixtures/results.
- **Why this position:** It is the reason the majority of visits happen. Nothing
  should precede it. The current build places a marketing block above it and a
  duplicated league name above that — both must go.
- **Visual treatment:** Full-bleed dark ground, continuing directly from the
  masthead so the page opens on one uninterrupted dark field. The scoreline or
  kickoff time is the **largest typographic object on the page** — larger than any
  heading. Numerals in tabular figures. Crests at genuine scale. Beneath it, a
  compact rule-separated list of the rest of the round — dense, no cards.
- **State A:** The opening fixture, framed as the season opener with the date given
  weight. Headline reads as a date, not as a section label.
- **State B:** Most recent result at hero scale; next fixture adjacent; a short
  list of other recent results below.

### 03 — COMPETITION

- **Purpose:** Show where the competition stands.
- **User need:** "How is my club performing?" / "Who is winning?"
- **Priority:** P2.
- **Content required (State B):** Position, club, played, goal difference, points,
  form for the top six; link to the full table; leading scorer with goal count.
- **Content required (State A):** Number of confirmed clubs, fixtures scheduled,
  first matchday date, squads registered — real figures, none of them zero.
- **Why this position:** It is the natural second question after "what happened".
  It also directly follows from Matchday: a result changes the table, so the table
  belongs immediately after the result that changed it.
- **Visual treatment:** Light ground, sharp contrast against the dark Matchday
  block above. A real data table — dense, ruled, tabular figures, points column
  dominant. **This section should be the densest on the page and should not be
  softened.** In State A, the same slot holds large numerals with short labels,
  in the manner of the existing stat band but with meaningful values only.

### 04 — CLUBS

- **Purpose:** Show the entire competition at a glance; route supporters and
  players to their club.
- **User need:** "Which clubs participate?" / "Where is my club?"
- **Priority:** P3 — higher than it would be on a professional league site, because
  players and club officials are a large share of KNSCL's audience.
- **Content required:** All 16 club crests with names, linked to club pages.
- **Why this position:** After the competition state, the natural question is
  "who is in it". It also gives the page its only visual variety until photography
  exists, and it is the strongest available answer to "is this league real?" —
  sixteen distinct, real crests answer that instantly.
- **Visual treatment:** A **crest wall** — a single-pixel-ruled grid of crest +
  name cells, edge to edge. Not cards: no radius, no shadow, no padding-box; the
  cells share hairline rules, as a fixture grid or a results board does. Quiet,
  dense, and repetitive *by intent* — the repetition is the point, because the
  content varies. This is explicitly not the "repeat a card 16 times" pattern in
  `H4`; it is one object composed of 16 parts.

### 05 — NEWS

- **Purpose:** Give the league a voice.
- **User need:** "What is happening?"
- **Priority:** P4.
- **Content required:** Lead story with featured image, category, date; three to
  four secondary headlines with categories and dates.
- **Why this position:** Editorial belongs after fact. A visitor wants the result
  before the write-up.
- **Visual treatment:** Asymmetric split — lead story at roughly 7/12 with a large
  image and a headline at display scale; remaining stories as a rule-separated
  list at 5/12. Retained from the current build, which already does this correctly.
  **This is the primary photography slot on the page.**

### 06 — THE LEAGUE

- **Purpose:** Institutional close.
- **User need:** "What is KNSCL?" / "Who backs it?" / "How do I get in touch?"
- **Priority:** P5.
- **Content required:** One-paragraph league description, season dates, partners,
  contact.
- **Why this position:** General visitors need it; regular users never do. It
  belongs at the end, where the footer already sits.
- **Visual treatment:** Dark ground, folded into the existing footer region so the
  page closes on the same field it opened on. Dense link columns. Partners appear
  as a hairline-ruled logo row when sponsors exist, not as cards.

---

## 7. PROPOSED SECTION ORDER

| # | Section | State A | State B | Ground |
|---|---|---|---|---|
| 01 | Masthead | Identity + nav | Identity + nav | Dark |
| 02 | **Matchday** | Season opener + opening round | Latest result + next fixture + recent results | Dark |
| 03 | **Competition** | Season status | League table + leading scorer | Light |
| 04 | Clubs | Crest wall | Crest wall | Light |
| 05 | News | Announcements | Reports + news | Light |
| 06 | The League | Info + contact | Info + partners + contact | Dark |

The page alternates **dark → light → dark**, giving it a beginning, a body and an
end. Section rhythm is created by ground and density, not by coloured cards
(§14, §20 of the design direction).

### Density rhythm

```
02 Matchday      ░░░░░░░░  spacious, large type, dark
03 Competition   ████████  dense data table, light
04 Clubs         ██████░░  dense grid, quiet
05 News          ░░░████░  editorial — one large, several small
06 The League    ██████░░  dense links, dark
```

---

## 8. CONTENT HIERARCHY

Ranked by what must be understood first.

| Rank | Content | Treatment |
|---|---|---|
| 1 | The score, or the kickoff date/time | Largest object on the page. Tabular numerals, tight tracking. |
| 2 | The two club names in that match | Display weight, with crests at real scale |
| 3 | Match date and venue | Secondary line, quiet, immediately below |
| 4 | League table — position, club, points | Dense but with points visibly dominant |
| 5 | Club crests (the wall) | Uniform, quiet, high count |
| 6 | Lead news headline | Display scale, but visually subordinate to the score |
| 7 | Secondary headlines | List scale |
| 8 | Season facts, partners, contact | Smallest, densest |

Two rules that follow:

- **No heading may be larger than the score.** Section headings are labels, not
  attractions. Hierarchy comes from the data, not from the furniture around it.
- **Statistics with no value are removed, not shown as zero.** Applies to the stat
  band, top scorers, form and the table in State A.

---

## 9. VISUAL HIERARCHY

### Primary visual anchor

**The Matchday block.** Full-bleed dark ground, occupying the top of the page
immediately below the masthead, carrying the largest typography on the site. In
State B the scoreline dominates; in State A the fixture and its date do.

Everything else on the page is subordinate to it. If a visitor takes one thing
away, it is this.

### Secondary anchors

1. **The Competition table** — dominant through *density and contrast*, not scale.
   It is the first light-ground element after a dark block, and it is the only
   tabular object on the page.
2. **The lead news story** — dominant through *imagery*, once photography exists.

The two secondary anchors deliberately compete in different registers: one is
data, one is picture. Neither undermines the other.

### Supporting information

Accessible but never competing: fixtures list, recent results list, secondary
headlines, season facts, partners, contact. All of these use body-scale
typography and hairline rules.

### Editorial moments

Three, and only three:

1. **The matchday scoreline** — the emotional peak of a football page. A result at
   display scale is the closest thing a data-driven site has to a photograph.
2. **The lead news story** — the only place a narrative is told.
3. **The crest wall** — quieter, but the page's identity statement. Sixteen real
   crests say "this is a real competition" more convincingly than any copy.

### What creates hierarchy here

Scale · weight · ground (dark/light) · density · rule weight · position.

### What must not create hierarchy

Gradients · shadows · glassmorphism · border radius · decorative colour · outlines
· floating elements · animation. Per §5 and §14 of the design direction.

---

## 10. PHOTOGRAPHY OPPORTUNITIES

The site currently has no league photography (`H6`). The architecture is designed
to **hold** photography without **depending** on it — every section must look
finished before any photograph exists, and better once they do.

Ranked by value per image:

| # | Slot | Treatment | Priority |
|---|---|---|---|
| 1 | **Matchday ground** | A single ground/crowd/action image behind the dark Matchday block at low luminance, with the ink overlay already used on club pages. One image transforms the top of the page. | Highest |
| 2 | **News lead** | 16:10 featured image at roughly 7/12 width. Already supported by the CMS. | High |
| 3 | **Season feature** | One optional full-bleed image between Competition and Clubs, used for a season-opening or matchday-round feature. | Medium |
| 4 | Club pages | Banner behind the club identity band — already implemented and working. | Medium |

### Rules

- **Never stock photography.** Generic sports imagery reintroduces exactly the
  quality being removed (§10). Better no image than a bought one.
- **Documentary, not advertising.** Kilifi grounds, real supporters, real
  matchdays, youth football, training, celebrations.
- **Never decorative.** No image is added to fill space or soften a section.
- **Every image slot degrades cleanly.** With no image, the Matchday block is flat
  ink; the news lead becomes text-led with a rule, as already implemented.

Until real photographs exist, **the crest wall carries the visual load.**

---

## 11. MOBILE CONSIDERATIONS

Mobile is the majority case for this audience and is not a narrowed desktop (§17).

### Order

Unchanged from desktop. The priority order is already correct for a phone; there
is no reason to reorder.

### Per-section behaviour

| Section | Mobile behaviour |
|---|---|
| Masthead | Collapses to wordmark + menu; search moves into the drawer *(already implemented)* |
| **Matchday** | Full width. Score remains the largest element — it should scale up, not down, relative to the viewport. Crests stack above club names if needed. Venue and round drop to a single line. |
| Competition (table) | Position, club, played, GD, points only. W/D/L/GF/GA hidden *(already implemented)*. Form strip hidden below 480px. |
| Competition (State A) | Two-up numeral grid |
| Clubs | Crest wall at 3 across; crest above name, centred |
| News | Lead story full width with image; secondary stories as a rule list |
| The League | Link columns collapse to two, then one |

### Rules

- **No horizontal overflow anywhere.** The table scrolls inside its own container;
  the page body never does.
- **Touch targets ≥ 44px** — particularly the crest wall cells, which are the
  primary navigation route for supporters.
- **Reduce metadata before reducing content.** Drop venue, round and referee before
  dropping fixtures.
- **The score never shrinks below display scale.** It is the reason the page exists.

---

## 12. WHAT SHOULD NOT BE DONE

Explicit prohibitions for the implementation phase.

### Structure

- Do **not** produce hero → 3 cards → 3 cards → 3 cards → news → footer.
- Do **not** add a section to make the page longer.
- Do **not** reintroduce separate "Next Match", "Also Coming Up" and "Latest
  Results" sections — they are one section.
- Do **not** put each section inside a container. Sections are separated by ground
  and rule, not by boxes.

### Cards

- Do **not** use a card where a list, a table or an open layout works.
- The crest wall is **not** a card grid — hairline-ruled cells, no radius, no
  shadow, no gaps.
- Cards remain acceptable for a news story. Nothing else on this page.

### Hierarchy

- Do **not** solve hierarchy with gradients, shadows, glassmorphism, decorative
  colour or oversized section headings.
- Do **not** allow any heading to exceed the score in size.
- Do **not** add a second accent colour to create emphasis.

### Empty states

- Do **not** display a zero-value statistic.
- Do **not** render a league table with no matches played.
- Do **not** place an empty-state box as top-level page content.
- Do **not** show "0 pts from 0 matches" in any form.

### Imagery

- Do **not** use stock photography or generic sports illustration.
- Do **not** add an image to fill space.

### Scope

- Do **not** modify or delete placeholder data (Real Madrid, EPL news, seed
  records) — see the audit Scope Note.
- Do **not** change backend, schema or API behaviour. This is presentation only.
- Do **not** break existing routes, or replace real data with mock data.
- Do **not** introduce a new design system, dependency or icon set.

---

## 13. RECOMMENDED IMPLEMENTATION SEQUENCE

Following §23 of the design direction — **remove, then reorganise, then improve,
then compose, then decorate.**

| Step | Work | Audit ref |
|---|---|---|
| **1** | **Remove.** Delete the hero headline, subtitle and duplicate CTA buttons. Delete the standalone "Players to Watch" grid. Remove the stat band from its current position. | `M5`, `H5` |
| **2** | **Add state detection.** Derive State A / State B from whether any fixture is `COMPLETED`. One helper in the data layer; no schema change. | `H3` |
| **3** | **Build Matchday.** Merge next-match, coming-up and latest-results into one full-bleed dark section. Establish the score as the largest object on the page. | `H3`, `M4` |
| **4** | **Build Competition.** Table plus leading scorer in State B; season-status numerals in State A. Suppress all zero-value statistics. | `H3`, `M3` |
| **5** | **Build the crest wall.** New Clubs section, hairline-ruled, all 16 clubs, linked. | `H4` |
| **6** | **Retain and refine News.** Keep the existing lead + rule-list split; align spacing to the new rhythm. | — |
| **7** | **Fold The League into the footer region.** Season facts, partners, contact. | `M6` |
| **8** | **Responsive pass.** Verify each section against Section 11, on a real viewport. | §17 |
| **9** | **Verify both states.** Render State A and State B against real data and confirm neither shows a zero statistic or an empty-state box. | `H3` |
| **10** | **Photography slots.** Confirm each degrades cleanly with no image, and is ready to receive one. | `H6` |

### Verification before this is considered done

- Homepage renders correctly with **zero** completed fixtures (State A).
- Homepage renders correctly with completed fixtures (State B).
- No section is a repeated card grid.
- No zero-value statistic appears in either state.
- No heading is larger than the score.
- No horizontal overflow at 390px.
- All existing routes and links still resolve.
- Public pages remain server-rendered.
- `npm run test` and `npm run build` pass.

### Out of scope for this pass

The clubs directory page (`H4`) and players directory page (`H5`) are separate
work. This document covers the homepage only. The crest wall built in step 5 is
intended to be reused on the clubs page in that later pass.

---

## Appendix — Summary of decisions

| Decision | Rationale |
|---|---|
| Delete the hero block | Duplicates the masthead; answers no user question; occupies the most valuable space on the page |
| Matchday becomes the primary anchor | It is why most visits happen |
| The score is the largest object on the page | Football's primary information; the page's emotional peak |
| Three matchday sections merge into one | They answer one question |
| Table asides fold into the table | They are consequences of it, not peers |
| Competition slot swaps content by state | Avoids a zero table without a second template |
| Zero statistics are suppressed, not shown | A zero is not information |
| Clubs promoted onto the homepage as a crest wall | 16 clubs is small enough to show; players and officials are a large share of the audience; it is the only real imagery available |
| Page alternates dark → light → dark | Rhythm from ground, not from cards |
| Only three editorial moments | Emphasis everywhere is emphasis nowhere |
