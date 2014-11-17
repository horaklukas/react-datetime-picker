#React = require 'react'
classSet = require 'react/lib/cx'

module.exports = React.createClass

  handleDayClick: (e) ->
    @props.onDaySelect @props.day

  render: ->
    {day, currentMonth} = @props
    weekDay = day.isoWeekday()

    classes = classSet {
      'day': true
      'currentMonth': currentMonth
      'weekend': weekDay is 6 or weekDay is 7
      'selected': !@props.disabled and @props.selected
      #'today': moment() is day
      'disabled': @props.disabled
    }

    clickHandler = @handleDayClick if currentMonth and not @props.disabled

    <span className={classes} onClick={clickHandler}>
      {day.date()}
    </span>
