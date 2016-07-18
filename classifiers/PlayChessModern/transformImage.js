var fs = require('fs');
var Promise = require('bluebird');
var gm = require('gm');
var _ = require('lodash');
var lwip = require('lwip');

module.exports = function(imagepath) {
	var imagename = _.last(imagepath.split("/"))
	var outputpath = __dirname + '/../../temp/' + imagename; // Where to save transformed image	

	return new Promise(function(resolve, reject) {

		var wstream = fs.createWriteStream(outputpath);

		if (!wstream) return reject("No write stream");

		// Create read stream
		var rStream = fs.createReadStream(imagepath);
		var ts = 115;

		gm(rStream)
		.whiteThreshold(ts,ts,ts,-1)
		.blackThreshold(ts,ts,ts,-1)
		.blur(0.1)
		.blackThreshold(235, 235, 235, -1)
		.write(outputpath, function(err) {
			if (err) return reject(err);
			return resolve(outputpath);
		});
	})
	.then(getImageData)
	.then(removeBorders)
	.tap(function(image) {
		image.writeFile(__dirname + '/no_borders.jpg', function() {});
	})

}

/* Helpers */

function getImageData(imagepath) {
	return new Promise(function(resolve, reject) {
			lwip.open(imagepath, function(err, image) {
				if (err) return reject(err);
				resolve(image);
			});
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