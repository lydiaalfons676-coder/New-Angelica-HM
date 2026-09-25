#!/usr/bin/env python3
"""
Fix Related Products layout in bag*.html files to match bag1.html structure.

The issue: In bag3+ files, the Related Products block is placed INSIDE the
.product-details / .product-page divs (before they close), causing layout
differences. In bag1/bag2 (the correct reference), the Related Products block
is placed AFTER the .product-page div closes, at body level.

This script moves the Related Products block (hr + h3 + .related-products div)
outside of .product-page for all bag*.html files that have it inside.

Usage:
    python3 fix_related_structure.py
"""

import re
import glob
import os

DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(DIR)

# The reference structure (bag1.html):
#   </div>          <- closes popup-content
#   </div>          <- closes product-details
# </div>            <- closes product-page
#
# <hr>
# <h3>👜 Related Products</h3>
# <div class="related-products">...</div>   <!-- نهاية related-products -->
#
# <!-- الصفحة الأصلية تحتوي على Customer Reviews لكن بتم إخفاؤها بالـ CSS -->
# <hr>
# <h3>⭐ Customer Reviews</h3>
# <div class="reviews">...</div>
#
# <script src="script.js?v=6"></script>
# </body>
# </html>

related_end = '</div>   <!-- نهاية related-products -->'

for fn in sorted(glob.glob('bag*.html'), key=lambda x: int(re.search(r'\d+', x).group())):
    if fn == 'product.html':
        continue
    
    with open(fn, encoding='utf-8') as f:
        content = f.read()
    
    # Find the Related Products section
    h3_marker = '<h3>\U0001f9fe Related Products</h3>'
    h3_idx = content.find(h3_marker)
    if h3_idx < 0:
        print(f'SKIP (no related): {fn}')
        continue
    
    # Find the preceding <hr>
    hr_idx = content.rfind('<hr>', 0, h3_idx)
    if hr_idx < 0:
        print(f'SKIP (no hr before related): {fn}')
        continue
    
    # Find end of related-products div
    end_idx = content.find(related_end, h3_idx)
    if end_idx < 0:
        print(f'SKIP (no end marker): {fn}')
        continue
    end_idx += len(related_end)
    
    # Extract the related block
    related_block = content[hr_idx:end_idx]
    
    # Content after the related block
    after = content[end_idx:]
    
    # Find script tag
    script_idx = after.find('<script src="script.js')
    if script_idx < 0:
        script_idx = after.find('<script>')
    if script_idx < 0:
        print(f'SKIP (no script): {fn}')
        continue
    
    between = after[:script_idx]
    
    # Count orphaned </div> in between
    close_count = between.count('</div>')
    
    if close_count == 0:
        # Already correct (related outside product-page)
        print(f'ALREADY OK: {fn}')
        continue
    
    # Fix: 
    # 1. Remove orphaned closing divs from 'between'
    # 2. Insert the same number of closing divs before related_block
    
    new_between = between
    for _ in range(close_count):
        idx = new_between.find('</div>')
        if idx >= 0:
            new_before = new_between[:idx]
            new_after_div = new_between[idx+6:]
            new_between = new_before + new_after_div
    
    # Insert closing divs before related block
    closing_divs = '</div>' * close_count + '\n'
    
    # Reconstruct
    new_content = content[:hr_idx] + closing_divs + related_block + new_between + after[script_idx:]
    
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'FIXED: {fn} (moved {close_count} closing divs)')

print('\nDone!')
