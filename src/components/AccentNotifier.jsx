import React from 'react'
import AccentNotifierStyles from 'assets/css/AccentNotifierStyles.module.css'
import PropTypes from 'prop-types';

const AccentNotifier = ({icon : Icon, text}) => {
  return (
    <div className={`${AccentNotifierStyles.container} full-width accent-palette`}>
        <Icon className="icon-xl clr-accent-dark-blue" /> <p className="b3">{text}</p>
    </div>
  )
}

AccentNotifier.prototype = {
    text: PropTypes.string.isRequired,
}

export default AccentNotifier