# Pomodoro Timer Background Images

This directory should contain predefined background images for the Pomodoro timer.

## Required Files

Place the following WebP files in this directory:

- `desk-1.webp` - Desk workspace image
- `desk-2.webp` - Modern office image
- `nature-1.webp` - Nature/forest image
- `abstract-1.webp` - Abstract pattern
- `minimal-1.webp` - Minimal/solid color

## Image Specifications

- **Format**: WebP (optimal compression)
- **Dimensions**: 1920x1080 or 2560x1440
- **Size**: Max 200KB per image
- **Aspect Ratio**: 16:9

## Where to Get Images

### Free Image Resources

1. **Unsplash** - https://unsplash.com/
   - Free high-quality images
   - No attribution required

2. **Pexels** - https://www.pexels.com/
   - Free stock photos
   - No attribution required

3. **Pixabay** - https://pixabay.com/
   - Free images and videos
   - Pixabay License

### Recommended Search Terms

- "desk workspace minimalist"
- "modern office desk"
- "forest nature calm"
- "abstract gradient"
- "minimal background"

### Converting to WebP

Use one of these methods:

#### Method 1: AdaTools Webp Convesrter
- use our own module to convert to webp

#### Method 2: cwebp (CLI tool)

```bash
# Install cwebp
# Ubuntu/Debian: sudo apt-get install webp
# macOS: brew install webp

# Convert and compress
cwebp -q 85 input.jpg -o output.webp
```

#### Method 3: ImageMagick

```bash
# Install ImageMagick
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick

# Convert to WebP
magick input.jpg -quality 85 output.webp
```

### Resizing Images

If your images are too large:

```bash
# Resize to 1920x1080
magick input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 output.jpg

# Then convert to WebP
cwebp -q 85 output.jpg -o final.webp
```

## Example Workflow

1. Download image from Unsplash
2. Resize to 1920x1080 if needed (optional)
3. Convert to WebP at 85% quality
4. Check file size (should be < 200KB)
5. If too large, reduce quality to 75-80%
6. Rename to appropriate filename (desk-1.webp, etc.)

## Quick Download & Convert Script

```bash
cd /home/lucy/DEV/ada-tools/public/images/pomodoro/backgrounds

# Download example images (replace URLs with actual image URLs)
# Then convert them to WebP

# Example: Download and convert
wget -O temp.jpg "YOUR_IMAGE_URL_HERE"
cwebp -q 85 temp.jpg -o desk-1.webp
rm temp.jpg

# Repeat for each image...
```

## Testing Images

After adding the files, verify they load correctly:

1. Start the dev server: `pnpm dev`
2. Open browser console
3. Test image URL: http://localhost:3000/images/pomodoro/backgrounds/desk-1.webp

## Suggested Image Themes

### desk-1.webp
Clean, organized desk workspace with laptop, notebook, and coffee

### desk-2.webp
Modern minimalist office with plants and natural light

### nature-1.webp
Peaceful forest scene or mountain landscape

### abstract-1.webp
Soft gradient or geometric pattern (calming colors)

### minimal-1.webp
Solid color or very subtle texture (e.g., soft blue, warm beige)

---

**Note**: Make sure all images are appropriate for a productivity/focus application and have calming, non-distracting aesthetics.
