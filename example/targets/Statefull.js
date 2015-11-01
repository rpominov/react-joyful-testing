import React, {PropTypes as T} from 'react'

export default React.createClass({

  propTypes: {
    initialValue: T.number.isRequired,
    max: T.number.isRequired,
  },

  getInitialState() {
    return {
      value: this.props.initialValue
    }
  },

  handleDec() {
    this.setState(s => ({value: s.value - 1}))
  },

  handleInc() {
    this.setState(s => ({value: s.value + 1}))
  },

  render() {
    const {max} = this.props
    const {value} = this.state
    return <div>
      <button onClick={this.handleDec} _tId="decBtn">-</button>
      <span _tId="value">
        {value > max ? `${max}+` : value}
      </span>
      <button onClick={this.handleInc} _tId="incBtn">+</button>
    </div>
  },

})
