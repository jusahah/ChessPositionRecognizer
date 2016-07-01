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

	getPosition: function(featureVectors) {
		return 'fen1';
	}
}