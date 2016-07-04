var _ = require('lodash');
var Chess = require('chess.js').Chess;
var Correlation = require('node-correlation');


// Takes care of actually resolving the position out of feature vectors

// Note: features vectors are like following:
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

		var matches = _.mapValues(featureVectors, function(featuresObj) {
			return resolveBestMatch(featuresObj, pieceExemplars, intensityThreshold);
		});
		
		
		console.log("MATCHES");
		console.log(matches)
		

		return resolveFen(matches);

	}
}
function resolveBestMatch(featuresObj, pieceExemplars, intensityThreshold) {

	var isRook = function(updowns, paddings, minusOneCount, plusOneCount, bgToPiece) {
		return updowns[0] > 0.5 && paddings > 4.5;
	}

	var isKnight = function(updowns, paddings, minusOneCount, plusOneCount, bgToPiece) {
		return paddings < 8.5 && updowns.length < 3.5;
	}

	var isBishop = function(updowns, paddings, minusOneCount, plusOneCount, bgToPiece) {
		return updowns.length < 4.5 && paddings > 8.5;
	}

	var isKing = function(updowns, paddings, minusOneCount, plusOneCount, bgToPiece) {
		return paddings < 2.5 && updowns;
	}

	var isQueen = function(updowns, paddings, minusOneCount, plusOneCount, bgToPiece) {
		return paddings < 3.5 && minusOneCount > 3;
	}

	var isPawn = function(updowns, paddings, minusOneCount, plusOneCount, bgToPiece) {
		return paddings > 8.5 && updowns.length < 3.5;
	}

	// First we check if the square is empty, if it is there is no need to do more detailed matching
	if (isEmpty(featuresObj.rays)) {
		return {matches: featuresObj.rays.length, exemplar: 'e', chosen: 'e', matchPerc: 1, isEmpty: true};
	}

	var updownseqObj = featuresObj.updownseq;
	var updowns = updownseqObj.updowns;
	var paddings = updownseqObj.paddings;

	var minusOneCount = _.reduce(updowns, function(c, v) {return v < -0.5 ? c+1 : c;}, 0)
	var plusOneCount  = _.reduce(updowns, function(c, v) {return v >  0.5 ? c+1 : c;}, 0)

	var instanceWhitesToBlacks = featuresObj.wToB;

	var pieceColor = instanceWhitesToBlacks > 1.20 ? 'w' : 'b';
	/*
	console.log("First here");
	console.log(updowns);
	console.log(paddings);
	console.log(minusOneCount);
	console.log(plusOneCount);
	*/

	// Later abstract these into data-driven solution (map with function -> piece name)
	if (isPawn(updowns, paddings, minusOneCount, plusOneCount)) {
		// Its a rook
		chosen = 'p';

	} else if (isRook(updowns, paddings, minusOneCount, plusOneCount)) {
		chosen = 'r';
	} else if (isKnight(updowns, paddings, minusOneCount, plusOneCount)) {
		chosen = 'n';

	} else if (isBishop(updowns, paddings, minusOneCount, plusOneCount)) {
		chosen = 'b';

	} else if (isKing(updowns, paddings, minusOneCount, plusOneCount)) {
		chosen = 'k';

	} else if (isQueen(updowns, paddings, minusOneCount, plusOneCount)) {
		chosen = 'q';

	} else {
		//chosen = 'p';
		return resolveBestMatchBackup(featuresObj, pieceExemplars, intensityThreshold);
	}



	
	//console.log(exemplarGrades);
	

	return {
		chosen: pieceColor  + chosen, 
		backup: false, 
		minusOneCount: minusOneCount, 
		plusOneCount: plusOneCount, 
		paddings: paddings,
		updowns: JSON.stringify(updowns)
	}




}

