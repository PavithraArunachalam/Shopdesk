# ShopDesk

A small back-office app (Products, Orders, Users) built as a realistic system under test.
Single self-contained `index.html` — no build step, no dependencies.

## Run

    python3 -m http.server 8080      # then open http://localhost:8080
    # or just open index.html in a browser (file:// works too)

## Demo accounts

| Email                        | Password       | Role              |
|------------------------------|----------------|-------------------|
| admin@shopdesk.test          | Admin123!      | admin             |
| manager@shopdesk.test        | Manager123!    | manager           |
| viewer@shopdesk.test         | Viewer123!     | viewer            |
| lucas.bernard@shopdesk.test  | Password123!   | viewer (disabled) |

## Features

- **Dashboard** – revenue, open orders, average order value and restock alerts, plus recent orders and an orders-by-status breakdown. Figures update live as orders and stock change.
- **Products** – 25 seeded items, 10 per page. Search by name/SKU; filter by category, stock level, status. Create, edit, delete. SKU is saved in capitals.
- **Export CSV** – exports the currently filtered (unpaginated) product list as a CSV download. Available to every role, since it's read-only.
- **Orders** – 30 seeded orders. Search by order number/customer/email; filter by status and date range. Create and edit orders with multiple line items and a live total.
- **Status & history** – pending → paid → shipped → delivered; cancel from pending or paid. Full status history on each order.
- **Printable invoice** – "Print invoice" on any order opens a clean, chrome-free invoice page (no nav/sidebar) with print-only CSS, ready for the browser's print dialog or "Save as PDF". Available to every role, since it's read-only.
- **Users** – list, details, edit; role editable by admins only.

## Rules worth testing

- Roles: admin does everything; manager creates/edits products and orders; only admin deletes products or edits users; viewer is read-only.
- Creating an order reduces stock; cancelling restores it; ordering more than available stock is rejected.
- Only pending orders can be edited.
- A product on an open order cannot be deleted.
- You cannot change your own role or disable yourself.
- An invoice for an order that doesn't exist shows a not-found state instead of crashing.
- Invoice totals and line items always match the order they were generated from.

## Test hooks

- Every key element has a `data-testid`.
- Filters and pages are in the URL, e.g. `#/products?q=mouse&category=Books`.
- API calls are async with a 250 ms delay (`LATENCY` at the top of the script; set to 0 to disable).
- Data lives in `localStorage`, so each fresh browser context starts from the same seed data. "Reset demo data" is in the footer.
- The invoice page (`#/orders/:id/invoice`) has no nav bar, so Playwright's `@media print` emulation (`page.emulateMedia({ media: 'print' })`) is a good way to test the print styles, and the `print-now-button` is a stable hook for asserting `window.print()` gets called.

![Printable invoice](docs/invoice.png)
