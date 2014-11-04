#React = require 'react'
classSet = require 'react/lib/cx'

module.exports = React.createClass

  handleDayClick: (e) ->
    if @props.disabled or not @props.day.isInCurrentMonth
      return e.preventDefault()

    @props.onDaySelect @props.day.date

  render: ->
    idx = @props.index
    day = @props.day
    text = if day.isInCurrentMonth then day.date.getDate() else '&nbsp;'

    classes = classSet {
      'day': day.isInCurrentMonth
      'emptycell': not day.isInCurrentMonth
      'weekend': idx is 5 or idx is 6
      'selected': @props.selected
      'today': day.isToday
      'highlightable': not @props.disabled
      'disabled': @props.disabled
    }

    <td className={classes} dangerouslySetInnerHTML={{__html: text}}
      onClick={@handleDayClick} />
