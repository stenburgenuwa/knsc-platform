# KNSCL PLATFORM
# TASK 05 – REFEREE_MANAGER IMPLEMENTATION SPECIFICATION

**Document Version:** 1.0  
**Status:** Approved  
**Category:** Core Platform Module  
**Priority:** High  
**Dependencies:**
- MASTER_BUILD_PROMPT.md
- 01_DATABASE.md
- 02_AUTHENTICATION.md
- 03_PLATFORM_OWNER.md
- 04_LEAGUE_MANAGER.md
- RBAC Module

---

# 1. PURPOSE

This document defines the complete implementation of the **Referee Manager Module** for the Kenya National Sub County League (KNSCL) Platform.

The Referee Manager is responsible for the administration of all referees within an assigned league. This includes referee registration, account management, assignment of referees to fixtures, communication with referees, monitoring referee availability, reviewing submitted match reports, and evaluating referee performance.

The Referee Manager **does not manage football clubs or players**. Their responsibility is exclusively focused on match officials.

This document serves as the implementation blueprint for developers and AI coding assistants.

---

# 2. ROLE OVERVIEW

The Referee Manager is appointed by the Platform Owner.

The Referee Manager is responsible for:

- Registering referees.
- Editing referee information.
- Activating or suspending referees.
- Assigning referees to fixtures.
- Managing referee availability.
- Monitoring submitted match reports.
- Reviewing referee performance.
- Managing referee communications.

The Referee Manager **cannot:**

- Create leagues.
- Create clubs.
- Register players.
- Approve players.
- Change league settings.
- Manage Platform Owners.
- Manage Team Managers.
- Manage League Managers.

---

# 3. DASHBOARD

After login the Referee Manager shall be redirected to:

```
/dashboard/referee-manager
```

---

# 4. DASHBOARD LAYOUT

## Header

Display:

- League Logo
- League Name
- Current Season
- Notifications
- Search
- Profile
- Logout

---

## Sidebar

Dashboard

Referees

Assignments

Upcoming Matches

Submitted Reports

Performance

Availability

Announcements

Reports

Profile

---

## Dashboard Summary Cards

Display:

- Total Referees
- Active Referees
- Suspended Referees
- Fixtures Awaiting Assignment
- Fixtures Assigned
- Reports Awaiting Review
- Reports Submitted Today
- Upcoming Matches
- SMS Notifications Sent

---

# 5. REFEREE REGISTRATION

Only the Referee Manager may register referees.

## Registration Fields

- Passport Photograph
- Full Name
- National ID Number
- Date of Birth
- Gender
- Phone Number
- Email Address
- County
- Home Town
- Physical Address
- Referee Category
- Years of Experience
- Preferred Language
- Emergency Contact
- Username
- Temporary Password
- Status

---

## Validation Rules

The system shall validate:

- Duplicate National ID
- Duplicate Username
- Duplicate Phone Number
- Duplicate Email
- Missing Photograph
- Missing Required Fields

---

## Workflow

Referee Manager

↓

Create Referee

↓

Generate Username

↓

Generate Temporary Password

↓

Save Account

↓

Send SMS

↓

Referee Logs In

↓

Forced Password Change

↓

Account Activated

---

# 6. REFEREE PROFILE

Every referee profile shall display:

- Photograph
- Full Name
- Referee Number
- Category
- Phone Number
- Email
- County
- Status
- Experience
- Matches Officiated
- Yellow Cards Issued
- Red Cards Issued
- Average Match Rating
- Last Assignment
- Upcoming Assignments

---

# 7. REFEREE MANAGEMENT

The Referee Manager may:

- Register Referee
- Edit Referee
- Suspend Referee
- Activate Referee
- Archive Referee
- Reset Password
- View Match History
- View Performance
- View Availability

---

# 8. REFEREE ASSIGNMENT

The Referee Manager is solely responsible for assigning referees to matches.

The League Manager **cannot** assign referees.

---

## Assignment Workflow

Platform Owner

↓

Creates Fixture

↓

Fixture Appears in Referee Manager Dashboard

↓

Referee Manager Selects Fixture

↓

Choose Referee

↓

Assign Referee

↓

Assignment Saved

↓

SMS Notification Sent

↓

Dashboard Notification Sent

↓

Referee Accepts Assignment

↓

Fixture Status Updated

---

# 9. SMS NOTIFICATION WORKFLOW

Immediately after assigning a referee, the system shall automatically send an SMS.

Example:

```
KNSCL Assignment

Hello John Mwangi,

You have been assigned to officiate:

Home:
Kilifi United

vs

Malindi Heroes

Date:
14 August 2026

Kickoff:
3:00 PM

Venue:
Karisa Maitha Stadium

Please log into your dashboard to review the team sheets.

KNSCL
```

The SMS should be sent immediately after assignment.

If SMS delivery fails:

- Retry automatically.
- Log failure.
- Notify Referee Manager.

---

