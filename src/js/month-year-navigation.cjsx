React = require 'react'
_contains = require 'lodash.contains'

module.exports = React.createClass
  createNavigButton: (label, unit, operation, disabled) ->
    <NavigButton disabled={disabled} onClick={@props.onMonthYearChange}
      unit={unit} operation={operation} label={label} />

  render: ->
    yearsDisabled = _contains @props.disabled, 'y'
    monthsDisabled = _contains @props.disabled, 'M'

    <div className="nav-buttons">
      <div className="left">
        {@createNavigButton '<<', 'y', 'subtract', yearsDisabled}
        {@createNavigButton '<', 'M', 'subtract', monthsDisabled}
      </div>
      <div className="right">
        {@createNavigButton '>', 'M', 'add', monthsDisabled}
        {@createNavigButton '>>', 'y', 'add', yearsDisabled}
      </div>
    </div>

NavigButton = React.createClass
  handleClick: (e) ->
    e.preventDefault()
    @props.onClick @props.unit, @props.operation

  render: ->
    <button disabled={@props.disabled} onClick={@handleClick} >
      {@props.label}
    </button>
