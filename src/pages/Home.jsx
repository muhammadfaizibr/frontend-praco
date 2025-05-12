import HomeHero from "components/HomeHero";
import React from "react";
import Products from "components/Products";
import AboutPraco from "components/AboutPraco";
import RequestQuote from "components/RequestQuote";

const Home = () => {
  return (
    <>
        <HomeHero />
    <div className="centered-layout-wrapper full-width-flex-col">

        {/* <Products title="Pallet Wraps" products={products}/> */}
        <AboutPraco />

        <div className="centered-layout page-layout layout-vertical-padding">
          <RequestQuote/>
        </div>
    </div>
    </>
  );
};

export default Home;
