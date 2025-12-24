'use strict';

// Global State
const AppState = {
    currentUser: null,
    selectedCountry: localStorage.getItem('selectedCountry') || '',
    pwaInstallPrompt: null,
    offline: !navigator.onLine,
    formQueue: []
};

// DOM Elements
const DOM = {
    // Navigation
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    closeMenuBtn: document.getElementById('closeMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    
    // Country Selector
    countrySelect: document.getElementById('countrySelect'),
    
    // Registration
    registerBtn: document.getElementById('registerBtn'),
    roleTabs: document.querySelectorAll('.role-tab'),
    registrationForms: document.querySelectorAll('.registration-form'),
    
    // Login
    loginBtn: document.getElementById('loginBtn'),
    loginModal: document.getElementById('loginModal'),
    closeLoginModal: document.getElementById('closeLoginModal'),
    loginForm: document.getElementById('loginForm'),
    
    // Calculator
    calcAmount: document.getElementById('calcAmount'),
    amountDisplay: document.getElementById('amountDisplay'),
    calcDays: document.getElementById('calcDays'),
    daysDisplay: document.getElementById('daysDisplay'),
    amountButtons: document.querySelectorAll('.btn-amount'),
    daysButtons: document.querySelectorAll('.btn-days'),
    tierButtons: document.querySelectorAll('.tier-btn'),
    principalAmount: document.getElementById('principalAmount'),
    interestAmount: document.getElementById('interestAmount'),
    totalRepayment: document.getElementById('totalRepayment'),
    dailyRepayment: document.getElementById('dailyRepayment'),
    
    // Tier Selection
    tierCards: document.querySelectorAll('.tier-card'),
    selectedTier: document.getElementById('selectedTier'),
    
    // PWA
    pwaBanner: document.getElementById('pwaBanner'),
    dismissBanner: document.getElementById('dismissBanner'),
    installApp: document.getElementById('installApp'),
    
    // Forms
    borrowerForm: document.getElementById('borrowerRegistration'),
    lenderForm: document.getElementById('lenderRegistration')
};

// Initialize Application
function initApp() {
    console.log('Pesewa.com PWA Initializing...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize calculator
    initCalculator();
    
    // Check for PWA install
    checkPWAInstall();
    
    // Load saved state
    loadSavedState();
    
    // Check online status
    updateOnlineStatus();
    
    // Register service worker
    registerServiceWorker();
    
    console.log('Pesewa.com PWA Initialized');
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile Menu
    if (DOM.mobileMenuBtn) {
        DOM.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (DOM.closeMenuBtn) {
        DOM.closeMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Country Selector
    if (DOM.countrySelect) {
        DOM.countrySelect.value = AppState.selectedCountry;
        DOM.countrySelect.addEventListener('change', handleCountryChange);
    }
    
    // Registration Role Tabs
    DOM.roleTabs.forEach(tab => {
        tab.addEventListener('click', () => handleRoleTabClick(tab.dataset.role));
    });
    
    // Login Modal
    if (DOM.loginBtn) {
        DOM.loginBtn.addEventListener('click', () => toggleModal(DOM.loginModal, true));
    }
    
    if (DOM.closeLoginModal) {
        DOM.closeLoginModal.addEventListener('click', () => toggleModal(DOM.loginModal, false));
    }
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === DOM.loginModal) {
            toggleModal(DOM.loginModal, false);
        }
    });
    
    // Calculator Inputs
    if (DOM.calcAmount) {
        DOM.calcAmount.addEventListener('input', updateCalculator);
    }
    
    if (DOM.calcDays) {
        DOM.calcDays.addEventListener('input', updateCalculator);
    }
    
    // Calculator Quick Buttons
    DOM.amountButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            DOM.calcAmount.value = amount;
            updateCalculator();
        });
    });
    
    DOM.daysButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const days = parseInt(btn.dataset.days);
            DOM.calcDays.value = days;
            updateCalculator();
        });
    });
    
    // Tier Buttons
    DOM.tierButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const maxAmount = parseInt(btn.dataset.max);
            DOM.calcAmount.max = maxAmount;
            
            // Update active state
            DOM.tierButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // If current amount exceeds max, adjust it
            if (parseInt(DOM.calcAmount.value) > maxAmount) {
                DOM.calcAmount.value = maxAmount;
            }
            
            updateCalculator();
        });
    });
    
    // Tier Cards Selection
    DOM.tierCards.forEach(card => {
        card.addEventListener('click', () => {
            const tier = card.dataset.tier;
            
            // Update active state
            DOM.tierCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Update hidden input
            DOM.selectedTier.value = tier;
        });
    });
    
    // PWA Install Banner
    if (DOM.dismissBanner) {
        DOM.dismissBanner.addEventListener('click', () => {
            localStorage.setItem('pwaBannerDismissed', 'true');
            DOM.pwaBanner.classList.remove('active');
        });
    }
    
    if (DOM.installApp) {
        DOM.installApp.addEventListener('click', installPWA);
    }
    
    // Form Submissions
    if (DOM.borrowerForm) {
        DOM.borrowerForm.addEventListener('submit', handleBorrowerRegistration);
    }
    
    if (DOM.lenderForm) {
        DOM.lenderForm.addEventListener('submit', handleLenderRegistration);
    }
    
    if (DOM.loginForm) {
        DOM.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Online/Offline Events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Before Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        AppState.pwaInstallPrompt = e;
        showPWAInstallBanner();
    });
    
    // App Installed
    window.addEventListener('appinstalled', () => {
        console.log('Pesewa.com PWA installed successfully');
        localStorage.setItem('pwaInstalled', 'true');
        DOM.pwaBanner.classList.remove('active');
    });
}

