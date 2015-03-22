React = require 'react'
CalendarDay = require './calendar-day'
moment = require 'moment'

module.exports = React.createClass
  createDay: (day, idx) ->
    currentMonth = day.month() is @props.date.month()
    selected = currentMonth and @props.date.date() is day.date()

    <CalendarDay day={day} key={idx} selected={selected}
      currentMonth={currentMonth} disabled={@props.disabled}
      onDaySelect={@props.onDaySelect} />

  ###*
  * @param {Array.<Object>} week List of days at week
  * @param {number} idx Index of week at list of weeks of actual month
  ###
  createWeek: (week, idx) ->
    <div className="week" key={idx}>
      {week.map @createDay}
    </div>

  ###*
  * @param {number} order Order of day at week, Monday is 0, Tuesday 1, etc.
  ###
  createDayTitle: (order) ->
    weekDays = moment.weekdaysShort()
    # weekdays are in list from Sunday to Saturday, we want it from Monday to
    # Sunday and this "overflow" workaround makes it possible
    name = weekDays[order + 1] ? weekDays[0]
    classes = 'name'
    classes += 'weekend' if order is 5 or order is 6

    <span className={classes} key={order}>{name}</span>

  render: ->
    {date} = @props
    currentDate = date.clone().startOf('month').startOf('isoweek').isoWeekday 1

    weeks = (for week in [0..5]
      (for day in [0..6]
        actualDay = currentDate.clone()

        currentDate.add 1, 'days'
        actualDay
      )
    )

    <div className="calendar">
      <div className="daynames">
        {[0..6].map @createDayTitle}
      </div>
      {weeks.map(@createWeek)}
    </div>