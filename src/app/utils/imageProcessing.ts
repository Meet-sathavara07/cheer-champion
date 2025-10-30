// utils/imageProcessing.ts
import { Base64 } from "js-base64";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_GIF_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_PROFILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_DIMENSION = 1024;

interface CompressedImageResult {
  compressedFile: File;
  previewUrl: string;
}

export const isGifFile = (file: File): boolean => {
  return file.type === 'image/gif';
};

export const isWebPFile = (file: File): boolean => {
  return file.type === 'image/webp';
};

// File size validation
export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

export const validateGifSize = (file: File): boolean => {
  return file.size <= MAX_GIF_SIZE;
};

export const validateProfileSize = (file: File): boolean => {
  return file.size <= MAX_PROFILE_SIZE;
};

// Image compression
export const compressImage = async (file: File): Promise<CompressedImageResult> => {
  // If it's already WebP or GIF, return as is
  if (isWebPFile(file) || isGifFile(file)) {
    const previewUrl = await createPreviewUrl(file);
    return { compressedFile: file, previewUrl };
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        } else {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          
          // Create compressed file with .webp extension
          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          // Create preview URL
          const previewUrl = canvas.toDataURL('image/webp', 0.8);
          
          resolve({ compressedFile, previewUrl });
        },
        'image/webp',
        0.8 // 80% quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Create preview URL from File
export const createPreviewUrl = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      resolve(base64String);
    };
    reader.onerror = () => reject(new Error('Failed to create preview'));
    reader.readAsDataURL(file);
  });
};

// Convert base64 to File
export const base64ToFile = async (base64String: string, fileName: string): Promise<File> => {
  try {
    // Extract the base64 data and MIME type
    const [prefix, base64Data] = base64String.split(',');
    if (!base64Data || !prefix) {
      throw new Error('Invalid base64 string format');
    }

    // Decode base64 to binary and ensure ArrayBuffer
    const byteArray = Base64.toUint8Array(base64Data);
    const arrayBuffer = byteArray.buffer.slice(
      byteArray.byteOffset,
      byteArray.byteOffset + byteArray.byteLength
    ) as ArrayBuffer; // Explicitly cast to ArrayBuffer
    const typedArray = new Uint8Array(arrayBuffer);

    // Extract MIME type
    const mimeType = prefix.match(/data:([^;]+);/)?.[1];
    if (!mimeType) {
      throw new Error('Invalid MIME type in base64 string');
    }

    const file = new File([typedArray], fileName, { type: mimeType });
    
    // If it's already in a supported format (GIF or WebP), return as-is
    if (isGifFile(file) || isWebPFile(file)) {
      return file;
    }
    
    // For other image types, compress to WebP
    const { compressedFile } = await compressImage(file);
    return compressedFile;
  } catch (error) {
    console.error('Error converting base64 to File:', error);
    throw new Error('Failed to convert base64 to File');
  }
};