document.getElementById("paymentForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cardNumber = document.getElementById("cardNumber").value.trim();
  const cardHolder = document.getElementById("cardHolder").value.trim();
  const expiryDate = document.getElementById("expiryDate").value.trim();
  const cvv = document.getElementById("cvv").value.trim();

  if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
    showToast("Все поля обязательны для заполнения.", "danger");
    return;
  }

  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    showToast("Order ID not found.", "danger");
    return;
  }

  let method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
  if (!method) {
    method = "card"; // Устанавливаем "card" по умолчанию
  }

  try {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ orderId, cardNumber, cardHolder, expiryDate, cvv, method }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem("orderId");
      showToast("Payment successful!", "success");
      window.location.href = "bag.html";
    } else {
      showToast(data.message || "Payment failed.", "danger");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    showToast("Payment error occurred.", "danger");
  }
});
