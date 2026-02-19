// Comparison Page JavaScript
/* global products, categories, platforms, getCheapestPrice, getBestDeal, getProductImageHTML, searchSuggestions */

// Filter state tracker
let filteredProducts = [];
let currentFilters = {
    category: '',
    platform: '',
    priceRange: '',
    sort: 'relevance',
    search: ''
};

// Initialize comparison page
document.addEventListener('DOMContentLoaded', function () {
    initializeComparison();
    setupComparisonEventListeners();
    loadProducts();
});

// Parse initial state from URL or storage
function initializeComparison() {
    // Check for search query or selected category
    const searchQuery = localStorage.getItem('searchQuery');
    const selectedCategory = localStorage.getItem('selectedCategory');
    const selectedProduct = localStorage.getItem('selectedProduct');
    const priceRange = localStorage.getItem('priceRange');
    const selectedSort = localStorage.getItem('selectedSort');

    if (searchQuery) {
        const searchInputEl = document.getElementById('searchInput');
        if (searchInputEl) searchInputEl.value = searchQuery;
        const pageTitleEl = document.getElementById('pageTitle');
        if (pageTitleEl) pageTitleEl.textContent = `Search Results for "${searchQuery}"`;
        currentFilters.search = searchQuery;
        // Keep it in localStorage for initial load if needed, but we used it now
    } else if (selectedCategory) {
        currentFilters.category = selectedCategory;
        // Check the radio button
        const radio = document.querySelector(`input[name="category"][value="${selectedCategory}"]`);
        if (radio) radio.checked = true;

        const categoryName = categories.find(c => c.id === selectedCategory)?.name || selectedCategory;
        const pageTitleEl = document.getElementById('pageTitle');
        if (pageTitleEl) pageTitleEl.textContent = `${categoryName} Products`;
        localStorage.removeItem('selectedCategory');
    } else if (selectedProduct) {
        const product = products.find(p => p.id === parseInt(selectedProduct));
        if (product) {
            showProductModal(product);
        }
        localStorage.removeItem('selectedProduct');
    }

    // Apply filters from localStorage
    if (priceRange) {
        currentFilters.priceRange = priceRange;
        const radio = document.querySelector(`input[name="price"][value="${priceRange}"]`);
        if (radio) radio.checked = true;
        localStorage.removeItem('priceRange');
    }

    if (selectedSort) {
        currentFilters.sort = selectedSort;
        const sortFilterEl = document.getElementById('sortFilter');
        if (sortFilterEl) sortFilterEl.value = selectedSort;
        localStorage.removeItem('selectedSort');
    }

    // updateCartCount(); // If this function exists globally
}

function setupComparisonEventListeners() {
    // Filter controls - Radio Buttons
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            loadProducts();
        });
    });

    document.querySelectorAll('input[name="price"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.priceRange = e.target.value;
            loadProducts();
        });
    });

    document.querySelectorAll('input[name="platform"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.platform = e.target.value;
            loadProducts();
        });
    });

    // Sort Filter
    const sortFilterEl = document.getElementById('sortFilter');
    if (sortFilterEl) {
        sortFilterEl.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            sortProducts();
            displayProducts();
        });
    }

    // View Toggles
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    const productsGrid = document.getElementById('productsGrid');

    if (gridBtn && listBtn && productsGrid) {
        gridBtn.addEventListener('click', () => {
            productsGrid.classList.remove('list-view');
            gridBtn.classList.add('active');
            gridBtn.style.background = 'var(--accent-blue)';
            gridBtn.style.borderColor = 'var(--accent-blue)';
            listBtn.classList.remove('active');
            listBtn.style.background = 'transparent';
            listBtn.style.borderColor = 'var(--border-color)';
        });

        listBtn.addEventListener('click', () => {
            productsGrid.classList.add('list-view');
            listBtn.classList.add('active');
            listBtn.style.background = 'var(--accent-blue)';
            listBtn.style.borderColor = 'var(--accent-blue)';
            gridBtn.classList.remove('active');
            gridBtn.style.background = 'transparent';
            gridBtn.style.borderColor = 'var(--border-color)';
        });
    }

    // Search functionality (searchInput may be missing if search bar removed from nav)
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', function () { });
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('blur', hideSearchSuggestions);
    }

    // Modal
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-picker-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function handleSearchInput(e) {
    const query = e.target.value.toLowerCase();
    if (query.length > 0) {
        showSearchSuggestions();
        filterSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
}

function showSearchSuggestions() {
    const suggestionsDiv = document.getElementById('searchSuggestions');
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'block';
        populateSuggestions();
    }
}

