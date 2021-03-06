# react-joyful-testing

Experimental utilities for joyful React testing based on shallow rendering.

Until we have proper docs please see [example/entry.js](https://github.com/rpominov/react-joyful-testing/blob/master/example/entry.js) for working examples, and [src/index.js](https://github.com/rpominov/react-joyful-testing/blob/master/src/index.js) for all available API.


## Intentions


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

The library provides `findRelevant()` method for finding marked elements:

```js
findRelevant(
  <div>
    <span _tId="foo">foo</span>
    <span _tClass="bar">bar1</span>
    <span _tClass="bar">bar2</span>
  </div>
)
// {
//   foo: <span _tId="foo">foo</span>,
//   bar: [<span _tClass="bar">bar1</span>, <span _tClass="bar">bar2</span>]
// }
```


### 2. Reduce stateless components testing to testing of pure functions `props -> relevantElements`.

Stateless components are already simple to test,
but there are still some boilerplate we might want to get rid of.

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


### 3. Reduce stateful components testing to testing of pure* fucntions `events -> log`

__*__ It accepts bunch of not pure imperative functions as argumnets and call them internaly.
So strictly speaking `eventsToLog()` isn't pure, but it still shoud preserve referential transperency
— always return the same log for the same collection of events.
You should be careful though, and don't leak the state from impure functions that you're passing (it isn't hard).

_Events_ is arbitrary events that happen with a running component instance,
such as props updates, callback calls etc.

The _log_ consists of the renderend elements dumped after each _event_
plus any custom user entries.

From technical persprctive _events_ are functions
`({context, setProps, addToLog, log}) -> void`.
And we have some helpers for creating such functions — _event creators_.
Alhtough you can also use API directly or write your own event creators.

The full signature of `eventsToLog` is:

```js
eventsToLog(Comp)(ArrayOfEvents, {before: context -> void, after: context -> void}) -> log
```

The `context` here is just a mutable object where you can stash whatever you need,
for example some mock instances. It available in before/after hooks as well as in event-functions.

And here is how it looks like as a whole:

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

const events = [
  setMax(10),
  clickInc,
  clickInc,
  clickInc,
  setMax(2),
  setMax(10),
  clickDec,
]

const log = eventsToLog(MyStateful)(events)
console.log(mapOverRenders(els => els.value.props.children)(log)) // [0, 1, 2, 3, "2+", 3, 2]
```
