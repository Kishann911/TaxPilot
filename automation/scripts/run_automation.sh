#!/usr/bin/env bash
# TaxSarthi Docker Automation Runner
set -euo pipefail

ACTION="${1:-sync}"

echo "================================================================="
echo " TaxSarthi Automation Container - Execution Mode: $ACTION"
echo "================================================================="

case "$ACTION" in
  sync)
    python3 /automation/scripts/sync_repo.py
    ;;
  test)
    echo "Running TaxSarthi Test Suite inside container..."
    python3 -m taxsarthi.cli.main selftest
    ;;
  fuzz)
    echo "Running Invariant Fuzzing inside container..."
    python3 -m taxsarthi.cli.main fuzz --cases 3000 --seed 42
    ;;
  *)
    echo "Unknown action: $ACTION"
    echo "Supported actions: sync, test, fuzz"
    exit 1
    ;;
esac
