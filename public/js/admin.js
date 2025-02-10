document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.setItem("toastMessage", JSON.stringify({ message: "Вы вышли из аккаунта", type: "success" }));
      window.location.href = "/";
    });
  });
  
  document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
        console.error("Error role :", error);
    }
  
    try {
      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        throw new Error("Ошибка проверки токена");
      }
  
      const user = await response.json();
  
      if (user.role == "customer") {
        return (window.location.href = "index.html");
      } else {
        loadAdminContent();
      }
  
      
    } catch (error) {
      console.error("Ошибка проверки роли:", error);
    }
  });
  
  function loadAdminContent() {
    const adminContent = document.getElementById("adminContent");
    adminContent.innerHTML = `
      <h2></h2>
    `;
  }
  
  
  async function loadUsers() {
    const adminContent = document.getElementById("adminContent");
    adminContent.innerHTML = "<h2>Users...</h2>";
  
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const users = await response.json();
  
      if (!response.ok) throw new Error(users.message || "Error loading users");
  
      adminContent.innerHTML = `
        <h2>Пользователи</h2>
        <ul class="list-group">
          ${users.map(user => `
            <li class="list-group-item">
              <div class="d-flex flex-column gap-2">
                ${createEditableField(user._id, "name", user.name)}
                ${createEditableField(user._id, "email", user.email)}
                ${createEditableField(user._id, "phone", user.phone || "Не указан")}
                ${createEditableField(user._id, "role", user.role)}
                <button class="btn btn-sm btn-danger mt-2" onclick="deleteUser('${user._id}')">Delete</button>
              </div>
            </li>`).join("")}
        </ul>`;
    } catch (error) {
      showToast(error.message, "danger");
    }
  }
  
  
  function createEditableField(userId, field, value) {
    return `
      <div class="d-flex align-items-center">
        <strong class="me-2">${field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
        <input type="text" class="form-control form-control-sm me-2" id="input-${field}-${userId}" value="${value}" disabled>
        <button class="btn btn-sm btn-info" id="edit-${field}-${userId}" onclick="toggleEdit('${userId}', '${field}')">Edit</button>
        <button class="btn btn-sm btn-success d-none" id="save-${field}-${userId}" onclick="updateUserField('${userId}', '${field}')">Save</button>
      </div>
    `;
  }
  
  function toggleEdit(userId, field) {
    const input = document.getElementById(`input-${field}-${userId}`);
    const editBtn = document.getElementById(`edit-${field}-${userId}`);
    const saveBtn = document.getElementById(`save-${field}-${userId}`);
  
    input.disabled = false; 
    editBtn.classList.add("d-none"); 
    saveBtn.classList.remove("d-none"); 
  }
  
  async function updateUserField(userId, field) {
    const input = document.getElementById(`input-${field}-${userId}`);
    const newValue = input.value.trim();
    const editBtn = document.getElementById(`edit-${field}-${userId}`);
    const saveBtn = document.getElementById(`save-${field}-${userId}`);
  
    if (!newValue) {
      showToast("Поле не может быть пустым", "danger");
      return;
    }
  
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ field, value: newValue }),
      });
  
      const data = await response.json();
      if (response.ok) {
        showToast(`Поле ${field} обновлено`, "success", true);
        input.disabled = true; 
        saveBtn.classList.add("d-none"); 
        editBtn.classList.remove("d-none"); 
      } else {
        showToast(data.message || "Ошибка при обновлении пользователя", "danger");
      }
    } catch (error) {
      showToast("Ошибка обновления", "danger");
    }
  }
  
  async function deleteUser(userId) {
  
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      const data = await response.json();
      if (response.ok) {
        showToast("User deleted", "success", true);
        loadUsers();
      } else {
        showToast(data.message || "Error deleting user", "danger");
      }
    } catch (error) {
      showToast("Error deleting", "danger");
    }
  }
  
  
  