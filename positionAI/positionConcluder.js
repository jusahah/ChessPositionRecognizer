var _ = require('lodash');
var Chess = require('chess.js').Chess;


// Takes care of actually resolving the position out of feature vectors

// Note: feactures vectors are like following:
// [0,1,2,3,4,6,6,7,6, ... , 9]
// [0,0,0,0,0,0,0,0,4, ... , 8]
// [1,7,2,3,8,2,9,3,2, ... , 2]

// Each vector represents single square and its contents.

// Naive Bayes classifier takes in a single feature vector at a time 
// and matches it to most probable interpretation of whats located on the square.

// ---------------------------
// Examples:
// naiveBayes(featureVector1) -> {piece: null} 
// naiveBayes(featureVector2) -> {piece: 'wP'} 
// naiveBayes(featureVector3) -> {piece: 'bK'}
// naiveBayes(featureVector3) -> {piece: 'undefined'}

// (null = empty square)
// (undefined = matching could not be performed, inconclusive data)
//----------------------------



// Classifier state (built during program start-up)
var pieceFeatureProbabilities = {

	whitesq: {
		w: {
			k: {

			},
			q: {

			},
			r: {

			},
			b: {

			},
			n: {

			},
			p: {

			},
			e: /* empty*/ {

			}



		},
		b: {
			k: {

			},
			q: {

			},
			r: {

			},
			b: {

			},
			n: {

			},
			p: {

			},
			e: /* empty*/ {

			}
		}

	},

	blacksq: {
		w: {
			k: {

			},
			q: {

			},
			r: {

			},
			b: {

			},
			n: {

			},
			p: {

			},
			e: /* empty*/ {

			}
		},
		b: {
			k: {

			},
			q: {

			},
			r: {

			},
			b: {

			},
			n: {

			},
			p: {

			},
			e: /* empty*/ {

			}			
		}
	}
}

module.exports = {

	getPosition: function(featureVectors, pieceExemplars, intensityThreshold) {
		// Okay lets get busy

		// Okay so our algorithm is very simple now

		// "Count the matches" for each featureVector

		var matches = _.mapValues(featureVectors, function(features) {
			return resolveBestMatch(features, pieceExemplars, intensityThreshold);
		});
		//console.log("MATCHES");
		//console.log(matches)

		return resolveFen(matches);

	}
}

// Find the best match for given feature vector
function resolveBestMatch(features, pieceExemplars, intensityThreshold) {
	var bestClass = 'e';
	var bestM = 0;

	//console.log(pieceExemplars);

	_.forOwn(pieceExemplars, function(exemplarFeatures, exemplarName) {
		//console.log(exemplarFeatures)
		//console.log(exemplarName);

		var m = getMatchValue(features, exemplarFeatures, intensityThreshold);
		if (m < Math.ceil(features.length / 2)) return // Less than 50% is ditched right away
		if (m > bestM) {
			bestM = m;
			bestClass = exemplarName.substr(1); // Strip the first letter (=square color)
		}
	});

	return {matches: bestM, exemplar: bestClass, matchPerc: bestM / features.length};
}

// Returns how good the match is between these two vectors
function getMatchValue(features, exemplarFeatures, intensityThreshold) {

	if (features.length !== exemplarFeatures.length) {
		throw "Vector lengths unequal: " + features.length + ' vs. ' + exemplarFeatures.length;
	}
	var totalMatches = 0;
	for (var i = features.length - 1; i >= 0; i--) {
		// If the difference of color intensities is less than threshold, its a match!
		if (Math.abs(features[i] - exemplarFeatures[i]) < intensityThreshold) {
			++totalMatches;
		}
	};

	return totalMatches;
}

function resolveFen(matches) {

	var chess = new Chess();

	chess.clear();

	_.forOwn(matches, function(matchObj, sq) {
		var exemp = matchObj.exemplar;
		if (exemp.length === 1) return; // Empty square
		var piece = exemp.charAt(1);
		var color = exemp.charAt(0);

		if (!chess.put({type: piece, color: color}, sq)) {
			throw "Fen generation failed: " + sq + " | " + JSON.stringify(exemp);
		}
	});

	return chess.fen().split(" ")[0];



}