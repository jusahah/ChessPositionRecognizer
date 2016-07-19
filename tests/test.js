// This script tests the AI
var Promise = require('bluebird');
var lwip = require('lwip');
var _ = require('lodash');
var fs = require('fs');
var gm = require('gm');

// Classifiers
var classifier1 = require('../classifiers/Chessdotcom')();
var classifier2 = require('../classifiers/PlayChessModern')();

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
		// WE don't need to wrap this all into Promise as
		// the returned object is already promise! (well, do'h)
		var start = Date.now();
		/* Taps are for profiling */
		return Promise.resolve(imagepath)
		.then(classifier.transformImage)
		.tap(function(image) {
			var empties = classifier.getEmptySquares(image);
			console.log("Empty squares map");
			console.log(empties);
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
		.then(function(resultFen) {
			console.log("ONE FEN RESOLVED");
			if (fen !== resultFen) {
				throw "Fen failed for image: " + imagepath + ", resultFen: " + resultFen;
			} else {
				console.log("Test SUCCESS: " + imagepath);
				return true;
			}
		})
		.catch(function(err) {
			console.log("ERROR IN POSITION RECOGNITION PROCESS");
			console.log("CLASSIFIER WAS: " + classifier.name);
			throw err; // Rethrow up the call stack
		})
		
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
*/

var squaresToPieces = {
	'h1': 'wR',
	'g1': 'wN',
	'f1': 'wB',
	'e1': 'wK',
	'd1': 'wQ',
	'c2': 'wP',
	'h8': 'bR',
	'g8': 'bN',
	'f8': 'bB',
	'e8': 'bK',
	'd8': 'bQ',
	'c7': 'bP',	
}

/* TEST SKETCHBOARD STUFF */
var getFeatureVectors = require('./getFeatureVector');

function testRays() {

	return getImageData(__dirname + '/gm_test_output.jpg')
	.then(removeBorders)
	.tap(function(image) {
		// Write to file so we can visually inspect the removal borders result
		image.writeFile(__dirname + '/gm_test_output_no_borders.jpg', function() {});
		return Promise.resolve(); // No need to wait for write to finish
	})
	.then(getFeatureVectors)
	.then(function(data) {
		console.log("---TEST RAYS 2---");
		var pieceExemplars = {};

		_(data).forOwn(function(value, key) {
			if (_.has(squaresToPieces, key)) {
				pieceExemplars[squaresToPieces[key]] = value.stats.eightAvgs;
			}
		});

		console.log(pieceExemplars);
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

function testImageTransformWithGM(imagepath) {
	return new Promise(function(resolve, reject) {
		var outputpath = __dirname + '/gm_test_output.jpg';
		var wstream = fs.createWriteStream(outputpath);

		if (!wstream) throw "No write stream";
		
		console.log("Test transform for: " + imagepath);
		var rStream = fs.createReadStream(imagepath);

		var ts = 115;

		gm(rStream)
		.whiteThreshold(ts,ts,ts,-1)
		.blackThreshold(ts,ts,ts,-1)
		.blur(0.1)
		.blackThreshold(235, 235, 235, -1)
		.stream()
		.pipe(wstream);

		setTimeout(resolve, 500);
	});


}

function removeBorders(image) {

	var w = image.width() - 1;
	var h = image.height() - 1;

	var up = findUpMargin(w, h);
	var down = findDownMargin(w, h);
	var left = findLeftMargin(w, h);
	var right = findRightMargin(w, h);

	function findUpMargin(w, h) {

		var center = Math.round(w / 2);
		var currH = 0;

		while (currH < h) {
			var pixel = image.getPixel(center, currH);
			if (pixel.r > 50) {
				return currH;
			}	
			++currH;		
		}
		throw "Never hit white pixel (up)";
	}
	function findDownMargin(w, h) {

		var center = Math.round(w / 2);
		var currH = h;

		while (currH > 0) {
			var pixel = image.getPixel(center, currH);
			if (pixel.r > 50) {
				return h - currH;
			}	
			--currH;		
		}
		throw "Never hit white pixel (down)";
	}
	function findLeftMargin(w, h) {

		var centerVert = Math.round(h / 2);
		var currW = 0;

		while (currW < w) {
			var pixel = image.getPixel(currW, centerVert);
			if (pixel.r > 50) {
				return currW;
			}	
			++currW;		
		}
		throw "Never hit white pixel (left)";
	}
	function findRightMargin(w, h) {

		var centerVert = Math.round(h / 2);
		var currW = w;

		while (currW > 0) {
			var pixel = image.getPixel(currW, centerVert);
			if (pixel.r > 50) {
				return w - currW;
			}	
			--currW;		
		}
		throw "Never hit white pixel (right)";
	}	

	return new Promise(function(resolve, reject) {
		image.extract(left, up, w - right, h - down, function(err, newimage){
			if (err) return reject(err)
				resolve(newimage)
		})
	});

}
/*
testImageTransformWithGM(__dirname + '/../classifiers/PlayChessModern/testpositions/initial.jpg')
.then(testRays);
*/
//startUp();


runTestsForClassifier(classifier2);







