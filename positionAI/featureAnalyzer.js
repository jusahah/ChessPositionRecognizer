var lwip = require('lwip');
var _ = require('lodash');

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
		return getFeatureVectorForSquare(square, image);
	});
}

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