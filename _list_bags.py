import re
from pathlib import Path
root = Path(r'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)')
files = sorted(root.glob('bag*.html'))
print(len(files))
for f in files:
    print(f.name)
