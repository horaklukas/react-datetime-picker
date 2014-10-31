#React = require 'react'
TimeCell = require './time-cell'

module.exports = React.createClass
  createTimeCell: (value, type, disabled, maxVal) ->
    <TimeCell value={value} type={type} disabled={disabled} maxVal={maxVal}
      onChange={@props.onTimeChange} />


  render: ->
    hourDisabled = 'h' in @props.disabled
    minDisabled = 'i' in @props.disabled
    secDisabled = 's' in @props.disabled

    <div className="timerow">
      <span className="label">{trl('gui.datetime.timelabel')}:</span>
      <div className="time">
        {@createTimeCell @props.hours, 'hour', hourDisabled, 23}
        <span className="colon">:</span>
        {@createTimeCell @props.mins, 'minute', minDisabled, 59}
        <span className="colon">:</span>
        {@createTimeCell @props.secs, 'second', secDisabled, 59}
      </div>
    </div>