# react-joyful-testing

Experimental utilities for joyful React testing based on shallow rendering.

See [example/entry.js](https://github.com/rpominov/react-joyful-testing/blob/master/example/entry.js) for a working example.


## Itentions

### 1. Make it easy to decouple unrelated UI design stuff from what we want to test.

Mark parts related for the test with special `_tId` or `_tClass` props, and then you are free to change unrelated parts of markup and tests will still pass.

For example first version of a component output could look like this:

```js
<div>
  <span _tId="value">
    {value > max ? `${max}+` : value}
  </span>
</div>
```

Then we add title, change the tag from `span` to `p`, but all this unrelated changes won't affect tests:

```js
<div>
  <h1>Hello</h1>
  <p _tId="value">
    {value > max ? `${max}+` : value}
  </p>
</div>
```

### 2. Reduce stateless components testing to testing of pure functions `inputProps -> relevantElements`.

Stateless components are already simple to test, but there are still some boilerplate we might want to get rid of.

With `react-joyful-testing` instead of this:

```js
// We have to repeat this code over and over
const renderer = TestUtils.createRenderer()
renderer.render(<Comp value={1} max={10} />)
const output = renderer.getRenderOutput()

// Here you're supposed to make assertions against `output`
// which is a React-element tree that your component render function returns.
// Basically you're on your own with that tree data structure...
```

You can do this (supposedly you've marked relevant element with `_tId="value"`):

```js
const renderComp = renderToRelevant(Comp)
expect(renderComp({value: 1, max: 10}).value.props.children).toEqual(1)
expect(renderComp({value: 11, max: 10}).value.props.children).toEqual('10+')
```

### 3. Reduce stateful compoents testing to testing of pure<sup>?</sup> fucntions `[Event] -> [Renders | OtherLogItem]`

TODO: write a better explanation

Here is how it looks like:

```js
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import createJoy from 'react-joyful-testing'

const {
  eventsToLog,
  mapOverRenders,
  eventCreators: {triggerCallback, setProps},
} = createJoy(React, TestUtils)

import MyStateful from './targets/Stateful'

const clickInc = triggerCallback('incBtn', 'onClick')
const clickDec = triggerCallback('decBtn', 'onClick')
const setMax = max => setProps({initialValue: 0, max})

const events = [setMax(10), clickInc, clickInc, clickInc, setMax(2), setMax(10), clickDec]

const log = eventsToLog(MyStateful)(events)
console.log(mapOverRenders(els => els.value.props.children)(log)) // [0, 1, 2, 3, "2+", 3, 2]
```
