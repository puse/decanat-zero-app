var stream  = require('vinyl-source-stream'),
    buffer  = require('vinyl-buffer');

var builder = require('browserify');

var gulp    = require('gulp'),
    jshint  = require('gulp-jshint'),
    phantom = require('gulp-mocha-phantomjs'),
    uglify  = require('gulp-uglify'),
    size    = require('gulp-size');

var source  = './lib/view.js',
    dest    = './dist/';

// Quality Analysis
// ----------------

gulp.task('qualify', ['lint', 'test']);
// Lint with JSHint

gulp.task('lint', function(){
    gulp.src('./lib/**/*.js')
        .pipe(jshint());
});

gulp.task('test', ['build'], function(){
    gulp.src('test/index.html')
        .pipe(phantom());
});

// Compile JavaScript

gulp.task('build', function(){

    var bndl = builder('./index.js').bundle({ debug: true });

    bndl.pipe(stream('bundle.js'))
        .pipe(buffer())
        // .pipe(uglify())
        .pipe(gulp.dest('./dist/'))
        .pipe(size());
});

gulp.task('watch', function(){
    gulp.watch('./lib/**/*.js', ['build', 'test']);
});