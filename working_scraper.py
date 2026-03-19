import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import re

# --- CONFIGURATION ---
BASE_URL = "https://www.actiondiversbelize.com/"
DOMAIN = urlparse(BASE_URL).netloc
OUTPUT_FOLDER = "action_divers_images"

# Create output folder
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

visited_pages = set()
downloaded_images = set()

def is_valid_page(url):
    """Ensure the link is internal to the website."""
    parsed = urlparse(url)
    return parsed.netloc == DOMAIN or parsed.netloc == ""

def download_image(img_url):
    """Downloads a single image and saves it to the output folder."""
    if img_url in downloaded_images:
        return
    
    try:
        # Get the filename from the URL
        filename = os.path.basename(urlparse(img_url).path)
        if not filename:
            # Generate filename from URL if needed
            filename = f"image_{len(downloaded_images) + 1}.jpg"
            
        filepath = os.path.join(OUTPUT_FOLDER, filename)
        
        # Use EXACT browser headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.actiondiversbelize.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'same-origin',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '"Not_A)Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
        
        print(f"📥 Downloading: {filename}")
        response = requests.get(img_url, headers=headers, stream=True, timeout=15)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'image' in content_type:
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(8192):
                        f.write(chunk)
                print(f"✅ SUCCESS: {filename} ({len(response.content)} bytes)")
                downloaded_images.add(img_url)
                return True
            else:
                print(f"❌ Not an image: {filename} - Content-Type: {content_type}")
        else:
            print(f"❌ HTTP {response.status_code}: {img_url}")
            
    except Exception as e:
        print(f"❌ Error downloading {img_url}: {e}")
        return False

def scrape_page(url):
    """Finds all images and links on a page."""
    if url in visited_pages:
        return
    visited_pages.add(url)
    print(f"\n--- Scraping Page: {url} ---")

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.text, 'html.parser')

        # 1. Find and download images - check ALL possible attributes
        images_found = 0
        for img in soup.find_all('img'):
            # Check all possible image source attributes
            possible_sources = [
                img.get('src'),
                img.get('data-src'),
                img.get('srcset'),
                img.get('data-srcset'),
                img.get('data-lazy-src')
            ]
            
            for src in possible_sources:
                if src and src.strip():
                    # Handle srcset (take first URL)
                    src = src.split(' ')[0].strip()
                    
                    # Skip data URLs and tiny images
                    if src.startswith('data:') or '1x1' in src:
                        continue
                        
                    img_full_url = urljoin(url, src)
                    
                    # Only download images from the domain
                    if DOMAIN in img_full_url and (img_full_url.endswith('.jpg') or img_full_url.endswith('.jpeg') or img_full_url.endswith('.png')):
                        if download_image(img_full_url):
                            images_found += 1

        print(f"📸 Found {images_found} images on this page")

        # 2. Find internal links to crawl other pages
        links_found = 0
        for a in soup.find_all('a', href=True):
            link = urljoin(url, a['href'])
            # Clean URL (remove fragments like #contact)
            link = link.split('#')[0]
            
            if is_valid_page(link) and link not in visited_pages:
                links_found += 1
                # Small delay to be polite
                time.sleep(1)
                scrape_page(link)

        print(f"🔗 Found {links_found} new links on this page")

    except Exception as e:
        print(f"❌ Failed to scrape {url}: {e}")

if __name__ == "__main__":
    print("🎯 Starting Action Divers Belize Image Scraper...")
    print(f"📂 Output folder: {OUTPUT_FOLDER}")
    
    scrape_page(BASE_URL)
    
    print(f"\n🎉 Finished! All images saved to '{OUTPUT_FOLDER}'.")
    print(f"📊 Total images downloaded: {len(downloaded_images)}")
    
    # List all downloaded files
    if os.path.exists(OUTPUT_FOLDER):
        files = os.listdir(OUTPUT_FOLDER)
        image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f"\n📋 Downloaded files:")
        for i, file in enumerate(image_files, 1):
            filepath = os.path.join(OUTPUT_FOLDER, file)
            size = os.path.getsize(filepath)
            print(f"  {i}. {file} ({size:,} bytes)")
