# Bus Booking API — Frontend Integration Guide

This document describes the REST API exposed by the **bus-booking** backend. Share this file (and optionally the [OpenAPI](#openapi--swagger) JSON) with your frontend team.

**Default base URL (local):** `http://localhost:8080`  
All paths below are relative to that host unless noted.

---

## Conventions

| Item | Value |
|------|--------|
| **Protocol** | HTTP (HTTPS in production) |
| **Request body** | `application/json` unless stated otherwise |
| **Response body** | `application/json` unless stated otherwise (PDF endpoints return `application/pdf`) |
| **Character encoding** | UTF-8 |

### Authentication

Most endpoints require a **JWT** issued by `/api/auth/login` or `/api/auth/register`.

**Header (required for protected routes):**

```http
Authorization: Bearer <accessToken>
```

The token is returned as `accessToken` in the auth responses. Send it on every request to customer, agent, and admin APIs.

**Roles** (encoded in the token; backend enforces with `@PreAuthorize`):

| Role | Typical client |
|------|------------------|
| `ROLE_CUSTOMER` | Customer website |
| `ROLE_AGENT` | Agent mobile web |
| `ROLE_ADMIN` | Admin console |

If the token is missing, invalid, or the role is wrong for the route, the server responds with **401 Unauthorized** or **403 Forbidden**.

### CORS

The API is configured to allow cross-origin requests (including browser `Authorization` headers). Adjust origins in production if needed.

### Errors

Validation and business-rule failures often return JSON:

```json
{ "error": "Human-readable message" }
```

| HTTP status | Typical meaning |
|-------------|-----------------|
| **400** | Bad request (validation, unknown id, wrong trip/seat) |
| **403** | Authenticated but not allowed for this resource/role |
| **409** | Conflict (e.g. seat no longer available) |

---

## Enumerations (string values in JSON)

Use these exact enum names when parsing responses or building admin payloads.

**`TripStatus`:** `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**`SeatInventoryStatus`:** `AVAILABLE`, `RESERVED`, `BOOKED`, `BLOCKED`

**`BookingStatus`:** `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `REFUNDED`

**`PaymentStatus`:** `PENDING`, `PAID`, `FAILED`, `REFUNDED`

**`BoardingStatus`:** `NOT_BOARDED`, `BOARDED`, `NO_SHOW`, `OFFBOARDED`

**`BulkRequestStatus`:** `PENDING`, `APPROVED`, `REJECTED`, `PAID`

**`BusType` (admin):** `SEATER_2X2`, `SEATER_2X3`, `SLEEPER`, `HYBRID`

---

## Public API

No `Authorization` header required.

### Search routes

```http
GET /api/public/routes/search?origin={text}&destination={text}
```

**Query parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `origin` | Yes | Substring match on origin city (case-insensitive) |
| `destination` | Yes | Substring match on destination city |

**Response:** `200 OK` — JSON array of route objects:

```json
[
  {
    "id": 1,
    "origin": "Mumbai",
    "destination": "Pune",
    "departureTime": "08:00"
  }
]
```

---

### List trips for a route and date

```http
GET /api/public/routes/{routeId}/trips?date={yyyy-MM-dd}
```

**Path:** `routeId` — route id from search.

**Query**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `date` | Yes | ISO date, e.g. `2026-04-20` |

**Response:** `200 OK` — array of trips (excludes cancelled trips):

```json
[
  {
    "id": 1,
    "routeId": 1,
    "tripDate": "2026-04-20",
    "departureAt": "2026-04-20T08:00:00Z",
    "status": "SCHEDULED"
  }
]
```

`departureAt` is an ISO-8601 instant string.

---

### Seat inventory for a trip

```http
GET /api/public/trips/{tripId}/seats
```

**Response:** `200 OK` — array ordered by seat label:

```json
[
  { "id": 10, "label": "A1", "status": "AVAILABLE" },
  { "id": 11, "label": "A2", "status": "BOOKED" }
]
```

Use `id` as `tripSeatIds` when creating bookings. Only seats with status `AVAILABLE` can be booked (backend validates).

---

### Submit bulk booking request

```http
POST /api/public/bulk-booking-requests
Content-Type: application/json
```

**Request body**

```json
{
  "requesterName": "Acme Corp",
  "email": "travel@example.com",
  "phone": "+919876543210",
  "routeId": 1,
  "tripDate": "2026-04-20",
  "requestedSeats": 20,
  "notes": "Optional message to admin"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `requesterName` | string | Yes | |
| `email` | string | Yes | |
| `phone` | string | Yes | |
| `routeId` | number | Yes | |
| `tripDate` | string | Yes | ISO date `yyyy-MM-dd` |
| `requestedSeats` | number | Yes | |
| `notes` | string | No | |

**Response:** `200 OK`

```json
{ "id": 1, "status": "PENDING" }
```

Admin approves/rejects via admin APIs.

---

## Authentication API

No `Authorization` header.

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request**

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "<JWT>"
}
```

---

### Register (customer only)

Creates a user with role **CUSTOMER** and returns a token (same as logging in).

```http
POST /api/auth/register
Content-Type: application/json
```

**Request**

```json
{
  "email": "user@example.com",
  "password": "secret",
  "phone": "+919876543210"
}
```

**Response:** `200 OK` — same shape as login (`accessToken`).

**Errors:** `400` if email already exists.

> **Note:** Admin and agent accounts are not created through this API in the default setup; they are seeded or provisioned separately.

---

## Customer API

**Required:** `Authorization: Bearer <token>` with role **CUSTOMER**.

Base path: `/api/customer`

### Create booking (online)

Reserves seats and creates a booking in **`PENDING_PAYMENT`** until payment is confirmed.

```http
POST /api/customer/bookings
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**

```json
{
  "tripId": 1,
  "tripSeatIds": [10, 11],
  "passengers": [
    { "name": "Jane Doe", "phone": "+919811122233" },
    { "name": "John Doe", "phone": "+919844455566" }
  ],
  "totalAmount": 1200.00
}
```

| Field | Type | Description |
|-------|------|---------------|
| `tripId` | number | Trip to book |
| `tripSeatIds` | number[] | Trip seat **primary keys** from `GET .../trips/{tripId}/seats` |
| `passengers` | array | Same length as `tripSeatIds`; order matches seat order |
| `passengers[].name` | string | Passenger name |
| `passengers[].phone` | string | Passenger phone |
| `totalAmount` | number | Total price (decimal); integrate with your pricing rules |

**Response:** `200 OK`

```json
{
  "bookingReference": "BK-XXXXXXXX",
  "status": "PENDING_PAYMENT",
  "paymentStatus": "PENDING"
}
```

**Errors:** `400` / `409` if seats invalid or not available.

---

### Confirm payment (mock gateway)

After your payment provider confirms payment, call this with a gateway reference string (integration-specific).

```http
POST /api/customer/bookings/{bookingReference}/payment
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**

```json
{
  "paymentGatewayRef": "pay_abc123_from_gateway"
}
```

**Response:** `200 OK`

```json
{
  "bookingReference": "BK-XXXXXXXX",
  "status": "CONFIRMED",
  "paymentStatus": "PAID"
}
```

Side effects: seats move to **BOOKED**, ticket PDF generated internally, notification stub invoked.

**Authorization:** Only the **user who created** the booking can call this (same customer account).

---

### Download ticket PDF

```http
GET /api/customer/bookings/{bookingReference}/ticket.pdf
Authorization: Bearer <token>
```

**Response:** `200 OK`  
**Headers:** `Content-Type: application/pdf`  
**Body:** PDF bytes (show as download or open in new tab).

**Authorization:** Only the booking owner.

---

## Agent API

**Required:** `Authorization: Bearer <token>` with role **AGENT**.

Base path: `/api/agent`

### Cash booking (offline)

Immediately **CONFIRMED** / **PAID**; PDF + notification stub run server-side.

```http
POST /api/agent/bookings
Authorization: Bearer <token>
Content-Type: application/json
```

**Request** — same structure as customer booking, with field names:

```json
{
  "tripId": 1,
  "tripSeatIds": [10],
  "passengers": [
    { "name": "Ravi Kumar", "phone": "+919900011122" }
  ],
  "totalAmount": 500.00
}
```

(`passengers` entries use `name` and `phone` like customer `PassengerLineDto`.)

**Response:** `200 OK`

```json
{
  "bookingReference": "BK-YYYYYYYY",
  "status": "CONFIRMED"
}
```

---

### Verify ticket — QR payload

The QR code embedded in the ticket PDF encodes the passenger **`verificationToken`** (opaque string). Scan and send:

```http
POST /api/agent/trips/{tripId}/verify/qr
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "qrToken": "<verificationToken from QR>"
}
```

**Response:** `200 OK`

```json
{
  "id": 42,
  "name": "Jane Doe",
  "seat": "A1",
  "boardingStatus": "BOARDED"
}
```

Verification sets boarding status to **BOARDED** when valid for this trip.

---

### Verify ticket — booking reference only

Use when exactly **one** passenger exists for that reference on the trip; otherwise use phone or QR.

```http
POST /api/agent/trips/{tripId}/verify/reference
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "bookingReference": "BK-XXXXXXXX"
}
```

**Response:** Same passenger object as QR verify.

---

### Verify ticket — booking reference + phone

```http
POST /api/agent/trips/{tripId}/verify/phone
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "bookingReference": "BK-XXXXXXXX",
  "phone": "+919811122233"
}
```

**Response:** Same passenger object as QR verify.

---

### Mark no-show

```http
PATCH /api/agent/passengers/{passengerId}/no-show
Authorization: Bearer <token>
```

**Response:** `200 OK` — updated passenger DTO (`boardingStatus`: `NO_SHOW`).

---

### Mark offboarded

```http
PATCH /api/agent/passengers/{passengerId}/offboard
Authorization: Bearer <token>
```

**Response:** `200 OK` — `boardingStatus`: `OFFBOARDED`.

---

### Trip manifest (all passengers with bookings on trip)

```http
GET /api/agent/trips/{tripId}/manifest
Authorization: Bearer <token>
```

**Response:** `200 OK` — array of passenger DTOs (same shape as verify response).

---

### Download ticket PDF (by booking reference)

```http
GET /api/agent/bookings/{bookingReference}/ticket.pdf
Authorization: Bearer <token>
```

**Response:** `200 OK`, `application/pdf` (not restricted to booking owner; suitable for reprint at counter).

---

## Admin API

**Required:** `Authorization: Bearer <token>` with role **ADMIN**.

Base path: `/api/admin`

### Create route

```http
POST /api/admin/routes
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "operatorCode": "DEMO",
  "origin": "Mumbai",
  "destination": "Goa",
  "distanceKm": 600,
  "departureTime": "21:00"
}
```

`departureTime` is a daily pattern string (`HH:mm`) used when building trips.

**Response:** `200 OK` — `RouteDto` (`id`, `origin`, `destination`, `departureTime`).

---

### Create seat layout template

```http
POST /api/admin/layouts
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Custom 2x2",
  "busType": "SEATER_2X2",
  "layoutJson": "{\"seats\":[{\"label\":\"A1\",\"row\":1,\"col\":1},{\"label\":\"A2\",\"row\":1,\"col\":2}]}"
}
```

**`layoutJson`** must parse to:

```json
{
  "seats": [
    { "label": "A1", "row": 1, "col": 1 },
    { "label": "A2", "row": 1, "col": 2 }
  ]
}
```

**Response:** `200 OK`

```json
{ "id": 1, "name": "Custom 2x2", "busType": "SEATER_2X2" }
```

---

### Create bus

```http
POST /api/admin/buses
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "operatorCode": "DEMO",
  "registrationNumber": "MH-02-CD-9999",
  "busType": "SEATER_2X2",
  "layoutTemplateId": 1
}
```

**Response:** `200 OK`

```json
{ "id": 2, "registrationNumber": "MH-02-CD-9999" }
```

---

### Create trip (generates seat rows from bus layout)

```http
POST /api/admin/trips
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "routeId": 1,
  "busId": 1,
  "tripDate": "2026-04-25",
  "departureAt": "2026-04-25T08:00:00Z",
  "arrivalAt": "2026-04-25T14:00:00Z"
}
```

`departureAt` / `arrivalAt` are ISO-8601 instants (JSON serialization uses standard `Instant` format).

**Response:** `200 OK` — `TripDto` (same as public trips list).

---

### Block seat

```http
POST /api/admin/trips/{tripId}/seats/block
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "seatLabel": "A1",
  "reason": "Maintenance"
}
```

**Response:** `200 OK` empty body.

---

### Unblock seat

```http
POST /api/admin/trips/{tripId}/seats/unblock
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "seatLabel": "A1"
}
```

**Response:** `200 OK` empty body.

---

### Cancel booking (no refund flag in service)

```http
POST /api/admin/bookings/{bookingReference}/cancel
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{ "bookingReference": "BK-XXXXXXXX", "status": "CANCELLED" }
```

---

### Refund booking

```http
POST /api/admin/bookings/{bookingReference}/refund
Authorization: Bearer <token>
```

**Response:** `200 OK` — `status` reflects **REFUNDED** / related payment state per server logic.

---

### List bulk booking requests

```http
GET /api/admin/bulk-requests
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
[
  { "id": 1, "status": "PENDING", "email": "travel@example.com", "seats": 20 }
]
```

---

### Approve bulk request

```http
POST /api/admin/bulk-requests/{id}/approve
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "paymentLinkUrl": "https://pay.example.com/link/abc"
}
```

**Response:** `200 OK` — updated `BulkDto`.

---

### Reject bulk request

```http
POST /api/admin/bulk-requests/{id}/reject
Authorization: Bearer <token>
```

**Response:** `200 OK` — updated `BulkDto`.

---

### Reports summary (minimal)

```http
GET /api/admin/reports/summary
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{ "totalBookings": 42 }
```

---

## Suggested customer flows (frontend)

1. **Search** → `GET .../routes/search`  
2. **Pick date** → `GET .../routes/{routeId}/trips?date=`  
3. **Show seat map** → `GET .../trips/{tripId}/seats`  
4. **Login/register** → `POST .../auth/login` or `/register`  
5. **Book** → `POST .../customer/bookings`  
6. **Pay** (integrate PSP UI) → `POST .../customer/bookings/{ref}/payment`  
7. **Ticket** → `GET .../customer/bookings/{ref}/ticket.pdf`

---

## OpenAPI / Swagger

When the backend is running:

| Resource | URL |
|----------|-----|
| Swagger UI | `/swagger-ui.html` |
| OpenAPI JSON | `/v3/api-docs` |

Import `/v3/api-docs` into Postman, Insomnia, or codegen tools for TypeScript clients.

---

## Demo users (local seed)

| Email | Password | Role |
|-------|----------|------|
| `admin@demo.local` | `admin123` | ADMIN |
| `agent@demo.local` | `agent123` | AGENT |

Customers must use **register** or you create users via DB/ops.

---

*Generated to match the bus-booking Spring Boot service. If behavior diverges, treat the running service and `/v3/api-docs` as the source of truth.*
