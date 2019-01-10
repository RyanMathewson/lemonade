const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const DEBUG = true;

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Browse to page
  await page.goto('https://limeade.com/brandedlogin.aspx?redirect=0&e=Limeade', { waitUntil: 'networkidle2' });

  // Enter login credentials
  await page.click('#ctl00_content_SiteThemeContentFragmentPage1_fragment_3526_ctl01_ctl00_LoginForm1_ctl06_username');
  await page.keyboard.type(CREDS.username);
  await page.click('#ctl00_content_SiteThemeContentFragmentPage1_fragment_3526_ctl01_ctl00_LoginForm1_ctl06_password');
  await page.keyboard.type(CREDS.password);

  // Login
  console.log('Logging in');
  await page.click('#ctl00_content_SiteThemeContentFragmentPage1_fragment_3526_ctl01_ctl00_LoginForm1_ctl06_loginButton');
  console.log('Letting page load...');
  await page.waitForNavigation();
  await page.waitFor(4 * 1000);

  // Enumerate active tasks 'tracker'
  console.log('Finding tasks');
  let listLength = await page.evaluate((sel) => {
    return document.getElementsByClassName(sel).length;
  }, 'tracker');

  console.log('listLength: ' + listLength);

  var tasks = [];

  for (let i = 0; i < listLength; i++) {

    let title = await page.evaluate((index) => {
      let element = document.getElementsByClassName('tracker')[index];
      return element ? element.getAttribute('aria-label') : null;
    }, i);

    if (title == null)
      continue;

    console.log('Found Task: ' + title);
    tasks.push({ index: i, title: title });
  }


  for (let i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    console.log('Processing task: ' + task.title);

    var handler = taskHandlers[task.title];
    if (handler == null) {
      console.error("No handler found for task: " + task.title);
      continue;
    }

    try {
      await handler(task, browser, page);
    } catch (ex) {
      console.error("Error while handling task.  Please provide error.png and a copy of the following error message to the developer.", ex);
      await page.screenshot({ path: 'error.png' });
    }

  }

  console.log('Done!');
  await browser.close();

})();


var taskHandlers = {
  "Complete Your Well-being Assessment": function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Leidos Integrity Pledge": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Register for the Livongo Diabetes Management Program": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Check Your Glucose with Livongo": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Share Your 2019 Well-Being Resolution": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Dental Exam": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Vision Exam": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Preventive Screenings": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Teladoc Consultation": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Condition Management Programs": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Tobacco Cessation Challenge": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Understanding the Opioid Epidemic": async function (task, browser, page) {
    console.log("This task must be completed manually");
  },
  "Download the Mobile App": async function (task, browser, page) {
    if (DEBUG) {
      console.log('Skipping due to DEBUG');
      return;
    }
    await SimpleJoinAndTrack(task, browser, page);
  },
  "150 Minutes of Exercise Per Week": async function (task, browser, page) {
    if (DEBUG) {
      console.log('Skipping due to DEBUG');
      return;
    }

    await OpenTask(task, browser, page);
    await JoinTask(task, browser, page);

    await page.evaluate(() => {
      document.getElementById('numericinput').value = 20;
      document.getElementsByClassName('button-track')[0].click();
    });

    await page.waitFor(2 * 1000);

    await page.evaluate(() => {
      document.getElementsByClassName('item-info-close')[0].click();
    });

    await page.waitFor(2 * 1000);
  },
  "Take Time to Recharge": async function (task, browser, page) {
    if (DEBUG) {
      console.log('Skipping due to DEBUG');
      return;
    }
    await SimpleJoinAndTrack(task, browser, page);
  },


};



async function GoThroughSlideshow(page, slideCount){
  for (var i = 0; i < slideCount; i++) {
    await page.click('#html5Experience > div.PresentationHost > div.PresentationHostRightScroller.PresentationHostArrowHover > div');
    await page.waitFor(1000);
  }
}


async function StartQuiz(page){
  await page.click("#startQuiz");
  await page.waitFor(1000);
}


async function PickQuizOption(page, option){
  await page.click("#html5Experience > div.Player2QuizContainer > div:nth-child(" + option + ") > div.Player2QuestionContainerWrapper > div:nth-child(2) > label > input");
  await page.waitFor(1000);
  await page.click("#html5Experience > div.Player2QuizContainer > div.Player2NextButtonContainer > div");
  await page.waitFor(1000);
  await page.click("#html5Experience > div.Player2QuizContainer > div.Player2NextButtonContainer > div");
  await page.waitFor(1000);
}





async function OpenTask(task, browser, page) {
  console.log('Opening task');
  await page.evaluate((index) => {
    document.getElementsByClassName('tracker')[index].click();
  }, task.index);

  console.log('Waiting for dialog to load...');
  await page.waitFor(6 * 1000);
}


async function JoinTask(task, browser, page) {
  let justJoined = await page.evaluate(() => {
    let element = document.getElementsByClassName('button-join')[0];
    if (element == null) {
      return false;
    } else {
      element.click();
      return true;
    }
  });

  if (justJoined) {
    console.log('Just joined...');
    await page.waitFor(6 * 1000);
  }
}



async function SimpleJoinAndTrack(task, browser, page) {

  console.log('Performing simple join and track');

  await OpenTask(task, browser, page);
  await JoinTask(task, browser, page);

  await page.evaluate(() => {
    document.getElementsByClassName('button-track')[0].click();
  });

  await page.waitFor(2 * 1000);

  await page.evaluate(() => {
    document.getElementsByClassName('item-info-close')[0].click();
  });

  await page.waitFor(2 * 1000);
}