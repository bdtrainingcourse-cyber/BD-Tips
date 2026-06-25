# E2E Test Infra: B2B LinkedIn PIC Finder

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
- Feature 1: UI Navigation & Layout
- Feature 2: B2B Search Filter Configuration UI
- Feature 3: Profile Search Engine
- Feature 4: Lead Enrichment Engine
- Feature 5: SMTP & MX Verification Engine

## Test Architecture
- Test runner: node:test with Puppeteer
- Mocking strategy: Node.js preload hook (tests/mock-network.js)
- Coverage: 60 test cases across 4 tiers.

## Feature Checklist
| Feature | Tier 1 (Feature Coverage) | Tier 2 (Boundary & Corner) | Tier 3 (Cross-Feature Combo) | Tier 4 (Real-World Scenario) |
| :--- | :---: | :---: | :---: | :---: |
| **Feature 1: UI Navigation & Layout** | T1-F1-01 to 05 (5 cases) | T2-F1-01 to 05 (5 cases) | T3-CF-03, T3-CF-05 | T4-RW-04 |
| **Feature 2: B2B Search Filter Configuration UI** | T1-F2-01 to 05 (5 cases) | T2-F2-01 to 05 (5 cases) | T3-CF-01, T3-CF-03, T3-CF-04 | T4-RW-01, T4-RW-02 |
| **Feature 3: Profile Search Engine** | T1-F3-01 to 05 (5 cases) | T2-F3-01 to 05 (5 cases) | T3-CF-01, T3-CF-02, T3-CF-04 | T4-RW-01, T4-RW-02, T4-RW-05 |
| **Feature 4: Lead Enrichment Engine** | T1-F4-01 to 05 (5 cases) | T2-F4-01 to 05 (5 cases) | T3-CF-02 | T4-RW-01, T4-RW-03, T4-RW-05 |
| **Feature 5: SMTP & MX Verification Engine** | T1-F5-01 to 05 (5 cases) | T2-F5-01 to 05 (5 cases) | T3-CF-02 | T4-RW-01, T4-RW-05 |
