import { test, expect } from '@playwright/test';
const brevo = require('@getbrevo/brevo');
let defaultClient = brevo.ApiClient.instance;

let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

let apiInstance = new brevo.TransactionalEmailsApi();
let sendSmtpEmail = new brevo.SendSmtpEmail();
sendSmtpEmail.sender = { "name": "Yonatan", "email": "girmayonatan86@gmail.com" };
sendSmtpEmail.to = [
  { "email": "girmayonatan86@gmail.com", "name": "Yonatan" }
];

test('Bürgerbüro MITTE (Eberhardstr. 39)', async ({ page }) => {
  await page.goto('https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42');
  await page.getByText('Bürgerbüro MITTE (Eberhardstr. 39) Wird am Standort nicht angeboten').click();
  await page.getByText('Ausweisdokumente Wird am Standort nicht angeboten').click();
  await page.locator('#service-row-67').click();
  await page.getByRole('button', { name: 'Zur Terminauswahl' }).click();
  // await page.getByTitle('Vor>').click();
  await page.getByTitle('<zurück').click();
  const office = 'Bürgerbüro MITTE (Eberhardstr. 39)';
  const aprilDatesText = '<zurückVor>April 2025MoDiMiDoFrSaSo';

  async function ensureAprilIsVisible(page) {
    if (await page.getByText(aprilDatesText).isVisible()) {
      console.log('April already visible!');
      return;
    }

    // Check forward navigation
    await page.getByTitle('Vor>').click();
    await page.waitForTimeout(500); // or better: page.waitForLoadState('networkidle')

    if (await page.getByText(aprilDatesText).isVisible()) {
      console.log('April found after clicking forward.');
      return;
    }

    // April still not visible, click back instead
    await page.getByTitle('<zurück').click();
    await page.getByTitle('<zurück').click(); // twice because we previously moved forward once
    await page.waitForTimeout(500);

    if (await page.getByText(aprilDatesText).isVisible()) {
      console.log('April found after clicking backward.');
      return;
    }

    throw new Error('April dates not found even after navigating forward and backward.');
  }

// Call this helper function before continuing:
  await ensureAprilIsVisible(page);

  const october_dates = page.getByText(aprilDatesText);
  // need a screenshot for some reason
  await october_dates.screenshot({ path: 'screenshot.png' });

  const locator = october_dates.getByRole('link');
  const count = await locator.count();
  if (count > 0) {

    const found_dates = await locator.allInnerTexts();
    let earliest_date = Math.min(...found_dates.map((s) => +s));

    if (earliest_date < 10) {

      // send email here
      // Send the email using the transport and the mail options
      sendSmtpEmail.subject = `Ausländerbehörde (${office}) found dates`;
      sendSmtpEmail.htmlContent = await october_dates.innerHTML();
      // console.log();
      await apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
        // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      }, function (error) {
        console.error(error);
      });
    }
    console.log(office, found_dates.join(", "));
    await expect(october_dates).toHaveScreenshot();
  }

  await expect(locator).not.toHaveCount(0);
});