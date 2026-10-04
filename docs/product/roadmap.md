# Dungeon Booking: roadmap

- Owner: Maya Chen (PM)
- Last reviewed: 2026-10-04 (before Sprint 1)

Sprints last one real week. Each sprint has one product theme, chosen so that the features we
build carry the kind of risk the squad wants to learn to handle (see
[`docs/learning/curriculum.md`](../learning/curriculum.md)). Stories live as GitHub issues
labelled `type:story` under the matching `Sprint N` milestone; this page only states the themes
and what "done" looks like for each sprint.

## Current focus: Sprint 1

**Theme: foundations. Accounts, roles, venues and rooms.**

Nothing can be booked until a venue exists and someone owns it. This sprint delivers the
minimum that lets an owner sign up, sign in and describe their venue and rooms through the API,
plus the first thin slice of the web app so the squad has a browser journey to test.

Done means: a new owner can register, log in, create a venue with its time zone, add rooms with
capacity and duration, and see their venues listed in the web app. Customers can register and
log in but cannot do anything useful yet.

Stories: see the [Sprint 1 milestone](https://github.com/antoniogomezgallardo/dungeon-booking/milestone/1).

## Sprint 2: availability and bookings

Owners publish time slots per room. Customers see real availability in the venue's time zone and
create or cancel a booking for a party size. Capacity is enforced so two bookings can never
oversell a slot. Time zones and daylight-saving transitions are handled explicitly.

## Sprint 3: demand management

Waitlist for full slots with automatic offers when a seat frees up, promo codes with validity
windows and usage limits, pricing rules per room and per time band, and cancellation policies
(free cancellation window, late-cancellation fee). This is where concurrency and business rules
collide, on purpose.

## Sprint 4: communication, payments and insight

Notifications through a mock email outbox (confirmation, reminder, cancellation), simulated
payments with a provider-style webhook that confirms or fails a booking asynchronously, and an
occupancy dashboard for owners (per room, per week, per time band).

## Sprint 5: hardening and release readiness

Observability (request ids, structured logs, health endpoints), basic performance checks on the
availability and booking endpoints, release hardening (smoke and regression gates, rollback
drill) and a global retrospective. No new product features unless something from Sprint 4 is
incomplete.

## How this roadmap changes

Themes are stable; the stories inside each sprint are not. After each refinement and retro the
PM re-prioritises the next sprint's backlog and updates the "Current focus" section here. If a
theme slips, we cut stories before we move the theme.
