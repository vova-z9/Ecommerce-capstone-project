import './scss/main.scss'; 
import { initLoginModal } from './ts/modal';
import { initContactForm } from './ts/contact';
import { initCart } from './ts/cart'; 

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
    const response = await fetch('/data.json'); 
    const rawData = await response.json();
    
    if (!rawData[0] || !rawData[0].data) return;
    
    const allProducts: Product[] = rawData[0].data;

    // 1. Рендеримо Selected Products (на головній)
    const selected = allProducts.filter(p => p.blocks.includes("Selected Products"));
    renderProducts(selected, 'product-grid', 'Add To Cart');

    // 2. Рендеримо New Products Arrival (на головній)
    const arrivals = allProducts.filter(p => p.blocks.includes("New Products Arrival"));
    renderProducts(arrivals, 'new-arrivals-grid', 'View Product');

    // 3. Рендеримо КАТАЛОГ
    const catalogContainer = document.getElementById('catalog-grid');
    if (catalogContainer) {
      renderProducts(allProducts, 'catalog-grid', 'Add To Cart');
    }

  } catch (error) {
    console.error("Помилка завантаження даних:", error);
  }
}

function renderProducts(products: Product[], containerId: string, buttonText: string = 'Add To Cart') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = products.map(product => {
    const saleBadge = product.salesStatus === true || product.salesStatus === "true" 
        ? `<span class="product-card__badge">SALE</span>` : '';
    
    // 🛑 ДОДАНО ЛОГІКУ ДЛЯ КНОПОК: щоб вони додавали товар або вели на сторінку
    const btnAction = buttonText === 'Add To Cart' 
        ? `onclick="addToCart('${product.id}', '${product.color || ''}', '${product.size || ''}')"` 
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
  `}).join('');
}

// 🛑 ДОДАНО ГЛОБАЛЬНУ ФУНКЦІЮ ДОДАВАННЯ: щоб вона працювала на головній сторінці
(window as any).addToCart = (id: string, color: string = '', size: string = '') => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => 
        item.id === id && item.color === color && item.size === size
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, color, size, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    const counter = document.querySelector('.header__cart-count');
    if (counter) {
        const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        counter.textContent = totalItems.toString();
    }
};

document.addEventListener('DOMContentLoaded', () => {
  initLoginModal();
  initContactForm(); 
  
  initCart(); // 🛑 ТЕПЕР КОШИК ТОЧНО ЗАПУСТИТЬСЯ
  
  fetchProducts();
});