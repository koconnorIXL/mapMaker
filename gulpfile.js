var gulp = require('gulp');
var react = require('gulp-react');

gulp.task('transpile-js', function() {
  return gulp.src('mapMaker.jsx')
    .pipe(react())
});
