if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .then(() => navigator.serviceWorker.ready)
            .then((registration) => registration.update())
            .catch((error) => console.log("Service Worker registration failed:", error));

        caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
    });
}

let cart = [];
const reviews = document.querySelectorAll(".review-card");

const prev = document.querySelector(".prev");
const next = document.querySelector(".next");

let current = 0;

function showReview(index){

    reviews.forEach(function(review){
        review.style.display = "none";
    });

    reviews[index].style.display = "block";
}

if (reviews.length > 0) {
    showReview(current);
}

if (next) {

    next.onclick = function(){

        current++;

        if(current >= reviews.length){
            current = 0;
        }

        showReview(current);

    };

}

if (prev) {

    prev.onclick = function(){

        current--;

        if(current < 0){
            current = reviews.length - 1;
        }

        showReview(current);

    };

}
if (reviews.length > 0) {
    setInterval(function(){

        current++;

        if(current >= reviews.length){
            current = 0;
        }

        showReview(current);

    },3000);
}
function welcomeMessage(productName) {
    return confirm("Do you want to add " + productName + " to your cart?");
}
    
let cartCount = 0;
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

function addToCart() {

    cartCount++;

    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.innerHTML = cartCount;

    

    let html = "";
let total = 0;
let totalItems = 0;

cartItems.forEach(function(item, index){

    html += `
    <div class="cart-product">

        <img src="${item.image}" class="cart-product-image" alt="${item.name}">

        <h4>${item.name}</h4>

<div class="quantity-box">

    <button onclick="decreaseQuantity(${index})">➖</button>

    <span>${item.quantity}</span>

    <button onclick="increaseQuantity(${index})">➕</button>

</div>

        <button class="remove-btn" onclick="removeItem(${index})">
            🗑 Remove
        </button>

    </div>
`;

    total += item.price * item.quantity;
    totalItems += item.quantity;

});
const cartCountEl2 = document.getElementById("cart-count");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
if (cartCountEl2) cartCountEl2.innerHTML = totalItems;
if (cartItemsEl) cartItemsEl.innerHTML = html;
if (cartTotalEl) cartTotalEl.innerHTML = total;

}
function buyProduct(productName, price, image) {
    if (welcomeMessage(productName)) {
        let existingProduct = cartItems.find(function(item){
            return item.name === productName;
        });

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cartItems.push({
                name: productName,
                price: price,
                image: image,
                quantity: 1
            });
        }

        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        addToCart();
    }
}

function buyProductAndGo(productName, price, image, targetPage) {
    buyProduct(productName, price, image);

    if (targetPage) {
        setTimeout(function() {
            window.location.href = targetPage;
        }, 50);
    }
}

