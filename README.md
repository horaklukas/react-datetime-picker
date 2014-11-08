# React DateTime picker

## Why another date time picker? ##

**Fiction**: There is not enough datetime pickers to save the world, so I decide to create another one :)

**Fact**: Existing datetime pickers (React.js style) doesn't suit to me. Most often, their **time** part.

## Examples of use ##

```javascript
  var handleConfirm = function(date) {
    // use the date
  };

  React.renderComponent(
    <DateTimePicker visible={true} onDateConfirm={handleConfirm} />,
    document.getElementById('picker')
  );
```

## Available props ##

### visible ###

Type: `Boolean`
Default value: `false`

Controls picker visibility

### onClose ###

Type: `Function()`
Default value: `undefined`

Callback for picker close

### onDateConfirm ###

Type: `Function(Date)`
Default value: `undefined`

Callback for picker confirm. Receives date as a first argument
