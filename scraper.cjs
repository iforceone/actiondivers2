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

// Known Action Divers Belize image URLs
const actionDiversImages = [
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_3.jpg',
        filename: 'action-divers-1.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/image_2.jpg', 
        filename: 'action-divers-2.jpg'
    },
    {
        url: 'https://www.actiondiversbelize.com/wp-content/uploads/2013/02/action-divers-logo.jpg',
        filename: 'action-divers-logo.jpg'
    }
];

// Download all images
async function downloadAllImages() {
    console.log('Starting download of Action Divers Belize images...');
    
    for (const image of actionDiversImages) {
        try {
            await downloadImage(image.url, image.filename);
        } catch (error) {
            console.log(`Failed to download ${image.filename}`);
        }
    }
    
    console.log('Download complete!');
}

downloadAllImages().catch(console.error);
