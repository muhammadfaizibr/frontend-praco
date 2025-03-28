import React from "react";
import {  Mail } from "lucide-react";
const NewsLetterSearchBar = () => {
  return (
      <div className="search-bar border-none">
        <input
          className="b3"
          type="text"
          name="news-letter"
          id="news-letter"
          placeholder="Email Address"
        />
    

        <button
          className="secondary-btn"
          type="button"
          name="search"
          id="search"
        >
          <Mail className={"icon-md"} />
        </button>
      </div>
  );
};

export default NewsLetterSearchBar;
