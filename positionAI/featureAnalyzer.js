var lwip = require('lwip');
var _ = require('lodash');

var intensityThreshold = 15;

module.exports = {

	getFeatureVectors: function(image) {

		var w = image.width();
		console.log("Width: " + w);


		var squares = buildSquarePixelBounds(w);
		return getFeaturesOutOfSquares(squares, image);
	}
}


function buildSquarePixelBounds(boardWidth) {

	var sqWidth = boardWidth / 8;

	var squares = {};
	var indexesToLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

	_.times(8, function(index1) {
		var sqNum = 8 - index1; // Reverse so 8th row is on top
		_.times(8, function(index2) {

			var letter = indexesToLetters[index2];
			squares[letter + sqNum] = {
				topleft: [Math.round(index2*sqWidth), Math.round(index1*sqWidth)],
				bottomright: [Math.round((index2+1)*sqWidth), Math.round((index1+1)*sqWidth)]
			}
		});
	});

	console.log(squares['a8']['topleft']);	
	console.log(squares['a8']['bottomright']);	

	return squares;
}

function getFeaturesOutOfSquares(squares, image) {
	return _.mapValues(squares, function(square) {
		return getFeatureVectorForSquareUsingRayCasting(square, image);
	});
}


// Feature algorithm #1
function getFeatureVectorForSquare(square, image) {

	// Move this out of here later so its not redefined again and again
	var pickPoints = [
		// x and y are relative pixel widths of square width!
		// This way we can have multiple sized boards and it still works

		{x: 0.05, y: 0.05}, // Should always be empty (= has square bg color)
		{x: 0.50, y: 0.50}, // Middle point of square

		// Quartile square
		{x: 0.75, y: 0.50},
		{x: 0.25, y: 0.50},
		{x: 0.50, y: 0.25},
		{x: 0.50, y: 0.75},


		{x: 0.66, y: 0.10},
		{x: 0.66, y: 0.20},
		{x: 0.66, y: 0.30},
		{x: 0.66, y: 0.40},
		{x: 0.66, y: 0.50},
		{x: 0.66, y: 0.60},
		{x: 0.66, y: 0.70},
		{x: 0.66, y: 0.80},
		{x: 0.66, y: 0.90},

		{x: 0.33, y: 0.10},
		{x: 0.33, y: 0.20},
		{x: 0.33, y: 0.30},
		{x: 0.33, y: 0.40},
		{x: 0.33, y: 0.50},
		{x: 0.33, y: 0.60},
		{x: 0.33, y: 0.70},
		{x: 0.33, y: 0.80},
		{x: 0.33, y: 0.90},

		{x: 0.10, y: 0.66},	
		{x: 0.20, y: 0.66},	
		{x: 0.30, y: 0.66},	
		{x: 0.40, y: 0.66},	
		{x: 0.50, y: 0.66},	
		{x: 0.60, y: 0.66},	
		{x: 0.70, y: 0.66},	
		{x: 0.80, y: 0.66},	
		{x: 0.90, y: 0.66},	

		{x: 0.10, y: 0.33},	
		{x: 0.20, y: 0.33},	
		{x: 0.30, y: 0.33},	
		{x: 0.40, y: 0.33},	
		{x: 0.50, y: 0.33},	
		{x: 0.60, y: 0.33},	
		{x: 0.70, y: 0.33},	
		{x: 0.80, y: 0.33},	
		{x: 0.90, y: 0.33},	


		// Random points around center
		{x: 0.56, y: 0.30},	
		{x: 0.56, y: 0.33},	
		{x: 0.56, y: 0.36},	
		{x: 0.56, y: 0.39},	
		{x: 0.56, y: 0.42},	
		{x: 0.56, y: 0.45},	
		{x: 0.56, y: 0.48},	
		{x: 0.56, y: 0.51},	
		{x: 0.56, y: 0.54},	
		{x: 0.56, y: 0.57},	
		{x: 0.56, y: 0.60},
		{x: 0.56, y: 0.63},	
		{x: 0.56, y: 0.66},	
		{x: 0.56, y: 0.69},	
		{x: 0.56, y: 0.72},		
		
	];

	var sqWidth = square.bottomright[0] - square.topleft[0];
	console.log("SQ WIDTH IN PICKPOINT ITERATOR: " + sqWidth);

	return _.map(pickPoints, function(pickPoint) {
		var x = square.topleft[0] + Math.floor(pickPoint.x * sqWidth);
		var y = square.topleft[1] + Math.floor(pickPoint.y * sqWidth);

		var pixel = image.getPixel(x, y);

		//console.log("Pixel grey-intensity: " + pixel.r);

		return pixel.r; // Pixel is gray-scale so we only need red-value of the RGB.

	});


}

