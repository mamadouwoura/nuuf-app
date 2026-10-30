# Redéploie le site de démonstration Netlify depuis Windows : build local puis envoi (netlify deploy --build --prod).
# Cette méthode a fonctionné le 30/10 ; la méthode par conteneur Docker échouait sur le réseau (npm ECONNRESET).
# Si le plugin Next.js de Netlify échoue sous Windows, reprendre la méthode conteneur : deploy/netlify-redeploy-docker.ps1.
# Prérequis : `netlify login` déjà fait, site déjà créé (NETLIFY_SITE_ID ci-dessous), migrations Neon déjà appliquées.
$ErrorActionPreference = "Stop"
$siteId = "0e349f58-608b-4100-b17d-ec0f2da86ac9"
$cfg = Get-Content "$env:APPDATA\netlify\Config\config.json" -Raw | ConvertFrom-Json
$env:NETLIFY_AUTH_TOKEN = $cfg.users.($cfg.userId).auth.token
$env:NETLIFY_SITE_ID = $siteId
Set-Location (Resolve-Path "$PSScriptRoot\..").Path
netlify deploy --build --prod
exit $LASTEXITCODE
