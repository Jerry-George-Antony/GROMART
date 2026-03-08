// Always start page from top on refresh
window.history.scrollRestoration = "manual";
window.scrollTo(0, 0);

// ================= USER HELPERS =================

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function logoutUser() {
    localStorage.removeItem("currentUser");
}

// ================= CART FUNCTIONS =================

function getCartKey() {
    const user = getCurrentUser();
    if (!user) return null;
    return `cart_${user.userId}`;
}

function getCart() {
    const key = getCartKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveCart(cart) {
    const key = getCartKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const el = document.getElementById("cart-count");
    if (el) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        el.innerText = total;
    }
}

// ================= PRODUCT DB (NEW) =================

const PRODUCTS_DB_KEY = "products_db";

// Get products DB
function getProductsDB() {
    return JSON.parse(localStorage.getItem(PRODUCTS_DB_KEY)) || [];
}

// Save products DB
function saveProductsDB(products) {
    localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products));
}

// Convert all products from index.html into DB (only first time)
function initializeProductsDBFromUI() {

    let db = getProductsDB();
    if (db.length > 0) return; // already initialized

    const products = [];

    document.querySelectorAll(".product-section").forEach(section => {

        const categoryId = section.id; // eg: fruits, vegetables etc

        section.querySelectorAll(".product-card").forEach(card => {

            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            const image = card.dataset.image;

            if (!name || !price || !image) return;

            products.push({
                id: Date.now() + Math.floor(Math.random() * 9999),
                name: name,
                price: price,
                quantity: 20, // default initial stock (admin can change)
                image: image,
                category: categoryId
            });
        });
    });

    saveProductsDB(products);
}

// Find product from DB by name
function findProductInDBByName(name) {
    const db = getProductsDB();
    return db.find(p => p.name.toLowerCase() === name.toLowerCase());
}

// Add missing products (admin-added products) into UI
function renderAdminAddedProductsIntoUI() {

    const db = getProductsDB();
    if (db.length === 0) return;

    db.forEach(p => {

        // check if product exists already in HTML
        const exists = [...document.querySelectorAll(".product-card")]
            .some(card => card.dataset.name?.toLowerCase() === p.name.toLowerCase());

        if (exists) return;

        // category track must exist
        const track = document.getElementById(`${p.category}-track`);
        if (!track) return;

        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.name = p.name;
        card.dataset.price = p.price;
        card.dataset.image = p.image;

        card.innerHTML = `
            <img src="${p.image}" class="product-img" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>₹${p.price}</p>
        `;

        track.appendChild(card);
    });
}

// Update UI stock status (In Stock / Only X left / SOLD OUT)
function syncUIWithStock() {

    document.querySelectorAll(".product-card").forEach(card => {

        const name = card.dataset.name;
        if (!name) return;

        const dbProduct = findProductInDBByName(name);

        // If admin deleted product -> hide from customer page
        if (!dbProduct) {
            card.remove();
            return;
        } else {
            card.style.display = "block";
        }

        // Update dataset price from DB
        card.dataset.price = dbProduct.price;

        // Update visible price text inside product card
        const priceEl = card.querySelector("p");
        if (priceEl) priceEl.innerText = `₹${dbProduct.price}`;

        // Controls area
        const controls = card.querySelector(".cart-controls");

        // Create / update stock message element (place above controls)
        let stockEl = card.querySelector(".stock-msg");
        if (!stockEl) {
            stockEl = document.createElement("div");
            stockEl.className = "stock-msg";

            if (controls) card.insertBefore(stockEl, controls);
            else card.appendChild(stockEl);
        }

        // ================= STOCK UI LOGIC =================

        const qty = parseInt(dbProduct.quantity);

        // SOLD OUT
        if (qty <= 0) {

            stockEl.innerHTML = `<span class="sold-out-text">SOLD OUT</span>`;
            card.classList.add("soldout-card");

            if (controls) controls.style.display = "none";

            return;
        }

        // IN STOCK
        let msg = `In Stock (${qty})`;

        // LOW STOCK WARNING
        if (qty <= 5) {
            msg += ` <span class="low-stock-text">(Only ${qty} left)</span>`;
        }

        stockEl.innerHTML = msg;

        card.classList.remove("soldout-card");
        if (controls) controls.style.display = "flex";
    });
}

