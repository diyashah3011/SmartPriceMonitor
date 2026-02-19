// User Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    checkUserAuth();


    if (currentUser) {
        initializeDashboard();
        setupDashboardEventListeners();
        loadDashboardData();
    }
});

function checkUserAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(savedUser);
    if (!currentUser.preferences) {
        currentUser.preferences = {
            preferredPlatform: 'flipkart'
        };
    }
}

function initializeDashboard() {
    // Determine if it's a new account (less than 5 minutes old)
    const isNewAccount = currentUser.createdAt && (new Date() - new Date(currentUser.createdAt) < 300000);
    const welcomePrefix = isNewAccount ? "Welcome," : "Welcome back,";

    // Update user info in Overview section
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = `${welcomePrefix} ${currentUser.name || 'Smart User'}!`;

    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) userEmailEl.textContent = `Verified Account ID: ${currentUser.email}`;

    // Update user info in Sidebar
    const sidebarNameEl = document.getElementById('sidebarUserName');
    if (sidebarNameEl) sidebarNameEl.textContent = currentUser.name || "Smart User";

    const sidebarEmailEl = document.getElementById('sidebarUserEmail');
    if (sidebarEmailEl) {
        sidebarEmailEl.textContent = `Voter ID: SMART-${(currentUser.id || 7921).toString().slice(-4)}`;
        sidebarEmailEl.style.fontSize = '0.7rem';
        sidebarEmailEl.style.opacity = '0.6';
    }

    // Check for admin role
    if (currentUser.role === 'admin') {
        const adminLink = document.getElementById('adminLink');
        if (adminLink) adminLink.style.display = 'inline-flex';
    }

    // Update all profile images if exists
    document.querySelectorAll('.user-avatar').forEach(container => {
        let img = container.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.style.cssText = "width: 100%; height: 100%; object-fit: cover; border-radius: 50%;";
            container.insertBefore(img, container.firstChild);
        }

        if (currentUser.profileImage) {
            img.src = currentUser.profileImage;
        } else {
            // Default generated avatar
            const initials = (currentUser.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            img.src = `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&bold=true`;
        }
        img.alt = "Profile";
    });

    // Add upload button for profile image (Settings only)
    const settingsAvatar = document.getElementById('settingsAvatar');
    if (settingsAvatar && !settingsAvatar.querySelector('.upload-btn')) {
        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'upload-btn';
        uploadBtn.innerHTML = '<i class="fas fa-camera"></i>';
        uploadBtn.style.cssText = 'position: absolute; bottom: 0; right: 0; border: none; background: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
        uploadBtn.onclick = uploadProfileImage;
        settingsAvatar.style.position = 'relative';
        settingsAvatar.appendChild(uploadBtn);
    }

    // Load user preferences
    loadUserPreferences();

    // Update cart count
    updateCartCount();
}

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
                updateUserInStorage(currentUser);
                showNotification("Profile image updated!", "success");
                initializeDashboard();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function removeProfileImage() {
    if (!currentUser.profileImage) {
        showNotification("No profile image to remove.", "info");
        return;
    }

    if (confirm("Are you sure you want to remove your profile photo?")) {
        delete currentUser.profileImage;
        updateUserInStorage(currentUser);
        showNotification("Profile image removed!", "success");
        initializeDashboard();

        // Specifically for settings view, ensure it refreshes nicely
        const settingsAvatar = document.getElementById('settingsAvatar');
        if (settingsAvatar) {
            const img = settingsAvatar.querySelector('img');
            if (img) {
                const initials = (currentUser.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                img.src = `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&bold=true`;
            }
        }
    }
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
                const logoImg = document.getElementById('brandLogo');
                if (logoImg) logoImg.src = logoUrl;
                localStorage.setItem('siteLogo', logoUrl);
                alert("Site logo updated!");
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function setupDashboardEventListeners() {
    // Theme toggle


    // Save preferences
    document.getElementById('savePreferences').addEventListener('click', saveUserPreferences);

    // Logout
    document.getElementById('loginLink').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    const updateSecurityBtn = document.getElementById('updateSecurityBtn');
    if (updateSecurityBtn) {
        updateSecurityBtn.addEventListener('click', handleSecurityUpdate);
    }

    // Enter key support for security fields
    const securityFields = ['currentPassword', 'newPassword', 'confirmNewPassword'];
    securityFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSecurityUpdate();
                }
            });
        }
    });

    // Category View Toggles
    const gridBtnCat = document.getElementById('gridBtn-cat');
    const listBtnCat = document.getElementById('listBtn-cat');
    const categoriesGrid = document.getElementById('categories-grid');

    if (gridBtnCat && listBtnCat && categoriesGrid) {
        gridBtnCat.addEventListener('click', () => {
            categoriesGrid.classList.remove('list-view');
            gridBtnCat.classList.add('active');
            gridBtnCat.style.background = 'var(--accent-blue)';
            gridBtnCat.style.borderColor = 'var(--accent-blue)';
            listBtnCat.classList.remove('active');
            listBtnCat.style.background = 'rgba(255,255,255,0.05)';
            listBtnCat.style.borderColor = 'var(--border-color)';
        });

        listBtnCat.addEventListener('click', () => {
            categoriesGrid.classList.add('list-view');
            listBtnCat.classList.add('active');
            listBtnCat.style.background = 'var(--accent-blue)';
            listBtnCat.style.borderColor = 'var(--accent-blue)';
            gridBtnCat.classList.remove('active');
            gridBtnCat.style.background = 'rgba(255,255,255,0.05)';
            gridBtnCat.style.borderColor = 'var(--border-color)';
        });
    }
}

