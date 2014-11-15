#React = require 'react'
FullCalendar = require './calendar'
TimePicker = require './time-picker'
Navigation = require './month-year-navigation'
moment = require 'moment'
classSet = require 'react/lib/cx'

module.exports = React.createClass
  propTypes:
    visible: React.PropTypes.bool
    disabled: React.PropTypes.arrayOf(
      React.PropTypes.oneOf ['y', 'M', 'd', 'h', 'm', 's']
    )
    date: React.PropTypes.instanceOf Date

  ###*
  * Called when day at calendar is selected
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
  * Called by time cell spinners
  *
  * @param {string} unit Type of time unit to change, one of 'h', 'm', 's'
  * @param {number} value
  ###
  handleTimeChange: (unit, value) ->
    @setState actualDate: @state.actualDate.clone().set unit, value

  handleConfirm: ->
    if @props.onDateConfirm?
      @props.onDateConfirm @state.actualDate.toDate()

  ###*
  * @param {Date} date
  ###
  setActualDate: (date) ->
    if date? then @setState actualDate: moment(date)

  componentWillReceiveProps: (nextProps) ->
    @setActualDate nextProps.date

  componentDidMount: ->
    @setActualDate @props.date

  getInitialState: ->
    actualDate: moment(new Date)

  getDefaultProps: ->
    visible: false
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