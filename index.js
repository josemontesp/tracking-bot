'use strict';
const Telegram = require('telegram-bot-api');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird'); // Use nice promises in mongoose
const config = require('./config.js');
const help = require('./help.js');
const cron = require('./cron.js');
const track = require('./controllers/track.js');
const list = require('./controllers/list.js');

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
  } else if (/\/untrack (.+)/.test(text)) {
    1;
  } else if (/\/help?(.+)/.test(text)) {
    api.sendMessage({
      chat_id: message.chat.id,
      text: help
    });
  } else {
    api.sendMessage({
      chat_id: message.chat.id,
      text: 'Oops! Creo que no entendí lo que me quieres decir. Mi creador solo me enseñó estos comandos:\n' + help
    });
  }
});
