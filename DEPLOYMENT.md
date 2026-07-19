# Deployment

## Frontend on Netlify

Use the repository root as the Netlify project directory.

Netlify settings:

- Build command: `npm --prefix client ci && npm --prefix client run build`
- Publish directory: `client/build`
- Environment variable: `REACT_APP_API_URL=https://your-backend-url.example.com`

The `netlify.toml` file already contains the build settings and the fallback redirect needed by React Router.

## Backend

This project uses an Express backend connected exclusively to Supabase PostgreSQL. Netlify static hosting does not run this server, so deploy `server/` separately on Railway, Render, Fly.io, or another Node host.

Backend settings:

- Root directory: `server`
- Install command: `npm ci`
- Start command: `npm run db:migrate && npm start`
- Environment variables: copy the names from `server/.env.example` and fill in real production values in the hosting dashboard.
- Health check path: `/health`

For Google sign-in, create an OAuth 2.0 Web client in Google Cloud, add the production
frontend URL to Authorized JavaScript origins, and set the client ID as
`GOOGLE_CLIENT_ID` on the backend host. Email/password registration and Google
registration are both available.

## Supabase

1. Create a Supabase project.
2. Open `Connect` and copy the Session pooler connection string on port `5432`.
3. Set it as `SUPABASE_DATABASE_URL` in the backend host.
4. Run `npm run db:migrate` inside `server/`.

The migration creates the final schema, constraints, indexes, default roles and crafts, and enables Row Level Security on application tables. The database password must only exist in server environment variables; never expose `SUPABASE_DATABASE_URL` to the React client.

Schema migrations do not copy old MySQL rows. If those records are needed, migrate them once with Supabase's MySQL migration tool before switching production traffic, then verify row counts and PostgreSQL sequences.

After the backend is deployed, copy its public URL into Netlify as `REACT_APP_API_URL`, then redeploy the frontend.
If `REACT_APP_API_URL` is not set, the client currently defaults to the deployed Railway API URL.

Do not commit real API keys, database passwords, or production secrets to Git.
