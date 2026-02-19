// SmartPrice Monitor Main JavaScript
/* global products, categories, platforms, getCheapestPrice, getBestDeal, getProductImageHTML, searchSuggestions */

// Global Variables
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
let coupons = JSON.parse(localStorage.getItem('coupons')) || [];

// Initialize App
document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM loaded, initializing app...');
    try {
        await initializeApp();
        await loadTrendingProducts();
        await loadUnder200Products();
        setupEventListeners();
        updateCartCount();
        setupFeedbackSystem();
        setupCategoriesDropdown();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Expose loadProducts for real-time updates via data.js storage event
window.loadProducts = async function () {
    console.log('🔄 Refreshing products from storage event...');
    await loadTrendingProducts();
    await loadUnder200Products();
};

async function initializeApp() {
    console.log('Initializing app...');
    // Simulate an async auth check or config fetch
    return new Promise((resolve) => {
        setTimeout(() => {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                updateNavigation();
            }
            console.log('App initialized');
            resolve();
        }, 100);
    });
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Search functionality - Nav search removed

    // Hero search functionality
    const heroSearchInput = document.getElementById('heroSearchInput');
    const heroSearchBtn = document.getElementById('heroSearchBtn');

    if (heroSearchInput && heroSearchBtn) {
        console.log('Setting up hero search listeners');
        heroSearchInput.addEventListener('input', function () {
            clearSearchError(this);
        });
        heroSearchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performHeroSearch();
            }
        });
        heroSearchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            performHeroSearch();
        });
    }

    // Navigation links
    setupNavigationLinks();
    console.log('Event listeners setup complete');
}

function setupCategoriesDropdown() {
    const categoriesBtn = document.getElementById('categoriesBtn');
    const categoriesDropdown = document.getElementById('categoriesDropdown');

    if (categoriesBtn && categoriesDropdown) {
        console.log('Setting up categories dropdown');
        categoriesBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const isVisible = categoriesDropdown.style.display === 'block';
            categoriesDropdown.style.display = isVisible ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!categoriesBtn.contains(e.target) && !categoriesDropdown.contains(e.target)) {
                categoriesDropdown.style.display = 'none';
            }
        });
    }
}

function setupNavigationLinks() {
    const cartLink = document.getElementById('cartLink');
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');

    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                logout();
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html?mode=signup';
        });
    }
}

// Navigation Functions
function navigateToCategory(category) {
    console.log('Navigating to category:', category);
    localStorage.setItem('selectedCategory', category);
    window.location.href = 'categories.html';
}

function navigateToDeals(priceRange) {
    console.log('Navigating to deals:', priceRange);
    localStorage.setItem('priceRange', priceRange);
    window.location.href = 'comparison.html';
}

function applyCoupon(couponCode) {
    console.log('Applying coupon:', couponCode);
    // Store coupon for later use in cart
    localStorage.setItem('appliedCoupon', couponCode);

    // Copy to clipboard
    navigator.clipboard.writeText(couponCode).then(() => {
        showNotification(`Coupon ${couponCode} copied & applied! Use it during checkout.`, 'success');
    }).catch(err => {
        console.error('Could not copy text: ', err);
        showNotification(`Coupon ${couponCode} applied! Use it during checkout.`, 'success');
    });
}

function filterFastDelivery() {
    console.log('Filtering by fast delivery');
    localStorage.setItem('selectedSort', 'delivery');
    window.location.href = 'comparison.html';
}

function filterBestValue() {
    console.log('Filtering by best value');
    localStorage.setItem('selectedSort', 'smart-score');
    window.location.href = 'comparison.html';
}

function filterTrusted() {
    console.log('Filtering trusted platforms');
    // All platforms are trusted, show all
    localStorage.removeItem('selectedCategory');
    localStorage.removeItem('searchQuery');
    window.location.href = 'comparison.html';
}

