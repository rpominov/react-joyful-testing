import React from 'react'
import TestUtils from 'react-addons-test-utils'
import createJoy from '../src/index'

const {
  renderToRelevant,
  eventsToLog,
  mapOverRenders,
  eventCreators: {triggerCallback, setProps},
} = createJoy(React, TestUtils)



// Stateless component example

import MyStateless from './targets/Stateless'

const renderMyStateless = renderToRelevant(MyStateless)
console.log(renderMyStateless({value: 1, max: 10}).value.props.children) // 1
console.log(renderMyStateless({value: 11, max: 10}).value.props.children) // 10+



// Stateful component expamle

import MyStateful from './targets/Stateful'

const clickInc = triggerCallback('incBtn', 'onClick')
const clickDec = triggerCallback('decBtn', 'onClick')
const setMax = max => setProps({initialValue: 0, max})

const events = [setMax(10), clickInc, clickInc, clickInc, setMax(2), setMax(10), clickDec]

const log = eventsToLog(MyStateful)(events)
console.log(mapOverRenders(els => els.value.props.children)(log)) // [0, 1, 2, 3, "2+", 3, 2]
