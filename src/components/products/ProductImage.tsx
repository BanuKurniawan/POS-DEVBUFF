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
  containerClassName = "w-full h-full flex items-center justify-center bg-surface-subtle overflow-hidden",
  fallbackClassName = "w-full h-full flex flex-col items-center justify-center bg-surface-subtle text-text-muted p-2 select-none",
  iconClassName = "w-6 h-6 text-text-faint stroke-1",
  showFallbackText = true,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={fallbackClassName} title={alt}>
        <Package className={iconClassName} />
        {showFallbackText && (
          <span className="text-[9px] text-text-faint font-medium text-center line-clamp-1 mt-0.5 px-1">
            {alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        className={className}
      />
    </div>
  );
};