function resolveBestMatchBackup(featuresObj, pieceExemplars, intensityThreshold) {

	// First we check if the square is empty, if it is there is no need to do more detailed matching
	if (isEmpty(featuresObj.rays)) {
		return {matches: featuresObj.rays.length, exemplar: 'e', chosen: 'e', matchPerc: 1, isEmpty: true};
	}

	var instanceWhitesToBlacks = featuresObj.wToB;
	var instanceBgToPiece = featuresObj.bgToPiece;
	//console.log("FEAT OBJ");
	//console.log(featuresObj);

	var exemplarGrades = [];

	_.forOwn(pieceExemplars, function(exemplarFeatures, exemplarName) {
		//console.log("EXEMP FEATU")
		//console.log(exemplarFeatures);
		var wToB = Math.abs(exemplarFeatures.wToB - instanceWhitesToBlacks);
		var bgToPiece = Math.abs(exemplarFeatures.bgToPiece - instanceBgToPiece);
		//console.log("WTOB:" +  wToB)
		//console.log("BGTOP: " + bgToPiece);
		exemplarGrades.push({m: wToB+bgToPiece, exemplar: exemplarName.substr(1), rays: exemplarFeatures.rays});
	});

	exemplarGrades = _.sortBy(exemplarGrades, function(o) {return o.m});


	var winnerRaysCorr = getMatchValue(featuresObj.rays, exemplarGrades[0].rays);
	var sndRaysCorr = getMatchValue(featuresObj.rays, exemplarGrades[1].rays);
	var chosen = exemplarGrades[0].exemplar;
	if (sndRaysCorr > 0.955 || (sndRaysCorr - winnerRaysCorr) > 0.40) {
		chosen = exemplarGrades[1].exemplar;
	}

	
	//console.log(exemplarGrades);

	return {chosen: chosen, backup: true}
	

	return {
		matches: exemplarGrades[0].m, 
		sndmatch: exemplarGrades[1].m,
		exemplar: exemplarGrades[0].exemplar, 
		sndbest: exemplarGrades[1].exemplar,
		winnerRaysCorr: winnerRaysCorr,
		sndRaysCorr: sndRaysCorr,
		chosen: chosen
	};




}

// OLD WHICH USES RAYS TO GET THE PIECE OUTER FORM
/*
// Find the best match for given feature vector
function resolveBestMatch(featuresObj, pieceExemplars, intensityThreshold) {
	var bestClass = 'e';
	var bestM = 0;

	// First we check if the square is empty, if it is there is no need to do more detailed matching
	if (isEmpty(featuresObj.rays)) {
		return {matches: featuresObj.rays.length, exemplar: 'e', matchPerc: 1, isEmpty: true};
	}

	//console.log(pieceExemplars);
	var pieceColor = featuresObj.whitesToBlacks > 1 ? 'w' : 'b';
	
	var features = featuresObj.rays;


	_.forOwn(pieceExemplars, function(exemplarFeatures, exemplarName) {
		var m = getMatchValue(features, exemplarFeatures.rays, intensityThreshold);
		if (m > bestM) {
			bestM = m;
			bestClass = exemplarName.substr(1); // Strip the first letter (=square color)
		}
	});

	// Replace piece color
	bestClass = pieceColor + bestClass.substr(1);

	return {matches: bestM, exemplar: bestClass, matchPerc: bestM / features.length, d: 0};
}
*/

function resolveFen(matches) {

	var chess = new Chess();

	chess.clear();

	//console.log(matches);

	_.forOwn(matches, function(matchObj, sq) {
		var exemp = matchObj.chosen;
		if (exemp.length === 1) return; // Empty square
		var piece = exemp.charAt(1);
		var color = exemp.charAt(0);

		if (!chess.put({type: piece, color: color}, sq)) {
			throw "Fen generation failed: " + sq + " | " + JSON.stringify(exemp);
		}
	});

	return chess.fen().split(" ")[0];

}

// Algorithm #1 stuff
// Returns how good the match is between these two vectors
/*
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
*/

/*
function getIntensityDeviation(features) {

	// We do very simple variance analysis of color intensities
	return Math.sqrt(getVariance(features, 2));


}

function isEmpty(features) {

	// We do very simple variance analysis of color intensities
	var deviation = Math.sqrt(getVariance(features, 2));
	console.log("Deviation: " + deviation);
	if (deviation < 15) return true;
	return false;

}

// From StackOverflow
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
*/

// Algorithm #2 stuff

function isEmpty(features) {
	//console.log("MEAN: " + _.mean(features))
	return _.mean(features) > 0.44;

}

function getMatchValue(features, exemplarFeatures) {

	if (features.length !== exemplarFeatures.length) {
		throw "Vector lengths unequal: " + features.length + ' vs. ' + exemplarFeatures.length;
	}

	var c = Correlation.calc(features, exemplarFeatures);

	return c < 0 ? 0 : c;

	var totalMatches = 0;
	for (var i = features.length - 1; i >= 0; i--) {
		// If the difference of relative ray lengths is less than 0.05, its a match
		if (Math.abs(features[i] - exemplarFeatures[i]) < 0.) {
			++totalMatches;
		}
	};

	return totalMatches;
}

