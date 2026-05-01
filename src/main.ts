import "./scss/main.scss";
import { initLoginModal } from "./ts/modal";
import { initContactForm } from "./ts/contact";
import { initCart } from "./ts/cart";
import { initTabs } from "./ts/tabs";
import { initProductDetails } from "./ts/product";
import { initSlider } from "./ts/slider";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  blocks: string[];
  salesStatus: boolean | string;
  category?: string;
  color?: string;
  size?: string;
  rating?: number;
  popularity?: number;
}

async function fetchProducts() {
  try {
    const response = await fetch("/data.json");
    const rawData = await response.json();

    if (!rawData[0] || !rawData[0].data) return;

    const allProducts: Product[] = rawData[0].data;

    // 1. Рендеримо Selected Products & New Arrivals (Головна сторінка)
    const selected = allProducts.filter(
      (p) => p.blocks && p.blocks.includes("Selected Products"),
    );
    renderProducts(selected, "product-grid", "Add To Cart");

    const arrivals = allProducts.filter(
      (p) => p.blocks && p.blocks.includes("New Products Arrival"),
    );
    renderProducts(arrivals, "new-arrivals-grid", "View Product");

    // 2. КАТАЛОГ: ФІЛЬТРАЦІЯ ТА ПАГІНАЦІЯ
    const catalogContainer = document.getElementById("catalog-grid");
    if (catalogContainer) {
      let filteredProducts = [...allProducts]; // Масив, який будемо фільтрувати
      const itemsPerPage = 12;
      let currentPage = 1;

      // Головна функція відмальовки каталогу
      const renderCatalog = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filteredProducts.slice(start, end);

        renderProducts(paginatedItems, "catalog-grid", "Add To Cart");
        renderPagination(
          Math.ceil(filteredProducts.length / itemsPerPage),
          currentPage,
        );

        // Оновлюємо текст "Showing 1–12 of 16 results"
        const resultsCount = document.getElementById("results-count");
        if (resultsCount) {
          const shownStart = filteredProducts.length === 0 ? 0 : start + 1;
          const shownEnd = Math.min(end, filteredProducts.length);
          resultsCount.textContent = `Showing ${shownStart}–${shownEnd} of ${filteredProducts.length} results`;
        }
      };

      (window as any).changeCatalogPage = (page: number) => {
        currentPage = page;
        renderCatalog();
        const catalogSection = document.querySelector(".catalog-page");
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" }); // Запасний варіант
        }
      };

      function renderPagination(totalPages: number, current: number) {
        const paginationContainer =
          document.getElementById("catalog-pagination");
        if (!paginationContainer) return;

        // Якщо сторінка лише одна (або нуль), ховаємо пагінацію
        if (totalPages <= 1) {
          paginationContainer.innerHTML = "";
          return;
        }

        let buttonsHTML = "";

        // Додаємо кнопку Prev (показуємо, якщо ми не на першій сторінці)
        if (current > 1) {
          buttonsHTML += `<button class="page-btn" onclick="changeCatalogPage(${current - 1})" style="margin: 0 5px; padding: 5px 12px; cursor: pointer; border: 1px solid #ddd; background: #fff; color: #333;">Prev</button>`;
        }

        // Малюємо цифри сторінок
        for (let i = 1; i <= totalPages; i++) {
          buttonsHTML += `<button class="page-btn ${i === current ? "active" : ""}" onclick="changeCatalogPage(${i})" style="margin: 0 5px; padding: 5px 12px; cursor: pointer; border: 1px solid #ddd; background: ${i === current ? "#B92770" : "#fff"}; color: ${i === current ? "#fff" : "#333"};">${i}</button>`;
        }

        // Додаємо кнопку Next (показуємо, якщо ми не на останній сторінці)
        if (current < totalPages) {
          buttonsHTML += `<button class="page-btn" onclick="changeCatalogPage(${current + 1})" style="margin: 0 5px; padding: 5px 12px; cursor: pointer; border: 1px solid #ddd; background: #fff; color: #333;">Next</button>`;
        }

        paginationContainer.innerHTML = buttonsHTML;
      }

      // ЛОГІКА ФІЛЬТРІВ
      const applyFilters = () => {
        const category =
          (document.getElementById("filter-category") as HTMLSelectElement)
            ?.value || "all";
        const color =
          (document.getElementById("filter-color") as HTMLSelectElement)
            ?.value || "all";
        const size =
          (document.getElementById("filter-size") as HTMLSelectElement)
            ?.value || "all";
        const sale =
          (document.getElementById("filter-sale") as HTMLInputElement)
            ?.checked || false;
        const sort =
          (document.getElementById("sort-select") as HTMLSelectElement)
            ?.value || "default";

        // Фільтруємо масив
        filteredProducts = allProducts.filter((p) => {
          if (
            category !== "all" &&
            p.category?.toLowerCase() !== category.toLowerCase()
          )
            return false;
          if (color !== "all" && p.color?.toLowerCase() !== color.toLowerCase())
            return false;
          if (size !== "all" && p.size !== size) return false;
          if (sale && p.salesStatus !== true && p.salesStatus !== "true")
            return false;
          return true;
        });

        // Сортуємо масив
        if (sort === "price-low")
          filteredProducts.sort((a, b) => a.price - b.price);
        else if (sort === "price-high")
          filteredProducts.sort((a, b) => b.price - a.price);
        else if (sort === "popularity")
          filteredProducts.sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0),
          );
        else if (sort === "rating")
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        currentPage = 1; // Після фільтрації завжди скидаємо на 1-шу сторінку
        renderCatalog();
      };

      // Вішаємо події на селекти
      document
        .getElementById("filter-category")
        ?.addEventListener("change", applyFilters);
      document
        .getElementById("filter-color")
        ?.addEventListener("change", applyFilters);
      document
        .getElementById("filter-size")
        ?.addEventListener("change", applyFilters);
      document
        .getElementById("filter-sale")
        ?.addEventListener("change", applyFilters);
      document
        .getElementById("sort-select")
        ?.addEventListener("change", applyFilters);

      // Кнопка Reset Filters
      document
        .getElementById("reset-filters")
        ?.addEventListener("click", () => {
          if (document.getElementById("filter-category"))
            (
              document.getElementById("filter-category") as HTMLSelectElement
            ).value = "all";
          if (document.getElementById("filter-color"))
            (
              document.getElementById("filter-color") as HTMLSelectElement
            ).value = "all";
          if (document.getElementById("filter-size"))
            (
              document.getElementById("filter-size") as HTMLSelectElement
            ).value = "all";
          if (document.getElementById("sort-select"))
            (
              document.getElementById("sort-select") as HTMLSelectElement
            ).value = "default";
          if (document.getElementById("filter-sale"))
            (
              document.getElementById("filter-sale") as HTMLInputElement
            ).checked = false;

          applyFilters(); // Перемальовуємо заново
        });

      // Запуск при завантаженні
      renderCatalog();
    }

    // 3. Рендеримо TOP BEST SETS (Бокова колонка)
    const topSetsContainer = document.getElementById("sidebar-sets");
    if (topSetsContainer) {
      const topProducts = allProducts
        .filter((p) => p.blocks && p.blocks.includes("Top Best Sets"))
        .slice(0, 3);
      const itemsToShow =
        topProducts.length > 0 ? topProducts : allProducts.slice(0, 3);

      topSetsContainer.innerHTML = itemsToShow
        .map(
          (p) => `
        <div class="top-set-item" onclick="location.href='/src/html/product-details.html?id=${p.id}'" style="cursor:pointer; display:flex; gap:15px; margin-bottom:20px; align-items: center; transition: opacity 0.3s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
          <img src="${p.imageUrl}" alt="${p.name}" style="width:80px; height:80px; object-fit:cover; border-radius:4px; border: 1px solid #eee;">
          <div class="top-set-info">
            <h4 style="font-size:14px; margin:0 0 5px 0; font-weight:600; line-height:1.2; color: #333;">${p.name}</h4>
            <p style="margin:0; font-weight:bold; color:#B92770;">$${p.price}</p>
          </div>
        </div>
      `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Помилка завантаження даних:", error);
  }
}

