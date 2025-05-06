import React from "react";
import Slider from "components/Slider";
import CategoriesMenuBar from "components/CategoriesMenuBar";
import homeHeroStyles from "assets/css/HomeHeroStyles.module.css";

const homeHero = () => {
  return (
    <div className="centered-layout page-layout full-width-flex-col layout-spacing">
        <section className={homeHeroStyles.homeHero}>
        <CategoriesMenuBar />
        <Slider />
    </section>
      </div>
  );
};

export default homeHero;
