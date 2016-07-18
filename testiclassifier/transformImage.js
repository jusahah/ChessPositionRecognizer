var fs = require('fs');
var Promise = require('bluebird');
var gm = require('gm');
var _ = require('lodash');

module.exports = function(imagepath) {
	return new Promise(function(resolve, reject) {

		var imagename = _.last(imagepath.split("/"))
		var outputpath = __dirname + '/../../temp/' + imagename; // Where to save transformed image
		var wstream = fs.createWriteStream(outputpath);

		if (!wstream) return reject("No write stream");

		// Create read stream
		var rStream = fs.createReadStream(imagepath);

		gm(rStream)
		/* 
			add steps here
		*/
		.write(outputpath, function(err) {
			if (err) return reject(err);
			return resolve(outputpath);
		});
	});

}