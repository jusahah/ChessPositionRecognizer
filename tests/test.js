// This script tests the AI
var _ = require('lodash');
var Promise = require('bluebird');
var positionAI = require('../positionAI/entry')();

var imagesToFens = [
	{path: 'testpositions/test1.jpg', fen : 'fen1'},
	{path: 'testpositions/test2.jpg', fen : 'fen1'},
	{path: 'testpositions/test3.jpg', fen : 'fen1'},
	{path: 'testpositions/test4.jpg', fen : 'fen1'}
];

function testImageToFenConversion(obj) {
	// We need a wrapping additional promise as we
	// may throw after resultPromise is resolved!

	// resultPromise is resolved successfully if position was recognized
	// wrapping promise is resolved successfully if also the fen matches test fen!

	return new Promise(function(resolve, reject) {
		var fen = obj.fen;
		var imagepath = obj.path;

		var resultPromise = positionAI.resolvePosition(imagepath);
		resultPromise.then(function(resultFen) {
			if (fen !== resultFen) {
				reject("Fen failed for image: " + imagepath + ", resultFen: " + resultFen);
			} else {
				console.log("Test SUCCESS: " + imagepath);
				resolve();
			}
		});

		// Note that any throws from resultPromise automatically propagate to wrapping promise
		// This means we don't need catch-handler
		
	});
	
}

Promise.resolve(imagesToFens)
.each(testImageToFenConversion)
.then(function() {
	console.log("----TESTS SUCCEED----");
})
.catch(function(error) {
	console.error("----TESTS FAILED----");
	throw error;
});


/*
var conversionPromises = _.map(imagesToFens, testImageToFenConversion);

Promise.all(conversionPromises).then(function() {
	console.log("----TESTS SUCCEED----");
}).catch(function(error) {
	console.log("----TESTS FAILED----");
	console.log(error);
});
*/




