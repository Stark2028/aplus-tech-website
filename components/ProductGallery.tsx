"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { Plus, Minus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images?.[activeIndex] ?? "";
  const [scale, setScale] = useState(1);
  const controls = useAnimation();
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset zoom transform whenever the displayed image changes.
  useEffect(() => {
    controls.start({ scale: 1, x: 0, y: 0 });
  }, [activeIndex, controls]);

  useEffect(() => {
    const strip = thumbStripRef.current;
    const thumb = thumbRefs.current[activeIndex];
    if (!strip || !thumb) return;
    const stripLeft = strip.scrollLeft;
    const stripRight = stripLeft + strip.clientWidth;
    const thumbLeft = thumb.offsetLeft;
    const thumbRight = thumbLeft + thumb.offsetWidth;
    if (thumbLeft < stripLeft) {
      strip.scrollTo({ left: thumbLeft - 8, behavior: "smooth" });
    } else if (thumbRight > stripRight) {
      strip.scrollTo({ left: thumbRight - strip.clientWidth + 8, behavior: "smooth" });
    }
  }, [activeIndex]);

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.5, 3);
    setScale(newScale);
    controls.start({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, 1);
    setScale(newScale);
    controls.start({ scale: newScale });
  };

  const handleReset = () => {
    setScale(1);
    controls.start({ scale: 1, x: 0, y: 0 });
  };

  const goPrev = () => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    setScale(1);
  };
  const goNext = () => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    setScale(1);
  };

  // Touch swipe to change image — only when not zoomed (zoom uses drag-to-pan).
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (scale > 1) return;
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (scale > 1 || touchStartX.current === null || images.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <div className="flex flex-col gap-4 w-full group">
      {/* Main Large Image */}
      <div className="h-100 flex items-center justify-center overflow-hidden relative rounded-xl bg-gray-50 group-hover:cursor-zoom-in">
        <div
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onWheel={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const delta = -e.deltaY * 0.001;
            const newScale = Math.min(Math.max(1, scale + delta), 3);

            setScale(newScale);
            controls.start({ scale: newScale });
          }}
        >
          {activeImage ? (
            <motion.div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
              }}
              animate={controls}
              drag={scale > 1}
              dragConstraints={{
                left: -((scale - 1) * 200),
                right: ((scale - 1) * 200),
                top: -((scale - 1) * 200),
                bottom: ((scale - 1) * 200),
              }}
              dragElastic={0.1}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={activeImage}
                alt={`${productName} — view ${activeIndex + 1} of ${images.length}`}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-contain pointer-events-none"
                priority
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-50"
            disabled={scale <= 1}
            title="Zoom Out"
            type="button"
          >
            <Minus size={20} className="text-gray-700" />
          </button>
          <span className="min-w-[3ch] text-center font-medium text-sm text-gray-700 flex items-center justify-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-50"
            disabled={scale >= 3}
            title="Zoom In"
            type="button"
          >
            <Plus size={20} className="text-gray-700" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-100 rounded-md ml-1 border-l border-gray-200 pl-2"
            title="Reset"
            type="button"
          >
            <RefreshCw size={18} className="text-gray-700" />
          </button>
        </div>
        {/* Navigation Buttons (Only if > 1 image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 hover:text-blue-600 transition-all z-20"
              title="Previous Image"
              aria-label="Previous image"
              type="button"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 hover:text-blue-600 transition-all z-20"
              title="Next Image"
              aria-label="Next image"
              type="button"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </>
        )}

      </div>

      {/* Thumbnails */}
      <div ref={thumbStripRef} className="flex gap-4 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <button
            key={index}
            ref={(el) => { thumbRefs.current[index] = el; }}
            onClick={() => {
              setActiveIndex(index);
              setScale(1);
            }}
            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 p-1 ${activeIndex === index ? "border-blue-600" : "border-gray-200"
              }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={img}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover rounded-md"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}