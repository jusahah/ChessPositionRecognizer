var Promise = require('bluebird');
var _ = require('lodash');
var fs = require('fs');
var gm = require('gm');
var lwip = require('lwip');

var classifier = require('./classifiers/PlayChessModern')();
var cropBoard = require('./findAndCropBoard');

function PositionNotChanged() {}
PositionNotChanged.prototype = Object.create(Error.prototype);

// State between screenshots
var lastEmpties = [];
var currentBoardSetup = null;

module.exports = {
	findBoardSetup: findBoardSetup,
	resolveImage: resolveImage,
}

function findBoardSetup(imagepath) {
	return transformForCrop(imagepath)
	.then(function(transformedpath) {
		return getImageData(transformedpath);
	})
	.then(cropBoard.getCoords)
	.tap(function(coords) {
		currentBoardSetup = coords;
		console.log("NEW BOARD SETUP!: " + JSON.stringify(coords));
	});
}


function resolveImage(imagepath) {
	var start = Date.now();
	/* Taps are for profiling */
	return Promise.resolve(imagepath)
	.then(classifier.transformImage)
	.tap(function(image) {
		var empties = classifier.getEmptySquares(image);
		//console.log("Empty squares");
		//console.log(empties);

		var differences = _.xor(empties, lastEmpties);
		if (differences.length === 0) {
			// Same position as in previous screenshot
			// Throw here so we skip the expensive parts of promise chain
			throw new PositionNotChanged();
		}

		// Position has changed, so save this as current
		lastEmpties = empties;
	})			
	.tap(function() {
		console.log("PHASE 1: " + (Date.now() - start) + " ms")
	})
	.then(classifier.getFeatureVectors)
	.tap(function() {
		console.log("PHASE 2: " + (Date.now() - start) + " ms")
	})			
	.then(classifier.concludePosition)
	.tap(function() {
		console.log("PHASE 3: " + (Date.now() - start) + " ms")
	})			
	.catch(PositionNotChanged, function(err) {
		// Not actual error, just means position has not changed
		console.log("POSITION HAS NOT CHANGED SINCE LAST SCREENSHOT!");
		return true;

	})
	.catch(function(err) {
		// General error handler
		console.log("ERROR IN POSITION RECOGNITION PROCESS");
		console.log("CLASSIFIER WAS: " + classifier.name);
		throw err; // Rethrow up the call stack
	})
}

function transformForCrop(imagepath) {
	return new Promise(function(resolve, reject) {
		var outputpath = __dirname + '/last_crop_transformed_image.jpg';
		var wstream = fs.createWriteStream(outputpath);

		if (!wstream) throw "No write stream available in fs";
		
		var rStream = fs.createReadStream(imagepath);

		var ts = 115;

		gm(rStream)
		.whiteThreshold(ts,ts,ts,-1)
		.blackThreshold(ts,ts,ts,-1)
		.blur(0)
		.blackThreshold(245, 245, 245, -1)
		.stream()
		.pipe(wstream);

		setTimeout(function() {
			resolve(outputpath);
		}, 250);
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