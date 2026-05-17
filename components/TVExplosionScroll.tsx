"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const FRAME_COUNT = 120;
const FRAME_PATH = "/images/tv-sequence/tv_frame_";
const FRAME_EXT = ".webp";

export default function TVExplosionScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Hook into scroll progress of the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // Map scroll to frame index (0 to FRAME_COUNT - 1)
    const frameIndex = useTransform(smoothProgress, [0, 1], [0, FRAME_COUNT - 1]);

    // Preload Images
    useEffect(() => {
        let loadedCount = 0;
        const imgArray: HTMLImageElement[] = [];
        const promises: Promise<void>[] = [];

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const promise = new Promise<void>((resolve) => {
                const img = new Image();
                // Pad numbers to 3 digits: 001, 002, ... 120
                const frameNumber = i.toString().padStart(3, "0");
                img.src = `${FRAME_PATH}${frameNumber}${FRAME_EXT}`;
                img.onload = () => {
                    loadedCount++;
                    setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
                    resolve();
                };
                img.onerror = () => {
                    // Resolve even on error to avoid blocking, maybe set a fallback flag
                    console.warn(`Failed to load frame ${i}`);
                    loadedCount++;
                    setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
                    resolve();
                };
                imgArray[i - 1] = img; // Store in 0-indexed array
            });
            promises.push(promise);
        }

        Promise.all(promises).then(() => {
            setImages(imgArray);
            setIsLoading(false);
        });
    }, []);

    // Render Canvas
    useEffect(() => {
        if (isLoading || images.length === 0) return;

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Ensure canvas size matches window or container
            // For high text sharpness, we can handle devicePixelRatio, 
            // but for images, simple sizing is usually okay unless we want super crisp rendering.
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            // Set actual size in memory (scaled to account for extra pixel density)
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
            }

            // Clear canvas
            // ctx.clearRect(0, 0, rect.width, rect.height); // Not strictly needed if we draw cover, but good practice

            // Get current frame index
            const currentIndex = Math.round(frameIndex.get());
            const img = images[currentIndex];

            if (img && img.complete && img.naturalHeight !== 0) {
                // Calculate "object-fit: contain" logic
                const hRatio = rect.width / img.width;
                const vRatio = rect.height / img.height;
                const ratio = Math.min(hRatio, vRatio);
                const centerShift_x = (rect.width - img.width * ratio) / 2;
                const centerShift_y = (rect.height - img.height * ratio) / 2;

                ctx.drawImage(
                    img,
                    0,
                    0,
                    img.width,
                    img.height,
                    centerShift_x,
                    centerShift_y,
                    img.width * ratio,
                    img.height * ratio
                );
            } else {
                // Fallback if image missing (Visual debugging)
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, rect.width, rect.height);
                ctx.font = "20px Inter";
                ctx.fillStyle = "#0f172a";
                ctx.textAlign = "center";

                // Only show this detailed text if we really want to debug in production
                // ctx.fillText(`Frame ${currentIndex + 1} Missing`, rect.width / 2, rect.height / 2);
            }
        };

        // Subscribing to the change safely defined inside useEffect
        // We use a simple RAF loop or subscribe to motion value changes
        const unsubscribe = frameIndex.on("change", () => {
            requestAnimationFrame(render);
        });

        // Initial render
        requestAnimationFrame(render);

        // Debounced resize handler
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                requestAnimationFrame(render);
            }, 100);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            unsubscribe();
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [isLoading, images, frameIndex]);

    // Opacity & Glow transforms
    // Phase 1: Visible from start (opacity 1), eventually fades out as display folds (0.35-0.45)
    const text1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.45], [1, 1, 0]);
    const text1TextShadow = useTransform(scrollYProgress,
        [0, 0.15, 0.3, 0.45],
        [
            "0 0 0px rgba(255,255,255,0)",
            "0 0 50px rgba(255,255,255,1), 0 0 100px rgba(255,255,255,0.8)",
            "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)",
            "0 0 0px rgba(255,255,255,0)"
        ]
    );

    // Phase 3: Pure Innovation - Appears, Glows, then Dims to normal white
    const text3Opacity = useTransform(scrollYProgress, [0.75, 0.85, 1], [0, 1, 1]);
    const text3TextShadow = useTransform(scrollYProgress,
        [0.75, 0.85, 1],
        [
            "0 0 0px rgba(255,255,255,0)",
            "0 0 60px rgba(255,255,255,1), 0 0 120px rgba(255,255,255,0.8)",
            "0 0 0px rgba(255,255,255,0)"
        ]
    );

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[300vh] bg-white"
        >
            <div className="sticky top-0 w-full h-screen overflow-hidden">
                {/* Background Gradient (Subtle light mode gradient) */}
                <div
                    className="absolute inset-0 z-0 bg-white"
                // style={{
                //     background: "radial-gradient(circle, #f8fafc 0%, #ffffff 100%)"
                // }}
                />

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white text-gray-900">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium tracking-widest uppercase text-gray-500">Loading 8K Experience... {loadingProgress}%</p>
                    </div>
                )}

                {/* Canvas for TV Sequence */}
                {/* Added cyan outer glow as requested: shadow-[#00FFFF]/20 */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 z-10 w-full h-full object-contain shadow-[0_0_50px_rgba(0,255,255,0.1)]"
                />

                {/* Text Overlays - Pointer events none to allow scrolling through */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center max-w-7xl mx-auto px-6">

                    {/* Phase 1: Unrivaled 8K Clarity - Now Centered */}
                    <motion.div
                        style={{ opacity: text1Opacity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl text-center"
                    >
                        <motion.h2
                            style={{ textShadow: text1TextShadow }}
                            className="text-5xl md:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl"
                        >
                            Unrivaled 8K Clarity
                        </motion.h2>

                    </motion.div>

                    {/* Phase 3: The Future of Display - Now Top Center */}
                    <motion.div
                        style={{ opacity: text3Opacity }}
                        className="absolute top-32 left-1/2 -translate-x-1/2 w-full text-center px-4"
                    >
                        <motion.h2
                            style={{ textShadow: text3TextShadow }}
                            className="text-5xl md:text-8xl font-bold text-white mb-6 tracking-tighter drop-shadow-2xl whitespace-nowrap"
                        >
                            Pure Innovation
                        </motion.h2>

                    </motion.div>

                </div>

            </div>
        </div>
    );
}
