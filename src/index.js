// Set up our environmental variables, you'll need to add a
// .env file into your root directory in order for this to work!
require('dotenv/config')
const rp = require('request-promise')
const checksum = require('checksum');
const co = require('cheerio')
const config = require('config');
const Twilio = require('twilio')

console.log('🕵🏠 Initiating Pad-Patrol...')

// Instantiate the site URLs outsite of any method.
// This way, they will keep their state so we can check against
// previous values
const sitesToCrawl = config.get("urls");
const sitesWithHash = sitesToCrawl.map(url => ({
  url,
  hash: ""
}));

function buildMessage(url) {
  // This is the position of the search query inside kijiji's URL slug
  const location = url.split('/')[5]
  return {
    to: process.env.NUMBER_TO_TEXT,
    from: process.env.TWILIO_NUMBER,
    body: `
           There are new listings available in your search for ${location} - 
           check them out here:  ${url}
           `
  };
}

function watchChanges(index) {
  // We pass only the index to avoid complex mutations of the site objects
  // instead we mofidy the main object directly by using it's index
  const site = sitesWithHash[index];

  rp(site.url)
    .then((response) => {
      const $ = co.load(response);
      let apartmentString = "";

      // use cheerio to parse HTML response and find all search results
      // then find all apartmentlistingIDs and concatenate them 
      $(".search-item.regular-ad").each((i, element) => {
        apartmentString += `${element.attribs["data-ad-id"]}`;
      });

      const newHash = checksum(apartmentString);

      // if this is the first pass, generate a checksum and exit
      if (site.hash === "") {
        site.hash = newHash;

        return;
      }

      // if the new hash and old hash are not equal, set the site hash to the new value
      // and send an SMS alerting changes
      if (checksum(apartmentString) !== site.hash) {
        console.log(`💡 There is a new post!`);
        site.hash = newHash;
        Twilio.sendSMS(buildMessage(site.url));
        return;
      }

      // if we find no updates, report back and return
      console.log(`😓 Nothing to report on your search for ${site.url.split('/')[5]}.`)
    })
    .catch((err) => {
      console.log(`Cannot fetch ${site.url}: ${err} ${err.stack}`);
    });
}

// This function will run inside our setInterval
function checkURL(sites) {
  console.log(`🕵️  Checking for updates...`);
  sites.forEach((site, index) => {
    watchChanges(index);
  });
}

// 600000ms = 10 minutes
setInterval(() => {
  checkURL(sitesWithHash);
}, process.env.CHECK_INTERVAL_MS || 600000);
