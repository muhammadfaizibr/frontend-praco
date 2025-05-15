import React from "react";
import ContactInfoStyles from "assets/css/ContactInfoStyles.module.css";
import HeadingBar from "components/HeadingBar";
import { MailOpen, MapPin, Phone } from "lucide-react";

const ContactInfo = () => {
    const contactInfo = [
        {
            icon: <MailOpen/>,
            label: "Email Address",
            value: "info@praco.co.uk"
        },

        {
            icon: <Phone/>,
            label: "Phone Number",
            value: "+(44) 0116 365 3008"
        },
        {
            icon: <MapPin/>,
            label: "Office Address",
            value: "15 Parker Drive, Leicester, LE4 0JP"
        },
    ]
  return (
    <div className={ContactInfoStyles.container}>
      <HeadingBar
        displayType={"column"}
        headline={"Get in"}
        headlineSize={"h3"}
        headlineSizeType={"tag"}
        theme={"light"}
        highlightedText={"Touch"}
      />
      <div className={ContactInfoStyles.infoCardWrapper}>
       {contactInfo.map((contactInfoElement, index) => {
        return (
            <div className={ContactInfoStyles.infoCard}>
            <div className={`${ContactInfoStyles.iconWrapper} icon-wrapper-accent-dark`}>
              {contactInfoElement.icon}
            </div>
            <div className={ContactInfoStyles.contentWrapper}>
              <p className="l3 clr-accent-dark-blue text-600">{contactInfoElement.label}</p>
              <p className="b2 clr-accent-dark-blue">{contactInfoElement.value}</p>
            </div>
          </div>
        )
       })}
      </div>
    </div>
  );
};

export default ContactInfo;
