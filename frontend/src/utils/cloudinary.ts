/**
 * Cloudinary image upload utility
 */

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

interface CloudinaryError {
  error: {
    message: string;
  };
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn('Cloudinary environment variables not set. Image upload will not work.');
}

/**
 * Validates image file before upload
 */
export const validateImageFile = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Only JPG, PNG, and WebP images are allowed';
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return 'Image size must be smaller than 5 MB';
  }

  return null;
};

/**
 * Uploads image to Cloudinary
 * @returns The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured. Check environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData: CloudinaryError = await response.json();
    throw new Error(errorData.error?.message || 'Upload failed');
  }

  const data: CloudinaryUploadResponse = await response.json();
  return data.secure_url;
};

