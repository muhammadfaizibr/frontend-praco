import HomeHero from "components/HomeHero";
import React from "react";
import Products from "components/Products";
import AboutPraco from "components/AboutPraco";
import RequestQuote from "components/RequestQuote";

const Home = () => {
      const products = Array(6).fill({
        image: "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
        title: "Ph'nglui mglw'nafh",
        description: "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn",
        alt: "kalita",
        price: "$20.00"
      });
  return (
    <div className="centered-layout-wrapper full-width-flex-col layout-spacing layout-vertical-padding">
        <HomeHero />

        {/* <Products title="Pallet Wraps" products={products}/> */}
        <AboutPraco />

        <div className="centered-layout page-layout">
          <RequestQuote/>
        </div>
    </div>
  );
};

export default Home;
