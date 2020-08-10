'use strict';

const gulp = require("gulp"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer =  require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    concat = require("gulp-concat"),
    browserSync = require("browser-sync").create();

let paths = {
    styles: {
       src: "scss/*.scss",
       dest: "css/"
    }
};

function style() {
    return gulp
        .src(paths.styles.src)
            .pipe(sourcemaps.init())
            .pipe(sass())
            .on("error", sass.logError)
            .pipe(concat('main.min.css'))
            // Use postcss with autoprefixer and compress the compiled file using cssnano
            .pipe(postcss([autoprefixer(), cssnano()]))
            // Now add/write the sourcemaps
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(paths.styles.dest))
            // Add browsersync stream pipe after compilation
            .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        proxy: "http://test-task1",
        host: 'test-task1',
        open: "external",
        notify: false,
        browser: "chrome"
    });
    gulp.watch(paths.styles.src, style);
    gulp.watch('index.html').on("change", browserSync.reload);
}
exports.style = style;
exports.watch = watch;

var build = gulp.series(style, watch);

gulp.task('build', build);

gulp.task('default', build);

