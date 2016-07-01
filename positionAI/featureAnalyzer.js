var lwip = require('lwip');

module.exports = {

	getFeatureVectors: function(image) {

		var w = image.width();
		console.log("Width: " + w);

		return {
			a1: [0,0,0,0,0],
			a2: [1,8,3,12,9]
		}



	}
}