"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { Plus, Minus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(images?.[0] ?? "");
  const [scale, setScale] = useState(1);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ scale: 1, x: 0, y: 0 });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScale(1);
  }, [activeImage, controls]);

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

  return (
    <div className="flex flex-col gap-4 w-full group">
      {/* Main Large Image */}
      <div
        className="h-[400px] flex items-center justify-center overflow-hidden relative rounded-xl bg-gray-50 group-hover:cursor-zoom-in"
        onWheel={(e) => {
          // Prevent page scroll when zooming
          // Note: React's onWheel is passive by default in some versions, but we can try to preventDefault if possible,
          // or rely on a ref approach if React doesn't support non-passive checks easily.
          // However, for zoom, usually we WANT to stop propagation.
          // Let's implement the logic.
          if (e.ctrlKey || e.metaKey || true) { // Always zoom for this component as requested
            // Actually, blocking scroll on a large area might be annoying. 
            // But the user requested "scroll over the images... zoom in and out".
            // We'll trust the user wants this behavior.
          }
        }}
      >
        <div
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
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
                alt="Product image"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
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
                const currentIndex = images.indexOf(activeImage);
                const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
                setActiveImage(images[prevIndex]);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 hover:text-blue-600 transition-all z-20"
              title="Previous Image"
              type="button"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = images.indexOf(activeImage);
                const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
                setActiveImage(images[nextIndex]);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 hover:text-blue-600 transition-all z-20"
              title="Next Image"
              type="button"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveImage(img);
              setScale(1); // Reset zoom on image change
            }}
            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 p-1 ${activeImage === img ? "border-blue-600" : "border-gray-200"
              }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
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