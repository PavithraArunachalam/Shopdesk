# Playwright Testing – Easy Guide (ShopDesk)

## 1. What is Playwright?
Playwright opens a real browser (Chrome, Firefox, Safari engine), clicks and types like a user, and checks that the page shows the right thing. You write the steps as code.

## 2. Setup (once)
```bash
npm init -y
npm install -D @playwright/test
npx playwright install        # downloads the browsers
```

## 3. Run the tests
```bash
npx playwright test                       # all tests, all browsers
npx playwright test --project=chromium    # one browser only
npx playwright test --headed              # watch the browser
npx playwright test --ui                  # interactive UI mode (best for learning)
npx playwright test -g "PRD-02"           # run tests whose name contains PRD-02
npx playwright test --grep @smoke         # run tests tagged @smoke
npx playwright show-report                # open the HTML report
```
Tip: set the app address with `BASE_URL=http://localhost:3000 npx playwright test`.

## 4. Anatomy of a test
```ts
import { test, expect } from '@playwright/test';

test('PRD-01 lists products', async ({ page }) => {
  await page.goto('/');                                   // 1. ARRANGE: open the app
  await page.getByTestId('nav-products').click();        // 2. ACT: do something
  await expect(page.getByTestId('row-1')).toBeVisible();  // 3. ASSERT: check the result
});
```
Every test = **Arrange → Act → Assert**.

- `test(name, fn)` defines one test.
- `page` is the browser tab given to your test (fresh for each test).
- `await` is needed on almost every line, because browser actions take time.

## 5. Locators (how to find an element)
Prefer, in this order:
| Locator | Example | When |
|---|---|---|
| Role | `page.getByRole('button', { name: 'Save' })` | Buttons, headings, links |
| Label | `page.getByLabel('Price')` | Form fields |
| Test id | `page.getByTestId('search-input')` | When there is no good role/label |
| Text | `page.getByText('No results')` | Messages |
| CSS | `page.locator('.row')` | Last resort |

## 6. Common actions
```ts
await page.goto('/products');
await page.getByLabel('Name').fill('Mouse');
await page.getByRole('button', { name: 'Save' }).click();
await page.getByLabel('Category').selectOption('Accessories');
await page.keyboard.press('Enter');
```

## 7. Assertions (the "check" part)
```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Saved');
await expect(locator).toHaveCount(3);
await expect(locator).toBeDisabled();
await expect(page).toHaveURL(/products/);
```
These **auto-wait** (retry up to ~5 s), so you almost never need `sleep` or fixed waits.

## 8. Organising tests
```ts
test.describe('Products', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); }); // runs before each test
  test('...', async ({ page }) => { /* ... */ });
});
```
- **Tags**: put `@smoke` in the test name, run with `--grep @smoke`.
- **Page Object**: a class holding locators and actions for one page (see `ProductsPage` in `tests/products.spec.ts`). If the UI changes you fix it in one place.

## 9. Make tests reliable
1. Each test creates its own data (e.g. `Date.now()` in the name) and doesn't depend on another test.
2. Never use `waitForTimeout`; rely on auto-waiting assertions.
3. Use stable selectors (`data-testid`), not styling classes.
4. Keep one purpose per test.

## 10. Debugging a failure
- `npx playwright test --debug` steps through line by line.
- `--ui` shows each step with before/after screenshots.
- Failed runs save a screenshot, video and trace (see `playwright.config.ts`). Open a trace: `npx playwright show-trace <trace.zip>`.
- `npx playwright codegen http://localhost:3000` records your clicks and writes the code for you. Great for learning the locators.

## 11. How the files fit together
```
playwright.config.ts   → settings: base URL, browsers, screenshots, reports
tests/*.spec.ts        → your tests (one file per module)
docs/test-cases.md     → the test case list (IDs like PRD-01 map to test names)
```

## 12. Your learning path
1. Run `codegen` on ShopDesk and watch the code it creates.
2. Run `products.spec.ts` with `--ui`.
3. Add PRD-15 (update product) using the same pattern.
4. Create `orders.spec.ts` and `users.spec.ts`.
5. Add a GitHub Actions workflow to run tests on every push.
