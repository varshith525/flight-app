# ✈️ SkyLine AI – Flight Management Platform

A modern full-stack Flight Management Web Application built using Next.js, Supabase, Zustand, and Tailwind CSS.

This application allows users to:

- Search available flights
- Select seats in real-time
- Book tickets
- View booking confirmations
- Reschedule bookings
- Cancel bookings
- Experience responsive airline-style UI
- Use offline-ready PWA support

---

# 🚀 Live Demo

Production URL:

```bash
https://flight-4ppre1trd-varshith525s-projects.vercel.app
```

Local Development URL:

```bash
http://localhost:3000
```

Example Booking Confirmation Route:

```bash
http://localhost:3000/confirmation/3Z4KRK
```

---

# 🛠️ Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase
- Zustand
- next-pwa
- Lucide Icons
- Vercel Deployment

---

# 📂 Project Structure

```bash
app/
components/
lib/
stores/
supabase/
public/
```

---

# ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rvgqvfktttevvencdzigk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

# 🧪 Test Account

```bash
Email: testuser@example.com
Password: Test@123
```

---

# 🗄️ Database

Supabase is used for:

- Authentication
- Flight storage
- Seat management
- Booking management
- Real-time seat updates

Migration SQL files are available inside:

```bash
/supabase/migrations
```

---

# 🧠 Zustand Store Structure

## flightStore.ts

Handles:

- Selected flights
- Selected seats
- Optimistic seat updates
- Booking session state

## userStore.ts

Handles:

- Authenticated user state
- Session handling
- Login/logout persistence

---

# ✈️ Features

## Flight Search

Users can browse available flights between destinations.

## Real-Time Seat Selection

Seats update instantly using Supabase realtime subscriptions.

## Booking Confirmation

Users receive:

- PNR Code
- Seat details
- Flight information
- Payment summary

## Reschedule Feature

Users can:

- Modify departure date
- Modify departure time
- Persist updates in database

## Cancel Booking

Bookings can be cancelled directly from dashboard.

## PWA Support

Application includes:

- Service Worker
- Offline support
- Installable app support

---

# 🔒 Database Rules

Implemented:

- Atomic booking updates
- Seat availability checks
- Reschedule logic
- Booking persistence

---

# 📦 Installation

Clone repository:

```bash
git clone https://github.com/varshith525/flight-app.git
```

Move into project:

```bash
cd flight-app
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

---

# 🚀 Deployment

Deployed using Vercel.

Deploy command:

```bash
vercel --prod
```

---

# 📸 PWA Lighthouse

PWA optimization enabled using:

```bash
next-pwa
```

---

# 👨‍💻 Author

BUPANA VARSHITH

GitHub:

```bash
https://github.com/varshith525
```

---

# 📄 License

This project is built for educational and internship assessment purposes.
