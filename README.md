<<<<<<< HEAD
# connecting-to-esewa
=======
# US to eSewa Remittance Application

Remitly-like money transfer app: send from US debit cards or bank accounts to eSewa wallets in Nepal.

## Stack

- **Backend**: Java 17, Spring Boot 3, Spring Security, JWT, Stripe, Thunes
- **Frontend**: Angular 17, RxJS, Stripe.js
- **Database**: H2 (dev) / PostgreSQL (prod)

## Quick Start

### Backend

```bash
cd backend
# Ensure Java 17+ and Maven are installed
mvn spring-boot:run
```

API runs at http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at http://localhost:4200

### Environment

**Backend** (`application.yml` or env vars):

- `JWT_SECRET` – Min 256-bit key for JWT
- `STRIPE_SECRET_KEY` – Stripe test key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET` – For webhooks (optional for MVP)
- `THUNES_API_URL` – e.g. https://api-sandbox.thunes.com
- `THUNES_API_KEY` – Thunes API key (optional for demo; uses mock if empty)

**Frontend** (`src/environments/environment.ts`):

- `apiUrl` – Backend URL (default http://localhost:8080)
- `stripePublishableKey` – Stripe test key (pk_test_...)

### Test Flow

1. Register / log in
2. Add a recipient (e.g. eSewa ID 9806800001)
3. Enter amount, get quote
4. Pay with Stripe test card: 4242 4242 4242 4242
5. Transfer is confirmed; Thunes delivers to eSewa (or mocked if no Thunes key)

### Notes

- MVP uses H2 in-memory DB; restart clears data
- Thunes sandbox: apply at thunes.com for API access
- Production requires money transmitter licensing (US) and eSewa/Thunes partnership
>>>>>>> 99d1d8d (Core Codebase)
