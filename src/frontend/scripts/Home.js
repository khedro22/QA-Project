const FakeDB = {
  currentUser: {
    id: 'u1',
    userName: 'user_123',
    email: 'user123@learninghub.com',
    role: 'user',
    following: ['c1', 'c2']
  },

  users: [
    { id: 'u1', userName: 'user_123', role: 'user' },
    { id: 'u2', userName: 'user_1', role: 'user' },
    { id: 'u3', userName: 'admin', role: 'admin' }
  ],

  categories: [
    { id: 'c1', categoryName: 'Science' },
    { id: 'c2', categoryName: 'Arts' },
    { id: 'c3', categoryName: 'History' }
  ],

  content: [
    {
      id: 'con1',
      contentName: 'Introduction to Science',
      type: 'article',
      description: 'A black hole is a region of spacetime where gravity is so strong that nothing — not even light — can escape. It is the result of the deformation of spacetime caused by a very compact mass. Around a black hole there is a position of no return, called the event horizon.',
      articleText: 'A black hole is a region of spacetime where gravity is so strong that nothing — not even light — can escape. It is the result of the deformation of spacetime caused by a very compact mass. Around a black hole there is a position of no return, called the event horizon. It is called "black" because it absorbs all the light that hits it, reflecting nothing, just like a perfect black body in thermodynamics.',
      userId: 'u1',
      categoryId: 'c1',
      createdAt: '2026-04-23T10:00:00Z'
    },
    {
      id: 'con2',
      contentName: 'The Power of Renewable Energy',
      type: 'video',
      description: 'Exploring renewable energy sources and their impact on our future',
      url: 'https://www.youtube.com/watch?v=HgiKr0LmoS0',
      userId: 'u2',
      categoryId: 'c1',
      createdAt: '2026-04-22T14:00:00Z'
    },
    {
      id: 'con3',
      contentName: 'Explaining Science',
      type: 'voice',
      description: 'Voice explanation of fundamental science concepts',
      voiceFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      userId: 'u2',
      categoryId: 'c1',
      createdAt: '2026-04-21T09:00:00Z'
    },
    {
      id: 'con4',
      contentName: 'Modern Art Trends',
      type: 'article',
      description: 'Exploring contemporary art movements and their impact on society. From abstract expressionism to digital art, the evolution continues.',
      articleText: 'Contemporary art encompasses a wide range of artistic styles and approaches that emerged in the late 20th century and continue to evolve today. From abstract expressionism to digital art, the evolution continues.',
      userId: 'u1',
      categoryId: 'c2',
      createdAt: '2026-04-20T16:00:00Z'
    },
    {
      id: 'con5',
      contentName: 'Renaissance History',
      type: 'video',
      description: 'The Renaissance period explained in detail',
      url: 'https://www.youtube.com/watch?v=PYTNW_1-fPk',
      userId: 'u3',
      categoryId: 'c3',
      createdAt: '2026-04-19T11:00:00Z'
    }
  ],

  notifications: [
    {
      id: 'n1',
      userId: 'u1',
      categoryId: 'c1',
      contentId: 'con2',
      message: 'New video: The Power of Renewable Energy',
      read: false,
      createdAt: '2026-04-22T14:00:00Z'
    },
    {
      id: 'n2',
      userId: 'u1',
      categoryId: 'c1',
      contentId: 'con3',
      message: 'New voice note: Explaining Science',
      read: false,
      createdAt: '2026-04-21T09:00:00Z'
    },
    {
      id: 'n3',
      userId: 'u1',
      categoryId: 'c2',
      contentId: 'con4',
      message: 'New article: Modern Art Trends',
      read: true,
      createdAt: '2026-04-20T16:00:00Z'
    }
  ]
};

