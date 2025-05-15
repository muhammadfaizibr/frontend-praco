import React, { useEffect } from "react";
import HomeHero from "components/HomeHero";
import AboutPraco from "components/AboutPraco";
import RequestQuote from "components/RequestQuote";

const Home = () => {
    useEffect(()=>{
      document.title = 'Praco - UK\'s Leading Packaging Supplies';
    }, [])
  return (
    <>

        <HomeHero />
    <div className="centered-layout-wrapper full-width-flex-col">

        <AboutPraco />

        <div className="centered-layout page-layout layout-vertical-padding">
          <RequestQuote/>
        </div>
    </div>
    </>
  );
};

export default Home;
