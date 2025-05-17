import React, { useState } from "react";
import ImagePreviewStyles from "assets/css/ImagePreviewStyles.module.css";
import { X } from "lucide-react";

const ImagePreview = ({ images, onClose, variantName, productName }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [imageLoadFailed, setImageLoadFailed] = useState({});


  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  const handleImageError = (imageUrl) => {
    setImageLoadFailed((prev) => ({ ...prev, [imageUrl]: true }));
  };

  return (
    <div className={ImagePreviewStyles.overlay}>
      <div className={ImagePreviewStyles.container}>
        <div className={ImagePreviewStyles.imagePreviewStylesHeader}>

          <h5
            className={`${ImagePreviewStyles.header} clr-text`}
            aria-label={`Product: ${variantName || "Unknown"} - ${
              productName || "Unknown"
            }`}
          >
            {variantName || "Unknown"} - {productName || "Unknown"}
          </h5>
          <button
            className={ImagePreviewStyles.closeButton}
            onClick={onClose}
            aria-label="Close image preview">
            <X className="icon-m" />
          </button>
        </div>
        <div className={ImagePreviewStyles.mainImageContainer}>
          {imageLoadFailed[selectedImage] ? (
            <span className="b3 clr-gray">Image Not Available</span>
          ) : (
            <img
              src={selectedImage}
              alt="Selected product preview"
              className={ImagePreviewStyles.mainImage}
              onError={() => handleImageError(selectedImage)}
            />
          )}
        </div>
        <div className={ImagePreviewStyles.thumbnailContainer}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`${ImagePreviewStyles.thumbnail} ${
                selectedImage === image
                  ? ImagePreviewStyles.thumbnailSelected
                  : ""
              }`}
              onClick={() => handleThumbnailClick(image)}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleThumbnailClick(image);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Select thumbnail ${index + 1}`}
            >
              {imageLoadFailed[image] ? (
                <span className="b3 clr-gray">Image Not Available</span>
              ) : (
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={ImagePreviewStyles.thumbnailImage}
                  onError={() => handleImageError(image)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
