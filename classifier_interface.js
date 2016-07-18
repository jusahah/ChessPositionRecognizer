// All classifier components must follow this interface.

// Entry into component must factory function
module.exports = function() {

	return {
		// All classifier components must follow this api and export form:

		/* API: */
		// Promise transformImage(String)
		// Promise getFeatureVectors(String)
		// Promise concludePosition(Array)


		transformImage: function(imagepath) {
			// Returns Promise which will be fulfilled with image path to transformed image

		},

		getFeatureVectors: function(transformedimagepath) {
			// Returns Promise which will be fulfilled with feature vectors (=array)

		},

		concludePosition: function(featureVectors) {
			// Returns Promise which will be fulfilled with FEN
			
		}
	}
}