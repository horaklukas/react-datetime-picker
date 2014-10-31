gulp = require 'gulp'
gutil = require 'gulp-util'
cjsx = require 'gulp-cjsx'
browserify = require 'gulp-browserify'
mocha = require 'gulp-mocha'
stylus = require 'gulp-stylus'
rename = require 'gulp-rename'
nib = require 'nib'

handleError = (e) ->
  gutil.log gutil.colors.red('Error'), e
  @end()

paths =
  cjsx: './src/js/**/*.cjsx'
  js: './src/js/**/*.js'
  styles: './src/css/**/*.styl'
  test: './test/**/*-test.coffee'

gulp.task 'default', ['cjsx', 'browserify', 'stylus']

gulp.task 'cjsx', ->
  gulp.src(paths.cjsx)
    .pipe(cjsx({bare: true}).on('error', handleError))
    .pipe(gulp.dest('./src/js'))

gulp.task 'browserify', ->
  gulp.src('./src/js/datetime-picker.js')
    .pipe(browserify({
      insertGlobals : false
      #insertGlobalVars: ['React']
      debug: 'production'
      standalone: 'DateTimePicker'
    }))
    .pipe(gulp.dest('./dist/'))

gulp.task 'stylus', ->
  gulp.src('./src/css/calendar.styl')
    .pipe(stylus({compress: true, use: [nib()]}).on('error', handleError))
    .pipe(rename('datetime-picker.css'))
    .pipe(gulp.dest('./dist/'))

gulp.task 'test', ->
  # init test variables and environment
  require './test/test-assets'

  mochaOptions =
    reporter: 'spec'
    globals: ['sinon', 'expect', 'mockery']
    bail: true

  gulp.src([paths.test], { read: false })
    .pipe(mocha(mochaOptions).on('error', handleError))

gulp.task 'watch', ->
  gulp.watch paths.cjsx, ['cjsx']
  gulp.watch paths.js, ['browserify']
  gulp.watch paths.styles, ['stylus']
  gulp.watch [paths.test].concat(paths.js), ['test']
