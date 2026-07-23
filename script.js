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

next.onclick = function(){

    current++;

    if(current >= reviews.length){
        current = 0;
    }

    showReview(current);

}

prev.onclick = function(){

    current--;

    if(current < 0){
        current = reviews.length - 1;
    }

    showReview(current);

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
let cartItems = [];

function addToCart() {

    cartCount++;

    document.getElementById("cart-count").innerHTML = cartCount;

    

    let html = "";
let total = 0;
let totalItems = 0;

cartItems.forEach(function(item, index){

    html += `
    <div class="cart-product">

        <img src="${item.image}" class="cart-product-image" alt="${item.name}">

        <h4>${item.name}</h4>

        <p>Price: ${item.price} EGP</p>

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
document.getElementById("cart-count").innerHTML = totalItems;
document.getElementById("cart-items").innerHTML = html;
document.getElementById("cart-total").innerHTML = total;

}
function buyProduct(productName, price, image) {

    if (welcomeMessage(productName)) {

        let existingProduct = cartItems.find(function(item){
    return item.name === productName;
});

if(existingProduct){

    existingProduct.quantity++;

}else{

    cartItems.push({
        name: productName,
        price: price,
        image: image,
        quantity: 1
    });

}

        addToCart();
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

    let total = 0;

    cartItems.forEach(function(item){

        message += "👜 " + item.name + " - " + item.price + " EGP%0A";

        total += item.price;

    });

    message += "%0A💰 Total: " + total + " EGP";

    window.open("https://wa.me/201555128809?text=" + message);

}
function removeItem(index){

    cartItems.splice(index,1);

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
window.onload = function () {

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    document.querySelectorAll(".favorite-btn").forEach(button => {

        let productName = button.dataset.product;
        let icon = button.querySelector("i");

        if (favorites.includes(productName)) {

            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
            icon.style.color = "red";

        }

    });

}
const searchInput = document.getElementById("searchInput");
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
function increaseQuantity(index){

    cartItems[index].quantity++;

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

    addToCart();

}
const themeButton = document.getElementById("theme-toggle");

themeButton.addEventListener("click", function(){

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){

        themeButton.innerHTML="☀️";

    }else{

        themeButton.innerHTML="🌙";

    }

});
// حفظ وضع الموقع
themeButton.addEventListener("click", function(){

    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("theme","dark");
    }else{
        localStorage.setItem("theme","light");
    }

});
// استرجاع الوضع عند فتح الموقع
if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark-mode");

    themeButton.innerHTML="☀️";

}