const Data = {
  getCategories() {
    return FakeDB.categories.map(c => ({
      ...c,
      followerCount: FakeDB.users.filter(u => u.following?.includes(c.id)).length,
      isFollowing: FakeDB.currentUser.following.includes(c.id)
    }));
  },

  getCategory(id) {
    return FakeDB.categories.find(c => c.id === id);
  },

  getContentByCategory(categoryId) {
    return FakeDB.content
      .filter(c => c.categoryId === categoryId)
      .map(c => ({
        ...c,
        userName: FakeDB.users.find(u => u.id === c.userId)?.userName || 'Unknown',
        categoryName: FakeDB.categories.find(cat => cat.id === c.categoryId)?.categoryName || 'Unknown'
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getNotifications() {
    return FakeDB.notifications
      .filter(n => n.userId === FakeDB.currentUser.id)
      .map(n => ({
        ...n,
        categoryName: FakeDB.categories.find(c => c.id === n.categoryId)?.categoryName || 'Unknown',
        contentName: FakeDB.content.find(c => c.id === n.contentId)?.contentName || 'Unknown'
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  followCategory(categoryId) {
    if (!FakeDB.currentUser.following.includes(categoryId)) {
      FakeDB.currentUser.following.push(categoryId);
    }
  },

  unfollowCategory(categoryId) {
    FakeDB.currentUser.following = FakeDB.currentUser.following.filter(id => id !== categoryId);
  },

  markNotificationRead(id) {
    const n = FakeDB.notifications.find(n => n.id === id);
    if (n) n.read = true;
  },

  markAllNotificationsRead() {
    FakeDB.notifications.forEach(n => {
      if (n.userId === FakeDB.currentUser.id) n.read = true;
    });
  },

  deleteContent(id) {
    const idx = FakeDB.content.findIndex(c => c.id === id);
    if (idx !== -1) {
      FakeDB.content.splice(idx, 1);
      FakeDB.notifications = FakeDB.notifications.filter(n => n.contentId !== id);
      return true;
    }
    return false;
  }
};

const UI = {
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
};

let currentCategoryId = 'c1';


function toggleNotif() {
  const panel = document.getElementById('notifPanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    renderNotifications();
  }
}

function renderNotifications() {
  const notifs = Data.getNotifications();
  const container = document.getElementById('notifList');
  const countBadge = document.getElementById('notifCount');

  const unread = notifs.filter(n => !n.read).length;
  countBadge.textContent = unread;
  countBadge.classList.toggle('zero', unread === 0);

  if (notifs.length === 0) {
    container.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}', '${n.contentId}')">
      <p>${UI.escapeHtml(n.message)}</p>
      <div class="notif-meta">${UI.escapeHtml(n.categoryName)} • ${UI.formatDate(n.createdAt)}</div>
    </div>
  `).join('');
}

function handleNotifClick(notifId, contentId) {
  Data.markNotificationRead(notifId);
  renderNotifications();
  viewContent(contentId);
}

function markAllRead() {
  Data.markAllNotificationsRead();
  renderNotifications();
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('#notifDropdown')) {
    document.getElementById('notifPanel').classList.remove('open');
  }
});


function renderCategoryTabs() {
  const tabs = document.getElementById('catTabs');
  const categories = Data.getCategories();

  tabs.innerHTML = categories.map(cat => `
    <div 
      class="cat-tab ${cat.id === currentCategoryId ? 'active' : ''}" 
      data-id="${cat.id}"
      onclick="switchCategory('${cat.id}')"
    >
      ${UI.escapeHtml(cat.categoryName)}
    </div>
  `).join('');
}

function switchCategory(catId) {
  currentCategoryId = catId;

  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.id === catId);
  });

  renderCategoryActions();
  renderContent();
}


function renderCategoryActions() {
  const container = document.getElementById('catActions');
  const cat = Data.getCategories().find(c => c.id === currentCategoryId);

  if (!cat) return;

  container.innerHTML = `
    <button class="btn ${cat.isFollowing ? 'btn-secondary' : 'btn-primary'}" onclick="toggleFollow()">
      ${cat.isFollowing ? 'Following' : 'Follow'}
    </button>
    <button class="btn btn-primary" onclick="publishContent()">
      + Publish
    </button>
  `;
}

function toggleFollow() {
  const cat = Data.getCategories().find(c => c.id === currentCategoryId);

  if (cat.isFollowing) {
    Data.unfollowCategory(currentCategoryId);
  } else {
    Data.followCategory(currentCategoryId);
  }

  renderCategoryActions();
  renderCategoryTabs();
}

function publishContent() {
  alert('Navigate to publish page for category: ' + currentCategoryId);
}



function renderContent() {
  const cat = Data.getCategory(currentCategoryId);
  const allContent = Data.getContentByCategory(currentCategoryId);

  document.getElementById('sectionTitle').textContent =
    `${UI.escapeHtml(cat?.categoryName || '')} - Recent articles & media`;

  const grid = document.getElementById('contentGrid');

  if (allContent.length === 0) {
    grid.innerHTML = '<p class="text-muted">No content in this category yet.</p>';
    return;
  }

  const leftContent = allContent.filter(item => item.type === 'article' || item.type === 'voice');
  const rightContent = allContent.filter(item => item.type === 'video');

  grid.innerHTML = `
    <div class="content-left">
      ${leftContent.length > 0 ? leftContent.map(item => {
    const isOwner = item.userId === FakeDB.currentUser.id;
    const isAdmin = FakeDB.currentUser.role === 'admin';

    if (item.type === 'article') {
      return renderLeftArticleCard(item);
    } else {
      return renderLeftVoiceCard(item);
    }
  }).join('') : '<p class="text-muted text-center">No articles or voice notes</p>'}
    </div>
    <div class="content-right">
      ${rightContent.length > 0 ? rightContent.map(item => {
    const isOwner = item.userId === FakeDB.currentUser.id;
    const isAdmin = FakeDB.currentUser.role === 'admin';

    return renderRightVideoCard(item);
  }).join('') : '<p class="text-muted text-center">No videos</p>'}
    </div>
  `;
}

function renderLeftArticleCard(item) {
  return `
    <div class="left-card">
      <div class="left-meta">
        <span class="type-tag type-article-tag">article</span>
        <span class="meta-text">${UI.escapeHtml(item.categoryName)} - by ${UI.escapeHtml(item.userName)}</span>
      </div>
      <h3>${UI.escapeHtml(item.contentName)}</h3>
      <p class="left-description">${UI.escapeHtml(UI.truncateText(item.description || item.articleText, 200))}</p>
      <div class="left-footer">
        <button class="btn-see-more" onclick="viewContent('${item.id}')">See more details</button>
      </div>
    </div>
  `;
}

function renderLeftVoiceCard(item) {
  return `
    <div class="left-card">
      <div class="left-meta">
        <span class="type-tag type-voice-tag">voice note</span>
        <span class="meta-text">${UI.escapeHtml(item.categoryName)} - by ${UI.escapeHtml(item.userName)}</span>
      </div>
      <h3>${UI.escapeHtml(item.contentName)}</h3>
      <div class="voice-player">
        <div class="voice-icon">🎙</div>
        <audio controls>
          <source src="${UI.escapeHtml(item.voiceFile)}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
      <div class="left-footer">
        <button class="btn-see-more" onclick="viewContent('${item.id}')">See more details</button>
      </div>
    </div>
  `;
}

function renderRightVideoCard(item) {
  let videoId = '';

  if (item.url.includes('youtube.com/watch?v=')) {
    videoId = item.url.split('v=')[1]?.split('&')[0];
  } else if (item.url.includes('youtu.be/')) {
    videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
  } else if (item.url.includes('embed/')) {
    videoId = item.url.split('embed/')[1]?.split('?')[0];
  }

  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : item.url;

  return `
    <div class="right-card">
      <div class="right-meta">
        <span class="type-tag type-video-tag">video</span>
        <span class="meta-text">${UI.escapeHtml(item.categoryName)} - by ${UI.escapeHtml(item.userName)}</span>
      </div>
      <h3>${UI.escapeHtml(item.contentName)}</h3>
      <div class="video-thumbnail" onclick="window.open('${UI.escapeHtml(watchUrl)}', '_blank')">
        ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="Video thumbnail" onerror="this.style.display='none';">` : ''}
        <div class="play-overlay">
          <div class="play-button">▶</div>
        </div>
      </div>
      <div class="right-footer">
        <button class="btn-see-more" onclick="viewContent('${item.id}')">See more details</button>
      </div>
    </div>
  `;
}


function viewContent(contentId) {
  window.location.href = `content.html?id=${contentId}`;
}

function showLogoutModal() {
  document.getElementById('logoutModal').classList.add('open');
}

function closeLogoutModal() {
  document.getElementById('logoutModal').classList.remove('open');
}

function confirmLogout() {
  closeLogoutModal();

  window.location.href = '../index.html';
}

document.getElementById('logoutModal').addEventListener('click', function (e) {
  if (e.target === this) {
    closeLogoutModal();
  }
});


function init() {
  document.getElementById('userName').textContent = FakeDB.currentUser.userName;
  renderCategoryTabs();
  renderCategoryActions();
  renderContent();
  renderNotifications();
}

init();