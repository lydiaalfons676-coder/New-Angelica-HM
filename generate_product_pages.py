from pathlib import Path
import re

root = Path(__file__).resolve().parent
script_path = root / "script.js"
script = script_path.read_text(encoding="utf-8")

created = []

def get_live_names():
    match = re.search(r"const liveBagNames = \[(.*?)\];", script, re.S)
    if not match:
        return []
    names = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', match.group(1))
    return [name.replace('\\"', '"') for name in names]

live_names = get_live_names()

for bag_num in range(1, 63):
    if bag_num in (7, 37):
        continue

    if not (root / f"bag{bag_num}.html").exists():
        name_index = bag_num - 1
        title = live_names[name_index] if name_index < len(live_names) else f"Bag {bag_num}"
        title = re.sub(r"\s+", " ", title).strip()

        page = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Angelica Handmade</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="breadcrumb">
        <a href="index.html">🏠 Home</a>
        <span>&gt;</span>
        <a href="index.html#products">👜 Bags</a>
        <span>&gt;</span>
        <span>{title}</span>
    </div>

    <div class="brand-signature">Angelica Handmade™ <span>Original handmade designs</span></div>

    <div class="product-page">
        <div class="product-image">
            <img id="main-image" src="bag{bag_num}.jpg" alt="{title}">
            <div class="gallery">
                <img src="bag{bag_num}.jpg" onclick="changeImage(this)" onerror="this.src='bag{bag_num}.jpg'">
                <img src="bag{bag_num}-2.jpg" onclick="changeImage(this)" onerror="this.src='bag{bag_num}.jpg'">
                <img src="bag{bag_num}-3.jpg" onclick="changeImage(this)" onerror="this.src='bag{bag_num}.jpg'">
            </div>
        </div>

        <div class="product-details">
            <h1>{title}</h1>
            <div class="product-stars">★★★★★ <span>(4.9)</span></div>
            <div class="price-box">
                <p>✔ Free Shipping - For a limited time</p>
            </div>

            <hr>
            <p><strong>🎨 Available Colors:</strong></p>
            <ul>
                <li>🤎 Brown</li>
                <li>🖤 Black</li>
                <li>🤍 Beige</li>
            </ul>

            <p><strong>🧵 Material:</strong> Premium Handmade Fabric</p>
            <p><strong>✋ Handmade:</strong> 100%</p>
            <p><strong>🚚 Shipping:</strong> Free Shipping - For a limited time</p>
            <p><strong>🎁 Packaging:</strong> Gift Ready</p>

            <hr>
            <h3>Description</h3>
            <p>
                Elegant handmade product with a refined finish, carefully crafted to match a modern and timeless style.
            </p>

            <hr>
            <h3>📋 Product Specifications</h3>
            <table class="specs-table">
                <tr><td><strong>Material</strong></td><td>Premium Handmade Fabric</td></tr>
                <tr><td><strong>Handmade</strong></td><td>✔ 100%</td></tr>
                <tr><td><strong>Shipping</strong></td><td>Free Shipping - For a limited time</td></tr>
                <tr><td><strong>Gift Ready</strong></td><td>✔ Yes</td></tr>
            </table>

            <p class="order-note">
                ✨ اطلب الآن عبر واتساب واستمتع بشحن سريع وتغليف أنيق.<br>
                Orders are processed and delivered within 7 to 10 days.<br>
                يتم تجهيز وتسليم الطلب خلال 7 إلى 10 أيام.
            </p>

            <button class="buy-btn" onclick="openOrderForm()">Order on WhatsApp 💬</button>

            <div id="order-popup" class="popup">
                <div class="popup-content">
                    <span class="close-popup" onclick="closeOrderForm()"><i class="fa-solid fa-xmark"></i></span>
                    <h2>🛍️ Complete Your Order</h2>
                    <input type="text" placeholder="Your Name">
                    <input type="tel" placeholder="Phone Number">
                    <select>
                        <option>Select Color</option>
                        <option>Brown</option>
                        <option>Black</option>
                        <option>Beige</option>
                    </select>
                    <input type="number" placeholder="Quantity" min="1">
                    <textarea placeholder="Address"></textarea>
                    <textarea placeholder="Notes (Optional)"></textarea>
                    <button type="button" class="buy-btn" onclick="sendOrder(event)">Send Order</button>
                    <p id="success-message">✅ Order sent successfully</p>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js?v=6"></script>
</body>
</html>
'''

        (root / f"bag{bag_num}.html").write_text(page, encoding="utf-8")
        created.append(f"bag{bag_num}.html")

print(f"Created {len(created)} product detail pages")
for name in created[:10]:
    print(name)
