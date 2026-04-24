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
      description: 'A black hole is a region of spacetime where gravity is so strong that nothing — not even light — can escape.',
      articleText: 'Science is the systematic study of the natural world through observation, experimentation, and analysis. It helps us understand how things work, from the smallest particles in an atom to the vast galaxies in the universe. By asking questions and seeking evidence-based answers, science allows humans to explore, discover, and innovate.\n\nAt its core, science is driven by curiosity. Humans have always wondered about the world around them—why the sky is blue, how living organisms grow, or what lies beyond our planet. Science provides a structured way to investigate these questions using methods that are logical, repeatable, and reliable.\n\nOne of the key elements of science is the scientific method, which is a step-by-step process used to solve problems and test ideas. It usually begins with an observation, followed by forming a hypothesis, conducting experiments, analyzing results, and drawing conclusions. This method ensures that scientific findings are based on evidence rather than guesswork.\n\nScience is divided into several main branches. Physics focuses on matter, energy, and the laws that govern the universe. Chemistry studies substances, their properties, and how they interact. Biology explores living organisms and life processes. There are also other fields like Earth science and environmental science that study our planet and its ecosystems.',
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
    }
  ]
};

const UI = {
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

function getContent(id) {
  const item = FakeDB.content.find(c => c.id === id);
  if (!item) return null;
  
  return {
    ...item,
    userName: FakeDB.users.find(u => u.id === item.userId)?.userName || 'Unknown',
    categoryName: FakeDB.categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown'
  };
}

let contentToDelete = null;

function renderContent() {
  const params = new URLSearchParams(window.location.search);
  const contentId = params.get('id');
  
  if (!contentId) {
    window.location.href = 'home.html';
    return;
  }

  const item = getContent(contentId);
  if (!item) {
    window.location.href = 'home.html';
    return;
  }

  const isOwner = item.userId === FakeDB.currentUser.id;
  const isAdmin = FakeDB.currentUser.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const container = document.getElementById('contentContainer');
  document.getElementById('userName').textContent = FakeDB.currentUser.userName;

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
        ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${UI.escapeHtml(item.categoryName)} - by ${UI.escapeHtml(item.userName)}
      </div>
      
      <div class="content-title-row">
        <h1>${UI.escapeHtml(item.contentName)}</h1>
        <button class="btn-return" onclick="window.location.href='home.html'">Return to Home Page</button>
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
      <div class="article-text">${UI.escapeHtml(item.articleText)}</div>
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
    <div class="video-thumbnail-detail" onclick="window.open('${UI.escapeHtml(watchUrl)}', '_blank')">
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
        <source src="${UI.escapeHtml(item.voiceFile)}" type="audio/mpeg">
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

function confirmDelete() {
  if (!contentToDelete) return;
  
  // Remove from fake DB
  const idx = FakeDB.content.findIndex(c => c.id === contentToDelete);
  if (idx !== -1) {
    FakeDB.content.splice(idx, 1);
  }
  
  closeDeleteModal();
  alert('Content deleted successfully');
  window.location.href = 'home.html';
}

// Close delete modal on overlay click
document.getElementById('deleteModal').addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

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

document.getElementById('logoutModal').addEventListener('click', function(e) {
  if (e.target === this) closeLogoutModal();
});

renderContent();