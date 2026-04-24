// client/js/auth.js

// ========== MOCK DATABASE ==========
const DB = {
  users: [
    { 
      id: 'u1', 
      userName: 'admin', 
      email: 'admin@learninghub.com', 
      password: 'Admin@123', 
      role: 'admin', 
      following: [] 
    }
  ]
};

// ========== AUTHENTICATION ==========
const Auth = {
  currentUser: null,

  init() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
  },

  login(login, password) {
    const user = DB.users.find(u => 
      (u.userName === login || u.email === login) && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid username/email or password' };
    }

    this.currentUser = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      following: user.following
    };

    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  },

  register(userName, email, password) {
    if (DB.users.find(u => u.userName === userName)) {
      return { success: false, message: 'Username already taken' };
    }

    if (DB.users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser = {
      id: 'u' + Date.now(),
      userName: userName,
      email: email,
      password: password,
      role: 'user',
      following: []
    };

    DB.users.push(newUser);

    this.currentUser = {
      id: newUser.id,
      userName: newUser.userName,
      email: newUser.email,
      role: newUser.role,
      following: newUser.following
    };

    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());