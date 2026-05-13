
// // ========== PREVENT BACK TO LOGIN ==========
// history.pushState(null, null, location.href);
// window.onpopstate = function () {
//   history.pushState(null, null, location.href);
// };

// ========== STATE ==========
let currentCategoryId = null;
let currentUser = null;

// ========== NOTIFICATIONS ==========


document.addEventListener('click', function (e) {
  if (!e.target.closest('#notifDropdown')) {
    document.getElementById('notifPanel').classList.remove('open');
  }
});

// ========== CATEGORIES ==========

async function renderCategoryTabs() {
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');

    const categories = await res.json();
    const tabs = document.getElementById('catTabs');

    currentCategoryId = categories[0]._id;
    tabs.innerHTML = categories.map(cat => `
      <div 
        class="cat-tab ${cat._id === currentCategoryId ? 'active' : ''}" 
        data-id="${cat._id}"
        onclick="switchCategory('${cat._id}')"
      >
        ${UiHelper.escapeHtml(cat.categoryName)}
      </div>
    `).join('');


    renderCategoryActions();
    renderContent();

  } catch (err) {
    console.error('Categories error:', err);
  }
}

async function switchCategory(catId) {
  currentCategoryId = catId;

  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.id === catId);
  });

  renderCategoryActions();
  renderContent();
}

// ========== CATEGORY ACTIONS ==========

async function renderCategoryActions() {
  try {
    if (!currentCategoryId) return;

    const container = document.getElementById('catActions');

    // Check if following
    const userRes = await fetch(`${API_URL}/users/profile`, {
      headers: ApiHelper.getAuthHeaders()
    });
    const userData = await userRes.json();
    const isFollowing = userData.following.some(f => f._id === currentCategoryId || f === currentCategoryId);

    container.innerHTML = `
    <button class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}" onclick="toggleFollow()">
      ${isFollowing ? 'Following' : 'Follow'}
    </button>
    <button class="btn btn-primary" onclick="publishContent()">
      + Publish
    </button>
  `;
  } catch (err) {
    console.error('Content error:', err);
  }
}

async function toggleFollow() {
  const isFollowing = document.querySelector('.cat-actions .btn').textContent.trim() === 'Following';

  if (isFollowing) {
    await fetch(`${API_URL}/categories/${currentCategoryId}/unfollow`, {
      method: 'POST',
      headers: ApiHelper.getAuthHeaders()
    });
  } else {
    await fetch(`${API_URL}/categories/${currentCategoryId}/follow`, {
      method: 'POST',
      headers: ApiHelper.getAuthHeaders()
    });
  }

  renderCategoryActions();
  renderCategoryTabs();
}

function publishContent() {
  window.location.href = `publish.html?category=${currentCategoryId}`;
}

// ========== CONTENT ==========

async function renderContent() {
  if (!currentCategoryId) return;

  try {
    const catRes = await fetch(`${API_URL}/categories`);
    const categories = await catRes.json();
    const category = categories.find(cat => cat._id === currentCategoryId);

    document.getElementById('sectionTitle').textContent =
      `${UiHelper.escapeHtml(category.categoryName)} - Recent articles & media`;

    const res = await fetch(`${API_URL}/content/category/${currentCategoryId}`);
    if (!res.ok) throw new Error('Failed to fetch content');

    const content = await res.json();
    const grid = document.getElementById('contentGrid');

    if (content.length === 0) {
      grid.innerHTML = '<p class="text-muted">No content in this category yet.</p>';
      return;
    }

    const leftContent = content.filter(item => item.type === 'article' || item.type === 'voice');
    const rightContent = content.filter(item => item.type === 'video');

    grid.innerHTML = `
      <div class="content-left">
        ${leftContent.length > 0 ? leftContent.map(item => {
      if (item.type === 'article') {
        return renderLeftArticleCard(item);
      } else {
        return renderLeftVoiceCard(item);
      }
    }).join('') : '<p class="text-muted text-center"></p>'}
      </div>
      <div class="content-right">
        ${rightContent.length > 0 ? rightContent.map(item => {
      return renderRightVideoCard(item);
    }).join('') : '<p class="text-muted text-center"></p>'}
      </div>
    `;
  } catch (err) {
    console.error('Content error:', err);
  }
}

