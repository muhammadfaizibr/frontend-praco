import React from "react";
import IndustriesStyles from "assets/css/IndustriesStyles.module.css";
import {
  PackageCheck,
  Utensils,
  Pill,
  Shirt,
  MonitorSmartphone,
} from "lucide-react";

const industries = [
  {
    title: "E-commerce",
    description:
      "Tailored packaging for online retailers ensuring secure and aesthetic deliveries.",
    icon: <PackageCheck className={IndustriesStyles.icon} />,
  },
  {
    title: "Food & Beverage",
    description:
      "Safe, eco-friendly and temperature-sensitive packaging solutions for the food sector.",
    icon: <Utensils className={IndustriesStyles.icon} />,
  },
  {
    title: "Fashion & Apparel",
    description:
      "Elegant packaging solutions that reflect brand identity and enhance unboxing.",
    icon: <Shirt className={IndustriesStyles.icon} />,
  },
  {
    title: "Electronics",
    description:
      "Impact-resistant packaging to protect sensitive gadgets and devices.",
    icon: <MonitorSmartphone className={IndustriesStyles.icon} />,
  },
];

const Industries = () => {
  return (
    <section className={IndustriesStyles.industriesSection}>
      <div className="centered-layout">
        <h2 className="text-center">Industries <span className="text-primary">We Serve</span></h2>
        <p className={`b2 text-center ${IndustriesStyles.subtitle}`}>
          We cater to a wide range of industries with specialized, innovative, and sustainable packaging solutions.
        </p>
        <div className={IndustriesStyles.gridContainer}>
          {industries.map((industry, index) => (
            <div className={IndustriesStyles.card} key={index}>
              {industry.icon}
              <h4 className="text-center">{industry.title}</h4>
              <p className="b4 text-center">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;
