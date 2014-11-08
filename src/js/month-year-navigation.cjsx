module.exports = React.createClass
  createNavigButton: (label, unit, operation, disabled = false) ->
    <NavigButton disabled={disabled} onClick={@props.onMonthYearChange}
      unit={unit} operation={operation} label={label} />

  render: ->
    yearsDisabled = 'y' in @props.disabled
    monthsDisabled = 'M' in @props.disabled

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
  handleClick: ->
    @props.onClick @props.unit, @props.operation

  render: ->
    <button disabled={@props.disabled} onClick={@handleClick} >
      {@props.label}
    </button>
