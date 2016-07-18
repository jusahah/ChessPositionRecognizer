var Promise = require('bluebird');
var _ = require('lodash');
var Chess = require('chess.js').Chess;


module.exports = function(featureVectors) {
	console.log(featureVectors);

	return new Promise(function(resolve, reject) {
		var matches = _.mapValues(featureVectors, function(featuresObj) {
			return resolveBestMatch(featuresObj);
		});
		
		console.log("MATCHES");
		console.log(matches);
		
		return resolve(resolveFen(matches));
		
	});

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



function resolveBestMatch(featuresObj) {
	console.log("FEAT");
	console.log(featuresObj);
	var chosen = '?';

	if (isEmpty(featuresObj.raysPerPixel)) {
		return {matches: 0, exemplar: 'e', chosen: 'e', matchPerc: 1, isEmpty: true};
	}	

	if (featuresObj.stats.pieceWidth < 0.65) {
		// Pawn, Rook, Bishop
		if (featuresObj.stats.deviation > 0.20) chosen = 'p';
		else {
			if (featuresObj.stats.deviation < 0.05) chosen = 'r';
			else chosen = 'b';
		}

	} else {
		// King, Queen, Knight
		if (featuresObj.stats.deviation < 0.13) chosen = 'k';
		else {
			if (featuresObj.stats.eightAvgs[0] > featuresObj.stats.eightAvgs[1]) chosen = 'n';
			else chosen = 'q';
		}

	}

	var pieceColor = featuresObj.wToB < 2.95 ? 'b' : 'w';
	if (isPawn(featuresObj)) {

		pieceColor = featuresObj.wToB < 3.75 ? 'b' : 'w';	
	}

	function isPawn(featuresObj) {
		return featuresObj.stats.deviation > 0.20;
	}
	
	

	return {chosen: pieceColor + chosen, /*stats: featuresObj.stats,*/ wToB: featuresObj.wToB};

}



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

