# Driver stuck "ON_TRIP" with no trip to end

## Summary

A driver accepted a trip yesterday. Today the driver's `availability_status` is still `ON_TRIP`, but none of the trip endpoints return that trip. The driver app therefore has nothing to open, and the driver **cannot end the trip**.

## The case
 
| | |
|---|---|
| Driver ID | `86307556-a529-461a-90d3-8cbae6a2a209` |
| Booking | `BK-20260925-0001` (booking ID `f780f44d-d226-4a52-9129-c2718eb41ae0`) |
| Booking type | Custom itinerary, **2 days**: start `2026-09-25`, end `2026-09-26`, pickup 7:15 AM |
| Booking status (CRM) | `Confirmed` |
| Checked on | `2026-09-26` |

## What the API returns today (2026-09-26)

| Request | Result |
|---|---|
| `GET /driver/me` | `availability_status: "ON_TRIP"` |
| `GET /driver/me/trips?history=false&upcoming=false` | `[]` |
| `GET /driver/me/trips?history=false&upcoming=true` | `[]` |
| `GET /driver/me/trips?history=true&upcoming=false` | Only one trip: `BK-20260923-0011`, `COMPLETED` (23 Sep) |
| `GET /driver/me/requests` | `[]` |

So the backend still says the driver is on a trip, but no list contains the trip.

## Root cause (likely)

According to `FRONTEND_API_INTEGRATION_GUIDE.md`:

- `history=true` returns **completed/cancelled** trips.
- `upcoming=true` returns **future scheduled** trips.
- `history=false` returns **today's** active trips.

The trip started on the 25th and is still in progress on the 26th:

- It isn't completed, so it's not in `history=true`.
- Its pickup date is in the past, so it's not in `upcoming=true`.
- Its pickup date isn't today, so it's not in `history=false`.

**Any trip that runs past midnight disappears from every list**, including every multi-day itinerary on day 2 onwards.

## Requested fixes

### 1. `history=false` must return all unfinished trips (high priority)
Return every assignment for the driver whose status isn't finished (`ACCEPTED`, `ARRIVED`/`DRIVER_ARRIVED`, `STARTED`/`IN_PROGRESS`), **whatever the date**. Don't filter by pickup date = today.

### 2. Add an endpoint for the driver's current trip (recommended)
```
GET /api/v1/driver/me/trips/active
→ the single in-progress assignment (same shape as GET /driver/me/trips/{id}), or null
```
The app will call this on startup to put the driver back on the right trip screen after a reload, a new device, or cleared browser data.

### 3. Use one set of status names
The guide contradicts itself:

- The status enum table says `ASSIGNED, ACCEPTED, ARRIVED, STARTED, COMPLETED, CANCELLED, REJECTED`.
- The actual step responses return `DRIVER_ARRIVED` (arrive) and `IN_PROGRESS` (verify-otp).

Please confirm which names the API really returns and update the guide to match. The frontend accepts both for now.

### 4. Keep driver status in sync with the trip
- When a trip is **completed / cancelled / deassigned**, set the driver back to `AVAILABLE` (or `OFFLINE`).
- A driver should never be `ON_TRIP` without an unfinished assignment. A periodic cleanup job, or a check in `GET /driver/me`, would catch this.

### 5. Check the booking status update
`BK-20260925-0001` still shows **Confirmed** in the CRM. If the driver had verified the OTP, the booking should be `IN_PROGRESS`. Please check:
- the assignment's actual status for this booking (was it only accepted, or started?), and
- whether starting a trip updates the booking status.

## Immediate help needed for this case

Please send us the **assignment ID** for booking `BK-20260925-0001` and its current status. With it, the driver app can reopen the trip and end it properly (end odometer, payment, complete).

If that isn't possible, please close the assignment and reset driver `86307556-…` to `AVAILABLE`.

## Already done on the frontend

- The app now accepts `ACCEPTED` and `STARTED` as active statuses. Before this, a trip with status `ACCEPTED` was wrongly cleared from the app.
- If the app has no trip saved, it now asks the API for an unfinished trip and restores it. This starts working as soon as fix 1 (or 2) is live.
