# Redéploie le site de démonstration Netlify depuis Windows.
# Le plugin Next.js de Netlify échoue en build local sous Windows : on construit donc dans un conteneur Linux (Docker Desktop doit tourner).
# Prérequis : `netlify login` déjà fait, site déjà créé (NETLIFY_SITE_ID ci-dessous).
$ErrorActionPreference = "Stop"
$siteId = "0e349f58-608b-4100-b17d-ec0f2da86ac9"
$cfg = Get-Content "$env:APPDATA\netlify\Config\config.json" -Raw | ConvertFrom-Json
$env:NETLIFY_AUTH_TOKEN = $cfg.users.($cfg.userId).auth.token
$env:NETLIFY_SITE_ID = $siteId
$src = (Resolve-Path "$PSScriptRoot\..").Path
$cmd = 'set -e; mkdir /work; cd /src; tar cf - --exclude=node_modules --exclude=.next --exclude=.netlify --exclude=.git --exclude=".env*" --exclude=data . | tar xf - -C /work; cd /work; npm ci --no-audit --no-fund | tail -2; npm i -g netlify-cli | tail -1; netlify deploy --build --prod --site $NETLIFY_SITE_ID'
docker run --rm -e NETLIFY_AUTH_TOKEN -e NETLIFY_SITE_ID -v "${src}:/src:ro" node:24-bookworm-slim bash -c $cmd
