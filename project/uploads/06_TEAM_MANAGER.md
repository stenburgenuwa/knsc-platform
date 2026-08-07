# KNSCL PLATFORM
# TASK 06 – TEAM_MANAGER IMPLEMENTATION SPECIFICATION

**Document Version:** 1.0  
**Status:** Approved  
**Category:** Core Platform Module  
**Priority:** Critical  
**Dependencies:**

- MASTER_BUILD_PROMPT.md
- 01_DATABASE.md
- 02_AUTHENTICATION.md
- 03_PLATFORM_OWNER.md
- 04_LEAGUE_MANAGER.md
- 05_REFEREE_MANAGER.md
- RBAC Module

---

# 1. PURPOSE

This document defines the complete implementation of the **Team Manager Module** for the Kenya National Sub County League (KNSCL) Platform.

The Team Manager represents a football club within the system and is responsible for managing club players, preparing team sheets, monitoring fixtures, receiving announcements, and maintaining accurate club information.

The Team Manager does **not** manage league administration, referee assignments, or system settings.

The Team Manager is the official representative of the football club within the platform.

---

# 2. ROLE OVERVIEW

Each football club shall have **only one Team Manager** during the Kilifi County Pilot.

The Team Manager account is created by the Platform Owner.

After receiving login credentials, the Team Manager becomes responsible for:

- Managing club information
- Registering players
- Updating player profiles
- Preparing match day team sheets
- Viewing fixtures
- Viewing league standings
- Viewing club statistics
- Receiving announcements
- Managing player availability
- Viewing match reports

---

# 3. DASHBOARD

After successful login the Team Manager shall be redirected to:

```

/dashboard/team-manager

```

---

# 4. DASHBOARD LAYOUT

## Header

Display:

- Club Logo
- Club Name
- Current League
- Current Season
- Notifications
- Search
- Profile
- Logout

---

## Sidebar

Dashboard

Club Profile

Players

Player Registration

Fixtures

Team Sheets

League Table

Results

Statistics

Announcements

Reports

Settings

---

## Dashboard Summary Cards

Display:

- Registered Players
- Pending Registrations
- Approved Players
- Upcoming Fixture
- Matches Played
- Team Sheet Status
- Club Position
- Goals Scored
- Goals Conceded

---

# 5. CLUB PROFILE

Display:

Club Logo

Club Banner

Club Colours

Club Name

League

Home Ground

Founded Year

Club Motto

Team Manager

Phone Number

Email

Club Status

The Team Manager **cannot edit** branding information.

Branding is managed exclusively by the Platform Owner.

---

# 6. PLAYER MANAGEMENT

The Team Manager is responsible for registering players.

---

## Register Player

The registration form shall contain:

Player Photograph

Full Name

Registration Number

Jersey Number

Date of Birth

National ID / Birth Certificate Number

Phone Number

Position

Height

Weight

Preferred Foot

Emergency Contact

Medical Notes (Future)

Status

---

## Validation Rules

Prevent:

Duplicate Registration Number

Duplicate National ID

Missing Photograph

Missing Required Fields

Invalid Date of Birth

Duplicate Jersey Number within the Club

---

## Registration Workflow

Team Manager

↓

Complete Registration Form

↓

Upload Photograph

↓

Save Registration

↓

Status = Pending Approval

↓

Platform Owner / League Manager Reviews

↓

Approved

Rejected

Correction Requested

---

# 7. PLAYER PROFILE

Each player profile shall display:

Player Photograph

Full Name

Registration Number

Jersey Number

Position

Date of Birth

Phone Number

Height

Weight

Preferred Foot

Emergency Contact

Approval Status

Season Statistics

---

## Future Statistics

Matches Played

Goals

Assists

Yellow Cards

Red Cards

Minutes Played

Player Rating

---

# 8. PLAYER SEARCH

Search by:

Player Name

Registration Number

Jersey Number

Position

Status

---

# 9. PLAYER STATUS

Supported Statuses:

Pending Approval

Approved

Rejected

Suspended

Inactive

Transferred (Future)

Released (Future)

---

# 10. TEAM SHEET MANAGEMENT

This is one of the most important responsibilities of the Team Manager.

Before every fixture, the Team Manager shall prepare the official team sheet.

---

## Team Sheet Workflow

Upcoming Fixture

↓

Open Fixture

↓

Select Starting XI

↓

Select Seven Substitutes

↓

Assign Jersey Numbers

↓

Assign Captain

↓

Save Team Sheet

↓

Submit Team Sheet

↓

Team Sheet Locked

↓

Automatically Available in Referee Dashboard

---

## Team Sheet Rules

Exactly:

11 Starting Players

7 Substitutes

Total = 18 Players

No duplicate player

Approved players only

Suspended players cannot be selected

Rejected players cannot be selected

---

## Team Sheet Display

### Starting XI

Display:

Player Photograph

Player Name

Jersey Number

Position

Captain Indicator

---

### Substitutes

Display:

Player Photograph

