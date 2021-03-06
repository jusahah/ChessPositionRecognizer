var Promise = require('bluebird');
var _ = require('lodash');
var app = require('./app');
var start = Date.now();




prepareBoardSetup()
.then(function() {
	// Test board setup by running
	return app.resolveImageUsingBoardSetup(__dirname + '/withlargeborders.jpg');
})
.then(function(fen) {
	console.log("USING BOARD SETUP, FEN RESPONSE BACK: " + fen);
})

function prepareBoardSetup() {
	return app.findBoardSetup(__dirname + '/withlargeborders.jpg').then(function() {
		console.log("Board setup done: " + (Date.now() - start) + " ms");
	})
	/*
	.then(function() {
		_.reduce(Array(5), function(prom, value) {
			return prom.then(runScreenshotThrough);
		}, Promise.resolve());
	})
	*/
}

function runScreenshotThrough() {
	return app.resolveImage(__dirname + '/position.jpg').then(function(fen) {
		console.log(fen);
		console.log("Resolving fen took: " + (Date.now() - start) + " ms");
	})
}


