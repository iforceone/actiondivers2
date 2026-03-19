const https = require('https');
const fs = require('fs');
const path = require('path');

// Create gallery directory
const galleryDir = path.join(__dirname, 'public/images/gallery');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Function to download with proper headers and error checking
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.actiondiversbelize.com/',
                'Accept': 'image/jpeg,image/png,image/*,*/*;q=0.8'
            }
        };

        const req = https.get(url, options, (response) => {
            console.log(`Status: ${response.statusCode} for ${url}`);
            console.log(`Content-Type: ${response.headers['content-type']}`);
            console.log(`Content-Length: ${response.headers['content-length']}`);
            
            if (response.statusCode === 200 && response.headers['content-type'] && response.headers['content-type'].startsWith('image/')) {
                const file = fs.createWriteStream(path.join(galleryDir, filename));
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(path.join(galleryDir, filename));
                    console.log(`✅ Downloaded: ${filename} (${stats.size} bytes)`);
                    resolve({ filename, size: stats.size, contentType: response.headers['content-type'] });
                });
                
                file.on('error', (err) => {
                    console.log(`❌ File write error: ${err.message}`);
                    reject(err);
                });
            } else {
                console.log(`❌ Invalid response: Status ${response.statusCode}, Content-Type: ${response.headers['content-type']}`);
                reject(new Error(`Invalid response: ${response.statusCode}`));
            }
        });

        req.on('error', (err) => {
            console.log(`❌ Request error: ${err.message}`);
            reject(err);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Test different URLs
const testUrls = [
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_3.jpg',
        filename: 'test-image-3.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_2.jpg',
        filename: 'test-image-2.jpg'
    }
];

async function testDownload() {
    console.log('🔍 Testing Action Divers image downloads...');
    
    for (const test of testUrls) {
        try {
            const result = await downloadImage(test.url, test.filename);
            console.log(`✅ SUCCESS: ${result.filename}`);
        } catch (error) {
            console.log(`❌ FAILED: ${test.filename} - ${error.message}`);
        }
    }
    
    console.log('\n🔍 Let\'s also check what the server actually returns...');
    
    // Test what the server returns
    for (const test of testUrls) {
        try {
            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            };
            
            const req = https.get(test.url, options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    console.log(`\n=== ${test.url} ===`);
                    console.log(`Status: ${response.statusCode}`);
                    console.log(`Content-Type: ${response.headers['content-type']}`);
                    console.log(`Content-Length: ${response.headers['content-length']}`);
                    console.log(`First 200 chars: ${data.substring(0, 200)}`);
                    
                    if (data.startsWith('<!DOCTYPE') || data.startsWith('<html')) {
                        console.log('❌ Server returned HTML instead of image!');
                    }
                });
            });
            
            req.on('error', (err) => {
                console.log(`❌ Request error: ${err.message}`);
            });
            
        } catch (error) {
            console.log(`❌ Error testing ${test.url}: ${error.message}`);
        }
    }
}

testDownload().catch(console.error);