function toggleCart() {

    let cartBox = document.getElementById("cart-box");

    if (cartBox.style.display === "flex") {

        cartBox.style.display = "none";

    } else {

        cartBox.style.display = "flex";

    }

}
function orderWhatsApp(){

    if(cartItems.length === 0){
        alert("Your cart is empty!");
        return;
    }

    let message = "Hello, I want to order:\n\n";

    cartItems.forEach(function(item){

        const imageUrl = new URL(item.image, document.baseURI).href;
        message += "👜 " + item.name + " - Quantity: " + item.quantity + "\n";
        message += "🖼 Product image: " + imageUrl + "\n\n";

    });

    const imageUrls = cartItems.map(function(item){
        return new URL(item.image, document.baseURI).href;
    });

    shareOrderWithImages(message, imageUrls);

}
async function shareOrderWithImages(message, imageUrls){

    try {
        const files = [];

        for (const imageUrl of imageUrls) {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error("Image could not be loaded");

            const blob = await response.blob();
            const fileName = imageUrl.split("/").pop().split("?")[0] || "product-image.jpg";
            files.push(new File([blob], fileName, { type: blob.type || "image/jpeg" }));
        }

        const shareData = { text: message, files: files };

        if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
            await navigator.share(shareData);
            return;
        }
    } catch (error) {
        if (error.name === "AbortError") return;
    }

    window.open("https://wa.me/201555128809?text=" + encodeURIComponent(message), "_blank");

}
function removeItem(index){

    cartItems.splice(index,1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    cartCount = cartItems.length;

    document.getElementById("cart-count").innerHTML = cartCount;

    addToCart();

}
function clearCart(event){

    if (event) event.stopPropagation();

    cartItems = [];
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    addToCart();

}
function toggleFavorite(element){

    let icon = element.querySelector("i");
    let productName = element.dataset.product;
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

console.log(favorites);
localStorage.setItem("favorite", productName);
    if(icon.classList.contains("fa-regular")){

    favorites.push(productName);
localStorage.setItem("favorites", JSON.stringify(favorites));
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
    icon.style.color="red";

}else{

    favorites = favorites.filter(item => item !== productName);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
    icon.style.color="black";
}

}
window.addEventListener("load", function () {
    favoriteProducts = getStoredFavoriteProducts();
    syncFavoriteButtons();
    renderFavorites();
    updateFavoriteCount();
});
const searchInput = document.getElementById("searchInput");

if (searchInput) {

    const searchAliases = {
        "أورجانزا": "organza",
        "اورجانزا": "organza",
        "مكرمية": "macrame",
        "مكرمه": "macrame",
        "خرز": "beaded",
        "كانفاس": "canvas",
        "قطيفة": "velvet",
        "جوت": "jute",
        "كورد": "cord"
    };

    searchInput.addEventListener("input", function () {
        const searchValue = searchInput.value.trim().toLowerCase();
        const searchTerm = searchAliases[searchValue] || searchValue;
        const products = document.querySelectorAll(".product-card");

        products.forEach(function(product){
            const productName = product.querySelector("h3").innerText.toLowerCase();
            product.style.display = productName.includes(searchTerm) ? "block" : "none";
        });
    });

}

const productContainer = document.querySelector(".product-container");

if (productContainer && !document.body.dataset.extraGalleryLoaded) {
    document.body.dataset.extraGalleryLoaded = "true";

    const productNames = [
        "Canary Yellow Organza Bag",
        "Black Organza Bag",
        "Pink Cord Bag",
        "Beige Woven Tote",
        "Black Beaded Bag With a Gold Metal Handle",
        "Black Macrame Bag With Wooden Handles",
        "Off White Sugar Crumb and Pearl Bag",
        "Pink Cord Bag With Thin Gold Threads",
        "Black and Gray Cord Bag",
        "Beige and Black Canvas Bag",
        "Small Petrol Blue Macrame Bag",
        "Yellow Cord Bag",
        "Burgundy Acrylic Evening Bag With Beaded Side Panels and Satin Handles",
        "Black Beaded Bag With Gold Metal Strap",
        "Beige Burlap Bag With Round Wooden Side Panels",
        "Black Corded Clutch Accented With Fine Gold Threads",
        "Black and Beige Canvas Box",
        "Blue Velvet Beaded Purse",
        "Black Cord Bag With Gold Metal Handle",
        "Off White Bag Crafted From Sparkling Sugar Beads Applied With Shiny Golden Glass Beads",
        "Yellow Cordovan Leather Bag With a Pouch",
        "Beige Cord Bag",
        "Red Corded Bag With Black Satin Bows",
        "Crystal Sugar Crumbs Beads and Premium Pearl Beads With White Satin Dust Bag",
        "Transparent Hexagonal Beaded Clutch With Large Lavender Bow",
        "Pink Injected Bead Bag",
        "Children's Acrylic Purses With Pearl Sides",
        "Blue Floral Corded Bag With a Colorful Injected Beaded Flap Handle",
        "Gray Velvet Beaded Bag With Silver Beads",
        "Beaded Phone Pouch With Colorful Beads",
        "Black Beaded Box Purse",
        "Off White Pearl Beaded Bag",
        "Jute Bag With Black",
        "Leaf Gold Handbag",
        "Clear Acrylic Hexagonal Beaded Bag",
        "Black and Fuchsia Cord Bag",
        "Maroon and Beige Cord-Thread Bag With Its Matching Hat",
        "Fuchsia Phone Case With Lanyard",
        "Black Phone Case With Lanyard",
        "Black and Gold Thin Striped Phone Case With Lanyard",
        "Canary Yellow Crossbody Phone Case With Lanyard Cord",
        "Jute and Cordon Cord Clutch With Colorful Cordon Loops",
        "Phone Case With Cord Lanyard",
        "Beige and Coffee Cordon Bag",
        "Beige Drawstring Bag With Its Matching Hat",
        "Burlap Cord Bag With Black and White",
        "Beige Cord Bag",
        "Pink Cord Bag With Pearl Bead Short and Long Straps",
        "Pink Organza Pouch",
        "Maroon Velvet Beaded Bag",
        "Golden Glass Bead Faux Pearl Bag with a Spiral Handle",
        "Off White Sugar Texture and Pearl Beaded Phone Strap",
        "Silver Beaded Phone Case",
        "Blue Gray Cord Bag With Satin Pouch",
        "Orange Beaded Bag With a Beaded Handle"
    ];

    const productDetails = [
        ["Handmade", "Luxury Finish", "Gift Ready"],
        ["Premium Material", "Elegant Design", "Gift Ready"],
        ["Luxury Style", "Handmade", "Classic Finish"],
        ["Soft Texture", "Elegant Design", "Gift Ready"],
        ["Premium Material", "Luxury Finish", "Handmade"],
        ["Elegant Style", "Golden Touch", "Gift Ready"],
        ["Luxury Finish", "Soft Texture", "Handmade"],
        ["Premium Material", "Classic Design", "Gift Ready"],
        ["Golden Accent", "Elegant Design", "Gift Ready"],
        ["Premium Material", "Soft Touch", "Luxury Look"],
        ["Rich Finish", "Classic Design", "Handmade"],
        ["Golden Accent", "Luxury Style", "Gift Ready"],
        ["Premium Material", "Soft Texture", "Elegant Look"],
        ["Classic Design", "Rich Finish", "Handmade"],
        ["Luxury Finish", "Premium Material", "Gift Ready"],
        ["Classic Design", "Warm Tone", "Handmade"],
        ["Soft Texture", "Elegant Look", "Gift Ready"],
        ["Golden Accent", "Premium Look", "Handmade"],
        ["Soft Touch", "Elegant Design", "Gift Ready"],
        ["Luxury Finish", "Premium Material", "Handmade"],
        ["Classic Design", "Soft Texture", "Gift Ready"],
        ["Rich Finish", "Elegant Design", "Handmade"],
        ["Luxury Finish", "Premium Material", "Gift Ready"],
        ["Golden Accent", "Classic Design", "Handmade"],
        ["Warm Tone", "Elegant Design", "Gift Ready"],
        ["Soft Texture", "Luxury Finish", "Handmade"],
        ["Premium Material", "Elegant Design", "Gift Ready"],
        ["Soft Touch", "Classic Finish", "Handmade"],
        ["Golden Accent", "Luxury Style", "Gift Ready"],
        ["Premium Material", "Soft Texture", "Handmade"],
        ["Warm Tone", "Elegant Design", "Gift Ready"],
        ["Luxury Finish", "Handmade", "Classic Look"],
        ["Premium Material", "Soft Touch", "Gift Ready"],
        ["Golden Accent", "Luxury Design", "Handmade"],
        ["Rich Finish", "Elegant Look", "Gift Ready"],
        ["Classic Design", "Premium Material", "Handmade"],
        ["Soft Texture", "Elegant Design", "Gift Ready"],
        ["Luxury Finish", "Golden Touch", "Handmade"],
        ["Premium Material", "Classic Design", "Gift Ready"],
        ["Warm Tone", "Elegant Look", "Handmade"],
        ["Golden Accent", "Luxury Finish", "Gift Ready"],
        ["Soft Touch", "Classic Design", "Handmade"],
        ["Premium Material", "Elegant Design", "Gift Ready"],
        ["Luxury Style", "Warm Tone", "Handmade"],
        ["Rich Finish", "Premium Material", "Gift Ready"],
        ["Soft Texture", "Elegant Design", "Handmade"],
        ["Classic Look", "Luxury Finish", "Gift Ready"],
        ["Golden Accent", "Premium Material", "Handmade"],
        ["Warm Tone", "Soft Touch", "Gift Ready"],
        ["Luxury Finish", "Elegant Design", "Handmade"],
        ["Premium Material", "Classic Style", "Gift Ready"],
        ["Golden Accent", "Soft Texture", "Handmade"],
        ["Warm Tone", "Elegant Design", "Gift Ready"],
        ["Luxury Finish", "Premium Material", "Handmade"],
        ["Classic Design", "Soft Touch", "Gift Ready"],
        ["Golden Accent", "Elegant Style", "Handmade"],
        ["Premium Material", "Luxury Finish", "Gift Ready"],
        ["Soft Texture", "Classic Look", "Handmade"],
        ["Elegant Design", "Warm Tone", "Gift Ready"],
        ["Luxury Finish", "Premium Material", "Handmade"]
    ];

    const productPrices = [
        420, 470, 430, 450, 500, 480, 520, 475, 530, 490,
        510, 540, 550, 485, 495, 470, 520, 560, 510, 530,
        600, 520, 540, 610, 590, 570, 600, 620, 580, 640,
        590, 610, 660, 625, 645, 650, 680, 700, 710, 690,
        720, 750, 735, 760, 770, 790, 780, 800, 820, 835,
        850, 870, 890, 900, 920, 940, 960
    ];

    for (let i = 4; i <= 58; i++) {
        if (i === 7 || i === 37) continue;

        const productName = productNames[i - 4] || `Bag ${i}`;
        const imageName = `bag${i}.jpg`;
        const price = productPrices[i - 4] || 500;

        const card = document.createElement("div");
        card.className = "card product-card";

        card.innerHTML = `
            <span class="favorite-btn"
                  data-product="${productName}"
                  onclick="event.stopPropagation(); toggleFavoriteCard(this)">
                <i class="fa-regular fa-heart"></i>
            </span>

            <img src="${imageName}" alt="${productName}">

            <h3>${productName}</h3>

            <div class="product-info">
                <p>Made to Order</p>
                <a href="#contact" onclick="event.stopPropagation()">Contact Us</a>
            </div>

            <button class="buy-btn"
            onclick="event.stopPropagation(); buyProductAndGo('${productName}', ${price}, '${imageName}', 'product.html?name=${encodeURIComponent(productName)}&image=${imageName}');">
                Shop Now
            </button>
        `;

        productContainer.appendChild(card);
    }
}
function increaseQuantity(index){

    cartItems[index].quantity++;

    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    addToCart();

}
function decreaseQuantity(index){

    if(cartItems[index].quantity > 1){

        cartItems[index].quantity--;

    }else{

        cartItems.splice(index,1);

        cartCount--;

        document.getElementById("cart-count").innerHTML = cartCount;

    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    addToCart();

}
const themeButton = document.getElementById("theme-toggle");

if (themeButton) {

    themeButton.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            themeButton.innerHTML = "☀️";
            localStorage.setItem("theme", "dark");

        } else {

            themeButton.innerHTML = "🌙";
            localStorage.setItem("theme", "light");

        }

    });

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark-mode");
        themeButton.innerHTML = "☀️";

    }

}

