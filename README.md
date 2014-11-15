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

### date ###

Type: `Date`

Default value: `new Date()`

Instance of `Date` object to get selected date (and time) for picker. If not
supplied then actual date (and time) is used.

### visible ###

Type: `Boolean`

Default value: `false`

Controls picker visibility.

### disabled ###

Type: `Array(String)`

Default value: `[]`

Sets certain parts of picker disabled.
Recognized values:

* `y` - disable year change
* `M` - disable month change
* `d` - disable setting day
* `h` - disable hours change
* `m` - disable minutes change
* `s` - disable seconds change

### onClose ###

Type: `Function()`

Default value: `undefined`

Callback for picker close.

### onDateConfirm ###

Type: `Function(Date)`

Default value: `undefined`

Callback for picker confirm. Receives instance of Date object as a first
argument.