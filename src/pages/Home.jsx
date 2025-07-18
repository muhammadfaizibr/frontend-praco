import React, { useEffect } from "react";
import CategoryCards from "components/CategoryCards";
import AboutPraco from "components/AboutPraco";
import RequestQuote from "components/RequestQuote";
import IndustriesSection from "components/Industries";
import WhyChooseUs from "components/WhyChooseUs";
import Testimonials from "components/Testimonials";
import Categories from "./Categories";
import ProductList from "components/ProductsList";
import ImageSlider from "components/ImageSlider";
import Branding from "components/Branding";

const Home = () => {
  useEffect(() => {
    document.title = "Praco - UK's Leading Packaging Supplies";
  }, []);
  return (
    <>
    <ImageSlider/>
      <div className="centered-layout-wrapper full-width-flex-col">
          <CategoryCards />
          
        <div className="centered-layout page-layout layout-vertical-padding full-width layout-spacing">

          <ProductList/>
          
        </div>
        <IndustriesSection />

        <div className="centered-layout page-layout layout-vertical-padding full-width">
          <WhyChooseUs />
        </div>
        {/* <Testimonials /> */}
      </div>
      <div className="centered-layout-wrapper full-width-flex-col">
        {/* <AboutPraco /> */}
    <Branding />

        <div className="centered-layout page-layout layout-vertical-padding">
          <RequestQuote />
          
        </div>
      </div>
    </>
  );
};

export default Home;
