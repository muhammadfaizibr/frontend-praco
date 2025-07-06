import React from "react";
import styles from "assets/css/WhyChooseUs.module.css";
import {
  ShieldCheck,
  Leaf,
  Clock4,
  Sparkles,
  Truck,
  BadgeCheck,
} from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className={styles.icon} />, 
    title: "Trusted Quality",
    description: "We prioritize quality with strict control to ensure your brand shines."
  },
  {
    icon: <Leaf className={styles.icon} />, 
    title: "Eco-Friendly",
    description: "Our sustainable packaging helps reduce your environmental footprint."
  },
  {
    icon: <Clock4 className={styles.icon} />, 
    title: "Timely Delivery",
    description: "On-time production and shipping that meets your deadlines."
  },
  {
    icon: <Sparkles className={styles.icon} />, 
    title: "Premium Quality",
    description: "Quality that speaks for itself, enhancing your brand's image."
  },
  {
    icon: <Truck className={styles.icon} />, 
    title: "Regional Shipping",
    description: "Reliable delivery solutions, no matter where you are."
  },
  {
    icon: <BadgeCheck className={styles.icon} />, 
    title: "Security & Compliance",
    description: "We follow industry standards ensuring safety and compliance."
  },
];

const WhyChooseUs = () => {
  return (
    <section className={styles.whyChooseUsSection}>
      <div className={styles.wrapper}>
        <div className={styles.headingArea}>
          <h2>
            Why <span className="text-primary">Choose Us</span>
          </h2>
          <p className={`b2 ${styles.subtitle}`}>
            Explore the reasons why top-tier brands continue to trust us.
          </p>
        </div>
        <ul className={styles.featureList}>
          {features.map((item, index) => (
            <li key={index} className={styles.featureItem}>
              <div className={styles.iconBox}>{item.icon}</div>
              <div className={styles.textContent}>
                <h4 className="text-large">{item.title}</h4>
                <p className="b4">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default WhyChooseUs;