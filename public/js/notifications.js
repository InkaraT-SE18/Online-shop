function showToast(message, type = "success", persist = false) {
    const toastContainer = document.getElementById("toastContainer");
  
    const toastElement = document.createElement("div");
    toastElement.classList.add("toast", "align-items-center", `text-bg-${type}`, "border-0");
    toastElement.setAttribute("role", "alert");
    toastElement.setAttribute("aria-live", "assertive");
    toastElement.setAttribute("aria-atomic", "true");
  
    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
  
    toastContainer.appendChild(toastElement);
  
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
  
    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });
  
    if (persist) {
      localStorage.setItem("toastMessage", JSON.stringify({ message, type }));
    }
  }
  
  // 🔹 Проверяем localStorage при загрузке страницы и показываем уведомление, если оно есть
  document.addEventListener("DOMContentLoaded", () => {
    const savedToast = localStorage.getItem("toastMessage");
    if (savedToast) {
      const { message, type } = JSON.parse(savedToast);
      showToast(message, type);
      localStorage.removeItem("toastMessage"); // Удаляем после показа
    }
  });