function handleSecurityUpdate() {
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;

    // Validation
    if (!currentPass || !newPass || !confirmPass) {
        showNotification('Please fill in all password fields.', 'error');
        return;
    }

    if (currentPass !== currentUser.password) {
        showNotification('Current password is incorrect.', 'error');
        return;
    }

    function isStrongPassword(password) {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[@$!%*?&]/.test(password);
    }

    if (!isStrongPassword(newPass)) {
        showNotification('Strong password required: 8+ chars, uppercase, lowercase, number, and special character (@$!%*?&).', 'warning');
        return;
    }

    if (newPass !== confirmPass) {
        showNotification('New passwords do not match.', 'error');
        return;
    }

    if (newPass === currentPass) {
        showNotification('New password cannot be the same as current password.', 'warning');
        return;
    }

    // Update password
    currentUser.password = newPass;
    updateUserInStorage(currentUser);

    // Clear fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';

    showNotification('Security settings updated successfully!', 'success');
}

async function loadDashboardData() {
    console.log('Loading dashboard data asynchronously...');
    try {
        await Promise.all([
            loadQuickStats(),
            loadRecentOrders(),
            loadCartSummary(),
            loadWishlist(),
            loadRecentlyViewed(),
            renderCategoriesInDashboard()
        ]);
        console.log('All dashboard data loaded.');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadQuickStats() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Total orders (optional)
            const totalOrdersEl = document.getElementById('totalOrders');
            if (totalOrdersEl) {
                const totalOrders = currentUser.orders ? currentUser.orders.length : 0;
                totalOrdersEl.textContent = totalOrders;
            }

            // Wishlist items
            const wishlistItemsEl = document.getElementById('wishlistItems');
            if (wishlistItemsEl) wishlistItemsEl.textContent = wishlist.length;

            // Calculate total savings
            let totalSavings = 0;
            if (currentUser.orders) {
                currentUser.orders.forEach(order => {
                    totalSavings += order.totalAmount * 0.1;
                });
            }
            const savingsEl = document.getElementById('totalSavings');
            if (savingsEl) savingsEl.textContent = `₹${Math.round(totalSavings).toLocaleString()}`;
            resolve();
        }, 100);
    });
}

