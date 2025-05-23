
import { test, expect } from '@playwright/test';

test('homepage has correct title and navigation', async ({ page }) => {
  // Start from the index page
  await page.goto('/');
  
  // The page should have "MakeMentors" in the title
  await expect(page).toHaveTitle(/MakeMentors/);
  
  // The page should contain the logo
  await expect(page.getByText(/MakeMentors/)).toBeVisible();
  
  // Navigation links should be present
  await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /chat/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
});

test('footer contains copyright and legal links', async ({ page }) => {
  await page.goto('/');
  
  // Check for copyright in footer
  const currentYear = new Date().getFullYear().toString();
  await expect(page.locator('footer')).toContainText(currentYear);
  
  // Check for legal links
  const privacyLink = page.getByRole('link', { name: /privacy policy/i });
  const termsLink = page.getByRole('link', { name: /terms of service/i });
  
  await expect(privacyLink).toBeVisible();
  await expect(termsLink).toBeVisible();
});

test('sign in button redirects correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check if sign in button is present when not logged in
  const signInButton = page.getByRole('link', { name: /sign in/i });
  
  // If the button exists (user is not logged in), click it and verify redirect
  if (await signInButton.isVisible()) {
    await signInButton.click();
    await expect(page.url()).toContain('/auth');
  }
});
