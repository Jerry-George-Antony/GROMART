function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function generateUserId() {
  return Math.floor(10000 + Math.random() * 90000);
}

function userIdExists(id) {
  return getUsers().some(u => u.userId === id);
}

function authenticate(email, password) {
  return getUsers().find(
    u => u.email.toLowerCase() === email && u.password === password
  );
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function logoutUser() {
  localStorage.removeItem("currentUser");
}