// Search Functions
function performSearch() {
    console.log('Performing search...');
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }

    const query = searchInput.value.trim();

    // Clear any existing error states
    clearSearchError(searchInput);

    if (!query) {
        showSearchError(searchInput, 'Please enter a product name');
        return;
    }

    console.log('Searching for:', query);

    // Check if products exist
    if (typeof products === 'undefined' || !products || products.length === 0) {
        console.error('Products not loaded');
        showSearchError(searchInput, 'Products not loaded. Please refresh the page.');
        return;
    }

    // Check if products match the search query
    const matchingProducts = products.filter(product => {
        const queryVal = (searchInput.value || '').toLowerCase().trim();
        const queryWords = queryVal.split(/\s+/).filter(w => w.length > 2);

        const pName = (product.name || '').toLowerCase();
        const pDesc = (product.description || '').toLowerCase();
        const pCat = (product.category || '').toLowerCase();
        const catName = categories.find(c => c.id === pCat)?.name?.toLowerCase() || '';

        // 1. Name Match (High Priority)
        const nameMatch = pName.includes(queryVal);

        // 2. Category Match
        const categoryMatch = pCat === queryVal || catName === queryVal;

        // 3. Word-based matching
        const wordMatch = queryWords.length > 0 && queryWords.every(word => pName.includes(word));

        // 4. Category/Type Intelligence
        const typeMapping = {
            'laptop': ['laptop', 'macbook', 'notebook', 'ultrabook', 'chromebook', 'thinkpad', 'vivobook', 'inspiron', 'pavilion'],
            'mobile': ['phone', 'mobile', 'smartphone', 'iphone', 'galaxy', 'vivo', 'oppo', 'oneplus', 'pixel'],
            'phone': ['phone', 'mobile', 'smartphone', 'iphone', 'galaxy', 'vivo', 'oppo', 'oneplus', 'pixel']
        };

        let intelligentTypeMatch = false;
        let isBroadTypeSearch = false;

        for (const [type, keywords] of Object.entries(typeMapping)) {
            if (queryVal.includes(type)) {
                isBroadTypeSearch = true;
                if (keywords.some(kw => pName.includes(kw) || pCat.includes(kw))) {
                    intelligentTypeMatch = true;
                    break;
                }
            }
        }

        // 5. Description Match (Only for non-broad searches)
        let descriptionMatch = false;
        if (!isBroadTypeSearch) {
            descriptionMatch = pDesc.includes(queryVal);
        }

        return nameMatch || categoryMatch || wordMatch || intelligentTypeMatch || descriptionMatch;
    });

    console.log('Found', matchingProducts.length, 'matching products');

    if (matchingProducts.length === 0) {
        showNoResultsMessage(searchInput, query);
        return;
    }

    // Store search query and navigate
    localStorage.setItem('searchQuery', query);
    window.location.href = 'comparison.html';
}

function performHeroSearch() {
    console.log('Performing hero search...');
    const searchInput = document.getElementById('heroSearchInput');
    if (!searchInput) {
        console.error('Hero search input not found');
        return;
    }

    const query = searchInput.value.trim();

    // Clear any existing error states
    clearSearchError(searchInput);

    if (!query) {
        showSearchError(searchInput, 'Please enter a product name');
        return;
    }

    // Check if products match the search query (consistent logic)
    const matchingProducts = products.filter(product => {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

        const pName = (product.name || '').toLowerCase();
        const pDesc = (product.description || '').toLowerCase();
        const pCat = (product.category || '').toLowerCase();
        const catName = categories.find(c => c.id === pCat)?.name?.toLowerCase() || '';

        const nameMatch = pName.includes(queryLower);
        const categoryMatch = pCat === queryLower || catName === queryLower;
        const wordMatch = queryWords.length > 0 && queryWords.every(word => pName.includes(word));

        const typeMapping = {
            'laptop': ['laptop', 'macbook', 'notebook', 'ultrabook', 'chromebook', 'thinkpad', 'vivobook', 'inspiron', 'pavilion'],
            'mobile': ['phone', 'mobile', 'smartphone', 'iphone', 'galaxy', 'vivo', 'oppo', 'oneplus', 'pixel'],
            'phone': ['phone', 'mobile', 'smartphone', 'iphone', 'galaxy', 'vivo', 'oppo', 'oneplus', 'pixel']
        };

        let intelligentTypeMatch = false;
        let isBroadTypeSearch = false;
        for (const [type, keywords] of Object.entries(typeMapping)) {
            if (queryLower.includes(type)) {
                isBroadTypeSearch = true;
                if (keywords.some(kw => pName.includes(kw) || pCat.includes(kw))) {
                    intelligentTypeMatch = true;
                    break;
                }
            }
        }

        let descriptionMatch = false;
        if (!isBroadTypeSearch) {
            descriptionMatch = pDesc.includes(queryLower);
        }

        return nameMatch || categoryMatch || wordMatch || intelligentTypeMatch || descriptionMatch;
    });

    if (matchingProducts.length === 0) {
        showNoResultsMessage(searchInput, query);
        return;
    }

    // Store search query and navigate
    localStorage.setItem('searchQuery', query);
    window.location.href = 'comparison.html';
}

