import React from 'react';
import Slider from 'components/Slider';
import CategoriesMenuBar from 'components/CategoriesMenuBar';
import homeHeroStyles from 'assets/css/HomeHeroStyles.module.css';

const homeHero = () => {
  return (
    <section className={homeHeroStyles.homeHero}>
        <CategoriesMenuBar />
        <Slider />
    </section>
  )
}

export default homeHero