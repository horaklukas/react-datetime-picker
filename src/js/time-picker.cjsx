#React = require 'react'
_ = require 'lodash'
TimeCell = require './time-cell'

module.exports = React.createClass
  createTimeCell: (value, type, maxVal) ->
    <TimeCell value={value} type={type} onChange={@props.onTimeChange}
      maxVal={maxVal} disabled={_.contains @props.disabled, type}  />

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