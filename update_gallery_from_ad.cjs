const fs = require('fs');
const path = require('path');

// Read all image files from gallery directory
const galleryDir = path.join(__dirname, 'public', 'images', 'gallery');
const files = fs.readdirSync(galleryDir);

// Filter for image files only
const imageFiles = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
});

// Create GALLERY_IMAGES array with SEO-friendly names
const galleryImages = imageFiles.map((file, index) => {
  const ext = path.extname(file).toLowerCase();
  const baseName = path.basename(file, ext);
  
  // Generate SEO-friendly alt text and title based on filename
  let title = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  let alt = `Action Divers Belize - ${title}`;
  let category = 'diving'; // default
  
  // Categorize based on filename keywords
  const lowerFile = file.toLowerCase();
  if (lowerFile.includes('snorkel')) category = 'snorkeling';
  else if (lowerFile.includes('fish') || lowerFile.includes('lobster') || lowerFile.includes('tarpon')) category = 'fishing';
  else if (lowerFile.includes('bbq') || lowerFile.includes('food') || lowerFile.includes('lunch')) category = 'dining';
  else if (lowerFile.includes('turtle') || lowerFile.includes('ray') || lowerFile.includes('octopus')) category = 'nature';
  else if (lowerFile.includes('lamani') || lowerFile.includes('cave') || lowerFile.includes('atm') || lowerFile.includes('zipline')) category = 'mainland';
  else if (lowerFile.includes('boat') || lowerFile.includes('guest')) category = 'boating';
  
  return {
    id: `gallery-${index + 1}`,
    src: `/images/gallery/${file}`,
    alt: alt,
    category: category,
    title: title
  };
});

// Generate the TypeScript content
const content = `import { GalleryImage } from '../types';

export const GALLERY_IMAGES: GalleryImage[] = [
${galleryImages.map(img => `  {
    id: '${img.id}',
    src: '${img.src}',
    alt: '${img.alt}',
    category: '${img.category}',
    title: '${img.title}'
  }`).join(',\n')}
];

export const IMAGES_PER_PAGE = 12;
export const TOTAL_IMAGES = ${galleryImages.length};
export const TOTAL_PAGES = Math.ceil(${galleryImages.length} / 12);

// Missing function that Gallery component needs
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};
`;

// Write to imageOptimization.ts
fs.writeFileSync(path.join(__dirname, 'utils', 'imageOptimization.ts'), content, 'utf8');

console.log(`✅ Updated GALLERY_IMAGES with ${galleryImages.length} images from AD folder`);
console.log('📝 Categories:', [...new Set(galleryImages.map(img => img.category))]);
