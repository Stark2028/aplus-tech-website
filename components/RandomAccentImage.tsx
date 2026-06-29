"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Rotation of accent images for the "Aplus Advantage" section.
 * Add a new entry here to include it in the random rotation.
 */
const IMAGES = [
  "/images/collaboration.webp",
  "/images/collaboration-2.webp",
];

/**
 * Renders one of the accent images, chosen at random on each page load.
 *
 * To stay hydration-safe, the server and the first client render always show
 * IMAGES[0]; a random pick is applied in useEffect after mount, so the image
 * varies on every refresh without a server/client mismatch.
 */
export default function RandomAccentImage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Random pick runs only after mount to stay hydration-safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(Math.floor(Math.random() * IMAGES.length));
  }, []);

  return (
    <Image
      src={IMAGES[index]}
      alt="A team collaborating around a Samsung display in a meeting room"
      fill
      loading="lazy"
      sizes="(max-width: 1024px) 100vw, 50vw"
      className="object-cover"
    />
  );
}