Player Name

Jersey Number

Position

---

## Team Sheet Deadline

The Team Manager may edit the team sheet **until kickoff time**.

At kickoff:

The system shall automatically lock the team sheet.

No further edits shall be permitted.

---

# 11. FIXTURES

The Team Manager may:

View Fixtures

Search Fixtures

Filter Fixtures

View Match Details

Download Fixture List

Print Fixtures

Cannot:

Create Fixtures

Edit Fixtures

Delete Fixtures

---

Fixture Information

Fixture Number

Competition

Home Team

Away Team

Venue

Kickoff Time

Round

Assigned Referee

Status

---

# 12. MATCH RESULTS

Display:

Final Score

Goalscorers

Yellow Cards

Red Cards

Substitutions

Match Report

Team Statistics

---

# 13. LEAGUE TABLE

Display:

Position

Club

Played

Won

Drawn

Lost

Goals For

Goals Against

Goal Difference

Points

Last Five Matches

---

# 14. CLUB STATISTICS

Display:

Matches Played

Wins

Draws

Losses

Goals Scored

Goals Conceded

Goal Difference

Average Goals

Current Form

---

Future Statistics

Clean Sheets

Possession

Pass Accuracy

Shots

Corners

---

# 15. ANNOUNCEMENTS

Receive announcements from:

Platform Owner

League Manager

Referee Manager (where relevant)

Display:

Title

Message

Sender

Date

Priority

Attachments

---

# 16. REPORTS

Generate:

Registered Players

Pending Players

Fixture List

Results

Club Statistics

Player Statistics

Team Sheets

Export:

PDF

Excel

CSV

Print

---

# 17. NOTIFICATIONS

Receive notifications for:

Player Approved

Player Rejected

Fixture Published

Fixture Rescheduled

Fixture Cancelled

Team Sheet Reminder

League Announcement

Emergency Notice

---

Supported Channels

Dashboard Notification

SMS

Email (Future)

Push Notification (Future)

---

# 18. AUDIT LOGGING

Every action shall be logged.

Examples:

Player Registered

Player Updated

Player Deleted

Team Sheet Submitted

Team Sheet Updated

Report Downloaded

Login

Logout

---

# 19. SECURITY

The Team Manager may access:

Own Club Only

Own Players

Own Team Sheets

Own Statistics

Own Reports

Cannot:

Access another Club

Access another Team Manager

Approve Players

Assign Referees

Edit League Information

Manage Users

---

# 20. RESPONSIVE DESIGN

Dashboard shall support:

Desktop

Tablet

Mobile

Responsive Tables

Collapsible Sidebar

Large Touch Targets

Offline-friendly caching (Future)

---

# 21. VALIDATION RULES

Prevent:

Duplicate Registration Numbers

Duplicate Jersey Numbers

More than 18 Players

Less than 11 Starting Players

Duplicate Team Sheet Submission

Late Team Sheet Editing

Unapproved Player Selection

---

# 22. ERROR HANDLING

Handle:

Permission Denied

Player Already Registered

Network Failure

Upload Failure

Invalid Photograph

Duplicate Registration

Fixture Locked

Team Sheet Locked

---

# 23. FUTURE ENHANCEMENTS

Future releases should include:

Player Medical Records

Player Contracts

Player Transfers

Player Loans

Player Attendance

Training Management

Fitness Monitoring

GPS Tracking

Match Performance Analytics

AI Team Selection Suggestions

---

# 24. ACCEPTANCE CRITERIA

This module is complete when:

- Team Manager dashboard is operational.
- Player registration workflow is complete.
- Player profile management is functional.
- Team sheet creation works correctly.
- Team sheets automatically appear in the assigned referee's dashboard.
- Team sheet locking at kickoff functions correctly.
- Fixtures and results display accurately.
- Reports export correctly.
- Notifications are received.
- Audit logging is operational.
- RBAC restrictions are enforced.
- Responsive design is verified.

---

# 25. DEFINITION OF DONE

The Team Manager module is complete when:

- All player management workflows function correctly.
- Team sheet workflow is fully operational.
- Referee integration is complete.
- Fixture information is synchronized.
- Reports generate successfully.
- Security testing passes.
- Mobile testing passes.
- Performance testing passes.
- Documentation is updated.

---

# 26. AI IMPLEMENTATION INSTRUCTIONS

When implementing this module:

- The Team Manager must only manage **one club**.
- Load all club information dynamically from the database.
- Never hardcode players, fixtures, or club details.
- Team sheets must always contain exactly **18 players (11 starters + 7 substitutes)**.
- Automatically send completed team sheets to the assigned referee's dashboard.
- Lock team sheets automatically at kickoff.
- Prevent unauthorized player selection.
- Build reusable player cards, team sheet components, and fixture views.
- Ensure all permissions are enforced through backend RBAC.
- Log every player registration, update, and team sheet submission.
- Design the module to support future features such as transfers, medical records, and advanced player statistics without requiring major architectural changes.