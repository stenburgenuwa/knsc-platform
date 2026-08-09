# KNSCL VISUAL AUDIT

**Date:** 9 August 2026
**Environment audited:** `https://knsc-platform-l83a-knsc.vercel.app`
**Build:** post-redesign (`7f9cd28`, "Redesign public site as football editorial")
**Pages reviewed:** Home, Clubs, Players, Login
**Method:** direct visual review of the live production site, cross-referenced against
`.claude/skills/knscl-visual-design/SKILL.md` (KNSCL DESIGN DIRECTION).

---

## Executive summary

The redesign is deployed and working. The masthead, typography, colour system,
matchday layouts and league table are live and behaving as designed.

**The site does not currently look unfinished because of its design. It looks
unfinished because of its content.**

The single most damaging element on the site is the news section, which leads
with English Premier League transfer gossip under a "LEAGUE NEWS" label. That
one block undermines the credibility of everything around it, regardless of how
well the surrounding interface is built.

A secondary, genuine set of UX/UI faults does exist and is documented in
Section 2. Those are real and should be fixed — but they are not why a first-time
visitor would distrust the site today.

**Rough split of the problem: ~70% content and data, ~30% design.**

---

# 1. CONTENT / DATA PROBLEMS

These are entries in the production database. They are fixed through the
Platform Owner and League Manager consoles, not through code.

## 1.1 Irrelevant international football news

The homepage newsroom leads with four items, all dated 8 August 2026, all
tagged **LEAGUE NEWS**:

| Headline | Problem |
|---|---|
| "Arsenal's £75m Bruno Guimaraes transfer will make Mikel Arteta's side unstoppable" | Lead story, with a large photograph of Arsenal players |
| "Next Man City signing at final stage as Romano confirms Rodri, Barcelona terms 'agreement'" | EPL transfer gossip |
| "Arsenal Relegated to Divison 2" | Not KNSCL news; also contains a spelling error ("Divison") |
| "Barcelona Transfer News" | Not KNSCL news; placeholder-grade title |

This content did **not** originate from the seed script or application code —
it was entered manually through the CMS. Verified by searching the codebase for
these terms: no matches.

**Effect:** a visitor concludes within seconds that the site is a scraped content
farm rather than an official league record. The featured image is the largest
single element on the homepage, and it shows another league's players.

## 1.2 Incorrect club entry — "Real Madrid"

"Real Madrid" is listed as a member club of the Kilifi North Sub County League,
founded 2018, carrying the genuine Real Madrid crest.

Beyond the obvious credibility damage, this is a **third-party trademark and
copyright issue** — the crest is not licensed for use here.

## 1.3 Manager fields contain club names, not people

Fifteen of sixteen clubs have a lowercase, duplicated version of the club name in
the Manager field:

`bata bullets` · `big lapa` · `black pirates` · `chuggah united` ·
`green berrest` · `kanani Fc` · `kiriba united` · `mgandini Fc` ·
`mida creek` · `ngala united` · `pana Fc` · `real madrid` ·
`takaungu united` · `tezo junior` · `young hiroz`

Only 3 Brothers has something resembling a name — `3Brothers F` — which is still
not a person.

**Effect:** the most human field in the club directory is filled with machine-like
duplicates. This is one of the strongest "auto-generated" signals on the site.
Note that `green berrest` may also be a misspelling of the club name
("Green Berrets" / "Green Berets").

## 1.4 Missing venues

Fourteen of sixteen clubs show **"Home ground TBC"**. Only 3 Brothers
(Kakanjuni Ground) and Bata Bullets (Bata Ground Kiwandani) have a home venue set.

Because fixture venues derive from the home club's registered ground, this
propagates: upcoming fixtures on the homepage display "Venue TBC".

**Open question for investigation:** the fixture *Bata Bullets v Tezo Stars Junior*
shows "Venue TBC" even though Bata Bullets has a registered ground. This may be
because the fixture was created *before* the venue was assigned — fixture venue is
resolved at creation time. Worth confirming; if so, re-saving affected fixtures
will populate them.

