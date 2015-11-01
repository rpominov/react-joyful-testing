// We need this proxy file to provide correct React & TestUtils dependencies to reactJoyfulTesting.
// We want to support both React@0.13.x and React@0.14.x, but they have different story with how TestUtils exported.
// This is probably not the best solution, but this is the first I came up with.
// We'll do this more properly later.

import React from 'react'
import TestUtils from 'react-addons-test-utils'
import reactJoyfulTesting from '../src/index'

const {render, traverse, findRelevant, renderToRelevant, run, createEvent} = reactJoyfulTesting(React, TestUtils)
export {render, traverse, findRelevant, renderToRelevant, run, createEvent}
