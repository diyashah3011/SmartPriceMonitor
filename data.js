// Centralized data for products, users, and platforms
// Enhanced Product Database for SmartPrice Monitor

// Platform Information
const platforms = [
    {
        id: 'amazon',
        name: 'Amazon',
        logo: '🛒',
        url: 'https://www.amazon.in',
        description: 'The world\'s leading e-commerce platform, offering an unparalleled selection of electronics, home goods, books, and more with fast delivery.'
    },
    {
        id: 'flipkart',
        name: 'Flipkart',
        logo: '🛍️',
        url: 'https://www.flipkart.com',
        description: 'India\'s homegrown e-commerce giant, famous for its Big Billion Days and wide selection of smartphones and appliances.'
    }
];

// Categories
const categories = [
    { id: 'electronics', name: "Electronics", icon: "💻", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", deals: "", desc: "Laptops, smartphones, cameras, and the latest tech gadgets with the deepest discounts." },
    { id: 'fashion', name: "Fashion", icon: "👕", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80", deals: "", desc: "Premium brands, designer wear, and seasonal trends at outlet prices." },
    { id: 'home', name: "Home & Living", icon: "🏠", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80", deals: "", desc: "Smart home appliances, luxury furniture, and gardening tools for your perfect home." },
    { id: 'grocery', name: "Groceries", icon: "🍎", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80", deals: "", desc: "Stock up on pantry essentials and fresh produce with member-exclusive savings." },
    { id: 'beauty', name: "Beauty & Care", icon: "💄", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80", deals: "", desc: "Skincare, cosmetics, and wellness products from top global brands." },
    { id: 'automotive', name: "Automotive", icon: "🚗", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80", deals: "", desc: "Car parts, accessories, and maintenance tools for enthusiasts and daily drivers." },
    { id: 'toys', name: "Toys & Games", icon: "🧸", image: "https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&w=600&q=80", deals: "", desc: "The latest board games, collectibles, and educational toys for all ages." },
    { id: 'fitness', name: "Sports & Fitness", icon: "🏋️‍♂️", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80", deals: "", desc: "Equipment, apparel, and nutrition to help you hit your fitness goals." }
];

// Enhanced Product Database 
const defaultProducts = [
    {
        id: 101,
        name: "Quace Panda Silicon Night Lamp",
        category: "home",
        description: "Soft silicon panda nursery light with 7-color touch sensor. Perfect for kids' rooms, portable and USB rechargeable with long battery life.",
        image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 599, price: 301, rating: 4.5, discount: 50, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 599, price: 399, rating: 4.2, discount: 33, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 102,
        name: "Apple MacBook Air (M2 Chip)",
        category: "electronics",
        description: "Strikingly thin design, 13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD storage. Up to 18 hours of battery life.",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 114900, price: 94990, rating: 4.8, discount: 17, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 114900, price: 92990, rating: 4.7, discount: 19, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 103,
        name: "Nike Air Force 1 '07",
        category: "fashion",
        description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball OG that puts a fresh spin on what you know best: stitched overlays, bold colors and the perfect amount of flash.",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 8195, price: 7495, rating: 4.6, discount: 8, delivery: "3 days", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 8195, price: 7295, rating: 4.4, discount: 11, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 104,
        name: "Premium California Almonds - 1kg",
        category: "grocery",
        description: "High-quality, crunchy and nutritious California almonds. Vacuum packed for freshness and rich in protein and Vitamin E.",
        image: "https://images.unsplash.com/photo-1508840595368-1bd83dca6aae?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 1200, price: 899, rating: 4.5, discount: 25, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 1200, price: 849, rating: 4.3, discount: 29, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: false
    },
    {
        id: 105,
        name: "Fast Charging USB-C Cable",
        category: "electronics",
        description: "Durable braided nylon USB Type-C cable, supports fast charging and data transfer.",
        image: "https://images.unsplash.com/photo-1544866671-801262d189c4?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 499, price: 149, rating: 4.4, discount: 70, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 499, price: 129, rating: 4.3, discount: 74, delivery: "3 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 106,
        name: "Adjustable Mobile Stand",
        category: "electronics",
        description: "Foldable and adjustable desktop phone holder, anti-slip design.",
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 399, price: 99, rating: 4.2, discount: 75, delivery: "2 days", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 399, price: 119, rating: 4.1, discount: 70, delivery: "4 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 107,
        name: "Basic Wired Earphones",
        category: "electronics",
        description: "Comfortable in-ear wired earphones with deep bass and microphone.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 599, price: 199, rating: 4.0, discount: 66, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 599, price: 189, rating: 3.9, discount: 68, delivery: "3 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 108,
        name: "Apple iPhone 15 Pro Max (256 GB) - Natural Titanium",
        category: "electronics",
        description: "iPhone 15 Pro Max. Forged in titanium. Features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 159900, price: 148900, rating: 4.8, discount: 7, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 159900, price: 149900, rating: 4.7, discount: 6, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 109,
        name: "HP Laptop 15s, 12th Gen Intel Core i3",
        category: "electronics",
        description: "Thin and light laptop with 8GB DDR4 RAM, 512GB SSD, 15.6-inch FHD display, and dual speakers. Perfect for students and office work.",
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 56000, price: 38990, rating: 4.3, discount: 30, delivery: "2 days", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 56000, price: 37990, rating: 4.2, discount: 32, delivery: "3 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: false
    },
    {
        id: 110,
        name: "Dell Inspiron 3520 Laptop",
        category: "electronics",
        description: "Intel Core i5-1235U processor, 16GB RAM, 512GB SSD, 15.6-inch FHD 120Hz display. Sleek design with narrow borders.",
        image: "https://images.unsplash.com/photo-1593642632823-8f785bf67e45?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 72000, price: 54990, rating: 4.5, discount: 24, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 72000, price: 55490, rating: 4.4, discount: 23, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: false
    },
    {
        id: 111,
        name: "ASUS Vivobook 16X",
        category: "electronics",
        description: "AMD Ryzen 7 5800H, 16GB RAM, 512GB SSD, 16-inch WUXGA display. High performance for creators and gamers.",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 85000, price: 62990, rating: 4.6, discount: 26, delivery: "2 days", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 85000, price: 61990, rating: 4.5, discount: 27, delivery: "3 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: false
    },
    {
        id: 112,
        name: "Boat Speaker",
        category: "electronics",
        description: "Premium portable bluetooth speaker with immersive sound, deep bass, and 12 hours of playtime. IPX7 water resistant.",
        image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 14990, price: 4999, rating: 4.6, discount: 67, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 14990, price: 4999, rating: 4.5, discount: 67, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 113,
        name: "Car Dashboard Camera (4K)",
        category: "automotive",
        description: "Ultra HD 4K dash cam with night vision, 170 degree wide angle, G-sensor, and loop recording. Essential for car safety and evidence.",
        image: "https://images.unsplash.com/photo-1549841176-71f3b0e11ecf?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 8999, price: 4499, rating: 4.4, discount: 50, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 8999, price: 4699, rating: 4.3, discount: 48, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: true
    },
    {
        id: 114,
        name: "Portable Car Vacuum Cleaner",
        category: "automotive",
        description: "High power cordless car vacuum cleaner with HEPA filter and multiple attachments for deep cleaning car interiors.",
        image: "https://images.unsplash.com/photo-1599256629751-2df2e6d22731?auto=format&fit=crop&w=600&q=80",
        platforms: {
            amazon: { mrp: 2999, price: 1299, rating: 4.2, discount: 57, delivery: "1 day", available: true, url: "https://www.amazon.in" },
            flipkart: { mrp: 2999, price: 1399, rating: 4.1, discount: 53, delivery: "2 days", available: true, url: "https://www.flipkart.com" }
        },
        trending: false
    }
];

const ADDED_IPHONE_FLAG = 'iphone_added_v1';
if (!localStorage.getItem(ADDED_IPHONE_FLAG)) {
    // Only run this once to inject the iPhone into existing data if needed
    try {
        let currentProds = [];
        try {
            currentProds = JSON.parse(localStorage.getItem('smartPriceProducts') || '[]');
        } catch (e) {
            currentProds = [];
        }

        if (currentProds.length > 0 && !currentProds.some(p => p.name.includes('iPhone 15 Pro'))) {
            // Manually push to storage strictly for this update
            const newPhone = defaultProducts.find(p => p.id === 108);
            if (newPhone) {
                currentProds.push(newPhone);
                localStorage.setItem('smartPriceProducts', JSON.stringify(currentProds));
            }
        }
        localStorage.setItem(ADDED_IPHONE_FLAG, 'true');
    } catch (e) { console.error('Error auto-adding iPhone:', e); }
}

const defaultUsers = [
    {
        id: 1,
        name: "Demo User",
        email: "user@monitor.com",
        password: "user123",
        role: "user",
        orders: [],
        wishlist: [],
        cart: [],
        createdAt: "2025-01-01T00:00:00.000Z",
        preferences: { theme: "light", preferredPlatform: "flipkart" }
    }
];

// Single Strong Admin Account - Created Once
const ADMIN_ACCOUNT = {
    id: 'admin_001',
    name: "System Administrator",
    email: "admin@monitor.com",
    username: "smartpricemonitor",
    password: "smartpricemonitor12345",
    role: "admin",
    createdAt: "2026-01-30T18:40:00.000Z",
    isSystemAdmin: true
};

var storedUsers = localStorage.getItem('smartPriceUsers');
var users = [];

if (storedUsers === null) {
    // Populate initial state with default accounts
    users = [...defaultUsers, ADMIN_ACCOUNT];
    localStorage.setItem('smartPriceUsers', JSON.stringify(users));
} else {
    try {
        users = JSON.parse(storedUsers);
    } catch (e) {
        console.error("Error parsing users, resetting to default", e);
        users = [...defaultUsers, ADMIN_ACCOUNT];
        localStorage.setItem('smartPriceUsers', JSON.stringify(users));
    }

    // Check if the correct admin account exists
    const adminExists = users.some(u => u.role === 'admin' && u.email === 'admin@monitor.com');

    if (!adminExists) {
        // Force sync/reset if admin doesn't exist or is wrong
        users = users.filter(u => u.role !== 'admin');
        users.push(ADMIN_ACCOUNT);
        localStorage.setItem('smartPriceUsers', JSON.stringify(users));
    }
}

function saveUsers() {
    localStorage.setItem('smartPriceUsers', JSON.stringify(users));
}

// Sync changes across multiple browser tabs
window.addEventListener('storage', function (e) {
    if (e.key === 'smartPriceProducts') {
        // Reload products from storage
        const newData = localStorage.getItem('smartPriceProducts');
        if (newData) {
            try {
                products = JSON.parse(newData);
                console.log('🔄 Data synced from another tab: Products updated');
                // Trigger UI updates if available
                if (typeof loadProducts === 'function') loadProducts();
                if (typeof renderAdminTable === 'function') renderAdminTable();
            } catch (e) { console.error("Error syncing products", e); }
        }
    }
    if (e.key === 'smartPriceUsers') {
        const newData = localStorage.getItem('smartPriceUsers');
        if (newData) {
            try {
                users = JSON.parse(newData);
                console.log('🔄 Data synced from another tab: Users updated');
                if (typeof updateAdminStats === 'function') updateAdminStats();
            } catch (e) { console.error("Error syncing users", e); }
        }
    }
});

function updateUserInStorage(updatedUser) {
    // Update local variable
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
        users[index] = updatedUser;
    } else {
        users.push(updatedUser);
    }

    // Save to localStorage
    saveUsers();

    // Update currentUser if it matches
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email === updatedUser.email) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
}

const admin = {
    username: "admin",
    password: "admin123",
    role: "admin"
};

const searchSuggestions = [
    "iPhone 15", "Samsung Galaxy", "MacBook", "Boat Speaker", "Nike shoes", "Levi's jeans",
    "Instant Pot", "Dyson vacuum", "Protein powder", "Yoga mat", "Car Camera"
];

// Scoring algorithm based on price, rating, and delivery
function calculateSmartScore(product, platform) {
    const platformData = product.platforms[platform];
    if (!platformData || !platformData.available) return 0;
    const priceScore = (1 - (platformData.price / getMaxPrice(product))) * 30;
    const ratingScore = (platformData.rating / 5) * 25;
    const discountScore = (platformData.discount / 100) * 20;
    const deliveryScore = getDeliveryScore(platformData.delivery) * 25;
    return Math.round(priceScore + ratingScore + discountScore + deliveryScore);
}

function getMaxPrice(product) {
    const prices = Object.values(product.platforms).filter(p => p.available).map(p => p.price);
    return prices.length > 0 ? Math.max(...prices) : 1;
}

function getDeliveryScore(delivery) {
    const days = parseInt(delivery);
    if (days === 1) return 1;
    if (days === 2) return 0.8;
    if (days === 3) return 0.6;
    if (days <= 5) return 0.4;
    return 0.2;
}

function getCheapestPrice(product) {
    let cheapest = null;
    let lowestPrice = Infinity;
    Object.keys(product.platforms).forEach(platformId => {
        const platform = product.platforms[platformId];
        if (platform.available && platform.price < lowestPrice) {
            lowestPrice = platform.price;
            cheapest = platformId;
        }
    });
    return cheapest;
}

function getFastestDelivery(product) {
    let fastest = null;
    let shortestDays = Infinity;
    Object.keys(product.platforms).forEach(platformId => {
        const platform = product.platforms[platformId];
        if (platform.available) {
            const days = parseInt(platform.delivery);
            if (days < shortestDays) {
                shortestDays = days;
                fastest = platformId;
            }
        }
    });
    return fastest;
}

function getBestDeal(product) {
    let bestDeal = null;
    let highestScore = 0;
    Object.keys(product.platforms).forEach(platformId => {
        if (product.platforms[platformId].available) {
            const score = calculateSmartScore(product, platformId);
            if (score > highestScore) {
                highestScore = score;
                bestDeal = platformId;
            }
        }
    });
    return { platform: bestDeal, score: highestScore };
}

var storedProducts = localStorage.getItem('smartPriceProducts');
var products = [];
if (storedProducts === null) {
    products = defaultProducts;
    localStorage.setItem('smartPriceProducts', JSON.stringify(products));
} else {
    try {
        products = JSON.parse(storedProducts);
    } catch (e) {
        console.error("Error parsing products, resetting to default", e);
        products = defaultProducts;
        localStorage.setItem('smartPriceProducts', JSON.stringify(products));
    }
    // Cleanup: Only run the ID 1-13 filter once if we haven't already marked the new defaults as synced
    const syncMark = localStorage.getItem('smartPriceDefaultsSynced_v4');
    if (!syncMark) {
        // One-time cleanup of old IDs and ensuring new defaults are present for existing users
        products = products.filter(p => !p.id || (p.id > 114 || p.id < 1));
        defaultProducts.forEach(dp => {
            if (!products.some(p => p.id === dp.id)) {
                products.push(dp);
            }
        });
        localStorage.setItem('smartPriceDefaultsSynced_v4', 'true');
        localStorage.setItem('smartPriceProducts', JSON.stringify(products));
    }
}

// Persistence with error handling for storage limits
function saveProducts() {
    try {
        localStorage.setItem('smartPriceProducts', JSON.stringify(products));
    } catch (e) {
        alert('Storage limit reached. Image too large. Using default icon.');
        for (let i = 0; i < products.length; i++) {
            const img = products[i] && products[i].image;
            if (typeof img === 'string' && img.startsWith('data:image') && img.length > 200000) {
                products[i].image = '📦';
            }
        }
        try {
            localStorage.setItem('smartPriceProducts', JSON.stringify(products));
        } catch (e2) {
        }
    }
}

function getProductImageHTML(image, alt = "Product") {
    if (!image) return '📦';
    if (typeof image !== 'string') return '📦';
    if (image.includes('data:image') || image.includes('http') || image.includes('.') || image.includes('/')) {
        return `<img src="${image}" alt="${alt}" style="width:100%; height:100%; object-fit:contain;">`;
    }
    return image;
}
function applyPortalSettings() {
    const settings = JSON.parse(localStorage.getItem('portalSettings'));
    if (!settings) return;

    const { portalName, portalColor, portalLogo } = settings;

    // Update Brand Name
    const brandSpans = document.querySelectorAll('.nav-brand span, .brand-logo span');
    brandSpans.forEach(span => {
        if (!span.innerText.includes('Panel')) {
            span.textContent = portalName;
        }
    });

    // Update Logo
    const brandLogos = document.querySelectorAll('.brand-logo-container, .brand-logo');
    brandLogos.forEach(container => {
        if (portalLogo) {
            const img = container.querySelector('img, i');
            if (img) {
                if (img.tagName === 'IMG') {
                    img.src = portalLogo;
                } else {
                    // Replace icon with img
                    container.innerHTML = `<img src="${portalLogo}" alt="Logo" style="width:100%; height:100%; object-fit:contain;">`;
                }
            }
        }
    });

    // Update Accent Colors (Dynamic CSS)
    if (portalColor) {
        document.documentElement.style.setProperty('--accent-blue', portalColor);
    }
}

// Auto-apply on all pages
document.addEventListener('DOMContentLoaded', applyPortalSettings);
