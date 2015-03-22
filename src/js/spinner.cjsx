React = require 'react'
domEvents = if window? then require 'dom-events' else {once: ->}

###*
* @const Delay before between hold spinner down and start changing value
###
DELAY_BEFORE_START = 500
###*
* @const Frequence of changin value when holds down the spinner
###
INCREMENT_SPEED = 100

module.exports = React.createClass
  _startTimer: null
  _incrementTimer: null

  handleMouseDown: (e) ->
    domEvents.once document, 'mouseup', @handleMouseUp
    @_startTimer = setTimeout @startIncrementing, DELAY_BEFORE_START

  clearStartTimer: ->
    clearTimeout @_startTimer
    @_startTimer = null

  startIncrementing: ->
    @clearStartTimer()
    @_incrementTimer = setInterval @handleChangeValue, INCREMENT_SPEED

  handleMouseUp: ->
    # if mouse button released before value incrementing start reject increment
    # start timer, otherwise if incrementing is running, stop it
    if @_startTimer? then @clearStartTimer()
    else if @_incrementTimer?
      clearInterval @_incrementTimer
      @_incrementTimer = null

  handleChangeValue: ->
    @props.changeValue? @props.increment

  render: ->
    clss = "spinner #{@props.type}"

    if @props.changeValue?
      handleClick = @handleChangeValue
      handleMouseDown = @handleMouseDown

    <div className={clss} onClick={handleClick} onMouseDown={handleMouseDown}>
      <div className="arrow" />
    </div>