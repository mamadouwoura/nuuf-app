# Redéploiement en deux étapes avec réessais : 1) build local, 2) envoi du build déjà prêt.
# Utile quand la connexion est instable : une coupure ne force pas à tout refaire.
$ErrorActionPreference = "Continue"
$cfg = Get-Content "$env:APPDATA\netlify\Config\config.json" -Raw | ConvertFrom-Json
$env:NETLIFY_AUTH_TOKEN = $cfg.users.($cfg.userId).auth.token
$env:NETLIFY_SITE_ID = "0e349f58-608b-4100-b17d-ec0f2da86ac9"
Set-Location (Resolve-Path "$PSScriptRoot\..").Path

function Reessayer($nom, $essais, [scriptblock]$action) {
  for ($i = 1; $i -le $essais; $i++) {
    Write-Output "== $nom : essai $i/$essais"
    & $action
    if ($LASTEXITCODE -eq 0) { Write-Output "== $nom : OK"; return $true }
    Start-Sleep -Seconds 20
  }
  Write-Output "== $nom : ECHEC apres $essais essais"
  return $false
}

if (-not (Reessayer "build" 4 { netlify build })) { exit 1 }
if (-not (Reessayer "envoi" 8 { netlify deploy --no-build --prod })) { exit 2 }
exit 0
