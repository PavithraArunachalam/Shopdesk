# ShopDesk – Test Cases (Browser / Playwright)

Scope: Products, Orders, Users modules. Priority: P1 = smoke/critical, P2 = core, P3 = edge.
Assumption: elements expose `data-testid` attributes (see naming at the bottom). Adjust to the real app.

## 0. App-level
| ID | Title | Steps | Expected | Pri |
|---|---|---|---|---|
| APP-01 | App loads | Open base URL | Page loads, nav shows Products / Orders / Users | P1 |
| APP-02 | Navigation | Click each nav item | URL and page heading change correctly | P1 |
| APP-03 | Unknown route | Open `/does-not-exist` | Friendly 404 / not-found page | P3 |
| APP-04 | Responsive layout | Viewport 375x667 | Nav usable, tables readable/scrollable | P3 |
| APP-05 | Cross-browser | Run smoke in Chromium, Firefox, WebKit | Same results | P2 |

## 1. Products
| ID | Title | Steps | Expected | Pri |
|---|---|---|---|---|
| PRD-01 | List products | Open Products | Table/grid shows products with name, price, stock, category | P1 |
| PRD-02 | Search by name | Type "mouse" in search | Only matching products shown | P1 |
| PRD-03 | Search no result | Search "zzzzzz" | Empty-state message | P2 |
| PRD-04 | Search case-insensitive | Search "MOUSE" | Same results as "mouse" | P3 |
| PRD-05 | Filter by category | Select a category | Only that category listed | P1 |
| PRD-06 | Combine search + filter | Apply both | Results satisfy both | P2 |
| PRD-07 | Clear filters | Click reset | Full list returns | P2 |
| PRD-08 | View details | Click a product | Details page shows all fields correctly | P1 |
| PRD-09 | Create product (valid) | Fill all required fields, save | Success message, product appears in list | P1 |
| PRD-10 | Create – required validation | Submit empty form | Errors on each required field, nothing saved | P1 |
| PRD-11 | Create – invalid price | Price = -5 / "abc" | Validation error | P2 |
| PRD-12 | Create – invalid stock | Stock = -1 / 1.5 | Validation error | P2 |
| PRD-13 | Create – duplicate name/SKU | Reuse existing SKU | Error shown (if rule exists) | P2 |
| PRD-14 | Create – long text | 256+ chars in name | Validation or truncation, no UI break | P3 |
| PRD-15 | Update product | Edit price, save | Updated value in details and list | P1 |
| PRD-16 | Update – cancel | Edit, then cancel | No change persisted | P2 |
| PRD-17 | Delete product | Delete + confirm | Removed from list | P1 |
| PRD-18 | Delete – cancel | Delete, then cancel dialog | Product remains | P2 |
| PRD-19 | Delete product used in order | Delete a product present in an order | Blocked or handled per business rule | P2 |
| PRD-20 | Data persists on reload | Create product, reload | Product still present | P2 |

## 2. Orders
| ID | Title | Steps | Expected | Pri |
|---|---|---|---|---|
| ORD-01 | List orders | Open Orders | Orders with id, customer, date, total, status | P1 |
| ORD-02 | Create order (valid) | Select user, add products + qty, submit | Order created with status "Pending/New" | P1 |
| ORD-03 | Total calculation | Add 2 items with qty | Total = Σ price × qty | P1 |
| ORD-04 | Create – no items | Submit without items | Validation error | P1 |
| ORD-05 | Create – qty 0 / negative | Enter 0 or -1 | Validation error | P2 |
| ORD-06 | Create – qty > stock | Enter more than stock | Error or warning per rule | P2 |
| ORD-07 | Stock decreases | Create order, check product | Stock reduced accordingly (if implemented) | P2 |
| ORD-08 | View order details | Click an order | Items, quantities, totals, status, customer shown | P1 |
| ORD-09 | Update order | Edit items/quantities | Totals recalculated, saved | P2 |
| ORD-10 | Status transition (valid) | Pending → Paid → Shipped → Delivered | Status updates each step | P1 |
| ORD-11 | Status transition (invalid) | Delivered → Pending | Not allowed | P2 |
| ORD-12 | Cancel order | Cancel a Pending order | Status Cancelled; no further edits | P2 |
| ORD-13 | Edit locked orders | Open Shipped/Delivered order | Edit controls disabled | P2 |
| ORD-14 | Order history | Open a user's / order's history | Chronological status changes shown | P2 |
| ORD-15 | Search orders | Search by id / customer | Matching orders only | P1 |
| ORD-16 | Filter by status | Select status | Only that status listed | P1 |
| ORD-17 | Filter by date range | Pick from/to | Orders within range | P3 |
| ORD-18 | Sort | Sort by date / total | Correct order asc/desc | P3 |

## 3. Users
| ID | Title | Steps | Expected | Pri |
|---|---|---|---|---|
| USR-01 | List users | Open Users | Users with name, email, role | P1 |
| USR-02 | View user details | Click a user | Details shown correctly | P1 |
| USR-03 | Change role | Admin → Customer (etc.), save | New role shown in list and details | P1 |
| USR-04 | Update user info | Edit name/email, save | Changes persisted | P1 |
| USR-05 | Invalid email | Enter "abc" | Validation error | P2 |
| USR-06 | Duplicate email | Use another user's email | Error shown | P2 |
| USR-07 | Required fields | Clear name, save | Validation error | P2 |
| USR-08 | Search/filter users | Search by name, filter by role | Correct results | P2 |
| USR-09 | User's orders | Open user details | That user's orders are listed | P2 |
| USR-10 | Role-based access | Log in as non-admin, open role edit | Hidden/forbidden (if auth exists) | P2 |

## 4. End-to-end flows
| ID | Title | Flow |
|---|---|---|
| E2E-01 | Full purchase | Create product → create user order for it → move status to Delivered → verify history |
| E2E-02 | Stock integrity | Product stock 5 → order 3 → stock 2 → cancel → stock 5 |
| E2E-03 | Role change impact | Change user role → verify new permissions in UI |

## 5. Non-functional (browser level)
| ID | Title | Check |
|---|---|---|
| NF-01 | No console errors | Navigate all modules; no `console.error` |
| NF-02 | No failed requests | No 4xx/5xx on normal flows |
| NF-03 | Accessibility | axe scan (`@axe-core/playwright`) on each module, no critical violations |
| NF-04 | Visual regression | `toHaveScreenshot()` on list pages |
| NF-05 | Keyboard use | Forms submittable with Tab/Enter |

## Suggested `data-testid` names
`nav-products`, `nav-orders`, `nav-users`, `search-input`, `category-filter`, `status-filter`, `add-button`, `save-button`, `cancel-button`, `delete-button`, `confirm-delete`, `row-<id>`, `error-<field>`, `toast-success`, `empty-state`.
