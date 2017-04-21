'use strict';
process.env.TZ = 'America/Santiago';
const CronJob = require('cron').CronJob;
const models = require('./models');
const mongoose = require('mongoose'); // MongoDB modelling
const config = require('./config.js');
mongoose.Promise = require('bluebird'); // Use nice promises in mongoose
let telegram;
const options = config.botOptions;

Promise.sequence = function (tasks, parameters = [], context = null) {
  return new Promise((resolve, reject) => {
    var nextTask = tasks.splice(0, 1)[0].apply(context, parameters[0]); // Dequeue and call the first task
    var output = new Array(tasks.length + 1);
    var errorFlag = false;

    tasks.forEach((task, index) => {
      nextTask = nextTask.then(r => {
        output[index] = r;
        return task.apply(context, parameters[index + 1]);
      }, e => {
        output[index] = e;
        errorFlag = true;
        return task.apply(context, parameters[index + 1]);
      });
    });

    // Last task
    nextTask.then(r => {
      output[output.length - 1] = r;
      if (errorFlag) reject(output); else resolve(output);
    })
    .catch(e => {
      output[output.length - 1] = e;
      reject(output);
    });
  });
};

function fetchInformationForOneShipment (shipment) {
  let url = (shipment.service === 'correos-chile') ? 'http://www.correos.cl/SitePages/seguimiento/seguimiento.aspx?envio=' : 'http://www.chilexpress.cl/Views/ChilexpressCL/Resultado-busqueda.aspx?DATA=';

  return new Promise((resolve, reject) => {
    shipment.getUpdate()
    .then(r => {
      if (r.length > 0) {
        return telegram.sendMessage(Object.assign({}, options, {
          chat_id: shipment.chatId,
          text: `Tengo noticias sobre tu envío ${shipment.shipmentName}.\n` + r.map(hito => hito.estado + ', ' + hito.lugar + ', ' + hito.fecha).join('\n') + '\nPara más información <a href="' + url + shipment.code + '">' + 'pincha acá.</a>\n'
        }));
      }
    }).then(resolve)
    .catch(reject);
  });
}

function fetchInformation () {
  models.Shipment.find({})
  .then(shipments => {
    let tasks = shipments.map(ship => fetchInformationForOneShipment);
    let params = shipments.map(ship => [ship]);
    return Promise.sequence(tasks, params);
  })
  .catch(console.error);
}

module.exports = {
  start: function (_telegram) {
    telegram = _telegram;
    // Every 2 minutes
    new CronJob('0 */2 * * * *', fetchInformation, null, true);
  }
};

// const Telegram = require('telegram-bot-api');
// mongoose.connect(config.mongoConnectUrl, e => {
//   (e) ? console.log('error de login base de datos: %s', e) : console.log('Base de datos online');
// });
//
// telegram = new Telegram({
//   token: config.telegramBotToken,
//   updates: {
//     enabled: true
//   }
// });
//
// fetchInformation();

// module.exports.start();
