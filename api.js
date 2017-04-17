'use strict';
const correos = require('correos-chile');
const chileexpress = require('chileexpress');

module.exports = (code, service) => {
  console.log();
  return new Promise((resolve, reject) => {
    if (service === 'correos-chile') {
      correos([code])
      .then(r => {
        (r[0] === 'El numero de seguimiento no existe') ? reject(r[0]) : resolve(r[0]);
      })
      .catch(reject);
    } else if (service === 'chileexpress') {
      chileexpress([code])
      .then(r => {
        (r[0] === -1) ? reject(r[0]) : resolve(r[0]);
      })
      .catch(reject);
    }
  });
};

// module.exports('600110073533', 'chileexpress');
