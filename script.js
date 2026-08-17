if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .catch((error) => console.log("Service Worker registration failed:", error));
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

showReview(current);

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
setInterval(function(){

    current++;

    if(current >= reviews.length){
        current = 0;
    }

    showReview(current);

},3000);
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

console.log(cartItems);
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

    let message = "Hello, I want to order:%0A%0A";

    cartItems.forEach(function(item){

        message += "👜 " + item.name + " - Quantity: " + item.quantity + "%0A";

    });

    window.open("https://wa.me/201555128809?text=" + message);

}
function removeItem(index){

    cartItems.splice(index,1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    cartCount = cartItems.length;

    document.getElementById("cart-count").innerHTML = cartCount;

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

    const products = document.querySelectorAll(".product-card");

    searchInput.addEventListener("keyup", function () {

        let searchValue = searchInput.value.toLowerCase();

        products.forEach(function(product){

            let productName = product.querySelector("h3").innerText.toLowerCase();

            if(productName.includes(searchValue)){

                product.style.display = "block";

            }else{

                product.style.display = "none";

            }

        });

    });

}

const productContainer = document.querySelector(".product-container");

if (productContainer && !document.body.dataset.extraGalleryLoaded) {
    document.body.dataset.extraGalleryLoaded = "true";

    const productNames = [
        "Cream Ivory Tote",
        "White Pearl Handbag",
        "Black Gold Evening Bag",
        "Beige Woven Tote",
        "White Pearl Purse",
        "Golden Yellow Bag",
        "Ivory Silk Tote",
        "Sand Beige Purse",
        "Bronze Gold Handbag",
        "White Pearl Clutch",
        "Dark Brown Tote",
        "Amber Gold Handbag",
        "Off White Pearl Bag",
        "Sienna Brown Bag",
        "Beige Gold Purse",
        "Walnut Brown Tote",
        "Rose Pink Mini Bag",
        "Golden Yellow Handbag",
        "Blush Pink Purse",
        "Beige Cream Tote",
        "White Pearl Bag",
        "Coffee Brown Handbag",
        "Ivory Classic Tote",
        "Gold Metallic Purse",
        "Terracotta Orange Bag",
        "Dawn Beige Handbag",
        "Sunset Orange Tote",
        "Rose Pearl Purse",
        "Carmel Beige Bag",
        "Bronze Gold Clutch",
        "Honey Yellow Tote",
        "Cream Royal Purse",
        "Willow Gold Bag",
        "Copper Brown Tote",
        "Sandalwood Beige Purse",
        "Rose Soft Tote",
        "Leaf Gold Handbag",
        "Beige Venetian Bag",
        "Pearl Sunlight Purse",
        "Cocoa Luxury Tote",
        "Coral Silk Handbag",
        "Bamboo Beige Bag",
        "Treasure Gold Purse",
        "Mocha Brown Tote",
        "Garden Rose Handbag",
        "Bronze Soft Purse",
        "Sand Elegant Bag",
        "Luna Gold Tote",
        "Harbor Beige Handbag",
        "Golden Bloom Purse",
        "Rosewood Luxe Bag",
        "Pearl Ivory Tote",
        "Sandal Beige Tote",
        "Butter Yellow Purse",
        "Rose Classic Bag",
        "Sweet Gold Handbag",
        "Warm Beige Tote"
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

    for (let i = 4; i <= 56; i++) {
        const productName = productNames[i - 4] || `Bag ${i}`;
        const imageName = `bag${i}.jpg`;
        const details = productDetails[i - 4] || ["Handmade", "Elegant Design", "Gift Ready"];
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

            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
                <i class="far fa-star"></i>
            </div>

            <div class="product-info">
                <p><i class="fas fa-truck"></i> ${details[0]}</p>
                <p><i class="fas fa-hand-paper"></i> ${details[1]}</p>
                <p><i class="fas fa-gift"></i> ${details[2]}</p>
            </div>

            <p class="price">
                <del>EGP ${price + 100}</del>
                <span class="new-price">EGP ${price}</span>
            </p>

            <button class="buy-btn"
            onclick="event.stopPropagation(); buyProductAndGo('${productName}', ${price}, '${imageName}', 'product.html?name=${encodeURIComponent(productName)}&image=${imageName}');">
                Buy Now
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
                price: "EGP 0",
                image: ""
            });
        }
    });

    return merged;
}

let favoriteProducts = getStoredFavoriteProducts();

function getProductPrice(card) {
    const priceWrap = card.querySelector(".price");
    if (priceWrap) {
        const newPrice = priceWrap.querySelector(".new-price");
        if (newPrice) return newPrice.innerText.trim();
        return priceWrap.innerText.trim();
    }

    const inlinePrice = card.querySelector(".new-price");
    if (inlinePrice) return inlinePrice.innerText.trim();

    return "EGP 0";
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
            icon.style.color = "red";
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
        icon.style.color = "red";

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

                <p>${product.price}</p>

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

function changeImage(img){

    document.getElementById("main-image").src = img.src;

}
function openOrderForm(){

    document.getElementById("order-popup").style.display="flex";

}

function closeOrderForm(){

    document.getElementById("order-popup").style.display="none";

}
function sendOrder(){

    const name = document.querySelector('input[placeholder="Your Name"]').value;

    const phone = document.querySelector('input[placeholder="Phone Number"]').value;

    const color = document.querySelector("select").value;

    const quantity = document.querySelector('input[type="number"]').value;

    const address = document.querySelector('textarea[placeholder="Address"]').value;

    const notes = document.querySelector('textarea[placeholder="Notes (Optional)"]').value;

    const message =
`🛍 New Order

👤 Name: ${name}

📱 Phone: ${phone}

👜 Product: Gold Metallic Canvas Bag

🎨 Color: ${color}

🔢 Quantity: ${quantity}

📍 Address: ${address}

📝 Notes: ${notes}`;

    window.open(
        "https://wa.me/201555128809?text=" + encodeURIComponent(message),
        "_blank"
    );
    document.getElementById("success-message").style.display = "block";

    setTimeout(function(){

    closeOrderForm();

}, 3000);

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