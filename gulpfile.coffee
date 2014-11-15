gulp = require 'gulp'
gutil = require 'gulp-util'
cjsx = require 'gulp-cjsx'
browserify = require 'gulp-browserify'
mocha = require 'gulp-mocha'
istanbul = require 'gulp-istanbul'
stylus = require 'gulp-stylus'
rename = require 'gulp-rename'
nib = require 'nib'
connect = require 'gulp-connect'
_ = require 'lodash'

handleError = (e, cb) ->
  gutil.log gutil.colors.red('Error'), e
  @end()
  cb?()

paths =
  cjsx: './src/js/**/*.cjsx'
  js: './src/js/**/*.js'
  mainJs: './src/js/datetime-picker.js'
  styl: './src/css/**/*.styl'
  mainStyl: './src/css/datetime-picker.styl'
  test: './test/**/*-test.coffee'
  dist: './dist'

mochaOptions =
  reporter: 'spec'
  globals: ['sinon', 'expect', 'mockery']
  bail: true

gulp.task 'default', ['cjsx', 'browserify', 'stylus']

gulp.task 'cjsx', ->
  gulp.src(paths.cjsx)
    .pipe(cjsx({bare: true}).on('error', handleError))
    .pipe(gulp.dest('./src/js'))

gulp.task 'browserify', ->
  gulp.src(paths.mainJs)
    .pipe(browserify({
      insertGlobals : false
      #insertGlobalVars: ['React']
      debug: 'production'
      standalone: 'DateTimePicker'
    }))
    .pipe(gulp.dest(paths.dist))
    .pipe(connect.reload())

gulp.task 'stylus', ->
  gulp.src(paths.mainStyl)
    .pipe(stylus({compress: true, use: [nib()]}).on('error', handleError))
    .pipe(gulp.dest(paths.dist))
    .pipe(connect.reload())

gulp.task 'connect', ->
  connect.server {
    root: 'src'
    livereload: true
  }

gulp.task 'test', (cb) ->
  # init test variables and environment
  require './test/test-assets'

  gulp.src(paths.js)
    .pipe istanbul(includeUntested: true) # Covering files
    .on 'finish', ->
      gulp.src([paths.test], {read: false})
        .pipe mocha(mochaOptions).on('error', _.partialRight(handleError, cb))
        .pipe istanbul.writeReports() # Creating the reports after tests runned
        .on 'end', cb
  # this return is neccessary to prevent error from gulp orchestrator
  # see https://github.com/SBoudrias/gulp-istanbul/issues/22
  return

gulp.task 'watch', ['connect'], ->
  gulp.watch paths.cjsx, ['cjsx']
  gulp.watch paths.js, ['browserify']
  gulp.watch paths.styl, ['stylus']
  gulp.watch [paths.test].concat(paths.js), ['test']
