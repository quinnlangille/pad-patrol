const config = require("config");
var twilio = require("twilio");

var accountSid = config.get(`twilio.account`);
var authToken = config.get(`twilio.token`)
var client = new twilio(accountSid, authToken);

function sendSMS({
  body,
  to,
  from
}) {
  console.log("📲  Sending the message...");
  client.messages
    .create({
      body,
      to,
      from
    })
    .then(function (message) {
      console.log(`👍 Success! Message has been sent to ${to}`);
    })
    .catch(function (err) {
      console.log(err);
    });
}

module.exports = {
  sendSMS
};
