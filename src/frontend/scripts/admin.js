let selectedUserId = null;
let API_URL = null;
let currentUser = null;
let contentToDelete = null;

async function fetchUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();

    renderUsers(users);
  } catch (error) {
    console.error(error);
  }
}
// Render users in HTML
function renderUsers(users) {
  const container = document.getElementById("usersContainer");

  container.innerHTML = "";

  users.forEach(user => {
    if (user._id === currentUser.id) return; // Skip current admin
    container.innerHTML += `
      <div class="admin-row">
        <div>${user.userName}</div>
        <div>${user.email}</div>
        <div>
          <button 
            class="btn-delete-detail"
            onclick="showDeleteModal('${user._id}')"
          >
            Delete Account
          </button>
        </div>
      </div>
    `;
  });
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
    const res = await fetch(`${API_URL}/users/${contentToDelete}`, {
      method: 'DELETE',
      headers: ApiHelper.getAuthHeaders(),
    });

  } catch (err) {
    console.error('error:', err);
  }

  closeDeleteModal();
  alert('User deleted successfully');
  window.location.reload();
}

document.getElementById('deleteModal').addEventListener('click', function (e) {
  if (e.target === this) closeDeleteModal();
});


async function init() {
  const BaseUrl = localStorage.getItem('BaseUrl');
  if (BaseUrl) {
    API_URL = BaseUrl;
  }
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    currentUser = JSON.parse(saved);
  }
  await fetchUsers();
}
init();