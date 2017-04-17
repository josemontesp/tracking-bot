'use strict';
String.prototype.toTitle = function() {
	return this.toLowerCase().split(' ').map(i => i[0].toUpperCase() + i.substring(1)).join('');
};
//Loads all the models and exposes them by their TitledCased file name
var models = {};
require('fs').readdirSync(__dirname + '/').forEach(filename => {
    if (~filename.indexOf('.js')) models[filename.split('.js')[0].toTitle()] = require(__dirname + '/' + filename);
});

module.exports = models;