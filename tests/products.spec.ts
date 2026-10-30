import { test, expect, Page } from '@playwright/test';

// Page Object for the Products module (adjust selectors to the real ShopDesk app)
class ProductsPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/');
    await this.page.getByTestId('nav-products').click();
    await expect(this.page.getByRole('heading', { name: /products/i })).toBeVisible();
  }
  async search(text: string) {
    await this.page.getByTestId('search-input').fill(text);
  }
  async filterByCategory(category: string) {
    await this.page.getByTestId('category-filter').selectOption(category);
  }
  rows() {
    return this.page.locator('[data-testid^="row-"]');
  }
  async create(p: { name: string; price: string; stock: string; category: string }) {
    await this.page.getByTestId('add-button').click();
    await this.page.getByLabel('Name').fill(p.name);
    await this.page.getByLabel('Price').fill(p.price);
    await this.page.getByLabel('Stock').fill(p.stock);
    await this.page.getByLabel('Category').selectOption(p.category);
    await this.page.getByTestId('save-button').click();
  }
}

test.describe('Products', () => {
  let products: ProductsPage;

  test.beforeEach(async ({ page }) => {
    products = new ProductsPage(page);
    await products.open();
  });

  test('PRD-01 lists products @smoke', async () => {
    await expect(products.rows().first()).toBeVisible();
  });

  test('PRD-02 search by name @smoke', async () => {
    await products.search('mouse');
    const count = await products.rows().count();
    expect(count).toBeGreaterThan(0);
    for (const text of await products.rows().allInnerTexts()) {
      expect(text.toLowerCase()).toContain('mouse');
    }
  });

  test('PRD-03 search with no result shows empty state', async ({ page }) => {
    await products.search('zzzzzz');
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('PRD-09 create product (valid) @smoke', async ({ page }) => {
    const name = `Test product ${Date.now()}`;
    await products.create({ name, price: '19.99', stock: '10', category: 'Accessories' });
    await expect(page.getByTestId('toast-success')).toBeVisible();
    await products.search(name);
    await expect(products.rows()).toHaveCount(1);
  });

  test('PRD-10 required field validation', async ({ page }) => {
    await page.getByTestId('add-button').click();
    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('error-name')).toBeVisible();
    await expect(page.getByTestId('error-price')).toBeVisible();
  });

  test('PRD-11 negative price rejected', async ({ page }) => {
    await products.create({ name: 'Bad price', price: '-5', stock: '1', category: 'Accessories' });
    await expect(page.getByTestId('error-price')).toBeVisible();
  });
});
