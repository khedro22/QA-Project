
function showLogoutModal() {
  document.getElementById('logoutModal')?.classList.add('open');
}

function closeLogoutModal() {
  document.getElementById('logoutModal')?.classList.remove('open');
}

function confirmLogout() {
  closeLogoutModal();

  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  // document.getElementById('successOverlay').classList.remove('hidden');
  // setTimeout(() => {
  // }, 2000);
  window.location.replace('../index.html');

}

document.addEventListener('DOMContentLoaded', () => {
  const logoutModal = document.getElementById('logoutModal');

  if (logoutModal) {
    logoutModal.addEventListener('click', function (e) {
      if (e.target === this) {
        closeLogoutModal();
      }
    });
  }
});