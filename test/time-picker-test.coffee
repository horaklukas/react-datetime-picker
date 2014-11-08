mockery.registerMock './time-cell', mockComponent 'timeCellMock'

TPicker = require '../src/js/time-picker'

describe 'TimePicker component', ->
  before ->
    @props =
      disabled: []
      hours: 0
      mins: 0
      secs: 0

    @tpick = TestUtils.renderIntoDocument TPicker(@props)
    @root = TestUtils.findRenderedDOMComponentWithClass @tpick, 'timerow'

  describe 'render', ->
    before ->
      sinon.stub @tpick, 'createTimeCell'

    beforeEach ->
      @tpick.createTimeCell.reset()

    after ->
      @tpick.createTimeCell.restore()

    it ''

  describe 'method createTimeCell', ->
    beforeEach ->
      @tpick.setProps disabled: []

    it 'should disable time cell if its type is in prop disabled', ->
      @tpick.setProps disabled: ['h']

      cell1 = @tpick.createTimeCell 22, 'h', 23
      expect(cell1.props, 'Cell h').to.have.property 'disabled', true

      @tpick.setProps disabled: ['m']

      cell2 = @tpick.createTimeCell 45, 'm', 59
      expect(cell2.props, 'Cell m').to.have.property 'disabled', true

      @tpick.setProps disabled: ['s']

      cell3 = @tpick.createTimeCell 12, 's', 59
      expect(cell3.props, 'Cell s').to.have.property 'disabled', true

    it 'should enable time cell if its type isnt in prop disabled', ->
      @tpick.setProps disabled: ['m', 's']

      cell1 = @tpick.createTimeCell 22, 'h', 23
      expect(cell1.props, 'Cell h').to.have.property 'disabled', false

      @tpick.setProps disabled: ['h', 's']

      cell2 = @tpick.createTimeCell 45, 'm', 59
      expect(cell2.props, 'Cell m').to.have.property 'disabled', false

      @tpick.setProps disabled: ['h', 'm']

      cell3 = @tpick.createTimeCell 12, 's', 59
      expect(cell3.props, 'Cell s').to.have.property 'disabled', false
