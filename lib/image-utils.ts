/**
 * Image utility functions for product images
 */

export interface ProductImagePaths {
  main: string;
  thumbnails: string[];
  all: string[];
}

/**
 * Get the image path for a product image
 * @param category - Product category slug (e.g., 'smart-signage')
 * @param productId - Product ID/slug (e.g., 'samsung-qet-series-50')
 * @param imageName - Image filename (e.g., 'image-1.jpg')
 * @returns Full path to the image
 */
export function getProductImagePath(
  category: string,
  productId: string,
  imageName: string
): string {
  return `/products/${category}/${productId}/${imageName}`;
}

/**
 * Get all image paths for a product
 * @param category - Product category slug
 * @param productId - Product ID/slug
 * @param imageCount - Number of images (default: 3)
 * @returns Object with main image and thumbnail paths
 */
export function getProductImages(
  category: string,
  productId: string,
  imageCount: number = 3
): ProductImagePaths {
  const images: string[] = [];
  
  for (let i = 1; i <= imageCount; i++) {
    images.push(getProductImagePath(category, productId, `image-${i}.jpg`));
  }

  return {
    main: images[0] || '/placeholder-product.jpg',
    thumbnails: images.slice(1),
    all: images,
  };
}

/**
 * Get product image paths from product data
 * @param product - Product object with category and id
 * @param imageCount - Number of images (default: 3)
 * @returns Object with main image and thumbnail paths
 */
export function getProductImagePaths(
  product: { category: string; id: string },
  imageCount?: number
): ProductImagePaths {
  return getProductImages(product.category, product.id, imageCount);
}

/**
 * Fallback image path when product image is missing
 */
export const FALLBACK_IMAGE = '/placeholder-product.jpg';

/**
 * Check if an image path is a local path (starts with /)
 */
export function isLocalImage(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

/**
 * Get optimized image src for Next.js Image component
 * @param imagePath - Image path (local or external)
 * @returns Image src string
 */
export function getOptimizedImageSrc(imagePath: string): string {
  if (isLocalImage(imagePath)) {
    return imagePath;
  }
  // External images will be handled by Next.js Image component
  return imagePath;
}
