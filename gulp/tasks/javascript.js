var gulp = require("gulp");
var babelify = require('babelify');
var stringify = require('stringify');

var browserify = require("browserify");
var source = require("vinyl-source-stream");
var rename = require('gulp-rename');
var es = require('event-stream');
var config = require('../../config.js');


gulp.task("js", function(){

    var tasks = config.files.map(function(entry) {
    var path = './js/' + entry + '/main.js';
    return browserify({ entries: [path] })
        .transform(stringify, {
          appliesTo: { includeExtensions: ['.vert', '.frag'] }
        })
        .transform(babelify.configure({
          presets: ["@babel/preset-env"]
        }))
        .bundle()
        .pipe(source("main.min.js"))
        .pipe(gulp.dest('./dist/' + entry));
    });

    // create a merged stream
    return es.merge.apply(null, tasks);
});