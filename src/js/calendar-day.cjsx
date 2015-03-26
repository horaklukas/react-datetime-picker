React = require 'react'

module.exports = React.createClass

  handleDayClick: (e) ->
    @props.onDaySelect @props.day

  render: ->
    {day, currentMonth} = @props
    weekDay = day.isoWeekday()

    classes = 'day'
    classes += ' currentMonth' if currentMonth
    classes += ' weekend' if weekDay is 6 or weekDay is 7
    classes += ' selected' if !@props.disabled and @props.selected
    # classes += 'today' if moment() is day
    classes += ' disabled' if @props.disabled

    clickHandler = @handleDayClick if currentMonth and not @props.disabled

    <span className={classes} onClick={clickHandler}>
      {day.date()}
    </span>
