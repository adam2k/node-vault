'use strict';

const path = require('path');
const gulp = require('gulp');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const babel = require('gulp-babel');

gulp.task('nsp', (cb) => {
  nsp({ package: path.resolve('package.json') }, cb);
});

const eslint = require('gulp-eslint');

gulp.task('lint', () => gulp.src([
  '**/*.js',
  '!node_modules/**',
  '!coverage/**',
  '!logs/**',
  '!dist/**',
]).pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
);

gulp.task('pre-test', () => gulp.src('src/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul({
      includeUntested: true,
    }))
    .pipe(istanbul.hookRequire())
);

gulp.task('transpile', () => gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(concat('script.js'))
    .pipe(gulp.dest('dist'))
);

gulp.task('test', ['lint', 'pre-test'], (cb) => {
  let mochaErr;

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', (err) => {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', () => {
      cb(mochaErr);
    });
});

gulp.task('watch', () => {
  gulp.watch(['service/**/*.js', 'test/**'], ['test']);
});

gulp.task('build', ['test', 'transpile']);

gulp.task('prepublish', ['nsp']);
gulp.task('default', ['test']);
