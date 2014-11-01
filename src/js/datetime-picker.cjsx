#React = require 'react'
FullCalendar = require './calendar'
TimePicker = require './time-picker'

module.exports = React.createClass
  ###*
  * @param {Object.<string, number>} position
  * @param {Date=} date Date to set as default, if null then `now` date will be
  *  used
  * @param {Array.<string>} disabled List of fields disabled for change. Can
  *  contain one  or more of key chars: `y` = years, `m` = months, `d` = days,
  *  `h` = hours, `i` = minutes, `s` = seconds
  ###
  ###
  show: (position, date = new Date, disabled = [], confirmCb = ->) ->
    @setState {
      visible: true
      position: position
      actualDate: date
      disabled: disabled
    }

    @setProps confirmCb: confirmCb

  hide: ->
    @setState visible: false
  ###
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
    if @props.confirmCb? then @props.confirmCb @state.actualDate

    @hide()

  getInitialState: ->
    visible: true
    position: x: 0, y: 0
    actualDate: new Date
    disabled: []

  render: ->
    {actualDate} = @state
    month = trl("gui.datetime.months.#{@state.actualDate.getMonth()}")
    year = actualDate.getFullYear().toString()
    hours = actualDate.getHours()
    mins = actualDate.getMinutes()
    secs = actualDate.getSeconds()

    containerStyles = display: if @state.visible then 'block' else 'none'
    calendarStyles = {}

    if @state.visible
      calendarStyles = left: @state.position.x, top: @state.position.y

    <div style={containerStyles}>
      <div className="overlay" onClick={@hide} />
      <div className="calendar" style={calendarStyles}>
        <div className="head">
          <span className="title">{month} - {year}</span>
          <span className="closer" onClick={@hide}>x</span>
        </div>
        <FullCalendar date={@state.actualDate}
          disabled={@state.disabled}
          onDaySelect={@handleDateChange}
          onMonthYearChange={@handleDateChange.bind(this, null)} />

        <TimePicker hours={hours} mins={mins} secs={secs}
          disabled={@state.disabled}
          onTimeChange={@handleTimeChange} />

        <button className="confirm"onClick={@handleConfirm}>
          {trl('gui.datetime.confirmbtn')}
        </button>
      </div>
    </div>