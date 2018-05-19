# 🕵🏠 Pad Patrol

## Find your next place faster

Pad Patrol is a small tool that watches a list of supplied URLs for changes. When it sees a change, it will send an SMS to your phone with the changed URL, meaning you won't need to endlessly refresh pages ever again 😎

**Note** _Pad Patrol is in a serious infancy, and currently only works with [Kijiji](http://www.kijiji.com) links. Feel free to make any contributions if you end up adapting it for other sites 🚀_

### Usage

To get started, you'll need to sign up for a [twilio account](https://www.twilio.com/try-twilio) (They offer a free trial that should accomodate more than enough for the duration of your apartment hunt).

Once that's done, you'll need clone this repo

```bash
$ git clone https://github.com/quinnlangille/pad-patrol.git
```

Because most of the info involved with Twilio is user confidential, we use [.dotenv](https://github.com/motdotla/dotenv) to keep private info safe. To use it you'll need to create a envionmental variable file in the root of this folder

```bash
$ cd pad-patrol // or whatever you called the directory
$ mkdir .env
```

finally, finish with the usual

```bash
$ yarn install // or npm install if you prefer
$ yarn start
```

That's it - Happy hunting 🕵!
