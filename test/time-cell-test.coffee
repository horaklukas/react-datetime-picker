TimeCell = require '../src/js/time-cell'

describe 'TimeCell component', ->
  before ->
    @props =
      value: 2
      type: 'h'
      maxVal: 59
      onChange: sinon.spy()
    @cell = TestUtils.renderIntoDocument TimeCell @props
    @elem = TestUtils.findRenderedDOMComponentWithClass @cell, 'time-cell'
    @spinners = TestUtils.scryRenderedDOMComponentsWithClass @elem, 'spinner'

  describe 'receive props', ->
    beforeEach ->
      @cell.setState value: 0

    it 'should set state `value` if prop `value` is defined', ->
      @cell.setProps value: 15

      expect(@cell.state.value).to.equal 15

    it 'should left state `value` if prop `value` isnt defined', ->
      @cell.setState value: 3
      expect(@cell.state.value, 'before receive props').to.equal 3

      @cell.setProps disabled: false

      expect(@cell.state.value, 'after receive props').to.equal 3

  describe 'classes', ->
    it 'should has class disabled if cell is disabled', ->
      @cell.setProps disabled: true
      @elem.props.className.should.contain 'disabled'

    it 'shouldnt has class disabled if cell isnt disabled', ->
      @cell.setProps disabled: false
      @elem.props.className.should.not.contain 'disabled'

  describe 'method incrementValue', ->
    before ->
      @cell.setProps type: 'h', maxVal: 38

    beforeEach ->
      @props.onChange.reset()
      @cell.setState value: 10

    it 'should change actual value with passed positive increment', ->
      @cell.incrementValue 1
      @props.onChange.should.been.calledWithExactly 'h', 11

    it 'should change actual value with passed negative increment', ->
      @cell.incrementValue -1
      @props.onChange.should.been.calledWithExactly 'h', 9

    it 'should set value to 0 if it is more than max value', ->
      @cell.setState value: 38
      @cell.incrementValue 1

      @props.onChange.should.been.calledWithExactly 'h', 0

    it 'should set value to max value if it is less then 0', ->
      @cell.setState value: 0
      @cell.incrementValue -1

      @props.onChange.should.been.calledWithExactly 'h', 38
