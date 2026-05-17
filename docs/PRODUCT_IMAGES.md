# Product Images Documentation

## Directory Structure

Product images are organized in the following structure:

```
public/
  products/
    smart-signage/
      samsung-qet-series-50/
        image-1.jpg
        image-2.jpg
        image-3.jpg
      samsung-qet-series-55/
        image-1.jpg
        ...
    video-walls/
      samsung-vmb-e-series/
        image-1.jpg
        ...
    interactive/
      samsung-flip-pro-wm85b/
        image-1.jpg
        ...
    business-tv/
      samsung-business-tv-55/
        image-1.jpg
        ...
    hotel-tv/
      samsung-hospitality-tv/
        image-1.jpg
        ...
    touch-displays/
      samsung-touch-display-32/
        image-1.jpg
        ...
```

## Image Naming Conventions

### Directory Names
- Use kebab-case (lowercase with hyphens)
- Format: `{brand}-{product-series}-{size}` or `{brand}-{product-name}`
- Examples:
  - `samsung-qet-series-50`
  - `samsung-flip-pro-wm85b`
  - `samsung-vmb-e-series`

### Image File Names
- Use lowercase with hyphens: `image-1.jpg`, `image-2.jpg`, etc.
- Start numbering from 1
- Use consistent numbering across all products
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

## Recommended Image Dimensions

### Main Product Images
- **Width**: 1200px - 1920px
- **Height**: 800px - 1080px
- **Aspect Ratio**: 16:9 or 3:2
- **Format**: WebP or AVIF (preferred), JPG (fallback)

### Thumbnail Images
- **Width**: 256px - 512px
- **Height**: 256px - 512px
- **Aspect Ratio**: 1:1 (square) or match main image
- **Format**: WebP or AVIF (preferred), JPG (fallback)

## Image Optimization Guidelines

### Before Uploading
1. **Compress images** using tools like:
   - [Squoosh](https://squoosh.app/)
   - [TinyPNG](https://tinypng.com/)
   - [ImageOptim](https://imageoptim.com/)

2. **Convert to WebP/AVIF** when possible:
   - Better compression
   - Smaller file sizes
   - Maintains quality

3. **Target file sizes**:
   - Main images: < 500KB
   - Thumbnails: < 100KB

### Image Quality
- Use **80-85% quality** for JPG images
- Use **75-80% quality** for WebP images
- Balance between file size and visual quality

## Adding New Product Images

### Step 1: Create Directory
Create a new directory following the naming convention:
```bash
public/products/{category}/{product-id}/
```

### Step 2: Add Images
Place images in the directory with names:
- `image-1.jpg` (main image)
- `image-2.jpg` (secondary image)
- `image-3.jpg` (tertiary image)
- etc.

### Step 3: Update Product Data
In `data/products.ts`, update the product's `images` array:
```typescript
images: [
  '/products/smart-signage/samsung-qet-series-50/image-1.jpg',
  '/products/smart-signage/samsung-qet-series-50/image-2.jpg',
  '/products/smart-signage/samsung-qet-series-50/image-3.jpg',
]
```

Or use the helper function:
```typescript
import { getProductImages } from '@/lib/image-utils';

const images = getProductImages('smart-signage', 'samsung-qet-series-50', 3);
// Returns: { main, thumbnails, all }
```

## Placeholder Images

If a product doesn't have images yet, use the placeholder:
- Path: `/placeholder-product.jpg`
- Should be a generic product placeholder image
- Dimensions: 1200x800px

## Next.js Image Component Usage

Always use Next.js `Image` component instead of `<img>` tags:

```tsx
import Image from 'next/image';
import { getProductImageSrc } from '@/lib/image-utils';

<Image
  src={getProductImageSrc(product.images[0])}
  alt={product.name}
  width={1200}
  height={800}
  priority={isMainImage}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## Categories Reference

- `smart-signage` - Smart Signage displays
- `video-walls` - Video Wall solutions
- `interactive` - Interactive displays
- `business-tv` - Business TV models
- `hotel-tv` - Hotel/Hospitality TV
- `touch-displays` - Touch display products

## Best Practices

1. **Consistency**: Use the same number of images per product when possible
2. **Quality**: Ensure all images are high-quality and professional
3. **Relevance**: Images should showcase the product clearly
4. **Optimization**: Always optimize before uploading
5. **Alt Text**: Always provide descriptive alt text for accessibility
6. **Responsive**: Images should work well on all screen sizes
