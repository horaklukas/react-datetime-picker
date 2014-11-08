Day = require '../src/js/calendar-day'
moment = require 'moment'

describe 'Day component', ->
  before ->
    @props =
      day: moment new Date
      onDaySelect: sinon.spy()

    @day = TestUtils.renderIntoDocument Day(@props)
    @root = TestUtils.findRenderedDOMComponentWithTag @day, 'span'

  beforeEach ->
    @props.onDaySelect.reset()

  it 'should set class weekend if isWeekday is Saturday (6) or Sunday(7)', ->
    @day.setProps day: moment(new Date 2014, 10, 8)
    expect(@root.props.className, 'Saturday').to.contain 'weekend'

    @day.setProps day: moment(new Date 2014, 10, 9)
    expect(@root.props.className, 'Sunday').to.contain 'weekend'

  it 'shouldnt set class weekend for Monday(1) up to Friday(5)', ->
    @day.setProps day: moment(new Date 2014, 10, 3)
    expect(@root.props.className).to.not.contain 'weekend'

    @day.setProps day: moment(new Date 2014, 10, 4)
    expect(@root.props.className).to.not.contain 'weekend'

    @day.setProps day: moment(new Date 2014, 10, 5)
    expect(@root.props.className).to.not.contain 'weekend'

    @day.setProps day: moment(new Date 2014, 10, 6)
    expect(@root.props.className).to.not.contain 'weekend'

    @day.setProps day: moment(new Date 2014, 10, 7)
    expect(@root.props.className).to.not.contain 'weekend'

  it 'should call onDaySelect when clicked day from currentMonth', ->
    @day.setProps day: moment(new Date 2013, 5, 2), currentMonth: true
    TestUtils.Simulate.click @root

    @props.onDaySelect.should.been.calledOnce

  it 'shouldnt call onDaySelect when clicked day from non currentMonth', ->
    @day.setProps day: moment(new Date 2012, 7, 3), currentMonth: false
    TestUtils.Simulate.click @root

    @props.onDaySelect.should.not.been.called
