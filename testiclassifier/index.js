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