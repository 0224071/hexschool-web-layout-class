const gulp = require("gulp");
const $ = require("gulp-load-plugins")({ lazy: false });
const autoprefixer = require("autoprefixer");
const minimist = require("minimist");
const browserSync = require("browser-sync").create();
const { envOptions } = require("./envOptions");
const merge = require("merge-stream");

const {
  folders,
  getMultiPageSrcPath,
  getMultiPageDistPath,
} = require("./multiPage");

let options = minimist(process.argv.slice(2), envOptions);
//現在開發狀態
console.log(`Current mode：${options.env}`);

function copyFile() {
  let tasks = folders.map((folder) => {
    return gulp
      .src(getMultiPageSrcPath(envOptions.copyFile.src, folder))
      .pipe(gulp.dest(getMultiPageDistPath(envOptions.copyFile.path, folder)))
      .pipe(
        browserSync.reload({
          stream: true,
        })
      );
  });
  return merge(tasks);
}

function layoutHTML() {
  let tasks = folders.map((folder) => {
    console.log(getMultiPageSrcPath(envOptions.html.src, folder));
    console.log(getMultiPageDistPath(envOptions.html.path, folder));
    return gulp
      .src(getMultiPageSrcPath(envOptions.html.src, folder))
      .pipe($.plumber())
      .pipe($.frontMatter())
      .pipe(
        $.layout((file) => {
          return file.frontMatter;
        })
      )
      .pipe(gulp.dest(getMultiPageDistPath(envOptions.html.path, folder)))
      .pipe(
        browserSync.reload({
          stream: true,
        })
      );
  });
  return merge(tasks);
}

function sass() {
  const plugins = [autoprefixer()];

  let tasks = folders.map((folder) => {
    return gulp
      .src(getMultiPageSrcPath(envOptions.style.src, folder))
      .pipe($.sourcemaps.init())
      .pipe($.sass().on("error", $.sass.logError))
      .pipe($.postcss(plugins))
      .pipe($.sourcemaps.write("."))
      .pipe(gulp.dest(getMultiPageDistPath(envOptions.style.path, folder)))
      .pipe(
        browserSync.reload({
          stream: true,
        })
      );
  });
  return merge(tasks);
}

function babel() {
  let tasks = folders.map((folder) => {
    return gulp
      .src(getMultiPageSrcPath(envOptions.javascript.src, folder))
      .pipe($.sourcemaps.init())
      .pipe(
        $.babel({
          presets: ["@babel/env"],
        })
      )
      .pipe($.concat(envOptions.javascript.concat))
      .pipe($.sourcemaps.write("."))
      .pipe(gulp.dest(getMultiPageDistPath(envOptions.javascript.path, folder)))
      .pipe(
        browserSync.reload({
          stream: true,
        })
      );
  });
  return merge(tasks);
}

function vendorsJs() {
  let tasks = folders.map((folder) => {
    return gulp
      .src(envOptions.vendors.src)
      .pipe($.concat(envOptions.vendors.concat))
      .pipe(gulp.dest(envOptions.vendors.path, folder));
  });
  return merge(tasks);
}

function browser() {
  browserSync.init({
    server: {
      baseDir: envOptions.browserDir,
    },
    port: 8080,
  });
}

function clean() {
  let tasks = folders.map((folder) => {
    return gulp
      .src(getMultiPageDistPath(envOptions.clean.src, folder), {
        read: false,
        allowEmpty: true,
      })
      .pipe($.clean());
  });
  return merge(tasks);
}

function deploy() {
  let tasks = folders.map((folder) => {
    return gulp
      .src(getMultiPageSrcPath(envOptions.deploySrc, folder))
      .pipe($.ghPages());
  });
  return merge(tasks);
}

function watch() {
  folders.forEach((folder) => {
    gulp.watch(
      getMultiPageSrcPath(envOptions.html.src, folder),
      gulp.series(layoutHTML)
    );
  });

  folders.forEach((name) => {
    gulp.watch(
      getMultiPageSrcPath(envOptions.javascript.src, name),
      gulp.series(babel)
    );
  });
  folders.forEach((name) => {
    gulp.watch(
      getMultiPageSrcPath(envOptions.img.src, name),
      gulp.series(copyFile)
    );
  });
  folders.forEach((name) => {
    gulp.watch(
      getMultiPageSrcPath(envOptions.style.src, name),
      gulp.series(sass)
    );
  });
}

exports.deploy = deploy;

exports.clean = clean;

exports.build = gulp.series(
  clean,
  copyFile,
  layoutHTML,
  sass,
  babel,
  vendorsJs
);

exports.default = gulp.series(
  clean,
  copyFile,
  layoutHTML,
  sass,
  babel,
  vendorsJs,
  gulp.parallel(browser, watch)
);
