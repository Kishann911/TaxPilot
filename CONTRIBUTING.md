# Contributing to TaxSarthi

Thanks for wanting to make Indian tax filing less painful and more mathematically robust. Contributions of every size are welcome, from a typo fix in a portal schedule note to rate table expansions for upcoming assessment years.

---

## 📜 Ground Rules

1. **The core engine stays deterministic and zero-dependency.** `tax_engine.py` and `validate_income.py` are strictly Python 3.9+ standard library. Zero external dependencies in core calculations.
2. **Every statutory rule change ships with tests.** If a PR updates tax calculations, add a test to `test_tax_engine.py` with the hand-derived statutory result, citing the relevant section of the Income-tax Act, 1961.
3. **The LLM never performs arithmetic.** All computation logic remains strictly encapsulated in deterministic scripts.
4. **No real PII or tax data anywhere.** Never include actual PAN, Aadhaar numbers, real names, or live bank details in fixtures, issues, or PRs. The input validator rejects PAN/Aadhaar formats by design.
5. **The installer remains self-referential.** `DEFAULT_REPO` in `install.sh` points to the canonical repository.

---

## 🧪 Running the Test Suite

From the workspace root:

```bash
# 1. Golden Tests
python3 skills/taxsarthi/scripts/test_tax_engine.py

# 2. Input Validator Tests
python3 skills/taxsarthi/scripts/test_validate_income.py

# 3. Document Extraction Tests
python3 skills/taxsarthi/scripts/test_extraction.py

# 4. Invariant Fuzzer (3,000 cases)
python3 -m taxsarthi.cli.main fuzz --cases 3000 --seed 42
```

---

## 🤝 Areas Where Help Is Most Wanted

- **Finance Act Updates:** Keeping rate constants, rebate cliffs, and surcharge rules updated.
- **E-filing Portal Schedule Walkthroughs:** Updating `references/portal-walkthrough.md` as incometax.gov.in evolves.
- **Form Schedule Expansions:** Schedule FA (Foreign Assets), ESOP perquisite deferrals, and indexation scenarios.
- **Agent Integrations:** Improvements for Antigravity, Claude Code, and OpenAI Codex skills.
