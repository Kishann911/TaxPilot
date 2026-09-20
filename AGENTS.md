# TaxPilot Agent Skill & Integration Guide

TaxPilot is an AI Agent Skill ecosystem for preparing and filing Indian Income Tax Returns (ITR) for **FY 2025-26 (AY 2026-27)**.

---

## 🤖 How AI Agents Should Use This Repository

- **The Skill Definition:** Located at [`skills/taxpilot/SKILL.md`](skills/taxpilot/SKILL.md) following the Agent Skills open standard.
- **Zero-Arithmetic Policy:** Agents must **never** compute tax, rebates, surcharge, cess, or interest figures in prompt text. Always prepare `income.json` and invoke `taxpilot compute` (or `taxsarthi compute`) or `skills/taxpilot/scripts/tax_engine.py`.
- **Pre-Execution Validation:** Always run `taxpilot validate` or `skills/taxpilot/scripts/validate_income.py` prior to invoking the calculation engine.
- **Privacy Enforcement:** Respect the blind-extraction and PII-redaction workflows outlined in `skills/taxpilot/references/blind-extraction.md`.
- **Self-Testing:** Run the self-test suite (`taxpilot selftest` or `python3 skills/taxpilot/scripts/test_tax_engine.py`) before starting any user filing session.

