module.exports = function(React, TestUtils) {

  const render = Comp => props => {
    const renderer = TestUtils.createRenderer()
    renderer.render(<Comp {...props} />)
    return renderer.getRenderOutput()
  }

  const traverse = fn => tree => {
    if (React.isValidElement(tree)) {
      fn(tree)
      React.Children.forEach(tree.props.children, traverse(fn))
    }
  }

  const findRelevant = tree => {
    const byId = {}
    const byClass = {}
    traverse(el => {
      if (el.props._tId !== undefined) {
        byId[el.props._tId] = el
      }
      if (el.props._tClass !== undefined) {
        byClass[el.props._tClass] = (byClass[el.props._tClass] || []).concat([el])
      }
    })(tree)
    return {...byClass, ...byId}
  }

  const renderToRelevant = Comp => props => findRelevant(render(Comp)(props))

  const mapOverRenders = fn => log => {
    return log.filter(x => x && x.type === 'RENDER').map(x => fn(x.payload))
  }

  const lastRendered = log => {
    const xs = mapOverRenders(x => x)(log)
    return xs.length > 0 ? xs[xs.length - 1] : null
  }

  const eventCreators = {
    triggerCallback(elementName, callbackName, args = [], context = null) {
      return ({log}) => {
        lastRendered(log)[elementName].props[callbackName].apply(context, args)
      }
    },
    setProps(props) {
      return ({setProps}) => {
        setProps(props)
      }
    }
  }

  const eventsToLog = Comp => (events, {before = () => {}, after = () => {}} = {}) => {
    let log = []
    const context = {}
    const renderer = TestUtils.createRenderer()
    const addToLog = entry => {log = log.concat([entry])}
    const setProps = props => {renderer.render(<Comp {...props} />)}
    before(context)
    events.forEach(event => {
      event({context, setProps, addToLog, log})
      addToLog({
        type: 'RENDER',
        payload: findRelevant(renderer.getRenderOutput())
      })
    })
    after(context)
    return log
  }

  return {
    render,
    traverse,
    findRelevant,
    renderToRelevant,
    eventsToLog,
    lastRendered,
    mapOverRenders,
    eventCreators
  }
}
