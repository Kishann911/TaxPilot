#!/usr/bin/env bash
# TaxPilot Installer - installs the TaxPilot skill & engine into your agent environment.
#
# PREFERRED: clone the repo, review it, then run from checkout:
#
#   ./install.sh            # Claude Code
#   ./install.sh codex      # OpenAI Codex CLI
#   ./install.sh gemini     # Antigravity / Gemini CLI
#   ./install.sh all        # all supported agent platforms
#   ./install.sh cli        # install local python CLI command (taxpilot / taxsarthi)
#
# Scope: global (into $HOME) by default. Or install PROJECT-LOCAL:
#
#   cd ~/tax-2026 && /path/to/TaxPilot/install.sh --here
#   ./install.sh --project ~/tax-2026 all
#
# Override remote:
#   TAXPILOT_REF=<sha|tag|branch> ./install.sh
#   TAXPILOT_NO_FETCH=1 ./install.sh
#   TAXPILOT_REPO=<url> ./install.sh
#
# macOS and Linux. Windows: use WSL or manually copy skills/taxsarthi.

set -euo pipefail

DEFAULT_REPO="https://github.com/Kishann911/TaxPilot.git"

REPO="${TAXPILOT_REPO:-${TAXSARTHI_REPO:-$DEFAULT_REPO}}"
REF="${TAXPILOT_REF:-${TAXSARTHI_REF:-}}"
SKILL="taxpilot"

usage() {
  echo "Usage: install.sh [--here | --project DIR] [claude|codex|gemini|cli|all]"
  echo "  --here          install into the current directory (project-local)"
  echo "  --project DIR   install into DIR (project-local)"
  echo "  default         install into \$HOME (global, all projects)"
}

BASE="$HOME"
SCOPE="global"
TARGET=""
while [ $# -gt 0 ]; do
  case "$1" in
    --here)
      SCOPE="project"; BASE="$PWD" ;;
    --project)
      SCOPE="project"
      if [ $# -lt 2 ]; then
        echo "ERROR: --project needs a directory" >&2
        exit 1
      fi
      if [ ! -d "$2" ]; then
        echo "ERROR: --project '$2' is not a directory." >&2
        exit 1
      fi
      BASE="$(cd "$2" && pwd)"; shift ;;
    -h|--help) usage; exit 0 ;;
    claude|codex|gemini|cli|all) TARGET="$1" ;;
    *)
      echo "ERROR: unknown argument '$1'" >&2
      usage >&2
      exit 1 ;;
  esac
  shift
done
TARGET="${TARGET:-claude}"

fetch_source() {
  export GIT_TERMINAL_PROMPT=0
  git init --quiet "$SRC" || return 1
  git -C "$SRC" remote add origin "$REPO" || return 1
  git -C "$SRC" fetch --depth 1 --quiet origin "${REF:-HEAD}" || return 1
  git -C "$SRC" checkout --quiet FETCH_HEAD || return 1
}

if [ -f "$(dirname "$0")/skills/$SKILL/SKILL.md" ]; then
  SRC="$(cd "$(dirname "$0")" && pwd)"
  echo "Installing TaxPilot from local checkout: $SRC"
elif [ "${TAXPILOT_NO_FETCH:-${TAXSARTHI_NO_FETCH:-0}}" = "1" ]; then
  echo "ERROR: TAXPILOT_NO_FETCH=1 and no checkout found beside this script." >&2
  exit 1
else
  SRC="$(mktemp -d)"
  trap 'rm -rf "$SRC"' EXIT
  echo "Fetching $REPO${REF:+ @ $REF} ..."
  if ! fetch_source; then
    echo "ERROR: could not fetch ${REF:-HEAD} from $REPO" >&2
    exit 1
  fi
  echo "  fetched commit $(git -C "$SRC" rev-parse HEAD)"
fi

INSTALLED=()
install_into() {
  mkdir -p "$1"
  if [ -e "$1/$SKILL" ]; then
    echo "  replacing existing install at $1/$SKILL"
    rm -rf "${1:?}/$SKILL"
  fi
  cp -R "$SRC/skills/$SKILL" "$1/$SKILL"
  find "$1/$SKILL" -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
  find "$1/$SKILL" -name '*.pyc' -delete 2>/dev/null || true
  INSTALLED+=("$1/$SKILL")
  echo "  installed -> $1/$SKILL"
}

install_codex_home() {
  if [ "$SCOPE" = "global" ]; then
    install_into "${CODEX_HOME:-$HOME/.codex}/skills"
  fi
}

if [ "$SCOPE" = "project" ]; then
  echo "Scope: project-local -> $BASE"
else
  echo "Scope: global -> $BASE"
fi

case "$TARGET" in
  claude)  install_into "$BASE/.claude/skills" ;;
  codex)
    install_into "$BASE/.agents/skills"
    install_codex_home
    ;;
  gemini)  install_into "$BASE/.gemini/skills" ;;
  cli)
    echo "Installing TaxPilot CLI locally via pip..."
    pip3 install -e "$SRC" || python3 -m pip install -e "$SRC"
    echo "  installed taxpilot / taxsarthi CLI commands"
    ;;
  all)
    install_into "$BASE/.claude/skills"
    install_into "$BASE/.agents/skills"
    install_codex_home
    install_into "$BASE/.gemini/skills"
    ;;
esac

echo
echo "Verifying the TaxPilot engine (golden test suite)..."
FAILED=0
for dest in "${INSTALLED[@]}"; do
  if PYTHONDONTWRITEBYTECODE=1 python3 "$dest/scripts/test_tax_engine.py" >/dev/null 2>&1; then
    echo "  OK   $dest"
  else
    echo "  FAIL $dest - run: python3 $dest/scripts/test_tax_engine.py" >&2
    FAILED=1
  fi
done

if [ "$FAILED" -ne 0 ]; then
  echo "WARNING: verification failed. Check python3 version (3.9+ required)." >&2
else
  echo "✅ TaxPilot installation and golden tests verified successfully!"
fi

echo
if [ "$SCOPE" = "project" ]; then
  echo "Done. TaxPilot is installed in $BASE."
else
  echo "Done. Restart your agent CLI, then say: \"file my ITR with TaxPilot\""
fi
exit "$FAILED"
