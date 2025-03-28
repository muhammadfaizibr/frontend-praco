import React from 'react';
import HeadingBarStyles from 'assets/css/HeadingBarStyles.module.css';
import Divider from 'components/Divider';
import PropTypes from "prop-types";

const HeadingBar = ({displayType, headline, headlineSize, headlineSizeType, highlightedText, theme}) => {
  const Tag = headlineSize;
  const color_palatte = theme === "dark" ? "light" : "dark" ;
  return (
    <div className={`${HeadingBarStyles.container} ${HeadingBarStyles[displayType]} ${theme}`}>
      {headlineSizeType === "class" ? 
        <p className={`${headlineSize} ${color_palatte}`}>{headline}</p>
        : <Tag className={color_palatte}>{headline} {highlightedText ? <span className='clr-primary'>{highlightedText}</span> : ""}</Tag>
      }
        <div className={HeadingBarStyles.dividerWrapper}><Divider color={theme}/></div>
    </div>
  )
}

HeadingBar.propTypes = {
  displayType: PropTypes.string.isRequired,
  headline: PropTypes.string.isRequired, 
  headlineSize: PropTypes.string.isRequired,                 
  headlineSizeType: PropTypes.string.isRequired,   
};

export default HeadingBar