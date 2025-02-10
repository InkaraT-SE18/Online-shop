// Регистрация
document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
  
    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email.", "danger");
      return;
    }
  
    // Проверка номера телефона (только цифры)
    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(phone)) {
      showToast("The phone number must contain only numbers.", "danger");
      return;
    }
  
    // Проверка пароля (например, минимум 6 символов)
    if (password.length < 6) {
      showToast("The password must be at least 6 characters.", "danger");
      return;
    }
  
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showToast("Registration successful! Now log in to your account.", "success", true);
        window.location.href = "login.html"; 
      } else {
        showToast(data.message || "Registration error", "danger");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showToast("An error has occurred", "danger");
    }
  });
  
  // 🔹 Авторизация
  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("emailForOTP", email);
        showToast("OTP code has been sent. Enter it to login.", "success", true);
        window.location.href = "verify-otp.html"; // Переход на страницу ввода OTP
      } else {
        showToast(data.message || "Authorization error", "danger");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showToast("Server error", "danger");
    }
  });
  
  // 🔹 Проверка OTP-кода
  document.getElementById("otpForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const email = localStorage.getItem("emailForOTP");
    const otp = document.getElementById("otp").value.trim();
  
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("token", data.token);
        showToast("Авторизация успешна!", "success", true);
        window.location.href = "profile.html";
      } else {
        showToast(data.message || "Ошибка подтверждения OTP", "danger");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showToast("Ошибка сервера", "danger");
    }
  });

 