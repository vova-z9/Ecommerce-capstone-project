import './scss/main.scss'; 

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string; 
  blocks: string[];
  salesStatus: boolean; 
  
  // (За бажанням) Можна відразу додати й інші поля з твого JSON на майбутнє:
  category?: string;
  color?: string;
  size?: string;
  rating?: number;
  popularity?: number;
}

async function fetchProducts() {
  try {
    const response = await fetch('/src/assets/data.json'); 
    const rawData = await response.json();
    
    // Перевіряємо структуру, щоб не було помилок
    if (!rawData[0] || !rawData[0].data) return;
    
    const allProducts: Product[] = rawData[0].data;

    // 1. Малюємо Selected Products
    const selected = allProducts.filter(p => p.blocks.includes("Selected Products"));
    renderProducts(selected, 'product-grid', 'Add To Cart');

    // 2. Малюємо New Arrivals (тільки один раз!)
    const arrivals = allProducts.filter(p => p.blocks.includes("New Products Arrival"));
    renderProducts(arrivals, 'new-arrivals-grid', 'View Product');

    // 3. Малюємо КАТАЛОГ
    if (document.getElementById('catalog-grid')) {
      renderProducts(allProducts, 'catalog-grid', 'Add To Cart');
    }

  } catch (error) {
    console.error("Помилка завантаження:", error);
  }
}

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

fetchProducts();