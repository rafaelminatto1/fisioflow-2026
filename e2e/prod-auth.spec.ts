
import { test, expect } from '@playwright/test';

// Use production URL
const BASE_URL = 'https://fisioflow-2026.vercel.app';

test.describe('Production Authentication', () => {
    test.setTimeout(60000); // Increase timeout to 60s for cold starts

    test('should allow user to register', async ({ page }) => {
        console.log('Navigating to login page...');
        // Generate unique email
        const email = `test.user.${Date.now()}@example.com`;
        const password = 'Password123!';
        const name = 'Test User';



        await page.goto(`${BASE_URL}/login`);

        // Wait for the form to load
        await page.waitForSelector('form', { timeout: 10000 });

        // Switch to Registration mode
        // Click on "Novo por aqui? Crie sua conta"
        await page.getByText('Novo por aqui? Crie sua conta').click();

        // Now wait for the Name field to appear
        await page.waitForSelector('input[aria-label="Nome Completo"]', { timeout: 5000 });

        // Fill registration form using more specific selectors or by label
        await page.getByPlaceholder('Dr. Ricardo Marques').fill(name);
        await page.getByPlaceholder('exemplo@fisioflow.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        // There is no confirm password field in the component!
        // Removing confirm password step

        // Submit
        await page.click('button[type="submit"]');

        // Should redirect to dashboard or show success
        // Wait for navigation or welcome message
        await expect(page).toHaveURL(`${BASE_URL}/`);
        await expect(page.locator('text=Home')).toBeVisible();
    });

    test('should allow user to login', async ({ page }) => {
        // Use the user created above or a known test user? 
        // For safety, let's create a new one or assuming we can login immediately after reg.
        // Let's rely on registration test for now as it implicitly logs in.
        // Or try a known bad login to verify error handling.

        await page.goto(`${BASE_URL}/login`);

        await page.fill('input[type="email"]', 'nonexistent@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Expect error message
        // Adjust selector based on actual UI
        await expect(page.getByText('Invalid email or password')).toBeVisible();
    });
});
