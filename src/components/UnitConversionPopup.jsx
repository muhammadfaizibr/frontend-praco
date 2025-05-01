import React, { useState, useRef } from "react";
import UnitConversionPopupStyles from "assets/css/UnitConversionPopupStyles.module.css";
import HeadingBar from "components/HeadingBar";
import { Copy } from "lucide-react";
import { copyToClipboard } from "utils/stringUtils";

const UnitConversionPopup = () => {
  const [values, setValues] = useState({});
  const [baseValueInMm, setBaseValueInMm] = useState("");
  const [activeUnit, setActiveUnit] = useState(null);
  const inputRefs = useRef({});

  const units = [
    { value: "micron", label: "Micron (µm)", factor: 0.001 },
    { value: "gauge", label: "Gauge", factor: 0.0254 },
    { value: "mm", label: "Millimeter (mm)", factor: 1 },
    { value: "inch", label: "Inch (in)", factor: 25.4 },
    { value: "cm", label: "Centimeter (cm)", factor: 10 },
    { value: "ft", label: "Feet (ft)", factor: 304.8 },
    { value: "m", label: "Meter (m)", factor: 1000 },
    { value: "yd", label: "Yard (yd)", factor: 914.4 },
  ];

  const handleChange = (unit, event) => {
    const inputValue = event.target.value;
    
    // Prevent negative values
    if (inputValue < 0) {
      return;
    }

    setValues((prev) => ({ ...prev, [unit]: inputValue }));
    setActiveUnit(unit);

    if (inputValue === "" || isNaN(inputValue)) {
      setBaseValueInMm("");
    } else {
      const value = parseFloat(inputValue);
      const factor = units.find((u) => u.value === unit).factor;
      setBaseValueInMm(value * factor);
    }
  };

  const getValue = (unitValue, factor) => {
    if (activeUnit === unitValue) {
      return values[unitValue] || "";
    }
    if (baseValueInMm === "" || isNaN(baseValueInMm)) return "";
    return (baseValueInMm / factor).toFixed(4);
  };

  const handleSelect = (unit) => {
    const input = inputRefs.current[unit];
    if (input) {
      input.focus();
      input.select();
      copyToClipboard(values[unit]);
    }
  };

  return (
    <div className={UnitConversionPopupStyles.wrapper}>
      <HeadingBar
        displayType={"column"}
        headline={"Unit Conversion"}
        headlineSize={"h6"}
        headlineSizeType={"tag"}
      />

      <div className={UnitConversionPopupStyles.inputGrid}>
        {units.map(({ value, label, factor }) => (
          <div key={value} className={UnitConversionPopupStyles.inputGroup}>
            <label className="l2" htmlFor={value}>
              {label}
            </label>
            <div className={UnitConversionPopupStyles.unitInputWrapper}>
              <input
                type="number"
                id={value}
                value={getValue(value, factor)}
                onChange={(e) => handleChange(value, e)}
                placeholder="0"
                className={UnitConversionPopupStyles.numberInput}
                step="any"
                min="0" // Prevent negative input in the UI
                ref={(el) => (inputRefs.current[value] = el)}
              />
              <button
                className={`${UnitConversionPopupStyles.copyBtn} hover-primary`}
                disabled={!getValue(value, factor)}
                onClick={() => handleSelect(value)}
              >
                <Copy className="icon-xs clr-gray" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitConversionPopup;