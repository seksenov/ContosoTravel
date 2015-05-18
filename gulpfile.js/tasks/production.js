var gulp = require('gulp');

// Run this to compress all the things!
gulp.task('production', ['minifyImg', 'minifyCss', 'uglifyJs', 'webconfig', 'manifest']);


gulp.task('webconfig', function() {
  return gulp.src('./src/web.config')
  .pipe(gulp.dest('./build'));
});

gulp.task('manifest', function() {
  return gulp.src('./src/manifest.json')
  .pipe(gulp.dest('./build'));
});
