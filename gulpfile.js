/* eslint-disable */
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const del = require("del");
// const eslint = require("gulp-eslint");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const rename = require("gulp-rename");
const sass = require('gulp-sass')(require('sass'));
const uglifyES = require("gulp-uglify-es").default;
const replace = require("gulp-replace");

const buildPath = "build/";

let watching = true;

const copyPaths = [
  {
    "input": "src/index.html",
    "output": ""
  },
  {
    "input": "src/**/*.html",
    "output": "/"
  },
  {
    "input": "favicon/*.{png,ico,svg,json}",
    "output": "favicon/"
  },
  {
    "input": ["favicon/favicon.ico", "favicon/browserconfig.xml", "favicon/manifest.json"],
    "output": "favicon/"
  },
  {
    "input": "src/images/**/*",
    "output": "images/"
  },
  {
    "input": "src/**/images/**/*",
    "output": ""
  },
  {
    "input": "src/**/css/**/*",
    "output": ""
  },
  {
    "input": "vendor/**/css/**/*.css",
    "output": ""
  },
  {
    "input": "vendor/**/images/**/*",
    "output": ""
  },
  {
    "input": "vendor/**/js/**/*.{js,json}",
    "output": ""
  },
  {
    "input": "vendor/**/webfonts/**/*.{eot,svg,ttf,woff,woff2}",
    "output": ""
  },
  // {
  //   "input": "vendor/**/cmaps/**/*",
  //   "output": ""
  // },
  // {
  //   "input": "vendor/**/locale/**/*",
  //   "output": ""
  // }
];

const scssPath = {
  "input": "src/scss/bootstrap.scss",
  "output": "css/",
  "watch": "src/scss/**/*.scss"
};

const jsSitePath = {
  "input": [
    "./src/js/site.js"
  ],
  "output": "js/"
};

const jsMapPath = {
  "input": [
    "./src/js/florida-state.js",
    "./src/js/florida-counties.js",
    "./src/js/map.js"
  ],
  "output": "js/"
};

const clean = (done) => {
  del.sync(buildPath);
  done();
};

const _copy = (paths, done) => {
  const path = paths.pop();
  if (typeof path === "undefined")
    return done();
  gulp
    .src(path.input)
    .pipe(gulp.dest(buildPath + path.output))
    .on("end", () => {
      _copy(paths, done);
    });
}

const copy = (done) => {
  _copy([...copyPaths], done);
};

sass.compiler = require("node-sass");
const scss = () => gulp.src(scssPath.input)
  .pipe(sass().on("error", sass.logError))
  .pipe(cleanCSS())
  .pipe(rename({
    "suffix": ".min"
  }))
  .pipe(gulp.dest(buildPath + scssPath.output));

const scriptSite = () => gulp.src(jsSitePath.input)
  .pipe(concat("site.min.js"))
  .pipe(gulpif(!watching, uglifyES()))
  .pipe(replace("@BUILDDATE@", (new Date()).toLocaleDateString()))
  .pipe(replace("@BUILDTIME@", (new Date()).toLocaleTimeString()))
  .pipe(gulp.dest(buildPath + jsSitePath.output));

const scriptMap = () => gulp.src(jsMapPath.input)
  .pipe(concat("map.min.js"))
  .pipe(gulpif(!watching, uglifyES()))
  .pipe(replace("@BUILDDATE@", (new Date()).toLocaleDateString()))
  .pipe(replace("@BUILDTIME@", (new Date()).toLocaleTimeString()))
  .pipe(gulp.dest(buildPath + jsMapPath.output));

const watch = (done) => {
  copyPaths.forEach((path) => gulp.watch(path.input, copy));
  gulp.watch(scssPath.watch, scss);
  gulp.watch(jsSitePath.input, scriptSite);
  gulp.watch(jsSitePath.input, scriptMap);
  return done();
};

const production = (done) => {
  watching = false;
  return done();
};

const development = (done) => {
  watching = true;
  return done();
};

exports.clean = gulp.series(clean);

exports.build = gulp.series(production, exports.clean, copy, scriptSite, scriptMap, scss);

exports.watch = gulp.series(development, exports.clean, copy, scriptSite, scriptMap, scss, watch);

exports.default = (done) => {
  // eslint-disable-next-line no-console
  console.log(`\n* * * Available tasks: ${Object.keys(exports)} * * *\n`);
  return done();
};