function showSearchError(inputElement, message) {
    console.log('Showing search error:', message);
    // Add error styling
    inputElement.classList.add('search-error');

    // Remove any existing error messages
    const container = inputElement.parentElement;
    const existingError = container.querySelector('.search-error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'search-error-message';
    errorDiv.innerHTML = `<i class=\"fas fa-exclamation-triangle\"></i> ${message}`;

    // Position relative to input
    container.style.position = 'relative';
    container.appendChild(errorDiv);

    // Remove error after 3 seconds
    setTimeout(() => {
        clearSearchError(inputElement);
    }, 3000);

    // Focus back to input
    inputElement.focus();
}

function showNoResultsMessage(inputElement, query) {
    console.log('Showing no results message for:', query);
    // Add error styling
    inputElement.classList.add('search-error');

    // Get trending products for suggestions
    const trendingProducts = products.filter(p => p.trending).slice(0, 4);
    const suggestedProductsHTML = trendingProducts.map(p =>
        `<span class=\"suggested-product\" onclick=\"searchProduct('${p.name}')\">${p.name}</span>`
    ).join('');

    // Create no results message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'no-results-message';
    messageDiv.innerHTML = `
        <div><i class=\"fas fa-search\"></i> No matching products found for \"${query}\"</div>
        <div class=\"suggested-products\">
            <h4>Try these trending products:</h4>
            ${suggestedProductsHTML}
        </div>
    `;

    // Position relative to input
    const container = inputElement.parentElement;
    container.style.position = 'relative';
    container.appendChild(messageDiv);

    // Remove message after 5 seconds
    setTimeout(() => {
        clearSearchError(inputElement);
    }, 5000);
}

function clearSearchError(inputElement) {
    // Remove error styling
    inputElement.classList.remove('search-error');

    // Remove error messages
    const container = inputElement.parentElement;
    const errorMessage = container.querySelector('.search-error-message');
    const noResultsMessage = container.querySelector('.no-results-message');

    if (errorMessage) {
        errorMessage.remove();
    }
    if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

function searchProduct(productName) {
    const searchInputs = document.querySelectorAll('#searchInput, #heroSearchInput');
    searchInputs.forEach(input => {
        if (input) {
            input.value = productName;
            clearSearchError(input);
        }
    });

    localStorage.setItem('searchQuery', productName);
    window.location.href = 'comparison.html';
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
    if (suggestionsDiv && typeof searchSuggestions !== 'undefined') {
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
    if (!suggestionsDiv || typeof searchSuggestions === 'undefined') return;

    suggestionsDiv.innerHTML = '';

    searchSuggestions.slice(0, 5).forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = suggestion;
            performSearch();
            hideSearchSuggestions();
        });
        suggestionsDiv.appendChild(item);
    });
}

function filterSuggestions(query) {
    const suggestionsDiv = document.getElementById('searchSuggestions');
    if (!suggestionsDiv || typeof searchSuggestions === 'undefined') return;

    suggestionsDiv.innerHTML = '';

    const filtered = searchSuggestions.filter(s =>
        s.toLowerCase().includes(query)
    ).slice(0, 5);

    filtered.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = suggestion;
            performSearch();
            hideSearchSuggestions();
        });
        suggestionsDiv.appendChild(item);
    });
}

