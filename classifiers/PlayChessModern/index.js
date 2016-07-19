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
		getFeatureVectors: getFeatureVectors.forAll,
		concludePosition: concludePosition.getFen,
		getEmptySquares: function(image) {
			var liteFeatureVectors = getFeatureVectors.forEmpty(image);
			return concludePosition.getEmptySquares(liteFeatureVectors);
		},

		// Dev, debugging API part (optional)
		name: 'PlayChess Modern pieceset',
		getTestPositions: getTestPositions
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


function getTestPositions() {
	// Add test positions here like following:
	
	var testpositions = [
		{path: __dirname + '/testpositions/initial.jpg', fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'},
		{path: __dirname + '/testpositions/t3.jpg', fen : '8/pp4n1/2p2kp1/1q3p2/3Q4/P7/1P2R1PP/5K2'},
		{path: __dirname + '/testpositions/t2.jpg', fen : 'r2q1rk1/pp1n1ppp/2p1p3/3n4/3P4/P1PB3Q/1P1N2PP/4RRK1'},
	]
	

	return testpositions;
}