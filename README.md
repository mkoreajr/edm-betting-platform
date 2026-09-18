# EDM Betting Platform

Full-stack starter for EDM premium bet slips.

## Included
- Login/register with HttpOnly JWT cookie
- Dark/green EDM UI
- Hot matches with team logos
- Premium slip catalogue
- Locked picks/code are NOT sent to the browser before purchase
- Demo payment confirmation flow
- My Purchases / unlocked slips
- Admin dashboard for slips and users
- SQLite for local development
- Payment provider abstraction point for real M-Pesa/Airtel/Tigo integration

## Run
1. Install Node.js 20+
2. `npm install`
3. Copy `.env.example` to `.env`
4. Change `JWT_SECRET` and admin password
5. `npm start`
6. Open `http://localhost:3000`

Demo accounts:
- Admin: use `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`
- Normal user: register from the UI

## Production payment
The current payment button is deliberately DEMO mode. Before accepting real money, connect a Tanzanian mobile-money/payment provider and verify payment server-side through its webhook/API. Never trust a browser-only "paid" flag.

For production also use HTTPS, a managed PostgreSQL database or another durable DB, strong secrets, CSRF protection appropriate to the deployment, audit logs, backups, and provider-specific reconciliation/webhooks.


UI update: EDM top navigation redesigned to match the supplied reference, with inline SVG icons and responsive layout.

UI fix v9: removed the duplicate legacy header brand so the new EDM navigation appears only once and aligns from the left like the supplied reference.
