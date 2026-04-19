This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

All frontend configuration is done via environment variables.

### Local Development

Copy the example file and fill in your values:

```bash
cp src/frontend/.env.example src/frontend/.env.local
```

Then edit `.env.local`:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Base URL of the EshopJu .NET backend API |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `8801XXXXXXXXX` | Shop's WhatsApp number (international format, no `+`) |
| `NEXT_PUBLIC_SITE_NAME` | `EshopJu` | Shop name shown in the browser tab |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL of the storefront |

> **Note:** All `NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle at **build time**. Changing them after a build has no effect — you must rebuild.

### Docker / Docker Compose

```bash
docker compose up --build
```

Environment variables are passed as **build arguments** in `docker-compose.yml`. To customise them without editing the file, use an override:

```bash
# docker-compose.override.yml
services:
  frontend:
    build:
      args:
        NEXT_PUBLIC_API_URL: https://api.yourshop.com/api
        NEXT_PUBLIC_WHATSAPP_NUMBER: "880XXXXXXXXXX"
        NEXT_PUBLIC_SITE_URL: https://yourshop.com
```

### Production / Vercel

Set variables in the Vercel project settings (Settings → Environment Variables). They are injected automatically at build time.

---

## Getting Started

```bash
cd src/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Backend

```bash
cd src/backend
dotnet run --project EshopJu.API/EshopJu.API.csproj
```

The API runs on `http://localhost:5000` by default.
