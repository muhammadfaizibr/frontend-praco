import React from "react";
import { MessageCircle } from "lucide-react";
import styles from "assets/css/WhatsappChat.module.css";

const WhatsappChat = () => {
  const phoneNumber = "447754446300"; 
  const message = "I have a few questions. Can you help?";

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsappBtn}
    >
      <MessageCircle className={styles.icon} />
      <span className={styles.text}>Chat with us</span>
    </a>
  );
};

export default WhatsappChat;
