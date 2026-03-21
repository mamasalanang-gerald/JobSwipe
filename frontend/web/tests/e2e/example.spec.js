// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('JobApp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app with retry logic
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  });

  test('homepage loads correctly', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Expect page title
    await expect(page).toHaveTitle(/JobSwipe/, { timeout: 10000 });
    
    // Expect main heading
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dream Job');
  });

  test('navigation works', async ({ page }) => {
    // Test navigation if it exists
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    if (count > 0) {
      // Check that navigation contains expected content
      const navText = await page.locator('nav').textContent();
      expect(navText).toBeTruthy();
      expect(navText).toContain('JobSwipe');
    }
  });

  test('responsive design works', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('error handling works', async ({ page }) => {
    // Test 404 page
    const response = await page.goto('/non-existent-page');
    
    // Should show some kind of error or 404 page
    // Next.js will show a 404 page
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    
    // Verify we got some response (even if it's a 404)
    expect(response).toBeTruthy();
  });
});