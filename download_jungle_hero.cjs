const https = require('https');
const fs = require('fs');
const path = require('path');

// High-quality jungle/adventure images from Unsplash that fit mainland adventures theme
const jungleImages = [
  {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb86709e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    filename: 'jungle-adventure-1.jpg',
    description: 'Dense tropical jungle with sunlight filtering through'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    filename: 'jungle-adventure-2.jpg',
    description: 'Lush tropical rainforest with adventure path'
  },
  {
    url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    filename: 'jungle-adventure-3.jpg',
    description: 'Tropical forest canopy with adventure feel'
  },
  {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    filename: 'jungle-adventure-4.jpg',
    description: 'Mystical jungle pathway with ancient ruins feel'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    filename: 'jungle-adventure-5.jpg',
    description: 'Adventure trail through dense rainforest'
  }
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'public', 'images', 'gallery', filename);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(filePath);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      console.error(`❌ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

async function downloadJungleImages() {
  console.log('🌴 Downloading high-quality jungle adventure images from Unsplash...');
  
  try {
    // Download the first 3 images for variety
    const imagesToDownload = jungleImages.slice(0, 3);
    
    for (const image of imagesToDownload) {
      try {
        await downloadImage(image.url, image.filename);
        console.log(`📝 Description: ${image.description}`);
      } catch (err) {
        console.log(`⚠️  Failed to download ${image.filename}`);
      }
    }
    
    console.log('\n🎉 Jungle hero images downloaded successfully!');
    console.log('📁 Available images:');
    imagesToDownload.forEach(img => console.log(`   - ${img.filename}: ${img.description}`));
    
  } catch (error) {
    console.error('❌ Error downloading images:', error.message);
  }
}

// Run the download
downloadJungleImages();
