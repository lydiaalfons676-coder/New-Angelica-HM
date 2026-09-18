from pathlib import Path
root = Path(r'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)')
files = sorted(root.glob('bag*.html'))
print(f"COUNT bag files: {len(files)}")
print([f.name for f in files][:100])
# check related blocks
import re
for f in files[:10]:
    t = f.read_text(encoding='utf-8')
    m = re.search(r'<div class="related-products">(.*?)<!-- نهاية related-products -->', t, re.DOTALL)
    if m:
        inner = m.group(1)
        cards = re.findall(r'class="related-card"', inner)
        imgs = re.findall(r'<img[^>]+src="([^"]+)"', inner)
        print(f.name, f"cards={len(cards)} imgs={imgs}")
    else:
        print(f.name, "NO RELATED")
# check bag1 canonical
t1 = (root/'bag1.html').read_text(encoding='utf-8')
m1 = re.search(r'<h3>👜 Related Products</h3>.*?</div>\s*<!-- نهاية related-products -->', t1, re.DOTALL)
print("----BAG1 BLOCK----")
print(m1.group(0)[:2000] if m1 else "not found")
