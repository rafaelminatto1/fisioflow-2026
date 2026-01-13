import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const ROUTES = [
    '/dashboard',
    '/agenda',
    '/patients',
    '/financial',
    '/exercises',
    '/assessments',
    '/settings',
    '/advanced-analytics',
    '/ai-plans',
    '/analysis',
    '/communications',
    '/contracts',
    '/crm',
    '/documents',
    '/equipments',
    '/events',
    '/forms',
    '/gamification',
    '/goals',
    '/holidays',
    '/monitoring',
    '/occupancy',
    '/packages',
    '/patient-app',
    '/patient-record',
    '/preregister',
    '/providers',
    '/reception',
    '/reports',
    '/security',
    '/services',
    '/staff',
    '/stock',
    '/tasks',
    '/telemedicine',
    '/templates',
    '/waitlist',
    '/workouts'
];

test.describe('Console Error Monitor', () => {
    test.setTimeout(300000); // 5 minutes total

    let page: Page;

    test.beforeAll(async ({ browser }) => {
        test.setTimeout(60000);
        page = await browser.newPage();


        // 1. Register/Login
        page.on('console', msg => console.log(`[BROWSER]: ${msg.text()}`));
        console.log(`Navigating to ${BASE_URL}/login...`);
        await page.goto(`${BASE_URL}/login`);

        // Switch to Registration mode
        await page.getByText('Novo por aqui? Crie sua conta').click();
        await page.waitForSelector('input[aria-label="Nome Completo"]', { timeout: 10000 });

        // Fill registration form
        const timestamp = Date.now();
        const email = `test.monitor.${timestamp}@example.com`;
        const password = 'Password123!';

        await page.getByPlaceholder('Dr. Ricardo Marques').fill(`Test User ${timestamp}`);
        await page.getByPlaceholder('exemplo@fisioflow.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);

        // Wait for button to be enabled and click Register
        const submitBtn = page.getByRole('button', { name: 'Criar Conta Gratuita' });
        await expect(submitBtn).toBeEnabled({ timeout: 10000 });
        await submitBtn.click();

        // Wait for success message and auto-switch to Login mode
        await expect(page.getByText('Tudo pronto!')).toBeVisible({ timeout: 20000 });
        await expect(page.getByText('Bem-vindo de volta')).toBeVisible();

        // Now perform Login (email should be pre-filled, but let's ensure)
        await page.getByPlaceholder('exemplo@fisioflow.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);

        // Click Login
        const loginBtn = page.getByRole('button', { name: 'Acessar Plataforma' });
        await expect(loginBtn).toBeEnabled();
        await loginBtn.click();

        // Wait for redirect to dashboard/home
        await expect(page).toHaveURL(`${BASE_URL}/`);
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 30000 });
        console.log('Login successful.');
    });

    test.afterAll(async () => {
        await page.close();
    });

    for (const route of ROUTES) {
        test(`check ${route} for console errors`, async () => {
            const errors: string[] = [];

            // Listen for console errors
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            // Listen for uncaught exceptions
            page.on('pageerror', exception => {
                errors.push(`Uncaught exception: ${exception.message}`);
            });

            console.log(`Visiting ${BASE_URL}${route}...`);
            await page.goto(`${BASE_URL}${route}`);

            // Wait for hydration/load
            await page.waitForTimeout(2000);

            if (errors.length > 0) {
                console.error(`Errors found on ${route}:`);
                errors.forEach(e => console.error(`- ${e}`));
            }

            // Assert no errors (optional: can be soft assertion to continue checking others)
            // check for "Minified React error" specifically as requested
            const hydrationErrors = errors.filter(e => e.includes('Minified React error') || e.includes('Hydration failed'));
            expect(hydrationErrors, `Hydration errors found on ${route}`).toHaveLength(0);

            // General error check (uncomment if you want to fail on ANY error)
            // expect(errors).toHaveLength(0);
        });
    }
});
