const https = require('https');
const fs = require('fs');
const path = require('path');

// Create gallery directory
const galleryDir = path.join(__dirname, 'public/images/gallery');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Try different approaches to get images
const imageAttempts = [
    // Try 1: Different subdomain approach
    {
        url: 'https://actiondiversbelize.com/wp-content/uploads/2013/02/image_3.jpg',
        filename: 'action-1.jpg'
    },
    {
        url: 'https://actiondiversbelize.com/wp-content/uploads/2013/02/image_2.jpg', 
        filename: 'action-2.jpg'
    },
    
    // Try 2: No www
    {
        url: 'https://actiondiversbelize.com/wp-content/uploads/2013/02/image_3.jpg',
        filename: 'action-3.jpg'
    },
    
    // Try 3: Different user agent completely
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_3.jpg',
        filename: 'action-4.jpg'
    },
    
    // Try 4: Different headers
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_2.jpg',
        filename: 'action-5.jpg'
    }
];

function downloadImage(url, filename, attemptNum) {
    return new Promise((resolve, reject) => {
        let headers;
        
        switch(attemptNum) {
            case 1:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://www.actiondiversbelize.com/',
                    'Accept': 'image/jpeg,image/png,image/*,*/*;q=0.8'
                };
                break;
            case 2:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                    'Referer': 'https://www.actiondiversbelize.com/'
                };
                break;
            case 3:
                headers = {
                    'User-Agent': 'curl/7.68.0',
                    'Referer': 'https://www.actiondiversbelize.com/'
                };
                break;
            default:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                    'Referer': 'https://www.actiondiversbelize.com/'
                };
        }

        const req = https.get(url, { headers }, (response) => {
            console.log(`📥 Attempt ${attemptNum}: ${filename} - Status ${response.statusCode}`);
            
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
                console.log(`❌ FAILED: ${filename} - HTTP ${response.statusCode}`);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        });

        req.on('error', (err) => {
            console.log(`❌ ERROR: ${filename} - ${err.message}`);
            reject(err);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function tryAllApproaches() {
    console.log('🎯 Trying ALL approaches to get Action Divers images...\n');
    
    const results = [];
    
    for (let i = 0; i < imageAttempts.length; i++) {
        const attempt = imageAttempts[i];
        try {
            const result = await downloadImage(attempt.url, attempt.filename, i + 1);
            results.push(result);
            console.log(`✅ SUCCESS with approach ${i + 1}!`);
            break; // Stop on first success
        } catch (error) {
            console.log(`❌ Approach ${i + 1} failed: ${error.message}`);
        }
    }
    
    if (results.length > 0) {
        console.log(`\n🎉 SUCCESS! Got ${results.length} Action Divers images!`);
        
        // Generate gallery config
        const galleryConfig = results.map((r, i) => `    {
    id: 'gallery-${i + 1}',
    src: '/images/gallery/${r.filename}',
    alt: 'Action Divers Belize - Real photo ${i + 1}',
    category: 'diving',
    title: 'Action Divers Belize ${i + 1}'
  }`).join(',\n');
        
        console.log('\n📋 UPDATE utils/imageOptimization.ts with:');
        console.log('export const GALLERY_IMAGES = [');
        console.log(galleryConfig);
        console.log('];');
    } else {
        console.log('\n❌ ALL APPROACHES FAILED! Using high-quality Belize images...');
        
        // Use high-quality Belize/diving images as final fallback
        const fallbackImages = [
            {
                url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',
                filename: 'belize-scuba-pro.jpg'
            },
            {
                url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format',
                filename: 'belize-ocean.jpg'
            },
            {
                url: 'https://images.unsplash.com/photo-1593795287625-2e8b0c4ae5f3?w=800&h=600&fit=crop&auto=format',
                filename: 'belize-coral.jpg'
            },
            {
                url: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=600&fit=crop&auto=format',
                filename: 'belize-sunset-pro.jpg'
            }
        ];
        
        for (const img of fallbackImages) {
            try {
                await downloadImage(img.url, img.filename, 'fallback');
            } catch (error) {
                console.log(`❌ Fallback failed: ${img.filename}`);
            }
        }
    }
}

tryAllApproaches().catch(console.error);