// Mobile Menu Functions
function toggleMobileMenu() {
    DOM.mobileMenu.classList.toggle('active');
    document.body.style.overflow = DOM.mobileMenu.classList.contains('active') ? 'hidden' : '';
}

// Country Selection
function handleCountryChange(e) {
    const country = e.target.value;
    AppState.selectedCountry = country;
    localStorage.setItem('selectedCountry', country);
    
    if (country) {
        // Redirect to country page or update UI
        updateUIForCountry(country);
    }
}

function updateUIForCountry(country) {
    // Update currency display, language, etc.
    const countryName = DOM.countrySelect.options[DOM.countrySelect.selectedIndex].text;
    console.log(`Country changed to: ${countryName}`);
    
    // You can update currency symbols, language, etc. here
}

// Role Tab Switching
function handleRoleTabClick(role) {
    // Update active tab
    DOM.roleTabs.forEach(tab => {
        if (tab.dataset.role === role) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Show corresponding form
    DOM.registrationForms.forEach(form => {
        if (form.id === `${role}Form`) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
    
    // If both role, show lender form (can be customized)
    if (role === 'both') {
        // You can show both forms or a combined form
        document.getElementById('lenderForm').classList.add('active');
        document.getElementById('borrowerForm').classList.add('active');
    }
}

// Modal Functions
function toggleModal(modal, show) {
    if (show) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Calculator Functions
function initCalculator() {
    // Set initial values
    const initialAmount = parseInt(DOM.calcAmount.value);
    const initialDays = parseInt(DOM.calcDays.value);
    
    // Update displays
    DOM.amountDisplay.textContent = formatCurrency(initialAmount);
    DOM.daysDisplay.textContent = `${initialDays} days`;
    
    // Calculate and update results
    updateCalculator();
}

function updateCalculator() {
    const amount = parseInt(DOM.calcAmount.value);
    const days = parseInt(DOM.calcDays.value);
    const interestRate = 0.15; // 15% weekly
    
    // Update displays
    DOM.amountDisplay.textContent = formatCurrency(amount);
    DOM.daysDisplay.textContent = `${days} day${days !== 1 ? 's' : ''}`;
    
    // Calculate interest (15% per week, prorated for fewer days)
    const weeklyInterest = amount * interestRate;
    const dailyInterest = weeklyInterest / 7;
    const totalInterest = dailyInterest * days;
    
    // Calculate totals
    const totalRepaymentAmount = amount + totalInterest;
    const dailyRepaymentAmount = totalRepaymentAmount / days;
    
    // Update result displays
    DOM.principalAmount.textContent = formatCurrency(amount);
    DOM.interestAmount.textContent = formatCurrency(totalInterest);
    DOM.totalRepayment.textContent = formatCurrency(totalRepaymentAmount);
    DOM.dailyRepayment.textContent = formatCurrency(dailyRepaymentAmount);
}

function formatCurrency(amount) {
    // Format based on selected country
    const country = AppState.selectedCountry;
    
    // Default formatting
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GHS', // Default to Ghanaian Cedi
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
}

// PWA Functions
function checkPWAInstall() {
    // Check if PWA is already installed
    if (localStorage.getItem('pwaInstalled') === 'true') {
        return;
    }
    
    // Check if banner was dismissed
    if (localStorage.getItem('pwaBannerDismissed') === 'true') {
        return;
    }
    
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        localStorage.setItem('pwaInstalled', 'true');
        return;
    }
    
    // Check if on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && AppState.pwaInstallPrompt) {
        // Show banner after a delay
        setTimeout(showPWAInstallBanner, 3000);
    }
}

function showPWAInstallBanner() {
    if (!localStorage.getItem('pwaBannerDismissed') && !localStorage.getItem('pwaInstalled')) {
        DOM.pwaBanner.classList.add('active');
    }
}

async function installPWA() {
    if (AppState.pwaInstallPrompt) {
        AppState.pwaInstallPrompt.prompt();
        
        const result = await AppState.pwaInstallPrompt.userChoice;
        
        if (result.outcome === 'accepted') {
            console.log('User accepted PWA install');
            localStorage.setItem('pwaInstalled', 'true');
        } else {
            console.log('User dismissed PWA install');
            localStorage.setItem('pwaBannerDismissed', 'true');
        }
        
        DOM.pwaBanner.classList.remove('active');
        AppState.pwaInstallPrompt = null;
    }
}

// Form Handling Functions
async function handleBorrowerRegistration(e) {
    e.preventDefault();
    
    const formData = {
        role: 'borrower',
        fullName: document.getElementById('borrowerFullName').value,
        nationalId: document.getElementById('borrowerNationalId').value,
        phone: document.getElementById('borrowerPhone').value,
        email: document.getElementById('borrowerEmail').value || null,
        country: document.getElementById('borrowerCountry').value,
        location: document.getElementById('borrowerLocation').value,
        occupation: document.getElementById('borrowerOccupation').value,
        nextOfKinPhone: document.getElementById('nextOfKinPhone').value,
        guarantor1: {
            name: document.getElementById('guarantor1Name').value,
            phone: document.getElementById('guarantor1Phone').value
        },
        guarantor2: {
            name: document.getElementById('guarantor2Name').value,
            phone: document.getElementById('guarantor2Phone').value
        },
        categories: Array.from(document.querySelectorAll('input[name="borrowerCategories"]:checked'))
            .map(cb => cb.value),
        timestamp: new Date().toISOString()
    };
    
    // Validate form
    if (!validateBorrowerForm(formData)) {
        showNotification('Please fill all required fields correctly', 'error');
        return;
    }
    
    try {
        if (AppState.offline) {
            // Queue form for later submission
            queueFormSubmission('borrower-registration', formData);
            showNotification('Registration saved offline. Will submit when online.', 'info');
        } else {
            // Submit to backend
            await submitForm('borrower-registration', formData);
            showNotification('Registration submitted successfully!', 'success');
            
            // Reset form
            DOM.borrowerForm.reset();
            
            // Redirect to login or dashboard
            setTimeout(() => {
                toggleModal(DOM.loginModal, true);
            }, 2000);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

async function handleLenderRegistration(e) {
    e.preventDefault();
    
    const formData = {
        role: 'lender',
        fullName: document.getElementById('lenderFullName').value,
        brandName: document.getElementById('lenderBrandName').value || null,
        phone: document.getElementById('lenderPhone').value,
        email: document.getElementById('lenderEmail').value || null,
        country: document.getElementById('lenderCountry').value,
        location: document.getElementById('lenderLocation').value,
        subscriptionTier: DOM.selectedTier.value,
        categories: Array.from(document.querySelectorAll('input[name="lenderCategories"]:checked'))
            .map(cb => cb.value),
        timestamp: new Date().toISOString()
    };
    
    // Validate form
    if (!validateLenderForm(formData)) {
        showNotification('Please fill all required fields correctly', 'error');
        return;
    }
    
    try {
        if (AppState.offline) {
            // Queue form for later submission
            queueFormSubmission('lender-registration', formData);
            showNotification('Registration saved offline. Will submit when online.', 'info');
        } else {
            // Submit to backend
            await submitForm('lender-registration', formData);
            showNotification('Registration submitted successfully! Redirecting to payment...', 'success');
            
            // Reset form
            DOM.lenderForm.reset();
            
            // Redirect to payment page (simulated)
            setTimeout(() => {
                window.location.href = 'pages/subscriptions.html?tier=' + formData.subscriptionTier;
            }, 2000);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = {
        country: document.getElementById('loginCountry').value,
        phone: document.getElementById('loginPhone').value,
        password: document.getElementById('loginPassword').value
    };
    
    try {
        // Simulate login
        const user = await simulateLogin(formData);
        
        if (user) {
            AppState.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            showNotification('Login successful!', 'success');
            toggleModal(DOM.loginModal, false);
            
            // Redirect based on user role
            setTimeout(() => {
                redirectAfterLogin(user.role);
            }, 1000);
        } else {
            showNotification('Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Form Validation
function validateBorrowerForm(data) {
    if (!data.fullName || data.fullName.length < 2) return false;
    if (!data.nationalId || data.nationalId.length < 5) return false;
    if (!data.phone || !isValidPhoneNumber(data.phone)) return false;
    if (!data.country) return false;
    if (!data.location || data.location.length < 2) return false;
    if (!data.occupation || data.occupation.length < 2) return false;
    if (!data.nextOfKinPhone || !isValidPhoneNumber(data.nextOfKinPhone)) return false;
    if (!data.guarantor1.name || !data.guarantor1.phone) return false;
    if (!data.guarantor2.name || !data.guarantor2.phone) return false;
    if (data.categories.length === 0) return false;
    
    return true;
}

function validateLenderForm(data) {
    if (!data.fullName || data.fullName.length < 2) return false;
    if (!data.phone || !isValidPhoneNumber(data.phone)) return false;
    if (!data.country) return false;
    if (!data.location || data.location.length < 2) return false;
    if (!data.subscriptionTier) return false;
    if (data.categories.length === 0) return false;
    
    return true;
}

function isValidPhoneNumber(phone) {
    // Basic phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Form Submission
async function submitForm(endpoint, data) {
    // Simulate API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // In real app, this would be a fetch call
            console.log(`Submitting to ${endpoint}:`, data);
            
            // Simulate success
            const response = {
                success: true,
                message: 'Form submitted successfully',
                data: {
                    id: 'user_' + Date.now(),
                    ...data
                }
            };
            
            resolve(response);
        }, 1000);
    });
}

function queueFormSubmission(endpoint, data) {
    const formSubmission = {
        id: 'form_' + Date.now(),
        endpoint,
        data,
        timestamp: new Date().toISOString(),
        retries: 0
    };
    
    AppState.formQueue.push(formSubmission);
    saveFormQueue();
}

function saveFormQueue() {
    localStorage.setItem('formQueue', JSON.stringify(AppState.formQueue));
}

function loadFormQueue() {
    const queue = localStorage.getItem('formQueue');
    if (queue) {
        AppState.formQueue = JSON.parse(queue);
    }
}

// Simulated Login
async function simulateLogin(credentials) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate successful login
            const user = {
                id: 'user_123',
                phone: credentials.phone,
                country: credentials.country,
                role: Math.random() > 0.5 ? 'borrower' : 'lender',
                name: 'Test User',
                avatar: '👤'
            };
            
            resolve(user);
        }, 1000);
    });
}

function redirectAfterLogin(role) {
    switch (role) {
        case 'borrower':
            window.location.href = 'pages/borrower-dashboard.html';
            break;
        case 'lender':
            window.location.href = 'pages/lender-dashboard.html';
            break;
        default:
            window.location.href = 'pages/dashboard/index.html';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#20BF6F' : type === 'error' ? '#FF4401' : '#0A65FC'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    
    // Add close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        line-height: 1;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Add keyframes for animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Online Status
function updateOnlineStatus() {
    AppState.offline = !navigator.onLine;
    
    if (AppState.offline) {
        showNotification('You are offline. Some features may be limited.', 'warning');
    } else {
        showNotification('You are back online!', 'success');
        // Process queued forms
        processQueuedForms();
    }
}

async function processQueuedForms() {
    if (AppState.formQueue.length === 0) return;
    
    showNotification('Submitting queued forms...', 'info');
    
    for (const form of AppState.formQueue) {
        try {
            await submitForm(form.endpoint, form.data);
            // Remove from queue
            AppState.formQueue = AppState.formQueue.filter(f => f.id !== form.id);
            saveFormQueue();
        } catch (error) {
            console.error('Failed to submit queued form:', error);
            form.retries++;
            
            if (form.retries >= 3) {
                // Remove after too many retries
                AppState.formQueue = AppState.formQueue.filter(f => f.id !== form.id);
                saveFormQueue();
            }
        }
    }
    
    if (AppState.formQueue.length === 0) {
        showNotification('All queued forms submitted successfully!', 'success');
    }
}

// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('Service Worker update found:', newWorker);
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showNotification('New version available! Refresh to update.', 'info');
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Load Saved State
function loadSavedState() {
    // Load user if exists
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            AppState.currentUser = JSON.parse(savedUser);
        } catch (error) {
            console.error('Failed to parse saved user:', error);
        }
    }
    
    // Load form queue
    loadFormQueue();
    
    // Load country preference
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry && DOM.countrySelect) {
        DOM.countrySelect.value = savedCountry;
        AppState.selectedCountry = savedCountry;
    }
    
    // Update UI based on saved state
    updateUIFromState();
}

function updateUIFromState() {
    if (AppState.currentUser) {
        // Update UI for logged in user
        if (DOM.loginBtn) {
            DOM.loginBtn.textContent = 'Dashboard';
            DOM.loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                redirectAfterLogin(AppState.currentUser.role);
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for debugging
window.PesewaApp = {
    state: AppState,
    utils: {
        formatCurrency,
        showNotification,
        validatePhone: isValidPhoneNumber
    }
};