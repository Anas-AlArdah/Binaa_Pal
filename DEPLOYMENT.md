# Deployment

## Frontend on Netlify

Use the repository root as the Netlify project directory.

Netlify settings:

- Build command: `npm --prefix client ci && npm --prefix client run build`
- Publish directory: `client/build`
- Environment variable: `REACT_APP_API_URL=https://your-backend-url.example.com`
- Optional Netlify proxy variable: `BACKEND_URL=https://your-backend-url.example.com`

The `netlify.toml` file already contains the build settings and the fallback redirect needed by React Router.

## Backend

This project uses an Express/MySQL backend in `server/`. Netlify static hosting does not run this server as-is, so deploy it separately on a Node hosting service such as Render, Railway, Fly.io, or another VPS.

Backend settings:

- Root directory: `server`
- Install command: `npm ci`
- Start command: `npm start`
- Environment variables: copy the names from `server/.env.example` and fill in real production values in the hosting dashboard.

Use a hosted MySQL database for production. `DB_HOST` cannot be `localhost` after deployment.

After the backend is deployed, copy its public URL into Netlify as `REACT_APP_API_URL` or `BACKEND_URL`, then redeploy the frontend.

Do not commit real API keys, database passwords, or production secrets to Git.
