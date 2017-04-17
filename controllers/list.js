'use strict';
const models = require('./../models');

module.exports = (telegram, message, options) => {
  models.Shipment.find({username: message.from.username})
  .then(r => {
    if (r.length === 0) {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: `Oops! No me acuerdo de ningún envío tuyo, usa /track para empezar a recibir actualizaciones de tus envíos.`
      }));
    } else {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: r.map(ship => `${ship.shipmentName} ${ship.code}`).join('\n')
      }));
    }
  })
  .catch(console.error);
};
