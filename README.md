# Pesewa.com - Frontend PWA

A Progressive Web App for emergency micro-lending in trusted circles across Africa.

## Features

- **12 Emergency Categories**: Floating cards with icons and taglines
- **Dual Role System**: Users can be both borrowers and lenders
- **Group Management**: Create and join referral-only groups (max 1000 members)
- **Tiered Subscription**: Basic, Premium, and Super tiers for lenders
- **Loan Calculator**: Calculate 10% weekly interest with penalty warnings
- **Country-Specific Pages**: 12 African countries with local support
- **Reputation System**: 5-star ratings and blacklist management
- **Offline Support**: Service worker for offline functionality
- **PWA Ready**: Installable on mobile and desktop

## Project Structure


## Color System

- **Primary Blue**: `#0A65FC` - Trust & Stability
- **Deep Navy**: `#061257` - Navigation & Key Text
- **Growth Green**: `#20BF6F` - Success & Balances
- **Warm Orange**: `#FF9F1C` - Highlights & CTAs
- **Alert Red**: `#FF4401` - Errors & Warnings

## Deployment on GitHub Pages

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/pesewa-frontend.git
   git push -u origin main

   
### pesewafolder-frontend/assets/css/main.css
```css
:root {
  /* Core Brand Colors */
  --primary-blue: #0A65FC;
  --deep-navy: #061257;
  --soft-blue: #EAF1FF;
  
  /* Growth & Mutual Benefit Colors */
  --growth-green: #20BF6F;
  --soft-mint: #E8F8F1;
  --dark-green: #168F52;
  
  /* Warm Human Accents */
  --warm-orange: #FF9F1C;
  --soft-peach: #FFF1E6;
  
  /* Controlled Risk & Alert Colors */
  --alert-red: #FF4401;
  --soft-rose: #FFE8E3;
  
  /* Neutral & UI Foundation */
  --primary-text: #0B0B0B;
  --body-text: #333333;
  --muted-text: #6B6B6B;
  --card-bg: #F7F9FC;
  --border-color: #E0E4EA;
  --pure-white: #FFFFFF;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 2rem;
  --font-size-2xl: 3rem;
  
  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  color: var(--body-text);
  background-color: var(--pure-white);
  line-height: 1.6;
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow-x: hidden;
}

/* Header Styles */
.app-header {
  background: var(--pure-white);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo {
  background: var(--primary-blue);
  color: var(--pure-white);
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: bold;
}

.logo-container h1 {
  font-size: var(--font-size-lg);
  color: var(--deep-navy);
}

.logo-container h1 span {
  color: var(--primary-blue);
}

.main-nav {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.main-nav a {
  text-decoration: none;
  color: var(--body-text);
  font-weight: 500;
  transition: color 0.2s;
}

.main-nav a:hover {
  color: var(--primary-blue);
}

.user-menu {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: var(--font-size-sm);
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--pure-white);
}

.btn-primary:hover {
  background: var(--deep-navy);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--soft-blue);
  color: var(--primary-blue);
  border: 1px solid var(--primary-blue);
}

.btn-secondary:hover {
  background: var(--primary-blue);
  color: var(--pure-white);
}

.btn-outline {
  background: transparent;
  color: var(--primary-blue);
  border: 1px solid var(--primary-blue);
}

.btn-outline:hover {
  background: var(--soft-blue);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: var(--font-size-md);
}

.btn-block {
  display: block;
  width: 100%;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: var(--spacing-sm);
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--alert-red);
  color: var(--pure-white);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hero Section */
.hero-section {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: linear-gradient(135deg, var(--soft-blue) 0%, var(--pure-white) 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-content h2 {
  font-size: var(--font-size-2xl);
  color: var(--deep-navy);
  margin-bottom: var(--spacing-md);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.hero-content p {
  font-size: var(--font-size-lg);
  color: var(--muted-text);
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
}

.hero-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-xl);
}

/* Floating Cards */
.floating-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.floating-card {
  background: var(--pure-white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  text-align: center;
  cursor: pointer;
}

.floating-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-blue);
}

.floating-card .card-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.floating-card h4 {
  color: var(--deep-navy);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-md);
}

.floating-card p {
  color: var(--muted-text);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

/* Stats Section */
.stats-section {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--card-bg);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  text-align: center;
}

.stat-card {
  background: var(--pure-white);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: bold;
  color: var(--growth-green);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  color: var(--muted-text);
  font-size: var(--font-size-md);
}

/* Registration Section */
.registration-section {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--pure-white);
}

.registration-section h2 {
  text-align: center;
  color: var(--deep-navy);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-xl);
}

.registration-section > p {
  text-align: center;
  color: var(--muted-text);
  margin-bottom: var(--spacing-xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.role-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.role-card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.role-card.active {
  border-color: var(--primary-blue);
  background: var(--soft-blue);
  box-shadow: var(--shadow-lg);
}

.role-card:hover {
  border-color: var(--primary-blue);
  transform: translateY(-2px);
}

.role-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.role-card h3 {
  color: var(--deep-navy);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.role-card p {
  color: var(--muted-text);
  margin-bottom: var(--spacing-md);
}

.role-card ul {
  text-align: left;
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-lg);
  color: var(--body-text);
}

.role-card li {
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

/* Form Styles */
.form-container {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  max-width: 800px;
  margin: 0 auto;
  box-shadow: var(--shadow-md);
}

.form-container h3 {
  color: var(--deep-navy);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  font-size: var(--font-size-lg);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--body-text);
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(10, 101, 252, 0.1);
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.checkbox-grid label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: normal;
  cursor: pointer;
  padding: var(--spacing-sm);
  background: var(--pure-white);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.checkbox-grid label:hover {
  border-color: var(--primary-blue);
  background: var(--soft-blue);
}

.checkbox-grid input[type="checkbox"] {
  width: auto;
}

.subscription-info {
  background: var(--soft-blue);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin: var(--spacing-lg) 0;
  border-left: 4px solid var(--primary-blue);
}

.subscription-info h4 {
  color: var(--deep-navy);
  margin-bottom: var(--spacing-sm);
}

.tier-details {
  background: var(--pure-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin: var(--spacing-sm) 0;
  border: 1px solid var(--border-color);
}

.tier-details p {
  font-weight: 600;
  color: var(--deep-navy);
  margin-bottom: var(--spacing-sm);
}

.tier-details ul {
  list-style: none;
  padding-left: 0;
  margin: var(--spacing-sm) 0;
}

.tier-details li {
  padding: var(--spacing-xs) 0;
  color: var(--body-text);
  font-size: var(--font-size-sm);
}

.tier-details .note {
  font-style: italic;
  color: var(--muted-text);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
}

.expiry-note {
  color: var(--alert-red);
  font-weight: 600;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
}

/* How It Works */
.how-it-works {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--soft-blue);
}

.how-it-works h2 {
  text-align: center;
  color: var(--deep-navy);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-xl);
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.step {
  background: var(--pure-white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
  position: relative;
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-blue);
  color: var(--pure-white);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--font-size-lg);
}

.step h3 {
  color: var(--deep-navy);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.step p {
  color: var(--muted-text);
  font-size: var(--font-size-sm);
}

/* Success Stories */
.success-stories {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--pure-white);
}

.success-stories h2 {
  text-align: center;
  color: var(--deep-navy);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-xl);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.story-card {
  background: var(--soft-mint);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  border: 1px solid var(--border-color);
}

.story-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.story-card h4 {
  color: var(--deep-navy);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.story-card p {
  color: var(--body-text);
  font-style: italic;
  font-size: var(--font-size-sm);
}

/* Calculator Section */
.calculator-section {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--card-bg);
}

.calculator-section h2 {
  text-align: center;
  color: var(--deep-navy);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-xl);
}

.calculator {
  background: var(--pure-white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  max-width: 1000px;
  margin: 0 auto;
  box-shadow: var(--shadow-lg);
}

.calculator-inputs {
  margin-bottom: var(--spacing-xl);
}

.range-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.range-value span {
  font-weight: bold;
  color: var(--deep-navy);
  font-size: var(--font-size-lg);
}

.range-value small {
  color: var(--muted-text);
  font-size: var(--font-size-sm);
}

.calculator-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.result-card {
  background: var(--soft-blue);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  border: 1px solid var(--border-color);
}

.result-card.warning {
  background: var(--soft-rose);
  border-color: var(--alert-red);
}

.result-card h4 {
  color: var(--deep-navy);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-md);
}

.result-amount {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--growth-green);
  margin-bottom: var(--spacing-xs);
}

.result-card.warning .result-amount {
  color: var(--alert-red);
}

.result-card small {
  color: var(--muted-text);
  font-size: var(--font-size-xs);
}

/* Country Selector */
.country-selector {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--pure-white);
}

.country-selector h2 {
  text-align: center;
  color: var(--deep-navy);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-xl);
}

.country-selector > p {
  text-align: center;
  color: var(--muted-text);
  margin-bottom: var(--spacing-xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
  max-width: 1200px;
  margin: 0 auto;
}

.country-card {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.country-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-blue);
  background: var(--soft-blue);
}

.flag {
  font-size: 2rem;
}

.country-name {
  font-weight: 600;
  color: var(--deep-navy);
  font-size: var(--font-size-md);
}

.currency {
  color: var(--muted-text);
  font-size: var(--font-size-sm);
  background: var(--pure-white);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

/* Comparison Section */
.comparison-section {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--soft-blue);
}

.comparison-section h2 {
  text-align: center;
  color: var(--deep-navy);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-xl);
}

.comparison-table {
  overflow-x: auto;
  margin-bottom: var(--spacing-xl);
  background: var(--pure-white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.comparison-table th {
  background: var(--deep-navy);
  color: var(--pure-white);
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.comparison-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
}

.comparison-table tr:last-child td {
  border-bottom: none;
}

.feature-yes {
  color: var(--growth-green);
  font-weight: 600;
  background: var(--soft-mint);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  display: inline-block;
}

.feature-no {
  color: var(--alert-red);
  font-weight: 600;
  background: var(--soft-rose);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  display: inline-block;
}

.feature-partial {
  color: var(--warm-orange);
  font-weight: 600;
  background: var(--soft-peach);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  display: inline-block;
}

/* Footer */
.main-footer {
  background: var(--deep-navy);
  color: var(--pure-white);
  padding: var(--spacing-xl) var(--spacing-lg);
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section h4 {
  color: var(--pure-white);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-md);
}

.footer-section p {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.footer-section a {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  transition: color 0.2s;
}

.footer-section a:hover {
  color: var(--pure-white);
}

.footer-bottom {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-size-xs);
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--pure-white);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-sm) 0;
  z-index: 100;
  border-top: 1px solid var(--border-color);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--muted-text);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all 0.2s;
  min-width: 60px;
}

.nav-item.active {
  color: var(--primary-blue);
  background: var(--soft-blue);
}

.nav-item:hover {
  color: var(--primary-blue);
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
}

.nav-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: var(--pure-white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  position: relative;
}

.success-icon {
  font-size: 4rem;
  color: var(--growth-green);
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.modal-footer {
  text-align: center;
  margin-top: var(--spacing-md);
  color: var(--muted-text);
  font-size: var(--font-size-sm);
}

.modal-footer a {
  color: var(--primary-blue);
  text-decoration: none;
}

/* Utility Classes */
.hidden {
  display: none !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
  
  .main-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-md);
  }
  
  .user-menu {
    width: 100%;
    justify-content: center;
  }
  
  .hero-content h2 {
    font-size: var(--font-size-xl);
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .floating-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .role-selector {
    grid-template-columns: 1fr;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
  }
  
  .stories-grid {
    grid-template-columns: 1fr;
  }
  
  .calculator-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .countries-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-nav {
    padding: var(--spacing-xs) 0;
  }
  
  .nav-label {
    display: none;
  }
  
  .nav-item {
    padding: var(--spacing-xs);
  }
}

@media (max-width: 480px) {
  .floating-cards-container {
    grid-template-columns: 1fr;
  }
  
  .calculator-results {
    grid-template-columns: 1fr;
  }
  
  .countries-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
