var gulp = require('gulp');

gulp.task('classifier', function() {
  // place code for your default task here
  gulp.src([
  	'classifier_template/**/*'
  ]).pipe(gulp.dest('classifiers/testiclassifier'));

});