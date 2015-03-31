gulp = require 'gulp'
gutil = require 'gulp-util'
cjsx = require 'gulp-cjsx'
browserify = require 'browserify'
transform = require 'vinyl-transform'
uglify = require 'gulp-uglify'
mocha = require 'gulp-mocha'
istanbul = require 'gulp-istanbul'
stylus = require 'gulp-stylus'
rename = require 'gulp-rename'
nib = require 'nib'
connect = require 'gulp-connect'
_partialRight = require 'lodash.partialright'
yargs = require('yargs').argv

handleError = (e, cb) ->
  gutil.log gutil.colors.red('Error'), e
  @end()
  cb?()

paths =
  cjsx:
    src: './src/js/**/*.cjsx'
    dist: './src/js'
  js:
    src: './src/js/**/*.js'
    dist: './src/js/datetime-picker.js'
  styl:
    src:'./src/styl/**/*.styl'
    main: './src/styl/*.styl'
  test: './test/**/*-test.coffee'
  dist: './dist'

mochaOptions =
  reporter: 'spec'
  globals: ['sinon', 'expect', 'mockery']
  bail: true

gulp.task 'default', ['cjsx', 'browserify', 'stylus']

gulp.task 'cjsx', ->
  gulp.src(paths.cjsx.src)
    .pipe(cjsx({bare: true}).on('error', handleError))
    .pipe(gulp.dest(paths.cjsx.dist))

gulp.task 'browserify', ->
  # gulp-browserify is blacklisted, use natural browserify
  # https://medium.com/@sogko/gulp-browserify-the-gulp-y-way-bb359b3f9623
  browserified = transform (filename) ->
    b = browserify {
      entries: [filename]
      insertGlobals : false
      debug: !yargs.production
      standalone: 'DateTimePicker'
    }
    b.transform 'browserify-shim'
    b.bundle().on 'error', handleError


  gulp.src([paths.js.dist])
    .pipe(browserified)
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist))
    .pipe(connect.reload())

gulp.task 'stylus', ->
  gulp.src(paths.styl.main)
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

  gulp.src(paths.js.src)
    .pipe istanbul(includeUntested: true) # Covering files
    .on 'finish', ->
      gulp.src([paths.test], {read: false})
        .pipe mocha(mochaOptions).on('error', _partialRight(handleError, cb))
        .pipe istanbul.writeReports() # Creating the reports after tests runned
        .on 'end', cb
  # this return is neccessary to prevent error from gulp orchestrator
  # see https://github.com/SBoudrias/gulp-istanbul/issues/22
  return

gulp.task 'watch', ['connect'], ->
  gulp.watch paths.cjsx.src, ['cjsx']
  # gulp.watch paths.js.src, ['browserify']
  gulp.watch paths.styl.src, ['stylus']
  gulp.watch [paths.test].concat(paths.js.src), ['test']
