var gulp = require('gulp');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');


requireDir('./gulp/tasks');


gulp.task('watch', function(){
  gulp.watch('./js/**/*.js', ['js']);
  gulp.watch('./html/**/*.html', ['html']);

});


gulp.task('default', function(){
  runSequence(
    'html',
    'js',
    'browserSync',
    'watch'
  );
});