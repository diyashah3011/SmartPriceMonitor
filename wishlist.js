// Wishlist Page JavaScript

let currentAlertProduct = null;

document.addEventListener('DOMContentLoaded', function () {
    initializeWishlist();
    setupWishlistEventListeners();
    loadWishlistItems();
});

function initializeWishlist() {
    updateCartCount();
}

function setupWishlistEventListeners() {
    // Clear wishlist button
    document.getElementById('clearWishlistBtn').addEventListener('click', clearWishlist);

    // Price alert modal
    const modal = document.getElementById('priceAlertModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Price alert form
    document.getElementById('priceAlertForm').addEventListener('submit', handlePriceAlert);
}

function loadWishlistItems() {
    const wishlistItemsContainer = document.getElementById('wishlistItems');
    const emptyWishlist = document.getElementById('emptyWishlist');

    if (wishlist.length === 0) {
        emptyWishlist.style.display = 'block';
        wishlistItemsContainer.style.display = 'none';
        return;
    }

    emptyWishlist.style.display = 'none';
    wishlistItemsContainer.style.display = 'grid';

    wishlistItemsContainer.innerHTML = '';

    wishlist.forEach((productId, index) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const itemElement = createWishlistItemElement(product, index);
        wishlistItemsContainer.appendChild(itemElement);
    });
}

function createWishlistItemElement(product, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'wishlist-item wishlist-item-enter';

    const categoryName = categories.find(c => c.id === product.category)?.name || product.category;
    const cheapestPlatform = getCheapestPrice(product);
    const fastestPlatform = getFastestDelivery(product);

    // Generate platform prices
    let platformPricesHTML = '';

    Object.keys(product.platforms).forEach(platformId => {
        const platform = product.platforms[platformId];
        const platformInfo = platforms.find(p => p.id === platformId);

        if (!platform.available) {
            platformPricesHTML += `
                <div class="platform-price">
                    <div class="platform-info">
                        <span class="platform-logo">${platformInfo.logo}</span>
                        <div class="platform-details">
                            <div class="platform-name">${platformInfo.name}</div>
                        </div>
                    </div>
                    <div class="platform-pricing">
                        <div class="unavailable">Not Available</div>
                    </div>
                </div>
            `;
            return;
        }

        const originalPrice = Math.round(platform.price / (1 - platform.discount / 100));
        const isCheapest = platformId === cheapestPlatform;
        const isFastest = platformId === fastestPlatform;

        let badges = '';
        if (isCheapest) badges += '<span class="price-badge cheapest">Cheapest</span>';
        if (isFastest) badges += '<span class="price-badge fastest">Fastest</span>';

        platformPricesHTML += `
            <div class="platform-price ${isCheapest ? 'cheapest' : ''} ${isFastest ? 'fastest' : ''}">
                <div class="platform-info">
                    <span class="platform-logo">${platformInfo.logo}</span>
                    <div class="platform-details">
                        <div class="platform-name">${platformInfo.name}</div>
                        <div class="platform-meta">⭐ ${platform.rating} • 🚚 ${platform.delivery}</div>
                    </div>
                </div>
                <div class="platform-pricing">
                    <div class="price">₹${platform.price.toLocaleString()}</div>
                    ${platform.discount > 0 ? `
                        <div class="original-price">₹${originalPrice.toLocaleString()}</div>
                        <div class="discount">${platform.discount}% off</div>
                    ` : ''}
                    <div class="price-badges">${badges}</div>
                </div>
            </div>
        `;
    });

    itemDiv.innerHTML = `
        <div class="wishlist-item-header">
            <button class="remove-wishlist" onclick="removeFromWishlist(${index})">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="product-preview">
                <div class="product-icon">${getProductImageHTML(product.image)}</div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-category">${categoryName}</div>
                    <div class="product-added-date">Added to wishlist</div>
                </div>
            </div>
        </div>
        
        <div class="price-comparison">
            <h4>Price Comparison</h4>
            <div class="platform-prices">
                ${platformPricesHTML}
            </div>
        </div>
        
        <div class="wishlist-actions-item">
            <button class="btn btn-outline" onclick="openPriceAlert(${product.id})" style="flex: 1;">
                <i class="fas fa-bell"></i> Price Alert
            </button>
            <button class="btn btn-secondary" onclick="viewProduct(${product.id})" style="flex: 1;">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `;

    return itemDiv;
}

