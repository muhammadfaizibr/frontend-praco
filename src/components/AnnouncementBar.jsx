import React from "react";
import AnnouncementBarStyles from "assets/css/AnnouncementBar.module.css";

const AnnouncementBar = () => {
  const announcement =
    "SHOP WORTH £600 AND GET UP TO 20% DISCOUNT ON ALL PRODUCTS";

  return (
    <div className={AnnouncementBarStyles.announcementBar}>
      <div className={AnnouncementBarStyles.marquee}>
        <div className="c1">
          <span>{announcement}</span>
          <span>{announcement}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
