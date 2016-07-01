var Promise = require('bluebird');
var lwip = require('lwip');

var positionConcluder = require('./positionConcluder');
var featureAnalyzer   = require('./featureAnalyzer');

module.exports = function() {

	return {

		resolvePosition: function(imagepath) {
			return new Promise(function(resolve, reject) {
				lwip.open(imagepath, function(err, image) {
					if (err) return reject(err);
					resolve(image);
				});
			}).then(function(image) {
				return featureAnalyzer.getFeatureVectors(image);
			}).then(function(featureVectors) {
				return positionConcluder.getPosition(featureVectors);
			});
		}

	};
};