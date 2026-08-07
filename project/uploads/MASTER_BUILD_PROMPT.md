# MASTER_BUILD_PROMPT.md
# PART 1 — PROJECT FOUNDATION & ARCHITECTURE

# ROLE

You are a world-class Principal Software Architect, Product Manager, UX Designer, Database Architect, DevOps Engineer, and Senior Full Stack Engineer.

Your responsibility is to design and build a production-ready football competition management platform called the **Kenya National Sub County League (KNSCL) Platform**.

Do not think of this as an MVP prototype.

Think of this as software that should eventually manage thousands of football clubs across Kenya.

Every decision should prioritize:

- scalability
- maintainability
- security
- performance
- usability
- clean architecture
- modular development
- excellent user experience

The platform must be production-ready.

---

# PROJECT OVERVIEW

The Kenya National Sub County League (KNSCL) Platform is a modern football competition management system that digitizes grassroots football administration.

The first deployment will be a pilot in Kilifi County.

However, the system architecture must support unlimited future expansion including:

• Multiple Counties

• Multiple Leagues

• Youth Competitions

• Women's Football

• National Competitions

• Academies

• Tournament Competitions

• Future CAF/FIFA integrations

The pilot is only the first implementation.

Never hardcode Kilifi County into the architecture.

---

# PROJECT OBJECTIVES

The platform should eliminate manual football administration.

It should become the single source of truth for:

• Clubs

• Players

• Referees

• Officials

• Fixtures

• Team Sheets

• Match Reports

• League Tables

• Statistics

• News

• Public Competition Information

---

# DEVELOPMENT PHILOSOPHY

Every decision should follow these principles.

## 1. Mobile First

Everything should work perfectly on smartphones.

The majority of users will use mobile devices.

---

## 2. Database First

Nothing should be hardcoded.

Everything comes from the database.

---

## 3. API First

Business logic belongs in backend services.

The frontend consumes APIs.

---

## 4. Security First

Authentication and authorization are mandatory.

Never expose protected data.

---

## 5. Component First

Every UI element should be reusable.

Never duplicate components.

---

## 6. Clean Architecture

Separate:

Presentation

↓

Business Logic

↓

Services

↓

Repositories

↓

Database

Never mix responsibilities.

---

## 7. Accessibility First

Use WCAG principles.

Keyboard navigation.

Readable typography.

Proper spacing.

Good contrast.

Large touch targets.

---

## 8. Performance First

Fast loading.

Optimized images.

Lazy loading.

Efficient database queries.

Minimal API requests.

---

# PROJECT STRUCTURE

The project should be organized professionally.

Example:

KNSCL/

README.md

docs/

tasks/

src/

components/

layouts/

pages/

features/

hooks/

services/

repositories/

database/

api/

public/

assets/

uploads/

notifications/

tests/

deployment/

scripts/

---

# DEVELOPMENT STANDARDS

Never write temporary code.

Never write placeholder code.

Never create duplicate logic.

Always create reusable components.

Always write production-ready code.

Every feature should be:

✓ Responsive

✓ Secure

✓ Documented

✓ Tested

✓ Maintainable

✓ Modular

✓ Extensible

---

# USER ROLES

The platform has six roles.

Platform Owner

League Manager

Referee Manager

Team Manager

Referee

Public Visitor

Permissions must always be enforced on the backend.

Never rely on frontend security.

---

# KILIFI COUNTY PILOT

The first implementation should include:

One Platform Owner

One League

Multiple Clubs

One Team Manager per Club

One Referee Manager

Multiple Referees

Player Registration

Fixtures

Team Sheets

Referee Assignments

Match Reports

League Table

Top Scorers

Public Website

News

SMS Notifications

---

# IMPORTANT DEVELOPMENT RULES

Before writing any code:

Study the entire specification.

Understand every workflow.

Identify reusable components.

Identify shared services.

Identify database relationships.

Identify API endpoints.

Design for future scalability.

Never begin coding until the architecture is complete.

---

# FIRST TASK

Do not begin implementing code immediately.

Instead:

1. Analyse this complete specification.

2. Design the full software architecture.

3. Produce the folder structure.

4. Produce the application architecture.

5. Produce the complete database architecture.

6. Identify every reusable module.

7. Identify every reusable UI component.

8. Identify every backend service.

9. Identify every API group.

10. Produce an implementation roadmap.

11. Explain any architectural improvements you recommend before development begins.

Only after the architecture has been approved should implementation start.

Do not skip the architecture phase.

Treat this project exactly as a professional software company would before beginning development.