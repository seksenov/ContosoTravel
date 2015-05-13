var gulp = require('gulp');

// Run this to compress all the things!
gulp.task('production', ['minifyImg', 'minifyCss', 'uglifyJs'], function() {
  return gulp.src('./src/web.config')
  .pipe(gulp.dest('./build'));
});
