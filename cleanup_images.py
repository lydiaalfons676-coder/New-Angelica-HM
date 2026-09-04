from pathlib import Path
import hashlib, re
from PIL import Image

root = Path(r'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)')
backup_dir = root / 'image-backup-before-watermark'
allowed_exts = {'.jpg', '.jpeg', '.png', '.webp'}

# Keep only files that are actually referenced by the site.
ref_names = set()
for p in root.rglob('*'):
    if p.is_file() and p.suffix.lower() in {'.html', '.js', '.css'}:
        try:
            txt = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        ref_names |= set(re.findall(r'([A-Za-z0-9_ ./-]+\.(?:jpg|jpeg|png|webp))', txt, re.I))

used_names = {Path(x).name for x in ref_names if x}

# Delete obviously unused images that are not referenced and are not core site assets.
keep_core = {
    'bag.jpg', 'bag1.jpg', 'bag2.jpg', 'bag3.jpg', 'bag4.jpg', 'bag5.jpg', 'bag6.jpg', 'bag8.jpg', 'bag9.jpg',
    'bag10.jpg', 'bag11.jpg', 'bag12.jpg', 'bag13.jpg', 'bag14.jpg', 'bag15.jpg', 'bag16.jpg', 'bag17.jpg',
    'bag18.jpg', 'bag19.jpg', 'bag20.jpg', 'bag21.jpg', 'bag22.jpg', 'bag23.jpg', 'bag24.jpg', 'bag25.jpg',
    'bag26.jpg', 'bag27.jpg', 'bag28.jpg', 'bag29.jpg', 'bag30.jpg', 'bag31.jpg', 'bag32.jpg', 'bag33.jpg',
    'bag34.jpg', 'bag35.jpg', 'bag36.jpg', 'bag38.jpg', 'bag39.jpg', 'bag40.jpg', 'bag41.jpg', 'bag42.jpg',
    'bag43.jpg', 'bag44.jpg', 'bag45.jpg', 'bag46.jpg', 'bag47.jpg', 'bag48.jpg', 'bag49.jpg', 'bag50.jpg',
    'bag51.jpg', 'bag52.jpg', 'bag53.jpg', 'bag54.jpg', 'bag55.jpg', 'bag56.jpg', 'bag57.jpg', 'bag58.jpg',
    'bag59.jpg', 'bag60.jpg', 'bag61.jpg', 'bag62.jpg',
    'banner.jpg', 'logo.png', 'logo-small.png', 'review4.jpg', 'review5.jpg', 'review6.jpg',
    'screen shot 1.jpg', 'screen shot 2.jpg', 'screen shot 3.jpg', 'screen shot 4.jpg',
    'screen shot 5.jpg', 'screen shot 6.jpg', 'screen shot 7.jpg'
}
for p in list(root.rglob('*')):
    if p.is_dir() or p.suffix.lower() not in allowed_exts:
        continue
    if backup_dir in p.parents:
        continue
    if p.name not in used_names and p.name not in keep_core:
        try:
            p.unlink()
        except OSError:
            pass

# Remove duplicate image copies by content hash, keeping one file per unique image.
image_groups = {}
for p in root.rglob('*'):
    if p.is_file() and p.suffix.lower() in allowed_exts and backup_dir not in p.parents:
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        image_groups.setdefault(h, []).append(p)
for files in image_groups.values():
    if len(files) <= 1:
        continue
    files.sort(key=lambda p: (p.name.lower(), len(str(p.parent))))
    for old in files[1:]:
        try:
            old.unlink()
        except OSError:
            pass

# Compress remaining images but preserve filenames.
for p in root.rglob('*'):
    if p.is_file() and p.suffix.lower() in allowed_exts and backup_dir not in p.parents:
        try:
            with Image.open(p) as img:
                if img.mode in ('RGBA', 'LA', 'P', 'CMYK'):
                    img = img.convert('RGB')
                max_dim = 1800 if p.name.lower().startswith(('logo', 'banner', 'review', 'screen')) else 1500
                w, h = img.size
                if max(w, h) > max_dim:
                    scale = max_dim / max(w, h)
                    new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
                    img = img.resize(new_size, Image.Resampling.LANCZOS)
                if p.suffix.lower() in {'.jpg', '.jpeg'}:
                    img.save(p, quality=75, optimize=True)
                elif p.suffix.lower() == '.png':
                    img.save(p, optimize=True, compress_level=9)
                elif p.suffix.lower() == '.webp':
                    img.save(p, quality=75, method=6)
        except Exception:
            continue

print('cleanup_images_completed')
print('remaining_images=', sum(1 for p in root.rglob('*') if p.is_file() and p.suffix.lower() in allowed_exts and backup_dir not in p.parents))
