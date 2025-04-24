import React from "react";
import styles from "assets/css/Notification.module.css";

const Notification = ({ message, type, visible }) => {
  if (!visible || !message) return null;

  return (
    <div className={`${styles.notification} ${styles[type]} b3 clr-white`}>
      {message}
    </div>
  );
};

export default Notification;