## 1.5 Missing player data across almost all clubs

- **13 players registered in total, across 16 clubs.**
- **All 13 belong to a single club (3 Brothers).**
- **15 of 16 clubs show "0 players".**

Additionally, the registered players appear to be missing:
- Position (no position chips render on `/players`, which only appear when
  position data exists)
- Shirt number
- Goals

## 1.6 Implausible or missing founding years

| Club | Founded | Note |
|---|---|---|
| Ngala United | 1900 | Implausible for a sub-county club |
| Young Hiroz | 1909 | Implausible |
| Green Berrets | 1926 | Implausible |
| Takaungu United | 1982 | Possible but worth confirming |
| Chuggah United | *(absent)* | No founding year recorded |
| Mgandini | *(absent)* | No founding year recorded |

## 1.7 Empty / pre-season statistics

The season has not started, so every competitive number is zero:

- Homepage stat band: **0 matches played**, **0 goals scored** (two of four figures)
- Latest Results: empty state — *"No results published yet"*
- League table: five clubs, all showing `0 0 0 0 0 0 0` and **0 points**
- Sidebar: *"Top of the table — Big Lapa, 0 pts from 0 matches"*, which is meaningless

This is *correct behaviour* on empty data, not a bug. But the interface presents
pre-season as though it were a broken in-season site. See §2.3.

## 1.8 Missing league contact details and site content

- Footer Contact column shows only "Get in touch" — no address, email or phone
  configured in Site Content.
- No sponsors recorded, so the Official Partners section does not render.
- Hero copy is still the generic default: *"Every fixture, every result, every
  player — the official record of football in Kilifi North."*

---

# 2. GENUINE UX / UI PROBLEMS

These are design faults in the current build. They are fixed in code.

## 2.1 Repetitive club card grid

`/clubs` renders **16 near-identical cards in a 3-column grid**, each containing
the same crest + name + three label/value rows (Manager, Founded, Squad).

