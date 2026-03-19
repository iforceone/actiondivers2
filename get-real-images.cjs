const https = require('https');
const fs = require('fs');
const path = require('path');

// Create gallery directory
const galleryDir = path.join(__dirname, 'public/images/gallery');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Known working Action Divers images from manual inspection
const actionDiversImages = [
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_3.jpg',
        filename: 'action-divers-real-1.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_2.jpg',
        filename: 'action-divers-real-2.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2023/02/Roberto-with-cert-e1673378098476.jpg',
        filename: 'roberto-cert.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2023/02/Shelby-with-student-e1673393398522.jpg',
        filename: 'shelby-student.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2023/02/IMG_5812-e1673401571147-300x269.jpg',
        filename: 'diving-group.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2023/02/Reef-Fishing-225x300.jpg',
        filename: 'reef-fishing.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2023/02/BBQ-Food-225x300.jpg',
        filename: 'bbq-food.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2023/02/Lobsters-300x226.jpg',
        filename: 'lobsters.jpg'
    }
];

// Function to download an image
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(galleryDir, filename));
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(path.join(galleryDir, filename));
                    console.log(`✓ Downloaded: ${filename} (${stats.size} bytes)`);
                    resolve({ filename, size: stats.size });
                });
            } else {
                console.log(`✗ Failed: ${url} - Status: ${response.statusCode}`);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filename, () => {}); // Delete partial file
            console.log(`✗ Error downloading ${url}: ${err.message}`);
            reject(err);
        });
    });
}

// Download all images
async function downloadAllImages() {
    console.log('🎯 Downloading REAL Action Divers Belize images...');
    
    const results = [];
    
    for (const image of actionDiversImages) {
        try {
            const result = await downloadImage(image.url, image.filename);
            results.push(result);
        } catch (error) {
            console.log(`❌ Failed to download ${image.filename}`);
        }
    }
    
    console.log(`\n🎉 Download complete! Got ${results.length} real images`);
    
    // Update the gallery with real images
    const realImages = results
        .filter(r => r.size > 1000) // Only keep images larger than 1KB
        .map((r, i) => `    {
    id: 'gallery-${i + 1}',
    src: '/images/gallery/${r.filename}',
    alt: 'Action Divers Belize - Real diving photo',
    category: 'diving',
    title: 'Real Belize Adventure'
  }`).join(',\n');
    
    console.log('\n📋 Copy this into your utils/imageOptimization.ts:');
    console.log('export const GALLERY_IMAGES = [');
    console.log(realImages);
    console.log('];');
}

downloadAllImages().catch(console.error);
