const MAX_IMAGE_EDGE = 2560;
const WEBP_QUALITY = 0.82;
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

/** Compress a raster image before upload. The original is never sent to Storage. */
export async function optimizeImageForUpload(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size < 1 || file.size > MAX_INPUT_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Your browser could not process this image. Please try another file.");
    context.drawImage(bitmap, 0, 0, width, height);

    const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
    if (webp?.type === "image/webp") return webp;
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
    if (jpeg?.type === "image/jpeg") return jpeg;
    throw new Error("This image could not be optimized. Please try another image.");
  } catch (error) {
    if (error instanceof Error && error.message) throw error;
    throw new Error("This image could not be processed. Please choose another image.");
  } finally {
    bitmap?.close();
  }
}
