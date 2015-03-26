mockery.registerMock './calendar-day', mockComponent 'dayMock'

Calendar = require '../src/js/calendar'
moment = require 'moment'

describe 'Calendar component', ->
  before ->
    @props =
      date: moment new Date

    @cal = TestUtils.renderIntoDocument Calendar(@props)

  after ->
    mockery.deregisterMock './calendar-day'

  describe 'calendar generating', ->
    before ->
      sinon.stub @cal, 'createWeek'

    beforeEach ->
      @cal.createWeek.reset()

    after ->
      @cal.createWeek.restore()


    it 'should create 6 rows for months that cover 4 weeks', ->
      @cal.setProps date: moment(new Date(2015, 1, 10))

      expect(@cal.createWeek.callCount).to.equal 6

    it 'should create 6 rows for months that cover 5 weeks', ->
      @cal.setProps date: moment(new Date(2014, 11, 5))

      expect(@cal.createWeek.callCount).to.equal 6

    it 'should create 6 rows for months that cover 6 weeks', ->
      @cal.setProps date: moment(new Date(2014, 10, 8))

      expect(@cal.createWeek.callCount).to.equal 6

    it 'should generate calendar with starting day that is always monday', ->
      @cal.setProps date: moment(new Date(2014, 11, 8))
      expect(@cal.createWeek.firstCall.args[0][0].day()).to.equal 1

      @cal.setProps date: moment(new Date(2012, 3, 12))
      expect(@cal.createWeek.firstCall.args[0][0].day()).to.equal 1


    it 'should start first week with day from prev month if needed', ->
      @cal.setProps date: moment(new Date(2015, 3, 10))

      firstDay = @cal.createWeek.firstCall.args[0][0]
      expect(firstDay.month()).to.equal 2
      expect(firstDay.date()).to.equal 30

    it 'should end last week with day from next month if needed', ->
      @cal.setProps date: moment(new Date(2015, 7, 10))

      lastDay = @cal.createWeek.lastCall.args[0][6]
      expect(lastDay.month()).to.equal 8
      expect(lastDay.date()).to.equal 6

    it 'should create calendar day titles elements', ->
      titles = TestUtils.scryRenderedDOMComponentsWithClass @cal, 'name'

      expect(titles).to.have.length 7

    it 'should add class weeked to last two title elements', ->
      titles = TestUtils.scryRenderedDOMComponentsWithClass @cal, 'name'

      expect(titles[5].props.className).to.contain ' weekend'
      expect(titles[6].props.className).to.contain ' weekend'

  describe 'method createWeek', ->
    before ->
      sinon.stub @cal, 'createDay'

    beforeEach ->
      @cal.createDay.reset()

    after ->
      @cal.createDay.restore()

    it 'should create day for each object at week', ->
      week = @cal.createWeek ['day1','day2','day3','day4','day5','day6','day7']

      expect(week.props.children).to.have.length 7

  describe 'method createDay', ->
    it 'should set currentMonth to true if day is in same month as actual', ->
      @cal.setProps date: moment(new Date(2014, 3, 24))

      day = @cal.createDay moment(new Date(2014, 3, 2, 2, 8, 10))
      expect(day).to.have.deep.property 'props.currentMonth', true

    it 'should set currentMonth to false if day isnt in same month as actual', ->
      @cal.setProps date: moment(new Date(2014, 5, 24))

      day = @cal.createDay moment(new Date(2014, 7, 5, 11, 3, 16))
      expect(day).to.have.deep.property 'props.currentMonth', false

    it 'should set day as a selected if it equal at month and day', ->
      @cal.setProps date: moment(new Date(2014, 7, 5))

      day = @cal.createDay moment(new Date(2014, 7, 5, 11, 3, 16))
      expect(day).to.have.deep.property 'props.selected', true

    it 'shouldnt set day as a selected if it not equal at month', ->
      @cal.setProps date: moment(new Date(2014, 7, 5))

      day = @cal.createDay moment(new Date(2014, 9, 5, 11, 3, 16))
      expect(day).to.have.deep.property 'props.selected', false

    it 'shouldnt set day as a selected if it not equal at day', ->
      @cal.setProps date: moment(new Date(2014, 7, 5))

      day = @cal.createDay moment(new Date(2014, 7, 22, 11, 3, 16))
      expect(day).to.have.deep.property 'props.selected', false
