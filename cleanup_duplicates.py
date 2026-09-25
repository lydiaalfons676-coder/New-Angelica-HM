from pathlib import Path
import re

root = Path(r'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)')

for html_file in root.glob('bag*.html'):
    text = html_file.read_text(encoding='utf-8')
    updated = re.sub(r'\n\s*<img src="bag\d+-2\.jpg"[^>]*>\s*', '\n', text, flags=re.I)
    updated = re.sub(r'\n\s*<img src="bag\d+-3\.jpg"[^>]*>\s*', '\n', updated, flags=re.I)
    if updated != text:
        html_file.write_text(updated, encoding='utf-8')

for dup in list(root.glob('bag*-2.jpg')) + list(root.glob('bag*-3.jpg')):
    if dup.exists():
        dup.unlink()

print('duplicate cleanup complete')