function renderLeftArticleCard(item) {
  return `
    <div class="left-card">
      <div class="left-meta">
        <span class="type-tag type-article-tag">article</span>
        <span class="meta-text">${UiHelper.escapeHtml(item.categoryId?.categoryName || 'Unknown')} - by ${UiHelper.escapeHtml(item.userId?.userName || 'Unknown')}</span>
      </div>
      <h3>${UiHelper.escapeHtml(item.contentName)}</h3>
      <p class="left-description">${UiHelper.escapeHtml(UiHelper.truncateText(item.description || item.articleText, 200))}</p>
      <div class="left-footer">
        <button class="btn-see-more" onclick="viewContent('${item._id}')">See more details</button>
      </div>
    </div>
  `;
}

function renderLeftVoiceCard(item) {
  return `
    <div class="left-card">
      <div class="left-meta">
        <span class="type-tag type-voice-tag">voice note</span>
        <span class="meta-text">${UiHelper.escapeHtml(item.categoryId?.categoryName || 'Unknown')} - by ${UiHelper.escapeHtml(item.userId?.userName || 'Unknown')}</span>
      </div>
      <h3>${UiHelper.escapeHtml(item.contentName)}</h3>
      <div class="voice-player">
        <div class="voice-icon">🎙</div>
        <audio controls>
          <source src="http://localhost:3000${UiHelper.escapeHtml(item.voiceFile)}" type="audio/webm">
          Your browser does not support the audio element.
        </audio>
      </div>
      <div class="left-footer">
        <button class="btn-see-more" onclick="viewContent('${item._id}')">See more details</button>
      </div>
    </div>
  `;
}

function renderRightVideoCard(item) {
  let videoId = '';

  if (item.url?.includes('youtube.com/watch?v=')) {
    videoId = item.url.split('v=')[1]?.split('&')[0];
  } else if (item.url?.includes('youtu.be/')) {
    videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
  } else if (item.url?.includes('embed/')) {
    videoId = item.url.split('embed/')[1]?.split('?')[0];
  }

  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : item.url;

  return `
    <div class="right-card">
      <div class="right-meta">
        <span class="type-tag type-video-tag">video</span>
        <span class="meta-text">${UiHelper.escapeHtml(item.categoryId?.categoryName || 'Unknown')} - by ${UiHelper.escapeHtml(item.userId?.userName || 'Unknown')}</span>
      </div>
      <h3>${UiHelper.escapeHtml(item.contentName)}</h3>
      <div class="video-thumbnail" onclick="window.open('${UiHelper.escapeHtml(watchUrl)}', '_blank')">
        ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="Video thumbnail" onerror="this.style.display='none';">` : ''}
        <div class="play-overlay">
          <div class="play-button">▶</div>
        </div>
      </div>
      <div class="right-footer">
        <button class="btn-see-more" onclick="viewContent('${item._id}')">See more details</button>
      </div>
    </div>
  `;
}

function viewContent(contentId) {
  window.location.href = `content.html?id=${contentId}`;
}

// ========== INIT ==========

async function init() {
  // Load current user
  const saved = localStorage.getItem('currentUser');
  const BaseUrl = localStorage.getItem('BaseUrl');
  if (BaseUrl) {
    API_URL = BaseUrl;
  }
  if (saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('userName').textContent = currentUser.userName;
    if (currentUser.role === "admin") {
      document.getElementById("manageUsersLink").classList.remove("hidden");
    }
  }

  await renderCategoryTabs();
}

init();
document.addEventListener("DOMContentLoaded", () => {
  window.NotificationsHelper.start();
});