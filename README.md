# React DateTime picker

### Why another date time picker? ###

**Fiction**: There is not enough datetime pickers to save the world, so I decide to create another one :)

**Fact**: Existing datetime pickers (React.js style) doesn't suit to me. Most often, their **time** part.

### Example of component create ###

```
  React.renderComponent(
    <DateTimePicker visible={true} onDateConfirm{handleConfirm} />,
    document.getElementById('picker')
  );
```

### Available props ###

`visible` **Boolean** - controls picker visibility

`onClose` **Function** - callback for picker close

`onDateConfirm` **Function(Date date)** - callback picker confirm, that
receives set date as a first argument
