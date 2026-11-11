# ChefShop Angular frontend

ChefShop is the ICS 511 Milestone 1 frontend for Idea 6: a culinary institute with a store, student module fees, chef payroll, departmental budgets and product profitability. It uses the approved V6 Figma identity, food imagery and motion assets.

## Run locally

Use Node.js 22.12 or newer in the Node 22 line, or a compatible Node 24 installation. The project uses Angular 21 and TypeScript 5.9. Install from the lockfile:

```bash
npm ci
npm start
```

Open `http://localhost:4200/`. Routes use hash URLs so the production build works on static hosting without server rewrite rules. No backend, database server, payment gateway or environment secrets are needed.

## Demo accounts

Every seeded demo account uses password `ChefShop@2026`.

| Username | Role | Access |
| --- | --- | --- |
| `admin` | Admin | User access and all financial features |
| `accounts` | Accounting | Budgets, payroll, catering, fee records and profitability |
| `alex` | Student | Own profile, own fee records, own orders and store |
| `nadia` | Chef | Own profile, salary, deductions and assigned catering allowances |

New signups always receive the Student role. User roles are not selectable during signup. The login page can fill demo credentials, but sign-in still verifies the password hash. Admin users can change other accounts' roles and active status.

Use test card `4242 4242 4242 4242`, a future expiry such as `12/28`, and CVC `123` for demo checkout and fee payments. No money is collected. Real card details should not be entered.

## Features

- Home, academy and programs; 12 Egyptian/Italian/Greek meals, 12 spices, 12 tools, student uniform and knife kit.
- Search, cuisine/category/price filters, sorting, product options, quantity selection, related ingredients/tools, persistent bag and validated pickup/delivery checkout.
- Signup with username, name, email, picture, password, demo payment preference and cuisine preferences; login, profile editing, sign out, route guards and service-level role checks.
- Payroll base salary management, approved catering allowances, manual allowances, deductions, monthly salary totals, JSON exports and saved report snapshots.
- Department income and expense creation/editing/deletion, monthly and department filters, summary charts and ledger pagination.
- Editable selected-product units and direct costs, gross profit and margin comparisons with Chart.js.
- Student fee records, invoice creation, partial/full payment recording, ownership checks, payment history, receipts, search, sorting and pagination.
- Responsive layouts and data tables, lazy Angular feature routes, lazy product images and lazy Chart.js loading.
- Motion controls, reduced-motion support, optional audio feedback and theme preference.

The in-app workflow and account guide is available at `/#/guide`.

## State and storage

Angular signals and computed values hold shared state. Reactive Forms validate account, checkout and financial input. Feature components are loaded by the Router; reusable product cards, headings, error feedback and charts share the V6 design system.

| Mechanism | Stored information | Reason |
| --- | --- | --- |
| Local storage | Demo accounts, preferences, masked card metadata, bag, invoices, payments, salaries, transactions, product performance and report snapshots | Preserve the demonstration across browser restarts |
| Session storage | Eight-hour login session, contact/fulfillment checkout draft and guest order confirmations | Keep temporary identity and guest contact data within the current tab |
| Cookies | Theme and cookie preference choice | Remember non-sensitive presentation preferences without storing identity in cookies |

Storage uses the `chefshop:` key prefix. Passwords use PBKDF2/SHA-256 with a unique salt and 100,000 iterations. Only a demo card's last four digits, holder and expiry are saved; full card numbers and CVCs are discarded. File uploads accept JPG, PNG or WebP up to 500 KB.

This is a client-only teaching application. Browser storage and client-side guards do not provide production authentication or tamper-proof authorization. The next milestone must introduce server-side identity, validation, access control and proper payment processing.

## Test and build

```bash
npm test
npm run test:coverage
npm run build
```

Tests use Jasmine and Karma, as required by the course. The test helper finds an installed Chrome or Edge browser and runs it headlessly. Set `CHROME_BIN` explicitly if your browser is installed elsewhere. The production files are written to `dist/`.

The test suite covers authentication, signup storage, permissions, route guards, product options, quantity limits, normalized cart prices, department records, event approval, salary deductions, report snapshots, student ownership, partial payments, overpayments, checkout calculations and validation.

## Source structure

- `src/app/core`: typed models, seeded data, authentication, storage, cart, orders, finance and guards.
- `src/app/store`: public storefront, academy, bag and checkout.
- `src/app/account`: signup, login, profile and Admin user management.
- `src/app/finance`: Student, Chef, Accounting and Admin financial workspaces.
- `src/app/shared`: reusable cards, headings, errors and accessible Chart.js views.
- `public/assets`: local V6 imagery, fonts and meal explorer.

Financial seed records use November 2026. Tuition is separate from commercial department income. Product-performance records represent selected products and are separate from the department ledger. Payroll report exports preserve a snapshot; changing a salary schedule does not rewrite an already generated report.

## Submission and licensing

Submit the Angular source archive and the three-page course report together. Team identifiers and the report are kept in the separate local `deliverables` folder rather than the hosted application source. Confirm the team/idea registration, the remaining member email addresses and the accessibility of the final submission link before the deadline.

Meal presentation uses photo-derived 3D relief and rendered motion, not volumetric Unreal Engine food models. Font licenses and the Three.js license are included beside their assets. AI chat is an optional course bonus and is not included; audio feedback and motion bonuses are implemented.
