import React, {useEffect} from "react";
// import Products from "components/Products";
// import BreadCrumb from "components/BreadCrumb";
import SearchResults from "components/SearchResults";

const Search = () => {

      useEffect(()=>{
        document.title = 'Search Results - Praco';
      }, [])
    
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
        <SearchResults />
      </div>
    </div>
  );
};

export default Search;
