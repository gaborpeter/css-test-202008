let projectFolder = 'dist';
let sourceFolder = 'src';
let sourceSprite = 'src/spritesrc';
let dev = true;

//константы путей
let path = {
    build: {
        html: projectFolder + '/',
        css: projectFolder + '/css/',
        js: projectFolder + '/js/',
        img: projectFolder + '/img/',
        sprite: projectFolder + '/img/sprite/',
        fonts: projectFolder + '/fonts/',
    },
    src: {
        html: [sourceFolder + '/*.html', '!' + sourceFolder + '/**/_*.html'],
        css: sourceFolder + '/scss/style.scss',
        js: sourceFolder + '/js/custom.js',
        img: [
            sourceFolder + '/img/**/*.{jpg,png,gif,svg,ico,webp}',
            '!' + sourceFolder + '/img/sprite/*.svg',
        ],
        sprite: sourceFolder + '/img/sprite/*.svg',
        fonts: sourceFolder + '/fonts/*.ttf',
    },
    watch: {
        html: sourceFolder + '/**/*.html',
        css: sourceFolder + '/scss/**/*.scss',
        js: sourceFolder + '/js/**/*.js',
        img: sourceFolder + '/img/**/*.{jpg,png,gif,svg,ico,webp}',
    },
    clean: './' + projectFolder + '/',
};

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileInclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    groupQueries = require('gulp-group-css-media-queries'),
    cleanCss = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    imageMin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webpHtml = require('gulp-webp-html'),
    webpCss = require('gulp-webpcss'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    gulpif = require('gulp-if'),
    plumber = require('gulp-plumber'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2');

//автообновление
function browserSync() {
    browsersync.init({
        server: {
            baseDir: './' + projectFolder + '/',
            port: 3000,
            notify: false,
        },
    });
}

//работа с html
function html() {
    return src(path.src.html)
        .pipe(plumber())
        .pipe(fileInclude())
        .pipe(webpHtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

//работа с js
function js() {
    return src([
        // 'node_modules/jquery/dist/jquery.min.js', // Optional jQuery (npm i --save-dev jquery)
        // JS библиотеки, добавляем нужные
        'src/js/lib/alert.js',
        // 'src/js/lib/svg4everybody.js',
        path.src.js, //  всегда в конце
    ])
        .pipe(plumber())
        .pipe(gulpif(dev, sourcemaps.init()))
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(concat('script.js'))
        .pipe(gulpif(!dev, uglify()))
        .pipe(gulpif(dev, sourcemaps.write('.')))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

//работа с scss
function css() {
    return src(path.src.css)
        .pipe(gulpif(dev, sourcemaps.init()))
        .pipe(plumber())
        .pipe(
            scss({
                outputStyle: 'expanded',
            })
        )
        .pipe(gulpif(!dev, groupQueries()))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 10 versions'],
                cascade: true,
            })
        )
        .pipe(webpCss({}))
        .pipe(gulpif(!dev, cleanCss({ level: { 1: { specialComments: 0 } } })))
        .pipe(gulpif(dev, sourcemaps.write('.')))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

//работа с изображениями
function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70,
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imageMin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizatioLevel: 3,
            })
        )
        .pipe(dest(path.build.img))
        .pipe(copysprite())
        .pipe(browsersync.stream());
}

//шрифты
function fonts() {
    src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
    return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function copysprite() {
    return src(path.src.sprite)
        .pipe(dest(path.build.sprite))
        .pipe(browsersync.stream());
}

//svg sprite
gulp.task('svgsprite', function () {
    return gulp
        .src([sourceSprite + '/iconsprite/*.svg'])
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../sprite/sprite.svg',
                        example: true,
                    },
                },
            })
        )
        .pipe(dest('src/img'));
});

// svg sprite + css
gulp.task('svg', function () {
    return (
        gulp
            .src([sourceSprite + '/spritecss/*.svg'])
            // минифиуация svg
            .pipe(
                svgmin({
                    js2svg: {
                        pretty: true,
                    },
                })
            )
            //удаление всех fill, style и stroke в файлах
            .pipe(
                cheerio({
                    run: function ($) {
                        $('[fill]').removeAttr('fill');
                        $('[stroke]').removeAttr('stroke');
                        $('[style]').removeAttr('style');
                    },
                    parserOptions: { xmlMode: true },
                })
            )
            .pipe(replace('&gt;', '>'))
            .pipe(
                svgSprite({
                    mode: {
                        symbol: {
                            sprite: '../sprite/sprite1.svg',
                            render: {
                                scss: {
                                    dest: '../../scss/_sprite.scss',
                                    template:
                                        'src/scss/templates/_sprite_template.scss',
                                },
                            },
                            example: true,
                        },
                    },
                })
            )
            .pipe(dest('src/img'))
    );
});

//слежение за файлами
function watchFile() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

//удаление папки dist
function clean() {
    return del(path.clean);
}

//финальная сборка
gulp.task('prod', function (done) {
    dev = false;
    develop();
    done();
});

let develop = gulp.series(clean, gulp.parallel(images, js, css, html, fonts));
let watch = gulp.parallel(develop, watchFile, browserSync);

exports.default = watch;
