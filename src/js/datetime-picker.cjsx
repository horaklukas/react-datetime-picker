#React = require 'react'
FullCalendar = require './calendar'
TimePicker = require './time-picker'
moment = require 'moment'
classSet = require 'react/lib/cx'

module.exports = React.createClass
  propTypes:
    visible: React.PropTypes.bool
    disabled: React.PropTypes.array

  ###*
  * Invoked when day at calendar is selected
  *
  * @param {number} day Which day was selected
  ###
  handleDateChange: (day, month, year) ->
    nextDate = @state.actualDate

    if day? then nextDate.setDate day
    if month? then nextDate.setMonth month
    if year? then nextDate.setFullYear year

    @setState actualDate: nextDate

  ###*
  *
  * @param {string} type
  * @param {number} value
  ###
  handleTimeChange: (type, value) ->
    nextDate = @state.actualDate

    switch type
      when 'hour' then nextDate.setHours value
      when 'minute' then nextDate.setMinutes value
      when 'second' then nextDate.setSeconds value

    @setState nextDate

  handleConfirm: ->
    if @props.onDateConfirm? then @props.onDateConfirm @state.actualDate

  getInitialState: ->
    actualDate: new Date

  getDefaultProps: ->
    visible: true
    disabled: []

  render: ->
    {actualDate} = @state
    month = moment.months actualDate.getMonth()
    year = actualDate.getFullYear().toString()
    hours = actualDate.getHours()
    mins = actualDate.getMinutes()
    secs = actualDate.getSeconds()
    moment()
    pickerClasses = classSet {
      'datetime-picker': true
      'visible': !!@props.visible
    }

    if @props.onClose?
      Closer = <span className="closer" onClick={@props.onClose}>x</span>

    <div className={pickerClasses}>
      <div className="head">
        <span className="title">{month} - {year}</span>
        {Closer}
      </div>
      <FullCalendar date={@state.actualDate}
        disabled={@props.disabled}
        onDaySelect={@handleDateChange}
        onMonthYearChange={@handleDateChange.bind(this, null)} />
      <TimePicker hours={hours} mins={mins} secs={secs}
        disabled={@props.disabled}
        onTimeChange={@handleTimeChange} />

      <button className="confirm"onClick={@handleConfirm}>
        Set date
      </button>
    </div>