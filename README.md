# FOOD RESCUE — Full-Stack Surplus Food Redistribution Platform

> A practical blueprint for turning surplus food into community support.
> Built with **Java | Spring Boot | React | Node.js | HTML5 | CSS3 | MySQL**

---

## 1. Project Overview

**Food Rescue** is a full-stack web application connecting food providers (restaurants, hotels, bakeries, canteens, and event caterers) with verified NGOs, community kitchens, shelters, and approved receivers.

The platform tracks surplus donations throughout their entire lifecycle:
$$\text{Available} \longrightarrow \text{Reserved} \longrightarrow \text{Collected} \longrightarrow \text{Completed}$$
*(with audit handling for Rejected, Cancelled, Withdrawn, and Expired states).*

### Key Capabilities
- **Transactional Atomic Reservation**: Database write-locks (`PESSIMISTIC_WRITE`) prevent overbooking when multiple concurrent requests are made for the same surplus lot.
- **Mutual Handover Verification**: A donation is only closed as `COMPLETED` when **both** the provider confirms dispatch and the receiver confirms receipt.
- **Listing Expiry Automation**: Spring `@Scheduled` background job automatically closes listings that pass their collection deadline.
- **Real-Time Push Notifications**: In-app notifications stored persistently in MySQL, broadcast live via an optional Node.js Express + Socket.IO companion service.
- **Transparent Impact Metrics**: Strict separation between prepared meal portions and raw produce kilograms ($kg$).

---

## 2. Repository Structure

```
c:\FSJP mini project/
├── backend/                              # Spring Boot 3 REST API Backend
│   ├── mvnw.cmd / mvnw                   # Maven Wrapper
│   ├── pom.xml                           # Maven dependencies (Web, JPA, Security, MySQL/H2)
│   ├── src/main/java/com/example/foodrescue/
│   │   ├── FoodRescueApplication.java    # Application entry point & demo data seeder
│   │   ├── controller/                   # REST controllers (Auth, Donation, Reservation, Pickup, etc.)
│   │   ├── service/                      # Business logic, transactions, and audit recording
│   │   ├── repository/                   # Spring Data JPA repositories with query locking
│   │   ├── entity/                       # JPA domain entities (User, FoodDonation, Reservation, etc.)
│   │   ├── dto/                          # Safe request/response transfer objects
│   │   ├── security/                     # Spring Security, BCrypt, JWT token filter
│   │   ├── exception/                    # Global exception handler with unified JSON errors
│   │   ├── config/                       # CORS & file storage static resource mappings
│   │   ├── scheduler/                    # Automated deadline expiry scheduler (@Scheduled)
│   │   └── notification/                 # Companion notification publisher
│   └── src/main/resources/
│       ├── application.properties        # Main config
│       ├── application-dev.properties    # Development profile (embedded MySQL mode)
│       └── application-mysql.properties  # Production / MySQL 8.x configuration
├── frontend/                             # React + Vite Frontend
│   ├── index.html                        # Semantic HTML5 entry point & viewport
│   ├── package.json                      # React, React Router, Leaflet, Recharts, Socket.IO
│   ├── src/
│   │   ├── index.css                     # CSS3 tokens (:root color tokens, spacing scale)
│   │   ├── App.jsx                       # Routing & role-based route guards
│   │   ├── components/                   # Navbar, Footer, StatusBadge, DonationCard, Map, Button, Input
│   │   ├── pages/                        # Home, Login, Register, AvailableFood, Details, Dashboards, Impact
│   │   ├── hooks/                        # useAuth, useSocketNotifications
│   │   └── services/api.js               # Central API service client
├── notification-service/                 # Companion Real-time Notification Service
│   ├── server.js                         # Express + Socket.IO event relay server
│   ├── package.json                      # Dependencies (express, socket.io, cors, dotenv)
│   └── .env.example                      # Configuration template
├── docs/
│   ├── api-notes.md                      # Complete REST API endpoint reference
│   └── screenshots/                      # Architecture and UI captures
└── README.md
```

---

## 3. Design System & CSS3 Tokens (Section 7)

