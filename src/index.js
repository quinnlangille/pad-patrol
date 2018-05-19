// Set up our environmental variables, you'll need to add a
// .env file into your root directory in order for this to work!
require('dotenv').config()

const rp = require("request-promise");
const checksum = require("checksum");
const co = require("cheerio");
const config = require("config");
const cronJob = require("cron").CronJob;
const twillio = require(`./twilio.js`);

console.log('🏠 Initiate apartment hunter...')

// Instantiate the site URLs outsite of any method.
// This way, they will keep their state so we can check against
// previous values
const urls = config.get("urls");
let urlObjs = urls.map(url => {
  return {
    url,
    hash: ""
  };
});

// This function will run inside our setInterval
function checkURL(sites) {
  console.log(`🕵️  Checking for updates...`);
  sites.forEach(function (site) {
    watchChanges(site);
  });
}

function watchChanges(site) {
  rp(site.url)
    .then(function (response) {
      let $ = co.load(response);
      let apartmentString = "";

      // use cheerio to parse HTML response and find all search results
      // then find all apartmentlistingIDs and concatenate them 
      $(".search-item.regular-ad").each(function (i, element) {
        apartmentString += `${element.attribs["data-ad-id"]}`;
      });

      // if this is the first pass, generate a checksum and exit
      if (site.hash === "") {
        site.hash = checksum(apartmentString);
        return;
      }

      // if the new hash and old hash are not equal, set the site hash to the new value
      // and send an SMS alerting changes
      if (checksum(apartmentString) !== site.hash) {
        console.log(`💡 There is a new post!`);
        site.hash = checksum(apartmentString);
        twillio.sendSMS(buildMessage(site.url));
        return;
      }

      // if we find no updates, report back and return
      console.log(`😓 Nothing to report on your search for ${site.url.split('/')[5]}.`)

      return;
    })
    .catch(function (err) {
      console.log(`Cannot fetch ${site.url}: ${err} ${err.stack}`);
    });
}

function buildMessage(url) {
  // This is the position of the search query inside kijiji's URL slug
  let location = url.split('/')[5]
  return {
    to: process.env.NUMBER_TO_TEXT,
    from: process.env.TWILIO_NUMBER,
    body: `
           There are new listings available in your search for ${location} - 
           check them out here:  ${url}
           `
  };
}

// 600000ms = 10 minutes
setInterval(function () {
  checkURL(urlObjs);
}, process.env.CHECK_INTERVAL_MS || 600000);
