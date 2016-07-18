// This script tests the AI
var _ = require('lodash');
var Promise = require('bluebird');
//var positionAI = require('../positionAI/entry')();
var gm = require('gm');
var fs = require('fs');

// Classifiers
var classifier1 = require('../classifiers/chessdotcom')();
//var classifier2 = require('../classifiers/playchessmodern')();

// Only as long as we are testing rays from here
//var featureAnalyzer   = require('../positionAI/featureAnalyzer');

// Chessbase images have 20 px margin on all sides.

var initialPosition = {
	path: __dirname + '/testpositions/initial_extra_kings_queens.jpg', 
	fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
};

var imagesToFens = [
	// Large
	//{path: __dirname + '/testpositions/test_iso_1.jpg', fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'},
	// Medium	
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
/*
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
*/

function runTestsForClassifier(classifier) {
	return new Promise(function(resolve, reject) {
		Promise.resolve(classifier.getTestPositions()) // So we can neatly stack actual ops
		.each(function(testPosition) {
			return runPosition(testPosition.path, testPosition.fen);
		})
		.then(function() {
			console.log("TESTS SUCCEED FOR: " + classifier.name);
		})
	});

	// Single position runner
	function runPosition(imagepath, fen) {
		return new Promise(function(resolve, reject) {
			Promise.resolve(imagepath)
			.then(classifier.transformImage)
			.then(classifier.getFeatureVectors)
			.then(classifier.concludePosition)
			.then(function(resultFen) {
				console.log("ONE FEN RESOLVED");
				if (fen !== resultFen) {
					reject("Fen failed for image: " + imagepath + ", resultFen: " + resultFen);
				} else {
					console.log("Test SUCCESS: " + imagepath);
					resolve();
				}
			})
			.catch(function(err) {
				console.log("ERROR IN POSITION RECOGNITION PROCESS");
				console.log("CLASSIFIER WAS: " + classifier.name);
				throw err; // Rethrow up the call stack
			})
		});
	}

}


function startUp() {
	//positionAI.learnFromInitial(initialPosition.path)
	Promise.resolve()
	.then(runTests)
	.catch(function(err) {
		console.log("Initial training failed");
		throw err;
	})

}

function runTests() {

	Promise.resolve(classifier1.getTestPositions())
	.each(testImageToFenConversion)
	.then(function() {
		console.log("----TESTS SUCCEED----");
	})
	.catch(function(error) {
		console.error("----TESTS FAILED----");
		throw error;
	});	
}
/*
function testRays() {

	return positionAI.getFeatureVectors(__dirname + '/testpositions/gm_test_output.jpg')
	.then(function(data) {
		console.log("---TEST RAYS---");
		console.log(data);
	});
}
*/

function testImageTransformWithGM(imagepath) {
	var outputpath = __dirname + '/testpositions/gm_test_output.jpg';
	var wstream = fs.createWriteStream(outputpath);

	if (!wstream) throw "No write stream";
	
	console.log("Test transform for: " + imagepath);
	var rStream = fs.createReadStream(imagepath);

	
	gm(rStream)
	.whiteThreshold(115,115,115,-1)
	.blackThreshold(115,115,115,-1)
	.blur(0)
	.blackThreshold(225, 225, 225, -1)
	.stream()
	.pipe(wstream);

}

//testImageTransformWithGM(__dirname + '/testpositions/chessbase_v2.jpg');

//startUp();
//testRays();

runTestsForClassifier(classifier1);





/*
var conversionPromises = _.map(imagesToFens, testImageToFenConversion);

Promise.all(conversionPromises).then(function() {
	console.log("----TESTS SUCCEED----");
}).catch(function(error) {
	console.log("----TESTS FAILED----");
	console.log(error);
});
*/




