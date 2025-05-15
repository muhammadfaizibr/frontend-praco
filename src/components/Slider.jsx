import React, { useRef, useState, useEffect } from "react";
import SliderStyles from "assets/css/Slider.module.css";
import { Link } from "react-router-dom";
import { getCategories } from "utils/api/ecommerce";
import CustomLoading from "components/CustomLoading";

const Slider = () => {
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const intervalIdRef = useRef(null); // Use ref to store intervalId

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getCategories();
        if (!response.errors) {
          setCategories(response.results || []);
        } else {
          setError(response.message || "Failed to load images.");
        }
      } catch (err) {
        setError(err.message || "Failed to load images.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current); // Clean up interval on unmount
      }
    };
  }, []);

  // Start autoplay only when categories are loaded and slider is rendered
  useEffect(() => {
    if (!isLoading && !error && categories.length > 0) {
      startAutoplay();
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current); // Clean up on categories change or unmount
      }
    };
  }, [isLoading, error, categories]);

  const startAutoplay = () => {
    if (sliderRef.current) {
      intervalIdRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
  };

  const stopAutoplay = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  const nextSlide = () => {
    if (sliderRef.current) {
      stopAutoplay();
      const slides = sliderRef.current.children;
      sliderRef.current.appendChild(slides[0]);
      startAutoplay();
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      stopAutoplay();
      const slides = sliderRef.current.children;
      sliderRef.current.insertBefore(slides[slides.length - 1], slides[0]);
      startAutoplay();
    }
  };

  return (
    <div className={SliderStyles.sliderContainer}>
      {isLoading && <CustomLoading />}
      {error && <div className={SliderStyles.errorMessage}>{error}</div>}
      {!isLoading && !error && categories.length === 0 && (
        <div className="b3 clr-gray">No categories available.</div>
      )}
      {!isLoading && !error && categories.length > 0 && (
        <>
          <div className={SliderStyles.slider} ref={sliderRef}>
            {categories.map((category) => (
              <div className={SliderStyles.slide} key={`slide_${category.id}`}>
                <Link to={`/category/${category.slug}`}>
                  <div className={SliderStyles.featuredImage}>
                    <img
                      src={category.slider_image}
                      alt={category.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                      }}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <button className={SliderStyles.prevBtn} onClick={prevSlide}>
            ❮
          </button>
          <button className={SliderStyles.nextBtn} onClick={nextSlide}>
            ❯
          </button>
        </>
      )}
    </div>
  );
};

export default Slider;