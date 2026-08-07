# KNSCL PLATFORM
# TASK 01 - DATABASE IMPLEMENTATION SPECIFICATION

**Document Version:** 1.0  
**Status:** Approved  
**Category:** Implementation Task  
**Priority:** Critical  
**Dependencies:** MASTER_BUILD_PROMPT.md

---

# 1. PURPOSE

This document defines the complete database architecture for the Kenya National Sub County League (KNSCL) Platform.

It serves as the implementation blueprint for developers and AI coding assistants such as Claude Code, Replit Agent, Cursor, Lovable, Bolt, Firebase Studio, and similar platforms.

The database is the foundation of the application. Every module, dashboard, workflow, report, notification, and API depends on this design.

The database must be designed to support:

- The Kilifi County pilot
- Future county leagues
- Regional competitions
- National competitions
- Unlimited clubs
- Unlimited players
- Unlimited referees
- Unlimited seasons
- Future integrations with CAF and FIFA systems

---

# 2. DATABASE DESIGN PRINCIPLES

The database shall follow the principles below.

## 2.1 Database First

No business information shall be hardcoded.

Every club, player, fixture, referee, team sheet, and match report must originate from the database.

---

## 2.2 Single Source of Truth

Each entity must exist only once.

Avoid duplicated information.

Example:

Player information belongs only in the Players table.

Do not duplicate player names inside Match Reports.

Reference the Player ID instead.

---

## 2.3 Scalability

The schema must support:

- Multiple leagues
- Multiple seasons
- Multiple counties
- Multiple divisions
- Multiple competitions

without redesign.

---

## 2.4 Normalization

The database should be normalized to at least Third Normal Form (3NF).

Avoid unnecessary duplication.

---

## 2.5 Auditability

Every important record should include:

- Created By
- Created Date
- Updated By
- Updated Date
- Deleted By
- Deleted Date
- Status

---

# 3. DATABASE STANDARDS

## Primary Keys

Every table shall use UUID identifiers.

Example

```text
club_id

player_id

fixture_id

league_id
```

Never use auto-increment integers as public identifiers.

---

## Foreign Keys

All relationships must enforce referential integrity.

No orphan records should exist.

---

## Soft Deletes

Never permanently delete operational data.

Instead include:

```text
deleted_at

deleted_by
```

---

## Timestamps

Every table must contain:

```text
created_at

updated_at
```

---

## Status Fields

Use explicit status values.

Example

```text
Active

Inactive

Archived

Suspended
```

---

# 4. CORE DATABASE MODULES

The platform database shall be organized into logical domains.

## Platform

- Users
- Roles
- Permissions
- Audit Logs
- Notifications
- Settings

---

## Competition

- Leagues
- Seasons
- Fixtures
- Standings
- Match Reports

---

## Clubs

- Clubs
- Team Managers
- Club Branding

---

## Players

- Players
- Registrations
- Team Sheets
- Player Statistics

---

## Referees

- Referees
- Referee Assignments
- Match Officials

---

## Public Website

- News
- Announcements
- Sponsors
- Galleries
- Downloads

---

# 5. ENTITY RELATIONSHIP OVERVIEW

The major relationships are:

Platform Owner
│
├── League
│
├── Clubs
│      │
│      ├── Team Manager
│      │
│      └── Players
│
├── Referee Manager
│      │
│      └── Referees
│
├── Fixtures
│      │
│      ├── Team Sheets
│      ├── Match Reports
│      └── Statistics
│
└── Public Website

---

# 6. TABLE: USERS

Purpose

Stores every authenticated user.

Fields

- user_id (UUID)
- username
- email
- password_hash
- role_id
- phone_number
- status
- last_login
- created_at
- updated_at
- deleted_at

Relationships

- One Role
- One User Profile
- Many Audit Logs

Business Rules

- Username must be unique.
- Email must be unique.
- Passwords are stored only as secure hashes.
- Suspended users cannot authenticate.

---

# 7. TABLE: ROLES

Purpose

Defines system roles.

Initial records

- Platform Owner
- League Manager
- Referee Manager
- Team Manager
- Referee

Fields

- role_id
- role_name
- description
- created_at
- updated_at

---

# 8. TABLE: LEAGUES

Purpose

Stores football leagues.

Fields

- league_id
- league_name
- county
- season
- status
- description
- logo
- created_at
- updated_at

Relationships

- Many Clubs
- Many Fixtures
- Many League Managers

Business Rules

- Only Platform Owner creates leagues.
- League names must be unique within a season.

---

# 9. TABLE: CLUBS

Purpose

Stores football clubs.

Fields

- club_id
- league_id
- club_name
- short_name
- logo
- banner
- primary_colour
- secondary_colour
- year_established
- home_ground
- status
- created_at
- updated_at

Relationships

- One League
- One Team Manager
- Many Players
- Many Fixtures

Business Rules

- Clubs are created only by the Platform Owner.
- Club branding changes are reflected immediately on the public website.

---

# 10. TABLE: PLAYERS

Purpose

Stores all registered players.

Fields

- player_id
- club_id
- registration_number
- full_name
- photograph
- jersey_number
- date_of_birth
- national_id_or_birth_certificate
- phone_number
- position
- preferred_foot
- height
- weight
- emergency_contact
- status
- created_at
- updated_at

Relationships

- One Club
- Many Match Appearances
- Many Team Sheets

Business Rules

- Registration number must be unique.
- Photograph is mandatory.
- Players are registered by Team Managers.
- Player registrations require approval by the Platform Owner or League Manager.

---

# CONTINUED

This document continues with:

- Fixtures
- Team Sheets
- Referee Tables
- Referee Assignments
- Match Reports
- Goals
- Yellow Cards
- Red Cards
- Substitutions
- League Table Calculations
- Statistics
- Notifications
- Audit Logs
- Indexing Strategy
- Database Constraints
- Seed Data
- Migrations
- Performance Optimizations
- Backup Strategy
- Acceptance Criteria
- Definition of Done
- AI Development Instructions