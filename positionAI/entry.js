var Promise = require('bluebird');
var lwip = require('lwip');

var positionConcluder = require('./positionConcluder');
var featureAnalyzer   = require('./featureAnalyzer');

module.exports = function() {

	var learnedPieceExemplars = null;

	return {

		learnFromInitial: function(imagepath) {
			return getDesaturedImageData(imagepath)
			.then(featureAnalyzer.getFeatureVectors)
			.then(turnToPieceExemplars)
			.then(function(pieceExemplars) {
				console.log(pieceExemplars)
				learnedPieceExemplars = pieceExemplars;
			})

		},

		resolvePosition: function(imagepath) {
			getDesaturedImageData(imagepath)
			.then(featureAnalyzer.getFeatureVectors)
			.then(function(featureVectors) {
				console.log("Feature vectors below");
				console.log(featureVectors);
				return positionConcluder.getPosition(featureVectors, learnedPieceExemplars);
			});
		}

	};
};


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

		wsq: {
				wk: featureVectors['d3']

				,
				wq: featureVectors['d1']

				,
				wr: featureVectors['h1']

				,
				wb: featureVectors['f1']

				,
				wn: featureVectors['b1']

				,
				wp: featureVectors['a2']

				,
				bk: featureVectors['e8']

				,
				bq: featureVectors['e6']

				,
				br: featureVectors['a8']

				,
				bb: featureVectors['c8']

				,
				bn: featureVectors['g8']

				,
				bp: featureVectors['h7']

				, 
				e:	featureVectors['a4']
			

		},

		bsq: {
				wk: featureVectors['e1']

				,
				wq: featureVectors['e3']

				,
				wr: featureVectors['a1']

				,
				wb: featureVectors['c1']

				,
				wn: featureVectors['g1']

				,
				wp: featureVectors['b2']

				,
				bk: featureVectors['d6']

				,
				bq: featureVectors['d8']

				,
				br: featureVectors['h8']

				,
				bb: featureVectors['f8']

				,
				bn: featureVectors['b8']

				,
				bp: featureVectors['a7']

				, 
				e:	featureVectors['a5']
			

		}
	}

}