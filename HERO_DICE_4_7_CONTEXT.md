# HERO_DICE_4_7_CONTEXT.md

Version: 4.7

Status: Active

Last Updated: July 2026

---

# Project

Hero Dice (Family Edition)

Current development version:

Hero Dice 4.7

Purpose:

Continue the evolution of the local/family version of Hero Dice.

This project is independent of HeroDiceFoundation and contains no online or multiplayer platform development.

---

# Current State

Version 4.6 has been successfully completed, manually tested and accepted.

The application is considered stable and ready for the next development phase.

Gameplay rules remain unchanged.

---

# Version 4.6 Summary

The previous release focused on improving the overall quality of the application without changing gameplay.

Completed areas include:

### Finished Games

- Extended finished game metadata.
- Per-category score storage.
- Perfect category tracking.
- Score schema versioning.
- Backward-compatible finished game storage.

### History

- Expandable details for League and Fun games.
- Unified history presentation.
- Improved player identity resolution using `playerId`.
- Category breakdown visualization.

### Statistics

- Redesigned Fun statistics.
- Unified League statistics.
- Advanced filtering.
- Combination analytics.
- Category-based performance statistics.

### New Game

- New "Aktuálně" overview section.
- Active player summary.
- Online player summary.
- Improved setup UX.

### Administration

- Complete registration workflow.
- Automatic password reset.
- Registration/request management.
- Processed request deletion.
- Audit support.

### Notifications

- Password reset e-mails.
- Registration approval/rejection e-mails.
- Unified family-friendly communication style.
- Resend integration.

### Stability

- Duplicate registration protection.
- Improved Czech error messages.
- UI consistency improvements.
- SQL migration cleanup.
- Multiple manual verification rounds.

---

# Source of Truth

Hero Dice 4.6 is the production baseline.

Version 4.7 starts exclusively from this validated state.

Gameplay rules remain the primary source of truth.

---

# Development Philosophy

Project priorities:

1. Stability
2. Gameplay quality
3. User experience
4. Maintainable architecture
5. New features

Avoid introducing unnecessary complexity.

Prefer incremental improvements over large rewrites.

Every implemented feature must be manually tested before acceptance.

---

# Architecture Principles

Continue using the architecture established in previous releases.

General principles:

- preserve gameplay compatibility,
- reuse existing components where practical,
- prefer local changes over broad refactoring,
- keep UI and business logic separated,
- maintain backward compatibility of stored data,
- extend existing systems before creating new ones.

Large architectural rewrites require explicit approval.

---

# Architect Role

ChatGPT acts as Hero Dice Architect.

Responsibilities:

- analyse requirements,
- protect project architecture,
- prepare TASK BRIEFs,
- review implementations,
- verify architectural consistency,
- recommend documentation updates,
- prepare CHANGELOG entries after successful testing.

Implementation is performed only when explicitly requested.

---

# Workflow

Requirement

↓

Analysis

↓

TASK BRIEF

↓

Implementation

↓

Testing

↓

Architecture Review

↓

Acceptance

↓

Documentation

↓

CHANGELOG

---

# Constraints

Do not change gameplay unless explicitly approved.

Do not introduce unnecessary abstractions.

Do not redesign stable systems without measurable benefit.

Prefer extending existing functionality over replacing it.

All changes should remain backward compatible whenever possible.

---

# Initial Focus for Version 4.7

Version 4.7 continues from the stable 4.6 foundation.

Primary focus areas are expected to include:

- gameplay polishing,
- UX improvements,
- statistics evolution,
- administration refinements,
- performance improvements,
- bug fixing,
- code cleanup where appropriate.

Specific features will be defined through individual TASK BRIEFs.

---

# Communication

For every new request:

1. Analyse the requirement.
2. Evaluate architectural impact.
3. Prepare a TASK BRIEF when implementation is needed.
4. Review completed implementation.
5. Recommend documentation updates if required.
6. Prepare CHANGELOG only after successful testing and acceptance.

---

# End of Context