async function loadTrendingProducts() {
    console.log('Loading trending products (under ₹500)...');
    const trendingGrid = document.getElementById('trendingProducts');
    if (!trendingGrid) {
        console.log('Trending grid not found');
        return;
    }

    try {
        const budgetProducts = await new Promise((resolve) => {
            setTimeout(() => {
                const filtered = products.filter(product => {
                    const cheapest = getCheapestPrice(product);
                    return product.platforms[cheapest].price < 500;
                }).slice(0, 5);
                resolve(filtered);
            }, 500);
        });

        console.log('Found', budgetProducts.length, 'budget products');

        trendingGrid.innerHTML = '';

        if (budgetProducts.length === 0) {
            trendingGrid.innerHTML = '<div style=\"grid-column: 1/-1; text-align: center; color: var(--text-gray);\">No budget deals available right now. Check back soon!</div>';
            return;
        }

        budgetProducts.forEach(product => {
            const productCard = createProductCard(product);
            trendingGrid.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error fetching budget products:', error);
        trendingGrid.innerHTML = '<div style=\"grid-column: 1/-1; text-align: center; color: #ef4444;\">Failed to load deals.</div>';
    }
}

async function loadUnder200Products() {
    console.log('Loading super saver products (under ₹200)...');
    const grid = document.getElementById('under200Products');
    if (!grid) return;

    try {
        const saverProducts = await new Promise((resolve) => {
            setTimeout(() => {
                const filtered = products.filter(product => {
                    const cheapest = getCheapestPrice(product);
                    return product.platforms[cheapest].price <= 200;
                }).slice(0, 4);
                resolve(filtered);
            }, 500);
        });

        console.log('Found', saverProducts.length, 'saver products');

        grid.innerHTML = '';

        if (saverProducts.length === 0) {
            grid.innerHTML = '<div style=\"grid-column: 1/-1; text-align: center; color: var(--text-gray);\">No super saver deals available right now.</div>';
            return;
        }

        saverProducts.forEach(product => {
            const productCard = createProductCard(product);
            grid.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error fetching saver products:', error);
        grid.innerHTML = '<div style=\"grid-column: 1/-1; text-align: center; color: #ef4444;\">Failed to load deals.</div>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';

    const cheapestPlatform = getCheapestPrice(product);
    const cheapestPrice = product.platforms[cheapestPlatform].price;

    card.innerHTML = `
        <div class=\"product-image\">${getProductImageHTML(product.image)}</div>
        <div class=\"product-info\">
            <h3>${product.name}</h3>
            <div class=\"product-price\">₹${cheapestPrice.toLocaleString()}</div>
            <div class=\"product-actions\">
                <button class=\"btn btn-secondary\" onclick=\"addToWishlist(${product.id})\" style=\"width: 100%;\">
                    ♡ Add to Wishlist
                </button>
            </div>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            viewProduct(product.id);
        }
    });

    return card;
}

function addToCart(productId, platform) {
    console.log('Adding to cart:', productId, platform);
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    const cartItem = {
        productId,
        platform,
        quantity: 1,
        addedAt: new Date().toISOString()
    };

    // Check if item already exists
    const existingIndex = cart.findIndex(item =>
        item.productId === productId && item.platform === platform
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Added to cart!', 'success');
}

function addToWishlist(productId) {
    console.log('Adding to wishlist:', productId);
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        // Sync with currentUser
        if (currentUser) {
            currentUser.wishlist = wishlist;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (typeof updateUserInStorage === 'function') {
                updateUserInStorage(currentUser);
            }
        }

        showNotification('Added to wishlist!', 'success');
    } else {
        showNotification('Already in wishlist!', 'info');
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    if (loginLink && currentUser) {
        loginLink.innerHTML = '<i class=\"fas fa-sign-out-alt\"></i> Logout';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavigation();
    showNotification('Logged out successfully!', 'success');
    window.location.href = 'index.html';
}

function viewProduct(productId) {
    localStorage.setItem('selectedProduct', productId);
    window.location.href = 'comparison.html';
}

// Feedback System
function setupFeedbackSystem() {
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }

    // Rating stars
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.dataset.rating);
            updateStarRating(rating);
            const ratingInput = document.getElementById('feedbackRating');
            if (ratingInput) ratingInput.value = rating;
        });

        star.addEventListener('mouseover', function () {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });

    const ratingContainer = document.querySelector('.rating-stars');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function () {
            const ratingInput = document.getElementById('feedbackRating');
            const currentRating = ratingInput ? parseInt(ratingInput.value) : 5;
            updateStarRating(currentRating);
        });
    }
}

function openFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) modal.style.display = 'flex';
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('feedbackForm');
        if (form) form.reset();
        updateStarRating(5);
    }
}

function updateStarRating(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function highlightStars(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.style.opacity = '1';
            star.style.transform = 'scale(1.1)';
        } else {
            star.style.opacity = '0.3';
            star.style.transform = 'scale(1)';
        }
    });
}

function handleFeedbackSubmit(e) {
    e.preventDefault();

    const ratingInput = document.getElementById('feedbackRating');
    const commentInput = document.getElementById('feedbackComment');
    const rating = ratingInput ? ratingInput.value : 5;
    const comment = commentInput ? commentInput.value.trim() : '';

    if (!comment) {
        showNotification('Please enter a comment', 'error');
        return;
    }

    const feedback = {
        id: Date.now(),
        rating: parseInt(rating),
        comment: comment,
        date: new Date().toISOString(),
        user: currentUser ? currentUser.name : 'Anonymous'
    };

    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

    showNotification('Thank you for your feedback!', 'success');
    closeFeedbackModal();
}

function showNotification(message, type = 'info') {
    console.log('Notification:', message, type);
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const msgStyle = document.createElement('style');
msgStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(msgStyle);

// Global functions for HTML onclick events
window.navigateToCategory = navigateToCategory;
window.navigateToDeals = navigateToDeals;
window.applyCoupon = applyCoupon;
window.addToCart = addToCart;
window.addToWishlist = addToWishlist;
window.viewProduct = viewProduct;
window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.searchProduct = searchProduct;

console.log('SmartPrice Monitor main.js loaded successfully');

function toggleFaq(item) {
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.fa-chevron-down');

    // Close other FAQs
    document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
            const otherAnswer = otherItem.querySelector('.faq-answer');
            const otherIcon = otherItem.querySelector('.fa-chevron-down');
            if (otherAnswer && otherAnswer.style.display === 'block') {
                otherAnswer.style.display = 'none';
                if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            }
        }
    });

    // Toggle current FAQ
    if (answer && answer.style.display === 'block') {
        answer.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    } else if (answer) {
        answer.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
    }
}
window.toggleFaq = toggleFaq;