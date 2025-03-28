import HomeHero from "components/HomeHero";
import React from "react";
import Products from "components/Products";
import AboutPraco from "components/AboutPraco";
import RequestQuote from "components/RequestQuote";

const Home = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing">
        <HomeHero />
        <Products />
      </div>
        <AboutPraco />

        <div className="centered-layout page-layout">
          <RequestQuote/>
        </div>
    </div>
  );
};

export default Home;
