#React = require 'react'
classSet = require 'react/lib/cx'
domEvents = require 'dom-events'

module.exports = TimeCell = React.createClass
  statics:
    delayBeforeStart: 1000
    incrementSpeed: 100

  _startTimer: null
  _incrementTimer: null

  handleMouseDown: (e) ->
    #if @props.disabled is true then return e.preventDefault()
    @setState active: true

    domEvents.once document, 'mouseup', @handleMouseUp
    @_startTimer = setTimeout @startIncrementing, TimeCell.delayBeforeStart

  clearStartTimer: ->
    clearTimeout @_startTimer
    @_startTimer = null

  startIncrementing: ->
    @clearStartTimer()
    @_incrementTimer = setInterval @incrementValue, TimeCell.incrementSpeed

  handleMouseUp: ->
    # if mouse button released before value incrementing start reject increment
    # start timer, otherwise if incrementing is running, stop it
    if @_startTimer? then @clearStartTimer()
    else if @_incrementTimer?
      clearInterval @_incrementTimer
      @_incrementTimer = null

    @setState active: false

  incrementValue: (e) ->
    #if @props.disabled is true then return e.preventDefault()

    value = @state.value + 1
    # when value is at its max value, it starts again from zero
    value = 0 if value > @props.maxVal

    @props.onChange @props.type, value

  componentWillReceiveProps: (nextProps) ->
    if nextProps.value? then @setState value: nextProps.value

  getInitialState: ->
    value: @props.value
    active: false

  render: ->
    classes = classSet {
      'value': true
      'disabled': @props.disabled
      'highlightable': not @props.disabled
      'active': @state.active
    }

    value = @state.value.toString()
    if value.length is 1 then value = "0#{value}"

    unless @props.disabled
      clickCb = @incrementValue
      mouseDownCb = @handleMouseDown

    <span className={classes} onClick={clickCb} onMouseDown={mouseDownCb}>
      {value}
    </span>