function removeFromWishlist(index) {
    const product = products.find(p => p.id === wishlist[index]);

    // Add exit animation
    const itemElement = document.querySelectorAll('.wishlist-item')[index];
    itemElement.classList.add('wishlist-item-exit');

    setTimeout(() => {
        wishlist.splice(index, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        loadWishlistItems();
        showNotification(`${product.name} removed from wishlist`, 'success');
    }, 300);
}

function clearWishlist() {
    if (wishlist.length === 0) return;

    if (confirm('Are you sure you want to clear your entire wishlist?')) {
        wishlist = [];
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        loadWishlistItems();
        showNotification('Wishlist cleared!', 'success');
    }
}

function addAllToCart() {
    if (wishlist.length === 0) {
        showNotification('Your wishlist is empty', 'error');
        return;
    }

    let addedCount = 0;

    wishlist.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cheapestPlatform = getCheapestPrice(product);

        // Check if item already exists in cart
        const existingIndex = cart.findIndex(item =>
            item.productId === productId && item.platform === cheapestPlatform
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                productId,
                platform: cheapestPlatform,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        addedCount++;
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    showNotification(`${addedCount} items added to cart!`, 'success');
}

function openPriceAlert(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentAlertProduct = product;

    const modal = document.getElementById('priceAlertModal');
    const productPreview = document.getElementById('alertProductPreview');
    const currentLowestPrice = document.getElementById('currentLowestPrice');
    const alertEmail = document.getElementById('alertEmail');

    // Get current lowest price
    const cheapestPlatform = getCheapestPrice(product);
    const lowestPrice = product.platforms[cheapestPlatform].price;

    // Update modal content
    productPreview.innerHTML = `
        <div class="product-preview-modal">
            <div class="product-icon">${getProductImageHTML(product.image)}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-category">${categories.find(c => c.id === product.category)?.name}</div>
            </div>
        </div>
    `;

    currentLowestPrice.textContent = lowestPrice.toLocaleString();

    // Pre-fill email if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        alertEmail.value = user.email;
    }

    // Set suggested target price (10% below current lowest)
    const suggestedPrice = Math.round(lowestPrice * 0.9);
    document.getElementById('targetPrice').value = suggestedPrice;

    modal.style.display = 'block';
}

function handlePriceAlert(e) {
    e.preventDefault();

    if (!currentAlertProduct) return;

    const targetPrice = parseFloat(document.getElementById('targetPrice').value);
    const email = document.getElementById('alertEmail').value;

    const cheapestPlatform = getCheapestPrice(currentAlertProduct);
    const currentPrice = currentAlertProduct.platforms[cheapestPlatform].price;

    if (targetPrice >= currentPrice) {
        showNotification('Target price should be lower than current price', 'error');
        return;
    }

    // Simulate setting price alert
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
        // Close modal
        document.getElementById('priceAlertModal').style.display = 'none';

        // Reset form
        e.target.reset();
        currentAlertProduct = null;

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        showNotification(`Price alert set for ${currentAlertProduct?.name || 'product'}!`, 'success');
    }, 1500);
}

function viewProduct(productId) {
    localStorage.setItem('selectedProduct', productId);
    window.location.href = 'comparison.html';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add wishlist statistics
function loadWishlistStats() {
    if (wishlist.length === 0) return;

    let totalValue = 0;
    let avgSavings = 0;
    let availableItems = 0;

    wishlist.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cheapestPlatform = getCheapestPrice(product);
        if (product.platforms[cheapestPlatform].available) {
            availableItems++;
            totalValue += product.platforms[cheapestPlatform].price;

            // Calculate average discount
            Object.values(product.platforms).forEach(platform => {
                if (platform.available) {
                    avgSavings += platform.discount;
                }
            });
        }
    });

    avgSavings = Math.round(avgSavings / (wishlist.length * 3)); // Assuming 3 platforms on average

    // You could display these stats if needed
    console.log('Wishlist Stats:', {
        totalItems: wishlist.length,
        availableItems,
        totalValue,
        avgSavings
    });
}