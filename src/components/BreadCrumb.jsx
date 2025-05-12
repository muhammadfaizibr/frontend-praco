import React from "react";
import BreadCrumbStyles from "assets/css/BreadCrumbStyles.module.css";
import PropTypes from "prop-types";
import { ChevronRight } from "lucide-react";

const BreadCrumb = ({ navigationArray }) => {
  return (
    <div className={`centered-layout-wrapper full-width-flex-col layout-spacing ${BreadCrumbStyles.wrapper}`}>
      <div className="centered-layout page-layout full-width-flex-col layout-spacing">
        <div className={BreadCrumbStyles.breadCrumb}>
          {navigationArray.map((navigationItem, index) => {
            return (
              <p className="b4" key={navigationItem+index}>
                {navigationArray.length - 1 === index ? (
                  <span className="clr-primary">{navigationItem}</span>
                ) : (
                  <>
                     {navigationItem}<ChevronRight className="icon-xxs"/>
                  </>
                )}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

BreadCrumb.propTypes = {
  navigationArray: PropTypes.array.isRequired,
};


export default BreadCrumb;
