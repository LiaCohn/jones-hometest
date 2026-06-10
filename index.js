const { chromium } = require('playwright');
const { z } = require('zod');

const detailsSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.email({ message: 'Must be a valid email address' }),
    phone: z.string()
        .min(7, { message: 'Must be a valid phone number' })
        .max(15, { message: 'Must be a valid phone number' }),
    company: z.string().min(2, { message: 'Company must be at least 2 characters' }),
    website: z.url({ message: 'Must be a valid URL including http:// or https://' }),
    employees: z.string().min(1, { message: 'Employees field is required' })
});

const details = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0501234567',
    company: 'Jones Ltd',
    website: 'https://jones.com',
    employees: '51-500'
}

const fillForm = async (details) => {
    let browser;

    try {
        const { name, email, phone, company, website, employees } = detailsSchema.parse(details);

        const url = 'https://test.netlify.app/';
        const thankYouUrl = `${url}thank-you.html**`;
        //launch browser
        browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();

        //goto the form
        await page.goto(url);

        //fill form
        await page.locator('#name').fill(name);
        await page.locator('#email').fill(email);
        await page.locator('#phone').fill(phone);
        await page.locator('#company').fill(company);
        await page.locator('#website').fill(website);
        await page.locator('#employees').selectOption(employees);

        //take screenshot before submitting
        await page.screenshot({ path: 'before-submit.png' });

        await page.locator('text=Request a call back').click();  // click
        await page.waitForURL(thankYouUrl);   
        console.log('Reached the thank you page!');


    } catch (error) {
        //zod error
        if (error instanceof z.ZodError) {
            error.issues.forEach(e => console.error(`Validation error - ${e.path[0]}: ${e.message}`));
        } else { //other errors
            console.error('Error:', error.message);
        }
    } finally {
        await browser?.close();
    }
};

fillForm(details);