import React, {PropTypes as T} from 'react'

export default React.createClass({

  propTypes: {
    value: T.number.isRequired,
    max: T.number.isRequired,
  },

  render() {
    const {value, max} = this.props
    return <div>
      <span _tId="value">
        {value > max ? `${max}+` : value}
      </span>
    </div>
  },

})