async function loadRecentOrders() {
    const recentOrdersContainer = document.getElementById('recentOrders');
    if (!recentOrdersContainer) return;

    // Simulate async fetch
    const orders = await new Promise((resolve) => {
        setTimeout(() => resolve(currentUser.orders || []), 200);
    });

    if (orders.length === 0) {
        recentOrdersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <p>No orders yet. Start shopping to see your orders here!</p>
                <a href="comparison.html" class="btn btn-primary btn-sm">Browse Products</a>
            </div>
        `;
        return;
    }

    recentOrdersContainer.innerHTML = '';
    const recentOrders = [...orders].slice(-3).reverse();

    recentOrders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.style.cursor = 'pointer';

        const firstItem = order.items[0];
        const product = products.find(p => p.id === firstItem.productId);
        const itemCount = order.items.length;

        orderItem.innerHTML = `
            <div class="order-info">
                <div class="order-icon">${product ? getProductImageHTML(product.image) : '📦'}</div>
                <div class="order-details">
                    <h4>Order #${order.id}</h4>
                    <div class="order-meta">
                        ${itemCount} item${itemCount > 1 ? 's' : ''} • ${order.date}
                    </div>
                </div>
            </div>
            <div class="order-status">
                <div class="order-price">₹${order.totalAmount.toLocaleString()}</div>
                <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>
            </div>
        `;
        recentOrdersContainer.appendChild(orderItem);
    });
}

function showOrderDetails(orderId) {
    // Convert to string for comparison since HTML attributes pass strings
    const order = currentUser.orders.find(o => String(o.id) === String(orderId));
    if (!order) return;

    const itemDetails = order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? `${product.name} (x${item.quantity})` : 'Unknown Product';
    }).join('\n');

    alert(`Order Details #${order.id}\n\nDate: ${order.date}\nStatus: ${order.status}\nTotal: ₹${order.totalAmount}\n\nItems:\n${itemDetails}`);
}

function cancelOrder(orderId) {
    if (confirm(`Are you sure you want to cancel Order #${orderId}?`)) {
        // Convert to string for comparison
        const orderIndex = currentUser.orders.findIndex(o => String(o.id) === String(orderId));
        if (orderIndex > -1) {
            currentUser.orders[orderIndex].status = 'Cancelled';
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            loadRecentOrders();
            loadQuickStats();
            showNotification(`Order #${orderId} has been cancelled.`, 'success');
        }
    }
}

async function loadCartSummary() {
    const cartSummaryContainer = document.getElementById('cartSummary');
    if (!cartSummaryContainer) return;

    // Simulate async fetch
    const cartItems = await new Promise((resolve) => {
        setTimeout(() => resolve(cart), 150);
    });

    if (cartItems.length === 0) {
        cartSummaryContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="comparison.html" class="btn btn-primary btn-sm">Start Shopping</a>
            </div>
        `;
        return;
    }

    cartSummaryContainer.innerHTML = '';
    const displayItems = cartItems.slice(0, 3);

    displayItems.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) return;

        const platformData = product.platforms[cartItem.platform];
        const platformInfo = platforms.find(p => p.id === cartItem.platform);
        const itemTotal = platformData.price * cartItem.quantity;

        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item-summary';

        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-icon">${getProductImageHTML(product.image)}</div>
                <div class="cart-item-details">
                    <h4>${product.name} (${cartItem.quantity}x)</h4>
                    <div class="cart-item-platform">${platformInfo.logo} ${platformInfo.name}</div>
                </div>
            </div>
            <div class="cart-item-price">₹${itemTotal.toLocaleString()}</div>
        `;

        cartSummaryContainer.appendChild(cartItemElement);
    });

    if (cartItems.length > 3) {
        const moreItems = document.createElement('div');
        moreItems.className = 'cart-item-summary';
        moreItems.style.justifyContent = 'center';
        moreItems.innerHTML = `
            <div style="color: #6b7280; font-size: 0.9rem;">
                +${cartItems.length - 3} more items in cart
            </div>
        `;
        cartSummaryContainer.appendChild(moreItems);
    }
}

async function loadWishlist() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;

    // Simulate async fetch
    const wishlistItemsIds = await new Promise((resolve) => {
        setTimeout(() => resolve(wishlist), 200);
    });

    if (wishlistItemsIds.length === 0) {
        wishlistGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-heart"></i>
                <p>No items in wishlist</p>
            </div>
        `;
        return;
    }

    wishlistGrid.innerHTML = '';
    const displayItemsIds = wishlistItemsIds;

    displayItemsIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cheapestPlatform = getCheapestPrice(product);
        const cheapestPrice = product.platforms[cheapestPlatform].price;

        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.onclick = () => viewProduct(productId);

        wishlistItem.innerHTML = `
            <div class="wishlist-item-icon">${getProductImageHTML(product.image)}</div>
            <div class="wishlist-item-name">${product.name}</div>
            <div class="wishlist-item-price">₹${cheapestPrice.toLocaleString()}</div>
        `;

        wishlistGrid.appendChild(wishlistItem);
    });
}

async function loadRecentlyViewed() {
    const recentlyViewedGrid = document.getElementById('recentlyViewedGrid');
    if (!recentlyViewedGrid) return;

    // Mock recently viewed data (simulated fetch)
    const recentlyViewedIds = await new Promise((resolve) => {
        setTimeout(() => resolve([1, 2, 3, 4]), 250);
    });

    if (recentlyViewedIds.length === 0) {
        recentlyViewedGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-eye"></i>
                <p>No recently viewed items</p>
            </div>
        `;
        return;
    }

    recentlyViewedGrid.innerHTML = '';
    recentlyViewedIds.slice(0, 4).forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cheapestPlatform = getCheapestPrice(product);
        const cheapestPrice = product.platforms[cheapestPlatform].price;

        const recentlyViewedItem = document.createElement('div');
        recentlyViewedItem.className = 'recently-viewed-item';
        recentlyViewedItem.onclick = () => viewProduct(productId);

        recentlyViewedItem.innerHTML = `
            <div class="recently-viewed-item-icon">${getProductImageHTML(product.image)}</div>
            <div class="recently-viewed-item-name">${product.name}</div>
            <div class="recently-viewed-item-price">₹${cheapestPrice.toLocaleString()}</div>
        `;

        recentlyViewedGrid.appendChild(recentlyViewedItem);
    });
}

