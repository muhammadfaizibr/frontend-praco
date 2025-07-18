import React, { useState, useEffect } from 'react';
import styles from 'assets/css/ImageSliderStyles.module.css';

const images = [
  require('assets/images/branding.webp'),
];

const Branding = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.sliderBg}>
      <div className={styles.sliderWrapper}>
        <div className={styles.sliderContainer}>
          {images.map((img, index) => (
            <div
              key={index}
              className={`${styles.slide} ${index === current ? styles.active : ''}`}
              style={{ backgroundImage: `url(${img})` }}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Branding;