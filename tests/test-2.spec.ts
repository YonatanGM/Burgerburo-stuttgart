import { test, expect } from '@playwright/test';

test('Bürgerbüro MITTE (Eberhardstr. 39)', async ({ page }) => {
  await page.goto('https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42');
  await page.getByText('Bürgerbüro MITTE (Eberhardstr. 39) Wird am Standort nicht angeboten').click();
  await page.getByText('Ausweisdokumente Wird am Standort nicht angeboten').click();
  await page.locator('#service-row-67').click();
  await page.getByRole('button', { name: 'Zur Terminauswahl' }).click();
  await page.getByTitle('Vor>').click();

  const office = 'Bürgerbüro MITTE (Eberhardstr. 39)';
  const october_dates = page.getByText('<zurückVor>Oktober 2023MoDiMiDoFrSaSo')
  // need a screenshot for some reason 
  await october_dates.screenshot({ path: 'screenshot.png' });
 
  const locator = october_dates.getByRole('link');
  const count = await locator.count();
  console.log(count);
  if (count > 0) {
    let date = new Date().toISOString();
    await october_dates.screenshot({ path: `./Found_Dates/${office.replace(/[^\w\s\']|_/g, "")
    .replace(/\s+/g, " ")}/${date}.png` });
  }

  await expect(locator).not.toHaveCount(0);
});