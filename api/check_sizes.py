import os

def main():
    target_dir = 'venv/lib/python3.9/site-packages/pix2tex/model/checkpoints'
    for f in os.listdir(target_dir):
        path = os.path.join(target_dir, f)
        print(f"{f}: {os.path.getsize(path)} bytes")
        
    weights = os.path.join(target_dir, 'weights.pth')
    if os.path.exists(weights) and os.path.getsize(weights) < 90_000_000:
        print("weights.pth is incomplete, removing...")
        os.remove(weights)
        
    resizer = os.path.join(target_dir, 'image_resizer.pth')
    if os.path.exists(resizer) and os.path.getsize(resizer) < 1_000_000:
        print("image_resizer.pth is incomplete, removing...")
        os.remove(resizer)

if __name__ == '__main__':
    main()
