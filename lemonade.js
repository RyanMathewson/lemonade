const puppeteer = require('puppeteer');
const CREDS = require('./creds');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  
  // Browse to page
  await page.goto('https://limeade.com/brandedlogin.aspx?redirect=0&e=Limeade', {waitUntil: 'networkidle2'});
  await page.screenshot({ path: '1.png' });
  
  // Enter login credentials
  await page.click('#ctl00_content_SiteThemeContentFragmentPage1_fragment_3526_ctl01_ctl00_LoginForm1_ctl06_username');
  await page.keyboard.type(CREDS.username);  
  await page.click('#ctl00_content_SiteThemeContentFragmentPage1_fragment_3526_ctl01_ctl00_LoginForm1_ctl06_password');
  await page.keyboard.type(CREDS.password);
  await page.screenshot({ path: '2.png' });

  // Login
  await page.click('#ctl00_content_SiteThemeContentFragmentPage1_fragment_3526_ctl01_ctl00_LoginForm1_ctl06_loginButton');
  console.log('Letting page load...');
  await page.waitForNavigation();
  await page.waitFor(4*1000);
  await page.screenshot({ path: '3.png' });
  
  // Enumerate active tasks 'tracker'
  let listLength = await page.evaluate((sel) => {
    return document.getElementsByClassName(sel).length;
  }, 'tracker');
  
  console.log('listLength: ' + listLength);
  
  for (let i = 0; i < listLength; i++) {
	  
	  let title = await page.evaluate((index) => {
        let element = document.getElementsByClassName('tracker')[index];
        return element? element.getAttribute('aria-label'): null;
      }, i);
	  
	  console.log(title);
	  
  }
  
  //await browser.close();
})();