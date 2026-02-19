# Shub — Product & Engineering Wiki

Welcome to the Shub product wiki. This is the living reference for all planned work, design decisions, and engineering specifications.

---

## Contents

| Page | Summary |
|------|---------|
| [Product Proposal](Product-Proposal) | Full product owner proposal: current state, UX audit, design philosophy, and feature roadmap |
| [Roadmap Overview](Roadmap-Overview) | Prioritised feature roadmap across three horizons |
| [Sprint 1 — Feedback & Toast System](Sprint-1-Feedback-and-Toast-System) | Global toast notifications; booking confirmation; resend email verification |
| [Sprint 2 — Design System & Visual Refresh](Sprint-2-Design-System-and-Visual-Refresh) | Component library, colour tokens, typography, dark mode |
| [Sprint 3 — Booking & Profile UX](Sprint-3-Booking-and-Profile-UX) | Booking flow redesign, profile editor autosave, bottom sheets |
| [Sprint 4 — Reviews, Availability & Push](Sprint-4-Reviews-Availability-and-Push) | Reviews & ratings, availability calendar, web push notifications |
| [Component Library Spec](Component-Library-Spec) | Shared primitive components: Button, Sheet, Toast, ConfirmDialog, Badge |
| [Data Input Feedback Audit](Data-Input-Feedback-Audit) | Every user input mapped to its current output — gaps identified |

---

## Quick Reference

**Repo:** `Mturnernz/shub-project`
**Stack:** React + TypeScript + Supabase + Tailwind CSS
**Deployment:** Netlify
**State:** Zustand (`auth.store`, `messages.store`, `ui.store`)

**Colour palette names:** `trust` (blue), `safe` (green), `warm` (coral)
**Key design principle:** Every input deserves an output. Silence is a bug.

---

*Last updated: February 2026*
