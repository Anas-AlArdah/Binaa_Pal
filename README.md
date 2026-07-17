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
- Bootstrap and custom CSS
- Native `fetch` through the shared `client/src/utils/api.js` helper

Backend:

- Node.js
- Express
- Sequelize
- MySQL or compatible hosted SQL database
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

Then fill in the database, JWT, Google, and email values in `server/.env`.

Create frontend environment variables when needed:

```bash
copy client\.env.example client\.env
```

## Database

The backend reads database settings from environment variables first. `server/config/config.json` only contains non-secret local defaults and should not contain real passwords.

Useful backend commands:

```bash
npm --prefix server run db:create
npm --prefix server run db:migrate
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

Run the frontend test suite:

```bash
npm --prefix client test -- --watchAll=false
```

Build the frontend:

```bash
npm --prefix client run build
```

Check backend module loading:

```bash
node -e "require('./server/app'); console.log('server modules loaded')"
```

## Deployment

See `DEPLOYMENT.md` for Netlify and Railway-oriented deployment notes. In production, set either `DATABASE_URL`/`MYSQL_URL` or the explicit `DB_HOST`, `DB_USERNAME`, and `DB_NAME` environment variables.

Do not commit real API keys, database passwords, JWT secrets, admin passwords, SMTP credentials, or production webhook URLs.
