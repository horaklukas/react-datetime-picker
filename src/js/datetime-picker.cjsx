#React = require 'react'
FullCalendar = require './calendar'
TimePicker = require './time-picker'
Navigation = require './month-year-navigation'
moment = require 'moment'
classSet = require 'react/lib/cx'

module.exports = React.createClass
  propTypes:
    visible: React.PropTypes.bool
    disabled: React.PropTypes.array

  ###*
  * Invoked when day at calendar is selected
  *
  * @param {Date|string} unit New date or unit (y, M) to add/substract
  * @param {string=} operation Subtract or add
  ###
  handleDateChange: (unit, operation) ->
    {actualDate} = @state

    # dont touch time values
    if moment.isMoment unit
      nextDate = unit.hours actualDate.hours()
      nextDate.minutes actualDate.minutes()
      nextDate.seconds actualDate.seconds()
    else
      nextDate = actualDate[operation](1, unit)

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
    if @props.onDateConfirm?
      @props.onDateConfirm @state.actualDate.toDate()

  getInitialState: ->
    actualDate: moment(new Date)

  getDefaultProps: ->
    visible: true
    disabled: []

  render: ->
    {actualDate} = @state
    month = moment.months actualDate.month()
    year = actualDate.year()
    hours = actualDate.hours()
    mins = actualDate.minutes()
    secs = actualDate.seconds()
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
      <Navigation disabled={@props.disabled}
        onMonthYearChange={@handleDateChange} />
      <FullCalendar date={actualDate}
        disabled={'d' in @props.disabled}
        onDaySelect={@handleDateChange} />
      <TimePicker hours={hours} mins={mins} secs={secs}
        disabled={@props.disabled}
        onTimeChange={@handleTimeChange} />

      <button className="confirm"onClick={@handleConfirm}>
        Set date
      </button>
    </div>