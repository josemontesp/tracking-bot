'use strict';
const models = require('./../models');

module.exports = (telegram, message, options) => {
  let params = message.text.split(' ').map(p => p.trim());
  let command = params.shift();
  let service = 'correos-chile';
  let trackingCode = params.shift();
  let shipmentName = params.join(' ') || undefined;
  console.log(shipmentName);
  let url = (service === 'correos-chile') ? 'http://www.correos.cl/SitePages/seguimiento/seguimiento.aspx?envio=' : 'http://www.chilexpress.cl/Views/ChilexpressCL/Resultado-busqueda.aspx?DATA=';

  let shipment = new models.Shipment({
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    username: message.from.username,
    shipmentName: shipmentName,
    chatId: message.chat.id,
    code: trackingCode,
    service: service
  });
  return shipment.save()
  .then(shipment => {
    return telegram.sendMessage(Object.assign({}, options, {
      chat_id: message.chat.id,
      text: 'Listo ' + message.from.first_name + ', te avisaré cuando el estado del envío cambie. Puedes ver los detalles <a href="' + url + trackingCode + '">' + 'acá</a>'
    }));
  })
  .catch(e => {
    if (e.message === 'El numero de seguimiento no existe') {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: 'Tu código de seguimiento no es válido. Intenta acceder por <a href="' + url + trackingCode + '">' + 'acá</a>'
      }));
    } else if (e.message === 'Ya tienes un envío con este nombre.') {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: 'Ya tienes un envío con este nombre. Usa /list para ver tus envíos activos'
      }));
    } else {
      return telegram.sendMessage(Object.assign({}, options, {
        chat_id: message.chat.id,
        text: 'Pasó algo inesperado y no pude guardar tu envío. Intenta acceder por <a href="' + url + trackingCode + '">' + 'acá</a>'
      }));
    }
  });
};
// `
// { message_id: 99,
//   from:
//    { id: 210402389,
//      first_name: 'Jose Miguel',
//      last_name: 'Montes',
//      username: 'josemontesp' },
//   chat:
//    { id: -219057005,
//      title: 'Tracking',
//      type: 'group',
//      all_members_are_administrators: true },
//   date: 1492284443,
//   text: '/track correos-chile RF555888607CN',
//   entities: [ { type: 'bot_command', offset: 0, length: 6 } ] }
//   `;
