/**
 * Format a number as Philippine Peso
 */
export const formatPHP = (value: number): string => {
  return new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP' 
  }).format(value);
};

/**
 * Get the current year-month with an optional offset
 */
export const getCurrentYearMonth = (offset: number = 0): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Get the image format from a data URL
 */
export const getImgFormat = (dataUrl: string): string => {
  if (typeof dataUrl !== 'string') return 'PNG';
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/jpeg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/gif')) return 'GIF';
  return 'PNG';
};

/**
 * Resize and compress an image file
 */
export const resizeAndCompressImage = async (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Maximum size
        const MAX_SIZE = 800;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}; 