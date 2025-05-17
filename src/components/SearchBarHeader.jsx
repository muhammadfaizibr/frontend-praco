import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBarHeaderStyles from "assets/css/SearchBarHeader.module.css";
import { Filter, Search } from "lucide-react";
import AdvanceSearchPopup from "components/AdvanceSearchPopup";
import { searchProducts } from "utils/api/ecommerce";
import CustomLoading from "components/CustomLoading";

const SearchBarHeader = () => {
  const [toggleAdvanceSearch, setToggleAdvanceSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const suggestionRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Highlight matched text
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    // Escape special regex characters and create case-insensitive regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  };

  // Handle input change with 2-second delay and cancellation
  const handleInputChange = (e) => {
    const query = e.target.value; // Preserve spaces
    setSearchQuery(query);

    // Clear previous timeout and abort controller
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Keep suggestions visible during loading
    setShowSuggestions(true);
    setIsLoading(true);
    setError(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Set timeout for 2-second delay
    timeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchProducts(query, abortControllerRef.current.signal);
        setSuggestions(results); // Update suggestions only on success
        setShowSuggestions(true);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("Search API error:", err); // Debug
        setError(err.message || "Failed to fetch suggestions");
        setSuggestions([]); // Clear suggestions only on error
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); 
  };

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/details/${product.category.slug}/${product.slug}`);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Optionally navigate to a search results page
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout and abort controller on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", display: 'flex', alignItems: 'stretch' }}>
      <div className={SearchBarHeaderStyles.searchBar}>
        <input
          className="b3"
          type="text"
          name="product-search"
          id="product-search"
          placeholder="Search Bags, Pallet Wraps, etc."
          value={searchQuery}
          onChange={handleInputChange}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="suggestion-list"
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
          onClick={handleSearch}
        >
          <Search className={"icon-md clr-white"} />
        </button>
      </div>

      {showSuggestions && (
        <div
          ref={suggestionRef}
          className={SearchBarHeaderStyles.suggestionPopup}
          role="listbox"
          id="suggestion-list"
        >
          {isLoading && (
            <CustomLoading />
          )}
          {error && (
            <div className={`${SearchBarHeaderStyles.suggestionItem} clr-red`}>{error}</div>
          )}
          {!isLoading && !error && suggestions.length === 0 && searchQuery.length >= 2 && (
            <div className={SearchBarHeaderStyles.suggestionItem}>No products found</div>
          )}
          {suggestions.map((product) => (
            <div
              key={product.id}
              className={SearchBarHeaderStyles.suggestionItem}
              onClick={() => handleSuggestionClick(product)}
              role="option"
              aria-selected="false"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(product.name, searchQuery),
                }}
              />
              <span
                className={SearchBarHeaderStyles.categoryName}
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(product.category.name, searchQuery),
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className={SearchBarHeaderStyles.advanceSearchContainer}>
        {toggleAdvanceSearch ? <AdvanceSearchPopup /> : ""}
      </div>
    </div>
  );
};

export default SearchBarHeader;