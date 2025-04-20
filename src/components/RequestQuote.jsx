import React from "react";
import HeadingBar from "components/HeadingBar";
import RequestQuoteStyles from "assets/css/RequestQuoteStyles.module.css";
import { AtSign, Headset, Phone, Quote } from "lucide-react";
import { Link } from "react-router-dom";
// import { Link } from "react-router-dom";

const RequestQuote = () => {
  return (
    <section className={RequestQuoteStyles.container}>
      <div className={RequestQuoteStyles.contentWrapper}>
      <div className={RequestQuoteStyles.textContentWrapper}>

        <HeadingBar
          displayType={"column"}
          headline={"Request a Quote for"}
          highlightedText={"All Your Packaging Needs"}
          headlineSize={"h3"}
          headlineSizeType={"tag"}
        />

        <p className="b2">
          From boxes to tapes and everything in between, Praco Supplies is your
          one-stop shop for packaging. Let us simplify your sourcing - request a
          personalized quote and experience our commitment to quality and
          service.
        </p>
        </div>

        <div className={RequestQuoteStyles.actionBtnWrapper}>
          <a href="tel:01162607078" aria-label="Call 0116 260 7078" className="primary-btn large-btn text-large hover-primary text-uppercase">
            Make A Call
          </a>

          <Link to='/contact' className="primary-outlined-btn large-btn text-large hover-primary text-uppercase">
            Contact Us
          </Link>
        </div>
      </div>

      <div className={RequestQuoteStyles.iconsGroup}>
        <div className={RequestQuoteStyles.iconWrapperRow}>
          <div className={`${RequestQuoteStyles.iconWrapper} accent-palette`}>
            <Phone className="icon-xxl" />
          </div>
          <div className={`${RequestQuoteStyles.iconWrapper} accent-palette`}>
            <Headset className="icon-xxl" />
          </div>
        </div>
        <div className={RequestQuoteStyles.iconWrapperRow}>
          <div className={`${RequestQuoteStyles.iconWrapper} accent-palette`}>
            <AtSign className="icon-xxl" />
          </div>
          <div className={`${RequestQuoteStyles.iconWrapper} accent-palette`}>
            <Quote className="icon-xxl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestQuote;
