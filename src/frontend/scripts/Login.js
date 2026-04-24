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

  if (!login) {
    showFieldError(loginInput, loginError, 'Please enter your username or email');
    hasError = true;
  }

  if (!password) {
    showFieldError(passwordInput, passwordError, 'Please enter your password');
    hasError = true;
  }

  if (hasError) return;

  const result = Auth.login(login, password);
  
  if (!result.success) {
    formError.textContent = result.message;
    formError.classList.add('show');
    return;
  }

  window.location.href = './pages/home.html';
});

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