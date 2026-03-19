const https = require('https');
const fs = require('fs');
const path = require('path');

// Proper tropical jungle/rainforest images that are actually appropriate for Belize
const properJungleImages = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    filename: 'belize-jungle-1.jpg',
    description: 'Tropical rainforest jungle path - appropriate for Belize'
  },
  {
    url: 'https://images.unsplash.com/photo-1540206395-68808572332f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    filename: 'belize-jungle-2.jpg',
    description: 'Green tropical forest - Belize appropriate'
  },
  {
    url: 'https://images.unsplash.com/photo-1518547937559-65d63936ce2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    filename: 'belize-jungle-3.jpg',
    description: 'Tropical jungle walkway - suitable for Belize'
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

async function downloadProperJungleImages() {
  console.log('🌴 Downloading PROPER tropical jungle images (NO MOUNTAINS!)...');
  
  try {
    // Remove the incorrect mountain images first
    const incorrectImages = ['jungle-adventure-1.jpg', 'jungle-adventure-2.jpg', 'jungle-adventure-3.jpg'];
    
    for (const img of incorrectImages) {
      try {
        const filePath = path.join(__dirname, 'public', 'images', 'gallery', img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Removed incorrect image: ${img}`);
        }
      } catch (err) {
        console.log(`⚠️  Could not remove ${img}`);
      }
    }
    
    // Download proper tropical jungle images
    for (const image of properJungleImages) {
      try {
        await downloadImage(image.url, image.filename);
        console.log(`📝 Description: ${image.description}`);
      } catch (err) {
        console.log(`⚠️  Failed to download ${image.filename}`);
      }
    }
    
    console.log('\n🎉 PROPER tropical jungle images downloaded!');
    console.log('📁 Available images:');
    properJungleImages.forEach(img => console.log(`   - ${img.filename}: ${img.description}`));
    
  } catch (error) {
    console.error('❌ Error downloading images:', error.message);
  }
}

// Run the download
downloadProperJungleImages();