function toggleFavoriteBox(){

    let favoriteBox = document.getElementById("favorite-box");

    favoriteBox.classList.toggle("active");

}
function getStoredFavoriteProducts() {
    const oldFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const newFavorites = JSON.parse(localStorage.getItem("favoriteProducts")) || [];
    const merged = [...newFavorites];

    oldFavorites.forEach((name) => {
        if (!merged.some(item => item.name === name)) {
            merged.push({
                name: name,
                price: "",
                image: ""
            });
        }
    });

    return merged;
}

let favoriteProducts = getStoredFavoriteProducts();

function getProductPrice(card) {
    return "";
}

function saveFavoriteProducts() {
    localStorage.setItem("favoriteProducts", JSON.stringify(favoriteProducts));
    localStorage.setItem("favorites", JSON.stringify(favoriteProducts.map(item => item.name)));
}

function updateFavoriteCount() {
    const favoriteCount = document.getElementById("favorite-count");
    if (favoriteCount) {
        favoriteCount.innerText = favoriteProducts.length;
    }
}

function syncFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach((button) => {
        const productName = button.dataset.product;
        const icon = button.querySelector("i");
        if (!productName || !icon) return;

        const exists = favoriteProducts.some(item => item.name === productName);
        if (exists) {
            button.classList.add("active");
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
            icon.style.color = "#ffffff";
        } else {
            button.classList.remove("active");
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "";
        }
    });
}