# 10. DASHBOARD NOTIFICATIONS

Assigned referees shall immediately receive:

- In-App Notification
- SMS Notification

Future versions:

- Email Notification
- Push Notification
- WhatsApp Notification

---

# 11. REFEREE AVAILABILITY

Referees may update:

- Available
- Unavailable
- On Leave
- Injured

The Referee Manager dashboard shall clearly display availability.

Unavailable referees should not appear in assignment suggestions.

---

# 12. MATCH DAY INFORMATION

For every assigned match the referee shall receive:

Fixture Number

League

Home Club

Away Club

Venue

Kickoff Time

Match Date

Round

Weather (Future)

Map Directions (Future)

---

# 13. TEAM SHEETS

The referee dashboard shall automatically display the team sheets submitted by both Team Managers.

Each team sheet shall include:

### Home Team

Starting XI

Substitutes

Coach

Team Manager

Captain

Player Photographs

Jersey Numbers

---

### Away Team

Starting XI

Substitutes

Coach

Team Manager

Captain

Player Photographs

Jersey Numbers

---

The referee **cannot edit** team sheets.

---

# 14. MATCH REPORTS

After the match the referee shall complete:

Final Score

Goalscorers

Yellow Cards

Red Cards

Substitutions

Match Comments

Match Status

Time Started

Time Ended

Abandoned Match Reason (if applicable)

---

# 15. MATCH REPORT REVIEW

The Referee Manager can:

View Reports

Review Reports

Return Report

Approve Report (Optional)

Export Report

---

# 16. REFEREE PERFORMANCE

Display:

Matches Officiated

Reports Submitted

Late Reports

Average Rating

Disciplinary Cases

Appointments This Season

Completed Matches

Cancelled Matches

---

Future Features

Observer Scores

Performance Analytics

Ranking

Promotion Recommendation

---

# 17. REPORTS

Generate:

Referee List

Assignment Report

Availability Report

Performance Report

Match Report Summary

Late Submission Report

Inactive Referee Report

Export:

PDF

Excel

CSV

Print

---

# 18. SEARCH

Global search should locate:

Referees

Assignments

Match Reports

Availability

Performance

---

# 19. AUDIT LOGS

Log:

Referee Created

Referee Edited

Password Reset

Assignment Created

Assignment Updated

Assignment Cancelled

SMS Sent

SMS Failed

Match Report Submitted

---

# 20. SECURITY

Only the Referee Manager may:

Register Referees

Assign Referees

Suspend Referees

Reset Referee Passwords

View Referee Reports

Every action must be validated by backend authorization.

---

# 21. RESPONSIVE DESIGN

The dashboard must function perfectly on:

Desktop

Tablet

Mobile

The referee assignment screen should be optimized for tablets since many match officials and administrators use them on match days.

---

# 22. VALIDATION RULES

Prevent:

Duplicate Assignments

Unavailable Referee Assignment

Suspended Referee Assignment

Fixture Conflicts

Double Booking

Invalid Match Dates

---

# 23. ERROR HANDLING

Handle:

SMS Failure

Database Failure

Permission Denied

Duplicate Assignment

Network Failure

Concurrent Editing

---

# 24. FUTURE ENHANCEMENTS

Future versions should include:

Assistant Referees

Fourth Officials

Referee Assessors

VAR Officials

Automatic Referee Scheduling

AI Assignment Recommendations

Travel Distance Optimization

Conflict of Interest Detection

Fitness Tracking

Digital Match Cards

Live Match Events

---

# 25. ACCEPTANCE CRITERIA

This module is complete when:

- Referee registration is operational.
- Referee editing works.
- Referee assignment works.
- SMS notifications are automatically sent.
- Dashboard notifications work.
- Team sheets are visible to assigned referees.
- Match reports are submitted successfully.
- Availability management works.
- Reports generate correctly.
- Audit logs are operational.
- RBAC restrictions are enforced.
- Mobile responsiveness is verified.

---

# 26. DEFINITION OF DONE

This module is complete when:

- All referee workflows operate correctly.
- SMS integration functions.
- Assignment conflicts are prevented.
- Team sheet integration is complete.
- Match reports are linked to fixtures.
- Audit logs capture all activities.
- Security testing passes.
- Performance testing passes.
- Responsive testing passes.
- Documentation is updated.

---

# 27. AI IMPLEMENTATION INSTRUCTIONS

When implementing this module:

- Treat the Referee Manager as the sole authority for referee administration.
- Do not allow League Managers to assign referees.
- Automatically trigger SMS and in-app notifications after every assignment.
- Prevent assignment conflicts using backend validation.
- Display live referee availability before assignment.
- Ensure referees can only view matches assigned to them.
- Automatically load the Home and Away team sheets into the referee dashboard after Team Managers submit them.
- Keep assignment, notification, reporting, and performance modules independent and reusable.
- Build clean, modular, production-ready code that can scale from the Kilifi County pilot to a nationwide football competition management platform.