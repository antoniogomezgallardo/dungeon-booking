# Dungeon Booking: product vision

- Owner: Maya Chen (PM)
- Last reviewed: 2026-10-04 (before Sprint 1)

## Who it is for

**Venue owners and their staff** running escape rooms and board-game cafés: small businesses
with one to a handful of rooms, a few tables, and a calendar that fills up in the evenings and
at weekends. They are not technical. Today most of them manage bookings with a mix of phone
calls, WhatsApp messages, a shared spreadsheet and a paper diary at the front desk.

**Their customers**: groups of friends, families and corporate teams who want to know, right
now, whether there is a free slot for six people on Saturday at 19:00, and to lock it in
without waiting for someone to answer the phone.

## The problem

- **Double bookings.** Two staff members confirm the same slot through different channels. The
  group that turns up second leaves angry and never comes back.
- **Phone and WhatsApp chaos.** Confirming a booking takes several messages back and forth,
  often outside working hours. Staff spend their evenings answering "is 20:30 free?".
- **No-shows.** Groups book informally, nobody reminds them, and a room that could have been
  sold stays empty. For a venue with four rooms, one no-show per evening is a meaningful share
  of revenue.
- **No visibility of occupancy.** Owners cannot answer simple questions such as "which room is
  underused on weekdays?" or "how full were we last month?" without rebuilding it by hand.

## Our bet

A venue that publishes its rooms and time slots once, and lets customers book against real
availability, eliminates double bookings by construction and removes most of the back-and-forth
conversations. Once bookings live in one place, reminders, waitlists, promotions and occupancy
reporting become cheap additions rather than separate problems.

We win by being **simple and reliable** for small venues, not by being feature-rich. Owners
should be able to set up a venue with its rooms in under fifteen minutes; customers should be
able to book in under two minutes without creating an account first (account creation comes
later in the journey; the first five sprints keep it mandatory to reduce scope).

## Explicitly out of scope for Sprints 1-5

- Real payment providers (we simulate payments and their webhooks in Sprint 4).
- Real email or SMS delivery (notifications go to a mock outbox we can inspect).
- Mobile apps; the web app must work on a phone browser, nothing more.
- Multi-venue organisations, franchises and per-staff permission matrices beyond the three
  roles OWNER, STAFF and CUSTOMER.
- Public marketplace or venue discovery; customers reach a venue through its own link.
- Integrations with Google Calendar, point-of-sale systems or accounting tools.
- Internationalisation of the UI (English only). Time zones, however, are first class from
  day one because venues are spread across countries.
- Recurring or multi-slot bookings, and resources shared across rooms (game masters,
  equipment).

## How we measure success

| Metric                                                                    | Target at the end of Sprint 5                       |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| Double bookings (two confirmed bookings exceeding a slot's capacity)      | 0, enforced by the system and proven by tests       |
| Time from a customer landing on a venue page to a confirmed booking       | Under 2 minutes in a usability walkthrough          |
| Time for an owner to create a venue with 3 rooms and a week of time slots | Under 15 minutes without reading documentation      |
| Bookings that receive a reminder before the slot starts                   | 100 % of confirmed bookings (mock outbox)           |
| Occupancy question answered from the dashboard without manual work        | "Occupancy per room per week" available in one view |

These metrics are what we optimise for when we trade scope against time. If a story does not
move one of them, it is a candidate to be cut.
