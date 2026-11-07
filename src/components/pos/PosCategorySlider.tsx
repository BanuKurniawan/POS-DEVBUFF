"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PosCategorySliderProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCountMap: Record<string, number>;
  className?: string;
}

export const PosCategorySlider: React.FC<PosCategorySliderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCountMap,
  className = "",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const isDraggingActiveRef = useRef(false);
  const hasDraggedFarRef = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;

    const timer = setTimeout(checkScroll, 100);
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [categories, checkScroll]);

  const handleScrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: offset,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    isDraggingActiveRef.current = true;
    hasDraggedFarRef.current = false;
    dragStartXRef.current = e.pageX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingActiveRef.current) return;
      const el = scrollContainerRef.current;
      if (!el) return;

      const deltaX = e.pageX - dragStartXRef.current;
      if (Math.abs(deltaX) > 4) {
        hasDraggedFarRef.current = true;
      }
      el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
      checkScroll();
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingActiveRef.current) {
        isDraggingActiveRef.current = false;
        setIsDragging(false);
        setTimeout(() => {
          hasDraggedFarRef.current = false;
        }, 50);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [checkScroll]);

  return (
    <div className={`relative flex items-center group/slider w-full ${className}`}>
      {/* Tombol Geser Kiri */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-3 bg-gradient-to-r from-surface via-surface/90 to-transparent">
          <button
            type="button"
            onClick={() => handleScrollBy(-220)}
            className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-text bg-surface hover:bg-surface-subtle border border-border rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            title="Geser kategori ke kiri"
            aria-label="Geser kategori ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Kontainer Kategori Scrollable */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        className={`flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none select-none scroll-smooth w-full ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCountMap[cat] ?? 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                if (hasDraggedFarRef.current) return;
                onSelectCategory(cat);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors shrink-0 ${
                isSelected
                  ? "bg-primary text-primary-foreground border border-primary shadow-xs"
                  : "bg-surface text-text hover:bg-surface-subtle border border-border"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                  isSelected
                    ? "bg-primary-hover text-primary-foreground"
                    : "bg-surface-subtle text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tombol Geser Kanan */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-3 bg-gradient-to-l from-surface via-surface/90 to-transparent">
          <button
            type="button"
            onClick={() => handleScrollBy(220)}
            className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-text bg-surface hover:bg-surface-subtle border border-border rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            title="Geser kategori ke kanan"
            aria-label="Geser kategori ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

