const puppeteer = require("puppeteer");

module.exports = async function scrapUrl(url, ticker, time) {
  const browser = await puppeteer.launch({
    headless: true, // launch browser in headless mode
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2", // wait until there are no more than 2 network connections for at least 500ms
    timeout: 60000,
  });

  let tweets = new Set(); // using a set to automatically handle duplicates
  let previousHeight = await page.evaluate("document.body.scrollHeight");
  let sameHeightCount = 0;

  console.log(`${url} is scaning now...`);
  // trying to simulate the scroll load event in twitter
  try {
    while (sameHeightCount < 3) {
      // scroll down 2000px
      await page.evaluate(() => {
        window.scrollBy(0, 2000);
      });

      // wait for 1 second for new tweets to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // get new height of page
      const newHeight = await page.evaluate("document.body.scrollHeight");

      // get new tweets as element
      const tweetElements = await page.$$('div[data-testid="cellInnerDiv"]');

      for (const tweetElement of tweetElements) {
        const tweet = await page.evaluate(
          (element) => element.innerText,
          tweetElement
        );
        tweets.add(tweet); // add tweet to Set
      }

      // this is just for testing
      // console.log(
      //   `Current height: ${newHeight} | Previous height: ${previousHeight}`
      // );

      if (newHeight === previousHeight) {
        sameHeightCount++;
      } else {
        sameHeightCount = 0;
      }

      previousHeight = newHeight;
    }

    // get count of ticker
    let count = 0;
    tweets.forEach((element) => {
      if (element.includes(ticker)) {
        count++;
      }
    });
    await browser.close();

    console.log(
      `${("$", ticker)} was mentioned ${count} times in the last ${
        time / 60000
      } minutes.`
    );

    return `${("$", ticker)} was mentioned ${count} times in the last ${
      time / 60000
    } minutes.`;
  } catch (err) {
    await browser.close();
    console.error("Error while scrolling:", err);
  }

  await browser.close();
};
