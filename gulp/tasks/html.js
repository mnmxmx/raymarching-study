var gulp   = require('gulp');
var ejs = require("gulp-ejs")
var es = require('event-stream');
var config = require('../../config.js');


gulp.task('html', function() {
  var tasks = config.files.map(function(entry) {

    return gulp.src("./html/index.html")
    .pipe(ejs({
        title: entry
    }))
    .pipe(gulp.dest("./dist/" +  entry))
  });

  // create a merged stream
  return es.merge.apply(null, tasks);
}); 