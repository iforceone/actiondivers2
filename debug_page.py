import requests
from bs4 import BeautifulSoup

def debug_page():
    url = "https://www.actiondiversbelize.com/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    
    print("🔍 Fetching page to debug...")
    response = requests.get(url, headers=headers, timeout=15)
    
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    print(f"Content-Length: {len(response.text)}")
    
    # Save HTML to file for inspection
    with open('debug_page.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    print("💾 Saved HTML to debug_page.html")
    
    # Parse and look for images
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all img tags
    images = soup.find_all('img')
    print(f"\n📸 Found {len(images)} img tags:")
    
    for i, img in enumerate(images[:10]):  # Show first 10
        print(f"\n--- Image {i+1} ---")
        print(f"Tag: {str(img)[:100]}...")
        
        attrs = ['src', 'data-src', 'srcset', 'data-srcset', 'data-lazy-src']
        for attr in attrs:
            value = img.get(attr)
            if value:
                print(f"{attr}: {value[:100]}...")
    
    # Also look for any URLs that contain actiondiversbelize and image extensions
    text = response.text
    import re
    
    # Find all URLs that look like images
    url_pattern = r'https?://[^"\s]*actiondiversbelize[^"\s]*\.(jpg|jpeg|png|gif|webp)'
    matches = re.findall(url_pattern, text, re.IGNORECASE)
    
    print(f"\n🔗 Found {len(matches)} image URLs in HTML:")
    for i, match in enumerate(matches[:10]):
        print(f"  {i+1}. {match}")

if __name__ == "__main__":
    debug_page()
