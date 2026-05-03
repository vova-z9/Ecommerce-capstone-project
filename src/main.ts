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

    // 1. Рендер Selected Products & New Arrivals
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
      let filteredProducts = [...allProducts];
      const itemsPerPage = 12;
      let currentPage = 1;

      const renderCatalog = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filteredProducts.slice(start, end);

        renderProducts(paginatedItems, "catalog-grid", "Add To Cart");
        renderPagination(
          Math.ceil(filteredProducts.length / itemsPerPage),
          currentPage,
        );

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
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      };

      function renderPagination(totalPages: number, current: number) {
        const paginationContainer =
          document.getElementById("catalog-pagination");
        if (!paginationContainer) return;

        if (totalPages <= 1) {
          paginationContainer.innerHTML = "";
          return;
        }

        let buttonsHTML = "";

        if (current > 1) {
          buttonsHTML += `<button class="page-btn page-btn-nav" onclick="changeCatalogPage(${current - 1})"><i class="fa-solid fa-chevron-left"></i> PREV</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
          buttonsHTML += `<button class="page-btn ${i === current ? "active" : ""}" onclick="changeCatalogPage(${i})">${i}</button>`;
        }

        if (current < totalPages) {
          buttonsHTML += `<button class="page-btn page-btn-nav" onclick="changeCatalogPage(${current + 1})">NEXT <i class="fa-solid fa-chevron-right"></i></button>`;
        }

        paginationContainer.innerHTML = buttonsHTML;
      }

      const getCustomFilterValue = (filterType: string) => {
        const activeLi = document.querySelector(
          `.custom-dropdown[data-filter-type="${filterType}"] li.active`,
        );
        return activeLi ? activeLi.getAttribute("data-value") || "all" : "all";
      };

      const applyFilters = () => {
        const category = getCustomFilterValue("category");
        const color = getCustomFilterValue("color");
        const size = getCustomFilterValue("size");

        const sale =
          (document.getElementById("filter-sale") as HTMLInputElement)
            ?.checked || false;
        const sort =
          (document.getElementById("sort-select") as HTMLSelectElement)
            ?.value || "default";

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

        currentPage = 1;
        renderCatalog();
      };

      const dropdowns = document.querySelectorAll(".custom-dropdown");

      function handleOptionSelect(
        option: Element,
        options: NodeListOf<Element>,
        selectedText: Element | null,
      ) {
        options.forEach((opt) => opt.classList.remove("active"));
        option.classList.add("active");

        if (selectedText) {
          selectedText.textContent = option.textContent;
        }

        applyFilters();
      }

      function setupDropdown(dropdown: Element) {
        const selectedText = dropdown.querySelector(".selected-text");
        const options = dropdown.querySelectorAll(".custom-dropdown__list li");

        options.forEach((option) => {
          option.addEventListener("click", () =>
            handleOptionSelect(option, options, selectedText),
          );
        });
      }

      dropdowns.forEach(setupDropdown);

      document
        .getElementById("filter-sale")
        ?.addEventListener("change", applyFilters);
      document
        .getElementById("sort-select")
        ?.addEventListener("change", applyFilters);

      document
        .getElementById("reset-filters")
        ?.addEventListener("click", () => {
          dropdowns.forEach((dropdown) => {
            const options = dropdown.querySelectorAll(
              ".custom-dropdown__list li",
            );
            const selectedText = dropdown.querySelector(".selected-text");

            options.forEach((opt) => opt.classList.remove("active"));

            const defaultOption = dropdown.querySelector(
              '.custom-dropdown__list li[data-value="all"]',
            );
            if (defaultOption) {
              defaultOption.classList.add("active");
              if (selectedText)
                selectedText.textContent = defaultOption.textContent;
            }
          });

          if (document.getElementById("sort-select"))
            (
              document.getElementById("sort-select") as HTMLSelectElement
            ).value = "default";
          if (document.getElementById("filter-sale"))
            (
              document.getElementById("filter-sale") as HTMLInputElement
            ).checked = false;

          applyFilters();
        });

      // === Логіка кнопки HIDE/SHOW FILTERS ===
      const toggleBtn = document.getElementById("toggle-filters");
      const filtersWrapper = document.querySelector(".filters-wrapper");

      if (toggleBtn && filtersWrapper) {
        toggleBtn.addEventListener("click", () => {
          filtersWrapper.classList.toggle("hidden");
          if (filtersWrapper.classList.contains("hidden")) {
            toggleBtn.textContent = "SHOW FILTERS";
          } else {
            toggleBtn.textContent = "HIDE FILTERS";
          }
        });
      }

      renderCatalog();
    }

    // === ЛОГІКА ПОШУКУ (Search) ===
    const searchInput = document.getElementById(
      "search-input",
    ) as HTMLInputElement;
    const searchBtn = document.getElementById("search-btn");

    const handleSearch = () => {
      if (!searchInput) return;

      const query = searchInput.value.trim().toLowerCase();
      if (!query) return;
      const foundProduct = allProducts.find(
        (p) => p.name && p.name.toLowerCase().includes(query),
      );

      if (foundProduct) {
        window.location.href = `/src/html/product-details.html?id=${foundProduct.id}`;
      } else {
        alert("Product not found");
      }
    };

    if (searchBtn) {
      searchBtn.addEventListener("click", handleSearch);
    }

    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
      });
    }

    // 3. Рендер TOP BEST SETS
    const topSetsContainer = document.getElementById("sidebar-sets");
    if (topSetsContainer) {
      let candidateSets = allProducts.filter(
        (p) =>
          (p.blocks && p.blocks.includes("Top Best Sets")) ||
          (p.category && p.category.toLowerCase() === "luggage sets"),
      );

      if (candidateSets.length < 5) {
        const otherProducts = allProducts.filter(
          (p) => !candidateSets.includes(p),
        );
        candidateSets = [...candidateSets, ...otherProducts];
      }

      const shuffledSets = [...candidateSets].sort(() => 0.5 - Math.random());

      const itemsToShow = shuffledSets.slice(0, 5);

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
