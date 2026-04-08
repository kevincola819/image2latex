import os
import urllib.request
import sys

def download_file(url, dest):
    print(f"Downloading {url} to {dest}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
        length = int(response.getheader('content-length'))
        chunk_size = max(4096, length // 100)
        downloaded = 0
        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            out_file.write(chunk)
            downloaded += len(chunk)
            percent = int(downloaded * 100 / length)
            sys.stdout.write(f"\r[{percent:3d}%] {downloaded}/{length} bytes")
            sys.stdout.flush()
    print("\nDone.")

def main():
    import site
    site_packages = [p for p in site.getsitepackages() if 'site-packages' in p]
    if not site_packages:
        print("Cannot find site-packages")
        return
        
    target_dir = os.path.join(site_packages[0], 'pix2tex', 'model', 'checkpoints')
    if not os.path.exists(target_dir):
        target_dir = os.path.join(sys.prefix, 'lib', f'python{sys.version_info.major}.{sys.version_info.minor}', 'site-packages', 'pix2tex', 'model', 'checkpoints')
        
    print(f"Target directory: {target_dir}")
    os.makedirs(target_dir, exist_ok=True)
    
    proxies = [
        "https://mirror.ghproxy.com/",
        "https://gh-proxy.com/",
        "https://ghproxy.net/"
    ]
    
    files = {
        'weights.pth': 'https://github.com/lukas-blecher/LaTeX-OCR/releases/download/v0.0.1/weights.pth',
        'image_resizer.pth': 'https://github.com/lukas-blecher/LaTeX-OCR/releases/download/v0.0.1/image_resizer.pth'
    }
    
    expected_sizes = {
        'weights.pth': 97424683,
        'image_resizer.pth': 1612447
    }
    
    for filename, original_url in files.items():
        dest = os.path.join(target_dir, filename)
        
        if os.path.exists(dest):
            actual_size = os.path.getsize(dest)
            if actual_size >= expected_sizes[filename]:
                print(f"{filename} already fully downloaded ({actual_size} bytes). Skipping.")
                continue
            else:
                print(f"{filename} is incomplete ({actual_size} < {expected_sizes[filename]}). Redownloading...")
                os.remove(dest)
                
        success = False
        for proxy in proxies:
            proxy_url = proxy + original_url
            try:
                download_file(proxy_url, dest)
                success = True
                break
            except Exception as e:
                print(f"\nFailed to download using {proxy_url}: {e}")
                
        if not success:
            print(f"Failed to download {filename} from all proxies.")

if __name__ == "__main__":
    main()
