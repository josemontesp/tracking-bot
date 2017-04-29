const helpMessage = require('./../start-message.js');

module.exports = (telegram, message, options) => {
  telegram.sendMessage({
    chat_id: message.chat.id,
    text: helpMessage
  });
};
