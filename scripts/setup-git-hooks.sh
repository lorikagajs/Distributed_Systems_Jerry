#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
echo "Git hooks enabled: core.hooksPath=.githooks"
echo "pre-commit will block staging .env files (except .env.example)."
