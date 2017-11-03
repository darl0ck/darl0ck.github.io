var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer');
    var uncss = require('gulp-uncss');

gulp.task('autoprefix - плагин', function () {
    return gulp.src('test.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('css/'));
});

var shorthand = require('gulp-shorthand');

gulp.task('shortHand', function () {
    return gulp.src('test.css')
        .pipe(shorthand())
        .pipe(gulp.dest('css/'));
});

let cleanCSS = require('gulp-clean-css');

gulp.task('minify-css', () => {
    return gulp.src('test.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('css/'));
});

var csslint = require('gulp-csslint');

gulp.task('csslint', function() {
    gulp.src('test.css')
        .pipe(csslint())
        .pipe(csslint.formatter())
        .pipe(gulp.dest('css/'));
});
