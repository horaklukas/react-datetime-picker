Spinner = require '../src/js/spinner'

describe 'Spinner component', ->
  before ->
    @props =
      type: 'up'
      increment: 1
      changeValue: sinon.spy()

    @spinner = TestUtils.renderIntoDocument Spinner @props
    @elem = TestUtils.findRenderedDOMComponentWithClass @spinner, 'spinner'

  describe 'handle events', ->
    before ->
      @hc = sinon.stub @spinner, 'handleChangeValue'
      @hmd = sinon.stub @spinner, 'handleMouseDown'

    beforeEach ->
      @hc.reset()
      @hmd.reset()

    after ->
      @hc.restore()
      @hmd.restore()

    it 'should call incrementValue on Click if changeValue is truthy', ->
      @spinner.setProps changeValue: sinon.spy()
      TestUtils.Simulate.click @elem

      @hc.should.been.calledOnce

    it 'should not call incrementValue on Click if changeValue is falsy', ->
      @spinner.setProps changeValue: null
      TestUtils.Simulate.click @elem

      @hc.should.not.been.called

    it 'should call handleMouseDown on MouseDown if changeValue is truthy', ->
      @spinner.setProps changeValue: sinon.spy()
      TestUtils.Simulate.mouseDown @elem

      @hmd.should.been.calledOnce

    it 'should not call handleMouseDown on MouseDown if changeValue is falsy', ->
      @spinner.setProps changeValue: null
      TestUtils.Simulate.mouseDown @elem

      @hmd.should.not.been.called

  describe 'permanent incrementing', ->
    before ->
      sinon.spy @spinner, 'clearStartTimer'
      sinon.spy @spinner, 'handleChangeValue'
      sinon.spy @spinner, 'startIncrementing'
      @spinner.setProps changeValue: @props.changeValue

    beforeEach ->
      @clock = sinon.useFakeTimers()
      @props.changeValue.reset()
      @spinner.clearStartTimer.reset()
      @spinner.handleChangeValue.reset()
      @spinner.startIncrementing.reset()

    afterEach ->
      @clock.restore()

    it 'should not start incrementing if spinner released before start timeout elapse', ->
      TestUtils.Simulate.mouseDown @elem
      @clock.tick 300
      #TestUtils.Simulate.mouseUp document
      @spinner.handleMouseUp()
      @clock.tick 150

      @spinner.startIncrementing.should.not.been.called

    it 'should start incrementing if spinner not released before start timeout elapse', ->
      TestUtils.Simulate.mouseDown @elem
      @clock.tick 600

      @spinner.startIncrementing.should.been.calledOnce

    it 'shoud call prop changeValue each time increment speed elapse', ->
      TestUtils.Simulate.mouseDown @elem
      @clock.tick 500
      # incrementing start here
      @clock.tick 110
      @props.changeValue.should.been.calledOnce

      @clock.tick 110
      @props.changeValue.should.been.calledTwice

      @clock.tick 110
      @props.changeValue.should.been.calledThrice

      @clock.tick 110
      @props.changeValue.callCount.should.equal 4

    it 'should clear start timer when released button before incrementing', ->
      TestUtils.Simulate.mouseDown @elem
      @clock.tick 400

      @spinner.handleMouseUp()

      @spinner.startIncrementing.should.not.been.called
      @spinner.clearStartTimer.should.been.calledOnce
      expect(@spinner._startTimer).to.be.null

    it 'should clear start timer before start incrementing', ->
      TestUtils.Simulate.mouseDown @elem
      @clock.tick 510

      @spinner.handleMouseUp()

      @spinner.clearStartTimer.should.been.calledOnce
      expect(@spinner._startTimer).to.be.null

    it 'should clear increment timer when released button after increment start', ->
      TestUtils.Simulate.mouseDown @elem
      expect(@spinner._incrementTimer).to.be.null
      @clock.tick 710

      expect(@spinner._incrementTimer).to.not.be.null
      @spinner.handleChangeValue.should.been.calledTwice

      @spinner.handleMouseUp()

      expect(@spinner._incrementTimer).to.be.null

      @spinner.handleChangeValue.reset()
      @clock.tick 330

      @spinner.handleChangeValue.should.not.been.called