function toggleFavoriteCard(button) {

    let card = button.closest(".product-card");

    if (!card) return;

    let productName = card.querySelector("h3").innerText.trim();
    let productImage = card.querySelector("img");
    let icon = button.querySelector("i");

    let index = favoriteProducts.findIndex(
        item => item.name === productName
    );

    if (index == -1) {

        favoriteProducts.push({
            name: productName,
            price: getProductPrice(card),
            image: productImage ? (productImage.currentSrc || productImage.src) : ""
        });

        button.classList.add("active");

        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        icon.style.color = "#ffffff";

    } else {

        favoriteProducts.splice(index, 1);

        button.classList.remove("active");

        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        icon.style.color = "";

    }

    saveFavoriteProducts();
    renderFavorites();
    syncFavoriteButtons();
    updateFavoriteCount();

}

function renderFavorites() {
    let favoriteItems = document.getElementById("favorite-items");

    if (!favoriteItems) return;

    favoriteItems.innerHTML = "";

    if (favoriteProducts.length === 0) {
        favoriteItems.innerHTML = '<p id="empty-favorite">No favorite products yet ❤️</p>';
        return;
    }

    favoriteProducts.forEach((product, index) => {
        favoriteItems.innerHTML += `

        <div class="favorite-product">

            <img src="${product.image || 'bag.jpg'}" alt="${product.name}">

            <div class="favorite-info">

                <h4>${product.name}</h4>

            </div>

            <button class="remove-favorite"
                    onclick="removeFavorite(${index})">

                ✖

            </button>

        </div>

        `;
    });
}

