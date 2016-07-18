var lwip = require('lwip');
var _ = require('lodash');

var intensityThreshold = 35;

module.exports = function(image) {

		var w = image.width();
		console.log("Width: " + w);


		var squares = buildSquarePixelBounds(w);
		return getFeaturesOutOfSquares(squares, image);
	
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

	//console.log(squares['a8']['topleft']);	
	//console.log(squares['a8']['bottomright']);	

	//console.log(JSON.stringify(squares));


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
		0.14,
		0.18, 
		0.22, 
		0.26, 
		0.30, 
		0.34, 
		0.38, 
		0.42,
		0.46,
		0.50, 
		0.54,
		0.58, 
		0.62, 
		0.66, 
		0.70, 
		0.74, 
		0.78, 
		0.82,
		0.86,
		0.90		

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

	var bgIntensity = image.getPixel(square.topleft[0] + 3, square.topleft[1] + 3).r;


	var shootingLevels = _.map(shootingLevels, function(relativeLevel) {
		return Math.round(sqWidth * relativeLevel);
	});

	var x = square.topleft[0];
	var y = square.topleft[1];
	var bottomY = y + sqWidth - 3;

	var middleRayLen = shootRaysFromTop(x, y+1, Math.round(sqWidth * 0.50), bgIntensity, Math.round(sqWidth/2), image);

	// Shoots rays one by one on each vertical level and tracks when it hits piece
	var rayLenghts = _.map(shootingLevels, function(shootingOffset) {
		//var xDist = shootRay(x+2, y, shootingY, bgIntensity, Math.round(sqWidth/2), image);
		var yDist = shootRaysFromTop(x, y+1, shootingOffset, bgIntensity, Math.round(sqWidth/2), image);
		// We need to normalize the width so different sized boards are handled uniformly
		return parseFloat((yDist / sqWidth).toFixed(2));
	});

	var rayLenghtsHoriz = _.map(shootingLevels, function(shootingOffset) {
		var xDist = shootRay(x+2, y, shootingOffset, bgIntensity, Math.round(sqWidth/2), image);
		//var yDist = shootRaysFromTop(x, y+2, shootingOffset, bgIntensity, Math.round(sqWidth/2), image);
		// We need to normalize the width so different sized boards are handled uniformly
		return parseFloat((xDist / sqWidth).toFixed(2));
	});

	var rayLenghtsPerPixel = shootRaysFromTopPerPixel(x+1, y+1, bgIntensity, sqWidth - 2, sqWidth - 2, image);

	var rayLenghtsBottom = _.map(shootingLevels, function(shootingOffset) {
		//console.log("SHOOT OFFSET: " + shootingOffset);
		//console.log("BOTTOM Y: " + bottomY);
		var yDist = shootRayFromBottom(x+2, bottomY, shootingOffset, bgIntensity, Math.round(sqWidth/2), image);
		//var yDist = shootRaysFromTop(x, y+2, shootingOffset, bgIntensity, Math.round(sqWidth/2), image);
		// We need to normalize the width so different sized boards are handled uniformly
		return parseFloat((yDist / sqWidth).toFixed(2));
	});

	// Get white vs. black pixel densities
	var whites = 1;
	var blacks = 1;
	var noBlacks = 1;
	var bgs = 0;

	for (var i = x+1; i < x + sqWidth-2; i += 1) {
		for (var j = y+1; j < y + sqWidth-2; j += 1) {
			var r = image.getPixel(i, j).r;
			//console.log(r);
			if (Math.abs(bgIntensity - r) < 15) {
				++bgs;
				
			}
			if (r < 25) {
				++blacks;
			} else  {
				++noBlacks;
				if (r > 235) ++whites;
			}
			
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

	var bottomRays = _.filter(rayLenghtsBottom, function(rayL) {return rayL < 0.475});


	return {
		//rays: rayLenghts, 
		raysPerPixel: rayLenghtsPerPixel,
		stats: calcStatsForLens(rayLenghtsPerPixel, sqWidth - 2),
		//horizRays: rayLenghtsHoriz,

		//bottomRays: bottomRays,
		//bottomDeviation: Math.sqrt(getVariance(bottomRays)),
		//updownseqHoriz: getUpDownSequence(rayLenghtsHoriz),
		//updownseq: getUpDownSequence(rayLenghts),
		//randompoints: randomPointsArr, 
		wToB: whites / blacks, 
		bToNb: blacks / noBlacks,
		bgToPiece: bgs / (whites + blacks),
		//middleRayLen: middleRayLen
	};
}

function shootRay(topLeftX, topLeftY, shootingY, bgIntensity, iterations, image) {

	for (var i = 0; i < iterations; i++) {
		var pixelIntensity = image.getPixel(topLeftX + i, topLeftY + shootingY).r;

		if (pixelIntensity < 65) return i;

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

		if (pixelIntensity < 65) return i;

	};

	return i;	
}

function shootRayFromBottom(x, y, shootingOffset, bgIntensity, iterations, image) {
	var xOffset = x + shootingOffset;
	var firstIntensity = image.getPixel(xOffset, y).r;
	//console.log("X offset: " + xOffset + ", Y OFFSET: " + y + " | " + firstIntensity);
	for (var i = 0; i < iterations; i++) {
		var pixelIntensity = image.getPixel(xOffset, y - i).r;

		if (pixelIntensity < 65) return i;

		if (Math.abs(pixelIntensity - bgIntensity) > intensityThreshold) {
			// We are not above background any more
			return i;
		}
	};

	return i;	
}

function shootRaysFromTopPerPixel(x, y, bgIntensity, xIterations, maxYiterations, image) {

	var lens = [];

	for (var i = 0; i < xIterations; i++) {
		var xOffset = x + i;
		//var found = false;
		for (var j = 0; j < maxYiterations; j++) {
			//console.log(xOffset + ", " + topLeftY + i)
			var pixelIntensity = image.getPixel(xOffset, y + j).r;
			if (pixelIntensity < 65) {
				// We are not above background any more
				lens.push(Math.round(j / maxYiterations * 100) / 100);
				//found = true;
				break;
			}
		};

		//if (!found) lens.push(999);
	}

	//var stats = calcStatsForLens(lens, 72);

	return lens;

		

}

function calcStatsForLens(lens, xI) {
	var pixelsCount = lens.length;

	var chunkSize = Math.floor(lens.length / 8);
	var halfSize  = Math.round(lens.length / 2);

	var eights = _.chunk(lens, chunkSize);
	var halfs  = _.chunk(lens, halfSize);
	// Ditch first and last eights
	var avg18 = _.mean(eights[0]);
	var avg28 = _.mean(eights[1]);
	var avg38 = _.mean(eights[2]);
	var avg48 = _.mean(eights[3]);
	var avg58 = _.mean(eights[4]);
	var avg68 = _.mean(eights[5]);
	var avg78 = _.mean(eights[6]);
	var avg88 = _.mean(eights[7]);

	var halfAvg1 = _.mean(halfs[0]);
	var halfAvg2 = _.mean(halfs[1]);

	var totalDeviation = Math.sqrt(getVariance(lens));
	var startI = Math.floor(pixelsCount / 2) - 3;
	var centerSeven = _.slice(lens, startI, startI + 7);
	var deviationAroundCenter = Math.sqrt(getVariance(centerSeven));


	return {
		deviation: totalDeviation,
		centerDeviation: deviationAroundCenter,
		centerSeven: centerSeven,
		pieceWidth: pixelsCount / xI,
		eightAvgs: [
			avg18,avg28,avg38,avg48,avg58,avg68,avg78,avg88
		],
		halfAvgs: JSON.stringify([halfAvg1, halfAvg2]),
		jsonEightAvgs: JSON.stringify([
			avg28,avg38,avg48,avg58,avg68,avg78,
		]),
		//lens: JSON.stringify(lens.sort()),
		totalAvg: _.mean(lens),

	}

}


function getUpDownSequence(rayLenghts) {
	var origLen = rayLenghts.length;
	rayLenghts = _.filter(rayLenghts, function(l) {
		return l < 0.485;
	});

	var paddings = origLen - rayLenghts.length;

	var lastVal = rayLenghts.shift();
	var valueChangeThreshold = 0.035;
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
	return {updowns: updowns, paddings: paddings};

	
}

// From SO
function getVariance( numArr, numOfDec ){
	
	var avg = getAverageFromNumArr( numArr, numOfDec ), 
		i = numArr.length,
		v = 0;
 
	while( i-- ){
		v += Math.pow( (numArr[ i ] - avg), 2 );
	}
	v /= numArr.length;
	return getNumWithSetDec( v, numOfDec );
}

function getNumWithSetDec( num, numOfDec ){
	var pow10s = Math.pow( 10, numOfDec || 0 );
	return ( numOfDec ) ? Math.round( pow10s * num ) / pow10s : num;
}
function getAverageFromNumArr( numArr, numOfDec ){
	var i = numArr.length, 
		sum = 0;
	while( i-- ){
		sum += numArr[ i ];
	}
	return getNumWithSetDec( (sum / numArr.length ), numOfDec );
}

/*
function getUpDownSequenceHoriz(rayLenghts) {
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
	return {updowns: updowns, paddings: paddings};

	
}
*/