// ================= DOM LOADED =================

document.addEventListener("DOMContentLoaded", () => {

    const authArea = document.getElementById("auth-area");
    const currentUser = getCurrentUser();

    // Initialize DB once
    initializeProductsDBFromUI();

    // Render admin added products if any
    renderAdminAddedProductsIntoUI();

    // ================= AUTH AREA =================

    if (!currentUser) {

        authArea.innerHTML = `
            <a href="login.html" class="login-btn">Login</a>
        `;

    } else {

        authArea.innerHTML = `
        <div class="user-section">

            <div class="cart-icon" onclick="window.location.href='cart.html'">
                <i class="fa fa-shopping-cart"></i>
                <span id="cart-count">0</span>
            </div>

            <div class="profile">
                <img src="assets/icons/profile.jpg"class="profile-img"id="profileToggle">

                <div class="profile-dropdown" id="profileMenu">

                    <p><strong>${currentUser.name}</strong></p>
                    <p>User ID: ${currentUser.userId}</p>
                    <p>📱 ${currentUser.phone}</p>

                    <button id="viewFavorites">My Favourites</button>
                    <div id="favoritesBox" class="hidden"></div>

                    <button id="viewOrders">My Orders</button>
                    <div id="ordersBox" class="hidden"></div>

                    <button id="logoutBtn">Logout</button>

                </div>
            </div>

        </div>
        `;
        setupProfileMenu();
        setupProfileActions(currentUser);
    }

    // Create cart controls (important: run AFTER admin products added)
    document.querySelectorAll(".product-card").forEach(card => {

        const name = card.dataset.name;
        const price = card.dataset.price;
        const image = card.dataset.image;

        if (!name || !price || !image) return;

        // avoid duplicate controls
        if (card.querySelector(".cart-controls")) return;

        // Create star
        const star = document.createElement("i");
        star.className = "fa-regular fa-star favorite-icon";
        card.prepend(star);

        // Create cart controls
        const controls = document.createElement("div");
        controls.className = "cart-controls";
        controls.innerHTML = `
            <button class="qty-btn minus">-</button>
            <span class="qty">0</span>
            <button class="qty-btn plus">+</button>
            <button class="add-cart-btn"
                data-name="${name}"
                data-price="${price}"
                data-image="${image}">
                Add
            </button>
        `;

        card.appendChild(controls);
    });

    // Sync stock status now
    syncUIWithStock();

    updateCartCount();

    // ===== FAVORITE STAR RESTORE =====
    const user = getCurrentUser();

    if (user) {
    const fav = JSON.parse(localStorage.getItem(`fav_${user.userId}`)) || [];

    document.querySelectorAll(".product-card").forEach(card => {
        const name = card.querySelector("h4").innerText.trim();
        const star = card.querySelector(".favorite-icon");

        if (fav.includes(name)) {
        star.classList.remove("fa-regular");
        star.classList.add("fa-solid", "active");
        }
    });
    }

// ===== GO TO PRODUCT (FINAL FIX) =====
setTimeout(() => {

  const highlight = localStorage.getItem("highlightProduct");
  if (!highlight) return;

  const allCards = document.querySelectorAll(".product-card");

  allCards.forEach(card => {

    const name = card.querySelector("h4").innerText.trim();

    if (name.toLowerCase() === highlight.toLowerCase()) {

      const section = card.closest(".product-section");

      // wait for carousel to settle
      setTimeout(() => {

        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        setTimeout(() => {

          card.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          card.classList.add("neon-highlight");

          setTimeout(() => {
            card.classList.remove("neon-highlight");
          }, 2000);

        }, 400);

      }, 500);

    }

  });

  localStorage.removeItem("highlightProduct");

}, 600);

});

// ================= PROFILE MENU =================

function setupProfileMenu() {

    const toggle = document.getElementById("profileToggle");
    const menu = document.getElementById("profileMenu");

    if (!toggle) return;

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("show-menu");
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".profile")) {
            menu.classList.remove("show-menu");
        }
    });
}

// ================= PROFILE ACTIONS =================

