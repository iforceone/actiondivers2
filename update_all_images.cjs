const fs = require('fs');
const path = require('path');

// Get all images from gallery folder
const galleryDir = path.join(__dirname, 'public/images/gallery');
const files = fs.readdirSync(galleryDir);

// Filter image files
const imageFiles = files.filter(file => 
  file.toLowerCase().endsWith('.jpg') || 
  file.toLowerCase().endsWith('.jpeg') || 
  file.toLowerCase().endsWith('.png')
);

console.log(`Found ${imageFiles.length} image files`);

// Generate gallery configuration
const galleryConfig = imageFiles.map((file, index) => {
  // Determine category based on filename
  let category = 'diving';
  let title = file.replace(/\.(jpg|jpeg|png)$/i, '').replace(/-/g, ' ');
  
  if (file.toLowerCase().includes('snorkel') || file.toLowerCase().includes('surface')) {
    category = 'snorkeling';
  } else if (file.toLowerCase().includes('fish') || file.toLowerCase().includes('lobster') || file.toLowerCase().includes('tarpon') || file.toLowerCase().includes('barracuda')) {
    category = 'fishing';
  } else if (file.toLowerCase().includes('bbq') || file.toLowerCase().includes('food') || file.toLowerCase().includes('lunch') || file.toLowerCase().includes('ceviche')) {
    category = 'dining';
  } else if (file.toLowerCase().includes('boat') || file.toLowerCase().includes('three')) {
    category = 'boating';
  } else if (file.toLowerCase().includes('turtle') || file.toLowerCase().includes('ray') || file.toLowerCase().includes('octopus')) {
    category = 'nature';
  } else if (file.toLowerCase().includes('lamani') || file.toLowerCase().includes('zipline')) {
    category = 'mainland';
  }
  
  return `    {
    id: 'gallery-${index + 1}',
    src: '/images/gallery/${file}',
    alt: 'Action Divers Belize - ${title}',
    category: '${category}',
    title: '${title.charAt(0).toUpperCase() + title.slice(1)}'
  }`;
}).join(',\n');

console.log('\n// ALL Action Divers Belize images - COMPLETE COLLECTION');
console.log('export const GALLERY_IMAGES = [');
console.log(galleryConfig);
console.log('];');

// Save to file
const output = `// ALL Action Divers Belize images - COMPLETE COLLECTION
export const GALLERY_IMAGES = [
${galleryConfig}
];

export const IMAGES_PER_PAGE = 12;
export const TOTAL_IMAGES = ${imageFiles.length};
export const TOTAL_PAGES = Math.ceil(${imageFiles.length} / 12);
`;

fs.writeFileSync(path.join(__dirname, 'utils/imageOptimization.ts'), output);
console.log(`\n✅ Updated imageOptimization.ts with all ${imageFiles.length} images!`);
console.log(`📊 ${imageFiles.length} total images = ${Math.ceil(imageFiles.length / 12)} pages of 12 images each`);
