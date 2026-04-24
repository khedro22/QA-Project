// client/js/register.js

// Redirect if already logged in
if (Auth.isLoggedIn()) {
  window.location.href = 'index.html';
}

const form = document.getElementById('registerForm');
const formError = document.getElementById('formError');
const formSuccess = document.getElementById('formSuccess');

const emailInput = document.getElementById('email');
const userNameInput = document.getElementById('userName');
const passwordInput = document.getElementById('password');

const emailError = document.getElementById('emailError');
const userNameError = document.getElementById('userNameError');
const passwordError = document.getElementById('passwordError');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  clearAllErrors();
  
  const email = emailInput.value.trim();
  const userName = userNameInput.value.trim();
  const password = passwordInput.value;
  
  let hasError = false;

  // ========== USERNAME VALIDATION ==========
  if (!userName) {
    showFieldError(userNameInput, userNameError, 'Username is required');
    hasError = true;
  }

  // ========== EMAIL VALIDATION ==========
  if (!email) {
    showFieldError(emailInput, emailError, 'Email is required');
    hasError = true;
  } else if (email.length < 20) {
    showFieldError(emailInput, emailError, 'Email must be at least 20 characters');
    hasError = true;
  } else if (email.length > 50) {
    showFieldError(emailInput, emailError, 'Email must not exceed 50 characters');
    hasError = true;
  } else if (!isValidEmailFormat(email)) {
    showFieldError(emailInput, emailError, 'Email must be in format name@domain.com');
    hasError = true;
  }

  // ========== PASSWORD VALIDATION ==========
  if (!password) {
    showFieldError(passwordInput, passwordError, 'Password is required');
    hasError = true;
  } else if (password.length < 8) {
    showFieldError(passwordInput, passwordError, 'Password must be at least 8 characters');
    hasError = true;
  } else if (password.length > 16) {
    showFieldError(passwordInput, passwordError, 'Password must not exceed 16 characters');
    hasError = true;
  } else if (!/[A-Z]/.test(password)) {
    showFieldError(passwordInput, passwordError, 'Password must contain at least one uppercase letter');
    hasError = true;
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    showFieldError(passwordInput, passwordError, 'Password must contain at least one special character');
    hasError = true;
  }

  if (hasError) return;

  // Attempt registration
  const result = Auth.register(userName, email, password);
  
  if (!result.success) {
    formError.textContent = result.message;
    formError.classList.add('show');
    return;
  }

  // Success
  formSuccess.textContent = 'Account created successfully! Redirecting...';
  formSuccess.classList.add('show');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
});

// Real-time error clearing
emailInput.addEventListener('input', function() {
  if (this.value.trim()) clearFieldError(this, emailError);
});

userNameInput.addEventListener('input', function() {
  if (this.value.trim()) clearFieldError(this, userNameError);
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

function clearAllErrors() {
  formError.classList.remove('show');
  formSuccess.classList.remove('show');
  clearFieldError(emailInput, emailError);
  clearFieldError(userNameInput, userNameError);
  clearFieldError(passwordInput, passwordError);
}

function isValidEmailFormat(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}