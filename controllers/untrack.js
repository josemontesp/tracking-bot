'use strict';
const models = require('./../models');

module.exports = (telegram, message, options) => {
  let params = message.text.split(' ').map(p => p.trim());
  let command = params.shift();
  let shipmentName = params.join(' ') || undefined;
  let regex = new RegExp(['^', shipmentName, '$'].join(''), 'i');
  models.Shipment.remove({
    username: message.from.username,
    shipmentName: regex
  })
  .then(r => {
    console.log(r);
    if (r.result.n === 0) {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: `No me acuerdo de un envío tuyo con el nombre ${shipmentName}. Usa /list para ver tus envíos`
      }));
    } else {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: `Listo, me olvidé de tu envío ${shipmentName}.`
      }));
    }
  })
  .catch(e => {
    return telegram.sendMessage(Object.assign({}, options, {
      chat_id: message.chat.id,
      text: `Tuve problemas y no pude olvidarme de tu envío.
        ${JSON.stringify(e)}
      `
    }));
  });
};
