# Project: B2B LinkedIn PIC Finder and Serverless Migration

## Architecture
The application consists of a static frontend and a serverless Node.js backend hosted on Vercel.
- **Frontend**:
  - `index.html`: Main tips portal landing page.
  - `finder.html`: LinkedIn PIC Finder dashboard interface.
  - `finder.js`: Controls frontend search parameters, dynamic tag generation, handles search/enrich queue, details modal, and data export.
  - `finder.css`: Premium Dark Glass theme styling.
- **Backend (Vercel Serverless)**:
  - `api/search.js`: Stateless serverless function querying Apollo.io API with mapped seniority, department, location, and title parameters.
  - `api/enrich.js`: Stateless serverless function doing email/phone enrichment via public Yahoo search snippets and SMTP socket validation.
- **Configuration**:
  - `vercel.json`: Exposes public route mappings and paths to serverless function endpoints under `/api/*`.

## Code Layout
- `.agents/`: Coordination files and agent progress metadata (do not put source code here).
- `api/`: Vercel serverless function endpoints.
  - `search.js`: Search API handler.
  - `enrich.js`: Contact details enrichment handler.
- `index.html`, `finder.html`: Public static web pages.
- `script.js`, `finder.js`: Frontend logic scripts.
- `style.css`, `finder.css`: Stylesheets.
- `vercel.json`: Router and serverless deployment configuration.
- `tests/`: E2E test harness and test cases.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | E2E Test Suite Creation | Create test cases covering Tiers 1-4. Generate `TEST_READY.md`. | None | DONE |
| M2 | Frontend UI Enhancements | Add selectors for Seniority, Department, Location in `finder.html`/`css`/`js`. | M1 | IN_PROGRESS (Conv: 637caffc-7c08-438b-ad8b-4bc010cd93e5) |
| M3 | Backend Serverless Migration | Relocate search & SMTP enrichment logic to `api/search.js` & `api/enrich.js`. | M1 | IN_PROGRESS (Conv: 637caffc-7c08-438b-ad8b-4bc010cd93e5) |
| M4 | Vercel Router Config | Create `vercel.json` and configure routing & dev scripts. | M2, M3 | IN_PROGRESS (Conv: 637caffc-7c08-438b-ad8b-4bc010cd93e5) |
| M5 | Final Verification & Hardening | Run all E2E tests, execute Tier 5 adversarial testing & audit. | M4 | PLANNED |

## Interface Contracts
### Frontend -> `/api/search`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "company": "string (required)",
    "domain": "string (optional)",
    "titles": ["string (optional)"],
    "location": "string (optional)",
    "pages": "number (optional, default: 1)",
    "apolloApiKey": "string (required)",
    "seniority": ["string (optional)"],
    "department": ["string (optional)"],
    "geographic": "string (optional)"
  }
  ```
- **Response Body**:
  ```json
  {
    "results": [
      {
        "name": "string",
        "title": "string",
        "company": "string",
        "linkedin": "string",
        "snippet": "string",
        "email": "string | null",
        "phone": "string | null"
      }
    ],
    "query": "string"
  }
  ```

### Frontend -> `/api/enrich`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "name": "string (required)",
    "company": "string (required)",
    "domain": "string (optional)",
    "email": "string (optional)",
    "phone": "string (optional)"
  }
  ```
- **Response Body**:
  ```json
  {
    "name": "string",
    "company": "string",
    "domain": "string",
    "emails": ["string"],
    "phones": ["string"],
    "verification": {
      "status": "string (Deliverable | Undeliverable | Uncertain | SMTP Check Blocked | SMTP Timeout)",
      "reason": "string"
    },
    "isGuessed": "boolean (optional)",
    "enrichReason": "string (optional)"
  }
  ```
