'use strict';

// Main Application Module
const PesewaApp = (function() {
    // App State
    const state = {
        user: null,
        role: null,
        country: null,
        categories: [],
        groups: [],
        notifications: [],
        darkMode: false,
        offline: false
    };

    // DOM Elements
    const elements = {
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        notificationsBtn: document.getElementById('notificationsBtn'),
        menuBtn: document.getElementById('menuBtn'),
        loginModal: document.getElementById('loginModal'),
        successModal: document.getElementById('successModal'),
        borrowerForm: document.getElementById('borrowerForm'),
        lenderForm: document.getElementById('lenderForm'),
        showBorrowerForm: document.getElementById('showBorrowerForm'),
        showLenderForm: document.getElementById('showLenderForm'),
        roleSelector: document.querySelector('.role-selector'),
        roleCards: document.querySelectorAll('.role-card'),
        installPrompt: document.getElementById('installPrompt'),
        installConfirm: document.getElementById('installConfirm'),
        installCancel: document.getElementById('installCancel')
    };

    // Initialize App
    function init() {
        console.log('Pesewa.com PWA Initializing...');
        
        // Load categories
        loadCategories();
        
        // Check authentication
        checkAuth();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize PWA
        initPWA();
        
        // Initialize calculator
        initCalculator();
        
        // Check offline status
        checkOfflineStatus();
        
        // Initialize animations
        initAnimations();
        
        console.log('Pesewa.com PWA Initialized');
    }

    // Load Categories
    function loadCategories() {
        const categories = [
            { id: 'fare', name: 'PesewaFare', icon: '🚌', tagline: 'Move on, don\'t stall—borrow for your journey.' },
            { id: 'data', name: 'PesewaData', icon: '📱', tagline: 'Stay connected, stay informed—borrow when your bundle runs out.' },
            { id: 'gas', name: 'PesewaCookingGas', icon: '🔥', tagline: 'Cook with confidence—borrow when your gas is low.' },
            { id: 'food', name: 'PesewaFood', icon: '🍲', tagline: 'Don\'t sleep hungry when paycheck is delayed—borrow and eat today.' },
            { id: 'credo', name: 'Pesewacredo', icon: '🔧', tagline: 'Fix it fast—borrow for urgent repairs or tools.' },
            { id: 'water', name: 'PesewaWaterBill', icon: '💧', tagline: 'Stay hydrated—borrow for water needs or bills.' },
            { id: 'fuel', name: 'PesewaBikeCarTuktukFuel', icon: '⛽', tagline: 'Keep moving—borrow for fuel, no matter your ride.' },
            { id: 'repair', name: 'PesewaBikeCarTuktukRepair', icon: '🛠️', tagline: 'Fix it quick—borrow for minor repairs and keep going.' },
            { id: 'medicine', name: 'PesewaMedicine', icon: '💊', tagline: 'Health first—borrow for urgent medicines.' },
            { id: 'electricity', name: 'PesewaElectricityTokens', icon: '💡', tagline: 'Stay lit, stay powered—borrow tokens when you need it.' },
            { id: 'schoolfees', name: 'Pesewaschoolfees', icon: '🎓', tagline: 'Education first—urgent school fees.' },
            { id: 'tv', name: 'PesewaTVSubscription', icon: '📺', tagline: 'Stay informed—TV subscription.' }
        ];

        state.categories = categories;
        
        // Populate category checkboxes
        populateCategoryCheckboxes('borrowerCategories', categories);
        populateCategoryCheckboxes('lenderCategories', categories);
    }

    // Populate Category Checkboxes
    function populateCategoryCheckboxes(containerId, categories) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        categories.forEach(category => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="categories" value="${category.id}">
                ${category.icon} ${category.name}
            `;
            label.title = category.tagline;
            container.appendChild(label);
        });
    }

    // Initialize Event Listeners
    function initEventListeners() {
        // Login/Register buttons
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', () => showModal(elements.loginModal));
        }
        
        if (elements.registerBtn) {
            elements.registerBtn.addEventListener('click', () => {
                document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Role selection
        if (elements.roleCards) {
            elements.roleCards.forEach(card => {
                card.addEventListener('click', handleRoleSelection);
            });
        }

        // Show forms
        if (elements.showBorrowerForm) {
            elements.showBorrowerForm.addEventListener('click', () => showRegistrationForm('borrower'));
        }
        
        if (elements.showLenderForm) {
            elements.showLenderForm.addEventListener('click', () => showRegistrationForm('lender'));
        }

        // Form submissions
        const borrowerForm = document.getElementById('borrowerRegistrationForm');
        const lenderForm = document.getElementById('lenderRegistrationForm');
        const loginForm = document.getElementById('loginForm');
        
        if (borrowerForm) {
            borrowerForm.addEventListener('submit', handleBorrowerRegistration);
        }
        
        if (lenderForm) {
            lenderForm.addEventListener('submit', handleLenderRegistration);
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Tier selection
        const lenderTier = document.getElementById('lenderTier');
        if (lenderTier) {
            lenderTier.addEventListener('change', handleTierSelection);
        }

        // Modal close buttons
        const successClose = document.getElementById('successClose');
        if (successClose) {
            successClose.addEventListener('click', () => hideModal(elements.successModal));
        }

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                hideModal(e.target);
            }
        });

        // PWA install
        if (elements.installConfirm) {
            elements.installConfirm.addEventListener('click', installPWA);
        }
        
        if (elements.installCancel) {
            elements.installCancel.addEventListener('click', () => {
                elements.installPrompt.classList.add('hidden');
            });
        }

        // Offline/online detection
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Floating cards animation
        initFloatingCards();
    }

    // Handle Role Selection
    function handleRoleSelection(e) {
        const card = e.currentTarget;
        const role = card.dataset.role;
        
        // Update active card
        elements.roleCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        // Show corresponding form
        showRegistrationForm(role);
    }

    // Show Registration Form
    function showRegistrationForm(role) {
        elements.borrowerForm.classList.add('hidden');
        elements.lenderForm.classList.add('hidden');
        
        if (role === 'borrower') {
            elements.borrowerForm.classList.remove('hidden');
            scrollToElement(elements.borrowerForm);
        } else if (role === 'lender') {
            elements.lenderForm.classList.remove('hidden');
            scrollToElement(elements.lenderForm);
        }
    }

    // Handle Tier Selection
    function handleTierSelection(e) {
        const tier = e.target.value;
        const tierDetails = document.querySelectorAll('.tier-details');
        
        // Hide all tier details
        tierDetails.forEach(detail => detail.style.display = 'none');
        
        // Show selected tier details
        const selectedTier = document.getElementById(`${tier}Tier`);
        if (selectedTier) {
            selectedTier.style.display = 'block';
        }
    }

    // Handle Borrower Registration
    async function handleBorrowerRegistration(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('borrowerName').value,
            id: document.getElementById('borrowerId').value,
            phone: document.getElementById('borrowerPhone').value,
            email: document.getElementById('borrowerEmail').value,
            country: document.getElementById('borrowerCountry').value,
            location: document.getElementById('borrowerLocation').value,
            categories: Array.from(document.querySelectorAll('#borrowerCategories input:checked')).map(cb => cb.value),
            guarantor1: {
                name: document.getElementById('guarantor1Name').value,
                phone: document.getElementById('guarantor1Phone').value
            },
            guarantor2: {
                name: document.getElementById('guarantor2Name').value,
                phone: document.getElementById('guarantor2Phone').value
            }
        };

        // Validate form
        if (!validateBorrowerForm(formData)) {
            return;
        }

        // Show loading
        showLoading();

        try {
            // In production, this would be an API call
            await simulateApiCall('borrower-registration', formData);
            
            // Success
            showSuccessModal('Borrower registration successful! You can now join groups and request loans.');
            
            // Reset form
            e.target.reset();
            
        } catch (error) {
            showError('Registration failed. Please try again.');
        } finally {
            hideLoading();
        }
    }

    // Handle Lender Registration
    async function handleLenderRegistration(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('lenderName').value,
            id: document.getElementById('lenderId').value,
            phone: document.getElementById('lenderPhone').value,
            email: document.getElementById('lenderEmail').value,
            country: document.getElementById('lenderCountry').value,
            location: document.getElementById('lenderLocation').value,
            tier: document.getElementById('lenderTier').value,
            categories: Array.from(document.querySelectorAll('#lenderCategories input:checked')).map(cb => cb.value),
            referrer1: {
                name: document.getElementById('lenderGuarantor1Name').value,
                phone: document.getElementById('lenderGuarantor1Phone').value
            },
            referrer2: {
                name: document.getElementById('lenderGuarantor2Name').value,
                phone: document.getElementById('lenderGuarantor2Phone').value
            }
        };

        // Validate form
        if (!validateLenderForm(formData)) {
            return;
        }

        // Show loading
        showLoading();

        try {
            // In production, this would be an API call
            await simulateApiCall('lender-registration', formData);
            
            // Success
            showSuccessModal('Lender registration successful! Please proceed to payment to activate your subscription.');
            
            // Reset form
            e.target.reset();
            
        } catch (error) {
            showError('Registration failed. Please try again.');
        } finally {
            hideLoading();
        }
    }

    // Handle Login
    async function handleLogin(e) {
        e.preventDefault();
        
        const formData = {
            phone: document.getElementById('loginPhone').value,
            password: document.getElementById('loginPassword').value
        };

        // Validate form
        if (!formData.phone || !formData.password) {
            showError('Please fill in all fields');
            return;
        }

        // Show loading
        showLoading();

        try {
            // In production, this would be an API call
            const response = await simulateApiCall('login', formData);
            
            // Store user data
            state.user = response.user;
            state.role = response.role;
            state.country = response.country;
            
            // Redirect based on role
            redirectToDashboard(response.role);
            
            // Close modal
            hideModal(elements.loginModal);
            
        } catch (error) {
            showError('Login failed. Please check your credentials.');
        } finally {
            hideLoading();
        }
    }

    // Validate Borrower Form
    function validateBorrowerForm(data) {
        if (!data.name || !data.id || !data.phone || !data.country || !data.location) {
            showError('Please fill in all required fields');
            return false;
        }
        
        if (!data.guarantor1.name || !data.guarantor1.phone || !data.guarantor2.name || !data.guarantor2.phone) {
            showError('Please provide both guarantor details');
            return false;
        }
        
        if (data.categories.length === 0) {
            showError('Please select at least one loan category');
            return false;
        }
        
        return true;
    }

    // Validate Lender Form
    function validateLenderForm(data) {
        if (!data.name || !data.id || !data.phone || !data.country || !data.location || !data.tier) {
            showError('Please fill in all required fields');
            return false;
        }
        
        if (!data.referrer1.name || !data.referrer1.phone || !data.referrer2.name || !data.referrer2.phone) {
            showError('Please provide both referrer details');
            return false;
        }
        
        if (data.categories.length === 0) {
            showError('Please select at least one loan category');
            return false;
        }
        
        return true;
    }

    // Initialize Calculator
    function initCalculator() {
        const amountSlider = document.getElementById('loanAmount');
        const daysSlider = document.getElementById('loanDays');
        const tierSelect = document.getElementById('loanTier');
        
        if (amountSlider && daysSlider) {
            amountSlider.addEventListener('input', updateCalculator);
            daysSlider.addEventListener('input', updateCalculator);
            
            if (tierSelect) {
                tierSelect.addEventListener('change', updateCalculator);
            }
            
            // Initial calculation
            updateCalculator();
        }
    }

    // Update Calculator
    function updateCalculator() {
        const amount = parseInt(document.getElementById('loanAmount').value) || 1000;
        const days = parseInt(document.getElementById('loanDays').value) || 7;
        const tier = document.getElementById('loanTier') ? document.getElementById('loanTier').value : 'basic';
        
        // Update display values
        document.getElementById('amountValue').textContent = formatCurrency(amount);
        document.getElementById('daysValue').textContent = `${days} days`;
        
        // Calculate values
        const interestRate = 0.10; // 10% weekly
        const interest = amount * interestRate;
        const total = amount + interest;
        const daily = days > 0 ? total / days : total;
        const penalty = total * 0.05; // 5% daily penalty
        
        // Update results
        document.getElementById('totalRepayment').textContent = formatCurrency(total);
        document.getElementById('interestAmount').textContent = formatCurrency(interest);
        document.getElementById('dailyPayment').textContent = formatCurrency(daily);
        document.getElementById('penaltyAmount').textContent = formatCurrency(penalty);
        
        // Update max value based on tier
        let maxAmount = 1500; // Basic tier
        if (tier === 'premium') maxAmount = 5000;
        if (tier === 'super') maxAmount = 20000;
        
        if (amountSlider) {
            amountSlider.max = maxAmount;
            amountSlider.nextElementSibling.querySelector('small').textContent = `Max: ${formatCurrency(maxAmount)} (${tier} Tier)`;
        }
    }

    // Format Currency
    function formatCurrency(amount) {
        return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    // Initialize PWA
    function initPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });
        }

        // Handle app install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install prompt
            if (elements.installPrompt) {
                elements.installPrompt.classList.remove('hidden');
            }
        });

        // Check if app is installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            if (elements.installPrompt) {
                elements.installPrompt.classList.add('hidden');
            }
            deferredPrompt = null;
        });
    }

    // Install PWA
    function installPWA() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        }
    }

    // Initialize Floating Cards Animation
    function initFloatingCards() {
        const cards = document.querySelectorAll('.floating-card');
        cards.forEach((card, index) => {
            // Random delay for natural floating effect
            const delay = index * 0.1;
            card.style.animationDelay = `${delay}s`;
            
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.classList.add('floating-fast');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('floating-fast');
            });
        });
    }

    // Initialize Animations
    function initAnimations() {
        // Animate elements on scroll
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1
        });
        
        animateElements.forEach(el => observer.observe(el));
    }

    // Check Authentication
    function checkAuth() {
        // Check if user is logged in (from localStorage)
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                state.user = user;
                state.role = user.role;
                state.country = user.country;
                
                // Update UI for logged in user
                updateUIForLoggedInUser();
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('pesewa_user');
            }
        }
    }

    // Update UI for Logged In User
    function updateUIForLoggedInUser() {
        if (elements.loginBtn) {
            elements.loginBtn.textContent = 'Dashboard';
            elements.loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                redirectToDashboard(state.role);
            });
        }
        
        if (elements.registerBtn) {
            elements.registerBtn.textContent = 'Logout';
            elements.registerBtn.addEventListener('click', handleLogout);
        }
    }

    // Handle Logout
    function handleLogout() {
        localStorage.removeItem('pesewa_user');
        state.user = null;
        state.role = null;
        state.country = null;
        
        // Reload page
        window.location.reload();
    }

    // Redirect to Dashboard
    function redirectToDashboard(role) {
        let dashboardUrl = '';
        
        switch (role) {
            case 'borrower':
                dashboardUrl = 'pages/dashboard/borrower-dashboard.html';
                break;
            case 'lender':
                dashboardUrl = 'pages/dashboard/lender-dashboard.html';
                break;
            case 'admin':
                dashboardUrl = 'pages/dashboard/admin-dashboard.html';
                break;
            default:
                dashboardUrl = 'pages/dashboard/borrower-dashboard.html';
        }
        
        window.location.href = dashboardUrl;
    }

    // Check Offline Status
    function checkOfflineStatus() {
        state.offline = !navigator.onLine;
        if (state.offline) {
            showOfflineNotification();
        }
    }

    // Handle Online
    function handleOnline() {
        state.offline = false;
        hideOfflineNotification();
        showNotification('You are back online', 'success');
    }

    // Handle Offline
    function handleOffline() {
        state.offline = true;
        showOfflineNotification();
    }

    // Show Offline Notification
    function showOfflineNotification() {
        showNotification('You are offline. Some features may not work.', 'warning', true);
    }

    // Hide Offline Notification
    function hideOfflineNotification() {
        const offlineNotification = document.querySelector('.notification[data-type="offline"]');
        if (offlineNotification) {
            offlineNotification.remove();
        }
    }

    // Show Notification
    function showNotification(message, type = 'info', persistent = false) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        if (persistent) {
            notification.dataset.type = 'offline';
        } else {
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
        
        // Add notification to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    // Show Modal
    function showModal(modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    // Hide Modal
    function hideModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    }

    // Show Success Modal
    function showSuccessModal(message) {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.textContent = message;
        }
        showModal(elements.successModal);
    }

    // Show Error
    function showError(message) {
        showNotification(message, 'error');
    }

    // Show Loading
    function showLoading() {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.classList.add('active');
    }

    // Hide Loading
    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    // Scroll to Element
    function scrollToElement(element) {
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Simulate API Call (for demo)
    function simulateApiCall(endpoint, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate network failure 10% of the time
                if (Math.random() < 0.1) {
                    reject(new Error('Network error'));
                    return;
                }
                
                // Simulate successful response
                const response = {
                    success: true,
                    message: 'Operation successful',
                    timestamp: new Date().toISOString()
                };
                
                // For login, simulate user data
                if (endpoint === 'login') {
                    response.user = {
                        id: 'user_' + Date.now(),
                        name: 'Demo User',
                        role: data.phone.includes('lender') ? 'lender' : 'borrower',
                        country: 'kenya',
                        phone: data.phone
                    };
                    response.role = response.user.role;
                    response.country = response.user.country;
                    
                    // Store in localStorage
                    localStorage.setItem('pesewa_user', JSON.stringify(response.user));
                }
                
                resolve(response);
            }, 1500); // Simulate network delay
        });
    }

    // Public API
    return {
        init,
        state,
        showNotification,
        showError,
        showLoading,
        hideLoading,
        formatCurrency
    };
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', PesewaApp.init);

// Export for use in other modules
window.PesewaApp = PesewaApp;