Defined centrally in `frontend/src/index.css`:

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--primary-green` | `#176B4D` | Main buttons, navigation highlights, headings, logo |
| `--secondary-green` | `#21865D` | Hover states, secondary actions, small accents |
| `--soft-mint` | `#E8F4EC` | Selected filters, gentle highlight panels, icon backgrounds |
| `--warm-background` | `#F7F8F4` | Main page background |
| `--surface-white` | `#FFFFFF` | Cards, forms, modals, dashboard panels |
| `--main-text` | `#26332D` | High-priority text and typography |
| `--muted-text` | `#66736B` | Secondary hints, timestamps, labels |
| `--border` | `#DCE5DE` | Input borders, dividers, card outlines |
| `--warning-amber` | `#B7791F` | Deadlines approaching, attention-needed badges |
| `--error-red` | `#B42318` | Validation errors, failed requests, destructive actions |
| `--info-blue` | `#245B8F` | Informational notices |

---

## 4. Pre-Seeded Demonstration Accounts (Section 22)

All demo accounts use password: `password123`

| Role | Email | Name / Organisation | Verification |
| :--- | :--- | :--- | :--- |
| **Food Provider** | `provider@greenbistro.com` | Green Bistro Restaurant | Verified |
| **Food Provider** | `baker@sunrise.com` | Sunrise Bakery | Verified |
| **NGO / Receiver** | `ngo@hopekitchen.org` | Hope Community Kitchen | Verified |
| **NGO (Unverified)**| `newngo@sheltercare.org` | Shelter Care Collective | *Pending Verification* |
| **Volunteer** | `volunteer@foodrescue.org`| Alex Kumar | Verified |
| **Administrator** | `admin@foodrescue.org` | System Administrator | Verified |

---

## 5. Quick Start & Local Execution

### Step 1: Start Backend (Spring Boot)
Open a terminal in `backend/`:
```bash
# Using the included wrapper script:
mvnw.cmd spring-boot:run
```
- API Base URL: `http://localhost:8080`
- Pre-seeded data initializes automatically on first startup.
- *Default profile runs in MySQL-compatible embedded mode. To connect to an external MySQL 8.x database, set `spring.profiles.active=mysql` with your `DB_USERNAME` and `DB_PASSWORD`.*

### Step 2: Start Companion Notification Service (Node.js)
Open a second terminal in `notification-service/`:
```bash
cd notification-service
npm start
```
- Service URL: `http://localhost:5000`
- Exposes `POST /internal/notify` webhook and Socket.IO real-time channels.

### Step 3: Start Frontend (React + Vite)
Open a third terminal in `frontend/`:
```bash
cd frontend
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 6. Demonstration Workflow Walkthrough (Section 22)

1. **Sign In as Provider**: Click **Sign In** and pick **Food Provider** (`provider@greenbistro.com`).
2. **Publish Donation Listing**: Click **Donate Food**, fill in surplus cooked meal portions, set a collection deadline, and submit.
3. **Browse Listings as NGO**: Sign out, sign in as **Verified NGO** (`ngo@hopekitchen.org`), open **Find Food**, select the listing and click **Request Food** for a portion amount.
4. **Approve Request Atomically**: Switch to Provider account, open **Provider Dashboard**, and click **Approve & Reserve**. Observe the available quantity atomically update!
5. **Demonstrate Blocked Action**: Attempt to request food as `newngo@sheltercare.org` (unverified)—system displays policy explanation blocking reservation until admin approval.
6. **Mutual Handover Confirmation**:
   - Provider clicks **Confirm Handover Sent** on their dashboard.
   - NGO clicks **Confirm Handover Received** on their dashboard.
   - Status transitions to `COMPLETED` and the reservation closes.
7. **Verify Impact Reporting**: Navigate to **Impact** page to view verified redistribution counters and monthly trend graphs updated transparently.

---

## 7. Testing Suite (Section 16)

Run automated unit and business rule tests via Maven:
```bash
cd backend
mvnw.cmd test
```
Tests pass with **0 failures, 0 errors**:
- Unverified receiver request rejection
- Over-quantity reservation request rejection
- Expired deadline reservation prevention
- Atomic quantity lock & pickup creation on provider approval
- Unauthorized user / non-owner approval prohibition
- Duplicate registration rejection
