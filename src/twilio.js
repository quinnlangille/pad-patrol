const config = require("config");
const Twilio = require("twilio");

const accountSid = config.get(`twilio.account`);
const authToken = config.get(`twilio.token`)
const client = new Twilio(accountSid, authToken);

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
    .then(() => {
      console.log(`👍 Success! Message has been sent to ${to}`);
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {
  sendSMS
};
