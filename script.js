if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .then(() => navigator.serviceWorker.ready)
            .then((registration) => registration.update())
            .catch((error) => console.log("Service Worker registration failed:", error));

        caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
    });
}

document.addEventListener("contextmenu", function (event) {
    if (event.target.closest("img")) {
        event.preventDefault();
    }
});

document.addEventListener("dragstart", function (event) {
    if (event.target.closest("img")) {
        event.preventDefault();
    }
});

let cart = [];
const reviewsSlider = document.querySelector(".reviews .slider, section.reviews .slider");
const reviews = reviewsSlider ? reviewsSlider.querySelectorAll(".review-card") : [];

const prev = document.querySelector(".prev");
const next = document.querySelector(".next");

let current = 0;

function showReview(index){

    reviews.forEach(function(review){
        review.style.display = "none";
    });

    if (reviews[index]) reviews[index].style.display = "block";
}

if (reviews.length > 0) {
    showReview(current);
}

if (next && reviews.length > 0) {

    next.onclick = function(){

        current++;

        if(current >= reviews.length){
            current = 0;
        }

        showReview(current);

    };

}

if (prev && reviews.length > 0) {

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
const whatsappDisplayNumber = "01555128809";
const whatsappPhoneNumber = "201555128809";

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
    productName = getCanonicalProductName(productName, image);

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

function addToCartDirect(productName, price, image, targetPage) {
    productName = getCanonicalProductName(productName, image);

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

    if (targetPage) {
        window.location.href = targetPage;
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
    message += "WhatsApp: " + whatsappDisplayNumber + "\n\n";

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
function openOrderOnWhatsApp(message){

    const whatsappUrl = "https://wa.me/" + whatsappPhoneNumber + "?text=" + encodeURIComponent(message);

    // فتح واتساب فوراً وبشكل متزامن بدون أي انتظار عشان المتصفح مايحجبش النافذة الجديدة
    const orderWindow = window.open(whatsappUrl, "_blank");

    // لو المتصفح حجب النافذة الجديدة نفتح واتساب في نفس التاب
    if (!orderWindow) {
        window.location.href = whatsappUrl;
    }

}
// بيبعت رسالة الواتساب مع صورة المنتج نفسها (مش لينك) عشان الصورة تظهر لصاحب الموقع
// لو المتصفح مش بيدعم مشاركة الصور، بيرجع تلقائياً لرسالة واتساب العادية اللي فيها لينك الصورة
async function shareOrderWithImages(message, imageUrls){

    const isHttp = /^https?:$/i.test(window.location.protocol);
    const urls = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];

    if (isHttp && urls.length && navigator.share && navigator.canShare) {

        try {

            const files = [];

            for (const imageUrl of urls) {
                const response = await fetch(imageUrl);
                if (!response.ok) throw new Error("Image could not be loaded");

                const blob = await response.blob();
                const fileName = decodeURIComponent(imageUrl.split("/").pop().split("?")[0]) || "product-image.jpg";
                files.push(new File([blob], fileName, { type: blob.type || "image/jpeg" }));
            }

            if (files.length && navigator.canShare({ files: files })) {
                await navigator.share({ text: message, files: files });
                return;
            }

        } catch (error) {
            // لو المستخدم قفل الشيت بنفسه منبعتش رسالة تانية
            if (error.name === "AbortError") return;
        }

    }

    openOrderOnWhatsApp(message);

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
    let productImage = element.closest(".product-card")?.querySelector("img")?.getAttribute("src");
    productName = getCanonicalProductName(productName, productImage);
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
const liveBagNames = [
    "Havan Cordon Bag",
    "Golden Pearl Bag",
    "Gold Metallic Canvas Bag",
    "Canary Yellow Organza Bag",
    "Black Organza Bag",
    "Pink Cordon Bag",
    "Black Beaded Handbag With a Gold Metal Handle",
    "Black Macrame Bag With Wooden Handles",
    "Off White Bag Crafted From Sugar Crumbs Beads and Pearls",
    "Pink Cordon Bag With a Thin Gold Thread",
    "Black and Gray Cordon Bag",
    "Beige and Black Canvas Bag",
    "Small Petrol Blue Macrame Bag",
    "Mustard Yellow Cordon Bag",
    "Acrylic Bag With Burgundy Beaded Edges and a Satin Handle",
    "Black Beaded Bag",
    "Beige Burlap Bag With Round Wooden Side Panels",
    "Black Cordon Bag With a Thin Gold Thread",
    "Beige and Black Canvas Bag",
    "Blue Velvet Beaded Bag",
    "Black Cordon Bag With a Thin Gold Thread",
    "Off White Sugar Crumbs Beaded Bag",
    "Yellow Cordon Bag",
    "Light Beige Cordon Bag",
    "Red Cordon Bag",
    "Off White Sugar Crumbs Beaded Bag With Pearls",
    "White Beaded Bag With a Large Lavender Bow Made of Injected Beads",
    "Pink Bag Made of Injected Beads",
    "Off-White Pearl Acrylic Kids' Bag — Available in Any Color and Other Shapes",
    "Blue Cordon Bag With a Beaded Flap and Handle",
    "Gray Velvet Beaded Bag With Silver Beads",
    "Phone Pouch With Multicolored Beads",
    "Black Beaded Bag",
    "Off-White Pearl Bag With an Elegant Metal Clasp",
    "Jute Bag With Black",
    "Black Acrylic Bag With Clear White Beaded Sides",
    "Black and Fuchsia Cordon Bag",
    "Beige and Burgundy Cordon Bag With Its Matching Hat",
    "Fuchsia Cordon Phone Pouch",
    "Black Cordon Phone Pouch",
    "Black Phone Pouch With a Thin Gold Thread",
    "Butter Yellow Cordon Phone Pouch",
    "Beige Jute Clutch With Multicolored Loops - Customizable on Request",
    "Phone Cases in Black, Mustard, Beige and Gray - Other Colors Available on Request",
    "Beige and Coffee Cordon Bag With Matching Hat Available on Request",
    "Light Beige Cordon Bag With Its Matching Hat",
    "Cocoa Cordon Bag",
    "Beige Cordon Bag",
    "Fuchsia Cordon Bag With a Short White Pearl Handle",
    "Pink Organza Bag",
    "Burgundy Velvet Beaded Bag",
    "Off White Pearl Bag With a Spiral Handle Made of Golden Glass Beads",
    "Off White Sugar Crumbs Beaded Phone Pouch With Pearls",
    "Silver Beaded Phone Pouch",
    "Light Blue Cordon Bag With a Light Blue Satin Pouch"
];

// Keep every product-page title synchronized with the name shown on its card.
const bagPageNames = {};

liveBagNames.forEach(function (name, index) {
    const bagNumber = index < 6 ? index + 1 : index < 35 ? index + 2 : index + 3;
    bagPageNames[bagNumber] = name;
});

Object.assign(bagPageNames, {
    58: "Orange Beaded Bag",
    59: "Beige and Pink Cordon Bag With Its Clutch - Customizable in Any Color",
    60: "Red Beaded Bag With Off White Sugar Crumbs Beads",
    61: "Beige Jute Bag With a White Bow",
    62: "Colorful Beaded Phone Pouch",
    63: "Beige Cordon Bag",
    64: "Beige Backpack",
    65: "Off White Pearl Bag",
    66: "Acrylic Bag With Lavender Beaded Edges and a Purple Satin Pouch",
    67: "Yellow and Green Cordon Bag",
    68: "Baby Blue Cordon Bag",
    69: "White Transparent Beaded Bag",
    70: "Candy Cordon Bag - Customizable in Any Color"
});

// أرقام صور الشنط الموجودة فعلاً: من 1 لـ 70 (صورة رقم 1 اسمها bag.jpg) وفيها فجوتين: 7 و 37
const bagImageGaps = [7, 37];
const lastBagNumber = 70;

// بيرجّع أرقام الصور اللى بعد صورة المنتج الحالى بنفس ترتيب الكروت (وبيلف من الأول بعد آخر صورة)
function getNextBagNumbers(bagNumber, count){
    const numbers = [];
    const wanted = count || 2;
    const total = lastBagNumber;

    if (!bagNumber || bagNumber < 1 || bagNumber > total) return numbers;

    let current = bagNumber;

    for (let step = 0; step < total && numbers.length < wanted; step++) {
        current = current >= total ? 1 : current + 1;
        if (bagImageGaps.indexOf(current) === -1) numbers.push(current);
    }

    return numbers;
}

// بيرجّع بيانات صورة شنطة معينة (اللينك + الصورة + الاسم) عشان الريليتد بروداكتس
function getBagLinkData(bagNumber){
    const image = bagNumber === 1 ? "bag.jpg" : `bag${bagNumber}.jpg`;
    const name = bagPageNames[bagNumber] || `Bag ${bagNumber}`;
    const page = bagNumber <= 62 ?
        `bag${bagNumber}.html` :
        `product.html?name=${encodeURIComponent(name)}&image=${image}`;

    return { number: bagNumber, image: image, name: name, page: page };
}

function syncProductPageName() {
    const match = window.location.pathname.match(/bag(\d+)\.html$/i);
    if (!match) return;

    const productName = bagPageNames[Number(match[1])];
    if (!productName) return;

    document.title = `${productName} | Angelica Handmade`;

    const heading = document.querySelector(".product-details h1");
    if (heading) heading.textContent = productName;

    const breadcrumbParts = document.querySelectorAll(".breadcrumb span");
    const currentProduct = breadcrumbParts[breadcrumbParts.length - 1];
    if (currentProduct) currentProduct.textContent = productName;

    const image = document.getElementById("main-image");
    if (image) image.alt = productName;
}

function getBagNumberFromImage(imageSource) {
    const source = String(imageSource || "");
    if (/(?:^|\/)bag\.jpg(?:$|[?#])/i.test(source)) return 1;

    const match = source.match(/bag(\d+)\.jpg(?:$|[?#])/i);
    return match ? Number(match[1]) : null;
}

function getCanonicalProductName(productName, imageSource) {
    const bagNumber = getBagNumberFromImage(imageSource);
    return bagNumber && bagPageNames[bagNumber] ? bagPageNames[bagNumber] : productName;
}

function syncStoredProductNames() {
    const mergedCartItems = [];

    cartItems.forEach(function (item) {
        const normalizedItem = {
            ...item,
            name: getCanonicalProductName(item.name, item.image)
        };
        const existingItem = mergedCartItems.find(function (savedItem) {
            return savedItem.name === normalizedItem.name && savedItem.image === normalizedItem.image;
        });

        if (existingItem) {
            existingItem.quantity += normalizedItem.quantity;
        } else {
            mergedCartItems.push(normalizedItem);
        }
    });

    cartItems = mergedCartItems;
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    const mergedFavorites = [];
    favoriteProducts.forEach(function (product) {
        const normalizedProduct = {
            ...product,
            name: getCanonicalProductName(product.name, product.image)
        };

        if (!mergedFavorites.some(function (savedProduct) {
            return savedProduct.name === normalizedProduct.name;
        })) {
            mergedFavorites.push(normalizedProduct);
        }
    });

    favoriteProducts = mergedFavorites;
    saveFavoriteProducts();
}

function syncProductCardNames() {
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(function(card, index) {
        const desiredName = liveBagNames[index] || card.querySelector("h3")?.textContent.trim();

        if (!desiredName) return;

        const heading = card.querySelector("h3");
        if (heading) heading.textContent = desiredName;

        const image = card.querySelector("img");
        if (image) image.alt = desiredName;

        const favoriteBtn = card.querySelector(".favorite-btn");
        if (favoriteBtn) favoriteBtn.setAttribute("data-product", desiredName);

        const button = card.querySelector(".buy-btn");
        if (button) {
            const imageName = image ? image.getAttribute("src") : "";
            const priceMatch = button.getAttribute("onclick")?.match(/buyProduct\('([^']+)',\s*([0-9.]+),\s*'([^']+)'/i);
            const directPriceMatch = button.getAttribute("onclick")?.match(/addToCartDirect\('([^']+)',\s*([0-9.]+),\s*'([^']+)'/i);
            const targetMatch = button.getAttribute("onclick")?.match(/window\.location='([^']+)'/i);
            const price = priceMatch ? priceMatch[2] : (directPriceMatch ? directPriceMatch[2] : "0");
            const target = targetMatch ? targetMatch[1] : "index.html";

            button.setAttribute(
                "onclick",
                `event.stopPropagation(); buyProductAndGo(${JSON.stringify(desiredName)}, ${price}, ${JSON.stringify(imageName)}, ${JSON.stringify(target)});`
            );
        }
    });
}

window.addEventListener("load", function () {
    favoriteProducts = getStoredFavoriteProducts();
    syncProductCardNames();
    syncStoredProductNames();
    syncFavoriteButtons();
    renderFavorites();
    updateFavoriteCount();
    syncProductPageName();
    setupProductGallery();
});
const searchInput = document.getElementById("searchInput");

if (searchInput) {

    const searchAliases = {
        "أورجانزا": "organza",
        "اورجانزا": "organza",
        "مكرمية": "macrame",
        "مكرمه": "macrame",
        "خرز": "beaded",
        "شنطة": "bag",
        "شنط": "bag",
        "حقيبة": "bag",
        "جراب": "case",
        "كانفاس": "canvas",
        "قطيفة": "velvet",
        "جوت": "jute",
        "كورد": "cord"
    };

    const normalizeSearchText = function (value) {
        return value.trim().toLowerCase().replace(/\s+/g, " ");
    };

    const getSearchTerms = function (value) {
        return normalizeSearchText(value).split(" ").filter(Boolean).map(function (term) {
            return searchAliases[term] || term;
        });
    };

    const filterProducts = function () {
        const searchValue = normalizeSearchText(searchInput.value);
        const searchTerms = getSearchTerms(searchValue);
        const products = document.querySelectorAll(".product-card");
        const matchingProducts = [];
        let firstMatch = null;

        products.forEach(function(product){
            const nameElement = product.querySelector("h3");
            const imageElement = product.querySelector("img");
            const productText = normalizeSearchText(
                (nameElement ? nameElement.textContent : "") + " " +
                (imageElement ? imageElement.alt : "")
            );
            const isMatch = !searchTerms.length || searchTerms.every(function (term) {
                return productText.includes(term);
            });

            if (isMatch) matchingProducts.push(product);
            if (isMatch && !firstMatch) firstMatch = product;
        });

        products.forEach(function(product) {
            product.style.display = !searchTerms.length || matchingProducts.length === 0 ||
                matchingProducts.includes(product) ? "" : "none";
        });

        if (searchTerms.length && firstMatch) {
            firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    searchInput.addEventListener("input", filterProducts);
    searchInput.addEventListener("search", filterProducts);

}

const productContainer = document.querySelector(".product-container");

if (productContainer && !document.body.dataset.extraGalleryLoaded) {
    document.body.dataset.extraGalleryLoaded = "true";

    const productNames = [
        "Organza Ribbon Bag",
        "Pearl Evening Bag",
        "Pearl Crossbody",
        "Beaded Evening Bag",
        "Organza Clutch",
        "Beige Burlap Bag With Round Wooden Side Panels",
        "Canvas Mini Bag",
        "Fluffy Crossbody",
        "Metallic Tote",
        "Beaded Tote",
        "Pearl Clutch",
        "Organza Shoulder Bag",
        "Cord Mini Bag",
        "Fluffy Clutch",
        "Canvas Crossbody",
        "Metallic Shoulder Bag",
        "Beaded Crossbody",
        "Pearl Tote",
        "Organza Crossbody",
        "Cord Tote",
        "Fluffy Mini Bag",
        "Canvas Shoulder Bag",
        "Red Cordon Bag",
        "Off White Sugar Crumbs Beaded Bag With Pearls",
        "Pearl Mini Bag",
        "Cord Wristlet",
        "Fluffy Wristlet",
        "Canvas Wristlet",
        "Metallic Wristlet",
        "Beaded Mini Bag",
        "Pearl Wristlet",
        "Organza Wristlet",
        "Cord Evening Bag",
        "Fluffy Evening Bag",
        "Canvas Evening Bag",
        "Black and Fuchsia Cordon Bag",
        "شنطه بيج فى فوشيا كوردون بالبرنيطه بتاعتها",
        "Pearl Evening Clutch",
        "Organza Evening Clutch",
        "Cord Clutch",
        "Canvas Clutch",
        "Beige Jute Clutch With Multicolored Loops - Customizable on Request",
        "Beaded Clutch",
        "Pearl Clutch",
        "Organza Clutch",
        "Cord Shopper",
        "Black Organza Bag",
        "Pink Cordon Bag",
        "Black Beaded Handbag With a Gold Metal Handle",
        "Black Macrame Bag With Wooden Handles",
        "Off White Bag Crafted From Sugar Crumbs Beads and Pearls",
        "Pink Cordon Bag With a Thin Gold Thread",
        "Black and Gray Cordon Bag",
        "Phone Cases in Black, Mustard, Beige and Gray - Other Colors Available on Request",
        "Orange Beaded Bag",
        "Mustard Yellow Cordon Bag",
        "Acrylic Bag With Burgundy Beaded Edges and a Satin Handle",
        "Black Beaded Bag",
        "Colorful Beaded Phone Pouch",
        "Black Cordon Bag With a Thin Gold Thread",
        "Phone Cases in Black, Mustard, Beige and Gray - Other Colors Available on Request",
        "Blue Velvet Beaded Bag",
        "Black Cordon Bag With a Thin Gold Thread",
        "Off White Sugar Crumbs Beaded Bag",
        "Yellow Cordon Bag",
        "Light Beige Cordon Bag",
        "Blue Floral Corded Bag With a Colorful Injected Beaded Flap Handle",
        "Off White Sugar Crumbs Beaded Bag With Pearls",
        "White Beaded Bag With a Large Lavender Bow Made of Injected Beads",
        "Pink Bag Made of Injected Beads",
        "Off-White Pearl Acrylic Kids' Bag — Available in Any Color and Other Shapes",
        "Blue Cordon Bag With a Beaded Flap and Handle",
        "Gray Velvet Beaded Bag With Silver Beads",
        "Phone Pouch With Multicolored Beads",
        "Black Beaded Bag",
        "Off-White Pearl Bag With an Elegant Metal Clasp",
        "Jute Bag With Black",
        "Black Acrylic Bag With Clear White Beaded Sides",
        "Black and Gold Thin Striped Phone Case With Lanyard",
        "شنطه بيج في فوشيا كوردون بالبرنيطة بتاعتها",
        "Fuchsia Cordon Phone Pouch",
        "Black Cordon Phone Pouch",
        "Black Phone Pouch With a Thin Gold Thread",
        "Butter Yellow Cordon Phone Pouch",
        "Beige Jute Clutch With Multicolored Loops - Customizable on Request",
        "Phone Cases in Black, Mustard, Beige and Gray - Other Colors Available on Request",
        "Beige and Coffee Cordon Bag With Matching Hat Available on Request",
        "Light Beige Cordon Bag With Its Matching Hat",
        "Cocoa Cordon Bag",
        "Beige Cordon Bag",
        "Fuchsia Cordon Bag With a Short White Pearl Handle",
        "Pink Organza Bag",
        "Burgundy Velvet Beaded Bag",
        "Off White Pearl Bag With a Spiral Handle Made of Golden Glass Beads"
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

    for (let i = 4; i <= 66; i++) {
        if (i === 4 || i === 7 || i === 37) continue;

        const productName = i === 59 ? "Beige and Pink Cordon Bag With Its Clutch - Customizable in Any Color" :
            i === 60 ? "Red Beaded Bag With Off White Sugar Crumbs Beads" :
            i === 61 ? "Beige Jute Bag With a White Bow" :
            i === 63 ? "Beige Cordon Bag" :
            i === 64 ? "Beige Backpack" :
            i === 65 ? "Off White Pearl Bag" :
            i === 66 ? "Acrylic Bag With Lavender Beaded Edges and a Purple Satin Pouch" :
            (productNames[i - 4] || `Bag ${i}`);
        const imageName = i === 5 ?
            "image-backup-before-watermark/bag5.jpg" :
            `bag${i}.jpg`;
        const price = productPrices[i - 4] || 500;
        const detailPage = i >= 63 ?
            `product.html?name=${encodeURIComponent(productName)}&image=${imageName}` :
            `bag${i}.html`;

        const card = document.createElement("div");
        card.className = "card product-card";
        card.setAttribute("onclick", `window.location='${detailPage}'`);

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
            onclick="event.stopPropagation(); addToCartDirect('${productName}', ${price}, '${imageName}', '${detailPage}'); window.location='${detailPage}';">
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

    let productImage = card.querySelector("img");
    let productName = getCanonicalProductName(
        card.querySelector("h3").innerText.trim(),
        productImage ? (productImage.currentSrc || productImage.src) : ""
    );
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

function buildGalleryCandidates(imageSrc){
    if (!imageSrc) return [];

    const cleanSrc = imageSrc.split("?")[0];
    const fileName = cleanSrc.split("/").pop();
    const lastDot = fileName.lastIndexOf(".");
    const name = lastDot > -1 ? fileName.slice(0, lastDot) : fileName;
    const extension = lastDot > -1 ? fileName.slice(lastDot) : ".jpg";
    const basePath = cleanSrc.slice(0, cleanSrc.lastIndexOf("/")) + "/";

    return [
        `${basePath}${fileName}`,
        `${basePath}${name}-2${extension}`,
        `${basePath}${name}-3${extension}`
    ];
}

function ensureThreeThumbGallery(){
    const mainImage = document.getElementById("main-image");
    if (!mainImage) return;

    let gallery = document.querySelector(".gallery");
    if (!gallery) {
        gallery = document.createElement("div");
        gallery.className = "gallery";
        mainImage.parentNode.insertBefore(gallery, mainImage.nextSibling);
    }

    const existingImages = Array.from(gallery.querySelectorAll("img"));
    const targetCount = 3;
    const fallbackSrc = mainImage.src || mainImage.getAttribute("src") || "bag.jpg";

    while (existingImages.length < targetCount) {
        const newImg = document.createElement("img");
        newImg.src = fallbackSrc;
        newImg.alt = mainImage.alt || "Product image";
        newImg.onclick = function () { changeImage(this); };
        newImg.onerror = function () { this.src = fallbackSrc; };
        gallery.appendChild(newImg);
        existingImages.push(newImg);
    }

    const galleryImages = Array.from(gallery.querySelectorAll("img")).slice(0, targetCount);
    const candidates = buildGalleryCandidates(fallbackSrc);
    const fallback = candidates[0] || fallbackSrc;

    galleryImages.forEach((img, index) => {
        const source = candidates[index] || fallback;
        img.src = source;
        img.alt = mainImage.alt || "Product image";
        img.onerror = function () {
            this.src = fallback;
        };
    });
}

function setupProductGallery(){
    ensureThreeThumbGallery();
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
async function sendOrder(event){

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

📞 WhatsApp: ${whatsappDisplayNumber}

👜 Product: ${productName}

🖼 Product image: ${imageUrl || "Not available"}

🎨 Color: ${color}

🔢 Quantity: ${quantity}

📍 Address: ${address}

⏱️ Processing and delivery time: 7 to 10 days
⏱️ مدة تجهيز وتسليم الطلب: من 7 إلى 10 أيام

📝 Notes: ${notes}`;

    shareOrderWithImages(message, imageUrl ? [imageUrl] : []);

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

        }, 1000);

    }

    if (typeof addToCart === 'function') {
        addToCart();
    }

});

// ===== Normalize Related Products shape like bag1 (Havan Cordon Bag) on ALL product pages =====
(function(){
  function normalizeRelated(){
    try{
      var page = document.querySelector('.product-page');
      var grid = document.querySelector('.related-products');
      if(page && grid && page.contains(grid)){
        var title = null;
        var el = grid.previousElementSibling;
        for(var k=0;k<6 && el;k++){
          if(el.tagName==='H3' && /Related Products/.test(el.textContent)){ title = el; break; }
          el = el.previousElementSibling;
        }
        var hrBefore = null;
        if(title && title.previousElementSibling && title.previousElementSibling.tagName==='HR') hrBefore = title.previousElementSibling;
        var parent = page.parentNode;
        var next = page.nextSibling;
        if(hrBefore) parent.insertBefore(hrBefore, next);
        if(title){ parent.insertBefore(title, next); title.style.textAlign='center'; title.style.width='100%'; }
        parent.insertBefore(grid, next);
      }
    }catch(e){}
    var grids = document.querySelectorAll('.related-products');
    if(!grids.length) return;
    grids.forEach(function(grid){
      // Force: grid 2 columns, centered
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 220px))';
      grid.style.justifyContent = 'center';
      grid.style.gap = '20px';
      grid.style.margin = '20px auto';
      grid.style.width = '100%';
      grid.style.maxWidth = '480px';
      var cards = grid.querySelectorAll('.related-card');
      cards.forEach(function(card){
        card.style.width = '220px';
        card.style.maxWidth = '100%';
        card.style.minHeight = '300px';
        card.style.margin = '0 auto';
        card.style.background = '#fff';
        card.style.borderRadius = '15px';
        card.style.overflow = 'hidden';
        card.style.textAlign = 'center';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        var a = card.querySelector('a');
        if(a){ a.style.display='flex'; a.style.flexDirection='column'; a.style.height='100%'; a.style.textDecoration='none'; a.style.color='#6f4e37'; }
        var img = card.querySelector('img');
        if(img){ img.style.width='100%'; img.style.height='200px'; img.style.objectFit='cover'; img.style.display='block'; }
        var p = card.querySelector('p');
        if(p){ p.style.padding='12px 10px'; p.style.fontSize='15px'; p.style.margin='0'; p.style.flex='1'; p.style.display='flex'; p.style.alignItems='center'; p.style.justifyContent='center'; }
      });
    });
    // Mobile: keep 2 per row
    if(window.innerWidth <= 600){
      grids.forEach(function(grid){
        grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        grid.style.gap = '12px';
        grid.style.maxWidth = '100%';
        grid.style.padding = '0 10px';
      });
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalizeRelated);
  else normalizeRelated();
  window.addEventListener('resize', normalizeRelated);
})();
// Hide Customer Reviews on product pages (bag*.html + product.html) - keep homepage
(function(){
  function hideProductReviews(){
    if(!document.querySelector('.product-page')) return;
    // hide every .reviews div inside/after product-page
    document.querySelectorAll('.reviews').forEach(function(r){ r.style.display='none'; });
    // hide its title + hr: "Customer Reviews"
    document.querySelectorAll('h3').forEach(function(h){
      if(/Customer Reviews/.test(h.textContent)){
        h.style.display='none';
        var prev = h.previousElementSibling;
        if(prev && prev.tagName==='HR') prev.style.display='none';
        // hide arabic comment marker sibling is not element, skip
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', hideProductReviews);
  else hideProductReviews();
})();


