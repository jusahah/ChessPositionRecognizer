var Promise = require('bluebird');
var lwip = require('lwip');
var _ = require('lodash');

var positionConcluder = require('./positionConcluder');
var featureAnalyzer   = require('./featureAnalyzer');

var intensityThreshold = 3;

module.exports = function() {

	var learnedPieceExemplars = null;

	return {
		// "Training" is done from just one position - initial position with extra queen + king
		learnFromInitial: function(imagepath) {
			return getDesaturedImageData(imagepath)
			.then(featureAnalyzer.getFeatureVectors)
			.then(turnToPieceExemplars)
			.then(function(pieceExemplars) {
				console.log("Piece exemplars");
				console.log(pieceExemplars);
				console.log("__________")
				var grades = [];
				_.forOwn(pieceExemplars, function(value, exemplarName) {
					grades.push({name: exemplarName, wToB: value.wToB, bgToPiece: value.bgToPiece});
				});

				grades = _.sortBy(grades, function(o) { return o.wToB});
				console.log(grades);

				/*
				_.forOwn(pieceExemplars, function(value, key) {
					console.log(key);
					console.log(value.randompoints);
					console.log("---------")
				});
				*/
				learnedPieceExemplars = pieceExemplars;
			})

		},
		// Attempts to predict a FEN position out of image
		resolvePosition: function(imagepath) {
			return getDesaturedImageData(imagepath)
			.then(featureAnalyzer.getFeatureVectors)
			.then(function(featureVectors) {
				console.log("Feature vectors below");
				console.log(featureVectors);

				return positionConcluder.getPosition(
					featureVectors, // Feature vectors of the image
					learnedPieceExemplars, // Weight vectors to compare against
					intensityThreshold // Defines how similar color intensities are grouped together
				);
			});
		},

		getFeatureVectors: function(imagepath) {
			return getDesaturedImageData(imagepath)
			.then(featureAnalyzer.getFeatureVectors)

		}

	};
};

// Helper functions

function getDesaturedImageData(imagepath) {
	return new Promise(function(resolve, reject) {
		lwip.open(imagepath, function(err, image) {
			if (err) return reject(err);
			resolve(image);
		});
	}).then(function(image) {
		// Desaturate the image for easier pixel analysis
		return new Promise(function(resolve, reject) {
			image.saturate(-1, function(err, image) {
				if (err) return reject(err);
				return resolve(image);
			});
		});
	})
}

function turnToPieceExemplars(featureVectors) {

	// featureVectors must represent initial board position from white's POW

	return {

		
				wwk: featureVectors['d3']

				,
				wwq: featureVectors['d1']

				,
				wwr: featureVectors['h1']

				,
				wwb: featureVectors['f1']

				,
				wwn: featureVectors['b1']

				,
				wwp: featureVectors['a2']

				,
				wbk: featureVectors['e8']

				,
				wbq: featureVectors['e6']

				,
				wbr: featureVectors['a8']

				,
				wbb: featureVectors['c8']

				,
				wbn: featureVectors['g8']

				,
				wbp: featureVectors['h7']

				, 
				we:	featureVectors['a4']
				,

		

			/*
				bwk: featureVectors['e1']

				,
				bwq: featureVectors['e3']

				,
				bwr: featureVectors['a1']

				,
				bwb: featureVectors['c1']

				,
				bwn: featureVectors['g1']

				,
				bwp: featureVectors['b2']

				,
				bbk: featureVectors['d6']

				,
				bbq: featureVectors['d8']

				,
				bbr: featureVectors['h8']

				,
				bbb: featureVectors['f8']

				,
				bbn: featureVectors['b8']

				,
				bbp: featureVectors['a7']

				, 
				be:	featureVectors['a5']
			*/	
			

		
	}

}