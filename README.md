# ENGINY Hub — Workshop Management Platform with AI-Assisted Request Scoring

A full-stack web platform for managing the **ENGINY** programme: schools request vocational workshops (for example Industry 4.0, arts and social, science and humanities), administrators review and assign them, and teachers manage sessions and attendance. A **Google Gemini** worker helps the committee prioritise incoming requests.

> DAM project · Institut Pedralbes · 2026

---

## Features

- 🏫 **Three roles** — Admin, School Centre and Professor, each with its own dashboard
- 📝 **Dynamic request forms** — schools apply for workshops with student numbers, motivation and history
- 🤖 **AI-assisted scoring** — a background worker sends pending requests to **Gemini 2.0 Flash** with the committee's criteria (new schools first, proximity, inclusion and guidance) and stores a 0–100 score with a short justification
- 📅 **Sessions and attendance** — professors see their sessions and record attendance
- ✅ **Pedagogical checklist** — each workshop has a configurable checklist that centres complete
- 🔔 **Real-time notifications** with Socket.IO
- 📄 **Exports** — workshop catalogue as PDF and assignment reports as CSV
- 🔐 **Auth** — JWT, bcrypt, email verification
- 🖥️ **Desktop build** — the web app can also run as an Electron desktop app

---

## Architecture

```
Vue 3 + Vuetify (web / Electron)
        │  REST (axios) + Socket.IO
        ▼
Node.js · Express API ──► MongoDB (Mongoose)
        │ fork()
        ▼
AI worker (child process) ──► Google Gemini API
```

The AI scoring runs in a **separate child process**, so long model calls never block the API.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vite, Vuetify, Pinia, Vue Router, axios, Socket.IO client |
| Desktop | Electron |
| Backend | Node.js, Express, Socket.IO |
| Data | MongoDB, Mongoose |
| AI | Google Gemini API (`@google/generative-ai`) |
| Other | JWT, bcrypt, Nodemailer, PDFKit, json2csv |

---

## Project structure

```
ENGINY/ENGINY-ECOSYSTEM/
├── backend/
│   ├── server.js            # Express + Socket.IO + AI worker
│   ├── seed.js
│   └── src/
│       ├── controllers/     # auth, requests, workshops, sessions
│       ├── models/          # User, Request, Workshop, Session, Assignment
│       ├── routes/
│       ├── middleware/      # JWT auth
│       └── workers/         # assignmentWorker.js (Gemini scoring)
└── frontend-web/
    ├── src/views/           # Admin, Centre and Professor dashboards
    └── electron/            # desktop wrapper
```

---

## Run it

```bash
# backend/.env: MONGO_URI, JWT_SECRET, GEMINI_API_KEY, email settings
cd ENGINY/ENGINY-ECOSYSTEM/backend
npm install && npm run seed && npm run dev

cd ../frontend-web
npm install && npm run dev
```

---

**Author:** [Pariskar Rijal](https://github.com/pariskarrijal) · [LinkedIn](https://www.linkedin.com/in/pariskar-rijal-2b25a0257/)
