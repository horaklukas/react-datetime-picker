#React = require 'react'
classSet = require 'react/lib/cx'
Calendar = require 'calendar.js'
util = require 'util'
CalendarDay = require './calendar-day'
moment = require 'moment'

module.exports = React.createClass
  _cal: new Calendar()

  createDay: (day, idx) ->
    selected = (
      day.isInCurrentMonth and @props.date.getDate() is day.date.getDate()
    )
    <CalendarDay day={day} index={idx} key={idx} selected={selected}
      disabled={@props.disabled} onDaySelect={@props.onDaySelect} />

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
    weekDays = moment.weekdaysShort()
    # weekdays are in list from Sunday to Saturday, we want it from Monday to
    # Sunday and this "overflow" workaround makes it possible
    name = weekDays[order + 1] ? weekDays[0]
    classes = classSet {
      'day': true
      'name': true
      'weekend': order is 5 or order is 6
    }

    <td className={classes} key={order}>{name}</td>

  render: ->
    daynames = [0..6].map @createDayTitle
    monthCalendar = @_cal.monthCalendar @props.date

    while monthCalendar.calendar.length < 6 then monthCalendar.calendar.push []

    <div>
      <table>
        <thead>
          <tr className="daynames">{daynames}</tr>
        </thead>
        <tbody>
          {monthCalendar.calendar.map(@createWeek)}
        </tbody>
      </table>
    </div>