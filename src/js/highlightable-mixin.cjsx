module.exports =
  highlighte: (e) ->
    if @props.disabled then return e.preventDefault()
    @setState highlight: true

  unhighlighte: (e) ->
    if @props.disabled then return e.preventDefault()
    @setState highlight: false