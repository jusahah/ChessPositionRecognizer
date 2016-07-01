var Promise = require('bluebird');
var lwip = require('lwip');

var positionConcluder = require('./positionConcluder');
var featureAnalyzer   = require('./featureAnalyzer');

module.exports = function() {

	var learnedVectors = null;

	return {

		learnFromInitial: function(imagepath) {
			return getDesaturedImageData(imagepath)
			.then(featureAnalyzer.getFeatureVectors)
			.then(function(featureVectors) {
				learnedVectors = featureVectors;
			});

		},

		resolvePosition: function(imagepath) {
			getDesaturedImageData(imagepath)
			.then(featureAnalyzer.getFeatureVectors)
			.then(function(featureVectors) {
				console.log("Feature vectors below");
				console.log(featureVectors);
				return positionConcluder.getPosition(featureVectors, learnedVectors);
			});
		}

	};
};


function getDesaturedImageData(imagepath) {
	return new Promise(function(resolve, reject) {
		lwip.open(imagepath, function(err, image) {
			if (err) return reject(err);
			resolve(image);
		});
	}).then(function(image) {
		// Desaturate the image for easier pixel analysis
		return new Promise(function(resolve, reject) {
			image.saturate(-1, function(err, image) {
				if (err) return reject(err);
				return resolve(image);
			});
		});
	})
}