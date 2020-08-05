var gulp = require("gulp"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  babel = require("gulp-babel"),
  minifyCSS = require("gulp-minify-css"),
  sass = require("gulp-sass"),
  htmlmin = require("gulp-htmlmin"),
  clean = require("gulp-clean"),
  autoprefixer = require("gulp-autoprefixer"),
  image = require("gulp-image"),
  webp = require("gulp-webp"),
  connect = require("gulp-connect"),
  hash = require("gulp-hash-filename"),
  rename = require("gulp-rename"),
  htmlreplace = require("gulp-html-replace"),
  fs = require("fs"),
  open = require("gulp-open");

var hashedCSS;

gulp.task("image-to-webp", () =>
  gulp
    .src("./src/img/*")
    .pipe(webp())
    .pipe(gulp.dest("./build/img"))
);

gulp.task("image-min", () =>
  gulp
    .src("./src/img/*")
    .pipe(image())
    .pipe(gulp.dest("./build/img"))
    .pipe(connect.reload())
);

gulp.task("compile-sass", function() {
  return gulp
    .src([
      "node_modules/bootstrap/scss/bootstrap-reboot.scss",
      "node_modules/bootstrap/scss/bootstrap-grid.scss",
      "./src/scss/*.scss"
    ])
    .pipe(sass())
    .pipe(concat("style.css"))
    .pipe(gulp.dest("./src/css/"));
});

gulp.task("minify-css", function() {
  return gulp
    .src([
      "./src/css/*.css"
    ])
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(concat("style.css"))
    .pipe(minifyCSS())
    .pipe(
      hash({
        format: "{name}-{hash:8}{ext}"
      })
    )
    .pipe(
      rename(function(path) {
        path.basename += ".min";
        hashedCSS = "./build/css/" + path.basename + ".css";
      })
    )
    .pipe(gulp.dest("./build/css"))
    .pipe(connect.reload());
});

function foo(folder, enconding) {
  return new Promise(function(resolve, reject) {
    fs.readdir(folder, enconding, function(err, filenames) {
      if (err) reject(err);
      else resolve(filenames);
    });
  });
}

const getCssPath = async () => {
  var cssPath;
  await foo("./css/").then(
    files => (cssPath = "/css/" + files.filter(el => /\.min.css$/.test(el)))
  );
  return cssPath;
};

gulp.task("minifyhtml", function() {
  return gulp
    .src(["./src/*.html"])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      htmlreplace({
        css: hashedCSS ? hashedCSS : getCssPath()
      })
    )
    .pipe(gulp.dest("./"))
    .pipe(connect.reload());
});


gulp.task("copy-fonts", function() {
  return gulp.src(["./src/fonts/*"]).pipe(gulp.dest("./build/fonts/"));
});

// Чистим директорию назначения и делаем ребилд, чтобы удаленные из проекта файлы не остались
gulp.task("clean", function() {
  return gulp
    .src(["./src/css/style.css"], { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task("clean-old-css", function() {
  return gulp.src(["./css"], { read: false, allowEmpty: true }).pipe(clean());
});

gulp.task("connect", function() {
  var server = connect.server({
    root: "./",
    livereload: true
  });

  return gulp.src("./").pipe(
    open({
      uri: "http://" + server.host + ":" + server.port
    })
  );
});

function watchFiles() {
  gulp.watch(
    "./src/scss/*.scss",
    gulp.series([
      "clean-old-css",
      "compile-sass",
      "minify-css",
      "clean",
      "minifyhtml"
    ])
  );
  gulp.watch("./src/*.html", gulp.series(["minifyhtml"]));
 
  gulp.watch(
    "./src/img/*",
    gulp.series(["image-to-webp", "image-min"])
  );
}

const build = gulp.series(
  "clean-old-css",
  "compile-sass",
  "minify-css",
  "minifyhtml",
  "clean",
  "copy-fonts",
  "image-to-webp",
  "image-min"
);

const min_images = gulp.series("image-min", "image-to-webp");
const watch = gulp.parallel("connect", watchFiles);

exports.build = build;
exports.default = gulp.series(build, watch);
exports.min_images = min_images;