function hideSearchSuggestions() {
    setTimeout(() => {
        const suggestionsDiv = document.getElementById('searchSuggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
    }, 200);
}

function populateSuggestions() {
    const suggestionsDiv = document.getElementById('searchSuggestions');
    const searchInputEl = document.getElementById('searchInput');
    if (!suggestionsDiv || !searchInputEl) return;

    suggestionsDiv.innerHTML = '';

    (typeof searchSuggestions !== 'undefined' ? searchSuggestions : []).slice(0, 5).forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            searchInputEl.value = suggestion;
            handleSearch();
            hideSearchSuggestions();
        });
        suggestionsDiv.appendChild(item);
    });
}

function filterSuggestions(query) {
    const suggestionsDiv = document.getElementById('searchSuggestions');
    const searchInputEl = document.getElementById('searchInput');
    if (!suggestionsDiv || !searchInputEl || typeof searchSuggestions === 'undefined') return;

    suggestionsDiv.innerHTML = '';

    const filtered = searchSuggestions.filter(s =>
        s.toLowerCase().includes(query)
    ).slice(0, 5);

    filtered.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            searchInputEl.value = suggestion;
            handleSearch();
            hideSearchSuggestions();
        });
        suggestionsDiv.appendChild(item);
    });
}

function handleSearch() {
    const searchInputEl = document.getElementById('searchInput');
    const query = searchInputEl ? searchInputEl.value.trim() : (currentFilters.search || '');

    currentFilters.search = query;
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.textContent = query ? `Search Results for "${query}"` : 'All Products';
    }
    loadProducts();
}

function clearAllFilters() {
    currentFilters = {
        category: '',
        platform: '',
        priceRange: '',
        sort: 'relevance',
        search: ''
    };

    // Reset Radio Buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.value === "") radio.checked = true;
    });

    const sortFilterEl = document.getElementById('sortFilter');
    if (sortFilterEl) sortFilterEl.value = 'relevance';
    const searchInputEl = document.getElementById('searchInput');
    if (searchInputEl) searchInputEl.value = '';
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) pageTitleEl.textContent = 'All Products';

    // Clear stored search query
    localStorage.removeItem('searchQuery');

    loadProducts();
}

function loadProducts() {
    showLoading();

    // Ensure products data is available
    if ((typeof products === 'undefined' || !products || products.length === 0) && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('smartPriceProducts');
        if (stored) {
            try {
                // If products is global (var/window), this assignment works
                products = JSON.parse(stored);
            } catch (e) { console.error('Error parsing stored products', e); }
        } else if (typeof defaultProducts !== 'undefined') {
            products = defaultProducts;
        }
    }

    try {
        filteredProducts = filterProducts();
        sortProducts();

        // Immediate display
        displayProducts();
        updateResultsCount();
        hideLoading();
    } catch (error) {
        console.error("Error loading products:", error);
        hideLoading();
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = 'block';
            noResults.innerHTML = '<h3 style="color:white">Something went wrong</h3><p>Please refresh the page.</p>';
        }
    }
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');

    if (spinner) spinner.style.setProperty('display', 'block', 'important');
    if (grid) grid.style.display = 'none';
    if (noResults) noResults.style.display = 'none';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('productsGrid');

    if (spinner) spinner.style.setProperty('display', 'none', 'important');
    if (grid) grid.style.display = 'grid';
}

