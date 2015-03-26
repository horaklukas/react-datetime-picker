module.exports = function() {
  var path2styl;
  path2styl = __dirname + '/src/styl';

  return function (renderer) {
    renderer.include(path2styl);
  };
}