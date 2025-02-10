document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  loadOrders();
});

const loadCart = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    if (!item.quantity || item.quantity < 1) item.quantity = 1; // Дефолтное значение

    total += item.price * item.quantity;
    cartItemsContainer.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity(${index}, -1)">-</button>
          <span id="quantity-${index}">${item.quantity}</span>
          <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity(${index}, 1)">+</button>
        </td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Remove</button></td>
      </tr>
    `;
  });

  document.getElementById("cart-total").innerText = `Total: $${total.toFixed(2)}`;
  localStorage.setItem("cart", JSON.stringify(cart)); // Сохранение корзины
};

const updateQuantity = (index, change) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index]) {
    cart[index].quantity = Math.max(1, cart[index].quantity + change); // Запрещаем отрицательное значение

    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }
};

const removeFromCart = (index) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    showToast("Product removed from cart", "danger");
  }
};

document.getElementById("checkout-btn").addEventListener("click", async () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("Please log in to place an order.", "warning");
    return;
  }

  if (cart.length === 0) {
    showToast("Your cart is empty.", "info");
    return;
  }

  try {
    const response = await fetch("api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        products: cart.map(item => ({
          product: item._id, 
          quantity: item.quantity 
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const order = await response.json();
    showToast("Order placed successfully!", "success");
    localStorage.removeItem("cart");
    loadCart();
    loadOrders(); 

  } catch (error) {
    console.error("Error placing order:", error);
    showToast(`Error placing order: ${error.message}`, "danger");
  }
});

const loadOrders = async () => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const response = await fetch("/api/orders", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const orders = await response.json();
    const ordersList = document.getElementById("orders-list");

    ordersList.innerHTML = orders
      .map((order) => `
        <li class="list-group-item">
          Order ID: ${order._id} | Status: ${order.status} | Total Price: $${order.totalPrice.toFixed(2)}
          ${order.status.toLowerCase() === "pending" ? `<button class="btn btn-primary btn-sm" onclick="confirmOrder('${order._id}')">Confirm</button>` : ""}
        </li>
      `)
      .join("");

  } catch (error) {
    console.error("Error loading orders:", error);
    showToast("Error loading orders.", "danger");
  }
};

const confirmOrder = (orderId) => {
  localStorage.setItem("orderId", orderId);
  window.location.href = "payment.html";
};