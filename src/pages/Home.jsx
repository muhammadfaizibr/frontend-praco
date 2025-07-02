import React, { useEffect } from "react";
import CategoryCards from "components/CategoryCards";
import AboutPraco from "components/AboutPraco";
import RequestQuote from "components/RequestQuote";
import IndustriesSection from "components/Industries";
import WhyChooseUs from "components/WhyChooseUs";
import Testimonials from "components/Testimonials";

const Home = () => {
  useEffect(() => {
    document.title = "Praco - UK's Leading Packaging Supplies";
  }, []);
  return (
    <>
      <div className="centered-layout-wrapper full-width-flex-col">
        <div className="centered-layout page-layout layout-vertical-padding full-width">
          <CategoryCards />
        </div>

        <IndustriesSection />

        <div className="centered-layout page-layout layout-vertical-padding full-width">
          <WhyChooseUs />
        </div>
        <Testimonials />
      </div>
      <div className="centered-layout-wrapper full-width-flex-col">
        <AboutPraco />

        <div className="centered-layout page-layout layout-vertical-padding">
          <RequestQuote />
        </div>
      </div>
    </>
  );
};

export default Home;
