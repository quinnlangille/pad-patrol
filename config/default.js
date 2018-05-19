module.exports = {
  urls: process.env.URL_TO_SEARCH.split(',') || [],
  twilio: {
    account: process.env.TWILIO_ACCOUNT || ``,
    token: process.env.TWILIO_TOKEN || ``
  }
};
