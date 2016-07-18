var gulp = require('gulp');

// This gulp script allows to scaffold classifiers
// usage cmd line: 'gulp classifier --name MyNewClassifier'

gulp.task('classifier', function() {
  // place code for your default task here
  gulp.src([
  	'classifier_template/**/*'
  ]).pipe(gulp.dest('classifiers/' + process.argv.slice()[4]));

});