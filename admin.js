/**
 * admin.js
 * Logic for the Admin Dashboard to manage products and reflect changes to localStorage.
 */
/* global products, categories, users, admin, getCheapestPrice, getProductImageHTML, saveUsers, saveProducts */

// Track activity for the "Reflective" log
const defaultActivities = [
    { id: 1, action: 'Disabled', product: 'System Setting: Email Notifications', time: '09:42 PM', icon: 'fa-bell-slash', color: '#ef4444' },
    { id: 2, action: 'Deleted', product: 'xyz', time: '09:42 PM', icon: 'fa-trash', color: '#ef4444' },
    { id: 3, action: 'Deleted', product: 'hgfd', time: '04:30 PM', icon: 'fa-trash', color: '#ef4444' },
    { id: 4, action: 'Deleted', product: 'gdsasdfbn', time: '04:30 PM', icon: 'fa-trash', color: '#ef4444' },
    { id: 5, action: 'Added', product: 'gdsasdfbn', time: '04:30 PM', icon: 'fa-plus-circle', color: '#10b981' },
    { id: 6, action: 'Added', product: 'hgfd', time: '04:30 PM', icon: 'fa-plus-circle', color: '#10b981' },
    { id: 7, action: 'Added', product: 'gfd', time: '04:30 PM', icon: 'fa-plus-circle', color: '#10b981' },
    { id: 8, action: 'Added', product: 'gfd', time: '04:25 PM', icon: 'fa-plus-circle', color: '#10b981' }
];

// Manage administrative activity logs
let activities = [];
try {
    activities = JSON.parse(localStorage.getItem('adminActivities')) || defaultActivities;
} catch (e) {
    console.error("Error parsing adminActivities, usage default", e);
    activities = defaultActivities;
}
localStorage.setItem('adminActivities', JSON.stringify(activities));

document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin panel DOM loaded');

    checkAdminAuth();
    updateAdminStats();
    renderActivityLog();
    updateAdminProfileUI();

    // Initialize default view - start with inventory to show add product functionality
    switchView('inventory');
    renderAdminTable();
    renderDashboardSummary();
    renderCategoriesManagement();

    // Global listener for settings switches
    setupSwitchListeners();

    // Form Submission Handler
    const form = document.getElementById('productForm');
    if (form) {
        form.setAttribute('novalidate', '');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted - calling saveProductChanges');
            saveProductChanges();
        });
        console.log('Form submission handler attached');
    } else {
        console.error('Product form not found!');
    }

    // Ensure Add Product button works - multiple bindings for safety
    // Ensure Add Product button works
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.onclick = null; // Clear inline handler to prevent double trigger
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add Product button clicked');
            openAddModal();
        });
    }

    console.log('Admin panel initialized successfully');
});

// Protect admin routes
function checkAdminAuth() {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        console.error("Auth check failed", e);
        localStorage.removeItem('currentUser'); // Clear bad data
    }
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
    }
}

function uploadAdminImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                const user = JSON.parse(localStorage.getItem('currentUser'));
                user.profileImage = imageUrl;
                updateUserInStorage(user);
                updateAdminProfileUI();
                alert("Admin profile image updated!");
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function updateAdminProfileUI() {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) { }
    const avatarImg = document.querySelector('.user-avatar img');
    const avatarDiv = document.querySelector('.user-avatar');

    if (user) {
        const src = user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

        if (avatarImg) {
            avatarImg.src = src;
        } else if (avatarDiv) {
            avatarDiv.innerHTML = `<img src="${src}" alt="Admin" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
    }
}

function addActivityLog(action, productName) {
    const activity = {
        id: Date.now(),
        action: action,
        product: productName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: action === 'Added' ? 'fa-plus-circle' : (action === 'Deleted' ? 'fa-trash' : 'fa-edit'),
        color: action === 'Added' ? '#10b981' : (action === 'Deleted' ? '#ef4444' : '#2563eb')
    };

    activities.unshift(activity);
    if (activities.length > 8) activities.pop(); // Keep last 8
    localStorage.setItem('adminActivities', JSON.stringify(activities));
    renderActivityLog();
}

function handleImagePreview(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const src = e.target.result;
        const img = new Image();
        img.onload = function () {
            const max = 256;
            const ratio = Math.min(max / img.width, max / img.height, 1);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            document.getElementById('edit-image-data').value = compressed;
            const preview = document.getElementById('image-preview');
            preview.innerHTML = `<img src="${compressed}" style="width: 100%; height: 100%; object-fit: cover;">`;
        };
        img.src = src;
    };
    reader.readAsDataURL(file);
}

function renderActivityLog() {
    const logContainer = document.getElementById('activity-log');
    if (!logContainer) return;

    if (activities.length === 0) {
        logContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-gray); padding-top: 5rem;">
                <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No recent changes detected.</p>
            </div>
        `;
        return;
    }

    logContainer.innerHTML = activities.map(act => `
        <div onclick="handleActivityClick('${act.action.replace(/'/g, "\\'")}', '${act.product.replace(/'/g, "\\'")}')" 
             style="display: flex; gap: 1rem; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;"
             onmouseover="this.style.background='rgba(37, 99, 235, 0.1)'; this.style.transform='translateX(8px)'"
             onmouseout="this.style.background='transparent'; this.style.transform='translateX(0)'">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: ${act.color}22; color: ${act.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.9rem; border: 1px solid ${act.color}33;">
                <i class="fas ${act.icon}"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                    <p style="font-size: 0.95rem; margin: 0; font-weight: 600; color: white;">
                        <span style="color: ${act.color}; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px; margin-right: 0.5rem;">${act.action}</span> 
                        ${act.product}
                    </p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-gray);">
                    <span>${act.time}</span>
                    <span style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></span>
                    <span style="color: var(--accent-blue); opacity: 0.8;">Automatic Reflection</span>
                </div>
            </div>
            <div style="align-self: center; margin-left: auto; color: var(--text-gray); opacity: 0.5;">
                <i class="fas fa-chevron-right" style="font-size: 0.7rem;"></i>
            </div>
        </div>
    `).join('');
}

function handleActivityClick(action, details) {
    const dLower = details.toLowerCase();

    if (dLower.includes('category:')) {
        switchView('categories');
    } else if (dLower.includes('setting') || dLower.includes('notif') || dLower.includes('portal')) {
        switchView('settings');
    } else if (dLower.includes('user') || dLower.includes('role')) {
        switchView('customers');
    } else {
        switchView('inventory');
    }
}


function renderAdminTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    products.forEach(product => {
        if (!product || !product.platforms) return;

        const amazon = product.platforms.amazon;
        const flipkart = product.platforms.flipkart;

        let bestPrice = 0;
        let platformName = 'N/A';
        let isAvailable = false;

        if (amazon && amazon.available) {
            bestPrice = amazon.price;
            platformName = 'Amazon';
            isAvailable = true;
        } else if (flipkart && flipkart.available) {
            bestPrice = flipkart.price;
            platformName = 'Flipkart';
            isAvailable = true;
        } else {
            bestPrice = (amazon ? amazon.price : 0) || (flipkart ? flipkart.price : 0);
            platformName = amazon ? 'Amazon' : (flipkart ? 'Flipkart' : 'None');
        }

        // Handle image or emoji
        const imgDisplay = getProductImageHTML(product.image);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:1rem;">
                    <div style="width:40px; height:40px; background:#0B0E14; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; border:1px solid var(--border-color); overflow: hidden;">${imgDisplay}</div>
                    <div>
                        <div style="font-weight: 600; color: white;">${product.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-gray);">ID: #${product.id.toString().slice(-4)}</div>
                    </div>
                </div>
            </td>
            <td style="text-transform: capitalize; color: var(--text-gray);">${product.category}</td>
            <td style="font-weight: 700; color: var(--accent-blue);">₹${bestPrice.toLocaleString()}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${isAvailable ? 'checked' : ''} onchange="toggleProductStock(${product.id}, this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <div style="display: flex; gap: 0.4rem;">
                    <button class="action-btn" onclick="viewProductAsUser(${product.id})" title="View on User Site"><i class="fas fa-eye"></i></button>
                    <button class="action-btn btn-edit" onclick="openEditModal(${product.id})"><i class="fas fa-pen"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewProductAsUser(id) {
    // Set the selected product in storage so comparison.html loads it immediately
    localStorage.setItem('selectedProduct', id);
    // Open in new tab
    window.open('comparison.html', '_blank');
}

function updateAdminStats() {
    const total = products.length;
    const inactive = products.filter(p => !p.platforms.amazon?.available && !p.platforms.flipkart?.available).length;

    let totalValue = 0;
    let totalDiscount = 0;
    let countWithDiscount = 0;

    products.forEach(p => {
        if (p.platforms.amazon) {
            totalValue += p.platforms.amazon.price;
            if (p.platforms.amazon.discount > 0) {
                totalDiscount += p.platforms.amazon.discount;
                countWithDiscount++;
            }
        }
    });

    const avgDiscount = countWithDiscount > 0 ? Math.round(totalDiscount / countWithDiscount) : 0;

    // Calculate user statistics
    const totalUsers = users.filter(u => u.role !== 'admin').length; // Exclude admin users from count
    const totalAllUsers = users.length; // All users including admins

    if (document.getElementById('stat-total')) document.getElementById('stat-total').textContent = total;
    if (document.getElementById('stat-inactive')) document.getElementById('stat-inactive').textContent = inactive;
    if (document.getElementById('stat-value')) document.getElementById('stat-value').textContent = `₹${(totalValue / 100000).toFixed(1)}L`;
    if (document.getElementById('stat-avg-discount')) document.getElementById('stat-avg-discount').textContent = `${avgDiscount}%`;

    // Update user count stat if element exists
    const userStatElement = document.getElementById('stat-users');
    if (userStatElement) {
        userStatElement.textContent = totalUsers;
    }
}

// --- Modal Logic ---
const modal = document.getElementById('productModal');
let currentEditingId = null;
let isAddingNew = false;

function openAddModal() {
    console.log('openAddModal called');

    isAddingNew = true;
    currentEditingId = null;

    // Get the modal element
    const modal = document.getElementById('productModal');
    if (!modal) {
        console.error('Product modal not found!');
        alert('Error: Product modal not found. Please refresh the page.');
        return;
    }

    // Reset the form completely
    const form = document.getElementById('productForm');
    if (form) {
        form.reset();
        console.log('Form reset');
    } else {
        console.error('Product form not found!');
    }

    // Set modal title
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = "Add New Product";
    }

    // Reset image preview
    const imagePreview = document.getElementById('image-preview');
    const imageData = document.getElementById('edit-image-data');
    if (imagePreview) imagePreview.innerHTML = '📦';
    if (imageData) imageData.value = '📦';

    // Set default values
    const categorySelect = document.getElementById('edit-category');
    const stockAmazon = document.getElementById('edit-stock-amazon');
    const stockFlipkart = document.getElementById('edit-stock-flipkart');

    if (categorySelect) categorySelect.value = 'electronics';
    if (stockAmazon) stockAmazon.value = 'true';
    if (stockFlipkart) stockFlipkart.value = 'true';

    // Show the modal
    modal.style.display = 'flex';
    console.log('Modal should now be visible');

    // Focus on the name field
    setTimeout(() => {
        const nameField = document.getElementById('edit-name');
        if (nameField) {
            nameField.focus();
            console.log('Name field focused');
        }
    }, 100);
}

function openEditModal(productId) {
    isAddingNew = false;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentEditingId = productId;
    document.getElementById('modalTitle').textContent = "Update Product";
    document.getElementById('edit-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-image-data').value = product.image;
    document.getElementById('edit-category').value = product.category || 'electronics';
    (function () { var el = document.getElementById('edit-target-price'); if (el) { el.value = product.targetPrice || ''; } })();

    const preview = document.getElementById('image-preview');
    if (product.image && product.image.includes('data:image')) {
        preview.innerHTML = `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        preview.innerHTML = product.image || '📦';
    }
    if (product.platforms.amazon) {
        document.getElementById('edit-mrp-amazon').value = product.platforms.amazon.mrp || '';
        document.getElementById('edit-price-amazon').value = product.platforms.amazon.price;
        document.getElementById('edit-stock-amazon').value = product.platforms.amazon.available ? 'true' : 'false';
        document.getElementById('edit-url-amazon').value = product.platforms.amazon.url || '';
        document.getElementById('edit-desc-amazon').value = product.platforms.amazon.description || '';
    } else {
        document.getElementById('edit-mrp-amazon').value = '';
        document.getElementById('edit-price-amazon').value = '';
        document.getElementById('edit-stock-amazon').value = 'false';
        document.getElementById('edit-url-amazon').value = '';
        document.getElementById('edit-desc-amazon').value = '';
    }

    if (product.platforms.flipkart) {
        document.getElementById('edit-mrp-flipkart').value = product.platforms.flipkart.mrp || '';
        document.getElementById('edit-price-flipkart').value = product.platforms.flipkart.price;
        document.getElementById('edit-stock-flipkart').value = product.platforms.flipkart.available ? 'true' : 'false';
        document.getElementById('edit-url-flipkart').value = product.platforms.flipkart.url || '';
        document.getElementById('edit-desc-flipkart').value = product.platforms.flipkart.description || '';
    } else {
        document.getElementById('edit-mrp-flipkart').value = '';
        document.getElementById('edit-price-flipkart').value = '';
        document.getElementById('edit-stock-flipkart').value = 'false';
        document.getElementById('edit-url-flipkart').value = '';
        document.getElementById('edit-desc-flipkart').value = '';
    }



    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    currentEditingId = null;
    isAddingNew = false;
}

// Product management (Add/Edit)
function saveProductChanges() {
    console.log("saveProductChanges called");
    console.log("saveProductChanges called");
    try {
        const nameInput = document.getElementById('edit-name');
        if (!nameInput) {
            console.error("Critical: Name input not found");
            return;
        }
        const name = nameInput.value;
        const imageData = document.getElementById('edit-image-data').value || '📦';
        const safeImage = (typeof imageData === 'string' && imageData.startsWith('data:image') && imageData.length > 200000) ? '📦' : imageData;
        const category = document.getElementById('edit-category').value;
        const mrpAmazon = parseInt(document.getElementById('edit-mrp-amazon').value) || 0;
        const priceAmz = parseInt(document.getElementById('edit-price-amazon').value) || 0;
        const stockAmz = document.getElementById('edit-stock-amazon').value === 'true';
        const urlAmazon = document.getElementById('edit-url-amazon').value;
        const descAmazon = document.getElementById('edit-desc-amazon').value;

        const mrpFlipkart = parseInt(document.getElementById('edit-mrp-flipkart').value) || 0;
        const priceFlip = parseInt(document.getElementById('edit-price-flipkart').value) || 0;
        const stockFlip = document.getElementById('edit-stock-flipkart').value === 'true';
        const urlFlipkart = document.getElementById('edit-url-flipkart').value;
        const descFlipkart = document.getElementById('edit-desc-flipkart').value;

        const discountAmz = mrpAmazon > 0 ? Math.round(((mrpAmazon - priceAmz) / mrpAmazon) * 100) : 0;
        const discountFlip = mrpFlipkart > 0 ? Math.round(((mrpFlipkart - priceFlip) / mrpFlipkart) * 100) : 0;

        if (!name || name.trim() === '') {
            alert('Please enter a product name.');
            return;
        }

        // Validation: At least one platform should have a price
        if (priceAmz <= 0 && priceFlip <= 0) {
            alert('Please enter at least one valid price (Amazon or Flipkart).');
            return;
        }

        // Ensure global products array exists
        if (typeof products === 'undefined' || !Array.isArray(products)) {
            console.error("Products array missing, initializing new array");
            products = [];
        }

        // Fallback: If currentEditingId is null, assume we are adding a new product
        if (isAddingNew || currentEditingId === null) {
            console.log("Adding new product...");
            const newProduct = {
                id: Date.now(),
                name: name,
                category: category,
                description: descAmazon || descFlipkart || 'Product added via admin panel',
                image: safeImage,
                trending: true,
                platforms: {
                    amazon: {
                        mrp: mrpAmazon,
                        price: priceAmz,
                        rating: 4.5,
                        discount: Math.max(0, discountAmz),
                        delivery: "1 day",
                        available: stockAmz && priceAmz > 0,
                        url: urlAmazon,
                        description: descAmazon
                    },
                    flipkart: {
                        mrp: mrpFlipkart,
                        price: priceFlip,
                        rating: 4.2,
                        discount: Math.max(0, discountFlip),
                        delivery: "2 days",
                        available: stockFlip && priceFlip > 0,
                        url: urlFlipkart,
                        description: descFlipkart
                    }
                }
            };
            products.push(newProduct);
            addActivityLog('Added', name);
            alert(`Product "${name}" has been successfully added to the inventory!`);
        } else {
            console.log("Editing product ID:", currentEditingId);
            const index = products.findIndex(p => p.id === currentEditingId);
            if (index === -1) {
                console.warn('Product for editing not found, adding as new instead.');
                isAddingNew = true;
                saveProductChanges(); // Recursive call to add as new
                return;
            }

            products[index].name = name;
            products[index].image = safeImage;
            products[index].category = category;

            // Amazon
            if (!products[index].platforms.amazon) products[index].platforms.amazon = {};
            products[index].platforms.amazon.mrp = mrpAmazon;
            products[index].platforms.amazon.price = priceAmz;
            products[index].platforms.amazon.available = stockAmz && priceAmz > 0;
            products[index].platforms.amazon.url = urlAmazon;
            products[index].platforms.amazon.description = descAmazon;
            products[index].platforms.amazon.discount = Math.max(0, discountAmz);

            // Flipkart
            if (!products[index].platforms.flipkart) products[index].platforms.flipkart = {};
            products[index].platforms.flipkart.mrp = mrpFlipkart;
            products[index].platforms.flipkart.price = priceFlip;
            products[index].platforms.flipkart.available = stockFlip && priceFlip > 0;
            products[index].platforms.flipkart.url = urlFlipkart;
            products[index].platforms.flipkart.description = descFlipkart;
            products[index].platforms.flipkart.discount = Math.max(0, discountFlip);

            addActivityLog('Updated', name);
            alert(`Product "${name}" has been successfully updated!`);
        }

        saveProducts(); // Save to localStorage
        renderAdminTable(); // Refresh UI
        updateAdminStats();
        closeModal();
    } catch (e) {
        console.error("Critical error in saveProductChanges:", e);
        alert("An error occurred while saving the product. Check console for details.");
    }
}



function deleteProduct(id) {
    // Ensure id is compared correctly regardless of being string or number
    const index = products.findIndex(p => p.id == id);

    if (index === -1) {
        console.error("Product not found for deletion:", id);
        return;
    }

    const prodName = products[index].name;

    if (confirm(`Are you sure you want to permanently delete "${prodName}"? This action cannot be undone and will reflect immediately on the user dashboard.`)) {
        // Remove from the global products array
        products.splice(index, 1);

        // Persist the change to localStorage
        saveProducts();

        // Log the activity
        addActivityLog('Deleted', prodName);

        // Refresh the UI
        renderAdminTable();
        updateAdminStats();

        console.log(`Successfully deleted product: ${prodName} (ID: ${id})`);
    }
}

function calculatePlatformDiscount(platform) {
    const mrp = parseInt(document.getElementById(`edit-mrp-${platform}`).value) || 0;
    const price = parseInt(document.getElementById(`edit-price-${platform}`).value) || 0;

    if (mrp > 0 && price > 0 && mrp > price) {
        const discount = Math.round(((mrp - price) / mrp) * 100);
        console.log(`${platform} calculated discount: ${discount}%`);
    }
}

// --- View Switching Logic ---

function switchView(viewName) {
    const views = ['dashboard', 'inventory', 'customers', 'analytics', 'alerts', 'settings', 'categories'];

    // Hide all views
    views.forEach(v => {
        const el = document.getElementById(`${v}-view`);
        if (el) el.style.display = 'none';
    });

    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-link').forEach(n => n.classList.remove('active'));

    const pageTitle = document.getElementById('page-title');
    const pageDesc = document.getElementById('page-desc');
    const addProductBtn = document.getElementById('add-product-btn');

    if (viewName === 'dashboard') {
        document.getElementById('dashboard-view').style.display = 'block';
        document.getElementById('nav-dashboard').classList.add('active');
        pageTitle.textContent = 'Control Center';
        pageDesc.textContent = 'Administrative overview and operational events.';
        if (addProductBtn) addProductBtn.style.display = 'none';
    }
    else if (viewName === 'inventory') {
        document.getElementById('inventory-view').style.display = 'block';
        document.getElementById('nav-inventory').classList.add('active');
        pageTitle.textContent = 'Inventory Management';
        pageDesc.textContent = 'Monitor and control your product catalog in real-time.';
        if (addProductBtn) addProductBtn.style.display = 'inline-flex';
    }
    else if (viewName === 'customers') {
        document.getElementById('customers-view').style.display = 'block';
        document.getElementById('nav-customers').classList.add('active');
        pageTitle.textContent = 'Customer Relations';
        pageDesc.textContent = 'Management of user accounts and platform permissions.';
        if (addProductBtn) addProductBtn.style.display = 'none';
        renderCustomersTable();
    }
    else if (viewName === 'categories') {
        document.getElementById('categories-view').style.display = 'block';
        document.getElementById('nav-categories').classList.add('active');
        pageTitle.textContent = 'Marketplace Taxonomy';
        pageDesc.textContent = 'Organize and scale your product catalog categories.';
        if (addProductBtn) addProductBtn.style.display = 'none';
        renderCategoriesManagement();
    }
    else if (viewName === 'settings') {
        document.getElementById('settings-view').style.display = 'block';
        document.getElementById('nav-settings').classList.add('active');
        pageTitle.textContent = 'Portal Preferences';
        pageDesc.textContent = 'Manage platform identity, brand visuals, and localized settings.';
        if (addProductBtn) addProductBtn.style.display = 'none';
    }
}

function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // 'users' is available globally from data.js
    if (typeof users === 'undefined') {
        console.error("Users data not loaded");
        return;
    }

    users.forEach(user => {
        const tr = document.createElement('tr');

        // Avatar
        const avatarSrc = user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <img src="${avatarSrc}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                    <div style="font-weight: 500; color: white;">${user.name}</div>
                </div>
            </td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-inactive'}" style="background: ${user.role === 'admin' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(107, 114, 128, 0.2)'}; color: ${user.role === 'admin' ? '#60a5fa' : '#9ca3af'};">
                    ${user.role.toUpperCase()}
                </span>
            </td>
            <td style="color: var(--text-gray);">${user.email}</td>
            <td>
                 <div style="font-size: 0.8rem; color: var(--text-gray);">
                    <div style="margin-bottom:2px"><i class="fas fa-calendar-alt"></i> Joined: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
                    <div><i class="fas fa-map-marker-alt"></i> ID: #${(user.id || '000').toString().slice(-4)}</div>
                 </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function logoutAdmin() {
    localStorage.removeItem('currentUser');
    window.location.href = 'admin_login.html';
}

function deleteUser(email) {
    if (confirm(`Are you sure you want to delete user ${email}? This cannot be undone.`)) {
        const index = users.findIndex(u => u.email === email);
        if (index > -1) {
            users.splice(index, 1);
            saveUsers(); // From data.js
            renderCustomersTable();
            // Optional: alert('User deleted successfully.');
        }
    }
}

function setupSwitchListeners() {
    document.addEventListener('change', (e) => {
        if (e.target.closest('.switch input')) {
            const row = e.target.closest('div[style*="background: rgba(255,255,255,0.03)"]');
            let text = "System Setting";
            if (row) {
                const title = row.querySelector('h4');
                if (title) text = title.innerText;
            } else {
                const tr = e.target.closest('tr');
                if (tr) {
                    const nameEl = tr.querySelector('div[style*="font-weight: 600"]');
                    if (nameEl) text = nameEl.innerText;
                }
            }
            const action = e.target.checked ? 'Enabled' : 'Disabled';
            addActivityLog(action, `${text}`);
        }
    });
}

function toggleProductStock(productId, isAvailable) {
    const product = products.find(p => p.id === productId);
    if (product) {
        if (product.platforms.amazon) product.platforms.amazon.available = isAvailable;
        if (product.platforms.flipkart) product.platforms.flipkart.available = isAvailable;
        saveProducts();
        addActivityLog(isAvailable ? 'Restocked' : 'Deactivated', product.name);
        updateAdminStats();
    }
}

// Unused: Dashboard summary removed as per user request




// Category Modal Logic
let customCategories = [];
try {
    customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
} catch (e) {
    customCategories = [];
}

function openAddCategoryModal() {
    document.getElementById('categoryModal').style.display = 'flex';
    document.getElementById('new-category-name').value = '';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

function saveCategory() {
    const name = document.getElementById('new-category-name').value;
    const icon = document.getElementById('new-category-icon').value || 'fas fa-tag';
    if (name) {
        customCategories.push({ name, icon, count: 0 });
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
        renderCategoriesManagement();
        closeCategoryModal();
        addActivityLog('Added', `Category: ${name}`);
        alert('Category added successfully!');
    }
}

function deleteCategory(name) {
    if (confirm(`Are you sure you want to delete the category "${name}"? Products in this category will be moved to "Electronics" to avoid data loss.`)) {
        // 1. Reassign products in this category
        const targetCatID = name.toLowerCase().trim();
        products.forEach(p => {
            if (p.category && (p.category.toLowerCase() === targetCatID || p.category.toLowerCase() === name.toLowerCase())) {
                p.category = 'electronics';
            }
        });
        saveProducts();

        // 2. Remove from customCategories
        customCategories = customCategories.filter(c => c.name.toLowerCase() !== name.toLowerCase());
        localStorage.setItem('customCategories', JSON.stringify(customCategories));

        // 3. Update Activity Log
        addActivityLog('Deleted', `Category: ${name}`);

        // 4. Refresh UI
        renderCategoriesManagement();
        renderAdminTable();
        updateAdminStats();
    }
}

function renderCategoriesManagement() {
    const container = document.getElementById('categories-manage-list');
    if (!container) return;

    // Derived from products
    const productCategories = [...new Set(products.map(p => p.category))];

    const allCats = [];

    // Combine derived and custom, then deduplicate
    const uniqueCatNames = new Set([
        ...productCategories,
        ...customCategories.map(c => c.name.toLowerCase())
    ]);

    uniqueCatNames.forEach(catID => {
        if (!catID) return;

        // Find existing data
        const customMatch = customCategories.find(c => c.name.toLowerCase() === catID.toLowerCase());
        const productCount = products.filter(p => (p.category || '').toLowerCase() === catID.toLowerCase()).length;

        allCats.push({
            name: customMatch ? customMatch.name : catID,
            icon: findBestIcon(catID, customMatch ? customMatch.icon : null),
            count: productCount
        });
    });

    container.innerHTML = allCats.map(cat => `
        <div style="background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(37, 99, 235, 0.1); color: var(--accent-blue); display: flex; align-items: center; justify-content: center;">
                    <i class="${cat.icon.includes('fa-') ? (cat.icon.startsWith('fa') ? cat.icon : 'fas ' + cat.icon) : 'fas fa-tag'}"></i>
                </div>
                <div>
                    <h4 style="margin: 0; text-transform: capitalize;">${cat.name}</h4>
                    <p style="margin: 0; font-size: 0.75rem; color: var(--text-gray);">${cat.count} Products</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.8rem;">
                <label class="switch" title="Toggle Visibility">
                    <input type="checkbox" checked>
                    <span class="slider"></span>
                </label>
                <button class="action-btn btn-delete" onclick="deleteCategory('${cat.name}')" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-trash-alt" style="font-size: 0.8rem;"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function findBestIcon(catName, customIcon) {
    if (customIcon) return customIcon;
    return getCategoryIcon(catName);
}

function getCategoryIcon(cat) {
    const c = (cat || '').toLowerCase();
    const icons = {
        'electronics': 'fa-laptop',
        'fashion': 'fa-tshirt',
        'home': 'fa-home',
        'grocery': 'fa-shopping-basket',
        'beauty': 'fa-sparkles',
        'fitness': 'fa-dumbbell',
        'sports': 'fa-dumbbell',
        'sports & fitness': 'fa-dumbbell',
        'toys': 'fa-puzzle-piece',
        'automotive': 'fa-car'
    };
    return icons[c] || 'fa-tag';
}

function showAdminProfile() {
    const modal = document.getElementById('adminProfileModal');
    if (modal) modal.style.display = 'flex';
}

function closeAdminProfile() {
    const modal = document.getElementById('adminProfileModal');
    if (modal) modal.style.display = 'none';
}

function togglePasswordChange() {
    const section = document.getElementById('password-change-section');
    if (section.style.display === 'none') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
        document.getElementById('new-admin-password').value = '';
        document.getElementById('confirm-admin-password').value = '';
    }
}

function saveNewAdminPassword() {
    const newPass = document.getElementById('new-admin-password').value;
    const confirmPass = document.getElementById('confirm-admin-password').value;

    if (!newPass || !confirmPass) {
        alert("Please enter both password fields.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Passwords do not match!");
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
        alert("Strong password required: 8+ characters, including uppercase, lowercase, number, and special character (@$!%*?&).");
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        user.password = newPass;

        // Update in data.js global storage function
        if (typeof updateUserInStorage === 'function') {
            updateUserInStorage(user);
        } else {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }

        alert("Password updated successfully!");
        togglePasswordChange();
        addActivityLog('Security', 'Admin password changed');
    } else {
        alert("Error: No active user found.");
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const logoData = e.target.result;
            document.getElementById('set-platform-logo-data').value = logoData;

            // Update preview
            const container = document.getElementById('logo-preview-container');
            container.innerHTML = `<img src="${logoData}" style="width: 100%; height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    }
}

function updatePortalSettings() {
    console.log("Saving Portal Settings...");
    try {
        const portalNameEl = document.getElementById('set-platform-name');
        const portalColorEl = document.getElementById('set-platform-color');
        const currencyEl = document.getElementById('set-currency');
        const portalLogoEl = document.getElementById('set-platform-logo-data');

        if (!portalNameEl || !portalColorEl || !currencyEl) {
            console.error("Critical error: Setting input elements not found in DOM.");
            alert("Settings elements not found. Please refresh the page.");
            return;
        }

        const portalName = portalNameEl.value;
        const portalColor = portalColorEl.value;
        const currency = currencyEl.value;
        const portalLogo = portalLogoEl ? portalLogoEl.value : (JSON.parse(localStorage.getItem('portalSettings'))?.portalLogo || "");

        const settings = {
            portalName,
            portalColor,
            currency,
            portalLogo,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('portalSettings', JSON.stringify(settings));
        console.log("Settings saved to localStorage:", settings);

        // Update UI elements across the admin panel
        const brands = document.querySelectorAll('.nav-brand span, .brand-logo span');
        brands.forEach(b => {
            if (b.innerText.includes('Panel')) {
                b.innerHTML = `Admin<span style="color: ${portalColor};">Panel</span>`;
            } else {
                b.textContent = portalName;
            }
        });

        const adminPanelTitle = document.querySelector('.user-info h3');
        if (adminPanelTitle) adminPanelTitle.textContent = portalName;

        // Update logo in Sidebar if exists
        const sidebarLogo = document.querySelector('.nav-brand div');
        if (sidebarLogo && portalLogo) {
            sidebarLogo.innerHTML = `<img src="${portalLogo}" style="width: 100%; height: 100%; object-fit: contain;">`;
            sidebarLogo.style.background = 'transparent';
        }

        alert("Branding applied! Portal identity has been updated globally.");
        addActivityLog('Updated', `Portal Identity: ${portalName}`);

    } catch (error) {
        console.error("Failed to save settings:", error);
        alert("Error saving settings: " + error.message);
    }
}

function resetSettings() {
    if (confirm("Reset all settings to default values?")) {
        const name = document.getElementById('set-platform-name');
        const color = document.getElementById('set-platform-color');
        const currency = document.getElementById('set-currency');
        const logoData = document.getElementById('set-platform-logo-data');
        const preview = document.getElementById('logo-preview-container');

        if (name) name.value = "Smart Price Monitor";
        if (color) color.value = "#2563eb";
        if (currency) currency.value = "INR";
        if (logoData) logoData.value = "";
        if (preview) preview.innerHTML = `<i class="fas fa-shield-alt" id="logo-icon-placeholder" style="color: var(--accent-blue); font-size: 1.5rem;"></i>`;

        updatePortalSettings();
    }
}

// Ensure inline onclick handlers can access functions
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.deleteProduct = deleteProduct;
window.toggleProductStock = toggleProductStock;
window.calculatePlatformDiscount = calculatePlatformDiscount;
window.showAdminProfile = showAdminProfile;
window.closeAdminProfile = closeAdminProfile;
window.openAddCategoryModal = openAddCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.saveCategory = saveCategory;
window.uploadAdminImage = uploadAdminImage;
window.updatePortalSettings = updatePortalSettings;
window.deleteCategory = deleteCategory;
window.resetSettings = resetSettings;
window.handleActivityClick = handleActivityClick;
window.handleLogoUpload = handleLogoUpload;
window.handleImagePreview = handleImagePreview;

// Fallback binding for Add Product button
// Fallback removed

