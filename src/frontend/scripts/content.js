let currentUser = null;
let contentId = null;

async function getContent(id) {
  try {
    const res = await fetch(`${API_URL}/content/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!res.ok) throw new Error('Failed to fetch content');
    const item = await res.json();
    if (!item) return null;

    return {
      ...item,
      userName: item.userId.userName || 'Unknown',
      categoryName: item.categoryId.categoryName || 'Unknown'
    };
  } catch (err) {
    console.error('error:', err);
  }
}

let contentToDelete = null;

async function renderContent() {
  const params = new URLSearchParams(window.location.search);
  contentId = params.get('id');

  if (!contentId) {
    window.location.replace('home.html');
    return;
  }

  const item = await getContent(contentId);
  if (!item) {
    window.location.replace('home.html');
    return;
  }

  const isOwner = item.userId._id === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const container = document.getElementById('contentContainer');
  document.getElementById('userName').textContent = currentUser.userName;

  let bodyHtml = '';

  if (item.type === 'article') {
    bodyHtml = renderArticle(item);
  } else if (item.type === 'video') {
    bodyHtml = renderVideo(item);
  } else if (item.type === 'voice') {
    bodyHtml = renderVoice(item);
  }

  container.innerHTML = `
    <div class="content-detail-page">
      <div class="content-detail-meta">
        ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${UiHelper.escapeHtml(item.categoryName)} - by ${UiHelper.escapeHtml(item.userName)}
      </div>
      
      <div class="content-title-row">
        <h1>${UiHelper.escapeHtml(item.contentName)}</h1>
        <button class="btn-return" onclick="window.location.replace('home.html')">Return to Home Page</button>
      </div>
      
      ${bodyHtml}
      
      
      ${canDelete ? `
        <button class="btn-delete-detail" onclick="showDeleteModal('${item.id}')">Delete</button>
      ` : ''}
    </div>
  `;
}

function renderArticle(item) {
  return `
    <div class="content-body-box">
      <div class="article-text">${UiHelper.escapeHtml(item.description)}</div>
    </div>
  `;
}

function renderVideo(item) {
  let videoId = '';

  if (item.url.includes('youtube.com/watch?v=')) {
    videoId = item.url.split('v=')[1]?.split('&')[0];
  } else if (item.url.includes('youtu.be/')) {
    videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
  }

  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : item.url;

  return `
    <div class="video-thumbnail-detail" onclick="window.open('${UiHelper.escapeHtml(watchUrl)}', '_blank')">
      ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="Video thumbnail">` : ''}
      <div class="play-overlay-detail">
        <div class="play-button-detail">▶</div>
      </div>
    </div>
  `;
}

function renderVoice(item) {
  return `
    <div class="voice-player-detail">
      <div class="voice-icon-detail">🎙</div>
      <audio controls>
        <source src="http://localhost:3000${UiHelper.escapeHtml(item.voiceFile)}" type="audio/webm">
        Your browser does not support the audio element.
      </audio>
    </div>
  `;
}

function showDeleteModal(contentId) {
  contentToDelete = contentId;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  contentToDelete = null;
}

async function confirmDelete() {
  if (!contentToDelete) return;

  try {
    const res = await fetch(`${API_URL}/content/${contentId}`, {
      method: 'DELETE',
      headers: ApiHelper.getAuthHeaders(),
    });

  } catch (err) {
    console.error('error:', err);
  }


  closeDeleteModal();
  alert('Content deleted successfully');
  window.location.replace('home.html');
}

document.getElementById('deleteModal').addEventListener('click', function (e) {
  if (e.target === this) closeDeleteModal();
});


async function init() {
  const saved = localStorage.getItem('currentUser');
  const BaseUrl = localStorage.getItem('BaseUrl');
  if (BaseUrl) {
    API_URL = BaseUrl;
  }
  if (saved) {
    currentUser = JSON.parse(saved);
    if (currentUser.role === "admin") {
      document.getElementById("manageUsersLink").classList.remove("hidden");
    }
  } else {
    location.replace('../index.html');
  }

  renderContent();
}

init();
document.addEventListener("DOMContentLoaded", () => {
  window.NotificationsHelper.start();
});