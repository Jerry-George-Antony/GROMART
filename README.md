# 🛒 GroMart – Grocery E-Commerce Web Application

GroMart is a front-end grocery shopping web application that simulates an online supermarket experience.
It allows users to browse products, add items to a cart, manage favorites, place orders, and enables an administrator to manage products, users, and orders through an admin dashboard.

The project demonstrates front-end development concepts such as DOM manipulation, state management using LocalStorage, UI design, and admin-user interaction.

---
# Live Demo



## 🚀 Features

### 👤 User Features

* User Registration and Login
* Browse products by category
* Product search functionality
* Add items to cart
* Quantity management in cart
* Favorite products system
* Place orders with checkout
* View order history
* Submit product reviews

### 🛠 Admin Features

* Admin login access
* Add new products with images
* Update product price and stock
* Delete products
* View customer orders
* View registered users
* View customer reviews
* Manage inventory stock status

---

## 🧩 Technologies Used

| Technology   | Purpose                  |
| ------------ | ------------------------ |
| HTML         | Structure of the website |
| CSS          | Styling and layout       |
| JavaScript   | Application logic        |
| LocalStorage | Simulated database       |

---

## 📂 Project Structure

```
GROMART
│
├── admin.html        # Admin dashboard
├── index.html        # Home page
├── login.html        # User login
├── cart.html         # Shopping cart
├── favorites.html    # Favorite products
├── orders.html       # User order history
├── receipt.html      # Order receipt
│
├── css
│   ├── style.css
│   └── admin.css
│
├── js
│   ├── main.js
│   ├── cart.js
│   ├── admin.js
│   └── auth.js
│
└── assets
    ├── icons
    └── images
```

---

## ⚙️ How the System Works

### Product Management

Products are stored in **LocalStorage** and are dynamically rendered on the website.
The admin panel allows adding, updating, and deleting products from the product database.

### Cart System

Each logged-in user has an individual cart stored using a unique key in LocalStorage.

Example:

```
cart_userId
```

### Order System

When a user checks out, the order is stored in LocalStorage under:

```
orders_userId
```

The admin dashboard collects all orders across users and displays them in the **Orders panel**.

### Favorites

Users can mark products as favorites, which are stored separately per user.

---

## 🔐 Admin Access

The admin dashboard allows management of products and monitoring of users and orders.

Admin capabilities include:

* Inventory management
* User activity monitoring
* Order tracking
* Review moderation

---

## 💡 Key Learning Outcomes

This project helped demonstrate:

* JavaScript DOM manipulation
* Front-end application structure
* LocalStorage data management
* UI component design
* Admin-user system architecture

---

## 📌 Future Improvements

Possible future enhancements include:

* Backend integration (Node.js / Spring Boot)
* Database support (MySQL / MongoDB)
* Payment gateway integration
* Responsive mobile design
* Product filtering and sorting improvements
* Order analytics dashboard

---

## 👨‍💻 Author

**Jerry George Antony**

GitHub:
https://github.com/Jerry-George-Antony

---

⭐ If you like this project, feel free to star the repository.
