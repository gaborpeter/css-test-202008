'use strict';

var gulp 		= require('gulp'),
    sass 		= require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    prefixer    = require('gulp-autoprefixer'),
    cache       = require('gulp-cache'),
    del         = require('del'),
    gulpIf      = require('gulp-if'),
    rigger      = require('gulp-rigger'),
    cssmin      = require('gulp-minify-css'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload;

var isDevelopment = false;


var path = {
    build: {
        html:   'build/',
        js:     'build/js/',
        style:  'build/css/',
        img:    'build/img/',
        fonts:  'build/fonts/'
    },
    src: {
        html:   'src/*.html',
        js:     'src/js/common.js',
        style:  'src/scss/main.scss',
        img:    'src/img/**/*.*',
        fonts:  'src/fonts/**/*.*'
    },
    watch: {
        html:   'src/**/*.html',
        js:     'src/js/*.js',
        style:  'src/scss/**/*.scss',
        img:    'src/img/**/*.*',
        fonts:  'src/fonts/**/*.*'
    },
    clean: 'build/'

};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000
};

gulp.task('html:build', function() {
   gulp.src(path.src.html)
      .pipe(gulp.dest(path.build.html))
      .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(sass({
                outputStyle: 'expanded',
                sourceMap: true,
                errLogToConsole: true
            })
            .on('error', sass.logError))
        .pipe(prefixer())
        .pipe(gulpIf(!isDevelopment, cssmin()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest(path.build.style))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});


gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'fonts:build',
    'style:build',
    'js:build',
    'image:build'
]);

gulp.task('clean', function () {
    return del(path.clean, {force: true});
});

gulp.task('cache', function () {
    return cache.clearAll();
});

gulp.task('watch', function(){
    gulp.watch([path.watch.html], ['html:build']);
    gulp.watch([path.watch.style], ['style:build']);
    gulp.watch([path.watch.js], ['js:build']);
    gulp.watch([path.watch.img], ['image:build']);
    gulp.watch([path.watch.fonts], ['fonts:build']);
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('production', function () {
    gulp.start('build');
});

gulp.task('default', ['build', 'webserver', 'watch']);