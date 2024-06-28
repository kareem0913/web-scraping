const twitterAccounts = require("./modules/twitter-account");
const scrapUrl = require("./modules/scrap-one-url");

// scraping web page function
async function webScraping(urls, ticker, time) {
  const result = new Map(); // use map to store response data for each profile

  //  loop through the urls and implement the scrapurl function
  for (const url of urls) {
    const response = await scrapUrl(url, ticker, time);
    result.set(url, response);
  }

  // Use recursion to run the script function at specific intervals
  setTimeout(() => {
    webScraping(urls, ticker, time).then((data) => {
      console.log(data);
    });
  }, time);

  // return resulr for every urls
  return result;
}

webScraping(twitterAccounts, "$TSLA", 15 * 60 * 1000)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("Error in main function:", error);
  });
