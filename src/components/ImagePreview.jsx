import React, { useState } from "react";
import ImagePreviewStyles from "assets/css/ImagePreviewStyles.module.css";
import { X } from "lucide-react";

const ImagePreview = ({ images, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [imageLoadFailed, setImageLoadFailed] = useState({});

  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  const handleImageError = (imageUrl) => {
    setImageLoadFailed((prev) => ({ ...prev, [imageUrl]: true }));
  };

  return (
    <div className={ImagePreviewStyles.imagePreviewOverlay}>
      <div className={ImagePreviewStyles.imagePreviewContainer}>
        <button
          className={ImagePreviewStyles.closePreviewButton}
          onClick={onClose}
          aria-label="Close image preview"
        >
          <X className="icon-xms" />
        </button>
        <div className={ImagePreviewStyles.mainImageWrapper}>
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
        <div className={ImagePreviewStyles.thumbnailWrapper}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`${ImagePreviewStyles.thumbnailContainer} ${selectedImage === image ? ImagePreviewStyles.thumbnailSelected : ""}`}
              onClick={() => handleThumbnailClick(image)}
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