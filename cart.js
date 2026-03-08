function getProductsDB() {
  return JSON.parse(localStorage.getItem(PRODUCTS_DB_KEY)) || [];
}

function saveProductsDB(p) {
  localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(p));
}

function getUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function cartKey() {
  const u = getUser();
  return u ? `cart_${u.userId}` : null;
}

function orderKey() {
  const u = getUser();
  return u ? `orders_${u.userId}` : null;
}

function getCart() {
  return JSON.parse(localStorage.getItem(cartKey())) || [];
}

function saveCart(c) {
  localStorage.setItem(cartKey(), JSON.stringify(c));
}

function renderCart() {
  const items = document.getElementById("cartItems");

  if (!items) return;   // important safeguard

  const totalEl = document.getElementById("totalAmount");
  const countEl = document.getElementById("itemCount");

  const cart = getCart();

  if (!cart.length) {
    items.innerHTML = `<div class="cart-empty">🛒 Your cart is empty</div>`;
    totalEl.innerText = "0";
    countEl.innerText = "0";
    return;
  }

  let total = 0;
  let itemCount = 0;

  items.innerHTML = cart.map((it,i) => {
    total += it.price * it.quantity;
    itemCount += it.quantity;

    return `
      <div class="cart-item">
      <img src="${it.image}">
      <div class="cart-info">
        <h4>${it.name}</h4>
        <p>Qty: ${it.quantity}</p>
      </div>
      <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  }).join("");

  totalEl.innerText = total;
  countEl.innerText = itemCount;
}

window.removeItem = i => {
  const c = getCart();
  c.splice(i,1);
  saveCart(c);
  renderCart();
};

const orderBtn = document.getElementById("placeOrderBtn");

if (orderBtn) {
  orderBtn.onclick = () => {

  const user = getUser();
  if (!user) return alert("Login first");

  const cart = getCart();
  if (!cart.length) return alert("Cart empty");

  // Save cart temporarily for checkout page
  localStorage.setItem("checkout_cart", JSON.stringify(cart));

  // Go to checkout
  location.href = "receipt.html";
};
}

document.addEventListener("DOMContentLoaded", renderCart);
