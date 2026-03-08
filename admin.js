// ================= CONFIG =================
const PRODUCTS_DB_KEY = "products_db";
const REVIEW_KEY = "reviews_db";

// ================= ADMIN CHECK =================
function checkAdmin() {
  const isAdmin = localStorage.getItem("isAdmin");
  if (isAdmin !== "true") {
    alert("Admin access only!");
    window.location.href = "login.html";
  }
}

// ================= DB HELPERS =================
function getProductsDB() {
  return JSON.parse(localStorage.getItem(PRODUCTS_DB_KEY)) || [];
}

function saveProductsDB(products) {
  localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products));
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 9999);
}

// ================= PRODUCT RENDER =================
function renderProducts(filter = "") {
  const listEl = document.getElementById("productList");
  let products = getProductsDB();

  if (filter.trim()) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }

  if (products.length === 0) {
    listEl.innerHTML = "<p>No products found.</p>";
    return;
  }

  listEl.innerHTML = products.map(p => {

    let stockText = "";
    let stockClass = "in-stock";

    if (p.quantity <= 0) {
      stockText = "SOLD OUT";
      stockClass = "sold-out";
    } else if (p.quantity <= 5) {
      stockText = `Only ${p.quantity} left`;
      stockClass = "low-stock";
    } else {
      stockText = `In Stock (${p.quantity})`;
    }

    return `
      <div class="product-row">
        <img src="${p.image}" alt="${p.name}">
        
        <div>
          <div class="pname">${p.name}</div>
          <div class="pcat">${p.category}</div>
          <div class="stock-status ${stockClass}">${stockText}</div>
        </div>

        <div>
          <label>Price ₹ / ${p.unit || "item"}</label>
          <input class="row-input" type="number" id="price_${p.id}" value="${p.price}">
        </div>

        <div>
          <label>Qty</label>
          <input class="row-input" type="number" id="qty_${p.id}" value="${p.quantity}">
        </div>

        <div class="row-actions">
          <button class="small-btn update-btn" onclick="window.updateProduct(${p.id})">Update</button>
          <button class="small-btn delete-btn" onclick="window.deleteProduct(${p.id})">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

// ================= UPDATE PRODUCT =================
window.updateProduct = function(id) {
  const products = getProductsDB();
  const p = products.find(x => x.id === id);
  if (!p) return;

  const newPrice = parseInt(document.getElementById(`price_${id}`).value);
  const newQty = parseInt(document.getElementById(`qty_${id}`).value);

  if (newPrice <= 0 || newQty < 0) return alert("Invalid values");

  p.price = newPrice;
  p.quantity = newQty;

  saveProductsDB(products);

  // success message
  const msg = document.createElement("div");
  msg.innerText = "✅ Updated successfully";
  msg.style.color = "green";
  msg.style.marginTop = "6px";

  document.getElementById(`qty_${id}`).parentElement.appendChild(msg);
  setTimeout(() => msg.remove(), 1500);

  renderProducts(document.getElementById("searchAdmin").value);
};

// ================= DELETE PRODUCT =================
window.deleteProduct = function(id) {
  let products = getProductsDB();
  products = products.filter(x => x.id !== id);
  saveProductsDB(products);
  renderProducts(document.getElementById("searchAdmin").value);
};

// ================= ADD PRODUCT =================
const addForm = document.getElementById("addProductForm");

if (addForm) {
addForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value;
  const price = parseInt(document.getElementById("pPrice").value);
  const qty = parseInt(document.getElementById("pQty").value);
  const unit = document.getElementById("pUnit").value;

  const file = document.getElementById("pImage").files[0];
  if (!file) return alert("Select an image");

  const products = getProductsDB();

  if (products.some(p => p.name.toLowerCase() === name.toLowerCase()))
    return alert("Product already exists");

  const reader = new FileReader();

  reader.onload = function(e2) {

    const image = e2.target.result;

    products.push({
      id: generateId(),
      name,
      category,
      price,
      quantity: qty,
      unit,
      image
    });

    saveProductsDB(products);
    e.target.reset();
    renderProducts();
  };

  reader.readAsDataURL(file);
});
}

// ================= ORDERS =================
function getAllOrders() {
  const grouped = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("orders_")) {
      const userOrders = JSON.parse(localStorage.getItem(key)) || [];

      // keep only last 5 per user
      grouped[key] = userOrders.slice(-5);
    }
  }

  const all = [];

  Object.entries(grouped).forEach(([user, orders]) => {
    orders.forEach(order => {
      all.push({ ...order, user });
    });
  });

  return all.sort((a,b) => new Date(b.date) - new Date(a.date));
}

function renderOrders() {
  const el = document.getElementById("ordersList");
  const orders = getAllOrders();

  if (!orders.length) {
    el.innerHTML = "<p>No orders found.</p>";
    return;
  }

  el.innerHTML = orders.map((o,i) => `
    <div class="order-card">
      <div class="order-head">
        <h4>Order #${i+1}</h4>
        <div>${o.user}</div>
        <div>${new Date(o.date).toLocaleString()}</div>
      </div>

      <div class="order-items">
        ${(o.items || []).map(it => `
          <div class="order-item">
            ${it.name} × ${it.quantity}
            ₹${it.price * it.quantity}
          </div>
        `).join("")}
      </div>

      <div class="order-total">
        Total ₹${o.total}
      </div>
    </div>
  `).join("");
}

function renderAdminStats(){

  const users = JSON.parse(localStorage.getItem("users")) || [];

  let totalOrders = 0;
  let totalRevenue = 0;

  for(let i=0;i<localStorage.length;i++){

    const key = localStorage.key(i);

    if(key.startsWith("orders_")){

      const orders = JSON.parse(localStorage.getItem(key)) || [];

      totalOrders += orders.length;

      orders.forEach(o=>{
        totalRevenue += o.total || 0;
      });

    }

  }

  document.getElementById("totalUsers").innerText = users.length;
  document.getElementById("totalOrders").innerText = totalOrders;
  document.getElementById("totalRevenue").innerText = "₹"+totalRevenue;

}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  checkAdmin();
  renderProducts();
  renderOrders();
  renderUsers();
  renderReviews();
  renderAdminStats();
  
  // ===== SEARCH =====
  document.getElementById("searchAdmin")?.addEventListener("input", e => {
    renderProducts(e.target.value);
  });

  // ===== CLEAR ORDERS =====
  document.getElementById("clearOrdersBtn")?.addEventListener("click", () => {
    const ok = confirm("Clear ALL orders?");
    if (!ok) return;

    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("orders_")) keys.push(key);
    }

    keys.forEach(k => localStorage.removeItem(k));

    alert("All orders cleared!");
    renderOrders();
  });

});

// ================= USERS =================

let selectedUserId = null;

function getUsersDB() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsersDB(u) {
  localStorage.setItem("users", JSON.stringify(u));
}

function renderUsers() {

  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  const users = getUsersDB();

  if (!users.length) {
    tbody.innerHTML = "<tr><td colspan='5'>No users found</td></tr>";
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.userId}</td>
      <td>${u.name}</td>
      <td>${u.phone}</td>
      <td>${u.email}</td>
      <td>
        <button onclick="viewUser('${u.userId}')">View More</button>
      </td>
    </tr>
  `).join("");
}

