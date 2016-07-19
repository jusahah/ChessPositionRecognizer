// This script tests the AI
var Promise = require('bluebird');
var lwip = require('lwip');
var _ = require('lodash');

module.exports = {

	getImage: function(image) {
		return cropBoard(image).then(function(coords) {
			return new Promise(function(resolve, reject) {
				image.extract(coords[0], coords[1], coords[2], coords[3], function(err, newimage){
					if (err) return reject(err)
					resolve(newimage)
				})			
			});

		})

	},
	getCoords: cropBoard

}


function cropBoard(image) {

	var belows = findStartStopPointsFromBelow(image);
	var lefts  = findStartStopPointsFromLeft(image);

	var left = belows[0];
	var top  = lefts[1];
	var right = belows[1];
	var bottom = lefts[0];

	return Promise.resolve([left, top, right, bottom]);
	
}

function findStartStopPointsFromBelow(image) {
	var blackTs = 45;

	var w = image.width();
	var h = image.height();

	// Start from bottom
	var currX = 2;

	var firstBoardHit;
	var nextEmptyHit;

	while (currX < w) {
		var l = shootVertRay(currX, h - 2, Math.round(h/2));
		//console.log("X: " + currX + " with len: " + l);
		if (l > Math.round(h/2) + 4) {
			// Board hit
			if (firstBoardHit === undefined) {
				console.log("FIRST BELOW BOARD HIT: " + currX);
				firstBoardHit = currX;
				continue;
			}
		} else {
			// Its empty
			if (firstBoardHit !== undefined) {
				// We found upper side
				console.log("2ND BELOW BOARD HIT: " + currX);
				return [firstBoardHit, currX];
			}
		}

		++currX;
	}

	throw "Cropping a board failed - points from below run into zero Y";

	function shootVertRay(x, y, maxY) {
		//console.log("X: " + x + ", Y: " + y);
		for (var i = y; i >= maxY; i--) {
			var pixel = image.getPixel(x, i);
			
			if (pixel.r > blackTs) return i;	
		};

		return maxY;

	}

}

function findStartStopPointsFromLeft(image) {
	var blackTs = 45;

	var w = image.width();
	var h = image.height();

	// Start from bottom
	var currY = h - 2;

	var firstBoardHit;
	var nextEmptyHit;

	while (currY > 0) {
		var l = shootHorizRay(2, currY, Math.ceil(w/2));
		if (l < Math.floor(w/2)) {
			// Board hit
			if (firstBoardHit === undefined) {
				console.log("FIRST LEFT BOARD HIT: " + currY);

				firstBoardHit = currY;
				continue;
			}
		} else {
			// Its empty
			if (firstBoardHit !== undefined) {
				// We found upper side
				console.log("2ND LEFT BOARD HIT: " + currY);

				return [firstBoardHit, currY];
			}
		}

		--currY;
	}

	throw "Cropping a board failed - points from left run into max X";

	function shootHorizRay(x, y, maxX) {
		for (var i = x; i <= maxX; i++) {
			var pixel = image.getPixel(i, y);
			if (pixel.r > blackTs) return i;	
		};

		return maxX;

	}
}