TimeCell = require '../src/js/time-cell'

describe 'TimeCell component', ->
  before ->
    @cell = TestUtils.renderIntoDocument TimeCell(value: 2)
    @elem = TestUtils.findRenderedDOMComponentWithTag @cell, 'span'

  describe 'classes', ->
    it 'should has `value` class always', ->
      @cell.setState disabled: true
      @elem.props.className.should.contain 'value'

      @cell.setState disabled: false
      @elem.props.className.should.contain 'value'

    it 'should has class disabled if cell is disabled', ->
      @cell.setProps disabled: true
      @elem.props.className.should.contain 'disabled'

    it 'shouldnt has class disabled if cell isnt disabled', ->
      @cell.setProps disabled: false
      @elem.props.className.should.not.contain 'disabled'

  describe 'events enabling', ->
    before ->
      @iv = sinon.stub @cell, 'incrementValue'
      @md = sinon.stub @cell, 'handleMouseDown'

    beforeEach ->
      @iv.reset()
      @md.reset()

    after ->
      @iv.restore()
      @md.restore()

    it 'should call incrementValue on Click if cell isnt disabled', ->
      @cell.setProps disabled: false
      TestUtils.Simulate.click @elem

      @iv.should.been.calledOnce

    it 'should not call incrementValue on Click if cell is disabled', ->
      @cell.setProps disabled: true
      TestUtils.Simulate.click @elem

      @iv.should.not.been.called

    it 'should call handleMouseDown on MouseDown if cell isnt disabled', ->
      @cell.setProps disabled: false
      TestUtils.Simulate.mouseDown @elem

      @md.should.been.calledOnce

    it 'should not call handleMouseDown on MouseDown if cell is disabled', ->
      @cell.setProps disabled: true
      TestUtils.Simulate.mouseDown @elem

      @md.should.not.been.called