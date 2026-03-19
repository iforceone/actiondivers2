const https = require('https');
const fs = require('fs');
const path = require('path');

// Create gallery directory
const galleryDir = path.join(__dirname, 'public/images/gallery');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Get images from SAME SITE with proper headers
const sameSiteImages = [
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_3.jpg',
        filename: 'action-divers-scuba.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_2.jpg',
        filename: 'action-divers-group.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/Original-Logo-75px.jpg',
        filename: 'action-divers-logo.jpg'
    }
];

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.actiondiversbelize.com/',
                'Accept': 'image/jpeg,image/png,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        };

        const req = https.get(url, options, (response) => {
            console.log(`📥 ${filename}: Status ${response.statusCode}`);
            
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(path.join(galleryDir, filename));
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(path.join(galleryDir, filename));
                    console.log(`✅ SUCCESS: ${filename} (${stats.size} bytes)`);
                    resolve({ filename, size: stats.size });
                });
                
                file.on('error', (err) => {
                    console.log(`❌ File error: ${err.message}`);
                    reject(err);
                });
            } else {
                console.log(`❌ HTTP ${response.statusCode}: ${url}`);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        });

        req.on('error', (err) => {
            console.log(`❌ Request error: ${err.message}`);
            reject(err);
        });

        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function downloadSameSiteImages() {
    console.log('🎯 Downloading from SAME SITE with proper headers...');
    
    const results = [];
    
    for (const image of sameSiteImages) {
        try {
            const result = await downloadImage(image.url, image.filename);
            results.push(result);
        } catch (error) {
            console.log(`❌ FAILED: ${image.filename}`);
        }
    }
    
    console.log(`\n🎉 Got ${results.length} images from SAME SITE!`);
    
    // Generate gallery config
    const galleryConfig = results.map((r, i) => `    {
    id: 'gallery-${i + 1}',
    src: '/images/gallery/${r.filename}',
    alt: 'Action Divers Belize - ${r.filename.replace('.jpg', '')}',
    category: ${i === 0 ? "'diving'" : i === 1 ? "'diving'" : "'logo'"},
    title: 'Action Divers Belize ${i + 1}'
  }`).join(',\n');
    
    console.log('\n📋 UPDATE utils/imageOptimization.ts with:');
    console.log('export const GALLERY_IMAGES = [');
    console.log(galleryConfig);
    console.log('];');
    
    return results;
}

downloadSameSiteImages().catch(console.error);
