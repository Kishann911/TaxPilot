# Contributing to TaxPilot

Thanks for wanting to make Indian tax filing transparent, accessible, and mathematically deterministic. Contributions of every size are welcome, from a typo fix in a portal schedule note to rate table expansions for upcoming assessment years.

---

## 📜 Ground Rules

1. **The core engines stay deterministic and zero-drift.** Both `src/lib/engine/taxEngine.ts` and `taxpilot/core/tax_engine.py` must maintain 100% mathematical parity.
2. **Every statutory rule change ships with tests.** If a PR updates tax calculations, add test assertions to both `tests/runEngineTests.ts` and `skills/taxpilot/scripts/test_tax_engine.py` with the hand-derived statutory result, citing the relevant section of the Income-tax Act, 1961.
3. **The LLM never performs arithmetic.** All computation logic remains strictly encapsulated in deterministic engine code.
4. **No real PII or tax data anywhere.** Never include actual PAN, Aadhaar numbers, real names, or live bank details in fixtures, issues, or PRs. The input validator rejects PAN/Aadhaar formats by design.
5. **The installer remains self-referential.** `DEFAULT_REPO` in `install.sh` points to the canonical repository (`https://github.com/Kishann911/TaxPilot.git`).

---

## 🧪 Running the Test Suite

From the repository root:

```bash
# 1. Full Next.js & TypeScript Test Suite
npm run test           # runs test:engine and test:api
npm run typecheck      # tsc --noEmit
npm run build          # production bundle validation

# 2. Python Golden Tests (51 Cases)
python3 skills/taxpilot/scripts/test_tax_engine.py

# 3. Python Input Validator Tests (104 Cases)
python3 skills/taxpilot/scripts/test_validate_income.py

# 4. Python Document Extraction Tests (50 Cases)
python3 skills/taxpilot/scripts/test_extraction.py

# 5. Invariant Property Fuzzer (3,000 cases)
python3 -m taxpilot.cli.main fuzz --cases 3000 --seed 42
```

---

## 🤝 Areas Where Help Is Most Wanted

- **Finance Act Updates:** Keeping rate constants, rebate cliffs, and surcharge rules synchronized with budget changes.
- **E-filing Portal Schedule Walkthroughs:** Updating schedule walkthrough guides as incometax.gov.in evolves.
- **Form Schedule Expansions:** Schedule FA (Foreign Assets), ESOP perquisite deferrals, and property indexation scenarios.
- **Agent Integrations:** Improvements for Antigravity, Claude Code, and OpenAI Codex skills.
- **Frontend Enhancements:** Additions to the Tax Studio visualizers and client-side document parsers.
