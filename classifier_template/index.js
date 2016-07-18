/* 
Instantiate this template using cmd line command:
'gulp classifier --name MyClassifier'
*/

// Defaults deps
var Promise = require('bluebird');
var lwip = require('lwip');
var _ = require('lodash');
var fs = require('fs');

var getFeatureVectors = require('./getFeatureVectors');
var transformImage = require('./transformImage');
var concludePosition = require('./concludePosition');

module.exports = function() {

	return {
		// All classifier components must follow this api and export form:

		/* API: */
		// Promise transformImage(String)
		// Promise getFeatureVectors(String)
		// Promise concludePosition(Array)

		transformImage: transformImage,
		getFeatureVectors: getFeatureVectors,
		concludePosition: concludePosition
	}
}


/* Helper function for reading image from disk */

function getImageData(imagepath) {
	return new Promise(function(resolve, reject) {
			lwip.open(imagepath, function(err, image) {
				if (err) return reject(err);
				resolve(image);
			});
	});

}