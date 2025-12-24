'use strict';

// Pesewa.com - Authentication Module
// Frontend authentication logic (UI only, no real auth)

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.setupEventListeners();
    }

    loadUserFromStorage() {
        // For demo purposes, check if user data exists in localStorage
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateUI();
            } catch (error) {
                console.error('Failed to parse user data:', error);
                this.clearUser();
            }
        }
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Password visibility toggle
        this.setupPasswordToggle();
    }

    setupPasswordToggle() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const input = toggle.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.textContent = '🙈';
                } else {
                    input.type = 'password';
                    toggle.textContent = '👁️';
                }
            });
        });
    }

    async handleLogin() {
        const phone = document.getElementById('phone')?.value;
        const password = document.getElementById('password')?.value;

        if (!phone || !password) {
            this.showAuthError('Please enter both phone number and password');
            return;
        }

        // Show loading state
        this.showLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo purposes, create a mock user
            const mockUser = {
                id: 'user_' + Date.now(),
                phone: phone,
                role: 'borrower', // Default role
                name: 'Demo User',
                country: 'KE',
                subscription: null,
                joinedDate: new Date().toISOString()
            };

            this.login(mockUser);
            this.showAuthSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = '/pages/dashboard/borrower-dashboard.html';
            }, 1500);

        } catch (error) {
            this.showAuthError('Login failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegistration() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            phone: formData.get('registerPhone'),
            country: formData.get('country'),
            idNumber: formData.get('idNumber'),
            referrer1: formData.get('referrer1'),
            referrer2: formData.get('referrer2'),
            subscription: formData.get('subscription')
        };

        // Validate required fields
        const requiredFields = ['fullName', 'phone', 'country', 'idNumber', 'referrer1', 'referrer2'];
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
            this.showAuthError('Please fill in all required fields');
            return;
        }

        // Determine role based on subscription
        const activeRole = document.querySelector('.role-btn.active');
        const role = activeRole ? activeRole.getAttribute('data-role') : 'borrower';

        if ((role === 'lender' || role === 'both') && !data.subscription) {
            this.showAuthError('Please select a subscription tier for lenders');
            return;
        }

        // Show loading state
        this.showLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create user object
            const user = {
                id: 'user_' + Date.now(),
                ...data,
                role: role,
                email: formData.get('email') || null,
                location: formData.get('location') || null,
                occupation: formData.get('occupation') || null,
                nextOfKin: formData.get('nextOfKin') || null,
                createdAt: new Date().toISOString(),
                isActive: true,
                rating: 5, // Default rating
                groups: [],
                ledgers: [],
                blacklistStatus: null
            };

            // Save user to localStorage (for demo)
            localStorage.setItem('pesewa_user', JSON.stringify(user));

            this.login(user);
            this.showAuthSuccess(`Registration successful as ${role}! Welcome to Pesewa.`);

            // Show appropriate message based on role
            const message = role === 'borrower' 
                ? 'You can now browse groups and request loans.' 
                : 'Please complete subscription payment to activate your lender account.';
            
            // Show modal with next steps
            this.showRegistrationSuccess(user, message);

        } catch (error) {
            this.showAuthError('Registration failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    login(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Save to localStorage (for demo)
        localStorage.setItem('pesewa_user', JSON.stringify(user));
        
        // Update UI
        this.updateUI();
        
        // Dispatch login event
        this.dispatchAuthEvent('login', user);
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear localStorage (for demo)
        localStorage.removeItem('pesewa_user');
        
        // Update UI
        this.updateUI();
        
        // Dispatch logout event
        this.dispatchAuthEvent('logout');
        
        // Redirect to home page
        window.location.href = '/';
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (this.isAuthenticated && this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.fullName;
            
            // Set avatar initials
            if (userAvatar && this.currentUser.fullName) {
                const initials = this.currentUser.fullName
                    .split(' ')
                    .map(name => name[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                userAvatar.textContent = initials;
            }

            // Update role-specific UI
            this.updateRoleUI();
        } else {
            // User is logged out
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updateRoleUI() {
        if (!this.currentUser) return;

        const role = this.currentUser.role;
        const roleElements = document.querySelectorAll('[data-role]');
        
        roleElements.forEach(element => {
            const elementRole = element.getAttribute('data-role');
            const showElement = elementRole === role || elementRole === 'all' || 
                              (role === 'both' && (elementRole === 'borrower' || elementRole === 'lender'));
            
            if (showElement) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });

        // Update dashboard links based on role
        const dashboardLinks = document.querySelectorAll('[data-dashboard-link]');
        dashboardLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('dashboard')) {
                const newHref = href.replace(/dashboard\/[a-z-]+/, `dashboard/${role}-dashboard`);
                link.setAttribute('href', newHref);
            }
        });
    }

    dispatchAuthEvent(type, data = null) {
        const event = new CustomEvent(`auth:${type}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    showLoading(show) {
        const submitButtons = document.querySelectorAll('form button[type="submit"]');
        submitButtons.forEach(button => {
            if (show) {
                button.setAttribute('disabled', 'disabled');
                button.innerHTML = '<span class="loader loader-sm"></span> Loading...';
            } else {
                button.removeAttribute('disabled');
                button.textContent = button.getAttribute('data-original-text') || button.textContent;
            }
        });

        // Store original button text
        if (show) {
            submitButtons.forEach(button => {
                button.setAttribute('data-original-text', button.textContent);
            });
        }
    }

    showAuthError(message) {
        this.showAuthMessage(message, 'error');
    }

    showAuthSuccess(message) {
        this.showAuthMessage(message, 'success');
    }

    showAuthMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message alert alert-${type === 'error' ? 'danger' : 'success'}`;
        messageDiv.innerHTML = `
            <div class="alert-icon">${type === 'error' ? '❌' : '✅'}</div>
            <div class="alert-content">
                <p class="alert-message">${message}</p>
            </div>
        `;

        // Insert after form
        const form = document.querySelector('form');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form);
        } else {
            document.body.appendChild(messageDiv);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    showRegistrationSuccess(user, message) {
        // Create success modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">✅</div>
                <h3 class="modal-title">Welcome to Pesewa!</h3>
                <div class="user-summary">
                    <p><strong>Name:</strong> ${user.fullName}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Country:</strong> ${this.getCountryName(user.country)}</p>
                    ${user.role.includes('lender') ? `<p><strong>Subscription:</strong> ${this.getSubscriptionName(user.subscription)}</p>` : ''}
                </div>
                <p class="success-message">${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="goToDashboard">Go to Dashboard</button>
                    <button class="btn btn-outline" id="explorePlatform">Explore Platform</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('#goToDashboard').addEventListener('click', () => {
            const dashboardUrl = user.role.includes('lender') 
                ? '/pages/dashboard/lender-dashboard.html'
                : '/pages/dashboard/borrower-dashboard.html';
            window.location.href = dashboardUrl;
        });

        modal.querySelector('#explorePlatform').addEventListener('click', () => {
            window.location.href = '/';
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getCountryName(code) {
        const countries = {
            'KE': 'Kenya',
            'UG': 'Uganda',
            'TZ': 'Tanzania',
            'RW': 'Rwanda',
            'BI': 'Burundi',
            'SO': 'Somalia',
            'SS': 'South Sudan',
            'ET': 'Ethiopia',
            'CD': 'Congo',
            'NG': 'Nigeria',
            'ZA': 'South Africa',
            'GH': 'Ghana'
        };
        return countries[code] || code;
    }

    getSubscriptionName(tier) {
        const subscriptions = {
            'basic': 'Basic Tier (₵1,500/week)',
            'premium': 'Premium Tier (₵5,000/week)',
            'super': 'Super Tier (₵20,000/week)'
        };
        return subscriptions[tier] || tier;
    }

    clearUser() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('pesewa_user');
        this.updateUI();
    }

    // Public methods for other modules
    getUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.currentUser?.id;
    }

    getUserRole() {
        return this.currentUser?.role;
    }

    hasRole(role) {
        const userRole = this.getUserRole();
        if (!userRole) return false;
        
        if (userRole === 'both') {
            return role === 'borrower' || role === 'lender';
        }
        
        return userRole === role;
    }

    // Session management (for demo)
    checkSession() {
        const userData = localStorage.getItem('pesewa_user');
        if (!userData) {
            this.clearUser();
            return false;
        }

        try {
            const user = JSON.parse(userData);
            // Check if session is expired (24 hours for demo)
            const createdAt = new Date(user.createdAt);
            const now = new Date();
            const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                this.clearUser();
                return false;
            }
            
            return true;
        } catch (error) {
            this.clearUser();
            return false;
        }
    }

    // Password strength checker
    checkPasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Complexity checks
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        return {
            score: strength,
            level: strength >= 5 ? 'strong' : strength >= 3 ? 'medium' : 'weak',
            suggestions: this.getPasswordSuggestions(strength)
        };
    }

    getPasswordSuggestions(score) {
        const suggestions = [];
        
        if (score < 3) {
            suggestions.push('Use at least 8 characters');
            suggestions.push('Mix uppercase and lowercase letters');
            suggestions.push('Include numbers');
        } else if (score < 5) {
            suggestions.push('Use special characters (!@#$%^&*)');
            suggestions.push('Make it longer (12+ characters)');
        }
        
        return suggestions;
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Export for use in other modules
window.PesewaAuth = authManager;