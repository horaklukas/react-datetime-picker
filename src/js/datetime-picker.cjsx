#React = require 'react'
FullCalendar = require './calendar'
TimePicker = require './time-picker'
Navigation = require './month-year-navigation'
moment = require 'moment'
classSet = require 'react/lib/cx'
util = require 'util'

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
    actualDate = moment(@state.actualDate)

    # dont touch time values
    if util.isDate unit
      nextDate = moment(unit).set 'hour', actualDate.get 'hour'
      nextDate.set 'minute', actualDate.get 'minute'
      nextDate.set 'second', actualDate.get 'second'
    else
      nextDate = actualDate[operation](1, unit)

    @setState actualDate: nextDate.toDate()

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
      <FullCalendar date={@state.actualDate}
        disabled={'d' in @props.disabled}
        onDaySelect={@handleDateChange} />
      <TimePicker hours={hours} mins={mins} secs={secs}
        disabled={@props.disabled}
        onTimeChange={@handleTimeChange} />

      <button className="confirm"onClick={@handleConfirm}>
        Set date
      </button>
    </div>