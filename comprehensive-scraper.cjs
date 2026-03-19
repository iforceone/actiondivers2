const https = require('https');
const fs = require('fs');
const path = require('path');

// Create gallery directory
const galleryDir = path.join(__dirname, 'public/images/gallery');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Function to download an image
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(galleryDir, filename));
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded: ${filename}`);
                    resolve(filename);
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

// Function to fetch page content and find ALL images
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Extract ALL image URLs from HTML - more comprehensive patterns
function extractImageUrls(html) {
    const patterns = [
        /<img[^>]+src=['"](https:\/\/www\.actiondiversbelize\.com[^'"]+)['"][^>]*>/gi,
        /src=['"](https:\/\/www\.actiondiversbelize\.com[^'"]+)['"]/gi,
        /src="([^"]+actiondiversbelize[^"]*\.(?:jpg|jpeg|png|gif|webp))"/gi
    ];
    
    const allMatches = [];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            const src = match[1] || match[match.length - 1];
            if (src && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.gif') || src.includes('.webp'))) {
                allMatches.push(src);
            }
        }
    });
    
    return [...new Set(allMatches)]; // Remove duplicates
}

// Main scraping function - COMPREHENSIVE
async function scrapeAllActionDiversImages() {
    console.log('🔍 COMPREHENSIVE SCRAPE of Action Divers Belize...');
    
    const pagesToScrape = [
        'https://www.actiondiversbelize.com/',
        'https://www.actiondiversbelize.com/about/',
        'https://www.actiondiversbelize.com/island-adventures/',
        'https://www.actiondiversbelize.com/scuba-dive/',
        'https://www.actiondiversbelize.com/snorkeling/',
        'https://www.actiondiversbelize.com/fishing/',
        'https://www.actiondiversbelize.com/beach-bar-b-q/',
        'https://www.actiondiversbelize.com/mainland-adventures/',
        'https://www.actiondiversbelize.com/local-dives/',
        'https://www.actiondiversbelize.com/scuba-instructions/',
        'https://www.actiondiversbelize.com/2-column/',
        'https://www.actiondiversbelize.com/2-column/page/2/',
        'https://www.actiondiversbelize.com/blog/',
        'https://www.actiondiversbelize.com/contact/'
    ];
    
    const allImageUrls = new Set();
    
    for (const page of pagesToScrape) {
        try {
            console.log(`📄 Scraping: ${page}`);
            const html = await fetchPage(page);
            const imageUrls = extractImageUrls(html);
            
            imageUrls.forEach(url => allImageUrls.add(url));
            console.log(`📸 Found ${imageUrls.length} images on ${page}`);
        } catch (error) {
            console.log(`❌ Failed to scrape ${page}: ${error.message}`);
        }
    }
    
    // Also try common WordPress uploads directory patterns
    const commonPaths = [
        'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/',
        'https://www.actiondiversbelize.com/wp-content/uploads/',
        'https://www.actiondiversbelize.com/wp-content/gallery/',
        'https://www.actiondiversbelize.com/images/'
    ];
    
    for (const basePath of commonPaths) {
        try {
            console.log(`📁 Checking directory: ${basePath}`);
            const html = await fetchPage(basePath);
            const imageUrls = extractImageUrls(html);
            
            imageUrls.forEach(url => allImageUrls.add(url));
            console.log(`📸 Found ${imageUrls.length} images in directory`);
        } catch (error) {
            console.log(`❌ Failed to check directory ${basePath}: ${error.message}`);
        }
    }
    
    // Download ALL found images
    const imageArray = Array.from(allImageUrls);
    console.log(`\n🎯 TOTAL UNIQUE IMAGES FOUND: ${imageArray.length}`);
    
    for (let i = 0; i < imageArray.length; i++) {
        const url = imageArray[i];
        // Create meaningful filename
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const cleanFilename = filename.includes('?') ? filename.split('?')[0] : filename;
        const finalFilename = cleanFilename || `action-divers-${i + 1}.jpg`;
        
        try {
            await downloadImage(url, finalFilename);
        } catch (error) {
            console.log(`❌ Failed to download ${finalFilename}`);
        }
    }
    
    console.log('\n🎉 COMPREHENSIVE SCRAPING COMPLETE!');
    console.log(`📂 Images saved to: ${galleryDir}`);
    console.log(`📊 Downloaded ${imageArray.length} total images`);
}

scrapeAllActionDiversImages().catch(console.error);
