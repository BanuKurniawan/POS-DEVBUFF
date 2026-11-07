"use client";

import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackClassName?: string;
  iconClassName?: string;
  showFallbackText?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-contain transition-transform duration-200",
  containerClassName = "w-full h-full flex items-center justify-center bg-surface-subtle overflow-hidden relative",
  fallbackClassName = "w-full h-full flex flex-col items-center justify-center bg-surface-subtle text-text-muted p-2 select-none",
  iconClassName = "w-6 h-6 text-text-faint stroke-1",
  showFallbackText = true,
}) => {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (!src || hasError) {
    return (
      <div key="fallback" className={fallbackClassName} title={alt}>
        <Package key="fallback-icon" className={iconClassName} />
        {showFallbackText && (
          <span key="fallback-text" className="text-[9px] text-text-faint font-medium text-center line-clamp-1 mt-0.5 px-1">
            {alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <div key="image-container" className={containerClassName}>
      <img
        key="image-img"
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        className={className}
      />
    </div>
  );
};

