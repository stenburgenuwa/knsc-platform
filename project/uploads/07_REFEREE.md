# KNSCL PLATFORM
# TASK 07 – REFEREE IMPLEMENTATION SPECIFICATION

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
- 06_TEAM_MANAGER.md
- RBAC Module

---

# 1. PURPOSE

This document defines the complete implementation of the **Referee Module** for the Kenya National Sub County League (KNSCL) Platform.

The Referee Module enables referees to:

- Receive match appointments
- View assigned fixtures
- Receive automatic SMS notifications
- Review official team sheets
- Officiate assigned matches
- Submit official match reports
- Review previous reports
- Manage personal profile

A referee can only access fixtures assigned to them by the Referee Manager.

---

# 2. ROLE OVERVIEW

The Referee is responsible for ensuring that official match information entered into the platform is accurate and submitted immediately after the match.

Responsibilities include:

- View assigned fixtures
- View official team sheets
- Officiate assigned matches
- Submit match reports
- Review previous reports
- Update availability
- Manage personal profile

A referee **cannot**:

- Register players
- Edit team sheets
- Assign referees
- Edit fixtures
- Approve registrations
- Change league settings
- Edit league standings

---

# 3. DASHBOARD

After successful login the referee shall be redirected to:

```

/dashboard/referee

```

---

# 4. DASHBOARD LAYOUT

## Header

Display:

- KNSCL Logo
- Competition Name
- Current Season
- Notification Bell
- Search
- User Profile
- Logout

---

## Sidebar

Dashboard

Upcoming Matches

Today's Matches

Previous Matches

Team Sheets

Submit Match Report

Availability

Statistics

Announcements

Profile

---

## Dashboard Summary Cards

Display:

Upcoming Assignments

Today's Matches

Completed Matches

Pending Match Reports

Reports Submitted

Average Submission Time

Unread Notifications

---

# 5. MATCH ASSIGNMENTS

The referee shall only see matches assigned by the Referee Manager.

Each fixture card should display:

Fixture Number

League

Round

Home Club

Away Club

Venue

Kickoff Time

Date

Status

---

## Assignment Status

Upcoming

Today

Completed

Cancelled

Postponed

---

# 6. SMS NOTIFICATIONS

Immediately after a referee is assigned to a fixture, the system shall automatically send an SMS.

Example:

```
KNSCL Match Assignment

Hello Peter Mwakio,

You have been appointed to officiate the following match.

League:
Kilifi County League

Fixture:
Kilifi United vs Malindi Heroes

Venue:
Karisa Maitha Stadium

Date:
15 August 2026

Kickoff:
3:00 PM

Please log into your KNSCL dashboard to review the official team sheets.

Thank you.

KNSCL
```

The SMS shall be sent automatically.

If delivery fails:

- Retry automatically.
- Record failure in Audit Log.
- Notify the Referee Manager.

---

# 7. TEAM SHEETS

One hour before kickoff (or immediately after both Team Managers submit them), the referee dashboard shall display:

## Home Team

Club Logo

Starting XI

Seven Substitutes

Captain

Coach

Team Manager

Player Photographs

Player Names

Jersey Numbers

Positions

---

## Away Team

Club Logo

Starting XI

Seven Substitutes

Captain

Coach

Team Manager

Player Photographs

Player Names

Jersey Numbers

Positions

---

## Team Sheet Rules

The referee may:

View Team Sheets

Zoom Player Photos

Print Team Sheets

Download PDF

The referee may **not**:

Edit Team Sheets

Replace Players

Change Jersey Numbers

Change Captains

Approve Team Sheets

---

# 8. MATCH DAY WORKFLOW

The referee workflow shall be:

Receive Assignment

↓

Receive SMS

↓

Login

↓

Review Fixture Details

↓

Review Team Sheets

↓

Travel to Venue

↓

Officiate Match

↓

Open Match Report

↓

Submit Match Report

↓

League Table Updates Automatically

---

# 9. MATCH REPORT

After the match ends, the referee shall complete the official match report.

Required fields:

Fixture Number

Competition

Venue

Kickoff Time

End Time

Final Score

Winning Team

Match Status

---

## Goals

For every goal record:

Goal Scorer

Club

Minute

Own Goal

Penalty

Assist (Future)

---

## Yellow Cards

Player

Club

Minute

Reason

---

## Red Cards

Player

Club

Minute

Reason

Second Yellow (Yes/No)

---

## Substitutions

Player Out

Player In

Club

Minute

---

## Match Comments

Free text field for:

Important incidents

Crowd behaviour

Weather

Injuries

Delays

General observations

---

## Match Status

Completed

Abandoned

Postponed

Suspended

Walkover

---

If a match is abandoned the referee must provide:

Reason

Minute Abandoned

Supporting Notes

---

