var lwip = require('lwip');
var _ = require('lodash');

var intensityThreshold = 25;

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
		0.10, 
		0.13,
		0.16, 
		0.19, 
		0.22,
		0.25,
		0.28,
		0.31,
		0.34,
		0.37,
		0.40,
		0.43,
		0.46,
		0.49,
		0.52,
		0.55,
		0.58,
		0.61,
		0.64,
		0.67,
		0.70,
		0.73,
		0.76,
		0.79,
		0.82,
		0.85,
		0.88,
		0.91
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

	var p1 = image.getPixel(square.topleft[0] + 2, square.topleft[1] + 2).r;
	var p2 = image.getPixel(square.topleft[0] + 2, square.topleft[1] + 4).r;
	var p3 = image.getPixel(square.topleft[0] + 2, square.topleft[1] + 6).r;
	var p4 = image.getPixel(square.topleft[0] + 2, square.topleft[1] + 7).r;

	var bgIntensity = (p1 + p2 + p3 + p4) / 4;

	//var bgIntensity = image.getPixel(square.topleft[0] + 2, square.topleft[1] + 2).r;


	var shootingLevels = _.map(shootingLevels, function(relativeLevel) {
		return Math.round(sqWidth * relativeLevel);
	});

	var x = square.topleft[0];
	var y = square.topleft[1];

	// Shoots rays one by one on each vertical level and tracks when it hits piece
	var rayLenghts = _.map(shootingLevels, function(shootingOffset) {
		//var xDist = shootRay(x+2, y, shootingY, bgIntensity, Math.round(sqWidth/2), image);
		var yDist = shootRaysFromTop(x, y+2, shootingOffset, bgIntensity, Math.round(sqWidth/2), image);
		// We need to normalize the width so different sized boards are handled uniformly
		return parseFloat((yDist / sqWidth).toFixed(2));
	});

	// Get white vs. black pixel densities
	var whites = 1;
	var blacks = 1;
	var bgs = 0;

	for (var i = x+1; i < x + sqWidth-2; i += 1) {
		for (var j = y+1; j < y + sqWidth-2; j += 1) {
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
		//rays: rayLenghts, 
		updownseq: getUpDownSequence(rayLenghts),
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

function shootRaysFromTop(topLeftX, topLeftY, shootingOffset, bgIntensity, iterations, image) {
	var xOffset = topLeftX + shootingOffset;
	for (var i = 0; i < iterations; i++) {
		//console.log(xOffset + ", " + topLeftY + i)
		var pixelIntensity = image.getPixel(xOffset, topLeftY + i).r;

		if (Math.abs(pixelIntensity - bgIntensity) > intensityThreshold) {
			// We are not above background any more
			return i;
		}
	};

	return i;	
}

function getUpDownSequence(rayLenghts) {
	var origLen = rayLenghts.length;
	rayLenghts = _.filter(rayLenghts, function(l) {
		return l < 0.485;
	});

	var paddings = origLen - rayLenghts.length;

	var lastVal = rayLenghts.shift();
	var valueChangeThreshold = 0.015;
	var lastDirection = 0;

	// Up is -1, down is 1
	var updowns = [];

	for (var i = 0, j = rayLenghts.length; i < j; i++) {
		var rayL = rayLenghts[i];

		if (Math.abs(rayL-lastVal) > valueChangeThreshold) {
			// If we go downwards (current val larger than previous one)
			if (rayL > lastVal) {
				// We are going down!
				if (lastDirection < 0.01) {
					lastDirection = 1;
					updowns.push(1);					
				} 

			}
			else {
				// We are going up!
				if (lastDirection > -0.01) {
					lastDirection = -1;
					updowns.push(-1);					
				} 
			} 
		}

		lastVal = rayL;
		
	};
	//return updowns;
	return {updowns: JSON.stringify(updowns), paddings: paddings};

	
}