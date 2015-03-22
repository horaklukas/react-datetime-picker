React = require 'react'
Spinner = require './spinner'

module.exports = React.createClass
  incrementValue: (increment) ->
    value = @state.value + increment
    # when value is at its max value, it starts again from zero
    value = 0 if value > @props.maxVal
    value = @props.maxVal if value < 0

    @props.onChange @props.type, value

  componentWillReceiveProps: (nextProps) ->
    if nextProps.value? and nextProps.value isnt @props.value
      @setState value: nextProps.value

  getInitialState: ->
    value: @props.value

  render: ->
    classes = 'time-cell'
    classes += ' disabled' if @props.disabled
    classes += ' highlightable' if not @props.disabled

    value = @state.value.toString()
    if value.length is 1 then value = "0#{value}"

    changeCb = @incrementValue unless @props.disabled

    <div className={classes}>
      <span className="value">
        {value}
      </span>
      <div className="spinners">
        <Spinner type="up" increment={1} changeValue={changeCb} />
        <Spinner type="down" increment={-1} changeValue={changeCb} />
      </div>
    </div>

