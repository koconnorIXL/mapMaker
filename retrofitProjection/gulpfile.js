var gulp = require('gulp');
var react = require('gulp-react');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');
var watchify = require('watchify');

function transpileJS() {
  // create browserify bundler for converting commonjs into browser-ready js
  var b = browserify({
    cache: {},
    packageCache: {},
    debug: true
  });

  // Wrap the bundler with watchify. This will cause the js to be re-bundled any time
  // any individual js file is modified
  b = watchify(b);

  b.on('update', function() { bundle(b); });

  // add the 'main' js file to be executed
  b.add('./RetrofitProjection.jsx');

  bundle(b);
}

function bundle(b) {
  b
   .transform('reactify')
   .on('file', function(file, id, parent) { console.log(id); })
   .bundle()
   .pipe(source('./RetrofitProjection.jsx'))
   .pipe(gulp.dest('./build'));
}

gulp.task('watch', function() {
  gulp.watch('./*.jsx', function(event) {
    transpileJS(event.path);
  });
});

gulp.task('default', function() {
  transpileJS();
});
