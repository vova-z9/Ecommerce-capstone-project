import '../scss/main.scss';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    color?: string;
    size?: string;
    salesStatus?: boolean | string;
    popularity?: number;
    rating: number;
    imageUrl: string;
}

let allProducts: Product[] = [];
let filteredProducts: Product[] = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

async function initCatalog() {
    try {
        const response = await fetch('/src/assets/data.json');
        const rawData = await response.json();
        
        // Дістаємо масив товарів з твоєї структури [{ "data": [...] }]
        allProducts = rawData[0]?.data || [];
        filteredProducts = [...allProducts];
        
        renderCatalog();
        renderBestSets();
        setupListeners();
    } catch (error) { 
        console.error("Error loading data:", error); 
    }
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const items = filteredProducts.slice(start, start + ITEMS_PER_PAGE);

    if (items.length === 0) {
        grid.innerHTML = '<p class="no-products">Product not found</p>';
    } else {
        grid.innerHTML = items.map(p => `
            <article class="product-card">
                <div class="product-card__image-wrapper" onclick="location.href='/src/html/product-details.html?id=${p.id}'">
                    ${p.salesStatus === true || p.salesStatus === "true" ? '<span class="product-card__badge">SALE</span>' : ''}
                    <img src="${p.imageUrl}" alt="${p.name}" class="product-card__image">
                </div>
                <div class="product-card__info">
                    <h3 class="product-card__title" onclick="location.href='/src/html/product-details.html?id=${p.id}'">${p.name}</h3>
                    <p class="product-card__price">$${p.price}</p>
                    <button class="btn" onclick="addToCart('${p.id}')">Add To Cart</button>
                </div>
            </article>
        `).join('');
    }

    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const showingTo = Math.min(start + ITEMS_PER_PAGE, filteredProducts.length);
        const showingFrom = filteredProducts.length === 0 ? 0 : start + 1;
        resultsCount.textContent = `Showing ${showingFrom}–${showingTo} of ${filteredProducts.length} results`;
    }

    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('catalog-pagination');
    if (!container) return;

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    let html = '';

    if (totalPages > 1) {
        // 🛑 ДОДАНА КНОПКА PREV
        if (currentPage > 1) {
            html += `<button class="pagination__btn pagination__btn--prev" data-page="${currentPage - 1}">&lt; PREV</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination__btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (currentPage < totalPages) {
            html += `<button class="pagination__btn pagination__btn--next" data-page="${currentPage + 1}">NEXT &gt;</button>`;
        }
    }
    container.innerHTML = html;
}

function renderBestSets() {
    const container = document.getElementById('sidebar-sets');
    if (!container) return;

    // Показуємо 4 набори валіз у сайдбарі
    const sets = allProducts.filter(p => p.category === 'luggage sets').slice(0, 4);

    container.innerHTML = sets.map(p => `
        <div class="sidebar-mini-card" onclick="location.href='/src/html/product-details.html?id=${p.id}'">
            <img src="${p.imageUrl}" alt="${p.name}">
            <div class="sidebar-mini-card__info">
                <h4>${p.name}</h4>
                <div class="rating">${'★'.repeat(Math.floor(p.rating))}</div>
                <div class="price">$${p.price}</div>
            </div>
        </div>
    `).join('');
}

function setupListeners() {
    // 💡 ДОПОМІЖНА ФУНКЦІЯ: розбиває будь-який рядок на масив розмірів
    const getSizesArray = (sizeStr: string): string[] => {
        if (!sizeStr) return [];
        return sizeStr.split(/[,/-]/).map(s => s.trim().toUpperCase()).filter(s => s !== "");
    };

    const applyFilters = () => {
        const catElem = document.getElementById('filter-category') as HTMLSelectElement;
        const colorElem = document.getElementById('filter-color') as HTMLSelectElement;
        const sizeElem = document.getElementById('filter-size') as HTMLSelectElement;
        const saleElem = document.getElementById('filter-sale') as HTMLInputElement;
        const sortElem = document.getElementById('sort-select') as HTMLSelectElement;
        const searchElem = document.getElementById('search-input') as HTMLInputElement;

        const cat = catElem ? catElem.value : 'all';
        const color = colorElem ? colorElem.value : 'all';
        const size = sizeElem ? sizeElem.value : 'all';
        const saleOnly = saleElem ? saleElem.checked : false;
        const sort = sortElem ? sortElem.value : 'default';
        const query = searchElem ? searchElem.value.toLowerCase() : '';

        filteredProducts = allProducts.filter((p: Product) => {
            // 1. Категорія
            const itemCat = p.category ? p.category.toLowerCase().replace(/['\s]/g, "") : '';
            const selectedCat = cat.toLowerCase().replace(/['\s]/g, "");
            const matchCat = cat === 'all' || itemCat === selectedCat;

            // 2. Пошук
            const matchSearch = p.name ? p.name.toLowerCase().includes(query) : false;

            // 3. Колір
            const itemColor = p.color ? p.color.toLowerCase().trim() : '';
            const matchColor = color === 'all' || itemColor === color.toLowerCase().trim();

            // 4. Розмір
            const itemSizes = getSizesArray(p.size || "");
            const selectedSizes = getSizesArray(size); 
            const matchSize = size === 'all' || selectedSizes.some(s => itemSizes.includes(s));

            // 5. Статус розпродажу
            const matchSale = !saleOnly || p.salesStatus === true || p.salesStatus === "true";

            return matchCat && matchSearch && matchColor && matchSize && matchSale;
        });

        // СОРТУВАННЯ
        if (sort === 'price-low') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sort === 'popularity') {
            filteredProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); 
        } else if (sort === 'rating') {
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        currentPage = 1;
        renderCatalog();
    };

    // Слухачі подій
    document.getElementById('filter-category')?.addEventListener('change', applyFilters);
    document.getElementById('filter-color')?.addEventListener('change', applyFilters);
    document.getElementById('filter-size')?.addEventListener('change', applyFilters);
    document.getElementById('filter-sale')?.addEventListener('change', applyFilters);
    document.getElementById('sort-select')?.addEventListener('change', applyFilters);
    document.getElementById('search-btn')?.addEventListener('click', applyFilters);
    document.getElementById('search-input')?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });

    // Кнопка Reset
    document.getElementById('reset-filters')?.addEventListener('click', () => {
        const ids = ['filter-category', 'filter-color', 'filter-size', 'sort-select', 'search-input'];
        ids.forEach(id => {
            const el = document.getElementById(id) as HTMLSelectElement | HTMLInputElement;
            if (el) el.value = id === 'sort-select' ? 'default' : (id === 'search-input' ? '' : 'all');
        });
        const sale = document.getElementById('filter-sale') as HTMLInputElement;
        if (sale) sale.checked = false;
        
        applyFilters();
    });

    // Пагінація
    document.getElementById('catalog-pagination')?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('pagination__btn') && target.dataset.page) {
            currentPage = parseInt(target.dataset.page);
            renderCatalog();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

(window as any).addToCart = (id: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(id);
    localStorage.setItem('cart', JSON.stringify(cart));
    const counter = document.querySelector('.header__cart-count');
    if (counter) counter.textContent = cart.length.toString();
};

document.addEventListener('DOMContentLoaded', initCatalog);