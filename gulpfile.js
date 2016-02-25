var gulp          = require('gulp'),
	uglify        = require('gulp-uglify'),
	concat        = require('gulp-concat');

var jsPath  = 'js/*.js';

var uglifyConfigs = {
  mangle           : true,
  compress         : {
      drop_console : true
  },
};

gulp.task('build', function(){
  console.log("Minifying JS");
  return gulp.src(jsPath)
    .pipe(uglify(uglifyConfigs))
    .pipe(concat('input-tag.min.js'))
    .pipe(gulp.dest('dist/'));
});