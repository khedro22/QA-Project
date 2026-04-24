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