// Feature algorithm #2
function getFeatureVectorForSquareUsingRayCasting(square, image) {
	// Y-coordinates for horizontal ray shooting
	var shootingLevels = [
		0.07,
		0.10, 
		0.12,
		0.15, 
		0.17,
		0.20, 
		0.23,
		0.25,
		0.27, 
		0.30,
		0.32, 
		0.35,
		0.38, 
		0.40,
		0.43, 
		0.45,
		0.47,
		0.50,
		0.53,
		0.55,
		0.57,
		0.60,
		0.62,
		0.65,
		0.68,
		0.70,
		0.72,
		0.75,
		0.77,
		0.80,
		0.82,
		0.85,
		0.88,
		0.90,
		0.93
	];
	// Random points around center
	var randomPoints = [
		{x: 0.56, y: 0.30},	
		{x: 0.56, y: 0.33},	
		{x: 0.56, y: 0.36},	
		{x: 0.56, y: 0.39},	
		{x: 0.56, y: 0.42},	
		{x: 0.56, y: 0.45},	
		{x: 0.56, y: 0.48},	
		{x: 0.56, y: 0.51},	
		{x: 0.56, y: 0.54},	
		{x: 0.56, y: 0.57},	
		{x: 0.56, y: 0.60},
		{x: 0.56, y: 0.63},	
		{x: 0.56, y: 0.66},	
		{x: 0.56, y: 0.69},	
		{x: 0.56, y: 0.72},	
				
	];


	var sqWidth = square.bottomright[0] - square.topleft[0];

	var bgIntensity = image.getPixel(square.topleft[0] + 2, square.topleft[1] + 2).r;

	var shootingLevelsInY = _.map(shootingLevels, function(relativeLevel) {
		return Math.round(sqWidth * relativeLevel);
	});

	var x = square.topleft[0];
	var y = square.topleft[1];

	// Shoots rays one by one on each vertical level and tracks when it hits piece
	var rayLenghts = _.map(shootingLevelsInY, function(shootingY) {
		var xDist = shootRay(x+2, y, shootingY, bgIntensity, Math.round(sqWidth/2), image);
		// We need to normalize the width so different sized boards are handled uniformly
		return parseFloat((xDist / sqWidth).toFixed(2));
	});

	// Get white vs. black pixel densities
	var whites = 1;
	var blacks = 1;
	var bgs = 0;

	for (var i = x+1; i < x + sqWidth-3; ++i) {
		for (var j = y+1; j < y + sqWidth-3; ++j) {
			var r = image.getPixel(i, j).r;
			//console.log(r);
			if (r < 15) ++blacks;
			else if (r > 240) ++whites;
			else ++bgs;	
		};	
	};



	// Get some pixel data too
	var randomPointsArr = [];
	/*
	var randomPointsArr = _.map(randomPoints, function(pickPoint) {
		var x = square.topleft[0] + Math.floor(pickPoint.x * sqWidth);
		var y = square.topleft[1] + Math.floor(pickPoint.y * sqWidth);

		var pixel = image.getPixel(x, y);

		//console.log("Pixel grey-intensity: " + pixel.r);

		if (pixel.r > 240) return 1;
		if (pixel.r < 16) return -1;
		return 0;

	});
	*/
	return {
		rays: rayLenghts, 
		randompoints: randomPointsArr, 
		wToB: whites / blacks, 
		bgToPiece: bgs / (whites + blacks)
	};
}

function shootRay(topLeftX, topLeftY, shootingY, bgIntensity, iterations, image) {

	for (var i = 0; i < iterations; i++) {
		var pixelIntensity = image.getPixel(topLeftX + i, topLeftY + shootingY).r;

		if (Math.abs(pixelIntensity - bgIntensity) > intensityThreshold) {
			// We are not above background any more
			return i;
		}
	};

	return i;
}