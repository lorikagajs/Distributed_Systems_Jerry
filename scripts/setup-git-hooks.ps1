# Point this repo at .githooks/ so pre-commit blocks accidental .env commits.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Set-Location $repoRoot
git config core.hooksPath .githooks

if ($IsWindows -or $env:OS -match "Windows") {
  # Git for Windows runs hooks via sh; ensure executable bit when possible.
  git update-index --add --chmod=+x .githooks/pre-commit 2>$null
}

Write-Host "Git hooks enabled: core.hooksPath=.githooks"
Write-Host "pre-commit will block staging .env files (except .env.example)."
