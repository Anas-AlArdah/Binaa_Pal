# Binaa Pal

Binaa Pal is a React and Node.js platform for connecting clients with skilled tradespeople in Palestine. Clients can browse crafts, search for workers, view profiles, send service requests, and leave reviews. Workers can manage profile details, portfolio work, availability, and incoming service requests.

## Features

- Smart worker search by skill, location, and name.
- Worker profiles with skills, portfolio items, availability, prices, and reviews.
- Service requests from profile pages to workers.
- Worker orders dashboard for tracking and updating request status.
- Admin dashboard for platform management.

## Tech Stack

Frontend:

- React 18
- React Router
- Material UI
- Custom responsive CSS
- Native `fetch` through the shared `client/src/utils/api.js` helper

Backend:

- Node.js
- Express
- Sequelize
- Supabase PostgreSQL
- JWT authentication

## Project Structure

```text
Binaa_Pal/
  client/                  React frontend
    public/
    src/
      components/
      pages/
      utils/
      App.js
  server/                  Express and Sequelize backend
    config/
    controllers/
    middleware/
    migrations/
    models/
    routes/
    app.js
    index.js
  scripts/
  DEPLOYMENT.md
  README.md
```

## Local Setup

Install frontend dependencies:

```bash
npm --prefix client ci
```

Install backend dependencies:

```bash
npm --prefix server ci
```

Create backend environment variables:

```bash
copy server\.env.example server\.env
```

Then fill in the Supabase connection URL and a long random JWT secret in `server/.env`.

To enable Google sign-in, create a Google OAuth 2.0 Web application, add
`http://localhost:3000` to its Authorized JavaScript origins, and set its client ID as
`GOOGLE_CLIENT_ID` in `server/.env`. The React app reads this public client ID from the
backend, so a frontend environment variable is not required.

Create frontend environment variables only when an API URL override is needed:

```bash
copy client\.env.example client\.env
```

## Database

The backend uses Supabase PostgreSQL exclusively. Copy the Session pooler connection string from the Supabase dashboard into `SUPABASE_DATABASE_URL`; there is no local database fallback.

Useful backend commands:

```bash
npm --prefix server run db:migrate
npm --prefix server run db:migrate:status
npm --prefix server run db:seed
npm --prefix server start
```

## Development

Run the backend:

```bash
npm --prefix server start
```

Run the frontend:

```bash
npm --prefix client start
```

The frontend dev server proxies local API requests to `http://localhost:3001`.

## Verification

Build the frontend:

```bash
npm --prefix client run build
```

Check backend module loading:

```bash
node -e "require('./server/app'); console.log('server modules loaded')"
```

## Deployment

See `DEPLOYMENT.md` for Netlify, Railway, and Supabase deployment notes. Set `SUPABASE_DATABASE_URL` in every backend environment before running migrations or starting the API.

Do not commit real API keys, database passwords, JWT secrets, admin passwords, SMTP credentials, or production webhook URLs.
