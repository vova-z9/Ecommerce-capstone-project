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
    gallery?: string[]; 
    salesStatus?: boolean | string;
}

interface CartItem {
    id: string;
    color: string;
    size: string;
    quantity: number;
}

let currentProduct: Product | null = null;

async function initProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        window.location.href = 'catalog.html';
        return;
    }

    try {
        const response = await fetch('/data.json');
        const rawData = await response.json();
        const allProducts: Product[] = rawData[0]?.data || [];

        currentProduct = allProducts.find(p => p.id === productId) || null;

        if (currentProduct) {
            renderProductInfo(currentProduct);
            setupEventListeners();
            renderRelatedProducts(allProducts);
            syncCartCounter(); 
        } else {
            const mainContainer = document.querySelector('.product-page');
            if (mainContainer) mainContainer.innerHTML = "<div class='container'><h1>Product not found</h1></div>";
        }
    } catch (error) {
        console.error("Error loading product:", error);
    }
}

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
    if (desc) desc.textContent = p.description || "The new Urban Compact Travel Suitcase is a bold reimagining of travel essentials, designed to elevate every journey.";
    
    if (rating) {
        const stars = Math.floor(p.rating);
        rating.innerHTML = `<span class="stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span> (0 Reviews)`;
    }

    // Галерея
    if (thumbsContainer) {
        const imagesToRender = (p.gallery && p.gallery.length > 0) ? p.gallery : [p.imageUrl];
        thumbsContainer.innerHTML = imagesToRender.map((imgUrl, index) => `
            <img src="${imgUrl}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}">
        `).join('');
        setupGalleryClickHandlers();
    }

    // Опції (Size / Color)
    const sizeSelect = document.getElementById('option-size') as HTMLSelectElement;
    const colorSelect = document.getElementById('option-color') as HTMLSelectElement;

    // Якщо в JSON є дані - ставимо їх, якщо ні - дефолтні
    if (sizeSelect) sizeSelect.value = p.size || 'M';
    if (colorSelect) colorSelect.value = p.color || 'black';
}

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
    const qtyInput = document.getElementById('qty-input') as HTMLInputElement;

    // 1. Кількість (+/-)
    document.getElementById('qty-plus')?.addEventListener('click', () => {
        qtyInput.value = (parseInt(qtyInput.value) + 1).toString();
    });
    document.getElementById('qty-minus')?.addEventListener('click', () => {
        const val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = (val - 1).toString();
    });

    // 2. Таби
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = (btn as HTMLElement).dataset.tab;
            document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${target}`)?.classList.add('active');
        });
    });

    // 3. Відгуки (Review Form)
    const reviewForm = document.getElementById('review-form') as HTMLFormElement;
    reviewForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const successMsg = document.getElementById('review-success-msg');
        if (successMsg) {
            successMsg.textContent = "Thank you! Your review has been submitted.";
            successMsg.style.display = "block";
            reviewForm.reset();
            // Ховаємо через 3 секунди
            setTimeout(() => { successMsg.style.display = "none"; }, 3000);
        }
    });

    // 4. Оновлена логіка ADD TO CART
    document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
        if (!currentProduct) return;

        const sizeSelect = document.getElementById('option-size') as HTMLSelectElement;
        const colorSelect = document.getElementById('option-color') as HTMLSelectElement;
        
        const selectedSize = sizeSelect ? sizeSelect.value : 'M';
        const selectedColor = colorSelect ? colorSelect.value : 'black';
        const countToAdd = parseInt(qtyInput.value);

        let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

        const existingItem = cart.find(item => 
            item.id === currentProduct?.id && 
            item.color === selectedColor && 
            item.size === selectedSize
        );

        if (existingItem) {
            existingItem.quantity += countToAdd;
        } else {
            cart.push({
                id: currentProduct.id,
                color: selectedColor,
                size: selectedSize,
                quantity: countToAdd
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        syncCartCounter();
        alert('Product added to cart!');
    });
}

function renderRelatedProducts(all: Product[]) {
    const grid = document.getElementById('related-products-grid');
    if (!grid) return;

    const related = all
        .filter(p => p.id !== currentProduct?.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    grid.innerHTML = related.map(p => `
        <article class="product-card">
            ${(p.salesStatus === true || p.salesStatus === "true") ? '<span class="product-card__badge">SALE</span>' : ''}
            <div class="product-card__image-wrapper" onclick="location.href='product-details.html?id=${p.id}'">
                <img src="${p.imageUrl}" alt="${p.name}" class="product-card__image">
            </div>
            <div class="product-card__info">
                <h3 onclick="location.href='product-details.html?id=${p.id}'">${p.name}</h3>
                <p>$${p.price}</p>
                <button class="btn btn-add-cart" onclick="location.href='product-details.html?id=${p.id}'">View Details</button>
            </div>
        </article>
    `).join('');
}

function syncCartCounter() {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const counter = document.querySelector('.header__cart-count');
    if (counter) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        counter.textContent = totalItems.toString();
    }
}

document.addEventListener('DOMContentLoaded', initProductDetails);