function setupProfileActions(currentUser) {

    // ===== GO TO FAVORITES PAGE =====
    document.getElementById("viewFavorites").addEventListener("click", () => {
        window.location.href = "favorites.html";
    });

    // ===== GO TO ORDERS PAGE =====
    document.getElementById("viewOrders").addEventListener("click", () => {
        window.location.href = "orders.html";
    });

    // ===== LOGOUT =====
    document.getElementById("logoutBtn").addEventListener("click", logout);
}

// ================= GLOBAL PRODUCT HANDLER =================

document.addEventListener("click", function (e) {

    // PLUS
    if (e.target.classList.contains("plus")) {
        const qty = e.target.parentElement.querySelector(".qty");
        qty.innerText = parseInt(qty.innerText) + 1;
    }

    // MINUS
    if (e.target.classList.contains("minus")) {
        const qty = e.target.parentElement.querySelector(".qty");
        let val = parseInt(qty.innerText);
        if (val > 0) qty.innerText = val - 1;
    }

    // ADD TO CART
    if (e.target.classList.contains("add-cart-btn")) {

        const user = getCurrentUser();
        if (!user) {
            alert("Please login first");
            window.location.href = "login.html";
            return;
        }

        const parent = e.target.parentElement;
        const qtyElement = parent.querySelector(".qty");
        const quantity = parseInt(qtyElement.innerText);

        if (quantity <= 0) {
            alert("Please select quantity");
            return;
        }

        const name = e.target.dataset.name;
        const image = e.target.dataset.image;

        // price from DB always
        const dbProduct = findProductInDBByName(name);

        if (!dbProduct) {
            alert("Product not available");
            return;
        }

        if (dbProduct.quantity <= 0) {
            alert("❌ SOLD OUT");
            syncUIWithStock();
            return;
        }

        if (quantity > dbProduct.quantity) {
            alert(`⚠ Only ${dbProduct.quantity} left in stock`);
            return;
        }

        const price = parseInt(dbProduct.price);

        let cart = getCart();
        const existing = cart.find(item => item.name === name);

        if (existing) {

            if (existing.quantity + quantity > dbProduct.quantity) {
                alert(`⚠ Only ${dbProduct.quantity} left in stock`);
                return;
            }

            existing.quantity += quantity;

        } else {
            cart.push({ name, price, image, quantity });
        }

        saveCart(cart);
        updateCartCount();
        syncUIWithStock();

        qtyElement.innerText = "0";

        e.target.innerText = "Added";
        setTimeout(() => {
            e.target.innerText = "Add";
        }, 1000);
    }

    // FAVORITE TOGGLE
    if (e.target.classList.contains("favorite-icon")) {

        const user = getCurrentUser();
        if (!user) {
            alert("Login to add favourites");
            return;
        }

        const card = e.target.closest(".product-card");
        const name = card.querySelector("h4").innerText.trim();

        let favorites = JSON.parse(localStorage.getItem(`fav_${user.userId}`)) || [];

        if (favorites.includes(name)) {
            favorites = favorites.filter(item => item !== name);
            e.target.classList.remove("fa-solid", "active");
            e.target.classList.add("fa-regular");
        } else {
            favorites.unshift(name);
            e.target.classList.remove("fa-regular");
            e.target.classList.add("fa-solid", "active");
        }

        localStorage.setItem(`fav_${user.userId}`, JSON.stringify(favorites));
    }
});

// ================= SCROLL =================

function scrollToCategory(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

// ================= CAROUSEL SLIDER =================

function moveSlide(categoryId, direction) {

  const section = document.getElementById(categoryId);
  const track = document.getElementById(categoryId + "-track");
  const carousel = section.querySelector(".carousel");

  const leftArrow = carousel.querySelector(".arrow.left");
  const rightArrow = carousel.querySelector(".arrow.right");

  const cards = track.querySelectorAll(".product-card");

  if (!cards.length) return;

  const cardStyle = window.getComputedStyle(cards[0]);
  const marginRight = parseInt(cardStyle.marginRight);
  const cardWidth = cards[0].offsetWidth + marginRight;

  const windowWidth = section.querySelector(".carousel-window").offsetWidth;
  const totalWidth = track.scrollWidth;

  let index = parseInt(carousel.getAttribute("data-index")) || 0;

  index += direction;

  const maxIndex = Math.max(
    0,
    Math.ceil((totalWidth - windowWidth) / cardWidth)
  );

  if (index < 0) index = 0;
  if (index > maxIndex) index = maxIndex;

  carousel.setAttribute("data-index", index);

  const offset = index * cardWidth;
  track.style.transform = `translateX(-${offset}px)`;

  // ===== ARROW VISIBILITY FIX =====
  leftArrow.classList.toggle("hidden", index === 0);

  // hide right arrow ONLY when truly at end
  const atEnd = offset + windowWidth >= totalWidth - 2;
  rightArrow.classList.toggle("hidden", atEnd);
}

// Initialize arrows on page load
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".product-section").forEach(section => {
        const id = section.id;
        moveSlide(id, 0);
    });
});

