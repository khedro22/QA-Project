const API_URL = 'http://localhost:3000/api';

const Auth = {
  currentUser: null,

  init() {
    const saved = localStorage.getItem('currentUser');
    localStorage.setItem('BaseUrl', API_URL);

    if (saved) {
      this.currentUser = JSON.parse(saved);
      location.replace('./pages/home.html');
    }
  },

  async login(login, password) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message };
      }

      this.currentUser = result.user;
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      localStorage.setItem('token', result.token);
      return { success: true, user: this.currentUser };

    } catch (err) {
      return { success: false, message: 'Network error. Is the server running?' };
    }
  },

  async signup(userName, email, password) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, password })
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message };
      }

      this.currentUser = result.user;
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      localStorage.setItem('token', result.token);
      return { success: true, user: this.currentUser };

    } catch (err) {
      return { success: false, message: 'Network error. Is the server running?' };
    }
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  isAdmin() {
    return this.currentUser?.role === 'admin';
  },

  getToken() {
    return localStorage.getItem('token');
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());