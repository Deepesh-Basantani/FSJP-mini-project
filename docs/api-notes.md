# Food Rescue - API Documentation & Notes

This document provides complete reference specifications for all REST endpoints exposed by the **Food Rescue** Spring Boot backend, following the Project Blueprint.

---

## 1. Authentication & Security Overview

- **Base URL**: `http://localhost:8080`
- **Authentication**: JWT Bearer Token in `Authorization: Bearer <TOKEN>` header.
- **Passwords**: BCrypt salted hashes.
- **Error Format**:
```json
{
  "timestamp": "2026-10-10T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Input validation failed",
  "path": "/api/donations"
}
```

---

## 2. API Endpoints

### Authentication & Users
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new account (`FOOD_PROVIDER`, `NGO`, `VOLUNTEER`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token |
| `GET` | `/api/users/me` | Signed-in | View current user profile |
| `PUT` | `/api/users/me` | Signed-in | Update name, phone, organisation |
| `PATCH`| `/api/users/me/password` | Signed-in | Change password securely |

### Donation Listings
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/donations` | Public Preview / Signed-in | List available food donations with filters & paging |
| `GET` | `/api/donations/{id}` | Signed-in / Preview | View single donation details |
| `POST` | `/api/donations` | Provider | Create new surplus food listing |
| `GET` | `/api/donations/mine` | Provider | List provider's own listings |
| `PUT` | `/api/donations/{id}` | Owning Provider | Edit active listing |
| `PATCH`| `/api/donations/{id}/withdraw` | Owning Provider | Withdraw donation listing |
| `POST` | `/api/donations/{id}/image` | Owning Provider | Upload food photograph (JPEG, PNG, WebP < 5MB) |

### Reservation Workflow
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/donations/{id}/reservations` | Owning Provider | View incoming requests for a listing |
| `POST` | `/api/donations/{id}/reservations` | Verified NGO | Submit a reservation request for a quantity |
| `GET` | `/api/reservations/mine` | NGO / Provider | View user's requested or received reservations |
| `PATCH`| `/api/reservations/{id}/approve` | Owning Provider | Approve request & atomically deduct available quantity |
| `PATCH`| `/api/reservations/{id}/reject` | Owning Provider | Decline request |
| `PATCH`| `/api/reservations/{id}/cancel` | Requesting NGO / Admin | Cancel request and restore quantity if approved |

### Pickup & Handover
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `PATCH`| `/api/pickups/{id}/status` | Volunteer / Involved | Update status (`ASSIGNED`, `COLLECTED`, `DELIVERED`) |
| `PATCH`| `/api/pickups/{id}/assign` | Provider / Admin | Assign volunteer to pickup |
| `GET` | `/api/pickups/assigned` | Volunteer | List pickups assigned to volunteer |
| `PATCH`| `/api/pickups/{id}/confirm` | Provider / Receiver | Dual handover confirmation (completes donation when both confirm) |

### Dashboards & Impact
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Signed-in | Role-specific counts, pending actions, and summaries |
| `GET` | `/api/impact/summary` | Public / Signed-in | Confirmed portions, kilograms, monthly trends, fulfillment rate |

### Notifications & Reports
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Signed-in | List in-app notifications |
| `PATCH`| `/api/notifications/{id}/read` | Signed-in | Mark notification as read |
| `POST` | `/api/reports` | Signed-in | File a report against an account or listing |

### Administration
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/verifications` | Admin | List accounts awaiting verification |
| `PATCH`| `/api/admin/verifications/{id}` | Admin | Approve or reject organisation with reason |
| `GET` | `/api/admin/users` | Admin | Search and list user accounts |
| `PATCH`| `/api/admin/users/{id}/status` | Admin | Suspend or reactivate user |
| `PATCH`| `/api/admin/donations/{id}/remove` | Admin | Moderate / take down inappropriate listing |
| `GET` | `/api/admin/reports` | Admin | List submitted reports |
| `PATCH`| `/api/admin/reports/{id}` | Admin | Resolve or dismiss report |

### Companion Notification Service (Node.js)
| Protocol | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `http://localhost:5000/internal/notify` | Shared Secret | Internal webhook invoked by Spring Boot |
| `WS` | `ws://localhost:5000` | Authenticated | Socket.IO room subscription (`user_<userId>`) |

---

## 3. Database Schema Overview
- `users`: id, name, email, password_hash, role, phone, organisation_name, verification_status, is_active, created_at
- `food_donations`: id, provider_id, title, description, category, quantity_total, quantity_available, unit, prepared_at, pickup_deadline, address, latitude, longitude, packaging_notes, storage_instructions, image_url, status, created_at
- `reservations`: id, donation_id, ngo_id, quantity_requested, status, requested_at, decision_at, notes
- `pickup_records`: id, reservation_id, volunteer_id, pickup_time, delivery_time, pickup_status, handover_confirmed_by_provider, handover_confirmed_by_receiver
- `notifications`: id, user_id, message, type, is_read, created_at
- `status_history`: id, entity_type, entity_id, old_status, new_status, changed_by, changed_at, note
- `reports`: id, reporter_id, target_type, target_id, reason, status, created_at, resolved_by, resolved_at
