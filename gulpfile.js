var gulp = require('gulp');
var react = require('gulp-react');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');

function transpileJS(path) {
  var file = path.split('/').pop();
  console.log(file);
  var bundler = browserify(path);

  var stream = bundler
    .transform(reactify)
    .bundle();

  stream.on('error', function (err) { console.error(err.toString()) });
  return stream
    .pipe(source(file))
    .pipe(gulp.dest('build'));
}

gulp.task('watch', function() {
  gulp.watch('./*.jsx', function(event) {
    transpileJS(event.path);
  });
});
