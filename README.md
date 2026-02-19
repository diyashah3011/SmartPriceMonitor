# 🛒 SmartPriceMonitor

**SmartPriceMonitor** is a frontend web application that helps Indian shoppers compare product prices across major e-commerce platforms — **Amazon** and **Flipkart** — in real time. Built entirely with vanilla HTML, CSS, and JavaScript, it requires no backend or build step and runs directly in the browser.

---

## 📌 Overview

SmartPriceMonitor aggregates product listings across platforms and uses a proprietary **SmartScore algorithm** to rank the best deal by weighing price, discount percentage, customer rating, and estimated delivery speed. Users can browse products by category, compare them side by side, manage a wishlist, and track their activity through a personal dashboard.

An **Admin Panel** provides full CRUD control over the product catalog, user management, and portal-level customization (branding, colors, and logo), all persisted in the browser's `localStorage`.

---

## ✨ Features

### For Users
- **Price Comparison** — View prices, discounts, ratings, and delivery estimates across Amazon and Flipkart side by side
- **SmartScore** — Algorithmic recommendation engine combining price (30%), rating (25%), delivery speed (25%), and discount (20%)
- **Product Categories** — Electronics, Fashion, Home & Living, Groceries, Beauty, Automotive, Toys, and Sports & Fitness
- **Wishlist** — Save and manage favorite products across sessions
- **Search with Suggestions** — Live autocomplete search across the product catalog
- **User Dashboard** — Personalized view with order history and account preferences
- **Authentication** — Login, signup, and OTP-based login flow with password strength validation
- **Cart** — Add products and proceed to platform checkout links

### For Admins
- **Admin Dashboard** — Overview stats: total products, categories, registered users, and low-stock alerts
- **Product Management** — Add, edit, and delete products with image upload support (URL or base64)
- **Category Management** — View and manage all categories from the dashboard
- **User Management** — View all registered users and their details
- **Activity Log** — Timestamped log of all admin actions (additions, deletions, setting changes)
- **Portal Customization** — Change the portal name, accent color, and logo; changes apply site-wide dynamically
- **Multi-tab Sync** — Data synced across browser tabs via the `storage` event

---

## 🗂️ Project Structure

```
final_smartpricemonitor/
├── index.html               # Landing page with trending products & categories
├── login.html               # User login & signup
├── user-dashboard.html      # User account dashboard
├── comparison.html          # Side-by-side product comparison
├── categories.html          # Browse by category
├── wishlist.html            # Saved wishlist
├── about.html               # About page
├── admin.html               # Admin product/user management
├── admin-dashboard.html     # Admin overview dashboard
├── admin_login.html         # Admin login portal
├── reset_admin.html         # Admin password reset utility
├── js/
│   ├── data.js              # Central data store (products, users, categories, SmartScore logic)
│   ├── main.js              # Homepage and global UI logic
│   ├── auth.js              # Login, signup, OTP, and session management
│   ├── admin.js             # Admin CRUD and dashboard logic
│   ├── dashboard.js         # User dashboard
│   ├── comparison.js        # Product comparison view
│   ├── wishlist.js          # Wishlist management
│   ├── app-modern.js        # Modern UI enhancements
└── css/
    ├── style.css            # Global styles
    ├── dashboard.css        # User dashboard styles
    ├── admin.css            # Admin panel styles
    ├── comparison.css       # Comparison page styles
    ├── wishlist.css         # Wishlist styles
    ├── landing-modern.css   # Modern landing page styles
    ├── app-modern.css       # Modern UI component styles
    ├── hover-effects.css    # Hover & interaction animations
    ├── about.css            # About page styles
    └── cart.css             # Cart styles
```

---

## 🚀 Getting Started

No installation or build step is required.

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smartpricemonitor.git
   cd smartpricemonitor/final_smartpricemonitor
   ```

2. **Open in browser**
   - Open `index.html` directly in your browser, **or**
   - Use a local dev server (e.g., VS Code Live Server extension) for the best experience

3. **Default Credentials**

   | Role  | Email                  | Password               |
   |-------|------------------------|------------------------|
   | User  | user@monitor.com       | user123                |
   | Admin | admin@monitor.com      | smartpricemonitor12345 |

---

## 🧠 SmartScore Algorithm

The SmartScore ranks each platform's offer for a product using:

| Factor         | Weight |
|----------------|--------|
| Price          | 30%    |
| Rating         | 25%    |
| Delivery Speed | 25%    |
| Discount       | 20%    |

The platform with the highest SmartScore is highlighted as the **Best Deal**.

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup and page structure
- **CSS3** — Custom properties, flexbox, grid, animations
- **Vanilla JavaScript (ES6+)** — All logic, no frameworks
- **localStorage** — Client-side data persistence for products, users, wishlist, cart, and settings
- **Font Awesome** — Icons
- **Unsplash** — Product imagery (via URL)

---

## 📋 Notes

- All data is stored in `localStorage` — no server or database is required.
- Products and users persist across browser sessions but are device/browser specific.
- The admin can fully customize the portal name, theme color, and logo from the Admin Dashboard settings panel.

---

## 📄 License

This project is for educational purposes.
