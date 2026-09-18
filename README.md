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

UI fix v10: updated Bayern Munich hot-match logo to the current 2024 Wikimedia Commons SVG URL and added a fallback image handler.

UI v11: mobile top-bar navigation is collapsed into a hamburger menu; opening the menu reveals Home, Premium Picks, My Purchases, Account and Support, and selecting an item closes the menu automatically.

UI v12: Premium Picks page redesigned with premium cards, protected-selection preview, pricing/stats, secure-access notice, and mobile responsive layout.

UI v13: Premium slip checkout modal redesigned with mobile-money provider cards, secure summary, verification state, and responsive layout. Payment remains DEMO until live provider credentials/webhook are connected.

UI v14: Slip Details / Unlock page with locked picks, secure purchase panel, verified unlocked picks, odds and copyable bet slip code.

UI v15: My Purchases page redesigned with verified purchase cards, payment/date metadata, secure slip access, and responsive empty state.

UI v16: Member Account page redesigned with profile information, verified status, purchase summary, security panel, and account actions.
