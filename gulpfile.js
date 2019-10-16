'use strict';

var gulp = require('gulp');
var del = require('del');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var rename = require('gulp-rename');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var mozjpeg = require('imagemin-mozjpeg');
var svgstore = require('gulp-svgstore');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso');

var uglify = require('gulp-terser');

var pug = require('gulp-pug');
var prettier = require('gulp-pretty-html');

var server = require('browser-sync').create();

gulp.task('clean', function() {
  return del('build');
});

gulp.task('copy', function() {
  return gulp.src([
      'src/fonts/**/*.{woff,woff2}'
    ], {
      base: 'src'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('images', function () {
  return gulp.src([
      'src/img/**/*.{png,jpg,svg}',
      '!src/img/sprite/*.svg'
    ])
    .pipe(newer('build/img'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('images:min', function () {
  return gulp.src([
      'build/img/**/*.{png,jpg,svg}',
      '!build/img/sprite.svg'
    ])
    .pipe(imagemin([
      pngquant({
        speed: 1,
        quality: [0.7, 0.9]
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      mozjpeg({
        quality: 90
      }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: false
        }]
      })
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('sprite', function() {
  return gulp.src('src/img/sprite/*.svg')
    .pipe(newer('build/img'))
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [{
          removeViewBox: false
        }]
      })
    ]))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('style', function () {
  return gulp.src('src/sass/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('style:min', function () {
  return gulp.src('build/css/style.min.css')
    .pipe(plumber())
    .pipe(minify())
    .pipe(gulp.dest('build/css'));
});

gulp.task('scripts:vendor', function() {
  return gulp.src([
      'src/js/vendor/*.js'
    ])
  .pipe(plumber())
  .pipe(concat('vendor.js'))
  .pipe(gulp.dest('build/js'))
  .pipe(uglify())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('build/js'));
});

gulp.task('scripts', function() {
  return gulp.src([
      'src/js/global/*.js',
      'src/js/spa/*.js',
      'src/js/modules/*.js',

    ])
  .pipe(plumber())
  .pipe(concat('script.js'))
  .pipe(gulp.dest('build/js'))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('build/js'));
});

gulp.task('scripts:min', function() {
  return gulp.src([
      'build/js/script.min.js'
    ])
  .pipe(plumber())
  .pipe(uglify())
  .pipe(gulp.dest('build/js'));
});

gulp.task('html', function () {
  return gulp.src('src/*.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(prettier({
      indent_size: 2,
      indent_char: ' '
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'images',
  'images:min',
  'sprite',
  'style',
  'style:min',
  'scripts:vendor',
  'scripts',
  'scripts:min',
  'html'
));

gulp.task('dev', gulp.series(
  'clean',
  'copy',
  'images',
  'sprite',
  'style',
  'scripts:vendor',
  'scripts',
  'html'
));

gulp.task('serve', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('src/img/**/*', gulp.series('images', 'sprite', 'refresh'));
  gulp.watch('src/sass/**/*.scss', gulp.series('style'));
  gulp.watch('src/js/**/*.js', gulp.series('scripts', 'refresh'));
  gulp.watch('src/**/*.pug', gulp.series('html', 'refresh'));
});

gulp.task('start', gulp.series('build', 'serve'));
