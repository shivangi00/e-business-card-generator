// src/utils/imageHelpers.js

/**
 * Convert image file to base64 string
 * @param {File} file - Image file from input
 * @returns {Promise<string>} Base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result); // This is the base64 string
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Resize image before converting to base64 (to reduce file size)
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width (default 800px)
 * @param {number} maxHeight - Maximum height (default 800px)
 * @returns {Promise<string>} Resized base64 data URL
 */
export function resizeAndConvertImage(file, maxWidth = 800, maxHeight = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 (JPEG with 85% quality for smaller file size)
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64);
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if image is already base64
 * @param {string} src - Image source
 * @returns {boolean} True if base64
 */
export function isBase64Image(src) {
  return src && src.startsWith('data:image/');
}

/**
 * Check if image is a blob URL
 * @param {string} src - Image source
 * @returns {boolean} True if blob URL
 */
export function isBlobUrl(src) {
  return src && src.startsWith('blob:');
}
