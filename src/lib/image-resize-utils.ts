export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
}

export interface CalculateDimensionsOptions {
  originalWidth: number;
  originalHeight: number;
  targetWidth?: number;
  targetHeight?: number;
  percentage?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

export type ImageFormat = "png" | "jpeg" | "webp";

export async function resizeImage(
  image: HTMLImageElement,
  options: ResizeOptions,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  let { width, height } = options;

  if (options.maintainAspectRatio) {
    const aspectRatio = image.width / image.height;
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}

export async function loadImageFromFile(file: File): Promise<{
  image: HTMLImageElement;
  width: number;
  height: number;
}> {
  // Validate file is an image
  if (!file.type.startsWith("image/")) {
    throw new Error("File is not an image");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          image: img,
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export async function getImageDimensions(source: File | string): Promise<{
  width: number;
  height: number;
}> {
  if (source instanceof File) {
    const { width, height } = await loadImageFromFile(source);
    return { width, height };
  }

  // Source is a URL or base64 string
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image from URL"));
    };

    img.src = source;
  });
}

export function calculateDimensions(options: CalculateDimensionsOptions): {
  width: number;
  height: number;
} {
  const {
    originalWidth,
    originalHeight,
    targetWidth,
    targetHeight,
    percentage,
    maxWidth,
    maxHeight,
    maintainAspectRatio = true,
  } = options;

  const aspectRatio = originalWidth / originalHeight;

  // Calculate from percentage
  if (percentage !== undefined) {
    return {
      width: Math.round(originalWidth * (percentage / 100)),
      height: Math.round(originalHeight * (percentage / 100)),
    };
  }

  // Both dimensions specified
  if (targetWidth !== undefined && targetHeight !== undefined) {
    if (maintainAspectRatio) {
      // Fit within target dimensions
      const targetRatio = targetWidth / targetHeight;
      if (aspectRatio > targetRatio) {
        return {
          width: targetWidth,
          height: Math.round(targetWidth / aspectRatio),
        };
      } else {
        return {
          width: Math.round(targetHeight * aspectRatio),
          height: targetHeight,
        };
      }
    } else {
      return { width: targetWidth, height: targetHeight };
    }
  }

  // Only width specified
  if (targetWidth !== undefined) {
    return {
      width: targetWidth,
      height: maintainAspectRatio
        ? Math.round(targetWidth / aspectRatio)
        : originalHeight,
    };
  }

  // Only height specified
  if (targetHeight !== undefined) {
    return {
      width: maintainAspectRatio
        ? Math.round(targetHeight * aspectRatio)
        : originalWidth,
      height: targetHeight,
    };
  }

  // Fit to max dimensions
  if (maxWidth !== undefined || maxHeight !== undefined) {
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (maxWidth !== undefined && newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = maintainAspectRatio
        ? Math.round(maxWidth / aspectRatio)
        : newHeight;
    }

    if (maxHeight !== undefined && newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = maintainAspectRatio
        ? Math.round(maxHeight * aspectRatio)
        : newWidth;
    }

    return { width: newWidth, height: newHeight };
  }

  // No constraints, return original dimensions
  return { width: originalWidth, height: originalHeight };
}

export async function convertToFormat(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number = 0.92,
): Promise<string> {
  // PNG is lossless, quality parameter is ignored
  if (format === "png") {
    return canvas.toDataURL("image/png");
  }

  // JPEG and WebP support quality parameter (0.0 - 1.0)
  if (format === "jpeg") {
    return canvas.toDataURL("image/jpeg", quality);
  }

  if (format === "webp") {
    return canvas.toDataURL("image/webp", quality);
  }

  throw new Error(`Unsupported format: ${format}`);
}

export function estimateFileSize(dataUrl: string): number {
  // Remove data URL prefix (e.g., "data:image/png;base64,")
  const base64String = dataUrl.split(",")[1] || dataUrl;

  // Calculate size: each base64 character represents 6 bits
  // The actual byte size is (base64Length * 6) / 8
  // Account for padding characters (=)
  const padding = (base64String.match(/=/g) || []).length;
  const base64Length = base64String.length;

  return Math.floor((base64Length * 3) / 4 - padding);
}

export function rotateImage(
  canvas: HTMLCanvasElement,
  degrees: 90 | 180 | 270,
): HTMLCanvasElement {
  const newCanvas = document.createElement("canvas");
  const ctx = newCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  const radians = (degrees * Math.PI) / 180;

  // Adjust canvas size for 90 and 270 degree rotations
  if (degrees === 90 || degrees === 270) {
    newCanvas.width = canvas.height;
    newCanvas.height = canvas.width;
  } else {
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
  }

  // Set transform origin and rotate
  ctx.save();

  if (degrees === 90) {
    ctx.translate(newCanvas.width, 0);
    ctx.rotate(radians);
  } else if (degrees === 180) {
    ctx.translate(newCanvas.width, newCanvas.height);
    ctx.rotate(radians);
  } else if (degrees === 270) {
    ctx.translate(0, newCanvas.height);
    ctx.rotate(radians);
  }

  ctx.drawImage(canvas, 0, 0);
  ctx.restore();

  return newCanvas;
}

export function flipImage(
  canvas: HTMLCanvasElement,
  direction: "horizontal" | "vertical",
): HTMLCanvasElement {
  const newCanvas = document.createElement("canvas");
  const ctx = newCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;

  ctx.save();

  if (direction === "horizontal") {
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, -canvas.width, 0);
  } else {
    ctx.scale(1, -1);
    ctx.drawImage(canvas, 0, -canvas.height);
  }

  ctx.restore();

  return newCanvas;
}
