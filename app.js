var Promise = require('bluebird');
var _ = require('lodash');
var classifier = require('./classifiers/PlayChessModern')();

function PositionNotChanged() {}
PositionNotChanged.prototype = Object.create(Error.prototype);

// State between screenshots
var lastEmpties = [];

module.exports = function(imagepath) {
	return resolveImage(imagepath).then(function(fen) {
		console.log("FEN IS: " + fen);
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