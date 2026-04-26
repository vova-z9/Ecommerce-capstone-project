import './scss/main.scss'; 
import { initLoginModal } from './ts/modal'; // Імпортуємо логіку модалки
import { initContactForm } from './ts/contact';

// Інтерфейс для типізації продукту згідно з JSON
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string; 
  blocks: string[];
  salesStatus: boolean; 
  category?: string;
  color?: string;
  size?: string;
  rating?: number;
  popularity?: number;
}

/**
 * Завантаження даних з локального JSON та рендер блоків на головній
 */
async function fetchProducts() {
  try {
    const response = await fetch('/src/assets/data.json'); 
    const rawData = await response.json();
    
    // Перевірка структури: у твоєму файлі дані лежать в rawData[0].data
    if (!rawData[0] || !rawData[0].data) return;
    
    const allProducts: Product[] = rawData[0].data;

    // 1. Рендеримо Selected Products (на головній)
    const selected = allProducts.filter(p => p.blocks.includes("Selected Products"));
    renderProducts(selected, 'product-grid', 'Add To Cart');

    // 2. Рендеримо New Products Arrival (на головній)
    const arrivals = allProducts.filter(p => p.blocks.includes("New Products Arrival"));
    renderProducts(arrivals, 'new-arrivals-grid', 'View Product');

    // 3. Рендеримо КАТАЛОГ (якщо ми на сторінці каталогу)
    const catalogContainer = document.getElementById('catalog-grid');
    if (catalogContainer) {
      renderProducts(allProducts, 'catalog-grid', 'Add To Cart');
    }

  } catch (error) {
    console.error("Помилка завантаження даних:", error);
  }
}

/**
 * Універсальна функція для створення карток товарів
 */
function renderProducts(products: Product[], containerId: string, buttonText: string = 'Add To Cart') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = products.map(product => {
    const saleBadge = product.salesStatus ? `<span class="product-card__badge">SALE</span>` : '';

    return `
    <article class="product-card">
      <div class="product-card__image-wrapper">
        ${saleBadge}
        <img src="${product.imageUrl}" alt="${product.name}" class="product-card__image">
      </div>
      <div class="product-card__info">
        <h3 class="product-card__title">${product.name}</h3>
        <p class="product-card__price">$${product.price}</p>
        <button class="btn btn--primary">${buttonText}</button>
      </div>
    </article>
  `}).join('');
}

/**
 * Головна точка входу: чекаємо завантаження DOM і запускаємо всі модулі
 */
document.addEventListener('DOMContentLoaded', () => {
  // Ініціалізація модалки логіну
  initLoginModal();

  // ДОДАЙ ЦЕЙ РЯДОК, ЩОБ ЗАПУСТИТИ ФОРМУ:
  initContactForm(); 

  // Завантаження товарів з JSON
  fetchProducts();
});