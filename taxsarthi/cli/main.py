#!/usr/bin/env python3
"""TaxSarthi CLI - Deterministic Indian Income Tax (ITR) Filing & Computation Tool

Usage:
    taxsarthi compute <income.json> [--regime {both,new,old}] [--json]
    taxsarthi validate <income.json>
    taxsarthi selftest
    taxsarthi fuzz [--cases N] [--seed S]
    taxsarthi decrypt <encrypted_file> <password> [<output_file>]
    taxsarthi redact <ais_file.json> [<output_file.json>]
    taxsarthi tis <ais_file.json>
    taxsarthi parse26as <file_26as>
    taxsarthi version
"""

import argparse
import json
import os
import sys
import unittest

from taxsarthi import __version__
import taxsarthi.core.tax_engine as engine
import taxsarthi.core.validate_income as validator
import taxsarthi.core.fuzz_engine as fuzzer


def cmd_compute(args):
    """Compute taxes for a given income.json file."""
    if not os.path.exists(args.file):
        print(f"Error: File not found: {args.file}", file=sys.stderr)
        return 1

    # Run validation first
    val_res = validator.validate_file(args.file)
    if not val_res["valid"]:
        print(f"Validation failed with {len(val_res['errors'])} error(s):", file=sys.stderr)
        for err in val_res["errors"]:
            print(f"  ❌ {err}", file=sys.stderr)
        return 1

    with open(args.file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if args.json_output:
        res = engine.compute_tax_dict(data)
        print(json.dumps(res, indent=2))
        return 0

    engine.print_tax_computation(data)
    return 0


def cmd_validate(args):
    """Validate income.json schema and rules."""
    if not os.path.exists(args.file):
        print(f"Error: File not found: {args.file}", file=sys.stderr)
        return 1

    res = validator.validate_file(args.file)
    if res["valid"]:
        print(f"✅ {args.file} is perfectly valid for TaxSarthi engine.")
        if res.get("warnings"):
            print(f"\n⚠️  {len(res['warnings'])} warning(s):")
            for w in res["warnings"]:
                print(f"  • {w}")
        return 0
    else:
        print(f"❌ Validation failed for {args.file}:", file=sys.stderr)
        for err in res["errors"]:
            print(f"  • {err}", file=sys.stderr)
        return 1


def cmd_selftest(args):
    """Run golden and validator test suites."""
    print("================================================================")
    print("TaxSarthi Self-Test Suite (Golden Tests & Invariant Checks)")
    print("================================================================")
    
    # Import and run test suites
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Locate test files
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    scripts_dir = os.path.join(base_dir, "skills", "taxsarthi", "scripts")
    
    if os.path.exists(scripts_dir):
        discovered = loader.discover(scripts_dir, pattern="test_*.py")
        suite.addTests(discovered)
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    if result.wasSuccessful():
        print("\n🎉 ALL TESTS PASSED! TaxSarthi deterministic engine verified.")
        return 0
    return 1


def cmd_fuzz(args):
    """Run property-based fuzzer."""
    cases = args.cases or 3000
    seed = args.seed or 42
    print(f"Running TaxSarthi Invariant Fuzzer ({cases} cases, seed={seed})...")
    return fuzzer.run_fuzz(cases, seed)


def main():
    parser = argparse.ArgumentParser(
        prog="taxsarthi",
        description="TaxSarthi - Intelligent, Deterministic Indian Income Tax Return (ITR) CLI & Co-Pilot (AY 2026-27)",
    )
    parser.add_argument("-v", "--version", action="version", version=f"TaxSarthi v{__version__}")
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # compute
    p_comp = subparsers.add_parser("compute", help="Compute tax liability from income.json")
    p_comp.add_argument("file", help="Path to income.json")
    p_comp.add_argument("--json", dest="json_output", action="store_true", help="Output raw JSON")

    # validate
    p_val = subparsers.add_parser("validate", help="Validate an income.json file")
    p_val.add_argument("file", help="Path to income.json")

    # selftest
    subparsers.add_parser("selftest", help="Run comprehensive test suite")

    # fuzz
    p_fuzz = subparsers.add_parser("fuzz", help="Run property-based randomized fuzzing")
    p_fuzz.add_argument("--cases", type=int, default=3000, help="Number of cases to fuzz (default: 3000)")
    p_fuzz.add_argument("--seed", type=int, default=42, help="RNG Seed (default: 42)")

    # version
    subparsers.add_parser("version", help="Show TaxSarthi version")

    args = parser.parse_args()
    if not args.command or args.command == "version":
        print(f"TaxSarthi v{__version__} - Assessment Year 2026-27 (FY 2025-26)")
        if not args.command:
            parser.print_help()
        return 0

    if args.command == "compute":
        return cmd_compute(args)
    elif args.command == "validate":
        return cmd_validate(args)
    elif args.command == "selftest":
        return cmd_selftest(args)
    elif args.command == "fuzz":
        return cmd_fuzz(args)
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