function removeFavorite(index){

    if (!favoriteProducts[index]) return;

    const removedProduct = favoriteProducts[index];

    favoriteProducts.splice(index,1);

    const heart = document.querySelector(
        `.favorite-btn[data-product="${removedProduct.name}"]`
    );

    if(heart){
        heart.classList.remove("active");

        const icon = heart.querySelector("i");
        if (icon) {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "";
        }
    }

    saveFavoriteProducts();
    renderFavorites();
    syncFavoriteButtons();
    updateFavoriteCount();

}
function clearFavorites(event){

    if (event) event.stopPropagation();

    favoriteProducts = [];
    localStorage.setItem("favoriteProducts", JSON.stringify(favoriteProducts));
    localStorage.setItem("favorites", JSON.stringify([]));

    renderFavorites();
    syncFavoriteButtons();
    updateFavoriteCount();

}

function changeImage(img){

    document.getElementById("main-image").src = img.src;

}
function openOrderForm(){

    document.getElementById("order-popup").style.display="flex";

}

function closeOrderForm(){

    document.getElementById("order-popup").style.display="none";

}
function sendOrder(event){

    if (event) event.preventDefault();

    const getValue = function(selector){
        const field = document.querySelector(selector);
        return field ? field.value.trim() : "";
    };

    const name = getValue('input[placeholder="Your Name"]');
    const phone = getValue('input[placeholder="Phone Number"]');
    const color = getValue("select");
    const quantity = getValue('input[type="number"]');
    const address = getValue('textarea[placeholder="Address"]');
    const notes = getValue('textarea[placeholder="Notes (Optional)"]');

    const productElement = document.getElementById("product-name") ||
        document.querySelector(".product-details h1");
    const imageElement = document.getElementById("main-image");
    const productName = productElement ? productElement.textContent.trim() : "Product";
    const imageUrl = imageElement ? new URL(imageElement.src, document.baseURI).href : "";

    const message =
`🛍 New Order

👤 Name: ${name}

📱 Phone: ${phone}

👜 Product: ${productName}

🖼 Product image: ${imageUrl}

🎨 Color: ${color}

🔢 Quantity: ${quantity}

📍 Address: ${address}

📝 Notes: ${notes}`;

    const whatsappUrl = "https://wa.me/201555128809?text=" + encodeURIComponent(message);
    window.location.assign(whatsappUrl);

}
window.addEventListener("load", function () {
    let message = document.getElementById("welcome-message");

    if (message) {

        setTimeout(function () {

            message.classList.add("hide");
            // After the fade-out animation ends, remove it from layout so it won't block clicks
            const onAnimEnd = function () {
                message.style.display = 'none';
                message.removeEventListener('animationend', onAnimEnd);
            };
            message.addEventListener('animationend', onAnimEnd);

            // Also ensure it doesn't capture pointer events while visible
            message.style.pointerEvents = 'none';

        }, 5000);

    }

    if (typeof addToCart === 'function') {
        addToCart();
    }

});