# React DateTime picker

## Why another date time picker? ##

**Fiction**: There is not enough datetime pickers to save the world, so I decide to create another one :)

**Fact**: Existing datetime pickers (React.js style) doesn't suit to me. Most often, their **time** part.

## Installation ##

Install last release

```
  npm install horaklukas/react-datetime-picker
```

Then require it

```javascript
  var DateTimePicker = require('react-datetime-picker');
```

or use distribution bundle at `dist` dir

```html
  <script src="react-datetime-picker/dist/datime-picker.js"></script>
```

## Examples of use ##

Simple use

```javascript
  var handleConfirm = function(date) {
    // use the date
  };

  React.renderComponent(
    <DateTimePicker visible={true} onDateConfirm={handleConfirm} />,
    document.getElementById('picker')
  );
```

Advanced use with opener and invisible overlay

```javascript
  App = React.createClass({
    handleConfirm: function(date) {
      // do something with date
      // ...

      this.hidePicker();
    },

    showPicker: function() {
      this.setState({pickerVisible: true});
    },

    hidePicker: function() {
      this.setState({pickerVisible: false});
    },

    getInitialState: function() {
      return {pickerVisible: false};
    },

    render: function() {
      var overlayStyles = {
        display: this.pickerVisible ? 'block' : 'none',
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
      };

      return(
        <div>
          <img src="icons/calendar.png" onClick={this.showPicker} />
          <div style={overlayStyles} onClick={this.hidePicker} />
          <DateTimePicker visible={this.state.pickerVisible}
            onClose={this.hidePicker}
            onDateConfirm={this.handleConfirm} />
        </div>
      )
    }
  });

  React.renderComponent(<App />, document.getElementById('app'));

```

This example is simplified, for more powerful version look at [example2](examples/example2.html)

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

### top/left ###

Type: `Number`

Default value: undefined

If set one of top/left property then picker position type is set to absolute
with corrsponding top/left values (if set only one of them, the second is 0).

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