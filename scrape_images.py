import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

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
            return
            
        filepath = os.path.join(OUTPUT_FOLDER, filename)
        
        # Download image with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.actiondiversbelize.com/',
            'Accept': 'image/jpeg,image/png,image/webp,image/*,*/*;q=0.8'
        }
        
        response = requests.get(img_url, headers=headers, stream=True, timeout=10)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            print(f"✅ Downloaded: {filename}")
            downloaded_images.add(img_url)
        else:
            print(f"❌ Failed {img_url}: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Error downloading {img_url}: {e}")

def scrape_page(url):
    """Finds all images and links on a page."""
    if url in visited_pages:
        return
    visited_pages.add(url)
    print(f"\n--- Scraping Page: {url} ---")

    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')

        # 1. Find and download images
        # We check 'src', 'data-src' (for lazy loading), and 'srcset'
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or img.get('srcset')
            if src:
                # Handle srcset (take the first link)
                src = src.split(' ')[0]
                img_full_url = urljoin(url, src)
                download_image(img_full_url)

        # 2. Find internal links to crawl other pages
        for a in soup.find_all('a', href=True):
            link = urljoin(url, a['href'])
            # Clean URL (remove fragments like #contact)
            link = link.split('#')[0]
            if is_valid_page(link) and link not in visited_pages:
                # Small delay to be polite to the server
                time.sleep(0.5)
                scrape_page(link)

    except Exception as e:
        print(f"❌ Failed to scrape {url}: {e}")

if __name__ == "__main__":
    scrape_page(BASE_URL)
    print(f"\n🎉 Finished! All images saved to '{OUTPUT_FOLDER}'.")
    print(f"📊 Downloaded {len(downloaded_images)} images total")
