mockery.registerMock './calendar-day', mockComponent 'dayMock'

Calendar = require '../src/js/calendar'

describe 'Calendar component', ->
  before ->
    @props =
      date: new Date

    @cal = TestUtils.renderIntoDocument Calendar(@props)
    #@root = TestUtils.findRenderedDOMComponentWithClass @cal, 'nav-buttons'

  describe 'calendar generating', ->
    before ->
      sinon.stub @cal, 'createWeek'

    beforeEach ->
      @cal.createWeek.reset()

    after ->
      @cal.createWeek.restore()

    it 'should create 6 rows for months that cover 4 weeks', ->
      @cal.setProps date: new Date(2015, 1, 10)

      expect(@cal.createWeek.callCount).to.equal 6

    it 'should create 6 rows for months that cover 5 weeks', ->
      @cal.setProps date: new Date(2014, 11, 5)

      expect(@cal.createWeek.callCount).to.equal 6

    it 'should create 6 rows for months that cover 6 weeks', ->
      @cal.setProps date: new Date(2014, 10, 8)

      expect(@cal.createWeek.callCount).to.equal 6

    it 'should generate calendar with starting day that is always monday', ->
      @cal.setProps date: new Date(2014, 11, 8)
      expect(@cal.createWeek.firstCall.args[0][0].date.getDay()).to.equal 1

      @cal.setProps date: new Date(2012, 3, 12)
      expect(@cal.createWeek.firstCall.args[0][0].date.getDay()).to.equal 1

    it 'should start first week with day from prev month if needed', ->
      @cal.setProps date: new Date(2015, 3, 10)

      firstDay = @cal.createWeek.firstCall.args[0][0].date
      expect(firstDay.getMonth()).to.equal 2
      expect(firstDay.getDate()).to.equal 30

    it 'should end last week with day from next month if needed', ->
      @cal.setProps date: new Date(2015, 7, 10)

      lastDay = @cal.createWeek.lastCall.args[0][6].date
      expect(lastDay.getMonth()).to.equal 8
      expect(lastDay.getDate()).to.equal 6

    it 'should set isInCurrentMonth to false for prev month days', ->
      @cal.setProps date: new Date(2015, 3, 10)

      expect(@cal.createWeek.firstCall.args[0][0].isInCurrentMonth).to.be.false

    it 'should set isInCurrentMonth to false for next month days', ->
      @cal.setProps date: new Date(2015, 7, 10)

      expect(@cal.createWeek.lastCall.args[0][6].isInCurrentMonth).to.be.false

    it 'should set isInCurrentMonth to true for actual month days', ->
      @cal.setProps date: new Date(2015, 5, 8)

      expect(@cal.createWeek.thirdCall.args[0][3].isInCurrentMonth).to.be.true
