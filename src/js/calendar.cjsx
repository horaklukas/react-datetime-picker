#React = require 'react'
classSet = require 'react/lib/cx'
Calendar = require 'calendar.js'
util = require 'util'
CalendarDay = require './calendar-day'

module.exports = React.createClass
  _cal: new Calendar()

  ###*
  * Handle navigation button click
  * @param {string} type Navigation button type, one of 4 strings: ly = less
  *  year, lm = less month, gm = greater year, gy = greater year
  ###
  handleNavig: (type) ->
    month = null
    year = null

    switch type
      when 'ly' then year = @props.date.getFullYear() - 1
      when 'lm'
        month = @props.date.getMonth() - 1
        if month < 0 and 'y' in @props.disabled then month = 11
      when 'gm'
        month = @props.date.getMonth() + 1
        if month > 11 and 'y' in @props.disabled then month = 0
      when 'gy' then year = @props.date.getFullYear() + 1

    @props.onMonthYearChange month, year

  createDay: (day, idx) ->
    selected = (
      day.isInCurrentMonth and @props.date.getDate() is day.date.getDate()
    )
    disabled = 'd' in @props.disabled

    <CalendarDay day={day} index={idx} key={idx} selected={selected}
      disabled={disabled} onDaySelect={@props.onDaySelect} />

  ###*
  * @param {Array.<Object>} week List of days at week
  * @param {number} idx Index of week at list of weeks of actual month
  ###
  createWeek: (week, idx) ->
    if week.length then days = week.map(@createDay)
    else days = <td className="emptycell" colSpan={7}>&nbsp;</td>

    rowClass = if util.isArray days then 'daysrow' else 'emptyrow'

    <tr className={rowClass} key={idx}>{days}</tr>

  ###*
  * @param {number} order Order of day at week, Monday is 0, Tuesday 1, etc.
  ###
  createDayTitle: (order) ->
    name = trl("gui.datetime.daynames.#{order}")
    classes = classSet {
      'day': true
      'name': true
      'weekend': order is 5 or order is 6
    }

    <td className={classes} key={order}>{name}</td>

  render: ->
    daynames = [0..6].map @createDayTitle
    monthCalendar = @_cal.monthCalendar @props.date
    stylesLeftBtns = 'float': 'left'
    stylesRightBtns = 'float': 'right'
    yearsDisabled = 'y' in @props.disabled
    monthsDisabled = 'm' in @props.disabled

    while monthCalendar.calendar.length < 6 then monthCalendar.calendar.push []

    <div>
      <div className="nav-buttons">
        <div className="left">
          <button disabled={yearsDisabled} onClick={@handleNavig.bind(this, 'ly')} >&lt;&lt;</button>
          <button disabled={monthsDisabled} onClick={@handleNavig.bind(this, 'lm')}>&lt;</button>
        </div>
        <div className="right">
          <button disabled={monthsDisabled} onClick={@handleNavig.bind(this, 'gm')}>&gt;</button>
          <button disabled={yearsDisabled} onClick={@handleNavig.bind(this, 'gy')} >&gt;&gt;</button>
        </div>
      </div>
      <table>
        <thead><tr className="daynames">{daynames}</tr></thead>
        <tbody>
          {monthCalendar.calendar.map(@createWeek)}
        </tbody>
      </table>
    </div>