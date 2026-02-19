/**
 * app-modern.js
 * Bridges the existing data.js with the new modern UI designs.
 */
/* global products, categories, getCheapestPrice, getProductImageHTML, users */

// Sync application state with LocalStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let wishlistIds = JSON.parse(localStorage.getItem('wishlist')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Handle routing based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Global: Update User Avatar/Profile if logged in
    updateUserProfileUI();

    // Route based on page
    if (path.includes('wishlist.html')) {
        initWishlistPage();
    } else if (path.includes('categories.html')) {

        initCategoriesPage();
    } else if (path.includes('user-dashboard.html')) {
        initUserDashboardPage();
    } else if (path.includes('index.html') || path.endsWith('/')) { // Root or index
        const params = new URLSearchParams(window.location.search);
        if (params.has('logout')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
            return;
        }
        if (!params.has('view')) {
            // checkSession(); // Disabled auto-redirect to prevent "trapping" users
        }
    }
});

// --- Wishlist Page Logic ---
let loadedWishlistItems = []; // Store calculated products in memory for filtering

function initWishlistPage() {
    const grid = document.getElementById('wishlist-grid-container');
    if (!grid) return;

    let itemsToShowIDs = wishlistIds;
    if (itemsToShowIDs.length === 0) {
        // Fallback for demo: Use top 4 trending items + 4 most recently added products
        const trending = products.filter(p => p.trending).slice(0, 4).map(p => p.id);
        // Get products with large numeric IDs (likely added via admin) first
        const recent = [...products].sort((a, b) => b.id - a.id).slice(0, 4).map(p => p.id);
        itemsToShowIDs = [...new Set([...recent, ...trending])].slice(0, 8);
    }

    // Process items once to determine their status (Dropped, Target Met, Inactive)
    // We will attach metadata for consistent filtering.
    loadedWishlistItems = itemsToShowIDs.map(id => {
        const product = products.find(p => p.id == id);
        if (!product) return null;

        const cheapestPlatformKey = getCheapestPrice(product);
        const platformData = product.platforms[cheapestPlatformKey];
        if (!platformData) return null;

        // Simulate target price: 90% of current or based on ID for consistency
        // To make "Target Met" reflexive, let's say odd IDs have met target (for demo variety)
        // Or better: Use discount > 20% as "Price Dropped" and "Target Met" logic.

        const targetPrice = Math.floor(platformData.price * 0.9);
        const isInactive = !platformData.available; // Or check all platforms
        const isPriceDropped = platformData.discount > 0;
        const isTargetMet = platformData.price <= targetPrice || platformData.discount >= 20; // Simulated logic

        return {
            ...product,
            currentPrice: platformData.price,
            targetPrice: targetPrice,
            platformKey: cheapestPlatformKey,
            platformData: platformData,
            status: {
                inactive: isInactive,
                dropped: isPriceDropped,
                targetMet: isTargetMet
            }
        };
    }).filter(item => item !== null);

    // Initial Render: Show All
    renderProductCards(loadedWishlistItems, grid);

    // Update header stats and badges
    updateWishlistHeaderStats();

    // Setup Sort Listener
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.onclick = () => {
            const criteria = prompt("Sort by:\n1. Price (Low to High)\n2. Price (High to Low)\n3. Discount (High to Low)\n4. Name (A-Z)");
            sortWishlist(criteria);
        };
    }
}

