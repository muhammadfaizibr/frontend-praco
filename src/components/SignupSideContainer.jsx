import React from "react";
import FormSideContainerStyles from "assets/css/FormSideContainer.module.css";
import HeadingBar from "./HeadingBar";
import { LocateFixed, Lock, SquarePercent } from "lucide-react";

const LoginSideContainer = () => {
  const signupFeatures = [
    {
      icon: <LocateFixed className="icon-xs clr-accent-dark-blue"/>,
      label: "Order Tracking",
      description: "Easily track your orders and get real-time updates."
    },
    {
      icon: <SquarePercent className="icon-xs clr-accent-dark-blue"/>,
      label: "Exclusive Pricing",
      description: "Get exclusive pricing quotes for your desire packaging supplies."
    },
    {
      icon: <Lock className="icon-xs clr-accent-dark-blue"/>,
      label: "Secure Checkout",
      description: "Secure, encrypted checkout for safe and worry-free payments."
    }
  ]
  return (
    <div className={FormSideContainerStyles.container}>
      <HeadingBar
        displayType={"column"}
        headline={"Key Features of"}
        headlineSize={"h4"}
        highlightedText={"Customer Account"}
        headlineSizeType={"tag"}
        hideDivider={true}
      />
      <div className={FormSideContainerStyles.signupFeaturesWrapper}>
       {signupFeatures.map((featureElement, index) => {
        return (
          <div className={FormSideContainerStyles.signupFeature}>
          {/* <div className="icon-xxs clr-accent-dark-blue"> */}
            {featureElement.icon}
          {/* </div> */}
          <div className={FormSideContainerStyles.signupFeatureContent}>
          <p className="text-uppercase l1 clr-accent-dark-blue">{featureElement.label}</p>
          <p className="c3">{featureElement.description}</p>

          </div>
        </div>
        )
       })}
      </div>
    </div>
  );
};

export default LoginSideContainer;
