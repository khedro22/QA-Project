// client/js/login.js

// Redirect if already logged in
if (Auth.isLoggedIn()) {
  window.location.href = 'index.html';
}

const form = document.getElementById('loginForm');
const formError = document.getElementById('formError');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const passwordError = document.getElementById('passwordError');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  clearErrors();
  
  const login = loginInput.value.trim();
  const password = passwordInput.value;
  let hasError = false;

  // Validate login field
  if (!login) {
    showFieldError(loginInput, loginError, 'Please enter your username or email');
    hasError = true;
  }

  // Validate password field
  if (!password) {
    showFieldError(passwordInput, passwordError, 'Please enter your password');
    hasError = true;
  }

  if (hasError) return;

  // Attempt login
  const result = Auth.login(login, password);
  
  if (!result.success) {
    formError.textContent = result.message;
    formError.classList.add('show');
    return;
  }

  // Success
  window.location.href = './pages/home.html';
});

// Real-time error clearing
loginInput.addEventListener('input', function() {
  if (this.value.trim()) clearFieldError(this, loginError);
});

passwordInput.addEventListener('input', function() {
  if (this.value) clearFieldError(this, passwordError);
});

function showFieldError(input, errorEl, message) {
  input.classList.add('error');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function clearFieldError(input, errorEl) {
  input.classList.remove('error');
  errorEl.classList.remove('show');
}

function clearErrors() {
  formError.classList.remove('show');
  clearFieldError(loginInput, loginError);
  clearFieldError(passwordInput, passwordError);
}