function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = `Found ${filteredProducts.length} items`;
    }
}

// Search refinement and ranking logic
function filterProducts() {
    let filtered = [...products];
    console.log('🔍 Filtering products. Total products:', products.length);
    console.log('Current filters:', currentFilters);

    // Search filter - Enhanced search algorithm
    if (currentFilters.search) {
        const query = currentFilters.search.toLowerCase().trim();
        const queryWords = query.split(/\s+/).filter(w => w.length >= 2);

        // RegEx for whole word matching
        const queryRegex = new RegExp(`\\b${query}\\b`, 'i');

        filtered = filtered.filter(product => {
            const pName = (product.name || '').toLowerCase();
            const pDesc = (product.description || '').toLowerCase();
            const pCat = (product.category || '').toLowerCase();
            const catObj = categories.find(c => c.id === pCat);
            const catName = catObj ? catObj.name.toLowerCase() : '';

            // 1. Whole word match in Name (Highest Priority)
            const nameMatch = queryRegex.test(pName);

            // 2. Category Intelligence - Match the exact category ID or whole word in Category Name
            const categoryMatch = pCat === query || (catName !== '' && new RegExp(`\\b${query}\\b`, 'i').test(catName));

            // 3. Word-based matching (High Priority)
            const wordMatch = queryWords.length > 0 && queryWords.every(word => new RegExp(`\\b${word}\\b`, 'i').test(pName));

            // 4. Intelligent Type Intelligence
            const typeMapping = {
                'laptop': ['laptop', 'macbook', 'notebook', 'ultrabook', 'chromebook', 'thinkpad', 'vivobook', 'inspiron', 'pavilion', 'desktop'],
                'mobile': ['phone', 'mobile', 'smartphone', 'iphone', 'galaxy', 'vivo', 'oppo', 'oneplus', 'pixel'],
                'phone': ['phone', 'mobile', 'smartphone', 'iphone', 'galaxy', 'vivo', 'oppo', 'oneplus', 'pixel'],
                'watch': ['watch', 'smartwatch', 'apple watch', 'fitbit', 'garmin'],
                'headphone': ['headphone', 'earphone', 'airpods', 'buds', 'headset', 'audio', 'sony', 'boat', 'jbl', 'speaker'],
                'speaker': ['speaker', 'audio', 'soundbar', 'boat', 'jbl'],
                'car': ['car', 'automotive', 'dash cam', 'vacuum', 'tyre', 'vehicle'],
                'shoe': ['shoe', 'sneaker', 'footwear', 'boot', 'nike', 'adidas', 'puma', 'skechers'],
                'beauty': ['makeup', 'cosmetic', 'skincare', 'face', 'lipstick', 'serum'],
                'home': ['furniture', 'kitchen', 'appliance', 'lamp', 'decor', 'table', 'chair']
            };

            let intelligentTypeMatch = false;
            let isBroadTypeSearch = false;

            for (const [type, keywords] of Object.entries(typeMapping)) {
                if (query === type || (query.length > 3 && query.includes(type))) {
                    isBroadTypeSearch = true;
                    // For broad type searches, check if product matches the specific keywords using word boundaries
                    if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(pName) || pCat === kw)) {
                        intelligentTypeMatch = true;
                        break;
                    }
                }
            }

            // 5. Description Match (Lowest Priority)
            // Use word boundary to avoid "car" matching "care" in descriptions
            const descriptionMatch = !isBroadTypeSearch && queryRegex.test(pDesc);

            return nameMatch || categoryMatch || wordMatch || intelligentTypeMatch || descriptionMatch;
        });
    }

    // Category filter
    if (currentFilters.category) {
        console.log('📁 Filtering by category:', currentFilters.category);
        filtered = filtered.filter(product => product.category === currentFilters.category);
        console.log('Products after category filter:', filtered.length);
    }

    // Platform filter
    if (currentFilters.platform) {
        filtered = filtered.filter(product =>
            product.platforms[currentFilters.platform] &&
            product.platforms[currentFilters.platform].available
        );
    }

    // Price range filter
    if (currentFilters.priceRange) {
        const rangeParts = currentFilters.priceRange.split('-');
        const min = parseInt(rangeParts[0]) || 0;
        const max = parseInt(rangeParts[1]) || Infinity;

        console.log('💰 Filtering by price range:', currentFilters.priceRange);
        console.log('Min:', min, 'Max:', max);

        filtered = filtered.filter(product => {
            const prices = Object.values(product.platforms)
                .filter(p => p && p.available && typeof p.price === 'number')
                .map(p => p.price);

            if (prices.length === 0) {
                console.log(`Product: ${product.name} - No available prices, excluding.`);
                return false;
            }

            const cheapestPrice = Math.min(...prices);
            console.log(`Product: ${product.name}, Cheapest Price: ${cheapestPrice}`);

            // For "Above ₹50,000" range, only check minimum
            if (max === 999999 || max > 900000) { // Assuming 999999 or a very large number indicates "above"
                const result = cheapestPrice >= min;
                console.log(`  Above range check: ${cheapestPrice} >= ${min} -> ${result}`);
                return result;
            }

            // For other ranges, check both min and max
            const result = cheapestPrice >= min && cheapestPrice <= max;
            console.log(`  Range check: ${cheapestPrice} >= ${min} && ${cheapestPrice} <= ${max} -> ${result}`);
            return result;
        });
        console.log('Products after price range filter:', filtered.length);
    }

    console.log('✅ Final filtered products:', filtered.length);
    return filtered;
}

