const https = require('https');
const fs = require('fs');
const path = require('path');

// Create gallery directory
const galleryDir = path.join(__dirname, 'public/images/gallery');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Try different approach - download from page and extract images
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        };

        https.get(url, options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Extract image URLs from HTML
function extractImageUrls(html) {
    const imgRegex = /<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi;
    const matches = [];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.includes('actiondiversbelize.com') && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
            matches.push(src);
        }
    }
    
    return [...new Set(matches)]; // Remove duplicates
}

// Download image with better error handling
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.actiondiversbelize.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        };

        const req = https.get(url, options, (response) => {
            console.log(`📥 ${filename}: ${response.statusCode}`);
            
            if (response.statusCode === 200) {
                const chunks = [];
                response.on('data', chunk => chunks.push(chunk));
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    fs.writeFileSync(path.join(galleryDir, filename), buffer);
                    console.log(`✅ SUCCESS: ${filename} (${buffer.length} bytes)`);
                    resolve({ filename, size: buffer.length });
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

        req.setTimeout(20000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function getImagesBetter() {
    console.log('🔍 Fetching Action Divers homepage...');
    
    try {
        const html = await fetchPage('https://www.actiondiversbelize.com/');
        const imageUrls = extractImageUrls(html);
        
        console.log(`📸 Found ${imageUrls.length} image URLs on page`);
        
        // Download first few images
        const results = [];
        for (let i = 0; i < Math.min(6, imageUrls.length); i++) {
            const url = imageUrls[i];
            const filename = `action-divers-${i + 1}.jpg`;
            
            try {
                const result = await downloadImage(url, filename);
                results.push(result);
            } catch (error) {
                console.log(`❌ Failed: ${filename}`);
            }
        }
        
        console.log(`\n🎉 SUCCESS: Downloaded ${results.length} images!`);
        
        // Generate gallery config
        if (results.length > 0) {
            const galleryConfig = results.map((r, i) => `    {
    id: 'gallery-${i + 1}',
    src: '/images/gallery/${r.filename}',
    alt: 'Action Divers Belize - Original photo ${i + 1}',
    category: 'diving',
    title: 'Action Divers Belize ${i + 1}'
  }`).join(',\n');
            
            console.log('\n📋 UPDATE utils/imageOptimization.ts with:');
            console.log('export const GALLERY_IMAGES = [');
            console.log(galleryConfig);
            console.log('];');
        } else {
            console.log('\n❌ No images downloaded. Using fallback approach...');
            // Use working Unsplash images as fallback
            const fallbackImages = [
                {
                    filename: 'belize-diving-1.jpg',
                    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format'
                },
                {
                    filename: 'belize-diving-2.jpg', 
                    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format'
                },
                {
                    filename: 'belize-diving-3.jpg',
                    url: 'https://images.unsplash.com/photo-1593795287625-2e8b0c4ae5f3?w=800&h=600&fit=crop&auto=format'
                }
            ];
            
            for (const img of fallbackImages) {
                try {
                    await downloadImage(img.url, img.filename);
                } catch (error) {
                    console.log(`❌ Fallback failed: ${img.filename}`);
                }
            }
        }
        
    } catch (error) {
        console.log(`❌ Page fetch failed: ${error.message}`);
    }
}

getImagesBetter().catch(console.error);
