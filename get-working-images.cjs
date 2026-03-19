const https = require('https');
const fs = require('fs');
const path = require('path');

// Create gallery directory
const galleryDir = path.join(__dirname, 'public/images/gallery');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Use Unsplash images that we KNOW work and match Belize/diving themes
const workingImages = [
    {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',
        filename: 'belize-scuba-diving.jpg',
        title: 'Belize Scuba Diving Adventure'
    },
    {
        url: 'https://images.unsplash.com/photo-1593795287625-2e8b0c4ae5f3?w=800&h=600&fit=crop&auto=format',
        filename: 'belize-snorkeling.jpg',
        title: 'Belize Snorkeling Experience'
    },
    {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format',
        filename: 'belize-sunset.jpg',
        title: 'Caribbean Sunset Belize'
    },
    {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
        filename: 'belize-fishing.jpg',
        title: 'Deep Sea Fishing Belize'
    },
    {
        url: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=600&fit=crop&auto=format',
        filename: 'belize-beach-bbq.jpg',
        title: 'Beach BBQ Experience'
    },
    {
        url: 'https://images.unsplash.com/photo-1502904550090-2a5a5b4c4b9e?w=800&h=600&fit=crop&auto=format',
        filename: 'belize-maya-ruins.jpg',
        title: 'Maya Ruins Tour'
    }
];

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(galleryDir, filename));
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(path.join(galleryDir, filename));
                    console.log(`✅ Downloaded: ${filename} (${stats.size} bytes)`);
                    resolve({ filename, size: stats.size });
                });
            } else {
                console.log(`❌ Failed: ${url} - Status: ${response.statusCode}`);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            console.log(`❌ Error downloading ${url}: ${err.message}`);
            reject(err);
        });
    });
}

async function downloadWorkingImages() {
    console.log('🎯 Downloading WORKING Belize/diving themed images...');
    
    const results = [];
    
    for (const image of workingImages) {
        try {
            const result = await downloadImage(image.url, image.filename);
            results.push({ ...result, ...image });
        } catch (error) {
            console.log(`❌ Failed to download ${image.filename}`);
        }
    }
    
    console.log(`\n🎉 Download complete! Got ${results.length} working images`);
    
    // Generate the gallery configuration
    const galleryConfig = results.map((r, i) => `    {
    id: 'gallery-${i + 1}',
    src: '/images/gallery/${r.filename}',
    alt: '${r.title} - Belize diving adventure',
    category: ${i < 2 ? "'diving'" : i < 4 ? "'snorkeling'" : "'mainland'"},
    title: '${r.title}'
  }`).join(',\n');
    
    console.log('\n📋 Copy this into your utils/imageOptimization.ts:');
    console.log('export const GALLERY_IMAGES = [');
    console.log(galleryConfig);
    console.log('];');
    
    return results;
}

downloadWorkingImages().catch(console.error);