window.viewUser = function(id) {

  selectedUserId = id;

  let users = getUsersDB();

  // remove invalid users
  users = users.filter(u => u && u.userId && u.name && u.email);
  const user = users.find(u => u.userId == id);
  if (!user) return;

  const orders =
    JSON.parse(localStorage.getItem(`orders_${id}`)) || [];

  const reviews =
    (JSON.parse(localStorage.getItem("reviews_db")) || [])
    .filter(r => r.user === user.name);

  // collect checkout addresses
  const addresses = [...new Set(orders.map(o => o.address).filter(Boolean))];

  const content = document.getElementById("userPopupContent");

  content.innerHTML = `
    <h3>${user.name}</h3>

    <p><strong>Phone:</strong> ${user.phone}</p>
    <p><strong>Email:</strong> ${user.email}</p>

    <hr>

    <h4>Checkout Addresses</h4>
    ${
      addresses.length
        ? addresses.map(a => `<div>${a}</div>`).join("")
        : "<p>No addresses</p>"
    }

    <hr>

    <h4>Orders</h4>
    ${
      orders.length
        ? orders.map(o => `
            <div>
              <strong>${o.id}</strong> — ₹${o.total}
            </div>
          `).join("")
        : "<p>No orders</p>"
    }

    <hr>

    <h4>Reviews</h4>
    ${
      reviews.length
        ? reviews.map(r => `
            <div>⭐ ${r.rating} — ${r.message}</div>
          `).join("")
        : "<p>No reviews</p>"
    }
  `;

  document.getElementById("userPopup").classList.remove("hidden");
}

