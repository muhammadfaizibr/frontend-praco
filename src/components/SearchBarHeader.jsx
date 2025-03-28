import React, { useState } from "react";
import SearchBarHeaderStyles from "assets/css/SearchBarHeader.module.css";
import { Filter, Search } from "lucide-react";
import AdvanceSearchPopup from "components/AdvanceSearchPopup";
const SearchBarHeader = () => {
  const [toggleAdvanceSearch, setToggleAdvanceSearch] = useState(false);
  return (
    <div style={{position: "relative", width: "100%"}}>
      <div className={SearchBarHeaderStyles.searchBar}>
        <input
          className="b3"
          type="text"
          name="product-search"
          id="product-search"
          placeholder="Search Bags, Pallet Wraps, etc."
        />
        <button
          className={SearchBarHeaderStyles.advanceSearchButton}
          type="button"
          name="advance-search-button"
          id="advance-search-button"
          onClick={() => setToggleAdvanceSearch(!toggleAdvanceSearch)}
        >
          <Filter className={`icon-md ${toggleAdvanceSearch ? "icon-orange" : "clr-gray"}`} />
        </button>

        <button
          className={SearchBarHeaderStyles.searchButton}
          type="button"
          name="search"
          id="search"
        >
          <Search className={"icon-md clr-white"} />
        </button>
      </div>

      <div className={SearchBarHeaderStyles.advanceSearchContainer}>
        {toggleAdvanceSearch ? 
            <AdvanceSearchPopup />
        : 
          ""
        }
      </div>
    </div>
  );
};

export default SearchBarHeader;
