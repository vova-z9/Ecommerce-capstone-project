import '../scss/main.scss';

// Інтерфейс продукту
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    color?: string;
    size?: string;
    rating: number;
    imageUrl: string;
    description?: string;
    gallery?: string[]; // Додаткові фото
    salesStatus?: boolean; // Додали для SALE-беджів
}

let currentProduct: Product | null = null;

async function initProductDetails() {
    // 1. Отримуємо ID з URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        window.location.href = 'catalog.html'; // Якщо ID немає, вертаємо в каталог
        return;
    }

    try {
        // 2. Завантажуємо дані
        const response = await fetch('/src/assets/data.json');
        const rawData = await response.json();
        const allProducts: Product[] = rawData[0]?.data || [];

        // 3. Шукаємо потрібний товар
        currentProduct = allProducts.find(p => p.id === productId) || null;

        if (currentProduct) {
            // 4. Заповнюємо сторінку
            renderProductInfo(currentProduct);
            setupEventListeners();
            renderRelatedProducts(allProducts);
            syncCartCounter(); // Синхронізація лічильника хедера
        } else {
            const mainContainer = document.querySelector('.product-page');
            if (mainContainer) mainContainer.innerHTML = "<div class='container'><h1>Product not found</h1></div>";
        }
    } catch (error) {
        console.error("Error loading product:", error);
    }
}

// Функція для заповнення сторінки даними
function renderProductInfo(p: Product) {
    const title = document.getElementById('product-title');
    const price = document.getElementById('product-price');
    const mainImage = document.getElementById('product-main-image') as HTMLImageElement;
    const desc = document.getElementById('product-description');
    const rating = document.getElementById('product-rating');
    const thumbsContainer = document.getElementById('product-thumbnails');

    if (title) title.textContent = p.name;
    if (price) price.textContent = `$${p.price}`;
    if (mainImage) mainImage.src = p.imageUrl;
    if (desc) desc.textContent = p.description || "The new Urban Compact Travel Suitcase is a bold reimagining of travel essentials, designed to elevate every journey. Made with at least 30% recycled materials, its lightweight yet impact-resistant shell combines eco-conscious innovation with rugged durability.";
    if (rating) rating.textContent = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

    // --- 🖼 ДИНАМІЧНА ГАЛЕРЕЯ (Виправлення галереї) ---
    if (thumbsContainer) {
        thumbsContainer.innerHTML = ''; // Очищаємо старі фото

        // Якщо в JSON є галерея — рендеримо її, якщо ні — тільки головне фото
        const imagesToRender = (p.gallery && p.gallery.length > 0) 
            ? p.gallery 
            : [p.imageUrl];

        thumbsContainer.innerHTML = imagesToRender.map((imgUrl, index) => `
            <img src="${imgUrl}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}">
        `).join('');
        
        // Обов'язково заново вішаємо слухачі кліків, бо ми створили нові елементи
        setupGalleryClickHandlers();
    }

    // Оновлення селектів (опцій)
    const sizeSelect = document.getElementById('option-size') as HTMLSelectElement;
    const colorSelect = document.getElementById('option-color') as HTMLSelectElement;
    const catSelect = document.getElementById('option-category') as HTMLSelectElement;

    if (sizeSelect) sizeSelect.innerHTML = `<option>${p.size || 'M'}</option>`;
    if (colorSelect) colorSelect.innerHTML = `<option>${p.color || 'Default'}</option>`;
    if (catSelect) catSelect.innerHTML = `<option>${p.category}</option>`;
}

// Слухачі кліків галереї
function setupGalleryClickHandlers() {
    const mainImg = document.getElementById('product-main-image') as HTMLImageElement;
    const thumbnails = document.querySelectorAll('.product-gallery__thumbnails img');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            if (mainImg && thumb instanceof HTMLImageElement) {
                mainImg.src = thumb.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            }
        });
    });
}

function setupEventListeners() {
    // Кількість (+/-)
    const qtyInput = document.getElementById('qty-input') as HTMLInputElement;
    document.getElementById('qty-plus')?.addEventListener('click', () => {
        qtyInput.value = (parseInt(qtyInput.value) + 1).toString();
    });
    document.getElementById('qty-minus')?.addEventListener('click', () => {
        const val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = (val - 1).toString();
    });

    // Таби (Details / Reviews / Shipping Policy)
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = (btn as HTMLElement).dataset.tab;
            document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${target}`)?.classList.add('active');
        });
    });

    // Add To Cart
    document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
        if (!currentProduct) return;
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = parseInt(qtyInput.value);
        // Додаємо товар count разів
        for(let i=0; i<count; i++) cart.push(currentProduct.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Оновлюємо лічильник у хедері
        const counter = document.querySelector('.header__cart-count');
        if (counter) counter.textContent = cart.length.toString();
        
        alert('Product added to cart!');
    });
}

function renderRelatedProducts(all: Product[]) {
    const grid = document.getElementById('related-products-grid');
    if (!grid) return;

    // Вибираємо 4 рандомні товари, крім поточного
    const related = all
        .filter(p => p.id !== currentProduct?.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    grid.innerHTML = related.map(p => `
        <article class="product-card">
            ${p.salesStatus === true ? '<span class="product-card__badge">SALE</span>' : ''}
            <div class="product-card__image-wrapper" onclick="location.href='product-details.html?id=${p.id}'">
                <img src="${p.imageUrl}" alt="${p.name}" class="product-card__image">
            </div>
            <div class="product-card__info">
                <h3>${p.name}</h3>
                <p>$${p.price}</p>
                <button class="btn btn-add-cart" onclick="location.href='product-details.html?id=${p.id}'">View Details</button>
            </div>
        </article>
    `).join('');
}

// Синхронізація лічильника хедера при старті
function syncCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const counter = document.querySelector('.header__cart-count');
    if (counter) counter.textContent = cart.length.toString();
}

document.addEventListener('DOMContentLoaded', initProductDetails);