This is the pattern the design direction warns against in §6 (*"Repetitive
three-column card layouts"*) and §12 (*"Do not put every section inside a card"*).
It is structurally generated, and therefore reads as generated.

A club directory is one of the strongest opportunities on the site to express
identity — crests, grounds, colours, history — and it currently expresses none of it.

## 2.2 Players presented as generic profile avatars

`/players` renders a **4-column grid of circular headshots** with only name and
club beneath. This is the visual language of a SaaS "Meet the team" page, not a
football squad.

Compounding factors:
- Circle-cropping ID-style headshots makes players look like user accounts.
- The photographs have inconsistent and in places visibly artefacted backgrounds
  (background-removal residue, mismatched gradients), which reads as low production value.
- No shirt number, position, or statistics are surfaced — the three things that
  make a player card feel like football (partly a data gap, §1.5, but the component
  does not prioritise them either).

## 2.3 Poor pre-season homepage experience

With no matches played, the homepage still follows the in-season narrative and
therefore leads with absence:

1. Hero
2. Stat band — half of it zeros
3. **Latest Results → a large empty box**
4. **League table → all zeros**
5. Coming up
6. News

The first substantive thing a visitor sees below the hero is an empty state. The
page should reorder around what *does* exist pre-season — the 16 clubs, the
opening fixtures, squad registration — and suppress or reframe competition data
that has no meaning yet.

## 2.4 Weak information hierarchy on directory pages

On `/clubs`, every field is weighted almost equally: Manager, Founded and Squad
share identical treatment. Nothing signals which matters. Squad size is the most
useful sorting/scanning signal for a fan and is buried as the third row.

On `/players`, the name and club carry the same visual weight as one another, and
nothing else is present at all.

## 2.5 Generic component patterns and excessive card use

Across the site, the card remains the default container. Confirmed instances:

- Latest Results — three cards in a row
- Players to Watch (homepage) — four-up card grid
- Clubs directory — sixteen-card grid
- Players directory — thirteen-card grid

Per §12, cards are a tool, not a design language. Several of these would be
stronger as tables, rules-separated lists, or editorial compositions.

## 2.6 Weak editorial composition

The design direction (§6, §20) calls for rhythm — alternating dense information,
spacious moments, large imagery and strong typography. The current site alternates
between *card grid* and *card grid*. The homepage has good bones (dark identity
band, attached stat band, lead-story news split) but the directory pages have no
composition at all.

## 2.7 No league photography

There is no matchday, ground, supporter or action photography anywhere on the
site. Per §10, imagery should carry a large part of KNSCL's identity. Currently
the only large photograph on the entire site belongs to Arsenal (§1.1).

## 2.8 Invented brand identity

The `KN` wordmark, the teal primary and the gold accent were inferred during the
redesign, not supplied by the league. There is no official KNSCL badge or colour
specification in the system. Per §25, the objective is a recognisable KNSCL
identity — which cannot be finalised without the league's actual brand assets.

---

# 3. PROBLEMS RANKED BY IMPACT

## CRITICAL — immediately damages credibility

| # | Problem | Type |
|---|---|---|
| C1 | EPL/international news presented as KNSCL league news, with an Arsenal photo as the homepage lead | Content |
| C2 | "Real Madrid" listed as a member club, using the genuine crest (also a trademark/copyright exposure) | Content |
| C3 | Manager fields populated with lowercase club names instead of people | Content |

These three are visible within the first five seconds of landing on the site and
each independently signals "this is not real". **Nothing else should be worked on
before these are resolved.**

## HIGH — significantly affects perceived quality

| # | Problem | Type |
|---|---|---|
| H1 | 15 of 16 clubs have zero registered players | Content |
| H2 | 14 of 16 clubs have no home venue; fixtures inherit "Venue TBC" | Content |
| H3 | Homepage leads with an empty results block and an all-zero table | UX |
| H4 | Clubs directory is a repetitive 16-card grid with no identity | UX |
| H5 | Players presented as circular profile avatars with no football context | UX |
| H6 | No league photography anywhere on the site | Content + UX |

## MEDIUM — address after the major issues

| # | Problem | Type |
|---|---|---|
| M1 | Implausible or missing founding years (1900, 1909, 1926, two absent) | Content |
| M2 | Missing player position, shirt number and statistics | Content |
| M3 | Weak information hierarchy on directory pages | UX |
| M4 | Over-reliance on cards as the default container | UX |
| M5 | Generic placeholder hero copy | Content |
| M6 | Footer/contact details not configured in Site Content | Content |
| M7 | Player photographs inconsistent, with background-removal artefacts | Content |

## LOW — polish

| # | Problem | Type |
|---|---|---|
| L1 | "Divison" spelling error in a news headline (removed with C1) | Content |
| L2 | Possible club-name misspelling — "Green Berrets" / "green berrest" | Content |
| L3 | No sponsors recorded; Partners section absent | Content |
| L4 | Brand identity (mark, colours) still inferred rather than official | Design |
| L5 | Investigate whether fixtures created before venue assignment retain "TBC" | Technical |

---

# 4. RECOMMENDED ORDER OF WORK

The ordering follows §23 of the design direction — **remove before adding** — and
front-loads the work that changes perception most per unit of effort.

### Stage 1 — Remove what is damaging *(content; hours, not days)*
1. Delete all four EPL/international news items (**C1**).
2. Delete or rename the "Real Madrid" club entry (**C2**).
3. Replace the manager fields with real people's names (**C3**).

> Stage 1 requires no code changes and no deployment. It is the single highest-value
> block of work available and should be completed before anything else begins.

### Stage 2 — Complete the essential record *(content)*
4. Assign home venues to the remaining 14 clubs (**H2**), then re-check that
   upcoming fixtures pick them up (**L5**).
5. Register squads for the remaining 15 clubs (**H1**), including position and
   shirt number (**M2**).
6. Correct or clear the implausible founding years (**M1**).
7. Publish one genuine KNSCL news item — even three sentences — so the newsroom
   has real content (supports **C1**).
8. Configure contact details, address and season copy in Site Content (**M6**, **M5**).

### Stage 3 — Fix the pre-season experience *(code)*
9. Reorder the homepage so that, before any match is played, it leads with clubs,
   opening fixtures and registration rather than empty results and a zero table (**H3**).
10. Reframe zero-state statistics so they read as "season starts 9 August" rather
    than as missing data (**H3**).

### Stage 4 — Rebuild the directory pages *(code)*
11. Replace the clubs card grid with an editorial composition that uses crests,
    grounds and squad size with real hierarchy (**H4**, **M3**).
12. Rebuild the players directory around football identity — number, position,
    club, statistics — rather than circular avatars (**H5**, **M3**).
13. Reduce card usage across the site where a list, table or open layout is
    stronger (**M4**).

### Stage 5 — Identity and imagery *(content-led, then code)*
14. Source and upload authentic KNSCL photography: matchday, grounds, supporters,
    training (**H6**).
15. Integrate photography into the homepage, club pages and newsroom once it exists.
16. Obtain the official KNSCL badge and colour specification, then replace the
    inferred `KN` mark and palette (**L4**).
17. Add sponsors as they are confirmed (**L3**).

---

## Ownership summary

| Stage | Owner | Requires deployment |
|---|---|---|
| 1 — Remove damaging content | Platform Owner | No |
| 2 — Complete the record | Platform Owner / League Manager / Team Managers | No |
| 3 — Pre-season experience | Development | Yes |
| 4 — Directory pages | Development | Yes |
| 5 — Identity and imagery | League (assets) → Development | Yes |

**Stages 1 and 2 are not blocked by anything and do not require a developer.**
They will improve the site more than Stages 3 and 4 combined.

---

## Appendix A — Club directory as observed (9 August 2026)

| Club | Home ground | Manager field | Founded | Squad |
|---|---|---|---|---|
| 3 Brothers | Kakanjuni Ground | 3Brothers F | 2010 | 13 |
| Bata Bullets | Bata Ground Kiwandani | bata bullets | 2001 | 0 |
| Big Lapa | TBC | big lapa | 2000 | 0 |
| Black Pirates | TBC | black pirates | 2002 | 0 |
| Chuggah United | TBC | chuggah united | — | 0 |
| Green Berrets | TBC | green berrest | 1926 | 0 |
| Kanani | TBC | kanani Fc | 2008 | 0 |
| Kiriba United | TBC | kiriba united | 2015 | 0 |
| Mgandini | TBC | mgandini Fc | — | 0 |
| Mida Creek | TBC | mida creek | 2011 | 0 |
| Ngala United | TBC | ngala united | 1900 | 0 |
| Pana | TBC | pana Fc | 2014 | 0 |
| Real Madrid | TBC | real madrid | 2018 | 0 |
| Takaungu United | TBC | takaungu united | 1982 | 0 |
| Tezo Stars Junior | TBC | tezo junior | 2019 | 0 |
| Young Hiroz | TBC | young hiroz | 1909 | 0 |

**Totals:** 16 clubs · 13 players · 0 matches played · 0 goals scored · 0 sponsors

---

## Appendix B — What is working

Recorded so that future work does not regress it:

- Masthead: two-tier, dark, with rule-marked active section
- Typography: Archivo + IBM Plex Sans; tabular figures on scores and standings
- League table: points column correctly dominant; leader rule; responsive column dropping
- Matchday lists: grouped by date, home–score–away, losing side recedes
- Club and player pages: dark identity band with attached statistics band
- Fixture venue automation: correctly derives from the home club's registered ground
- Empty states: present and correctly worded everywhere (the problem is how many are showing, not their quality)
- Public pages remain server-rendered at 219 B of client JavaScript
- Private data boundary holds — no national IDs, phone numbers or emergency contacts exposed
