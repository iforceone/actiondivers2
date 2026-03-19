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

// Function to fetch page content and find images
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Extract image URLs from HTML
function extractImageUrls(html) {
    const imgRegex = /<img[^>]+src=['"](https:\/\/www\.actiondiversbelize\.com[^'"]+)['"][^>]*>/gi;
    const matches = [];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png')) {
            matches.push(src);
        }
    }
    
    return [...new Set(matches)]; // Remove duplicates
}

// Main scraping function
async function scrapeActionDivers() {
    console.log('Scraping Action Divers Belize website...');
    
    const pagesToScrape = [
        'https://www.actiondiversbelize.com/',
        'https://www.actiondiversbelize.com/island-adventures/',
        'https://www.actiondiversbelize.com/scuba-dive/',
        'https://www.actiondiversbelize.com/snorkeling/',
        'https://www.actiondiversbelize.com/fishing/',
        'https://www.actiondiversbelize.com/mainland-adventures/',
        'https://www.actiondiversbelize.com/local-dives/',
        'https://www.actiondiversbelize.com/2-column/page/2/'
    ];
    
    const allImageUrls = new Set();
    
    for (const page of pagesToScrape) {
        try {
            console.log(`Scraping: ${page}`);
            const html = await fetchPage(page);
            const imageUrls = extractImageUrls(html);
            
            imageUrls.forEach(url => allImageUrls.add(url));
            console.log(`Found ${imageUrls.length} images on ${page}`);
        } catch (error) {
            console.log(`Failed to scrape ${page}: ${error.message}`);
        }
    }
    
    // Download all found images
    const imageArray = Array.from(allImageUrls);
    console.log(`\nTotal unique images found: ${imageArray.length}`);
    
    for (let i = 0; i < imageArray.length; i++) {
        const url = imageArray[i];
        const filename = `action-divers-${i + 1}.jpg`;
        
        try {
            await downloadImage(url, filename);
        } catch (error) {
            console.log(`Failed to download ${filename}`);
        }
    }
    
    console.log('\nScraping complete!');
    console.log(`Images saved to: ${galleryDir}`);
}

scrapeActionDivers().catch(console.error);
