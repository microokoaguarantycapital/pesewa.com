'use strict';

// Pesewa.com - Main Application JavaScript
// Frontend UI only - No backend integration in this phase

class PesewaApp {
    constructor() {
        this.init();
    }

    init() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Register Service Worker for PWA
        this.registerServiceWorker();

        // Initialize UI components
        this.initNavigation();
        this.initModals();
        this.initForms();
        this.initFloatingAnimations();
        this.initRoleSelection();
        this.initEventListeners();

        // Check for PWA install prompt
        this.checkPWAInstall();

        console.log('Pesewa PWA initialized successfully');
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('ServiceWorker update found:', newWorker);
                        });
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }
    }

    initNavigation() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mainNav = document.querySelector('.main-nav');
        const headerActions = document.querySelector('.header-actions');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
                mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
                
                // Toggle mobile menu
                if (mainNav) mainNav.style.display = isExpanded ? 'none' : 'flex';
                if (headerActions) headerActions.style.display = isExpanded ? 'none' : 'flex';
                
                // Animate hamburger icon
                const spans = mobileMenuBtn.querySelectorAll('span');
                if (isExpanded) {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                } else {
                    spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
                }
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                if (href.startsWith('#') && document.querySelector(href)) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (window.innerWidth <= 768) {
                        mobileMenuBtn.click();
                    }
                }
            });
        });
    }

    initModals() {
        // Login modal
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeLoginModal = document.getElementById('closeLoginModal');

        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => this.showModal(loginModal));
        }

        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => this.hideModal(loginModal));
        }

        // Register modal triggers
        const getStartedBtn = document.getElementById('getStartedBtn');
        const joinAsBorrower = document.getElementById('joinAsBorrower');
        const joinAsLender = document.getElementById('joinAsLender');
        const ctaBorrower = document.getElementById('ctaBorrower');
        const ctaLender = document.getElementById('ctaLender');
        const switchToRegister = document.getElementById('switchToRegister');
        const registerModal = document.getElementById('registerModal');
        const closeRegisterModal = document.getElementById('closeRegisterModal');

        const showRegisterModal = () => {
            this.hideModal(loginModal);
            this.showModal(registerModal);
        };

        if (getStartedBtn) getStartedBtn.addEventListener('click', showRegisterModal);
        if (joinAsBorrower) joinAsBorrower.addEventListener('click', showRegisterModal);
        if (joinAsLender) joinAsLender.addEventListener('click', showRegisterModal);
        if (ctaBorrower) ctaBorrower.addEventListener('click', showRegisterModal);
        if (ctaLender) ctaLender.addEventListener('click', showRegisterModal);
        if (switchToRegister) switchToRegister.addEventListener('click', showRegisterModal);

        if (closeRegisterModal) {
            closeRegisterModal.addEventListener('click', () => this.hideModal(registerModal));
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) this.hideModal(openModal);
            }
        });
    }

    initForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }
    }

    initFloatingAnimations() {
        // Add staggered animation delays to category cards
        const cards = document.querySelectorAll('.floating-animation');
        cards.forEach(card => {
            const delay = card.getAttribute('data-delay') || '0';
            card.style.animationDelay = `${delay}ms`;
        });
    }

    initRoleSelection() {
        const roleButtons = document.querySelectorAll('.role-btn');
        const lenderFields = document.querySelectorAll('.lender-only');
        const subscriptionSelect = document.getElementById('subscription');

        roleButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                roleButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show/hide lender fields
                const role = button.getAttribute('data-role');
                const showLenderFields = role === 'lender' || role === 'both';
                
                lenderFields.forEach(field => {
                    field.style.display = showLenderFields ? 'block' : 'none';
                    if (subscriptionSelect) {
                        subscriptionSelect.required = showLenderFields;
                    }
                });
            });
        });
    }

    initEventListeners() {
        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Scroll handler for header shadow
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleResize() {
        // Reset mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            const mainNav = document.querySelector('.main-nav');
            const headerActions = document.querySelector('.header-actions');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            
            if (mainNav) mainNav.style.display = 'flex';
            if (headerActions) headerActions.style.display = 'flex';
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                const spans = mobileMenuBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    }

    handleScroll() {
        const header = document.querySelector('.main-header');
        if (window.scrollY > 10) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
        }
    }

    showModal(modal) {
        if (!modal) return;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    handleLogin() {
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!phone || !password) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }
        
        // For demo purposes - simulate login
        this.showAlert('Login successful! Redirecting to dashboard...', 'success');
        
        // In production, this would make an API call
        setTimeout(() => {
            this.hideModal(document.getElementById('loginModal'));
            // window.location.href = '/pages/dashboard/lender-dashboard.html';
        }, 1500);
    }

    handleRegistration() {
        const form = document.getElementById('registerForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        const requiredFields = ['fullName', 'registerPhone', 'country', 'idNumber', 'referrer1', 'referrer2'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            this.showAlert('Please fill in all required fields', 'error');
            return;
        }
        
        // Phone validation
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(data.registerPhone)) {
            this.showAlert('Please enter a valid phone number', 'error');
            return;
        }
        
        // Check if lender fields are required
        const activeRole = document.querySelector('.role-btn.active');
        const role = activeRole ? activeRole.getAttribute('data-role') : 'borrower';
        
        if ((role === 'lender' || role === 'both') && !data.subscription) {
            this.showAlert('Please select a subscription tier for lenders', 'error');
            return;
        }
        
        // For demo purposes - simulate registration
        this.showAlert(`Registration successful as ${role}! Welcome to Pesewa.`, 'success');
        
        // In production, this would make an API call
        setTimeout(() => {
            this.hideModal(document.getElementById('registerModal'));
            
            // Show success message
            const message = role === 'borrower' 
                ? 'You can now browse groups and request loans.' 
                : 'Please complete subscription payment to activate your lender account.';
            
            alert(`Welcome ${data.fullName}!\n\n${message}`);
        }, 1500);
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) existingAlert.remove();
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert-message alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            box-shadow: var(--shadow-lg);
        `;
        
        // Set background color based on type
        if (type === 'error') {
            alert.style.backgroundColor = 'var(--red-primary)';
        } else if (type === 'success') {
            alert.style.backgroundColor = 'var(--green-primary)';
        } else {
            alert.style.backgroundColor = 'var(--blue-primary)';
        }
        
        // Add to DOM
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
        
        // Add keyframe animations
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    checkPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            
            // Show custom install prompt
            this.showPWAInstallPrompt();
        });
        
        // Handle install button click
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                if (!deferredPrompt) return;
                
                // Show the install prompt
                deferredPrompt.prompt();
                
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                    
                    // Hide the install prompt
                    this.hidePWAInstallPrompt();
                });
            });
        }
        
        // Handle install cancel
        const installCancel = document.getElementById('installCancel');
        if (installCancel) {
            installCancel.addEventListener('click', () => {
                this.hidePWAInstallPrompt();
            });
        }
    }

    showPWAInstallPrompt() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            return;
        }
        
        // Show prompt after delay
        setTimeout(() => {
            const prompt = document.querySelector('.pwa-install-prompt');
            if (prompt) {
                prompt.classList.remove('hidden');
            }
        }, 10000); // Show after 10 seconds
    }

    hidePWAInstallPrompt() {
        const prompt = document.querySelector('.pwa-install-prompt');
        if (prompt) {
            prompt.classList.add('hidden');
        }
    }
}

// Initialize the app
const app = new PesewaApp();

// Make app available globally for debugging
window.PesewaApp = app;