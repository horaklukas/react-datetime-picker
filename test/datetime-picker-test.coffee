mockery.registerMock './calendar', mockComponent 'calendarMock'
mockery.registerMock './time-picker', mockComponent 'timepickerMock'

Picker = require '../src/js/datetime-picker'

describe 'DateTime picker component', ->
  before ->
    @pick = TestUtils.renderIntoDocument Picker(value: 2)
    @root = TestUtils.findRenderedDOMComponentWithClass @pick, 'datetime-picker'

  describe 'Closer', ->
    it 'should show Closer when onClose callback is defined', ->
      @pick.setProps onClose: sinon.spy()
      closer = TestUtils.scryRenderedDOMComponentsWithClass @root, 'closer'
      closer.should.have.length 1

    it 'should not show Closer when onClose callback isnt defined', ->
      @pick.setProps onClose: null
      closer = TestUtils.scryRenderedDOMComponentsWithClass @root, 'closer'
      closer.should.have.length 0
