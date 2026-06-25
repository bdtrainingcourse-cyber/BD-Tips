# Original User Request

## Initial Request — 2026-06-23T21:09:37+07:00

Build a LinkedIn Person-in-Charge (PIC) Finder integrated directly into the B2B BD Tips portal, supporting search and contact enrichment (emails and phone numbers) for decision-makers using customizable B2B filters (seniority, department, geography), with backend migrated to Vercel Serverless Functions.

Working directory: `c:\Users\ASUS\Desktop\Antigratity Testing\b2b-website`
Integrity mode: `benchmark`

## Requirements

### R1. Custom B2B Filters UI
Integrate the LinkedIn PIC Finder frontend (`finder.html`, `finder.js`, `finder.css`) into the main B2B tips portal layout. Enhance the search configuration panel with input fields/selectors for:
- Seniority levels (e.g., C-level, VP, Director, Manager, Lead)
- Department filters (e.g., Enterprise B2B, Channel Sales, Partnerships, Growth)
- Geographic location/territory (e.g., Vietnam, Singapore, APAC)

### R2. Backend Migration to Vercel Serverless Functions
Restructure the Express server (`server.js`) backend to Vercel Serverless Functions under the `/api/` directory (specifically `api/search.js` and `api/enrich.js`). Ensure both endpoints are stateless, use CORS, and support the newly added seniority, department, and geographic parameters.

### R3. Lead Finder and SMTP Enrichment Logic
Update `/api/search` to call the Apollo.io API with filters corresponding to target company, domain, titles (mapped from selected departments and seniorities), and location. Update `/api/enrich` to find contact information for the profiles and run SMTP/DNS checks to verify emails.

### R4. Routing and Vercel Configuration
Configure `vercel.json` to route public requests correctly (e.g. mapping the root to `index.html`, and serving other static files while routing api requests to `/api/*`). Enable fully functional local testing via `vercel dev` or node-based environment emulation.

## Acceptance Criteria

### UI Integration and Filters
- [ ] Navigating to PIC Finder from `index.html` loads the correct page without errors.
- [ ] Users can select/configure Seniority Levels, Departments, and Geographic Location alongside the target company.
- [ ] The tags input dynamically updates and queries are sent to the backend with appropriate filter payloads.

### Serverless Execution
- [ ] Backend logic resides in `api/search.js` and `api/enrich.js` instead of running a persistent Express server.
- [ ] `vercel.json` routing configuration correctly exposes api endpoints and serves static files.

### Search and Verification Quality
- [ ] API searches use Apollo.io mixed people search with all filters mapped from user input (seniority, title tags, department, and location).
- [ ] Contact details are retrieved, and guessed/found emails are validated using DNS/MX and SMTP socket handshake verification, updating the confidence status on the UI.
