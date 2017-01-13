var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('build', function (callback) {
  return gulp.src(['./api/**/*.es6'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./api'));
    ;
});

gulp.task('build-test', ['build'], function (callback) {
  return gulp.src(['./test/**/*.es6'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./test'));
    ;
});