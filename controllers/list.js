'use strict';
const models = require('./../models');

module.exports = (telegram, message, options) => {
  models.Shipment.find({username: message.from.username})
  .then(r => {
    return telegram.sendMessage(Object.assign({}, options, {
      chat_id: message.chat.id,
      text: r.map(ship => `${ship.shipmentName} ${ship.code}`).join('\n')
    }));
  })
  .catch(console.error);
};
