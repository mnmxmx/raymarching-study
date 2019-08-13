var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browserSync', function(){
  browserSync({
    open: 'external',
    reloadDebounce: 2000,
    ui: false,
    notify: false,
    startPath: "/",
    ghostMode: false,
    server: {
      baseDir: "dist/"
    },
    files: [
      "dist/**/*.obj",

      "dist/**/*.json",
      "dist/**/*.xml",

      "dist/**/*.mp4",
      "dist/**/*.webm",
      "dist/**/*.mp3",

      "dist/**/*.png",
      "dist/**/*.jpg",
      "dist/**/*.gif",
      "dist/**/*.svg",

      "dist/**/*.frag",
      "dist/**/*.vert",

      "dist/**/*.html",
      "dist/**/*.css",
      "dist/**/*.js"
    ]
  });
});