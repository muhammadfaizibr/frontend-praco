import React from "react";
import Products from "components/Products";
import BreadCrumb from "components/BreadCrumb";
import SearchResults from "components/SearchResults";

const Search = () => {
    
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
        <SearchResults />
      </div>
    </div>
  );
};

export default Search;
