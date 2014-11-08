mockery.registerMock './calendar', mockComponent 'calendarMock'
mockery.registerMock './time-picker', mockComponent 'timepickerMock'
mockery.registerMock './month-year-navigation', mockComponent 'navigMock'

moment = require 'moment'
Picker = require '../src/js/datetime-picker'

describe 'DateTime picker component', ->
  before ->
    @pick = TestUtils.renderIntoDocument Picker(value: 2)
    @root = TestUtils.findRenderedDOMComponentWithClass @pick, 'datetime-picker'

  after ->
    mockery.deregisterMock './calendar'
    mockery.deregisterMock './time-picker'
    mockery.deregisterMock './month-year-navigation'

  beforeEach ->
    @pick.setProps()

  it 'should display calendar if `visible` prop is true', ->
    @pick.setProps visible: true
    @root.props.className.should.contain 'visible'

  it 'should not display calendar if `visible` prop is false', ->
    @pick.setProps visible: false
    @root.props.className.should.not.contain 'visible'

  it 'should set calendar disabled if prop disabled contain `d`', ->
    @pick.setProps disabled: ['d', 'h']

    cal = TestUtils.findRenderedDOMComponentWithClass @root, 'calendarMock'
    expect(cal.props).to.have.property 'disabled', true

  it 'should set calendar enabled if prop disabled not contain `d`', ->
    @pick.setProps disabled: ['M']

    cal = TestUtils.findRenderedDOMComponentWithClass @root, 'calendarMock'
    expect(cal.props).to.have.property 'disabled', false

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
      @pick.setState actualDate: moment(new Date())

    it 'should set new date from passed object if first arg is Date', ->
      @pick.handleDateChange moment(new Date(2002, 10, 3, 11, 38, 2))

      @pick.state.actualDate.year().should.equal 2002
      @pick.state.actualDate.month().should.equal 10
      @pick.state.actualDate.date().should.equal 3

    it 'should left time untouched when changing by Date object', ->
      @pick.setState actualDate: moment(new Date(2002, 10, 3, 11, 38, 2))
      @pick.handleDateChange moment(new Date(2000, 1, 12, 0, 0, 0))

      @pick.state.actualDate.year().should.equal 2000
      @pick.state.actualDate.month().should.equal 1
      @pick.state.actualDate.date().should.equal 12
      @pick.state.actualDate.hours().should.equal 11
      @pick.state.actualDate.minutes().should.equal 38
      @pick.state.actualDate.seconds().should.equal 2

    it 'should decrement year by one if first arg is y and second subtract', ->
      @pick.setState actualDate: moment(new Date(2002, 10, 3, 11, 38, 2))
      @pick.handleDateChange 'y', 'subtract'

      @pick.state.actualDate.year().should.equal 2001
      @pick.state.actualDate.month().should.equal 10
      @pick.state.actualDate.date().should.equal 3
      @pick.state.actualDate.hours().should.equal 11
      @pick.state.actualDate.minutes().should.equal 38
      @pick.state.actualDate.seconds().should.equal 2

    it 'should increment year by one if first arg is y and second add', ->
      @pick.setState actualDate: moment(new Date(2002, 10, 3, 11, 38, 2))
      @pick.handleDateChange 'y', 'add'

      @pick.state.actualDate.year().should.equal 2003
      @pick.state.actualDate.month().should.equal 10
      @pick.state.actualDate.date().should.equal 3
      @pick.state.actualDate.hours().should.equal 11
      @pick.state.actualDate.minutes().should.equal 38
      @pick.state.actualDate.seconds().should.equal 2

    it 'should decrement month by one if first arg is M and second subtract', ->
      @pick.setState actualDate: moment(new Date(2002, 10, 3, 11, 38, 2))
      @pick.handleDateChange 'M', 'subtract'

      @pick.state.actualDate.year().should.equal 2002
      @pick.state.actualDate.month().should.equal 9
      @pick.state.actualDate.date().should.equal 3
      @pick.state.actualDate.hours().should.equal 11
      @pick.state.actualDate.minutes().should.equal 38
      @pick.state.actualDate.seconds().should.equal 2

    it 'should increment month by one if first arg is M and second add', ->
      @pick.setState actualDate: moment(new Date(2002, 10, 3, 11, 38, 2))
      @pick.handleDateChange 'M', 'add'

      @pick.state.actualDate.year().should.equal 2002
      @pick.state.actualDate.month().should.equal 11
      @pick.state.actualDate.date().should.equal 3
      @pick.state.actualDate.hours().should.equal 11
      @pick.state.actualDate.minutes().should.equal 38
      @pick.state.actualDate.seconds().should.equal 2

  describe 'method handleTimeChange', ->
    beforeEach ->
      @pick.setState actualDate: moment(new Date(2002, 10, 3, 11, 38, 2))

    it 'should set new only value of passed type', ->
      @pick.handleTimeChange 'h', 16
      expect(@pick.state.actualDate.hours(), 'hours').to.equal 16

      @pick.handleTimeChange 'm', 29
      expect(@pick.state.actualDate.minutes(), 'minutes').to.equal 29

      @pick.handleTimeChange 's', 2
      expect(@pick.state.actualDate.seconds(), 'seconds').to.equal 2

      @pick.state.actualDate.year().should.equal 2002
      @pick.state.actualDate.month().should.equal 10
      @pick.state.actualDate.date().should.equal 3