function sortWishlist(criteria) {
    if (!criteria) return;

    let sortedItems = [...loadedWishlistItems];
    if (criteria === '1') {
        sortedItems.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (criteria === '2') {
        sortedItems.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (criteria === '3') {
        sortedItems.sort((a, b) => b.platformData.discount - a.platformData.discount);
    } else if (criteria === '4') {
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    }

    const grid = document.getElementById('wishlist-grid-container');
    renderProductCards(sortedItems, grid);
}

function updateWishlistHeaderStats() {
    // Calculate counts
    const total = loadedWishlistItems.length;
    const dropped = loadedWishlistItems.filter(i => i.status.dropped).length;
    const targetMet = loadedWishlistItems.filter(i => i.status.targetMet).length; // Overlap possible
    const inactive = loadedWishlistItems.filter(i => i.status.inactive).length;

    // Update Badges
    const badgeAll = document.getElementById('badge-all');
    if (badgeAll) badgeAll.textContent = total;

    const badgeDropped = document.getElementById('badge-dropped');
    if (badgeDropped) badgeDropped.textContent = dropped;

    const badgeTarget = document.getElementById('badge-target');
    if (badgeTarget) badgeTarget.textContent = targetMet;

    const badgeInactive = document.getElementById('badge-inactive');
    if (badgeInactive) badgeInactive.textContent = inactive; // If 0, maybe hide? user wants reflexive.

    // Update Subtitle
    const subtitle = document.getElementById('wishlist-subtitle');
    if (subtitle) {
        const merchants = new Set(loadedWishlistItems.map(i => i.platformKey));
        subtitle.textContent = `You are currently tracking ${total} items across ${merchants.size} unique merchants.`;
    }
}

function filterWishlist(type) {
    // Visual Tab Activation
    document.querySelectorAll('.content-tab').forEach(btn => btn.classList.remove('active'));

    // Map button ID to type
    let btnId = 'tab-all';
    if (type === 'dropped') btnId = 'tab-dropped';
    if (type === 'target') btnId = 'tab-target';
    if (type === 'inactive') btnId = 'tab-inactive';

    const activeBtn = document.getElementById(btnId);
    if (activeBtn) activeBtn.classList.add('active');

    // Filter Logic
    const grid = document.getElementById('wishlist-grid-container');
    let filteredItems = [];

    if (type === 'all') {
        filteredItems = loadedWishlistItems;
    } else if (type === 'dropped') {
        filteredItems = loadedWishlistItems.filter(i => i.status.dropped);
    } else if (type === 'target') {
        filteredItems = loadedWishlistItems.filter(i => i.status.targetMet);
    } else if (type === 'inactive') {
        filteredItems = loadedWishlistItems.filter(i => i.status.inactive);
    }

    renderProductCards(filteredItems, grid);
}


// Create HTML for product cards dynamically
function createProductCardHTML(item) {
    const platformData = item.platformData || (item.platforms.amazon?.available ? item.platforms.amazon : item.platforms.flipkart);
    const platformKey = item.platformKey || (item.platforms.amazon?.available ? 'amazon' : 'flipkart');

    // Safety check for platformData
    if (!platformData) return '';

    const target = item.targetPrice || Math.floor(platformData.price * 0.9);
    const initial = platformData.mrp || (platformData.price + 5000);

    let progress = 0;
    if (platformData.price <= target) {
        progress = 100;
    } else {
        progress = Math.round(((initial - platformData.price) / (initial - target)) * 100);
    }
    progress = Math.max(0, Math.min(100, progress));

    const badgeClass = platformKey;
    const badgeLabel = platformKey.toUpperCase();
    const isWishlisted = wishlistIds.includes(item.id);

    return `
        <div class="product-card ${item.status?.inactive ? 'inactive' : ''}" id="product-${item.id}">
            <div class="card-badge ${badgeClass}">${badgeLabel}</div>
            <div class="product-image" style="background:#fff;">
                ${getProductImageHTML(item.image)}
            </div>
            <div class="product-details">
                <div class="card-header">
                    <h3 class="product-name">${item.name}</h3>
                    <div class="more-options" onclick="handleMoreOptions(${item.id}, event)"><i class="fas fa-ellipsis-v"></i></div>
                </div>
                <div class="added-date">Best price across retailers • ${item.category}</div>
                
                <div class="price-section">
                    <span class="current-price">₹${platformData.price.toLocaleString()}</span>
                    <span class="original-price">₹${platformData.mrp?.toLocaleString() || ''}</span>
                </div>

                ${platformData.discount > 0 ? `
                <div class="discount-section" style="margin-top: 0.5rem;">
                    <span style="color: var(--accent-green); font-weight: 600; font-size: 0.95rem;">
                        <i class="fas fa-tag"></i> ${platformData.discount}% Discount
                    </span>
                </div>` : ''}
                
                <div class="card-actions">
                    <button class="view-btn" style="width: 100%;" onclick="showPlatformPicker(${item.id})">Compare Prices</button>
                </div>
            </div>
        </div>
    `;
}

function renderProductCards(items, container) {
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<div style="text-align:center;width:100%;grid-column:1/-1;padding:5rem;color:var(--text-gray);"><i class="fas fa-search" style="font-size:3rem;margin-bottom:1rem;opacity:0.2;"></i><p>No items match your selection.</p></div>';
        return;
    }

    items.forEach(item => {
        container.innerHTML += createProductCardHTML(item);
    });
}

// --- Deal Bucket Logic ---
function initDealBucketPage() {
    const dealList = document.getElementById('deals-list-container');
    const summaryContainer = document.querySelector('.deals-summary .savings-card'); // We might update this dynamically too

    if (!dealList) return;

    // Logic: Find products with highest discounts (> 15%) and sort by ID (newest first)
    const highDiscountProducts = products
        .filter(p => {
            const cheapest = getCheapestPrice(p);
            return cheapest && p.platforms[cheapest] && p.platforms[cheapest].discount >= 10; // Lowered threshold to see more
        })
        .sort((a, b) => b.id - a.id);

    renderDeals(highDiscountProducts.slice(0, 6), dealList);
    updateSavingsSummary(highDiscountProducts.slice(0, 6));

    const statusText = document.getElementById('deal-status-text');
    if (statusText) {
        statusText.textContent = `You have ${highDiscountProducts.length} items at their lowest tracked price.`;
    }
}

function renderDeals(dealProducts, container) {
    container.innerHTML = '';

    dealProducts.forEach(product => {
        const cheapestPlat = getCheapestPrice(product);
        const data = product.platforms[cheapestPlat];
        const originalPrice = data.mrp || Math.round(data.price / (1 - (data.discount / 100)));
        const savings = originalPrice - data.price;
        const timeAgo = ['2h ago', '5h ago', 'Yesterday', '3h ago'][Math.floor(Math.random() * 4)];

        const dealHTML = `
            <div class="deal-item">
                <div class="deal-image">
                    <span class="deal-tag">LOWEST PRICE</span>
                    ${product.image.includes('data:image') ? `<img src="${product.image}" style="width:100%;height:100%;object-fit:contain;">` : `<div style="font-size:3rem;">${product.image}</div>`}
                </div>
                <div class="deal-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #10b981; font-weight: 700; font-size: 0.8rem; margin-bottom: 0.3rem;">-${data.discount}% PRICE DROP</span>
                        <span class="timestamp" style="font-size: 0.75rem; color: var(--text-gray);">${timeAgo}</span>
                    </div>
                    <h3 class="deal-title" style="margin: 0; font-size: 1.25rem;">${product.name}</h3>
                    <p class="deal-meta" style="margin-bottom: 1rem; color: var(--text-gray); font-size: 0.85rem;">${cheapestPlat.charAt(0).toUpperCase() + cheapestPlat.slice(1)} • ${product.category.toUpperCase()} • Lowest in 60 days</p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <div class="price-row" style="margin: 0; display: flex; align-items: baseline; gap: 0.5rem;">
                                <span style="font-size: 1.8rem; font-weight: 800; color: white;">₹${data.price.toLocaleString()}</span>
                                <span style="text-decoration: line-through; color: var(--text-gray); font-size: 1rem;">₹${originalPrice.toLocaleString()}</span>
                            </div>
                            <div class="saved-amount" style="color: #10b981; font-weight: 600; font-size: 0.9rem;">You save ₹${savings.toLocaleString()}</div>
                        </div>
                        <button class="view-btn" style="padding: 0.8rem 1.5rem;" onclick="showPlatformPicker(${product.id})">Go to Retailer <i class="fas fa-external-link-alt" style="margin-left:0.5rem; font-size:0.8rem;"></i></button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += dealHTML;
    });
}

function updateSavingsSummary(dealProducts) {
    let totalSavings = 0;
    let totalPrice = 0;
    let totalOriginal = 0;
    let totalItems = dealProducts.length;

    dealProducts.forEach(p => {
        const cheapest = getCheapestPrice(p);
        const data = p.platforms[cheapest];
        const original = data.mrp || Math.round(data.price / (1 - (data.discount / 100)));
        totalOriginal += original;
        totalSavings += (original - data.price);
        totalPrice += data.price;
    });

    const taxes = Math.round(totalPrice * 0.05); // Simulated estimated taxes 5%

    const countEl = document.getElementById('summary-count');
    const originalEl = document.getElementById('summary-total-original');
    const savingsEl = document.getElementById('summary-savings');
    const totalEl = document.getElementById('summary-total');

    if (countEl) countEl.innerText = `${totalItems} items`;
    if (originalEl) originalEl.innerText = `₹${totalOriginal.toLocaleString()}`;
    if (savingsEl) savingsEl.innerText = `-₹${totalSavings.toLocaleString()}`;
    if (totalEl) totalEl.innerText = `₹${(totalPrice + taxes).toLocaleString()}`;
}




// --- Categories Logic ---
// (Old implementation removed)


function updateCategoryBadge(categoryTitle, count) {
    // Find h3 with text, then find the badge in that card
    const titles = document.querySelectorAll('.category-title');
    titles.forEach(h3 => {
        if (h3.textContent.trim().includes(categoryTitle)) {
            const card = h3.closest('.category-card');
            const badge = card.querySelector('.category-badge');
            // Update badge text to include real count if we want
            // badge.textContent = `${count} ITEMS`; 

            const footerStat = card.querySelector('.stat-text');
            if (footerStat) footerStat.textContent = `${count} ITEMS AVAILABLE`;
        }
    });
}


// --- Helper: Login --
function handleLoginModern(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    } else {
        alert("Invalid credentials. Please check your username and password.");
    }
}

function checkSession() {
    if (currentUser) {
        // Only auto-redirect if on the landing page/root and not explicitly trying to view the store
        if (currentUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }
}

function showPlatformPicker(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    createPlatformPickerUI();
    const overlay = document.getElementById('platform-picker-overlay');
    const optionsContainer = document.getElementById('platform-options-list');

    optionsContainer.innerHTML = '';

    // Always show Amazon and Flipkart for comparison
    const targetPlatforms = ['amazon', 'flipkart'];

    targetPlatforms.forEach(plat => {
        const platData = product.platforms[plat];
        const isAvail = platData && platData.available;

        const option = document.createElement('div');
        option.className = `platform-option ${plat} ${!isAvail ? 'opt-disabled' : ''}`;

        // Detailed info according to the request
        const priceDisplay = isAvail ? `₹${platData.price.toLocaleString()}` : 'OUT OF STOCK';
        const ratingStars = isAvail ? `<div style="color:#fbbf24; font-size:0.9rem; margin:0.3rem 0;">${'★'.repeat(Math.round(platData.rating))}${'☆'.repeat(5 - Math.round(platData.rating))}</div>` : '';
        const deliveryInfo = isAvail ? `<div style="font-size:0.75rem; color:#10b981; font-weight:600;"><i class="fas fa-truck"></i> ${platData.delivery}</div>` : '';
        const platDesc = (platData && platData.description) ? `<p style="font-size:0.7rem; color:var(--text-gray); line-height:1.3; margin:0.5rem 0;">${platData.description}</p>` : '';

        option.innerHTML = `
            <div class="plat-logo" style="margin-bottom:0.5rem;">${plat === 'amazon' ? '🛒' : '🛍️'}</div>
            <div class="plat-name" style="font-size:1.1rem; letter-spacing:2px;">${plat}</div>
            ${ratingStars}
            <div class="plat-price" style="font-size:1.6rem; margin:0.5rem 0;">${priceDisplay}</div>
            ${deliveryInfo}
            ${platDesc}
            <button class="plat-btn" ${!isAvail ? 'disabled' : ''}>${isAvail ? 'Select Store' : 'Unavailable'}</button>
        `;

        if (isAvail) {
            option.onclick = () => {
                const url = platData.url || (plat === 'amazon' ? 'https://amazon.in' : 'https://flipkart.com');
                window.open(url, '_blank');
                closePlatformPicker();
            };
        }

        optionsContainer.appendChild(option);
    });

    overlay.style.display = 'flex';
}

function createPlatformPickerUI() {
    if (document.getElementById('platform-picker-overlay')) return;

    const modalHTML = `
        <div id="platform-picker-overlay" class="platform-modal-overlay" onclick="handleOverlayClick(event)">
            <div class="platform-modal">
                <h2>Choose Shopping Platform</h2>
                <p>Compare prices and select your preferred retailer</p>
                <div id="platform-options-list" class="platform-options">
                    <!-- Dynamic Platforms -->
                </div>
                <button class="close-picker-btn" onclick="closePlatformPicker()">Maybe Later</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closePlatformPicker() {
    const overlay = document.getElementById('platform-picker-overlay');
    if (overlay) overlay.style.display = 'none';
}

function handleOverlayClick(e) {
    if (e.target.id === 'platform-picker-overlay') closePlatformPicker();
}

function toggleWishlist(productId) {
    const index = wishlistIds.indexOf(productId);
    if (index === -1) {
        wishlistIds.push(productId);
        alert("Added to wishlist!");
    } else {
        wishlistIds.splice(index, 1);
        alert("Removed from wishlist!");
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlistIds));

    // Refresh UI logic
    if (window.location.pathname.includes('wishlist.html')) {
        initWishlistPage();
    } else {
        // Update all instances of hearts for this product on current page
        const hearts = document.querySelectorAll(`[onclick="toggleWishlist(${productId})"]`);
        hearts.forEach(btn => {
            const icon = btn.querySelector('i');
            const active = wishlistIds.includes(productId);
            btn.style.color = active ? '#ef4444' : '#6b7280';
            if (icon) icon.className = active ? 'fas fa-heart' : 'far fa-heart';
        });
    }
}

function toggleCategoriesView(viewType) {
    const grid = document.getElementById('categories-grid');
    const productsGrid = document.getElementById('category-products-grid');
    const btnGrid = document.getElementById('btn-grid-view');
    const btnList = document.getElementById('btn-list-view');

    if (viewType === 'list') {
        grid?.classList.add('list-view');
        productsGrid?.classList.add('list-view');

        // Update Buttons
        if (btnList) {
            btnList.classList.add('active');
            btnList.style.background = 'var(--accent-blue)';
            btnList.style.color = 'white';
        }
        if (btnGrid) {
            btnGrid.classList.remove('active');
            btnGrid.style.background = 'transparent';
            btnGrid.style.color = 'var(--text-gray)';
        }
    } else {
        grid?.classList.remove('list-view');
        productsGrid?.classList.remove('list-view');

        // Update Buttons
        if (btnGrid) {
            btnGrid.classList.add('active');
            btnGrid.style.background = 'var(--accent-blue)';
            btnGrid.style.color = 'white';
        }
        if (btnList) {
            btnList.classList.remove('active');
            btnList.style.background = 'transparent';
            btnList.style.color = 'var(--text-gray)';
        }
    }
}

function initCategoriesPage() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    // View Toggle Logic
    const btnGrid = document.getElementById('btn-grid-view');
    const btnList = document.getElementById('btn-list-view');

    if (btnGrid && btnList) {
        btnGrid.onclick = () => toggleCategoriesView('grid');
        btnList.onclick = () => toggleCategoriesView('list');
    }

    grid.innerHTML = '';

    // Add "All Categories" card with a beautiful background image
    const allCard = document.createElement('div');
    allCard.className = 'category-card all-categories-card';
    allCard.innerHTML = `
        <div class="category-image">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" alt="All Categories">
            <div class="category-badge">${products.length} PRODUCTS</div>
        </div>
        <div class="category-content">
            <h3 class="category-title">Full Collection</h3>
            <p class="category-desc">Discover everything we track in one place. Intelligent search across all categories.</p>
            <div class="category-footer">
                <span class="stat-text">Full Catalog</span>
                <a href="javascript:void(0)" class="explore-link" onclick="filterByCategory('all', 'All Categories')">Explore All <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    `;
    grid.appendChild(allCard);

    categories.forEach(cat => {
        const count = products.filter(p => p.category === cat.id).length;
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-image">
                <img src="${cat.image}" alt="${cat.name}">
                <div class="category-badge">${cat.deals}</div>
            </div>
            <div class="category-content">
                <h3 class="category-title">${cat.name}</h3>
                <p class="category-desc">${cat.desc}</p>
                <div class="category-footer">
                    <a href="javascript:void(0)" class="explore-link" onclick="filterByCategory('${cat.id}', '${cat.name}')">Explore <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // If user came from home/dashboard by clicking a category (e.g. Groceries), show only that category's products
    const selectedCategoryId = localStorage.getItem('selectedCategory');
    if (selectedCategoryId && typeof categories !== 'undefined') {
        const cat = categories.find(c => c.id === selectedCategoryId);
        if (cat) {
            localStorage.removeItem('selectedCategory');
            filterByCategory(selectedCategoryId, cat.name);
        }
    }
}

function filterByCategory(catId, catName) {
    const categoriesGrid = document.getElementById('categories-grid');
    const productsSection = document.getElementById('category-products-section');
    const productsGrid = document.getElementById('category-products-grid');
    const title = document.getElementById('selected-category-title');

    if (!categoriesGrid || !productsSection || !productsGrid) return;

    title.textContent = `${catName} Deals`;
    productsGrid.innerHTML = '';

    let filteredProducts = [];
    if (catId === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(p => p.category === catId);
    }

    // Preparation logic similar to renderProductCards
    const catProducts = filteredProducts.map(product => {
        const amazonData = product.platforms.amazon;
        const flipkartData = product.platforms.flipkart;

        let cheapest = 'amazon';
        if (amazonData && flipkartData) {
            cheapest = amazonData.price <= flipkartData.price ? 'amazon' : 'flipkart';
        } else if (flipkartData) {
            cheapest = 'flipkart';
        }

        return {
            ...product,
            platformKey: cheapest,
            platformData: product.platforms[cheapest],
            currentPrice: product.platforms[cheapest].price,
            status: {
                inactive: !product.platforms.amazon?.available && !product.platforms.flipkart?.available
            }
        };
    });

    if (catProducts.length === 0) {
        productsGrid.innerHTML = '<div style="text-align:center; width:100%; padding: 5rem; color:var(--text-gray);">No deals found in this category yet.</div>';
    } else {
        catProducts.forEach(item => {
            productsGrid.innerHTML += createProductCardHTML(item);
        });
    }

    categoriesGrid.style.display = 'none';
    productsSection.style.display = 'block';
}

function hideCategoryProducts() {
    document.getElementById('categories-grid').style.display = 'grid';
    document.getElementById('category-products-section').style.display = 'none';
}

function initUserDashboardPage() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const sidebarNameEl = document.getElementById('sidebarUserName');
    const sidebarEmailEl = document.getElementById('sidebarUserEmail');

    // Use specific user details for the panel
    if (nameEl) nameEl.textContent = "Welcome back, Smart User!";
    if (emailEl) emailEl.textContent = "Verified Account ID: smart.user@monitor.com";

    if (sidebarNameEl) sidebarNameEl.textContent = "Smart User";
    if (sidebarEmailEl) {
        // Show login ID style email in sidebar
        sidebarEmailEl.textContent = "Voter ID: SMART-7921";
        sidebarEmailEl.style.fontSize = '0.75rem';
        sidebarEmailEl.style.opacity = '0.7';
    }

    // Update branding icons and add upload listener
    document.querySelectorAll('.brand-logo-container').forEach(container => {
        container.style.cursor = 'pointer';
        container.title = "Click to change logo";
        container.onclick = (e) => {
            e.preventDefault();
            uploadLogo();
        };
    });

    // Admin Panel removed from user dashboard area
    const adminLink = document.getElementById('adminLink');
    const adminCard = document.getElementById('adminControlCard');
    if (adminLink) adminLink.style.display = 'none';
    if (adminCard) adminCard.style.display = 'none';

    updateUserProfileUI();
}

function uploadLogo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const logoUrl = event.target.result;
                document.querySelectorAll('.brand-img').forEach(img => img.src = logoUrl);
                localStorage.setItem('siteLogo', logoUrl);
                alert("Site logo updated!");
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Convert uploaded images to base64
function uploadProfileImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                currentUser.profileImage = imageUrl;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUserProfileUI();
                alert("Profile image updated!");
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function updateUserProfileUI() {
    const avatarImg = document.querySelector('.user-avatar img');
    const avatarDiv = document.querySelector('.user-avatar');

    if (currentUser) {
        const src = currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`;

        if (avatarImg) {
            avatarImg.src = src;
        } else if (avatarDiv) {
            avatarDiv.innerHTML = `<img src="${src}" alt="Profile" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }

        // Admin Panel visibility removed for all users in user dashboard area
        document.querySelectorAll('#adminLink').forEach(link => link.style.display = 'none');
        document.querySelectorAll('#adminControlCard').forEach(card => card.style.display = 'none');
    }
}

function handleMoreOptions(productId, event) {
    event.stopPropagation();
    const product = products.find(p => p.id == productId);
    if (!product) return;

    const isWishlisted = wishlistIds.includes(productId);
    const action = prompt(`Options for ${product.name}:\n1. ${isWishlisted ? 'Remove from' : 'Add to'} Wishlist\n2. Share Product\n3. View Details\n\nEnter 1, 2, or 3:`);

    if (action === '1') {
        toggleWishlist(productId);
    } else if (action === '2') {
        alert(`Sharing ${product.name} link: https://smartprice.com/product/${productId}`);
    } else if (action === '3') {
        showPlatformPicker(productId);
    }
}
