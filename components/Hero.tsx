"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const SLIDES = [
  {
    id: 1,
    title: "Authorized Samsung Distributor",
    subtitle: "Premium Smart Signage & Video Wall Solutions for Enterprise.",
    ctaText: "Explore Products",
    ctaLink: "/categories/digital-signage",
  },
  {
    id: 2,
    title: "Transform Your Meeting Rooms",
    subtitle: "Interactive Flip Displays that redefine collaboration.",
    ctaText: "View Interactive",
    ctaLink: "/categories/interactive",
  },
  {
    id: 3,
    title: "Next-Gen Video Walls",
    subtitle: "Seamless, high-brightness displays for 24/7 operation.",
    ctaText: "Get a Quote",
    ctaLink: "/contact",
  },
];

export default function Hero() {
  return (
    <div className="relative w-full h-[600px] md:h-[700px] bg-gray-900 overflow-hidden">
      {/* Global Background Video - Removed as requested */}
      {/* <div className="absolute inset-0 w-full h-full bg-gray-900" /> */}
      <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gray-900/70" />
      </div>

      {/* Content Slider */}
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1500}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={true}
        className="w-full h-full relative z-10"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id} className="w-full h-full">
            <div className="w-full h-full flex items-center justify-center text-center px-4">
              <div className="max-w-4xl cursor-default">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} // Re-triggers on slide change if unique key changes? Swiper handles DOM changes.
                // For swiper loops, it's safer to rely on the slide being active. 
                // But simply animating on mount of the slide works if Swiper mounts/unmounts or changing key.
                >
                  <motion.h1
                    className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {slide.title}
                  </motion.h1>


                  <motion.p
                    className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto"
                    whileHover={{
                      color: "#ffffff",
                      scale: 1.01,
                    }}
                  >
                    {slide.subtitle}
                  </motion.p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-full transition-colors shadow-lg hover:shadow-blue-600/30"
                    >
                      {slide.ctaText}
                      <ArrowRight size={20} />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}