import React from "react";
import Slider from "components/Slider";
import homeHeroStyles from "assets/css/HomeHeroStyles.module.css";

const homeHero = () => {
  return (
        <section className={homeHeroStyles.homeHero}>
        <Slider />
    </section>
  );
};

export default homeHero;
