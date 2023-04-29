import inquirer from 'inquirer';
import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import



(async () => {
  dotenv.config()
  const browser = await puppeteer.launch({
    headless: false,

    executablePath: process.env.CHROME_INSTALLATION
  });
  const page = await browser.newPage();


  // LOGIN
  await page.goto('https://kvvks.baeder-suite.de/de/customers/login/');


  await page.waitForSelector('input#email');
  await page.type('input#email', process.env.LOGIN_EMAIL);
  await page.type('input#password', process.env.LOGIN_PASSWORD);
  page.$eval(`button[type=submit]`, element =>
    element.click()
  );

  await page.waitForNavigation();
  // const cookieButton = await page.waitForSelector('#accept_cookie_button')
  // await cookieButton.click()


  await page.waitForSelector('.well')





  // WARENKORB AUSLEEREN
  await page.goto('https://kvvks.baeder-suite.de/de/cart/');
  try {
    while (true) {
      await page.waitForSelector('a.remove_group', { timeout: 1000 });
      const hrefcart = await page.$eval('a.remove_group', (elm) => elm.href);
      await page.goto(hrefcart);
    }
  } catch (error) {

  }


  await page.goto('https://kvvks.baeder-suite.de/de/eticket_applications/select_location/');





  // GET SCHWIMMBÄDER
  await page.waitForSelector('div.module_applications a');
  const options = await page.$$eval('div.module_applications a', options => {
    return options.map(option => {
      return {
        href: option.href,
        label: option.querySelector('div.module_applications_label b').textContent
      }
    });
  });
  const selectedPool = await inquirer.prompt({
    type: 'list',
    name: 'pool',
    message: 'Welches Schwimmbad soll gebucht werden',
    choices: options.map(i => { return { name: i.label, value: i.href } }),
  })
  await page.goto(selectedPool.pool);


  // SELECT DATUM
  await page.waitForSelector('a.fc-day-grid-event.fc-h-event.fc-event.fc-start.fc-end');
  const href4 = await page.$eval('a.fc-day-grid-event.fc-h-event.fc-event.fc-start.fc-end', (elm) => elm.href);
  await page.goto(href4);



  const element2 = await page.waitForSelector('a.btn-primary');
  await element2.click();
  await page.waitForSelector('a.btn.btn-primary');
  const href = await page.$eval('a.btn.btn-primary', (elm) => elm.href);
  await page.goto(href);


  //SELECT TARIF
  await page.waitForSelector('#selected_tariff_amounts_156');
  await page.type('#selected_tariff_amounts_156', '1');
  const element3 = await page.$('form.form-horizontal');
  await element3.evaluate(element3 => element3.submit());


  // SELECT NAME
  await page.waitForSelector('select#customer_data_c_1_customer_id option');
  const options2 = await page.$$eval('select#customer_data_c_1_customer_id option', options => {
    return options.map(option => {
      return {
        label: option.textContent,
        value: option.value
      }
    });
  });
  const selectedName = await inquirer.prompt({
    type: 'list',
    name: 'name',
    message: 'Auf welchen Namen soll gebucht werden',
    choices: options2.filter(i => i.value != "0").map(i => { return { name: i.label, value: i.value } }),
  })
  await page.select('#customer_data_c_1_customer_id', selectedName.name)
  await page.waitForSelector('button.btn-primary.save_submit_button');
  page.$eval(`button[type=submit]`, element =>
    element.click()
  );
  await page.waitForSelector('a.btn.btn-primary');
  const href2 = await page.$eval('a.btn.btn-primary', (elm) => elm.href);
  await page.goto(href2);




  // SELECT BEZAHLART
  const element5 = await page.waitForSelector('input#payment_method_girosolution-creditcard');
  await element5.click();
  const checkoutForm = await page.$('form#shop_checkout_payment');
  await checkoutForm.evaluate(checkoutForm => checkoutForm.submit());


  // BESTELLUG ABSCHICKEN
  const agb = await page.waitForSelector("#agb_accepted");
  await agb.evaluate(agb => agb.click());
  const dsb = await page.$("#dsb_accepted");
  await dsb.evaluate(dsb => dsb.click());
  const orderForm = await page.$('form.form-horizontal');
  await orderForm.evaluate(orderForm => orderForm.submit());


  // BEZAHLUNG
  console.log('x')

  await page.waitForSelector("input#cardholder", { timeout: 5000 });

  await page.type('input#cardholder', process.env.CARDHOLDER);
  await page.type('input#pan', process.env.CARDNUMBER);

  await page.select('#expiry_month', process.env.EXPIRY_MONTH)
  await page.select('#expiry_year', process.env.EXPIRY_YEAR)


  const inputCVC = await inquirer.prompt({
    type: 'password',
    message: 'Geben Sie die CVC zu Ihrer Kreditkarte ein',
    name: 'cvc',
  })

  await page.type('#cvc', inputCVC.cvc)



  const submitButton = await page.$('#entry_form_submit');
  await submitButton.evaluate(submitButton => submitButton.click());

  await page.waitForSelector(".shop_checkout_complete", { timeout: 60000 });




  console.log('Finished!')



  await browser.close();
})();