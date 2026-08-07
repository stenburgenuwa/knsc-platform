# KNSCL PLATFORM
# PROJECT_RULES.md
## Global Development Rules & Engineering Standards

**Project:** Kilifi North Sub County League (KNSCL) Platform

**Version:** 1.0

**Status:** Mandatory

**Priority:** Critical

---

# PURPOSE

This document defines the non-negotiable engineering, architecture, UI, security, coding, database, and workflow rules that every AI coding assistant (Claude Code, Replit AI, Cursor, GitHub Copilot, Base44, Bolt, Lovable, Windsurf, etc.) must follow throughout the development of the KNSCL Platform.

These rules override implementation preferences and ensure the project remains consistent, maintainable, scalable, and production-ready.

Every implementation task must comply with these rules.

---

# GOLDEN RULE

> **Never sacrifice long-term maintainability for short-term convenience.**

The platform must always be built as if it will eventually support the entire Football Kenya Federation (FKF) league ecosystem.

---

# DEVELOPMENT PHILOSOPHY

The platform must always be:

- Database-driven
- Modular
- Secure
- Scalable
- Responsive
- Accessible
- Maintainable
- Well documented

Never build temporary solutions that create technical debt.

---

# IMPLEMENTATION ORDER

The AI must follow the implementation order exactly.

1. Database
2. Authentication
3. Platform Owner
4. League Manager
5. Referee Manager
6. Team Manager
7. Referee
8. Public Website
9. Testing
10. Deployment

Never skip ahead.

Never implement future modules before completing dependencies.

---

# UI DESIGN RULES

Once the prototype is approved:

## DO NOT

- Redesign pages
- Rearrange navigation
- Change colors
- Replace typography
- Remove approved components
- Introduce a new design language

Unless the Platform Owner explicitly requests it.

---

## ALWAYS

Maintain:

- Layout
- Typography
- Color palette
- Spacing
- Icons
- Navigation
- Component hierarchy
- Responsive behavior

Visual consistency is mandatory.

---

# COMPONENT REUSE

Before creating any new UI component:

Search for an existing component.

If one exists:

Reuse it.

Do not duplicate components.

Examples:

Buttons

Cards

Tables

Modals

Forms

Dropdowns

Alerts

Pagination

Statistics Cards

Profile Cards

Navigation

---

# DATABASE RULES

Never hardcode:

Players

Clubs

Fixtures

Referees

Leagues

Standings

News

Statistics

Announcements

Sponsors

Everything must come from the database.

---

Every database change must include:

Migration

Validation

Indexes

Relationships

Documentation

---

Never modify the schema without updating documentation.

---

# AUTHENTICATION RULES

All authentication must use secure backend validation.

Never trust frontend validation.

Passwords must always be hashed.

Sessions must be secure.

JWT secrets must never be hardcoded.

---

# ROLE-BASED ACCESS CONTROL (RBAC)

Every request must be validated on the backend.

Never rely on frontend hiding.

Users must never access:

Other clubs

Other team managers

Other referee dashboards

Administrative functions

Private player information

Unauthorized APIs

---

# API RULES

Every API endpoint must:

Validate authentication

Validate permissions

Validate input

Return consistent responses

Log important actions

Handle errors gracefully

---

Use REST naming conventions.

Example:

GET

POST

PUT

PATCH

DELETE

---

# CODING STANDARDS

Write clean code.

Functions should:

Do one thing.

Remain small.

Be reusable.

Be documented.

Avoid duplication.

Avoid unnecessary complexity.

---

Never leave:

Unused variables

Dead code

Debug statements

Temporary hacks

---

# FILE STRUCTURE

Maintain a logical folder structure.

Separate:

Frontend

Backend

Database

Components

Services

API

Hooks

Utilities

Documentation

Testing

Deployment

Never mix responsibilities.

---

# STATE MANAGEMENT

Centralize shared state.

Avoid duplicated state.

Use predictable state management.

Do not create multiple sources of truth.

---

# FORM VALIDATION

Validate:

Frontend

Backend

Database

Never rely on only one layer.

---

# ERROR HANDLING

Every error should:

Be logged.

Return meaningful messages.

Never expose internal server details.

Never expose database information.

