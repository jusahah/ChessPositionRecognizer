var Promise = require('bluebird');
var lwip = require('lwip');
var _ = require('lodash');
var fs = require('fs');
var gm = require('gm');

var positionConcluder = require('./positionConcluder');
var featureAnalyzer   = require('./featureAnalyzer');

var intensityThreshold = 3;

module.exports = function() {

	return {

		/* API: */
		// Promise transformImage(String)
		// Promise getFeatureVectors(String)
		// Promise concludePosition(Array)
		// String name


		transformImage: function(imagepath) {
			// Returns Promise which will be fulfilled with image path to transformed image
			return transformToBW(imagepath);

		},

		getFeatureVectors: function(transformedimagepath) {
			console.log("Tranformed path: " + transformedimagepath);
			// Returns Promise which will be fulfilled with feature vectors (=array)
			return getImageData(transformedimagepath).then(featureAnalyzer.getFeatureVectors);
		},

		concludePosition: function(featureVectors) {
			// Returns Promise which will be fulfilled with FEN
			return positionConcluder.getPosition(featureVectors);
		},

		// For debugging
		name: 'Classical classifier'
	}
}


/*
* Implementations
*
*/


// //////////////////////////////////////////////////////////////
// TRANSFORM IMAGE IMPLEMENTATION INLINE HERE
//
function transformToBW(imagepath) {
	return new Promise(function(resolve, reject) {
		var imagename = _.last(imagepath.split("/"))
		var outputpath = __dirname + '/../../temp/' + imagename; // Where to save transformed image
		var wstream = fs.createWriteStream(outputpath);

		if (!wstream) return reject("No write stream");
		
		console.log("Test transform for: " + imagepath);
		var rStream = fs.createReadStream(imagepath);

		
		gm(rStream).whiteThreshold(75,75,75,-1).blackThreshold(74,74,74,-1)
		//.stream().pipe(wstream);	
		.write(outputpath, function(err) {
			if (err) return reject(err);
			return resolve(outputpath);
		});
	});
}

function getImageData(imagepath) {
	return new Promise(function(resolve, reject) {
			lwip.open(imagepath, function(err, image) {
				if (err) return reject(err);
				resolve(image);
			});
	});

}

// Helper functions

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
//
// IMAGE TRANSFORM ENDS
// /////////////////////////////////////////////////////////////