function renderProducts(
  products: Product[],
  containerId: string,
  buttonText: string = "Add To Cart",
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = products
    .map((product) => {
      const saleBadge =
        product.salesStatus === true || product.salesStatus === "true"
          ? `<span class="product-card__badge">SALE</span>`
          : "";

      const btnAction =
        buttonText === "Add To Cart"
          ? `onclick="addToCart('${product.id}', '${product.color || ""}', '${product.size || ""}')"`
          : `onclick="location.href='/src/html/product-details.html?id=${product.id}'"`;

      return `
    <article class="product-card">
      <div class="product-card__image-wrapper" onclick="location.href='/src/html/product-details.html?id=${product.id}'" style="cursor:pointer;">
        ${saleBadge}
        <img src="${product.imageUrl}" alt="${product.name}" class="product-card__image">
      </div>
      <div class="product-card__info">
        <h3 class="product-card__title" onclick="location.href='/src/html/product-details.html?id=${product.id}'" style="cursor:pointer;">${product.name}</h3>
        <p class="product-card__price">$${product.price}</p>
        <button class="btn btn--primary" ${btnAction}>${buttonText}</button>
      </div>
    </article>
  `;
    })
    .join("");
}

// Глобальна функція додавання в кошик
(window as any).addToCart = (
  id: string,
  color: string = "",
  size: string = "",
) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existingItem = cart.find(
    (item: any) => item.id === id && item.color === color && item.size === size,
  );

  if (existingItem) existingItem.quantity += 1;
  else cart.push({ id, color, size, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));

  const counter = document.querySelector(".header__cart-count");
  if (counter) {
    const totalItems = cart.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );
    counter.textContent = totalItems.toString();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initLoginModal();
  initContactForm();
  initCart();

  const isProductPage = document.querySelector(".product-page");
  if (isProductPage) {
    initProductDetails();
    initTabs();
  }

  fetchProducts();
  initSlider();
});

const burgerBtn = document.getElementById("burger-btn");
const mobileNav = document.querySelector(".header__nav");

if (burgerBtn && mobileNav) {
  burgerBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
    const icon = burgerBtn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-xmark");
    }
  });
}