Never expose stack traces in production.

---

# LOGGING

Log important events.

Examples:

Login

Logout

Player Registration

Player Approval

Referee Assignment

Fixture Changes

Match Report Submission

Password Reset

System Settings

---

# AUDIT TRAIL

Every administrative action must be traceable.

Store:

Who

What

When

Previous Value

New Value

IP Address (where applicable)

Timestamp

---

# PERFORMANCE

Always optimize for:

Fast loading

Minimal queries

Pagination

Caching

Image optimization

Code splitting

Lazy loading

Avoid unnecessary API calls.

---

# RESPONSIVE DESIGN

Every screen must work on:

Desktop

Laptop

Tablet

Mobile

No horizontal scrolling.

No broken layouts.

---

# ACCESSIBILITY

Meet WCAG accessibility principles.

Include:

Keyboard navigation

Alternative text

Semantic HTML

Sufficient color contrast

Visible focus indicators

Accessible form labels

---

# SECURITY

Protect against:

SQL Injection

XSS

CSRF

Broken Authentication

Broken Authorization

Session Hijacking

Brute Force Attacks

File Upload Abuse

Never trust user input.

---

# FILE UPLOADS

Allow only approved formats.

Validate:

File type

Size

Extension

Content

Future:

Virus scanning

---

# NOTIFICATIONS

Notifications should be reusable.

Support:

Dashboard

SMS

Email

Push Notifications (Future)

WhatsApp (Future)

---

# SMS RULES

Critical football events should generate SMS notifications.

Examples:

Referee Assignment

Password Reset

Fixture Changes

Emergency Announcements

Use retry logic if delivery fails.

Log failures.

---

# TESTING

Every feature requires:

Unit Tests

Integration Tests

Manual Testing

Role Testing

Regression Testing

Do not deploy untested code.

---

# DOCUMENTATION

Every completed feature should update:

Architecture

Database

API

Tasks

README

Deployment documentation

Documentation must stay synchronized with the implementation.

---

# VERSION CONTROL

Commit after every completed module.

Example:

```
feat: implement authentication module

feat: implement referee manager

fix: team sheet validation

docs: update deployment guide
```

Never combine unrelated changes into one commit.

---

# FUTURE FEATURES

Design for future expansion.

Examples:

Assistant Referees

Women's League

Youth League

National Competitions

CAF Integration

FIFA Connect

Live Scores

Fantasy League

Mobile Apps

AI Analytics

Do not hardcode assumptions that prevent scaling.

---

# AI DEVELOPMENT RULES

When using AI coding assistants:

Implement only the requested task.

Never modify completed modules unless necessary.

Preserve all approved UI.

Do not invent new workflows.

Do not remove existing functionality.

Do not simplify specifications.

Ask for clarification if a requirement conflicts with previous documentation.

---

# DEFINITION OF DONE

A task is complete only when:

- Functionality is implemented.
- UI matches the approved prototype.
- Backend logic is complete.
- Database integration works.
- Validation is complete.
- RBAC is enforced.
- Errors are handled.
- Logging is implemented.
- Tests pass.
- Documentation is updated.
- Code is production-ready.

---

# PROJECT SUCCESS CRITERIA

The KNSCL Platform will be considered successful when it:

- Supports the Kilifi County pilot without major code changes.
- Scales to multiple counties and leagues.
- Maintains consistent UI and UX across all modules.
- Enforces secure role-based access control.
- Provides reliable match management workflows.
- Automatically updates public-facing data from the database.
- Is maintainable by future developers.
- Is ready for production deployment with minimal additional engineering.

---

# FINAL INSTRUCTION TO ALL AI CODING ASSISTANTS

Before writing any code:

1. Read `MASTER_BUILD_PROMPT.md`.
2. Read `PROJECT_RULES.md`.
3. Read only the specific task document being implemented.
4. Verify dependencies are already complete.
5. Implement only the requested module.
6. Do not redesign approved interfaces.
7. Reuse existing components wherever possible.
8. Validate all inputs on the backend.
9. Write clean, documented, production-quality code.
10. Stop after completing the requested task and wait for review before proceeding to the next one.

These rules are mandatory and apply to every stage of development, regardless of the AI platform or programming environment being used.