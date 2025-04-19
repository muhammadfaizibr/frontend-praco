import React, { useState } from "react";
import AdvanceSearchPopupStyles from "assets/css/AdvanceSearchPopupStyles.module.css";
import HeadingBar from "components/HeadingBar";
import { X } from "lucide-react";
import { transformText } from "utils/stringUtils";

const AdvanceSearchPopup = () => {
  const productCategories = ["Boxes", "Bags", "Postal"];
  const measurementUnits = ["MM", "CM", "IN", "M"];
  const productSizes = ["Approx Size", "Minimum Size"];
  const min = 0;
  const max = 100;

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [length, setLength] = useState(0);
  const [productCategoryValue, setProductCategoryValue] = useState(transformText(productCategories[0]))
  const [productSizeValue, setProductSizeValue] = useState(transformText(productSizes[0]))
  const [measurementUnitValue, setMeasurementUnitValue] = useState(transformText(measurementUnits[0]))
  console.log(productSizeValue,
    measurementUnitValue)
  return (
    <div className={AdvanceSearchPopupStyles.wrapper}>
      <HeadingBar
        displayType={"column"}
        headline={"Advance Search"}
        headlineSize={"h6"}
        headlineSizeType={"tag"}
      />

      <div className={AdvanceSearchPopupStyles.attributes}>
        <div className={AdvanceSearchPopupStyles.attribute}>
          <label className="l1">Size</label>
          <div className={`${AdvanceSearchPopupStyles.options} ${AdvanceSearchPopupStyles.sizeDimensions}`}>
            <input
              className={`${AdvanceSearchPopupStyles.dimensionInput} c3`}
              name="as-d-h"
              id="as-d-h"
              type="number"
              placeholder="H"
              min={min}
              max={max}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <X />
            <input
              className={AdvanceSearchPopupStyles.dimensionInput}
              name="as-d-w"
              id="as-d-w"
              type="number"
              placeholder="W"
              min={min}
              max={max}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
            <X />
            <input
              className={AdvanceSearchPopupStyles.dimensionInput}
              name="as-d-l"
              id="as-d-l"
              type="number"
              placeholder="L"
              min={min}
              max={max}
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
        </div>
        <div className={AdvanceSearchPopupStyles.attribute}>
          <label className="l1">Type</label>
          <div className={AdvanceSearchPopupStyles.options}>
            {productCategories.map((productCategory, index) => {
              return (
                <button
                  key={`productCategory_${productCategory}_${index}`}
                  className={`${AdvanceSearchPopupStyles.productCategoryBtn} ${transformText(productCategory) === productCategoryValue ? AdvanceSearchPopupStyles.productCategoryBtnActive : ""} c3 square-btn`}
                  name={`${(transformText(productCategory))}_${index}`}
                  id={`${transformText(productCategory)}_${index}`}
                  onClick={(e) => setProductCategoryValue(transformText(productCategory))}
                >
                  {productCategory}
                </button>
              );
            })}
          </div>
        </div>
        <div className={AdvanceSearchPopupStyles.attribute}>
        <label className="l1">Measurement</label>
        <div className={AdvanceSearchPopupStyles.options}>
          <div className={AdvanceSearchPopupStyles.radioBtnWithLabelsWrapper}>
            {measurementUnits.map((measurementUnit, index) => {
              return (
                <div key={`measurementUnit_${measurementUnit}_${index}`} className={AdvanceSearchPopupStyles.radioBtnWithLabel}>
                  <input type="radio" id={`${transformText(measurementUnit)}_${index}`} name="measurementUnits" value={transformText(measurementUnit)} onChange={(e) => {setMeasurementUnitValue(e.target.value)}}/>
                  <label className="c3" htmlFor={`${transformText(measurementUnit)}_${index}`}>{measurementUnit}</label>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={AdvanceSearchPopupStyles.attribute}>
        <label className="l1">Product Size</label>
        <div className={AdvanceSearchPopupStyles.options}>
          <div className={AdvanceSearchPopupStyles.radioBtnWithLabelsWrapper}>
            {productSizes.map((productSize, index) => {
              return (
                <div key={`productSize_${productSize}_${index}`} className={AdvanceSearchPopupStyles.radioBtnWithLabel}>
                  <input type="radio" id={`${transformText(productSize)}_${index}`} name="productSizes" value={transformText(productSize)} onChange={(e) => (setProductSizeValue(e.target.value))}/>
                  <label className="c3" htmlFor={`${transformText(productSize)}_${index}`}>{productSize}</label>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      </div>

 

      <button className="primary-btn large-btn full-width text-large">Search</button>
    </div>
  );
};

export default AdvanceSearchPopup;
