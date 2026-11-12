# GenZ Matrimony — Auth UI

Frontend-only authentication experience for GenZ Matrimony, built with React + Vite.
No backend, database, or real API calls are included — everything runs against a
mock service so the UI can be reviewed and used end-to-end today.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Start at `/login`.

**Demo credentials** (seeded in the mock service):

- Email: `aanya@example.com` (or mobile `9812345670`)
- Password: `GenZ@2026`

Registering a *new* account also works and logs you straight in — the mock
service only rejects the one seeded email as "already taken," to demonstrate
the error path.

## What's here

```
src/
  assets/            Brand logo (untouched — never recolored or redrawn)
  components/
    layout/          Header, Sidebar, Footer, AppLayout, AuthLayout
    ui/               Button, Input, PasswordInput, Checkbox, FormField,
                      AuthCard, Divider, GoogleButton, PasswordStrength, Logo
  context/           AuthContext.jsx — current user, session state, actions
  hooks/             useAuth.js
  pages/             Login, Register, ForgotPassword, ResetPassword, AppHome
  routes/            ProtectedRoute.jsx
  services/          authService.js — the mock API layer
  utils/             validation.js
  App.jsx            Route table
  main.jsx           Entry point (Router + AuthProvider)
  index.css          Design tokens + base styles
```

## Connecting the real backend later

`authService.js` is the only file that should change. Each function
(`login`, `register`, `forgotPassword`, `resetPassword`, `logout`,
`getCurrentUser`) currently resolves a mock response after a short delay —
swap the body for a real `fetch`/`axios` call to the matching endpoint:

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/verify
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Pages call `useAuth()` (which calls `AuthContext`, which calls
`authService`) — none of them talk to the mock directly, so no component
code needs to change when the backend lands.

## Design notes

- **Palette**: pulled from the logo — deep navy for the brand panel and
  headings, a blue/violet primary for everyday UI, and the logo's
  pink→orange gradient reserved for a few deliberate moments (the primary
  button, focus states, the signature graphic) rather than used throughout.
- **Type**: Clash Display for headings, Satoshi for body/UI — loaded from
  Fontshare in `index.html`.
- **Signature element**: the "connection thread" on the login/register/forgot
  panel — two nodes linked by a self-drawing curved line — echoes the logo's
  two-figures-and-heart mark without redrawing it.
- **Logo usage**: the source PNG is never recolored, redrawn, or filtered.
  On the dark brand panel it sits on a small light plate so its navy
  wordmark stays legible, rather than being altered to fit the background.

## Not built yet (by design)

Per the brief, this stage stops at the auth UI and its service-layer
architecture. No Node/Express, MongoDB, JWT, Cloudinary, Razorpay, chat,
matching, discovery, search, or admin dashboard — those are later stages.
