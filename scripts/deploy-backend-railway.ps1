param(
  [string]$ProjectName = "binaa-pal",
  [string]$ServiceName = "api",
  [string]$EnvironmentName = "production",
  [string]$ClientOrigin = "https://binaapa.netlify.app"
)

$ErrorActionPreference = "Stop"

if (-not $env:RAILWAY_TOKEN -and -not $env:RAILWAY_API_TOKEN) {
  throw "Set RAILWAY_TOKEN or RAILWAY_API_TOKEN before running this script."
}

if (-not $env:SUPABASE_DATABASE_URL) {
  throw "Set SUPABASE_DATABASE_URL to the Supabase Session pooler connection string."
}

function Invoke-Railway {
  & npx --yes @railway/cli @args
}

Invoke-Railway init --name $ProjectName --json
Invoke-Railway add --service $ServiceName --json

Invoke-Railway variable set NODE_ENV=production --service $ServiceName --environment $EnvironmentName --skip-deploys
Invoke-Railway variable set CLIENT_ORIGIN=$ClientOrigin --service $ServiceName --environment $EnvironmentName --skip-deploys
Invoke-Railway variable set JWT_EXPIRES_IN=7d --service $ServiceName --environment $EnvironmentName --skip-deploys
Invoke-Railway variable set SUPABASE_DATABASE_URL=$env:SUPABASE_DATABASE_URL --service $ServiceName --environment $EnvironmentName --skip-deploys

if (-not $env:JWT_SECRET) {
  $env:JWT_SECRET = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
}

Invoke-Railway variable set JWT_SECRET=$env:JWT_SECRET --service $ServiceName --environment $EnvironmentName --skip-deploys

if ($env:ADMIN_EMAIL) {
  Invoke-Railway variable set ADMIN_EMAIL=$env:ADMIN_EMAIL --service $ServiceName --environment $EnvironmentName --skip-deploys
}

if ($env:ADMIN_PASSWORD) {
  Invoke-Railway variable set ADMIN_PASSWORD=$env:ADMIN_PASSWORD --service $ServiceName --environment $EnvironmentName --skip-deploys
}

Invoke-Railway up --service $ServiceName --environment $EnvironmentName --detach --message "Deploy Binaa Pal API"
Invoke-Railway domain --service $ServiceName --environment $EnvironmentName --port 3001 --json
