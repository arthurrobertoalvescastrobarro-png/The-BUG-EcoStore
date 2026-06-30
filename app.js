// =======================
// Estado
// =======================

const CART_KEY = "ecostore_cart";

let cart = loadCart();
let currentCategory = "Todos";
let currentProductId = null;

// =======================
// Init
// =======================

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryFilters();
  renderProducts();
  updateCartBadge();
});

// =======================
// Navegação
// =======================

function showScreen(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function showHome() {
  showScreen("home");
}

function showProduct(id) {
  currentProductId = id;
  renderProductDetails(id);
  showScreen("product");
}

function showCart() {
  renderCart();
  showScreen("cart");
}

function showCheckout() {
  if (cart.length === 0) return alert("Carrinho vazio");
  renderCheckoutSummary();
  showScreen("checkout");
}

function showCheckoutSuccess() {
  showScreen("checkout-success");
}

// =======================
// Util
// =======================

function formatPrice(v) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// =======================
// Categorias
// =======================

function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  container.innerHTML = CATEGORIES.map(category => {
    const activeClass = category === currentCategory
      ? 'bg-leaf-600 text-white shadow-md'
      : 'bg-white text-leaf-800 hover:bg-leaf-100';
    return `<button onclick="filterCategory('${category}')" class="${activeClass} px-5 py-2 rounded-full font-medium transition-all border border-leaf-200">${category}</button>`;
  }).join('');
}

function filterCategory(c) {
  currentCategory = c;
  renderCategoryFilters();
  renderProducts();
}

// =======================
// Produtos
// =======================

function renderProducts() {
  const grid = document.getElementById("product-grid");

  const list =
    currentCategory === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === currentCategory);

  grid.innerHTML = list.map(p => `
    <div class="bg-white rounded-xl shadow cursor-pointer"
      onclick="showProduct(${p.id})">

      <div class="flex items-center justify-center h-40
            bg-green-500/15
            hover:bg-green-500/25
            transition-all duration-300
            rounded-t-xl">
    <span class="text-6xl">${p.emoji}</span>
</div>

      <div class="p-4">
        <p class="text-sm text-green-700">${p.category}</p>
        <h3 class="font-bold">${p.name}</h3>
        <p class="text-lg font-bold text-green-700">
          ${formatPrice(p.price)}
        </p>

        <button
          onclick="event.stopPropagation(); showProduct(${p.id})"
          class="w-full mt-2 bg-green-100 rounded">
          Ver
        </button>
      </div>

    </div>
  `).join("");
}

// =======================
// Produto detalhe
// =======================

function renderProductDetails(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  document.getElementById("product-emoji").textContent = p.emoji;
  document.getElementById("product-category").textContent = p.category;
  document.getElementById("product-name").textContent = p.name;
  document.getElementById("product-description").textContent = p.description;
  document.getElementById("product-price").textContent = formatPrice(p.price);
  document.getElementById("product-quantity").value = 1;
}

function increaseProductQuantity() {
  const input = document.getElementById("product-quantity");
  const p = PRODUCTS.find(x => x.id === currentProductId);

  if (Number(input.value) < p.stock) input.value++;
}

function decreaseProductQuantity() {
  const input = document.getElementById("product-quantity");
  if (Number(input.value) > 1) input.value--;
}

// =======================
// Carrinho
// =======================

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const qty = Number(
    document.getElementById("product-quantity")?.value || 1
  );

  const item = cart.find(x => x.id === id);

  if (item) {
    if (item.quantity + qty > p.stock) {
      return alert("Estoque insuficiente");
    }
    item.quantity += qty;
  } else {
    cart.push({ ...p, quantity: qty });
  }

  saveCart();
  updateCartBadge();
  showHome();
}

function addToCartFromProduct() {
  if (currentProductId) addToCart(currentProductId);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartBadge();
}

function changeCartQuantity(id, d) {
  const item = cart.find(i => i.id === id);
  const p = PRODUCTS.find(x => x.id === id);
  if (!item) return;

  if (d > 0 && item.quantity >= p.stock) return alert("Limite estoque");

  item.quantity += d;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function calculateTotal() {
  return cart.reduce((t, i) => t + i.price * i.quantity, 0);
}

function renderCart() {
  const el = document.getElementById("cart-items");

  if (cart.length === 0) {
    el.innerHTML = `
      <p class="text-center">Carrinho vazio</p>
    `;
    document.getElementById("cart-total").textContent = formatPrice(0);
    return;
  }

  el.innerHTML = cart.map(i => `
    <div class="flex justify-between border-b py-2">

      <div>
        <p class="font-bold">${i.name}</p>
        <p>${i.quantity}x ${formatPrice(i.price)}</p>
      </div>

      <div>
        ${formatPrice(i.price * i.quantity)}
      </div>

      <button onclick="removeFromCart(${i.id})">
        X
      </button>

    </div>
  `).join("");

  document.getElementById("cart-total").textContent =
    formatPrice(calculateTotal());
}

// =======================
// Checkout
// =======================

function renderCheckoutSummary() {
  document.getElementById("checkout-summary").innerHTML =
    cart.map(i => `
      <p>${i.name} - ${i.quantity}x</p>
    `).join("");

  document.getElementById("checkout-total").textContent =
    formatPrice(calculateTotal());
}

function confirmOrder(e) {
  e.preventDefault();

  cart = [];
  saveCart();
  updateCartBadge();

  showCheckoutSuccess();
}

// =======================
// Storage
// =======================

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// =======================
// Badge
// =======================

function updateCartBadge() {
  const total = cart.reduce((t, i) => t + i.quantity, 0);

  document.getElementById("cart-count").textContent = total;
}