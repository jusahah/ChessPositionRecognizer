// This script tests the AI
var _ = require('lodash');
var Promise = require('bluebird');
//var positionAI = require('../positionAI/entry')();
var gm = require('gm');
var fs = require('fs');

// Classifiers
var classifier1 = require('../classifiers/Chessdotcom')();
//var classifier2 = require('../classifiers/playchessmodern')();

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

/*
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

testImageTransformWithGM(__dirname + '/classifiers/PlayChessModern/testpositions/initial.jpg');

//startUp();
//testRays();

//runTestsForClassifier(classifier1);







