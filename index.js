'use strict';
const Telegram = require('telegram-bot-api');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird'); // Use nice promises in mongoose
const config = require('./config.js');
const cron = require('./cron.js');
const start = require('./controllers/start.js');
const track = require('./controllers/track.js');
const list = require('./controllers/list.js');
const untrack = require('./controllers/untrack.js');
const help = require('./controllers/help.js');
const helpMessage = require('./help-message.js');

const api = new Telegram({
  token: config.telegramBotToken,
  updates: {
    enabled: true
  }
});

cron.start(api);

mongoose.connect(config.mongoConnectUrl, e => {
  (e) ? console.log('error de login base de datos: %s', e) : console.log('Base de datos online');
});

api.on('message', (message) => {
  let text = message.text;

  if (/\/track (.+) (.+)/.test(text)) {
    track(api, message, config.botOptions);
  } else if (/\/list/.test(text)) {
    list(api, message, config.botOptions);
  } else if (/\/start/.test(text)) {
    start(api, message, config.botOptions);
  } else if (/\/untrack (.+)/.test(text)) {
    untrack(api, message, config.botOptions);
  } else if (/\/help?(.+)/.test(text)) {
    help(api, message, config.botOptions);
  } else {
    api.sendMessage({
      chat_id: message.chat.id,
      text: 'Oops! Creo que no entendí lo que me quieres decir. Mi creador solo me enseñó estos comandos:\n' + helpMessage
    });
  }
});
