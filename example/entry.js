import React from 'react'
import {render, traverse, findRelevant, renderToRelevant, run, createEvent} from './lib'


import A from './targets/Stateless'
import B from './targets/Statefull'


const renderA = renderToRelevant(A)
console.log(renderA({value: 1, max: 10}).value.props.children) // 1
console.log(renderA({value: 11, max: 10}).value.props.children) // 10+


const runB = run(B)

const clickInc = createEvent.withElements(els => {els.incBtn.props.onClick()})
const clickDec = createEvent.withElements(els => {els.decBtn.props.onClick()})
const setMax = max => createEvent.updateProps({initialValue: 0, max})

const log = runB(addToLog => [setMax(10), clickInc, clickInc, clickInc, setMax(2), setMax(10), clickDec])

console.log(log.map(entry => entry.payload.value.props.children)) // [0, 1, 2, 3, "2+", 3, 2]
