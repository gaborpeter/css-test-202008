// core
const gulp = require('gulp');

// scripts
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

// styles
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const postcss = require('gulp-postcss');

// plugins
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');

// tasks

// Images
gulp.task('img', function () {
  return gulp.src('develop/img/**/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('build/img'));
});

gulp.task('clear', function (callback) {
  return cache.clearAll();
})

gulp.task('serve',  function (done) {
  browserSync.init({
    server: {
      baseDir: "build",
      index: "index.html"
    },
    browser: "chrome"
  });
  done();
});


gulp.task('scripts', function () {
  return gulp.src('develop/js/*.js')
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
});

gulp.task('styles', function () {

  return gulp.src('develop/sass/style.scss')
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(browserSync.stream())
    .pipe(gulp.dest('build/css'));
});

gulp.task('serve-html', function () {

  return gulp.src('develop/*.html')
  .pipe(browserSync.stream())
    .pipe(gulp.dest('build/'));
    
});


gulp.task('automate', function () {
  gulp.watch(['develop/*.html', 'develop/sass/*.scss', 'develop/js/*.js'], gulp.series('scripts', 'styles', 'serve-html', 'img'));
  gulp.watch('develop/*.html', browserSync.reload);
  gulp.watch('develop/js/**/*.js', browserSync.reload);
});

gulp.task('default', gulp.series('scripts', 'styles', 'serve', 'automate', 'serve-html', 'img'));