function loadPriceAlerts() {
    const priceAlertsContainer = document.getElementById('priceAlerts');

    // Mock price alerts data
    const priceAlerts = [
        {
            productId: 1,
            targetPrice: 130000,
            currentPrice: 132900
        },
        {
            productId: 3,
            targetPrice: 110000,
            currentPrice: 112900
        }
    ];

    if (priceAlerts.length === 0) {
        priceAlertsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <p>No price alerts set</p>
            </div>
        `;
        return;
    }

    priceAlertsContainer.innerHTML = '';

    priceAlerts.forEach((alert, index) => {
        const product = products.find(p => p.id === alert.productId);
        if (!product) return;

        const priceAlert = document.createElement('div');
        priceAlert.className = 'price-alert';

        const isBelow = alert.currentPrice <= alert.targetPrice;

        priceAlert.innerHTML = `
            <div class="alert-info">
                <div class="alert-icon">
                    <i class="fas fa-bell${isBelow ? ' fa-shake' : ''}"></i>
                </div>
                <div class="alert-details">
                    <h4>${product.name}</h4>
                    <div class="alert-target">
                        Target: ₹${alert.targetPrice.toLocaleString()} | 
                        Current: ₹${alert.currentPrice.toLocaleString()}
                        ${isBelow ? ' 🎉 Target reached!' : ''}
                    </div>
                </div>
            </div>
            <div class="alert-actions">
                ${isBelow ? `
                    <button class="btn btn-primary btn-sm" onclick="viewProduct(${alert.productId})">
                        <i class="fas fa-eye"></i> View Deal
                    </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="removeAlert(this)">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `;

        priceAlertsContainer.appendChild(priceAlert);
    });
}

function loadUserPreferences() {
    if (currentUser.preferences) {
        const prefs = currentUser.preferences;

        if (prefs.preferredPlatform) {
            document.getElementById('preferredPlatform').value = prefs.preferredPlatform;
        }


    }
}

function saveUserPreferences() {
    const preferences = {
        preferredPlatform: document.getElementById('preferredPlatform')?.value || 'amazon',
        emailNotifications: document.getElementById('emailNotifications')?.checked || false,
        smsNotifications: document.getElementById('smsNotifications')?.checked || false,
        theme: 'dark' // Fixed to dark theme as system default
    };

    currentUser.preferences = { ...currentUser.preferences, ...preferences };
    updateUserInStorage(currentUser);

    showNotification('All preferences saved successfully!', 'success');
}



function switchView(viewName) {
    // Update menu items
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById(`nav-${viewName}`);
    if (navItem) navItem.classList.add('active');

    // Update view sections
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    const viewSection = document.getElementById(`view-${viewName}`);
    if (viewSection) viewSection.classList.add('active');

    // Update page title
    const titleMap = {
        'overview': 'Dashboard Overview',
        'orders': 'My Orders',
        'wishlist': 'My Wishlist',
        'categories': 'Browse Categories',
        'settings': 'Account Settings'
    };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titleMap[viewName] || 'Dashboard';

    // Close mobile menu if open
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && navMenu.classList.contains('mobile-open')) {
        toggleMobileMenu();
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-open');
}

function addPriceAlert() {
    showNotification('Price alert functionality would be implemented here', 'info');
}

function removeAlert(button) {
    if (confirm('Are you sure you want to remove this alert?')) {
        const alertCard = button.closest('.price-alert');
        alertCard.style.opacity = '0';
        setTimeout(() => {
            alertCard.remove();

            // Check if empty
            const container = document.getElementById('priceAlerts');
            if (container.children.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-bell"></i>
                        <p>No price alerts set</p>
                    </div>
                `;
            }

            showNotification('Price alert removed!', 'success');
        }, 300);
    }
}

function viewProduct(productId) {
    localStorage.setItem('selectedProduct', productId);
    window.location.href = 'comparison.html';
}

function renderCategoriesInDashboard() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = '';
    categories.forEach(cat => {
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
                    <span class="stat-text">Avg. 35% Off</span>
                    <a href="javascript:void(0)" class="explore-link" onclick="handleCategoryExplore('${cat.id}', '${cat.name}')">Explore <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function handleCategoryExplore(catId, catName) {
    // In actual app, this would filter products or redirect to comparison with filter
    localStorage.setItem('filteredCategory', catId);
    window.location.href = 'comparison.html';
}
