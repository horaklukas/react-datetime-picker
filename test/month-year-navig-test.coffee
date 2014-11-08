Navig = require '../src/js/month-year-navigation'

describe 'Month-Year navigation component', ->
  before ->
    @props =
      disabled: []
      onMonthYearChange: sinon.spy()
    @navig = TestUtils.renderIntoDocument Navig(@props)
    @root = TestUtils.findRenderedDOMComponentWithClass @navig, 'nav-buttons'
    @btns = TestUtils.scryRenderedDOMComponentsWithTag @navig, 'button'

  beforeEach ->
    @props.onMonthYearChange.reset()

  it 'should render navigation buttons', ->

    expect(@btns).to.have.length 4
    expect(@btns[0].props).to.have.property 'children', '<<'
    expect(@btns[1].props).to.have.property 'children', '<'
    expect(@btns[2].props).to.have.property 'children', '>'
    expect(@btns[3].props).to.have.property 'children', '>>'

  it 'should call changed method with correct params for year add', ->
    TestUtils.Simulate.click @btns[0]
    @props.onMonthYearChange.should.been.calledOnce.and.calledWith 'y', 'subtract'

  it 'should call changed method with correct params for year subtract', ->
    TestUtils.Simulate.click @btns[1]
    @props.onMonthYearChange.should.been.calledOnce.and.calledWith 'M', 'subtract'

  it 'should call changed method with correct params for month add', ->
    TestUtils.Simulate.click @btns[2]
    @props.onMonthYearChange.should.been.calledOnce.and.calledWith 'M', 'add'

  it 'should call changed method with correct params for year subtract', ->
    TestUtils.Simulate.click @btns[3]
    @props.onMonthYearChange.should.been.calledOnce.and.calledWith 'y', 'add'

  it 'should disable year buttons if disabled array contain `y`', ->
    @navig.setProps disabled: ['y', 'M']

    expect(@btns[0].props).to.have.property 'disabled', true
    expect(@btns[3].props).to.have.property 'disabled', true

  it 'should enable year buttons if disabled array not contain `y`', ->
    @navig.setProps disabled: ['M']

    expect(@btns[0].props).to.have.property 'disabled', false
    expect(@btns[3].props).to.have.property 'disabled', false

  it 'should disable month buttons if disabled array contain `M`', ->
    @navig.setProps disabled: ['y', 'M']

    expect(@btns[1].props).to.have.property 'disabled', true
    expect(@btns[2].props).to.have.property 'disabled', true

  it 'should enable month buttons if disabled array not contain `M`', ->
    @navig.setProps disabled: ['y']

    expect(@btns[1].props).to.have.property 'disabled', false
    expect(@btns[2].props).to.have.property 'disabled', false
