import React from 'react';
import DividerStyles from 'assets/css/DividerStyles.module.css';

const Divider = ({ color }) => {
    const colorPalette = color;
    const dividerClass = `${DividerStyles.divider} ${
        colorPalette === 'dark' ? DividerStyles.dividerDark : DividerStyles.dividerLight
    }`.trim();

    return <div className={dividerClass} />;
};

export default Divider;