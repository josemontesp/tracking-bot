'use strict';
const models = require('./../models');

module.exports = (telegram, message, options) => {
  models.Shipment.find({username: message.from.username})
  .then(r => {
    let url = 'http://www.correos.cl/SitePages/seguimiento/seguimiento.aspx?envio=';
    if (r.length === 0) {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: `Oops! No me acuerdo de ningún envío tuyo, usa /track para empezar a recibir actualizaciones de tus envíos.`
      }));
    } else {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: r.map(ship => `${ship.shipmentName} <a href="${url + ship.code}">${ship.code}</a>`).join('\n')
      }));
    }
  })
  .catch(console.error);
};
