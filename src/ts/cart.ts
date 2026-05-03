interface CartItemData {
  id: string;
  color: string;
  size: string;
  quantity: number;
}

export async function initCart() {
  const container = document.getElementById("cart-items-container");
  const emptyMessage = document.getElementById("cart-empty-message");
  const clearBtn = document.getElementById("clear-cart-btn");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!container) return;

  const cart: CartItemData[] = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    container.innerHTML = "";
    emptyMessage?.removeAttribute("hidden");
    calculateAndRenderTotals([], []);
    return;
  } else {
    emptyMessage?.setAttribute("hidden", "");
  }

  try {
    const response = await fetch("/data.json");
    const rawData = await response.json();
    const allProducts = rawData[0]?.data || [];

    renderCartItems(cart, allProducts, container);
    calculateAndRenderTotals(cart, allProducts);
  } catch (error) {
    console.error("Error loading cart data:", error);
  }

  // Подія для очищення кошика (Clear Cart)
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem("cart");
      initCart();
      updateHeaderCounter();
    });
  }

  // Подія для оформлення замовлення (Checkout)
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cart");
      initCart();
      updateHeaderCounter();
      alert("Thank you for your purchase.");
    });
  }
}

function renderCartItems(
  cart: CartItemData[],
  allProducts: any[],
  container: HTMLElement,
) {
  container.innerHTML = cart
    .map((cartItem, index) => {
      const product = allProducts.find((p) => p.id === cartItem.id);
      if (!product) return "";

      const itemTotal = product.price * cartItem.quantity;
      const variantInfo = [cartItem.color, cartItem.size]
        .filter(Boolean)
        .join(" / ");

      return `
            <div class="cart-item">
                <div class="cart-item__image">
                    <img src="${product.imageUrl}" alt="${product.name}">
                </div>
                <div class="cart-item__name">
                    ${product.name}
                    ${variantInfo ? `<br><small style="color: #777;">${variantInfo}</small>` : ""}
                </div>
                <div class="cart-item__price">$${product.price}</div>
                <div class="cart-item__quantity">
                    <button class="qty-btn minus" data-index="${index}">-</button>
                    <input type="text" value="${cartItem.quantity}" readonly>
                    <button class="qty-btn plus" data-index="${index}">+</button>
                </div>
                <div class="cart-item__total">$${itemTotal}</div>
                <button class="cart-item__delete" data-index="${index}">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;
    })
    .join("");

  setupCartListeners();
}

function calculateAndRenderTotals(cart: CartItemData[], allProducts: any[]) {
  const subtotalEl = document.getElementById("summary-subtotal");
  const totalEl = document.getElementById("summary-total");
  const discountRow = document.getElementById("discount-row");
  const discountEl = document.getElementById("summary-discount");

  let subtotal = 0;
  cart.forEach((cartItem) => {
    const product = allProducts.find((p) => p.id === cartItem.id);
    if (product) {
      subtotal += product.price * cartItem.quantity;
    }
  });

  const shipping = cart.length > 0 ? 30 : 0;
  let total = subtotal + shipping;
  let discount = 0;

  if (subtotal > 3000) {
    discount = subtotal * 0.1;
    total = subtotal - discount + shipping;
    discountRow?.removeAttribute("hidden");
    if (discountEl) discountEl.textContent = `-$${discount.toFixed(0)}`;
  } else {
    discountRow?.setAttribute("hidden", "");
  }

  if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(0)}`;
}

function setupCartListeners() {
  const container = document.getElementById("cart-items-container");
  if (!container) return;

  const newContainer = container.cloneNode(true);
  container.parentNode?.replaceChild(newContainer, container);

  newContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest("button");
    if (!btn) return;

    const index = parseInt(btn.getAttribute("data-index") || "-1");
    if (index === -1) return;

    let cart: CartItemData[] = JSON.parse(localStorage.getItem("cart") || "[]");

    if (btn.classList.contains("plus")) {
      cart[index].quantity += 1;
    } else if (btn.classList.contains("minus")) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      }
    } else if (btn.closest(".cart-item__delete")) {
      cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateHeaderCounter();
    initCart();
  });
}

function updateHeaderCounter() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const counter = document.querySelector(".header__cart-count") as HTMLElement;

  if (counter) {
    const totalItems = cart.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );
    counter.textContent = totalItems.toString();

    if (totalItems === 0) {
      counter.style.display = "none";
    } else {
      counter.style.display = "flex";
    }
  }
}
