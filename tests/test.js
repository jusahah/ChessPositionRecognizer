// This script tests the AI
var _ = require('lodash');
var Promise = require('bluebird');
var positionAI = require('../positionAI/entry')();

// Chessbase images have 20 px margin on all sides.

var initialPosition = {
	path: __dirname + '/testpositions/initial_extra_kings_queens.jpg', 
	fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
};

var imagesToFens = [
	{path: __dirname + '/testpositions/initial.jpg', fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'},
	{path: __dirname + '/testpositions/test3.jpg', fen : 'rnbqkbnr/ppppp1pp/8/5p2/3P1B2/8/PPP1PPPP/RN1QKBNR'},
	{path: __dirname + '/testpositions/test5.jpg', fen : 'r1bqk2r/pp1p1ppp/n1pP1n2/8/2PP4/2N5/PP2P1PP/R1BQKBNR'},
	{path: __dirname + '/testpositions/test6.jpg', fen : '8/8/5r2/3P2k1/3R4/3K1p2/6p1/6N1'},
	{path: __dirname + '/testpositions/test7.jpg', fen : '1rbq1rk1/ppp1b1pp/2np1n2/4Pp2/2PP4/5NPB/PPQ1P2P/RNB2RK1'}
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
			console.log("ONE RESOLVED");
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


function startUp() {
	positionAI.learnFromInitial(initialPosition.path)
	.then(runTests)
	.catch(function(err) {
		console.log("Initial training failed");
		throw err;
	})

}

function runTests() {

	Promise.resolve(imagesToFens)
	.each(testImageToFenConversion)
	.then(function() {
		console.log("----TESTS SUCCEED----");
	})
	.catch(function(error) {
		console.error("----TESTS FAILED----");
		throw error;
	});	
}

startUp();




/*
var conversionPromises = _.map(imagesToFens, testImageToFenConversion);

Promise.all(conversionPromises).then(function() {
	console.log("----TESTS SUCCEED----");
}).catch(function(error) {
	console.log("----TESTS FAILED----");
	console.log(error);
});
*/




