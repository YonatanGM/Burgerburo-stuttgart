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

test('Bürgerbüro VAIHINGEN (Rathausplatz 1)', async ({ page }) => {
  await page.goto('https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42');
  await page.getByText('Bürgerbüro VAIHINGEN (Rathausplatz 1) Wird am Standort nicht angeboten').click();
  await page.getByText('Ausweisdokumente Wird am Standort nicht angeboten').click();
  await page.locator('#service-row-67').click();
  await page.getByRole('button', { name: 'Zur Terminauswahl' }).click();
  await page.getByTitle('Vor>').click();

  const office = 'Bürgerbüro VAIHINGEN (Rathausplatz 1)';
  const october_dates = page.getByText('<zurückVor>Oktober 2023MoDiMiDoFrSaSo')
  // need a screenshot for some reason 
  await october_dates.screenshot({ path: 'screenshot.png' });
 
  const locator = october_dates.getByRole('link');
  const count = await locator.count();
  if (count > 0) {
 
    const found_dates = await locator.allInnerTexts();
    let earliest_date = Math.min(...found_dates.map((s) => +s));

    if (earliest_date < 31) {

      // send email here 
      // Send the email using the transport and the mail options
      sendSmtpEmail.subject = `Ausländerbehörde (${office}) found dates`;
      sendSmtpEmail.htmlContent = await october_dates.innerHTML();
      // console.log();
      await apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      }, function (error) {
        console.error(error);
      });
    }
    console.log(office, found_dates.join(", "));
    await expect(october_dates).toHaveScreenshot();
  }

  await expect(locator).not.toHaveCount(0);
});