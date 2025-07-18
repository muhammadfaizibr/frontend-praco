import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [productCategoryValue, setProductCategoryValue] = useState("");
  const [productSizeValue, setProductSizeValue] = useState("");
  const [measurementUnitValue, setMeasurementUnitValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL parameters and set state on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const urlWidth = params.get("width") || "";
    const urlHeight = params.get("height") || "";
    const urlLength = params.get("length") || "";
    const urlMeasurementUnit = params.get("measurement_unit");
    const urlCategory = params.get("category");
    const urlApproxSize = params.get("approx_size");
    const urlMinimumSize = params.get("minimum_size");

    // Set form field values from URL parameters
    setWidth(urlWidth);
    setHeight(urlHeight);
    setLength(urlLength);

    setMeasurementUnitValue(
      urlMeasurementUnit && measurementUnits.includes(urlMeasurementUnit)
        ? urlMeasurementUnit
        : measurementUnits[0]
    );

    if (
      urlCategory &&
      productCategories.map(transformText).includes(urlCategory)
    ) {
      setProductCategoryValue(urlCategory);
    } else if (!productCategoryValue) {
      setProductCategoryValue(transformText(productCategories[0]));
    }

    setProductSizeValue(
      urlApproxSize === "true"
        ? transformText("Approx Size")
        : urlMinimumSize === "true"
        ? transformText("Minimum Size")
        : transformText(productSizes[0])
    );
  }, [location.search]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();

      // Set empty dimensions to 0
      const finalWidth = width || "0";
      const finalHeight = height || "0";
      const finalLength = length || "0";

      // Validate inputs
      const parsedWidth = parseFloat(finalWidth);
      const parsedHeight = parseFloat(finalHeight);
      const parsedLength = parseFloat(finalLength);

      if (
        (!finalWidth && finalHeight && finalLength && !isNaN(parsedHeight) && !isNaN(parsedLength) && parsedHeight > 0 && parsedLength > 0) ||
        (!finalHeight && finalWidth && finalLength && !isNaN(parsedWidth) && !isNaN(parsedLength) && parsedWidth > 0 && parsedLength > 0) ||
        (!finalLength && finalWidth && finalHeight && !isNaN(parsedWidth) && !isNaN(parsedHeight) && parsedWidth > 0 && parsedHeight > 0) ||
        (!finalWidth && !finalHeight && !finalLength) ||
        (isNaN(parsedWidth) || isNaN(parsedHeight) || isNaN(parsedLength)) ||
        (parsedWidth < 0 || parsedHeight < 0 || parsedLength < 0)
      ) {
        setError("Two dimensions must be positive.");
        return;
      }

      if (!productCategoryValue) {
        setError("Select a category.");
        return;
      }
      if (!measurementUnitValue) {
        setError("Select a unit.");
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
          width: finalWidth,
          length: finalLength,
          height: finalHeight,
          measurement_unit: measurementUnitValue,
          category: productCategoryValue,
          approx_size:
            productSizeValue === transformText("Approx Size") ? "true" : "false",
          minimum_size:
            productSizeValue === transformText("Minimum Size") ? "true" : "false",
        });

        navigate(`/search?${params.toString()}`);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError("Search failed.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      width,
      height,
      length,
      productCategoryValue,
      measurementUnitValue,
      productSizeValue,
      navigate,
    ]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <form
      className={AdvanceSearchPopupStyles.wrapper}
      onSubmit={handleSearch}
      aria-label="Advanced Search Form"
    >
      <HeadingBar
        displayType={"column"}
        headline={"Advanced Search"}
        headlineSize={"h5"}
        headlineSizeType={"tag"}
      />

      <div className={AdvanceSearchPopupStyles.attributes}>
        <div className={AdvanceSearchPopupStyles.attribute}>
          <label className="l1" htmlFor="as-d-h">Size</label>
          <div className={`${AdvanceSearchPopupStyles.options} ${AdvanceSearchPopupStyles.sizeDimensions}`}>
            <input
              className={`${AdvanceSearchPopupStyles.dimensionInput}`}
              name="as-d-h"
              id="as-d-h"
              type="number"
              placeholder="H"
              min={min}
              max={max}
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                clearError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              aria-describedby={error ? "search-error" : undefined}
            />
            <div style={{ display: 'flex', alignItems: 'center'}}><X style={{strokeWidth: 'var(--icon-stroke-xl)', width: '1.75rem', height: '1.75rem'}}  aria-hidden="true" /></div>
            <input
              className={`${AdvanceSearchPopupStyles.dimensionInput}`}
              name="as-d-w"
              id="as-d-w"
              type="number"
              placeholder="W"
              min={min}
              max={max}
              value={width}
              onChange={(e) => {
                setWidth(e.target.value);
                clearError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              aria-describedby={error ? "search-error" : undefined}
            />
            <div style={{ display: 'flex', alignItems: 'center'}}><X style={{strokeWidth: 'var(--icon-stroke-xl)', width: '1.75rem', height: '1.75rem'}}  aria-hidden="true" /></div>
            <input
              className={`${AdvanceSearchPopupStyles.dimensionInput}`}
              name="as-d-l"
              id="as-d-l"
              type="number"
              placeholder="L"
              min={min}
              max={max}
              value={length}
              onChange={(e) => {
                setLength(e.target.value);
                clearError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              aria-describedby={error ? "search-error" : undefined}
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
                  transformText(productCategory) === productCategoryValue
                    ? AdvanceSearchPopupStyles.productCategoryBtnActive
                    : ""
                }`}
                name={`${transformText(productCategory)}_${index}`}
                id={`${transformText(productCategory)}_${index}`}
                onClick={() => {
                  setProductCategoryValue(transformText(productCategory));
                  clearError();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setProductCategoryValue(transformText(productCategory));
                    clearError();
                  }
                }}
                aria-pressed={
                  transformText(productCategory) === productCategoryValue
                }
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
                <div
                  key={`measurementUnit_${measurementUnit}_${index}`}
                  className={AdvanceSearchPopupStyles.radioBtnWithLabel}
                >
                  <input
                    type="radio"
                    id={`${transformText(measurementUnit)}_${index}`}
                    name="measurementUnits"
                    value={measurementUnit}
                    checked={measurementUnitValue === measurementUnit}
                    onChange={(e) => {
                      setMeasurementUnitValue(e.target.value);
                      clearError();
                    }}
                    aria-checked={measurementUnitValue === measurementUnit}
                  />
                  <label
                    className="b4"
                    htmlFor={`${transformText(measurementUnit)}_${index}`}
                  >
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
                <div
                  key={`productSize_${productSize}_${index}`}
                  className={AdvanceSearchPopupStyles.radioBtnWithLabel}
                >
                  <input
                    type="radio"
                    id={`${transformText(productSize)}_${index}`}
                    name="productSizes"
                    value={transformText(productSize)}
                    checked={productSizeValue === transformText(productSize)}
                    onChange={(e) => {
                      setProductSizeValue(e.target.value);
                      clearError();
                    }}
                    aria-checked={productSizeValue === transformText(productSize)}
                  />
                  <label
                    className="b4"
                    htmlFor={`${transformText(productSize)}_${index}`}
                  >
                    {productSize}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        className="primary-btn large-btn full-width text-giant"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>

      {error && (
        <div
          className={`${AdvanceSearchPopupStyles.error} clr-danger`}
          id="search-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </form>
  );
};

export default AdvanceSearchPopup;