"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { products } from "@/data/products";

export default function ProductMarquee() {
    // Double the products list to ensure smooth seamless looping
    const marqueeProducts = [...products, ...products];

    return (
        <section className="py-20 bg-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
                <h2 className="text-6xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    Our Lineup
                </h2>
            </div>

            {/* Gradient Masks for Fading edges */}
            <div className="absolute top-0 left-0 w-32 h-full z-10 bg-linear-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-full z-10 bg-linear-to-l from-white to-transparent pointer-events-none" />

            <div className="flex relative overflow-hidden group">
                <motion.div
                    className="flex gap-8 px-4"
                    animate={{
                        x: ["0%", "-50%"],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40,
                            ease: "linear",
                        },
                    }}
                    style={{ willChange: "transform" }}
                    // Pause on hover
                    whileHover={{ animationPlayState: "paused" }}
                >
                    {marqueeProducts.map((product, index) => (
                        <Link
                            key={`${product.id}-${index}`}
                            href={`/products/${product.id}`}
                            className="flex-shrink-0 w-64 md:w-80 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group/card block"
                        >
                            <div className="relative h-48 w-full bg-white p-6 flex items-center justify-center">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={200}
                                        height={200}
                                        className="object-contain w-full h-full transform transition-transform duration-300 group-hover/card:scale-105"
                                    />
                                ) : (
                                    <div className="text-gray-300 text-sm">No Image</div>
                                )}
                            </div>
                            <div className="p-4 bg-white border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 min-h-[3rem]">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-blue-600 font-medium mt-2 uppercase tracking-wide">
                                    {product.series}
                                </p>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
