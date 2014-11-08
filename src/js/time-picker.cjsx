#React = require 'react'
TimeCell = require './time-cell'

module.exports = React.createClass
  createTimeCell: (value, type, maxVal) ->
    <TimeCell value={value} type={type} disabled={type in @props.disabled}
      maxVal={maxVal} onChange={@props.onTimeChange} />

  render: ->
    <div className="timerow">
      <span className="label">Time:</span>
      <div className="time">
        {@createTimeCell @props.hours, 'h', 23}
        <span className="colon">:</span>
        {@createTimeCell @props.mins, 'm', 59}
        <span className="colon">:</span>
        {@createTimeCell @props.secs, 's', 59}
      </div>
    </div>