# 10. SUBMISSION WORKFLOW

Match Ends

↓

Referee Opens Match Report

↓

Completes Report

↓

Validates Information

↓

Submits Report

↓

Report Locked

↓

League Manager Reviews

↓

Standings Updated

---

# 11. PREVIOUS MATCHES

Display:

Fixture

Date

Venue

Final Score

League

Report Status

Download Report

---

# 12. REFEREE PROFILE

Display:

Photograph

Full Name

Referee Number

Phone Number

Email

County

Category

Years of Experience

Status

---

Statistics

Matches Officiated

Reports Submitted

Yellow Cards Issued

Red Cards Issued

Late Reports

Upcoming Assignments

---

# 13. AVAILABILITY

The referee may update:

Available

Unavailable

On Leave

Injured

Busy

The Referee Manager shall immediately see these changes.

Unavailable referees shall not be suggested during referee assignment.

---

# 14. ANNOUNCEMENTS

Receive announcements from:

Platform Owner

League Manager

Referee Manager

Display:

Title

Sender

Priority

Date

Attachments

---

# 15. NOTIFICATIONS

Receive notifications for:

New Assignment

Fixture Rescheduled

Fixture Cancelled

Reminder Before Match

Reminder To Submit Match Report

Competition Announcement

Emergency Notice

---

Supported Channels

Dashboard

SMS

Email (Future)

Push Notification (Future)

---

# 16. REPORT HISTORY

The referee shall have access to every report they have submitted.

Search by:

Fixture

Date

League

Club

Status

---

Reports should support:

View

Download PDF

Print

---

# 17. AUDIT LOGGING

Log:

Login

Logout

Availability Updated

Report Started

Report Saved

Report Submitted

Download Report

SMS Sent

---

# 18. SECURITY

The referee may only access:

Assigned Fixtures

Assigned Team Sheets

Own Profile

Own Statistics

Own Reports

The referee may never access:

Other Referee Reports

Other Fixtures

Player Registration

Club Administration

League Administration

System Settings

Every request must be validated through backend RBAC.

---

# 19. RESPONSIVE DESIGN

The referee dashboard should be optimized for:

Desktop

Tablet

Mobile

Large touch buttons

Fast loading

Offline-friendly architecture (Future)

Since many referees will use smartphones on match day, the mobile experience should receive the highest priority.

---

# 20. VALIDATION RULES

The system shall prevent:

Submitting incomplete reports

Duplicate report submission

Missing final score

Missing match status

Invalid player references

Duplicate goals

Duplicate substitutions

Invalid card records

Submission for unassigned fixture

---

# 21. ERROR HANDLING

Handle:

Network interruption

Database failure

Session timeout

Permission denied

Fixture unavailable

Report already submitted

SMS failure

Unexpected server error

---

# 22. FUTURE ENHANCEMENTS

Future releases should include:

Assistant Referee Reports

Fourth Official Reports

VAR Reports

Digital Match Cards

Live Match Events

GPS Match Tracking

Voice Match Reporting

AI Match Report Validation

Video Uploads

Photo Evidence

Match Observer Evaluation

Referee Performance Ratings

---

# 23. ACCEPTANCE CRITERIA

The Referee module is complete when:

- Referee can securely log in.
- Assigned fixtures display correctly.
- SMS notifications are automatically sent after assignment.
- Official team sheets are visible before kickoff.
- Team sheets cannot be edited by the referee.
- Match reports can be submitted successfully.
- Match reports automatically update league standings after approval.
- Availability updates are visible to the Referee Manager.
- Previous reports can be viewed and downloaded.
- Notifications function correctly.
- Audit logs capture all referee activities.
- Mobile responsiveness is verified.
- RBAC restrictions are fully enforced.

---

# 24. DEFINITION OF DONE

The Referee module is considered complete when:

- Dashboard is fully operational.
- Assignment workflow is complete.
- Team sheet integration is complete.
- Match report workflow is complete.
- Availability management functions correctly.
- Notification system operates correctly.
- Security testing passes.
- Performance testing passes.
- Mobile testing passes.
- Documentation is complete.

---

# 25. AI IMPLEMENTATION INSTRUCTIONS

When implementing this module:

- A referee must only access fixtures assigned to them.
- Automatically display official team sheets prepared by Team Managers.
- Lock submitted match reports to prevent editing unless reopened by an authorized administrator.
- Trigger automatic notifications and reminders before kickoff and after the match if a report has not been submitted.
- Use reusable components for fixtures, team sheets, match reports, and notifications.
- Validate all match events against registered players and submitted team sheets.
- Enforce all permissions through backend RBAC rather than frontend logic.
- Record every referee action in the Audit Log.
- Design the module for future expansion to support assistant referees, fourth officials, VAR, observer reports, and national-level competitions without requiring architectural redesign.