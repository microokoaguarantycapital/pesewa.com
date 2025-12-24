# Pesewa.com - Frontend PWA

Emergency Micro-Lending in Trusted Circles - Progressive Web App

## Overview
Pesewa.com is a peer-to-peer, group-based emergency micro-lending platform focused on consumption emergencies—daily human pain points. Friends lend to friends inside trusted groups with country-locked operations across 12 African countries.

## Features
- 12 emergency loan categories (floating cards UI)
- Country-specific dashboards (12 countries)
- Borrower & Lender roles (dual role support)
- Group system (5-1000 members per group)
- Real-time ledger management
- Blacklist system with admin moderation
- Subscription tiers for lenders
- Offline-capable PWA

## Tech Stack
- HTML5, CSS3 (Vanilla CSS with CSS Variables)
- Vanilla JavaScript (ES6+)
- Progressive Web App (PWA) standards
- Service Worker for offline functionality
- GitHub Pages compatible

## Project Structure


## Color System
- **Core Blues**: `#0A65FC`, `#061257`, `#EAF1FF`
- **Growth Greens**: `#20BF6F`, `#E8F8F1`, `#168F52`
- **Warm Accents**: `#FF9F1C`, `#FFF1E6`
- **Alerts**: `#FF4401`, `#FFE8E3`
- **Neutrals**: `#0B0B0B`, `#333333`, `#6B6B6B`, `#F7F9FC`, `#E0E4EA`, `#FFFFFF`

## Deployment on GitHub Pages

### Option 1: Automatic (GitHub Actions)
1. Push code to GitHub repository
2. Go to Repository Settings → Pages
3. Select source: "Deploy from a branch"
4. Select branch: `main` or `gh-pages`
5. Select folder: `/` (root)
6. Save - Site will be live at `https://[username].github.io/[repo-name]/`

### Option 2: Manual
1. Build the project (if needed)
2. Ensure all files are in the root directory
3. Push to GitHub
4. Enable GitHub Pages in repository settings

