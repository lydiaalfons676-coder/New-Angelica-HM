import re
from pathlib import Path
root = Path(r'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)')
targets = sorted(root.glob('bag*.html')) + [root/'product.html']
print(f"found {len(targets)}")
for p in targets:
    t = p.read_text(encoding='utf-8')
    has = 'related-products' in t
    # count closes
    print(p.name, 'has-related=', has, 'len=', len(t))
