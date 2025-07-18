import React from "react";
import AboutPracoStyles from "assets/css/AboutPracoStyles.module.css";
import HeadingBar from "components/HeadingBar";
import { CreditCard, Trophy, Truck } from "lucide-react";
import Divider from "components/Divider";

const AboutPraco = () => {
  // const featureIconStyle = { width: 72, height: 72, strokeWidth: 1.25 };

  const featuresDisplay = [
    {
      icon: <Truck className="icon-xxl clr-white" />,
      label: "Free Shipping",
      description: "Free shipping on orders over £300",
    },
    {
      icon: <CreditCard className="icon-xxl clr-white" />,
      label: "Secure Checkout",
      description: "We ensure 100% Payment Secure",
    },
    {
      icon: <Trophy className="icon-xxl clr-white" />,
      label: "Experience",
      description: "5 Year Experience",
    },
  ];
  return (
    <div className={`${AboutPracoStyles.wrapper} centered-layout-wrapper`}>
      <div
        className={`${AboutPracoStyles.container} centered-layout page-layout p`}
      >
        <div className={AboutPracoStyles.contentWrapper}>
          <HeadingBar
            displayType={"column"}
            headline={"Praco Packaging in"}
            headlineSize={"h3"}
            headlineSizeType={"tag"}
            theme={"dark"}
            highlightedText={"100 Words"}
          />
          <p className="b2 light">
            At Praco, the UK's leading packaging supplier, we take pride in
            helping businesses find the best packaging solutions for their
            needs. With our industry expertise, we ensure you're using the most
            efficient and cost-effective products to enhance your operations.
            Whether your packaging requirements are simple or complex, our team
            is dedicated to finding the perfect solution. Our Just-in-Time
            service ensures you get the right packaging exactly when you need
            it, minimizing delays and maximizing efficiency. Plus, our friendly
            and knowledgeable team is always ready to assist, making your
            packaging process smoother and more sustainable. Let Praco help you
            become a smarter and more eco-friendly packager.
          </p>
        </div>
        <div className={AboutPracoStyles.featuresDisplayWrapper}>
          {featuresDisplay.map((featuresDisplayElement, index) => {
            return (
              <div key={`featuresDisplay$_${index}`} className={AboutPracoStyles.featureDisplayBlock}>
              <div
                className={AboutPracoStyles.featureDisplay}
              >
                {featuresDisplayElement.icon}
                <div className={AboutPracoStyles.featureDisplayTextDetails}>
                  <h4 className="light">{featuresDisplayElement.label}</h4>
                  <p className="b2 clr-white">{featuresDisplayElement.description}</p>
                </div>
              </div>
              {index === featuresDisplay.length -1 ? "" : <div className={AboutPracoStyles.featureDisplayDivider}>
              <Divider />
                </div>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AboutPraco;