### Local Development
1. Clone repository
2. Serve with any static server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server .

   
### frontend/assets/css/main.css
```css
/* Pesewa.com - Main Stylesheet */
/* Color System - CSS Variables */
:root {
  /* Core Blues - Trust & Stability */
  --blue-primary: #0A65FC;
  --blue-dark: #061257;
  --blue-light: #EAF1FF;
  
  /* Growth Greens - Success & Mutual Benefit */
  --green-primary: #20BF6F;
  --green-light: #E8F8F1;
  --green-dark: #168F52;
  
  /* Warm Accents - Human & Approachable */
  --orange-primary: #FF9F1C;
  --orange-light: #FFF1E6;
  
  /* Alerts - Controlled Risk */
  --red-primary: #FF4401;
  --red-light: #FFE8E3;
  
  /* Neutrals - UI Foundation */
  --black: #0B0B0B;
  --gray-dark: #333333;
  --gray-medium: #6B6B6B;
  --gray-light: #F7F9FC;
  --gray-border: #E0E4EA;
  --white: #FFFFFF;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem;  /* 36px */
  --font-size-5xl: 3rem;     /* 48px */
  
  /* Spacing */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */
  --spacing-3xl: 4rem;    /* 64px */
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
  
  /* Layout */
  --container-width: 1200px;
  --header-height: 4rem;
}

/* Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--gray-dark);
  background-color: var(--white);
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  color: var(--black);
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--blue-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--blue-dark);
}

.highlight {
  color: var(--blue-primary);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
  line-height: 1;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
  white-space: nowrap;
  user-select: none;
}

.btn-primary {
  background-color: var(--blue-primary);
  color: var(--white);
  border-color: var(--blue-primary);
}

.btn-primary:hover {
  background-color: var(--blue-dark);
  border-color: var(--blue-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--green-primary);
  color: var(--white);
  border-color: var(--green-primary);
}

.btn-secondary:hover {
  background-color: var(--green-dark);
  border-color: var(--green-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-outline {
  background-color: transparent;
  color: var(--blue-primary);
  border-color: var(--blue-primary);
}

.btn-outline:hover {
  background-color: var(--blue-light);
  transform: translateY(-2px);
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.btn-xlarge {
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.btn-full {
  width: 100%;
}

/* Header */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--white);
  box-shadow: var(--shadow-sm);
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  gap: var(--spacing-md);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-img {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.logo-img img {
  width: 100%;
  height: auto;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--blue-dark);
  margin-bottom: 0;
}

.logo-dot {
  color: var(--green-primary);
}

.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  gap: var(--spacing-xl);
  list-style: none;
}

.nav-link {
  font-weight: 500;
  color: var(--gray-dark);
  padding: var(--spacing-sm) 0;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--blue-primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--blue-primary);
  border-radius: var(--radius-full);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
}

.mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 3px;
  background-color: var(--gray-dark);
  border-radius: var(--radius-full);
  transition: var(--transition-fast);
}

/* Hero Section */
.hero-section {
  padding-top: calc(var(--header-height) + var(--spacing-3xl));
  padding-bottom: var(--spacing-3xl);
  background: linear-gradient(135deg, var(--blue-light) 0%, var(--white) 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(10, 101, 252, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(32, 191, 111, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--spacing-lg);
  line-height: 1.1;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--gray-medium);
  margin-bottom: var(--spacing-2xl);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--blue-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-medium);
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

/* Categories Section */
.categories-section {
  padding: var(--spacing-3xl) 0;
  background-color: var(--white);
}

.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto var(--spacing-3xl);
}

.section-title {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-md);
}

.section-subtitle {
  font-size: var(--font-size-xl);
  color: var(--gray-medium);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.category-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-border);
  transition: all var(--transition-normal);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--blue-primary), var(--green-primary));
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--blue-primary);
}

.floating-animation {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.card-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  display: inline-block;
}

.card-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
  color: var(--blue-dark);
}

.card-desc {
  color: var(--gray-medium);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  min-height: 3rem;
}

.card-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--blue-light);
  color: var(--blue-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* How It Works */
.how-it-works {
  padding: var(--spacing-3xl) 0;
  background-color: var(--gray-light);
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.step-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-border);
  transition: var(--transition-normal);
  position: relative;
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background-color: var(--blue-primary);
  color: var(--white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-md);
}

.step-title {
  font-size: var(--font-size-lg);
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.step-desc {
  color: var(--gray-medium);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.step-icon {
  font-size: 2.5rem;
  margin-top: var(--spacing-md);
}

/* Countries Section */
.countries-section {
  padding: var(--spacing-3xl) 0;
  background-color: var(--white);
}

.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
}

.country-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-border);
  transition: var(--transition-fast);
}

.country-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--green-primary);
}

.country-flag {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-sm);
}

.country-card h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}

.country-card p {
  color: var(--gray-medium);
  font-size: var(--font-size-sm);
  margin-bottom: 0;
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-3xl) 0;
  background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-primary) 100%);
  color: var(--white);
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: var(--font-size-4xl);
  color: var(--white);
  margin-bottom: var(--spacing-lg);
}

.cta-subtitle {
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--spacing-2xl);
}

.cta-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg);
}

.cta-note {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-sm);
  max-width: 600px;
  margin: 0 auto;
}

/* Footer */
.main-footer {
  background-color: var(--blue-dark);
  color: var(--white);
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.footer-logo img {
  width: 2rem;
  height: 2rem;
}

.footer-logo-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--white);
}

.footer-tagline {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
}

.social-links {
  display: flex;
  gap: var(--spacing-sm);
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  color: var(--white);
  font-size: 1.25rem;
  transition: var(--transition-fast);
}

.social-link:hover {
  background-color: var(--blue-primary);
  transform: translateY(-2px);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
}

.footer-column h4 {
  color: var(--white);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}

.footer-column ul {
  list-style: none;
}

.footer-column li {
  margin-bottom: var(--spacing-sm);
}

.footer-column a {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.footer-column a:hover {
  color: var(--white);
}

.footer-bottom {
  padding-top: var(--spacing-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.copyright {
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.footer-note {
  color: rgba(255, 255, 255, 0.5);
  font-size: var(--font-size-xs);
  max-width: 800px;
  margin: 0 auto;
}

/* Modals */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(6, 18, 87, 0.8);
  z-index: 2000;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.modal.show {
  display: flex;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  position: relative;
}

.modal-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray-medium);
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--gray-light);
  color: var(--black);
}

.modal-title {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.modal-form {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--gray-dark);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--gray-border);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  transition: var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 3px var(--blue-light);
}

.form-group input::placeholder {
  color: var(--gray-medium);
}

.role-selection {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.role-btn {
  flex: 1;
  padding: var(--spacing-md);
  background-color: var(--gray-light);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: center;
}

.role-btn.active {
  background-color: var(--blue-light);
  border-color: var(--blue-primary);
  color: var(--blue-primary);
}

.role-btn:hover:not(.active) {
  background-color: var(--gray-border);
}

.modal-footer {
  text-align: center;
  color: var(--gray-medium);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-lg);
}

/* Responsive Design */
@media (max-width: 1024px) {
  :root {
    --font-size-5xl: 2.5rem;
    --font-size-4xl: 2rem;
    --font-size-3xl: 1.75rem;
    --font-size-2xl: 1.5rem;
    --font-size-xl: 1.125rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  
  .main-nav,
  .header-actions {
    display: none;
  }
  
  .hero-stats {
    gap: var(--spacing-xl);
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .hero-actions,
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-large,
  .btn-xlarge {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: var(--font-size-3xl);
  }
  
  .hero-subtitle {
    font-size: var(--font-size-lg);
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .countries-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .steps-container {
    grid-template-columns: 1fr;
  }
}

/* Utility Classes */
.hidden {
  display: none !important;
}

.visible {
  display: block !important;
}

.text-center {
  text-align: center;
}

.mt-1 { margin-top: var(--spacing-xs); }
.mt-2 { margin-top: var(--spacing-sm); }
.mt-3 { margin-top: var(--spacing-md); }
.mt-4 { margin-top: var(--spacing-lg); }
.mt-5 { margin-top: var(--spacing-xl); }

.mb-1 { margin-bottom: var(--spacing-xs); }
.mb-2 { margin-bottom: var(--spacing-sm); }
.mb-3 { margin-bottom: var(--spacing-md); }
.mb-4 { margin-bottom: var(--spacing-lg); }
.mb-5 { margin-bottom: var(--spacing-xl); }

/* PWA Install Prompt */
.pwa-install-prompt {
  position: fixed;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-xl);
  border: 2px solid var(--blue-primary);
  z-index: 1001;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.pwa-install-prompt.hidden {
  display: none;
}

/* Loading States */
.loading {
  position: relative;
  pointer-events: none;
  opacity: 0.7;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--blue-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Print Styles */
@media print {
  .main-header,
  .hero-actions,
  .cta-section,
  .main-footer,
  .modal {
    display: none !important;
  }
  
  body {
    background-color: var(--white);
    color: var(--black);
  }
  
  .container {
    max-width: 100%;
    padding: 0;
  }
  
  .hero-section {
    padding-top: var(--spacing-md);
  }
}