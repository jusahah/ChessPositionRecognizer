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
		name: 'Classical classifier',
		getTestPositions: function() {
			return [
				{path: __dirname + '/testpositions/test16.jpg', fen : '8/qqqq4/4k3/3p4/1QQ5/1QQK4/8/8'},
				{path: __dirname + '/testpositions/initial.jpg', fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'},
				{path: __dirname + '/testpositions/test3.jpg', fen : 'rnbqkbnr/ppppp1pp/8/5p2/3P1B2/8/PPP1PPPP/RN1QKBNR'},
				{path: __dirname + '/testpositions/test5.jpg', fen : 'r1bqk2r/pp1p1ppp/n1pP1n2/8/2PP4/2N5/PP2P1PP/R1BQKBNR'},
				{path: __dirname + '/testpositions/test6.jpg', fen : '8/8/5r2/3P2k1/3R4/3K1p2/6p1/6N1'},
				{path: __dirname + '/testpositions/test7.jpg', fen : '1rbq1rk1/ppp1b1pp/2np1n2/4Pp2/2PP4/5NPB/PPQ1P2P/RNB2RK1'},
				{path: __dirname + '/testpositions/test9.jpg', fen : '2r2b2/kq1npp2/1ppp1n1p/p6p/P1QPP2P/2P3PN/1P1N1P2/R3KB2'},
				{path: __dirname + '/testpositions/test10.jpg', fen : '8/8/5Ppp/6p1/6P1/5k1K/8/8'},
				{path: __dirname + '/testpositions/test11.jpg', fen : '1nb1qbr1/pp1pp1pp/rkp3n1/5B2/P3PP1P/BPN2N2/R1PPQK2/7R'},
				{path: __dirname + '/testpositions/test12.jpg', fen : '8/8/5k2/8/3PB3/2QKN3/ppp5/8'},
				{path: __dirname + '/testpositions/test13.jpg', fen : 'rnb2bnk/ppqpp1p1/2p4p/3P3N/8/NRQ4p/PPPBPP1R/K4B2'},
				{path: __dirname + '/testpositions/test14.jpg', fen : 'rnbqkbnr/p2p4/PppPp3/1PP1Ppp1/3Q1PPp/2N4P/4B3/RNB1K2R'},
				{path: __dirname + '/testpositions/test14.jpg', fen : 'rnbqkbnr/p2p4/PppPp3/1PP1Ppp1/3Q1PPp/2N4P/4B3/RNB1K2R'},
			];	

		}		
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