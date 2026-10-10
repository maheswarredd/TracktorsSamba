# 🚜 Samba Tractors (సాంబ ట్రాక్టర్స్ / सांबा ट्रैक्टर्स)
### *Reliable Tractor Services for Every Farm*
#### *ప్రతి పొలానికి నమ్మకమైన ట్రాక్టర్ సేవలు* • *हर खेत के लिए भरोसेमंद ट्रैक्टर सेवाएं*

A complete, production-ready MERN stack agricultural tractor and farming service booking web application built with **React.js + Vite**, **Node.js + Express.js**, **MongoDB + Mongoose**, **JWT + bcrypt authentication**, **Socket.IO for real-time chat & notifications**, **Framer Motion**, and **Rapido-style GPS / Google Maps farm navigation**.

---

## 🌟 Key Highlights & Features

- **Trilingual from the Core (Telugu, English, Hindi)**:
  - Header language selector updates the complete user interface instantly.
  - Zero state loss when switching languages mid-booking.
  - Full translations for services, statuses, notifications, payment directions, invoices, and dashboards.
- **Exact 29 Tractor Services Across 3 Core Categories**:
  - **SECTION 1 — Soil Ploughing Services (నేల దున్నే పనులు)** (9 Services: Heavy Plough, Normal Plough, Disc Plough, Round Plough, Cultivator, Deep Plough, Paddy Puddling, Paddy Leveller, Cage Wheel).
  - **SECTION 2 — Seed Sowing Services (విత్తనాలు వేసే పనులు)** (7 Services: Seed Drill, Groundnut Planter, Maize Planter, Cotton Planter, Pulse Planter, Row Seed Planter, Groundnut Seed Drill).
  - **SECTION 3 — Trolley & Load Services (ట్రాలీ / లోడ్ పనులు)** (13 Services: Paddy, Groundnut, Maize, Cotton, Hay, Fertilizer, Seed, Soil, Sand, Stone, Gravel, Brick, Wood).
- **Acre vs Trip Dynamic Billing & Calculation**:
  - Acre services calculate: `Number of Acres × Price per Acre`.
  - Trip services calculate: `Number of Trips × Price per Trip`.
  - Form dynamically switches inputs and enforces snapshotting at booking creation.
- **Rapido-Style GPS & Google Maps Experience**:
  - Browser GPS auto-detection with map pin placing & draggable marker.
  - **Compulsory Landmark** or detailed location directions.
  - "Navigate to Farm" button for pilots opening direct Google Maps turn-by-turn navigation.
- **Online UPI/QR & Offline Cash Modes**:
  - Scan official Samba QR code, submit 12-digit UTR reference and screenshot.
  - Status becomes `PAYMENT_PENDING` until Admin manual verification.
  - Cash on delivery with rider/admin confirmation.
- **Role Portals**:
  - **Farmer Portal**: Active booking timeline, call pilot, live chat, invoice download, cancellations, support tickets, and 1-5 star reviews.
  - **Rider Portal**: Today's, upcoming, and completed tasks, farmer details, Google Maps navigation, phone call, real-time chat, start service, complete service, and collect cash.
  - **Admin Control Center**: Revenue metrics, acreage/trip charts, assign pilot & tractor (with double booking conflict alerts), tariff manager, payment verification, and refund management.
- **Socket.IO Live Engine**:
  - Real-time Farmer-Rider-Admin messaging and live status progression.
- **Digital Tax Invoice**:
  - Printable/downloadable invoice with full booking, payment, and tax details.

---

## 🔐 Default Demo Accounts

| Role | Email / ID | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@sambatractors.com` | `password123` | Control center, stats, tariffs, pilot assignment, payment checks |
| **Rider (Pilot)** | `rider@sambatractors.com` | `password123` | Rider portal, farm navigation, call farmer, start/complete service |
| **Farmer** | `farmer@sambatractors.com` | `password123` | Book services, track bookings, live chat, invoices, reviews |

*(One-click demo login buttons are also available on the Login screen!)*

---

## 🛠️ Quick Start Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Run the Backend Server
```bash
cd server
npm install
npm start
```
*Note: An embedded in-memory MongoDB engine is bundled as a zero-config fallback. It seeds the exact 29 services, admin, rider, and tractor automatically.*

### 3. Run the Frontend Client
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Production Deployment Configuration

- **Frontend (Vercel)**: Configured in `vercel.json` with SPA rewrites.
- **Backend (Render)**: Configured in `render.yaml`.
- **Database (MongoDB Atlas)**: Set `MONGODB_URI` environment variable in `server/.env`.


## Client/server layout and browser push notifications

This repository uses `client/` (React/Vite) and `server/` (Express/MongoDB/Socket.IO). The old duplicate `frontend/` and `backend/` folders are not used.

### Web Push setup (required for notifications while the site is closed)

1. Deploy `server/` and `client/` over HTTPS. Browser push does not work on plain HTTP except localhost.
2. In the `server` environment, set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`. `CLIENT_URL` may be a comma-separated list of trusted client origins.
3. Generate a VAPID key pair on a trusted computer after installing server dependencies by running: `cd server && npx web-push generate-vapid-keys`. Copy the generated public and private keys into the server environment. Never put the private key in client code or GitHub.
4. Rebuild/redeploy the client after setting `VITE_API_URL` to the backend origin. It may be the bare origin or end in `/api`; the client normalizes it. Set `VITE_SOCKET_URL` to the backend origin if client and server are on separate domains.
5. Sign in, open the bell icon, click **Enable push**, and allow browser notifications. Repeat on each device/browser and each account that should receive pushes.

Notifications are persisted in MongoDB; the Notification model emits `new_notification` over Socket.IO and sends Web Push to registered browsers. Actual delivery while Chrome is fully closed depends on HTTPS, browser/OS permission and background push support. Without VAPID environment keys, in-app and live Socket.IO notifications work, but closed-site push cannot be sent.
