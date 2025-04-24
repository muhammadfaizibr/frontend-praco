import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import HeadingBar from "components/HeadingBar";
import { searchItems } from "utils/api/ecommerce";
import TableStyles from "assets/css/TableStyles.module.css";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const location = useLocation();
  const isFetchingRef = useRef(false);

  const fetchResults = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping...");
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    setResults([]);

    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }

    try {
      const params = new URLSearchParams(location.search);
      const queryParams = Object.fromEntries(params.entries());

      const requiredParams = ['width', 'length', 'height', 'measurement_unit', 'category'];
      const missingParams = requiredParams.filter(param => !queryParams[param]);
      if (missingParams.length > 0) {
        setError(`Missing required parameters: ${missingParams.join(', ')}`);
        setIsLoading(false);
        return;
      }

      const dimensions = ['width', 'length', 'height'];
      for (const dim of dimensions) {
        const value = parseFloat(queryParams[dim]);
        if (isNaN(value) || value <= 0) {
          setError(`Invalid ${dim}: must be a positive number`);
          setIsLoading(false);
          return;
        }
      }

      const validUnits = ['MM', 'CM', 'IN', 'M'];
      if (!validUnits.includes(queryParams.measurement_unit)) {
        setError(`Invalid measurement unit: must be one of ${validUnits.join(', ')}`);
        setIsLoading(false);
        return;
      }

      const validCategories = ['box', 'boxes', 'bag', 'bags', 'postal', 'postals'];
      if (!validCategories.includes(queryParams.category.toLowerCase())) {
        setError(`Invalid category: must be one of ${validCategories.join(', ')}`);
        setIsLoading(false);
        return;
      }

      console.log("Fetching results with params:", queryParams);
      const response = await searchItems(queryParams, abortControllerRef.current.signal);
      console.log("Search response:", response);
      setResults(response.results || []);
      console.log("Parsed results:", response.results);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Search request aborted");
        return;
      }
      console.error("Search error:", err);
      setError(err.message || "Failed to fetch search results");
      setResults([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [location.search]);

  useEffect(() => {
    if (!isFetchingRef.current) {
      fetchResults();
    }

    return () => {
      if (abortControllerRef.current && !isFetchingRef.current) {
        console.log("Cleaning up: Aborting request on unmount");
        abortControllerRef.current.abort();
      }
    };
  }, [fetchResults]);

  return (
    <div className={TableStyles.container}>
      <HeadingBar
        displayType={"column"}
        headline={"Search Results"}
        headlineSize={"h4"}
        headlineSizeType={"tag"}
      />

      {isLoading && <div className={TableStyles.loading}>Loading...</div>}

      {error && <div className={`${TableStyles.error} clr-red`}>{error}</div>}

      {results.length > 0 && (
        <div className={TableStyles.tableContentWrapper}>
          <div className={TableStyles.tableContainer}>
            <table className={TableStyles.table}>
              <thead>
                <tr>
                  <th className="l3 clr-accent-dark-blue">Image</th>
                  <th className="l3 clr-accent-dark-blue">SKU</th>
                  <th className={`${TableStyles.colLongWidth} l3 clr-accent-dark-blue`}>Title</th>
                  <th className="l3 clr-accent-dark-blue">Dimensions</th>
                  <th className="l3 clr-accent-dark-blue">Details</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.id}>
                    <td className="c3">
                      {item.images && item.images[0] ? (
                        <div className={TableStyles.colImageWrapper}>
                          <div className={TableStyles.colImageContainer}>
                            <img
                              src={item.images[0].image}
                              alt={item.images[0].alt_text || item.title || "Item image"}
                              loading="lazy"
                              style={{ maxWidth: "50px" }}
                            />
                          </div>
                        </div>
                      ) : (
                        "No image"
                      )}
                    </td>
                    <td className="c3">{item.sku}</td>
                    <td className={`${TableStyles.colLongWidth} c3`}>
                      {item.title || "N/A"}
                    </td>
                    <td className="c3">
                      {item.width} × {item.length} × {item.height} {item.measurement_unit}
                    </td>
                    <td className="c3">
                      {item.product_variant && item.product_variant.product && item.product_variant.product.category ? (
                        <Link
                          to={`/details/${item.product_variant.product.category.name.toLowerCase()}/${item.product_variant.product.slug}`}
                          className="primary-btn small-btn text-small hover-primary"
                        >
                          View Details
                        </Link>
                      ) : (
                        <span className="text-muted">Details unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && results.length === 0 && !error && (
        <div className={TableStyles.noResults}>No results found.</div>
      )}

      <div className="row-content justify-content-flex-end gap-xs">
        <Link to="/" className="secondary-btn large-btn text-large hover-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default SearchResults;