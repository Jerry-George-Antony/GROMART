const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".form");
const successBanner = document.getElementById("successBanner");

/* TAB SWITCH */
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    forms.forEach(f => f.classList.remove("active"));
    document.querySelectorAll(".group").forEach(g =>
      g.classList.remove("error","success")
    );
    successBanner.classList.remove("show");

    tab.classList.add("active");
    document.getElementById(tab.dataset.form + "Form").classList.add("active");
  };
});

/* PASSWORD TOGGLE (CORRECT ICON BEHAVIOR) */
document.querySelectorAll(".toggle").forEach(icon => {
  icon.onclick = () => {
    const input = icon.previousElementSibling;

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  };
});

/* INPUTS */
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

/* REGEX */
const nameRegex = /^(?=.{3,15}$)[A-Za-z]+( [A-Za-z]+)*$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
const phoneRegex = /^[6-9]\d{9}$/;
const passRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[^\s]{8,15}$/;

function validate(input, condition) {
  const group = input.closest(".group");
  group.classList.remove("error", "success");
  group.classList.add(condition ? "success" : "error");
  return condition;
}

/* LIVE VALIDATION */
nameInput.addEventListener("input", () =>
  validate(nameInput,
    nameRegex.test(nameInput.value) &&
    nameInput.value.length >= 3 &&
    nameInput.value.length <= 30
  )
);

emailInput.addEventListener("input", () =>
  validate(emailInput, emailRegex.test(emailInput.value))
);

phoneInput.addEventListener("input", () =>
  validate(phoneInput, phoneRegex.test(phoneInput.value))
);

passInput.addEventListener("input", () => {
  const valid = passRegex.test(passInput.value);
  validate(passInput, valid);
  if (confirmInput.value)
    validate(confirmInput, confirmInput.value === passInput.value);
});

confirmInput.addEventListener("input", () =>
  validate(confirmInput, confirmInput.value === passInput.value)
);

/* SIGNUP */
signupForm.addEventListener("submit", e => {
  e.preventDefault();

  if (
    !validate(nameInput, nameRegex.test(nameInput.value)) ||
    !validate(emailInput, emailRegex.test(emailInput.value)) ||
    !validate(phoneInput, phoneRegex.test(phoneInput.value)) ||
    !validate(passInput, passRegex.test(passInput.value)) ||
    !validate(confirmInput, confirmInput.value === passInput.value)
  ) return;

  const users = getUsers();
  let userId;
  do {
    userId = generateUserId();
  } while (userIdExists(userId));

  users.push({
    userId,
    name: nameInput.value.trim(),
    email: emailInput.value,
    phone: phoneInput.value,
    password: passInput.value
  });

  saveUsers(users);

  successBanner.innerHTML = `
    ✅ Account created successfully<br>
    <b>User ID: ${userId}</b>
  `;
  successBanner.classList.add("show");

  setCurrentUser({
  userId,
  name: nameInput.value.trim(),
  email: emailInput.value,
  phone: phoneInput.value
  });

  setTimeout(() => location.href = "index.html", 2500);
});

/* LOGIN */
loginForm.addEventListener("submit", e => {
  e.preventDefault();

  const enteredEmail = loginEmail.value.trim().toLowerCase();
  const enteredPass = loginPassword.value;

  /* STEP 1 — ADMIN CHECK */
  if (enteredEmail === "admin@gromart.com" && enteredPass === "Admin@123") {

  successBanner.innerHTML = `✅ Welcome Admin`;
  successBanner.classList.add("show");

  // Store admin session flag
  localStorage.setItem("isAdmin", "true");

  // IMPORTANT: remove any normal user session if already stored
  localStorage.removeItem("currentUser");

  setTimeout(() => {
    location.href = "admin.html"; // redirect to admin panel
  }, 1200);

  return; // stop here so user login doesn't run
  }

  /* STEP 2 — NORMAL USER LOGIN */
  const user = authenticate(enteredEmail, enteredPass);

  if (!user) {
    validate(loginEmail, false);
    successBanner.innerHTML = "❌ Invalid email or password";
    successBanner.classList.add("show");
    return;
  }

  // Save logged in user session
  setCurrentUser(user);

  successBanner.innerHTML = `✅ Welcome back, <b>${user.name}</b>`;
  successBanner.classList.add("show");

  setTimeout(() => location.href = "index.html", 1500);
});


/* AUTO OPEN LOGIN / SIGNUP FROM INDEX */
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

if (mode === "signup") {
  document.querySelector('[data-form="signup"]').click();
} else {
  document.querySelector('[data-form="login"]').click();
}

/* ================= FORGOT PASSWORD ================= */

function openForgot() {

  // deactivate tabs visually
  tabs.forEach(t => t.classList.remove("active"));

  // hide only login + signup
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("signupForm").classList.remove("active");

  // show forgot
  document.getElementById("forgotForm").classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("forgotForm")?.addEventListener("submit", e => e.preventDefault());
  const verifyBtn = document.getElementById("verifyUser");
  const saveBtn = document.getElementById("saveNewPass");
  const resetBox = document.getElementById("resetFields");

  verifyBtn?.addEventListener("click", () => {

    const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
    const phone = document.getElementById("forgotPhone").value.trim();

    const users = getUsers();

    const user = users.find(u =>
      u.email.toLowerCase() === email &&
      u.phone === phone
    );

    if (!user) {
      alert("User not found. Check email/phone.");
      return;
    }

    resetBox.classList.remove("hidden");
    verifyBtn.style.display = "none";
    alert("User verified. Enter new password.");
  });

  saveBtn?.addEventListener("click", () => {

  const newPassInput = document.getElementById("newPassword");
  const confirmInput = document.getElementById("confirmNewPassword");

  const newPass = newPassInput.value;
  const confirmPass = confirmInput.value;

  const validPass = validate(newPassInput, passRegex.test(newPass));
  const matchPass = validate(confirmInput, newPass === confirmPass);

  if (!validPass || !matchPass) return;

  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
  const phone = document.getElementById("forgotPhone").value.trim();

  const users = getUsers();

  const user = users.find(u =>
    u.email.toLowerCase() === email &&
    u.phone === phone
  );

  if (!user) return;

  user.password = newPass;
  saveUsers(users);

  alert("Password updated successfully");
  location.href = "login.html";
  });

});
