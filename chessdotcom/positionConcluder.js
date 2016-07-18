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
	console.log("FEAT");
	console.log(featuresObj);

	var isRook = function(rays, stats) {
		return stats.pieceWidth < 0.775 && stats.totalAvg < 0.2475;
	}

	var isPawn = function(rays, stats) {
		return stats.pieceWidth < 0.655;
	}

	var isQueen = function(rays, stats) {
		function sortNumber(a,b) {
		    return b - a;
		}

		var sorted = rays.sort(sortNumber);
		var highAvg = _.mean(_.slice(sorted, 0, 4));
		return stats.pieceWidth > 0.895 && highAvg < 0.5151 && stats.deviation < 0.165; 
	}

	var isKing = function(rays,stats) {

		return stats.deviation < 0.135 && stats.pieceWidth > 0.875 && stats.centerDeviation < 0.0215;
	}

	var isBishop = function(rays, stats) {
		return stats.totalAvg > 0.35 && stats.pieceWidth > 0.80;
	}	

	var isKnight = function(rays, stats) {
		return stats.deviation < 0.235 && stats.totalAvg < 0.365;
	}








	
	// First we check if the square is empty, if it is there is no need to do more detailed matching
	if (isEmpty(featuresObj.raysPerPixel)) {
		return {matches: 0, exemplar: 'e', chosen: 'e', matchPerc: 1, isEmpty: true};
	}
	/*

	var updownseqObj = featuresObj.updownseq;
	var updownsHorizObj = featuresObj.updownseqHoriz;

	var updownsHoriz = updownsHorizObj.updowns;
	var updowns = updownseqObj.updowns;
	var paddings = updownseqObj.paddings;

	var minusOneCount = _.reduce(updowns, function(c, v) {return v < -0.5 ? c+1 : c;}, 0)
	var plusOneCount  = _.reduce(updowns, function(c, v) {return v >  0.5 ? c+1 : c;}, 0)

	var instanceWhitesToBlacks = featuresObj.wToB;
	var bgToPiece = featuresObj.bgToPiece;
	var middleRayLen = featuresObj.middleRayLen;


	
	
	console.log("First here");
	console.log(updowns);
	console.log(paddings);
	console.log(bgToPiece);
	console.log(middleRayLen);
	*/

	var instanceWhitesToBlacks = featuresObj.wToB;
	var pieceColor = featuresObj.bToNb > 0.250 ? 'b' : 'w';

	// Later abstract these into data-driven solution (map with function -> piece name)
	if (isPawn(featuresObj.raysPerPixel, featuresObj.stats)) {
		// Its a rook
		chosen = 'p';

	}  else if (isRook(featuresObj.raysPerPixel, featuresObj.stats)) {
		chosen = 'r';
	} else if (isKing(featuresObj.raysPerPixel, featuresObj.stats)) {
		chosen = 'k';

	} else if (isQueen(featuresObj.raysPerPixel, featuresObj.stats)) {
		chosen = 'q';

	} else if (isBishop(featuresObj.raysPerPixel, featuresObj.stats)) {
		chosen = 'b';

	} else if (isKnight(featuresObj.raysPerPixel, featuresObj.stats)) {
		chosen = 'n';

	}  else {
		chosen = '?';
		//return resolveBestMatchBackup(featuresObj, pieceExemplars, intensityThreshold);
	}



	
	//console.log(exemplarGrades);

	return {chosen: pieceColor + chosen, stats: featuresObj.stats, wToB: instanceWhitesToBlacks};
	

	return {
		rays: JSON.stringify(featuresObj.rays),
		chosen: pieceColor  + chosen, 
		backup: false, 
		minusOneCount: minusOneCount, 
		plusOneCount: plusOneCount, 
		paddings: paddings,
		updowns: JSON.stringify(updowns),
		updownsHoriz: JSON.stringify(updownsHoriz),
		bgToPiece: bgToPiece,
		middleRayLen: middleRayLen
	}




}

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


/*
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
*/

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
*/


/* HELPERS */
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


// Algorithm #2 stuff

function isEmpty(features) {
	//console.log("MEAN: " + _.mean(features))
	return !features || features.length < 3 || _.mean(features) > 0.74;

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

