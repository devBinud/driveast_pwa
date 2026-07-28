# 🗺️ DriveEast API & Screen Integration Mapping Guide (React PWA & CRM)

An authoritative, language-agnostic **API Endpoint & Screen Mapping Blueprint** for the React frontend development team. This guide maps every React UI screen directly to its required **HTTP Method, API Endpoint URL, Request Headers, JSON Payloads, Expected Responses, and WebSocket Events**.

---

## 📐 Table of Contents
1. [Global API Conventions & Headers](#1-global-api-conventions--headers)
2. [Driver PWA App — Screen-by-Screen API Mapping](#2-driver-pwa-app--screen-by-screen-api-mapping)
   - [Screen 1: Login Page (`/login`)](#screen-1-login-page-login)
   - [Screen 2: Driver Dashboard & Duty Switch (`/dashboard`)](#screen-2-driver-dashboard--duty-switch-dashboard)
   - [Screen 3: Instant Dispatch Alert Modal](#screen-3-instant-dispatch-alert-modal)
   - [Screen 4: Active Trip Stepper Screen (`/trips/:id`)](#screen-4-active-trip-stepper-screen-tripsid)
   - [Screen 5: Trip Details View (`/trips/:id/details`)](#screen-5-trip-details-view-tripsiddetails)
   - [Screen 6: Driver Wallet & Trip History (`/wallet`)](#screen-6-driver-wallet--trip-history-wallet)
3. [Admin CRM Portal — Screen-by-Screen API Mapping](#3-admin-crm-portal--screen-by-screen-api-mapping)
   - [Screen 1: Booking Management & Manual Dispatch (`/admin/bookings`)](#screen-1-booking-management--manual-dispatch-adminbookings)
   - [Screen 2: Live Fleet Tracking Map (`/admin/drivers`)](#screen-2-live-fleet-tracking-map-admindrivers)
   - [Screen 3: WhatsApp Customer Chat Modal](#screen-3-whatsapp-customer-chat-modal)
   - [Screen 4: Admin Settings & WhatsApp Alert Number (`/admin/settings`)](#screen-4-admin-settings--whatsapp-alert-number-adminsettings)
4. [WebSocket Real-Time Event Contracts](#4-websocket-real-time-event-contracts)
   - [Protocol 1: Driver PWA WebSocket (`/api/v1/driver/ws`)](#protocol-1-driver-pwa-websocket-apiv1driverws)
   - [Protocol 2: Admin Live Fleet GPS WebSocket (`/api/v1/ws/fleet`)](#protocol-2-admin-live-fleet-gps-websocket-apiv1wsfleet)
   - [Protocol 3: Admin WhatsApp Live Chat WebSocket (`/api/v1/whatsapp/ws`)](#protocol-3-admin-whatsapp-live-chat-websocket-apiv1whatsappws)
5. [Complete Status Enums Reference](#5-complete-status-enums-reference)

---

## 1. Global API Conventions & Headers

### Base URL
- **Production API Base:** `https://api.driveast.com/api/v1` (or your deployment domain)
- **WebSocket Base:** `wss://api.driveast.com/api/v1`

### Standard Headers
- **Public Endpoints:** `Content-Type: application/json`
- **Authenticated Endpoints:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <access_token>
  ```

### Standard API Response Envelope
All API responses return a uniform JSON wrapper:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description"
}
```

---

## 2. Driver PWA App — Screen-by-Screen API Mapping

---

### Screen 1: Login Page (`/login`)

#### 🔹 API Action: Driver Authentication
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/auth/login`
- **Auth Required:** No
- **Request Body JSON:**
```json
{
  "phone": "+919876543210",
  "password": "driver_password_here"
}
```

- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  },
  "message": "Login successful"
}
```

#### 🔹 API Action: Driver Logout
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/auth/logout`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": true,
  "message": "Logout successful"
}
```

---

### Screen 2: Driver Dashboard & Duty Switch (`/dashboard`)

#### 🔹 API Action 1: Fetch Profile & Current Duty Status
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/driver/me`
- **Auth Required:** Yes
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "c39a81e2-5b9c-4f1e-8e3b-9a1f2b3c4d5e",
    "name": "Ramesh Kumar",
    "phone": "+919876543210",
    "availability_status": "AVAILABLE",
    "current_lat": 26.1445,
    "current_lng": 91.7362,
    "is_active": true
  },
  "message": "Profile fetched successfully"
}
```

#### 🔹 API Action 2: Toggle Duty Status
- **Method:** `PATCH`
- **Endpoint URL:** `/api/v1/driver/me/status`
- **Auth Required:** Yes
- **Request Body JSON:**
```json
{
  "availability_status": "AVAILABLE"
}
```
*(Allowed status values: `"AVAILABLE"`, `"OFFLINE"`, `"ON_LEAVE"`, `"TEMP_UNAVAILABLE"`, `"ON_TRIP"`)*

- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "c39a81e2-5b9c-4f1e-8e3b-9a1f2b3c4d5e",
    "name": "Ramesh Kumar",
    "availability_status": "AVAILABLE"
  },
  "message": "Status updated successfully"
}
```

#### 🔹 API Action 3: Background GPS Location Ping (Every 10–15 Seconds)
- **Method:** `PATCH`
- **Endpoint URL:** `/api/v1/driver/me/location`
- **Auth Required:** Yes
- **Request Body JSON:**
```json
{
  "lat": 26.144512,
  "lng": 91.736289
}
```
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": { "id": "c39a81e2-5b9c-4f1e-8e3b-9a1f2b3c4d5e" },
  "message": "Location updated successfully"
}
```

---

### Screen 3: Instant Dispatch Alert Modal

When an instant ride is assigned to a driver, a real-time alert is triggered via WebSocket or Web Push.

#### 🔹 API Action 1: Fetch Pending Dispatch Requests
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/driver/me/requests`
- **Auth Required:** Yes
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "7b8a9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "status": "SENT",
      "sent_at": "2026-07-28T05:30:00Z",
      "expires_at": "2026-07-28T05:45:00Z",
      "booking": {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "booking_number": "BK-20260728-0001",
        "lead_traveler_name": "Amit Sharma",
        "lead_traveler_phone": "+919812345678",
        "pickup_location": "Guwahati Airport (GAU)",
        "drop_location": "Polo Bazaar, Shillong",
        "pickup_date": "2026-07-28",
        "pickup_time": "14:30:00",
        "total_passengers": 3,
        "total_amount": 3500.0,
        "total_paid": 0.0
      }
    }
  ],
  "message": "Active requests fetched successfully"
}
```

#### 🔹 API Action 2: Accept or Reject Dispatch Request
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/me/requests/{request_id}/respond?accept=true`
- **Auth Required:** Yes
- **Query Parameter:** `accept=true` (to accept) or `accept=false` (to reject)
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "request_id": "7b8a9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "assignment_id": "f9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
    "status": "ACCEPTED"
  },
  "message": "Booking request accepted"
}
```

---

### Screen 4: Active Trip Stepper Screen (`/trips/:id`)

This screen leads the driver through 5 step-by-step trip execution actions:

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Step 1: Arrive   │ ➔ │ Step 2: Verify   │ ➔ │ Step 3: End Trip │ ➔ │ Step 4: Collect  │
│    At Pickup     │    │   OTP & Odometer │    │   & End Odometer │    │     Payment      │
└──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

#### 📍 Step 1: Confirm Arrival at Pickup Point
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/me/trips/{assignment_id}/arrive`
- **Auth Required:** Yes
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "assignment_id": "f9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
    "status": "DRIVER_ARRIVED",
    "arrived_at": "2026-07-28T05:40:12Z",
    "otp": "4829"
  },
  "message": "Arrival confirmed. OTP generated and sent to guest via WhatsApp."
}
```

#### 🔐 Step 2: Verify Guest OTP & Record Start Odometer
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/me/trips/{assignment_id}/verify-otp`
- **Auth Required:** Yes
- **Request Body JSON:**
```json
{
  "otp": "4829",
  "start_odometer": 45210,
  "start_odometer_image_url": "https://driveast.com/uploads/odo_start_123.jpg"
}
```
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "f9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
    "status": "IN_PROGRESS",
    "started_at": "2026-07-28T05:42:00Z",
    "start_odometer": 45210
  },
  "message": "OTP verified successfully. Trip started."
}
```

#### 🏁 Step 3: End Trip (Record Final Odometer Reading)
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/me/trips/{assignment_id}/end-trip`
- **Auth Required:** Yes
- **Request Body JSON:**
```json
{
  "end_odometer": 45340,
  "end_odometer_image_url": "https://driveast.com/uploads/odo_end_123.jpg"
}
```
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "f9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
    "status": "IN_PROGRESS",
    "end_odometer": 45340,
    "total_distance_km": 130
  },
  "message": "Trip ended successfully. Fare recalculated."
}
```

#### 💵 Step 4: Collect Payment (Cash or Online Gateway)
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/me/trips/{assignment_id}/collect-payment`
- **Auth Required:** Yes
- **Request Body JSON:**
```json
{
  "amount": 3500.0,
  "payment_method": "CASH"
}
```
*(Options: `"CASH"`, `"ONLINE"`)*

- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "pay_987654321",
    "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "payment_type": "COLLECTION",
    "amount": 3500.0,
    "payment_status": "COMPLETED",
    "paid_at": "2026-07-28T08:15:00Z"
  },
  "message": "Payment successfully collected in cash."
}
```

#### ✅ Step 5: Complete Trip Assignment
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/driver/me/trips/{assignment_id}/complete`
- **Auth Required:** Yes
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "f9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
    "status": "COMPLETED",
    "completed_at": "2026-07-28T08:16:00Z"
  },
  "message": "Trip completed successfully."
}
```

---

### Screen 5: Trip Details View (`/trips/:id/details`)

#### 🔹 API Action: Fetch Detailed Assignment & Itinerary Data
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/driver/me/trips/{assignment_id}`
- **Auth Required:** Yes
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "f9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
    "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "IN_PROGRESS",
    "assigned_at": "2026-07-28T05:30:00Z",
    "arrived_at": "2026-07-28T05:40:12Z",
    "started_at": "2026-07-28T05:42:00Z",
    "start_odometer": 45210,
    "end_odometer": null,
    "booking": {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "booking_number": "BK-20260728-0001",
      "lead_traveler_name": "Amit Sharma",
      "lead_traveler_phone": "+919812345678",
      "pickup_location": "Guwahati Airport (GAU)",
      "drop_location": "Polo Bazaar, Shillong",
      "pickup_date": "2026-07-28",
      "pickup_time": "14:30:00",
      "total_passengers": 3,
      "total_amount": 3500.0,
      "total_paid": 0.0
    }
  },
  "message": "Trip details fetched successfully"
}
```

---

### Screen 6: Driver Wallet & Trip History (`/wallet`)

#### 🔹 API Action: Fetch Trip History & Past Collections
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/driver/me/trips?history=true`
- **Auth Required:** Yes
- **Query Parameters:**
  - `history=true`: Fetches past completed/cancelled trips
  - `upcoming=true`: Fetches future scheduled trips
  - `history=false`: Fetches today's active trips
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "f9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
      "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "status": "COMPLETED",
      "assigned_at": "2026-07-28T05:30:00Z",
      "completed_at": "2026-07-28T08:16:00Z",
      "start_odometer": 45210,
      "end_odometer": 45340,
      "booking": {
        "booking_number": "BK-20260728-0001",
        "lead_traveler_name": "Amit Sharma",
        "pickup_location": "Guwahati Airport (GAU)",
        "drop_location": "Polo Bazaar, Shillong",
        "total_amount": 3500.0
      }
    }
  ],
  "message": "Trips fetched successfully"
}
```

---

## 3. Admin CRM Portal — Screen-by-Screen API Mapping

---

### Screen 1: Booking Management & Manual Dispatch (`/admin/bookings`)

#### 🔹 API Action 1: List All Bookings (Filtered)
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/bookings?page=1&limit=20&booking_status=PENDING_MANUAL_ASSIGNMENT`
- **Auth Required:** Yes (`Permission: booking.view`)
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "booking_number": "BK-20260728-0001",
      "booking_type": "INSTANT",
      "booking_status": "PENDING_MANUAL_ASSIGNMENT",
      "lead_traveler_name": "Amit Sharma",
      "lead_traveler_phone": "+919812345678",
      "pickup_location": "Guwahati Airport (GAU)",
      "total_amount": 3500.0,
      "created_at": "2026-07-28T05:25:00Z"
    }
  ]
}
```

#### 🔹 API Action 2: Manually Assign Driver to Booking
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/bookings/{booking_id}/assign-driver`
- **Auth Required:** Yes (`Permission: booking.edit`)
- **Request Body JSON:**
```json
{
  "driver_id": "c39a81e2-5b9c-4f1e-8e3b-9a1f2b3c4d5e",
  "vehicle_id": "d48b72e1-4c9a-4f2b-8e1d-0a2b3c4d5e6f"
}
```
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "assigned_driver_id": "c39a81e2-5b9c-4f1e-8e3b-9a1f2b3c4d5e",
    "booking_status": "CONFIRMED"
  },
  "message": "Driver assigned successfully. WhatsApp alerts sent to driver and guest."
}
```

#### 🔹 API Action 3: Deassign Driver from Booking
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/bookings/{booking_id}/deassign-driver`
- **Auth Required:** Yes (`Permission: booking.edit`)
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "assigned_driver_id": null,
    "booking_status": "PENDING_MANUAL_ASSIGNMENT"
  },
  "message": "Driver deassigned successfully. Notifications sent to guest and driver."
}
```

---

### Screen 2: Live Fleet Tracking Map (`/admin/drivers`)

#### 🔹 API Action: Fetch All Drivers with Coordinates
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/drivers`
- **Auth Required:** Yes (`Permission: driver.view`)
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "c39a81e2-5b9c-4f1e-8e3b-9a1f2b3c4d5e",
      "name": "Ramesh Kumar",
      "phone": "+919876543210",
      "availability_status": "ON_TRIP",
      "current_lat": 26.144512,
      "current_lng": 91.736289,
      "assigned_vehicle": {
        "registration_number": "AS-01-AB-1234",
        "vehicle_name": "Maruti Dzire"
      }
    }
  ]
}
```

---

### Screen 3: WhatsApp Customer Chat Modal

#### 🔹 API Action 1: List Active WhatsApp Chat Threads
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/whatsapp/chats?limit=50`
- **Auth Required:** Yes
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "phone": "919365163250",
      "customer_name": "Priya Das",
      "last_message": "Hi, what is the fare for Shillong?",
      "last_message_at": "2026-07-28T05:50:00Z",
      "unread_count": 2
    }
  ]
}
```

#### 🔹 API Action 2: Get Customer Chat History
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/whatsapp/chats/{phone}/messages?limit=50`
- **Auth Required:** Yes
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "wamid.HBgMOTE5MzY1MTYzMjUw...",
      "direction": "INCOMING",
      "message": "Hi, what is the fare for Shillong?",
      "status": "READ",
      "created_at": "2026-07-28T05:50:00Z"
    }
  ]
}
```

#### 🔹 API Action 3: Send Manual WhatsApp Message
- **Method:** `POST`
- **Endpoint URL:** `/api/v1/whatsapp/send`
- **Auth Required:** Yes
- **Request Body JSON:**
```json
{
  "to": "919365163250",
  "message": "Hello Priya! The fare for Guwahati Airport to Shillong is ₹3,500."
}
```
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "message_id": "wamid.HBgMOTE5MzY1MTYzMjUw..."
  },
  "message": "WhatsApp message sent successfully"
}
```

---

### Screen 4: Admin Settings & WhatsApp Alert Number (`/admin/settings`)

#### 🔹 API Action 1: Fetch All System Settings
- **Method:** `GET`
- **Endpoint URL:** `/api/v1/settings`
- **Auth Required:** Yes (`Permission: setting.view`)
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "key": "admin_whatsapp_number",
      "value": "917086565487",
      "description": "System setting for admin_whatsapp_number"
    }
  ]
}
```

#### 🔹 API Action 2: Upsert Admin WhatsApp Number
- **Method:** `PUT`
- **Endpoint URL:** `/api/v1/settings/admin_whatsapp_number`
- **Auth Required:** Yes (`Permission: setting.manage`)
- **Request Body JSON:**
```json
{
  "value": "917086565487"
}
```
- **Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "key": "admin_whatsapp_number",
    "value": "917086565487"
  },
  "message": "Setting admin_whatsapp_number updated successfully"
}
```

---

## 4. WebSocket Real-Time Event Contracts

---

### Protocol 1: Driver PWA WebSocket (`/api/v1/driver/ws`)

- **Connection URL:** `wss://api.driveast.com/api/v1/driver/ws?token=<DRIVER_JWT_TOKEN>`
- **Ping / Pong Handshake:** Send `{ "type": "ping" }` every 30 seconds. Server echoes `{ "type": "pong" }`.

#### 📩 Event 1: New Dispatch Request
```json
{
  "type": "new_request",
  "request_id": "7b8a9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "booking_number": "BK-20260728-0001",
  "pickup_location": "Guwahati Airport (GAU)",
  "drop_location": "Polo Bazaar, Shillong",
  "expires_in_seconds": 900
}
```
*Action:* React app displays the **Dispatch Request Popup Modal**.

#### 📩 Event 2: Trip Cancelled
```json
{
  "type": "trip_cancelled",
  "booking_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "reason": "Cancelled by guest"
}
```
*Action:* React app dismisses the request modal and notifies the driver.

---

### Protocol 2: Admin Live Fleet GPS WebSocket (`/api/v1/ws/fleet`)

- **Connection URL:** `wss://api.driveast.com/api/v1/ws/fleet`

#### 📩 Event: Real-time Driver GPS Update
```json
{
  "type": "driver_location_update",
  "driver_id": "c39a81e2-5b9c-4f1e-8e3b-9a1f2b3c4d5e",
  "driver_name": "Ramesh Kumar",
  "vehicle_name": "Maruti Dzire (AS-01-AB-1234)",
  "availability_status": "ON_TRIP",
  "lat": 26.144512,
  "lng": 91.736289,
  "updated_at": "2026-07-28T05:50:00Z"
}
```
*Action:* React app updates the driver's map marker location in real-time.

---

### Protocol 3: Admin WhatsApp Live Chat WebSocket (`/api/v1/whatsapp/ws`)

- **Connection URL:** `wss://api.driveast.com/api/v1/whatsapp/ws`

#### 📩 Event 1: Incoming WhatsApp Message
```json
{
  "type": "incoming_message",
  "message_id": "wamid.HBgMOTE5MzY1MTYzMjUw...",
  "customer_phone": "919365163250",
  "customer_name": "Priya Das",
  "message": "Hi, what is the fare for Shillong?",
  "timestamp": "2026-07-28T05:50:00Z"
}
```

#### 📩 Event 2: Message Delivery Status Change
```json
{
  "type": "status_update",
  "message_id": "wamid.HBgMOTE3MDg6NTY1NDg3...",
  "status": "READ",
  "recipient_phone": "919876543210"
}
```

---

## 5. Complete Status Enums Reference

| Enum Type | Allowed Values | Usage / Meaning |
| :--- | :--- | :--- |
| **`AvailabilityStatus`** | `AVAILABLE`, `ON_TRIP`, `OFFLINE`, `ON_LEAVE`, `TEMP_UNAVAILABLE` | Driver duty status |
| **`RequestStatus`** | `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CANCELLED` | Instant ride request status |
| **`AssignmentStatus`** | `ASSIGNED`, `ACCEPTED`, `ARRIVED`, `STARTED`, `COMPLETED`, `CANCELLED`, `REJECTED` | Trip execution stage |
| **`BookingStatus`** | `DRAFT`, `PENDING_ADMIN_REVIEW`, `PENDING_MANUAL_ASSIGNMENT`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | Overall booking lifecycle |

---

*DriveEast Technical Mapping Blueprint — Prepared for React Frontend Engineering Team.*
