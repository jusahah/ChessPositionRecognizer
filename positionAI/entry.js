var Promise = require('bluebird');

var positionConcluder = require('./positionConcluder');

module.exports = function() {

	return {

		resolvePosition: function(imagepath) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve('fen1');
				}, 750);
			});
		}

	};
};