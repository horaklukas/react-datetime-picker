mockery.registerMock './calendar', mockComponent 'calendarMock'
mockery.registerMock './time-picker', mockComponent 'timepickerMock'

Picker = require '../src/js/datetime-picker'

describe 'DateTime picker component', ->
  before ->
    @pick = TestUtils.renderIntoDocument Picker(value: 2)
    @root = TestUtils.findRenderedDOMComponentWithClass @pick, 'datetime-picker'

  beforeEach ->
    @pick.setProps()

  it 'should display calendar if `visible` prop is true', ->
    @pick.setProps visible: true
    @root.props.className.should.contain 'visible'

  it 'should not display calendar if `visible` prop is false', ->
    @pick.setProps visible: false
    @root.props.className.should.not.contain 'visible'

  describe 'Closer', ->
    it 'should show Closer when onClose callback is defined', ->
      @pick.setProps onClose: sinon.spy()
      closer = TestUtils.scryRenderedDOMComponentsWithClass @root, 'closer'
      closer.should.have.length 1

    it 'should not show Closer when onClose callback isnt defined', ->
      @pick.setProps onClose: null
      closer = TestUtils.scryRenderedDOMComponentsWithClass @root, 'closer'
      closer.should.have.length 0

  describe 'method handleDateChange', ->
    beforeEach ->
      @pick.setState actualDate: new Date()

    it 'should set new date from passed object if first arg is Date', ->
      @pick.handleDateChange new Date(2002, 10, 3, 11, 38, 2)

      @pick.state.actualDate.getFullYear().should.equal 2002
      @pick.state.actualDate.getMonth().should.equal 10
      @pick.state.actualDate.getDate().should.equal 3

    it 'should left time untouched when changing by Date object', ->
      @pick.setState actualDate: new Date(2002, 10, 3, 11, 38, 2)
      @pick.handleDateChange new Date(2000, 1, 12, 0, 0, 0)

      @pick.state.actualDate.getFullYear().should.equal 2000
      @pick.state.actualDate.getMonth().should.equal 1
      @pick.state.actualDate.getDate().should.equal 12
      @pick.state.actualDate.getHours().should.equal 11
      @pick.state.actualDate.getMinutes().should.equal 38
      @pick.state.actualDate.getSeconds().should.equal 2

    it 'should decrement year by one if first arg is y and second subtract', ->
      @pick.setState actualDate: new Date(2002, 10, 3, 11, 38, 2)
      @pick.handleDateChange 'y', 'subtract'

      @pick.state.actualDate.getFullYear().should.equal 2001
      @pick.state.actualDate.getMonth().should.equal 10
      @pick.state.actualDate.getDate().should.equal 3
      @pick.state.actualDate.getHours().should.equal 11
      @pick.state.actualDate.getMinutes().should.equal 38
      @pick.state.actualDate.getSeconds().should.equal 2

    it 'should increment year by one if first arg is y and second add', ->
      @pick.setState actualDate: new Date(2002, 10, 3, 11, 38, 2)
      @pick.handleDateChange 'y', 'add'

      @pick.state.actualDate.getFullYear().should.equal 2003
      @pick.state.actualDate.getMonth().should.equal 10
      @pick.state.actualDate.getDate().should.equal 3
      @pick.state.actualDate.getHours().should.equal 11
      @pick.state.actualDate.getMinutes().should.equal 38
      @pick.state.actualDate.getSeconds().should.equal 2

    it 'should decrement month by one if first arg is M and second subtract', ->
      @pick.setState actualDate: new Date(2002, 10, 3, 11, 38, 2)
      @pick.handleDateChange 'M', 'subtract'

      @pick.state.actualDate.getFullYear().should.equal 2002
      @pick.state.actualDate.getMonth().should.equal 9
      @pick.state.actualDate.getDate().should.equal 3
      @pick.state.actualDate.getHours().should.equal 11
      @pick.state.actualDate.getMinutes().should.equal 38
      @pick.state.actualDate.getSeconds().should.equal 2

    it 'should increment month by one if first arg is M and second add', ->
      @pick.setState actualDate: new Date(2002, 10, 3, 11, 38, 2)
      @pick.handleDateChange 'M', 'add'

      @pick.state.actualDate.getFullYear().should.equal 2002
      @pick.state.actualDate.getMonth().should.equal 11
      @pick.state.actualDate.getDate().should.equal 3
      @pick.state.actualDate.getHours().should.equal 11
      @pick.state.actualDate.getMinutes().should.equal 38
      @pick.state.actualDate.getSeconds().should.equal 2