function sortProducts() {
    switch (currentFilters.sort) {
        case 'price-low':
            filteredProducts.sort((a, b) => getCheapestPriceValue(a) - getCheapestPriceValue(b));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => getCheapestPriceValue(b) - getCheapestPriceValue(a));
            break;
        case 'delivery':
            filteredProducts.sort((a, b) => getFastestDeliveryDays(a) - getFastestDeliveryDays(b));
            break;
        case 'smart-score':
            filteredProducts.sort((a, b) => getBestDeal(b).score - getBestDeal(a).score);
            break;
        default:
            // Keep original order
            break;
    }
}

function getCheapestPriceValue(product) {
    const prices = Object.values(product.platforms)
        .filter(p => p.available)
        .map(p => p.price);
    return prices.length ? Math.min(...prices) : Infinity;
}



function getFastestDeliveryDays(product) {
    const days = Object.values(product.platforms)
        .filter(p => p.available)
        .map(p => parseInt(p.delivery));
    return days.length ? Math.min(...days) : Infinity;
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');

    if (filteredProducts.length === 0) {
        // Clear old product cards so they don't remain visible when filter gives 0 results
        if (productsGrid) productsGrid.innerHTML = '';
        if (productsGrid) productsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (productsGrid) productsGrid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    if (productsGrid) productsGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        const productCard = createComparisonCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createComparisonCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';

    const cheapestPlatform = getCheapestPrice(product);
    const bestDeal = getBestDeal(product);

    // Get details from cheapest or best deal platform
    const platformData = product.platforms[cheapestPlatform] || Object.values(product.platforms)[0];
    const originalPrice = platformData.mrp || Math.round(platformData.price / (1 - platformData.discount / 100));
    const catName = categories.find(c => c.id === product.category)?.name || product.category;

    // Check if in wishlist
    const isInWishlist = (typeof wishlist !== 'undefined' && wishlist.includes(product.id)) ||
        (JSON.parse(localStorage.getItem('wishlist')) || []).includes(product.id);

    // Determine badge
    let badgeHTML = '';
    if (bestDeal.platform) {
        badgeHTML = `<div class="card-badge" style="background: var(--accent-green); color: black;">✨ BEST DEAL</div>`;
    } else {
        badgeHTML = `<div class="card-badge ${cheapestPlatform}">${cheapestPlatform.toUpperCase()} SELECTION</div>`;
    }

    // Image
    const imageHTML = getProductImageHTML(product.image, product.name);

    card.innerHTML = `
        ${badgeHTML}
        <div class="product-image" style="transition: transform 0.3s ease;">
            ${imageHTML}
        </div>
        <div class="product-details" style="display: flex; flex-direction: column; flex: 1; padding: 0;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; padding: 0;">
                <div style="flex: 1;">
                    <h3 class="product-name" style="font-weight: 700; margin-top: 0.2rem; font-size: 1.15rem; line-height: 1.3;" title="${product.name}">${product.name}</h3>
                    <div style="font-size: 0.7rem; color: var(--accent-blue); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0.2rem;">${catName}</div>
                </div>
                <div class="wishlist-trigger" onclick="toggleWishlist(event, ${product.id})" style="background: rgba(255,255,255,0.05); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; margin-left: 1rem;">
                    <i class="${isInWishlist ? 'fas' : 'far'} fa-heart" style="font-size: 1rem; color: ${isInWishlist ? '#ef4444' : 'var(--text-gray)'};"></i>
                </div>
            </div>
            
            <div class="price-section" style="margin: 0.5rem 0 1rem 0; display: flex; align-items: baseline; gap: 0.8rem; margin-bottom: 1rem;">
                <span class="current-price" style="font-size: 1.6rem; letter-spacing: -0.5px; font-weight: 700;">₹${platformData.price.toLocaleString()}</span>
                <div style="display: flex; flex-direction: column;">
                    <span class="original-price" style="font-size: 0.8rem; text-decoration: line-through; color: var(--text-gray);">₹${originalPrice.toLocaleString()}</span>
                    <span class="discount" style="font-size: 0.75rem; padding: 1px 4px; color: var(--accent-green); font-weight: 600; background: rgba(16, 185, 129, 0.1); border-radius: 4px;">${platformData.discount}% OFF</span>
                </div>
            </div>

            <div class="platform-strip" style="display: flex; gap: 0.4rem; margin-bottom: 1.25rem;">
                ${Object.keys(product.platforms).map(pid => {
        const p = product.platforms[pid];
        if (!p.available) return '';
        const isCheapest = pid === cheapestPlatform;
        return `
            <div style="flex: 1; padding: 0.5rem; background: ${isCheapest ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isCheapest ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.05)'}; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.6rem; color: var(--text-gray); text-transform: uppercase; margin-bottom: 2px;">${pid}</div>
                <div style="font-size: 0.85rem; font-weight: 700; color: ${isCheapest ? 'white' : 'var(--text-gray)'}">₹${p.price.toLocaleString()}</div>
            </div>`;
    }).join('')}
            </div>

            <div class="card-actions" style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <button class="view-btn" onclick="showProductModal(products.find(p => p.id === ${product.id}))" style="width: 100%; height: 42px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; color: white; cursor: pointer;">
                    Compare All Stores <i class="fas fa-chevron-right" style="font-size: 0.7rem;"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

function showProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalTitle');

    if (!modal || !modalContent) return;

    // Use a blank h3 and put title inside the modern structure for better layout control
    if (modalTitle) modalTitle.style.display = 'none';

    // Find best deal to highlight
    const bestDeal = getBestDeal(product);

    // Generate detailed comparison view for modal
    let platformsHTML = '';
    Object.keys(product.platforms).forEach(platformId => {
        const platform = product.platforms[platformId];
        const platformInfo = platforms.find(p => p.id === platformId);

        if (!platform.available) return;
        const isBest = bestDeal.platform === platformId;

        platformsHTML += `
            <div class="platform-card ${isBest ? 'best-deal' : ''}">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div class="plat-icon-box">
                        ${platformInfo.logo}
                    </div>
                    <div class="plat-detail-info">
                        <h4 style="color: white; margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 700;">${platformInfo.name} ${isBest ? '<span class="best-deal-tag">BEST PRICE</span>' : ''}</h4>
                        <div class="plat-meta">
                            <span><i class="fas fa-truck"></i> ${platform.delivery}</span>
                        </div>
                    </div>
                </div>
                <div class="plat-price-col">
                    <div class="plat-price-text">₹${platform.price.toLocaleString()}</div>
                    <a href="${platform.url}" target="_blank" class="buy-now-accent">Buy Now</a>
                </div>
            </div>
        `;
    });

    modalContent.innerHTML = `
        <div class="modal-header-section" style="display: flex; gap: 2.5rem; margin-bottom: 2.5rem;">
            <div class="modal-image-container">
                ${getProductImageHTML(product.image, product.name)}
            </div>
            <div class="modal-info-container" style="flex: 1;">
                <span style="font-size: 0.75rem; color: var(--accent-blue); font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">${product.category}</span>
                <h2 class="modal-title-text" style="font-size: 2.2rem; font-weight: 800; margin: 0.5rem 0 1rem 0; color: white;">${product.name}</h2>
                <p class="modal-desc-text">${product.description || 'Verified product listing with real-time price tracking across major Indian retailers.'}</p>
                
                <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1.5rem;">
                    <div style="background: rgba(16, 185, 129, 0.1); color: var(--accent-green); padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <i class="fas fa-check-circle"></i> In Stock
                    </div>
                    <div style="color: var(--text-gray); font-size: 0.8rem;">
                        <i class="fas fa-history"></i> Updated 5 mins ago
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
            <h4 style="color: white; margin: 0; font-size: 1.1rem; font-weight: 700;">Marketplace Comparison</h4>
            <div style="width: 60px; height: 2px; background: var(--border-color); flex: 1; margin: 0 1.5rem;"></div>
        </div>

        <div class="platform-list">
            ${platformsHTML}
        </div>
        
        <button class="close-picker-btn" onclick="document.getElementById('productModal').style.display='none'" style="display: block; margin: 2rem auto 0; background: transparent; border: none; color: var(--text-gray); font-weight: 600; cursor: pointer;">
            <i class="fas fa-times"></i> Close Product Details
        </button>
    `;

    modal.style.display = 'flex';
}

function toggleWishlist(e, productId) {
    e.stopPropagation();
    const trigger = e.currentTarget;
    const icon = trigger.querySelector('i');

    // Explicitly check current localStorage state to be robust
    let currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isAdding = !currentWishlist.includes(productId);

    if (isAdding) {
        currentWishlist.push(productId);
        if (typeof showNotification === 'function') showNotification('Added to wishlist', 'success');
        else alert('Added to wishlist');
        icon.className = 'fas fa-heart';
        icon.style.color = '#ef4444';
    } else {
        currentWishlist = currentWishlist.filter(id => id !== productId);
        if (typeof showNotification === 'function') showNotification('Removed from wishlist', 'info');
        else alert('Removed from wishlist');
        icon.className = 'far fa-heart';
        icon.style.color = 'var(--text-gray)';
    }

    // Save to localStorage
    localStorage.setItem('wishlist', JSON.stringify(currentWishlist));

    // Sync with global wishlist variable if exists
    if (typeof wishlist !== 'undefined') {
        wishlist = currentWishlist;
    }

    // Sync with currentUser if logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        user.wishlist = currentWishlist;
        localStorage.setItem('currentUser', JSON.stringify(user));

        if (typeof updateUserInStorage === 'function') {
            updateUserInStorage(user);
        }
    }
}
