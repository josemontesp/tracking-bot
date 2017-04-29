'use strict';
const mongoose = require('mongoose');
const api = require('./../api.js');
const Schema = mongoose.Schema;

var schema = new Schema(
  {
    firstName: String,
    lastName: String,
    username: String,
    chatId: Number,
    shipmentName: String,
    code: {
      type: String,
      required: [true, 'The shipping code is required']
    },
    service: {
      type: String,
      enum: ['correos-chile', 'chileexpress'],
      required: [true, 'The service is required']
    },
    history: [{
      estado: String,
      fecha: String,
      lugar: String
    }],
    lastUpdate: Date
  },
  {
    timestamps: true
  });

// If the shipment is new, fetch the history information
schema.pre('save', function (next) {
  var shipment = this;
  if (this.isNew) {
    let regex = new RegExp(['^', shipment.shipmentName, '$'].join(''), 'i');
    this.constructor.count({
      username: shipment.username,
      shipmentName: regex
    })
    .then(r => {
      if (r !== 0) {
        throw new Error('Ya tienes un envío con este nombre.');
      } else {
        return api(shipment.code, shipment.service);
      }
    })
    .then(r => {
      shipment.history = (shipment.service === 'correos-chile') ? r.registros : r.hitos;
      shipment.lastUpdate = new Date();
      next();
    })
    .catch(e => {
      let err = (e instanceof Error) ? e : new Error(e);
      next(err);
    });
  } else {
    next();
  }
});

// Gets the diference between states
function getDiff (newState = [], oldState = []) {
  let difLength = newState.length - oldState.length;
  if (difLength <= 0) {
    return [];
  }
  return newState.slice(0, difLength);
}

// Fetches for an update, saves it to the shipment and returns the new information
schema.methods.getUpdate = function (old, newPass) {
  let shipment = this;
  let diff;
  return new Promise((resolve, reject) => {
    api(shipment.code, shipment.service)
    .then(r => {
      let newShipment = {};
      newShipment.history = (shipment.service === 'correos-chile') ? r.registros : r.hitos;
      diff = getDiff(newShipment.history, shipment.history);
      if (diff.length > 0) {
        shipment.history = newShipment.history;
        shipment.lastUpdate = new Date();
        return shipment.save();
      }
      return shipment;
    })
    .then(shipment => {
      resolve(diff);
    })
    .catch(reject);
  });
};

var Shipment = mongoose.model('Shipment', schema);
module.exports = Shipment;
