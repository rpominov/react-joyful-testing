export default function(React, TestUtils) {

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

  const run = Comp => fn => {
    let log = []
    const renderer = TestUtils.createRenderer()
    const addToLog = entry => {
      log = log.concat([entry])
    }
    const render = props => {
      renderer.render(<Comp {...props} />)
    }
    fn(addToLog).forEach(event => {
      event(render, log)
      addToLog({type: 'RELEVANT_ELEMENTS', payload: findRelevant(renderer.getRenderOutput())})
    })
    return log
  }

  const findLatestElementsInLog = log => {
    let elements = null
    log.forEach(entry => {
      if (entry.type === 'RELEVANT_ELEMENTS') {
        elements = entry.payload
      }
    })
    return elements
  }

  const createEvent = {
    updateProps: props => render => render(props),
    withElements: fn => (_, log) => {
      const elements = findLatestElementsInLog(log)
      if (elements === null) {
        throw new Error('event withElements() can\'t be before at least one updateProps()')
      }
      fn(elements)
    },
  }

  return {render, traverse, findRelevant, renderToRelevant, run, createEvent, findLatestElementsInLog}
}