function closeUserPopup() {
  document.getElementById("userPopup").classList.add("hidden");
}

// ===== EDIT USER =====
document.addEventListener("DOMContentLoaded", () => {
document.getElementById("editUserBtn")?.addEventListener("click", () => {

  if (!selectedUserId) return;

  const users = getUsersDB();
  const user = users.find(u => u.userId == selectedUserId);
  if (!user) return;

  document.getElementById("editName").value = user.name;
  document.getElementById("editPhone").value = user.phone;
  document.getElementById("editEmail").value = user.email;

  document.getElementById("viewMode").classList.add("hidden");
  document.getElementById("editMode").classList.remove("hidden");
});


document.getElementById("saveEditUser")?.addEventListener("click", () => {

  const users = getUsersDB();
  const user = users.find(u => u.userId == selectedUserId);
  if (!user) return;

  user.name = document.getElementById("editName").value.trim();
  user.phone = document.getElementById("editPhone").value.trim();
  user.email = document.getElementById("editEmail").value.trim();

  saveUsersDB(users);

  renderUsers();
  viewUser(selectedUserId);

  document.getElementById("editMode").classList.add("hidden");
  document.getElementById("viewMode").classList.remove("hidden");
});

document.getElementById("cancelEditUser")?.addEventListener("click", () => {
  document.getElementById("editMode").classList.add("hidden");
  document.getElementById("viewMode").classList.remove("hidden");
});

// ===== DELETE USER =====

document.getElementById("deleteUserBtn")?.addEventListener("click", () => {

  if (!selectedUserId) return;

  const ok = confirm("Delete this user permanently?");
  if (!ok) return;

  let users = getUsersDB();
  users = users.filter(u => u.userId != selectedUserId);

  saveUsersDB(users);

  // remove orders + cart + favorites
  localStorage.removeItem(`orders_${selectedUserId}`);
  localStorage.removeItem(`cart_${selectedUserId}`);
  localStorage.removeItem(`fav_${selectedUserId}`);

  closeUserPopup();
  renderUsers();
});
});

// ===== REVIEWS =====

function renderReviews() {
  const el = document.getElementById("reviewsList");
  const reviews = JSON.parse(localStorage.getItem(REVIEW_KEY)) || [];

  if (!reviews.length) {
    el.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  // group by user
  const grouped = {};

  reviews.forEach(r => {
    if (!grouped[r.user]) grouped[r.user] = [];
    grouped[r.user].push(r);
  });

  const limited = [];

  Object.values(grouped).forEach(list => {
    limited.push(...list.slice(-3));
  });

  el.innerHTML = limited.map(r => `
    <div class="order-card">
      <strong>${r.user}</strong>
      <div>⭐ ${r.rating}/5</div>
      <div>${r.message}</div>
      <small>${r.date}</small>
    </div>
  `).join("");
}

// ================= ADMIN BUTTONS =================

document.addEventListener("click", function(e) {

  if (e.target.closest("#goToShopBtn")) {
    window.location.href = "index.html";
  }

  if (e.target.closest("#adminLogoutBtn")) {
    localStorage.removeItem("isAdmin");
    window.location.href = "login.html";
  }

});