var gulp = require('gulp');
var path = require('path');
var del = require('del');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var newer = require('gulp-newer');
var size = require('gulp-size');
var cssnano = require('gulp-cssnano');
var runSequence  = require('run-sequence');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gif = require('gulp-if');
var browserSync = require('browser-sync').create();

var paths = {
  app: 'app/**',
  dest: 'dist',
  scripts: 'app/**/*.js',
  styles: 'app/**/*.scss',
  templates: 'app/**/*.jst',
  tmp: '.tmp'
};

gulp.task('clean', function() {
  return del([
    paths.tmp,
    paths.dest
  ]);
});

gulp.task('copy', function() {
  return gulp.src([
    paths.app,
    '!' + paths.styles,
    '!' + paths.templates,
    '!' + paths.scripts
  ], {
    dot: true,
    nodir: true
  })
  .pipe(gulp.dest(paths.dest))
  .pipe(size({title: 'copy'}));
});

gulp.task('styles', function() {
  return gulp.src([
    'app/main.scss'
  ])
    .pipe(newer(paths.tmp))
    .pipe(sourcemaps.init())
    .pipe(sass({
      precision: 10
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
      ],
      cascade: false
    }))
    .pipe(gulp.dest(paths.tmp))
    .pipe(cssnano())
    .pipe(size({title: 'styles'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dest));
});

var b = browserify('./app/app.js', {
  transform: [
    ['babelify', {
      'presets': ['es2015']
    }],
    ['jstify']
  ],
  debug: true,
  plugin: global.isWatching ? [watchify] : []
});

gulp.task('scripts', function() {
  return b
    .bundle()
    .on('error', function(err) {
      gutil.log('Browserify:', err.toString());
      this.emit('end');
    })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gif(!global.isWatching, uglify()))
    .on('error', function(err) {
      gutil.log('Uglify:', err.toString());
    })
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dest))
    .pipe(gulp.dest(paths.tmp))
});

gulp.task('watching', function() {
  global.isWatching = true;
});

gulp.task('serve', ['watching', 'clean', 'scripts', 'styles'], function() {
  browserSync.init({
    notify: false,
    browser: [],
    server: [paths.tmp, 'app'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], browserSync.reload);
  gulp.watch(['app/**/*.{scss,css}'], ['styles', browserSync.reload]);
  gulp.watch(['app/**/*.{js,jst}'], ['scripts', browserSync.reload]);
});

gulp.task('serve:dist', ['default'], function() {
  browserSync.init({
    notify: false,
    browser: [],
    server: paths.dest,
    port: 3001
  });
});

gulp.task('default', function(cb) {
  return runSequence(
    'clean',
    'styles',
    'scripts',
    'copy',
    cb
  );
});
