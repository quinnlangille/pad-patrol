// Set up our environmental variables, you'll need to add a
// .env file into your root directory in order for this to work!
require('dotenv/config')
const rp = require('request-promise')
const checksum = require('checksum');
const co = require('cheerio')
const config = require('config');
const send = require('./send')

console.log('🕵🏠 Initiating Pad-Patrol...')

function generateApartmentString(url) {
  rp(url)
    .then((HTMLresponse) => {
      const $ = co.load(HTMLresponse);
      let apartmentString = "";

      // use cheerio to parse HTML response and find all search results
      // then find all apartmentlistingIDs and concatenate them 
      $(".search-item.regular-ad").each((i, element) => {
        apartmentString += `${element.attribs["data-ad-id"]}`;
      });

      return apartmentString
    }).catch(err => {
      console.log(`Could not complete fetch of ${url}: ${err}`)
    })
}

// Instantiate the site URLs outsite of any method.
// This way, they will keep their state so we can check against
// previous values
const sitesToCrawl = config.get("urls");
const sitesWithHash = sitesToCrawl.map(async (url) => {
  console.log(`Setting up search for ${url.split('/')[5]}`)
  const hash = checksum(await generateApartmentString(url))
  return {
    url,
    hash
  }
});

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

async function huntForChanges(index) {
  // We pass only the index to avoid complex mutations of the site objects
  // instead we mofidy the main object directly by using it's index
  const {
    url,
    hash: oldHash
  } = await sitesWithHash[index];
  console.log({
    url,
    oldHash
  })
  const apartmentString = generateApartmentString(url)
  const newHash = checksum(apartmentString);

  // if the new hash and old hash are not equal, set the site hash to the new value
  // and send an SMS alerting changes
  if (newHash !== oldHash) {
    console.log(`💡 There is a new post!`);
    sitesWithHash[index].hash = newHash;
    send.SMS(buildMessage(url));
    return;
  }

  // if we find no updates, report back and return
  console.log(`😓 Nothing to report on your search for ${url.split('/')[5]}.`)
}

// This function will run inside our setInterval
function checkURL(sites) {
  console.log(`🕵️  Checking for updates...`);
  sites.forEach(async (site, index) => {
    console.log({
      index
    })
    await huntForChanges(index);

  });
}

// 600000ms = 10 minutes
setInterval(() => {
  if (sitesWithHash) {
    checkURL(sitesWithHash);
  } else {
    console.log(`Please add URLs to your .env file!`)
  }
}, process.env.CHECK_INTERVAL_MS || 600000);
