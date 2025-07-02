import React from "react";
import styles from "assets/css/Testimonials.module.css";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Amina R.",
    title: "Founder, Elegant Box Co.",
    quote:
      "Absolutely stunning packaging! It elevated our brand image instantly. Reliable service and great attention to detail.",
    rating: 5,
  },
  {
    name: "Fahad M.",
    title: "CEO, PureGlow Skincare",
    quote:
      "Their eco-friendly options and premium look were exactly what we needed. Our customers love the unboxing experience!",
    rating: 5,
  },
  {
    name: "Sarah L.",
    title: "Marketing Head, Luxe Goods",
    quote:
      "Excellent customer support and quality materials. Our products now truly reflect our high-end positioning.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.wrapper}>
        <div className={styles.headingArea}>
          <h2>
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          <p className="b2">
            Hear directly from those who’ve experienced the quality and impact of our packaging solutions.
          </p>
        </div>

        <div className={styles.cardsWrapper}>
          {testimonials.map((t, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrap}>
                <Quote className={styles.quoteIcon} />
              </div>
              <p className={`b2 ${styles.quote}`}>
                “{t.quote}”
              </p>
              <div className={styles.footer}>
                <div className={styles.stars}>
                  {Array(t.rating).fill().map((_, i) => (
                    <Star key={i} className={styles.starIcon} />
                  ))}
                </div>
                <div className={styles.clientInfo}>
                  <strong>{t.name}</strong>
                  <span className="b4">{t.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;