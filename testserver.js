var Promise = require('bluebird');
var _ = require('lodash');
var imageToFen = require('./app');
var start = Date.now();

_.reduce(Array(5), function(prom, value) {
	return prom.then(runScreenshotThrough);
}, Promise.resolve());

function runScreenshotThrough() {
	return imageToFen(__dirname + '/position.jpg').then(function() {
		console.log("Resolving fen took: " + (Date.now() - start) + " ms");
	})
}


