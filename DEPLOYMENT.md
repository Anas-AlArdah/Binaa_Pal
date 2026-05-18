# Deployment

## Frontend on Netlify

Use the repository root as the Netlify project directory.

Netlify settings:

- Build command: `npm --prefix client ci && npm --prefix client run build`
- Publish directory: `client/build`
- Environment variable: `REACT_APP_API_URL=https://your-backend-url.example.com`

The `netlify.toml` file already contains the build settings and the fallback redirect needed by React Router.

## Backend

This project uses an Express/MySQL backend in `server/`. Netlify static hosting does not run this server as-is, so deploy it separately on a Node hosting service such as Railway, Render, Fly.io, or another VPS. Railway is the easiest option here because it can provision MySQL.

Backend settings:

- Root directory: `server`
- Install command: `npm ci`
- Start command: `npm run db:migrate && npm start`
- Environment variables: copy the names from `server/.env.example` and fill in real production values in the hosting dashboard.
- Health check path: `/health`

Use a hosted MySQL database for production. `DB_HOST` cannot be `localhost` after deployment.

After the backend is deployed, copy its public URL into Netlify as `REACT_APP_API_URL`, then redeploy the frontend.
If `REACT_APP_API_URL` is not set, the client currently defaults to the deployed Railway API URL.

Do not commit real API keys, database passwords, or production secrets to Git.