// ===== SMART SEARCH =====

const searchInput = document.getElementById("searchInput");

searchInput?.addEventListener("keypress", function (e) {

  if (e.key !== "Enter") return;

  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  const cards = document.querySelectorAll(".product-card");

  let exactMatch = null;
  let partialMatch = null;

  cards.forEach(card => {
    const name = card.querySelector("h4").innerText.toLowerCase();

    // exact match first
    if (name === query) {
      exactMatch = card;
    }

    // fallback match
    if (!partialMatch && name.startsWith(query)) {
      partialMatch = card;
    }
  });

  const target = exactMatch || partialMatch;

  if (!target) {
    alert("Product not found");
    return;
  }

  // scroll
  target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  // neon highlight
  target.classList.add("neon-highlight");

  setTimeout(() => {
    target.classList.remove("neon-highlight");
  }, 2000);

  searchInput.value = "";
});

document.addEventListener("click", function (e) {

    if (e.target.classList.contains("favorite-item")) {

        const productName = e.target.dataset.name;

        const allCards = document.querySelectorAll(".product-card");

        allCards.forEach(card => {
            const name = card.querySelector("h4").innerText.trim();

            if (name.toLowerCase() === productName.toLowerCase()) {

                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                card.style.boxShadow = "0 0 15px #1abc9c";
                setTimeout(() => {
                    card.style.boxShadow = "";
                }, 1500);
            }
        });
    }
    // REMOVE FAVORITE FROM PROFILE LIST
    if (e.target.classList.contains("remove-fav")) {

        const user = getCurrentUser();
        if (!user) return;

        const productName = e.target.dataset.name;

        let favorites = JSON.parse(localStorage.getItem(`fav_${user.userId}`)) || [];

        favorites = favorites.filter(item => item !== productName);

        localStorage.setItem(`fav_${user.userId}`, JSON.stringify(favorites));

        // Refresh favorites list UI
        document.getElementById("viewFavorites").click();
    }

});

// ================= LOGOUT =================

function logout() {
    const user = getCurrentUser();

    if (user) {
        localStorage.removeItem(`cart_${user.userId}`);
    }

    logoutUser();
    location.reload();
}

// ===== REVIEW SYSTEM =====

const REVIEW_KEY = "reviews_db";

function getReviews() {
  return JSON.parse(localStorage.getItem(REVIEW_KEY)) || [];
}

function saveReviews(r) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(r));
}

document.getElementById("submitReview")?.addEventListener("click", () => {

  const text = document.getElementById("reviewText").value.trim();
  if (!text) return;

  const rating = selectedRating;
  const user = getCurrentUser();

  const reviews = getReviews();

  reviews.push({
    user: user ? user.name : "Guest",
    message: text,
    rating,
    date: new Date().toLocaleString()
  });

  saveReviews(reviews);

  document.getElementById("reviewText").value = "";

  const msg = document.getElementById("reviewMsg");
  msg.innerText = "✅ Submitted!";
  msg.classList.add("show");

  setTimeout(() => {
    msg.classList.remove("show");
  }, 2000);
});

let selectedRating = 5;

const starContainer = document.getElementById("starRating");

if (starContainer) {
  starContainer.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerText = "★";

    star.addEventListener("click", () => {
      selectedRating = i;
      updateStars();
    });

    starContainer.appendChild(star);
  }

  function updateStars() {
    [...starContainer.children].forEach((s, idx) => {
      s.classList.toggle("active", idx < selectedRating);
    });
  }

  updateStars();
}
