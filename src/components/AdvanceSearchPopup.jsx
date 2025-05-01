import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [length, setLength] = useState("");
  const [productCategoryValue, setProductCategoryValue] = useState(transformText(productCategories[0]));
  const [productSizeValue, setProductSizeValue] = useState(transformText(productSizes[0]));
  const [measurementUnitValue, setMeasurementUnitValue] = useState(measurementUnits[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  // Handle search
  const handleSearch = async () => {
    // Validate inputs
    if (!width || !height || !length || parseFloat(width) <= 0 || parseFloat(height) <= 0 || parseFloat(length) <= 0) {
      setError("Please provide valid dimensions (greater than 0).");
      return;
    }
    if (!productCategoryValue) {
      setError("Please select a product category.");
      return;
    }
    if (!measurementUnitValue) {
      setError("Please select a measurement unit.");
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        width,
        length,
        height,
        measurement_unit: measurementUnitValue,
        category: productCategoryValue,
        approx_size: productSizeValue === transformText("Approx Size") ? "true" : "false",
        minimum_size: productSizeValue === transformText("Minimum Size") ? "true" : "false",
      });
      console.log("Navigating with params:", params.toString()); // Debug
      navigate(`/search?${params.toString()}`);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Search request aborted"); // Debug
        return;
      }
      console.error("Navigation error:", err); // Debug
      setError("Failed to initiate search");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={AdvanceSearchPopupStyles.wrapper}>
      <HeadingBar
        displayType={"column"}
        headline={"Advance Search"}
        headlineSize={"h4"}
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
            {productCategories.map((productCategory, index) => (
              <button
                key={`productCategory_${productCategory}_${index}`}
                className={`${AdvanceSearchPopupStyles.productCategoryBtn} ${
                  transformText(productCategory) === productCategoryValue ? AdvanceSearchPopupStyles.productCategoryBtnActive : ""
                } c3 square-btn`}
                name={`${transformText(productCategory)}_${index}`}
                id={`${transformText(productCategory)}_${index}`}
                onClick={() => setProductCategoryValue(transformText(productCategory))}
              >
                {productCategory}
              </button>
            ))}
          </div>
        </div>
        <div className={AdvanceSearchPopupStyles.attribute}>
          <label className="l1">Measurement</label>
          <div className={AdvanceSearchPopupStyles.options}>
            <div className={AdvanceSearchPopupStyles.radioBtnWithLabelsWrapper}>
              {measurementUnits.map((measurementUnit, index) => (
                <div key={`measurementUnit_${measurementUnit}_${index}`} className={AdvanceSearchPopupStyles.radioBtnWithLabel}>
                  <input
                    type="radio"
                    id={`${transformText(measurementUnit)}_${index}`}
                    name="measurementUnits"
                    value={measurementUnit}
                    checked={measurementUnitValue === measurementUnit}
                    onChange={(e) => setMeasurementUnitValue(e.target.value)}
                  />
                  <label className="c3" htmlFor={`${transformText(measurementUnit)}_${index}`}>
                    {measurementUnit}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={AdvanceSearchPopupStyles.attribute}>
          <label className="l1">Product Size</label>
          <div className={AdvanceSearchPopupStyles.options}>
            <div className={AdvanceSearchPopupStyles.radioBtnWithLabelsWrapper}>
              {productSizes.map((productSize, index) => (
                <div key={`productSize_${productSize}_${index}`} className={AdvanceSearchPopupStyles.radioBtnWithLabel}>
                  <input
                    type="radio"
                    id={`${transformText(productSize)}_${index}`}
                    name="productSizes"
                    value={transformText(productSize)}
                    checked={productSizeValue === transformText(productSize)}
                    onChange={(e) => setProductSizeValue(e.target.value)}
                  />
                  <label className="c3" htmlFor={`${transformText(productSize)}_${index}`}>
                    {productSize}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        className="primary-btn large-btn full-width text-large"
        onClick={handleSearch}
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>

      {error && <div className={`${AdvanceSearchPopupStyles.error} clr-red`}>{error}</div>}
    </div>
  );
};

export default AdvanceSearchPopup;