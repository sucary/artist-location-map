import type { CropArea } from '../types/artist';

/**
 * Builds a Cloudinary URL with crop transformation parameters
 * @param sourceUrl - The original Cloudinary image URL
 * @param crop - The crop area coordinates (optional)
 * @param outputWidth - Desired output width (optional)
 * @returns The transformed Cloudinary URL
 */
export function buildCroppedImageUrl(
    sourceUrl: string | undefined,
    crop: CropArea | undefined,
    outputWidth?: number
): string | undefined {
    if (!sourceUrl) return undefined;
    if (!crop) return sourceUrl;

    const uploadIndex = sourceUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
        return sourceUrl;
    }

    // Build crop transformation string
    // c_crop = crop mode, x/y/w/h = crop coordinates
    const cropTransform = `c_crop,x_${Math.round(crop.x)},y_${Math.round(crop.y)},w_${Math.round(crop.width)},h_${Math.round(crop.height)}`;

    // Optionally add resize after crop
    const resizeTransform = outputWidth ? `/c_scale,w_${outputWidth}` : '';

    const transformations = cropTransform + resizeTransform;

    // Insert transformations after /upload/
    const beforeUpload = sourceUrl.substring(0, uploadIndex + 8);
    const afterUpload = sourceUrl.substring(uploadIndex + 8);

    return `${beforeUpload}${transformations}/${afterUpload}`;
}

/**
 * Builds avatar URL from source image and crop data
 */
export function getAvatarUrl(sourceImage?: string, avatarCrop?: CropArea): string | undefined {
    return buildCroppedImageUrl(sourceImage, avatarCrop, 400);
}

/**
 * Builds profile banner URL from source image and crop data
 */
export function getProfileUrl(sourceImage?: string, profileCrop?: CropArea): string | undefined {
    return buildCroppedImageUrl(sourceImage, profileCrop, 800);
}
