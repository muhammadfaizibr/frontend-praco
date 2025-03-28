// Slider.jsx
import React, { useRef, useEffect } from "react";
import SliderStyles from "assets/css/Slider.module.css";

const Slider = () => {
  const sliderRef = useRef(null);
  let intervalId;

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(intervalId);
  }, []);

  const startAutoplay = () => {
    intervalId = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const stopAutoplay = () => {
    clearInterval(intervalId);
  };

  const nextSlide = () => {
    stopAutoplay();
    const slides = sliderRef.current.children;
    sliderRef.current.appendChild(slides[0]);
    startAutoplay();
  };

  const prevSlide = () => {
    stopAutoplay();
    const slides = sliderRef.current.children;
    sliderRef.current.insertBefore(slides[slides.length - 1], slides[0]);
    startAutoplay();
  };

  return (
    <div className={SliderStyles.sliderContainer}>
      <div className={SliderStyles.slider} ref={sliderRef}>
        <div className={SliderStyles.slide}>
          <div className={SliderStyles.featuredImage}>
            <img
              // src="https://images.unsplash.com/photo-1682188082355-0c3c28bda000?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Slide 1"
            />
          </div>
        </div>
        <div className={SliderStyles.slide}>
          <div className={SliderStyles.featuredImage}>
            <img
              // src="https://images.unsplash.com/photo-1684329289112-5683c8901899?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Slide 2"
            />
          </div>
        </div>

        <div className={SliderStyles.slide}>
          
          <div className={SliderStyles.featuredImage}>
            <img
              // src="https://plus.unsplash.com/premium_photo-1731872413418-a9b2817c09aa?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Slide 3"
            />
          </div>
        </div>
      </div>
      <button className={SliderStyles.prevBtn} onClick={prevSlide}>
        ❮
      </button>
      <button className={SliderStyles.nextBtn} onClick={nextSlide}>
        ❯
      </button>
    </div>
  );
};

export default Slider;
