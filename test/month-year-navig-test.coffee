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
