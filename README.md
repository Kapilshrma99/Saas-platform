# Multi-Tenant SaaS Website Builder

A full-stack multi-tenant website builder with Razorpay subscription payments, built with Next.js, Express, MongoDB, Redis, MinIO, Docker, and Nginx.

## Features
- Multi-tenant routing via subdomain or `/site/:slug`
- Dynamic theme rendering with CSS variables
- Tenant onboarding, website content, booking form
- Razorpay subscriptions and payment verification
- MinIO image uploads
- Docker Compose infrastructure with Nginx proxy

## Getting Started

1. Copy environment variables.

Backend:
- `backend/.env.example` → `backend/.env`

Frontend:
- `frontend/.env.local.example` → `frontend/.env.local`

2. Update Razorpay credentials in `backend/.env` and `frontend/.env.local`.
3. Start with Docker Compose:

```bash
docker-compose up --build
```

4. Access services:
- Frontend: `http://localhost`
- Backend API: `http://localhost/api/health`
- MinIO console: `http://localhost:9000`

## Tenant URLs
- Subdirectory: `http://localhost/site/smilecare`
- Subdomain (requires hosts file mapping): `http://smilecare.localhost`

## Hosts file for subdomain testing
Add the following entry to your hosts file:

```text
127.0.0.1 localhost
127.0.0.1 smilecare.localhost
```

Use unique entries for each tenant subdomain for local testing.

## Payment Testing
- Create payments via the pricing page or checkout flow.
- Razorpay environment variables required:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- Use Razorpay test credentials during development.

## Notes
- The backend caches tenant lookups in Redis with keys like `tenant:{slug}`.
- The MinIO upload bucket is `uploads` and stores files under `/uploads/{slug}/...`.
- Nginx forwards `/api/` to the backend and all other traffic to the frontend.

## Production Considerations
- Enable HTTPS in Nginx for real domains.
- Replace Razorpay test keys with live keys.
- Use a managed MongoDB/Redis and secure MinIO storage.
- Add authentication for tenant dashboard and admin flows.
