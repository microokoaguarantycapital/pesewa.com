'use strict';

// Pesewa.com - User Roles Management
// Handles dual borrower/lender role functionality

class RoleManager {
    constructor() {
        this.currentRole = null;
        this.availableRoles = ['borrower', 'lender'];
        this.userRoles = new Set();
        this.init();
    }

    init() {
        this.loadUserRoles();
        this.setupRoleSwitching();
        this.updateRoleUI();
    }

    loadUserRoles() {
        // Load roles from localStorage or user data
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.role === 'both') {
                    this.userRoles.add('borrower');
                    this.userRoles.add('lender');
                } else if (user.role && this.availableRoles.includes(user.role)) {
                    this.userRoles.add(user.role);
                }
                
                // Set current role (default to first available role)
                if (this.userRoles.size > 0) {
                    this.currentRole = Array.from(this.userRoles)[0];
                }
            } catch (error) {
                console.error('Failed to load user roles:', error);
            }
        }
    }

    setupRoleSwitching() {
        // Role switcher buttons
        const roleSwitchers = document.querySelectorAll('[data-switch-role]');
        roleSwitchers.forEach(switcher => {
            switcher.addEventListener('click', (e) => {
                const role = switcher.getAttribute('data-switch-role');
                if (this.userRoles.has(role)) {
                    this.switchRole(role);
                }
            });
        });

        // Register role selection
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const role = button.getAttribute('data-role');
                this.selectRole(role);
            });
        });
    }

    selectRole(role) {
        // Update UI
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(btn => btn.classList.remove('active'));
        
        const selectedBtn = document.querySelector(`.role-btn[data-role="${role}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // Show/hide role-specific fields
        this.toggleRoleFields(role);
    }

    toggleRoleFields(role) {
        // Borrower-specific fields
        const borrowerFields = document.querySelectorAll('.borrower-field');
        // Lender-specific fields
        const lenderFields = document.querySelectorAll('.lender-field');
        
        if (role === 'borrower' || role === 'both') {
            borrowerFields.forEach(field => field.style.display = 'block');
        } else {
            borrowerFields.forEach(field => field.style.display = 'none');
        }
        
        if (role === 'lender' || role === 'both') {
            lenderFields.forEach(field => field.style.display = 'block');
        } else {
            lenderFields.forEach(field => field.style.display = 'none');
        }
    }

    switchRole(newRole) {
        if (!this.userRoles.has(newRole)) {
            console.warn(`User does not have ${newRole} role`);
            return;
        }

        const oldRole = this.currentRole;
        this.currentRole = newRole;
        
        // Update UI
        this.updateRoleUI();
        
        // Dispatch role change event
        this.dispatchRoleChangeEvent(oldRole, newRole);
        
        // Show notification
        this.showRoleNotification(newRole);
    }

    updateRoleUI() {
        // Update role switcher UI
        const roleSwitchers = document.querySelectorAll('[data-switch-role]');
        roleSwitchers.forEach(switcher => {
            const role = switcher.getAttribute('data-switch-role');
            const isActive = role === this.currentRole;
            
            switcher.classList.toggle('active', isActive);
            switcher.classList.toggle('inactive', !isActive);
            
            // Update badge text
            const badge = switcher.querySelector('.role-badge');
            if (badge) {
                badge.textContent = isActive ? 'Active' : 'Switch';
            }
        });

        // Update page title based on role
        this.updatePageTitle();
        
        // Update dashboard sections
        this.updateDashboardSections();
        
        // Update navigation
        this.updateNavigation();
    }

    updatePageTitle() {
        const pageTitle = document.querySelector('title');
        if (pageTitle && this.currentRole) {
            const baseTitle = pageTitle.textContent.replace(/\((Borrower|Lender|Admin)\)/, '');
            pageTitle.textContent = `${baseTitle} (${this.capitalizeFirst(this.currentRole)})`;
        }
    }

    updateDashboardSections() {
        // Hide/show role-specific dashboard sections
        const sections = document.querySelectorAll('[data-role-section]');
        sections.forEach(section => {
            const sectionRole = section.getAttribute('data-role-section');
            const shouldShow = sectionRole === this.currentRole || sectionRole === 'all';
            section.style.display = shouldShow ? 'block' : 'none';
        });
    }

    updateNavigation() {
        // Update active state of role-specific nav items
        const navItems = document.querySelectorAll('[data-role-nav]');
        navItems.forEach(item => {
            const itemRole = item.getAttribute('data-role-nav');
            const isActive = itemRole === this.currentRole || itemRole === 'all';
            item.classList.toggle('active', isActive);
            item.classList.toggle('hidden', !isActive);
        });
    }

    showRoleNotification(newRole) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'role-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🔄</div>
                <div class="notification-text">
                    <strong>Role Switched!</strong>
                    <p>Now viewing as ${this.capitalizeFirst(newRole)}</p>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--blue-light);
            border-left: 4px solid var(--blue-primary);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    dispatchRoleChangeEvent(oldRole, newRole) {
        const event = new CustomEvent('role:changed', {
            detail: {
                oldRole: oldRole,
                newRole: newRole,
                userRoles: Array.from(this.userRoles)
            }
        });
        window.dispatchEvent(event);
    }

    // Public methods
    getCurrentRole() {
        return this.currentRole;
    }

    getUserRoles() {
        return Array.from(this.userRoles);
    }

    hasRole(role) {
        return this.userRoles.has(role);
    }

    canSwitchTo(role) {
        return this.userRoles.has(role) && role !== this.currentRole;
    }

    // Helper methods
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Role-specific utilities
    getRoleIcon(role) {
        const icons = {
            borrower: '👤',
            lender: '🏦',
            admin: '👑'
        };
        return icons[role] || '👤';
    }

    getRoleColor(role) {
        const colors = {
            borrower: 'var(--green-primary)',
            lender: 'var(--blue-primary)',
            admin: 'var(--orange-primary)'
        };
        return colors[role] || 'var(--gray-medium)';
    }

    // Role validation for actions
    validateAction(action, requiredRole) {
        if (!this.hasRole(requiredRole)) {
            throw new Error(`Action "${action}" requires ${requiredRole} role`);
        }
        
        if (this.currentRole !== requiredRole) {
            console.warn(`Action "${action}" performed while in ${this.currentRole} role (requires ${requiredRole})`);
        }
        
        return true;
    }

    // Role-based feature flags
    getAvailableFeatures() {
        const baseFeatures = ['view_dashboard', 'view_profile', 'edit_profile'];
        const roleFeatures = {
            borrower: ['request_loan', 'view_groups', 'join_groups', 'view_ledger'],
            lender: ['offer_loan', 'manage_ledger', 'view_borrowers', 'rate_borrowers', 'blacklist_borrowers']
        };

        let features = [...baseFeatures];
        
        this.userRoles.forEach(role => {
            if (roleFeatures[role]) {
                features.push(...roleFeatures[role]);
            }
        });

        // Remove duplicates
        return [...new Set(features)];
    }

    canAccessFeature(feature) {
        const availableFeatures = this.getAvailableFeatures();
        return availableFeatures.includes(feature);
    }

    // Role-based UI configuration
    getUIConfig() {
        const config = {
            borrower: {
                dashboardTitle: 'Borrower Dashboard',
                primaryColor: 'var(--green-primary)',
                actions: [
                    { id: 'request-loan', label: 'Request Loan', icon: '📝' },
                    { id: 'view-groups', label: 'My Groups', icon: '👥' },
                    { id: 'view-ledger', label: 'My Ledger', icon: '📊' }
                ]
            },
            lender: {
                dashboardTitle: 'Lender Dashboard',
                primaryColor: 'var(--blue-primary)',
                actions: [
                    { id: 'offer-loan', label: 'Offer Loan', icon: '💰' },
                    { id: 'manage-ledger', label: 'Manage Ledger', icon: '📋' },
                    { id: 'view-borrowers', label: 'My Borrowers', icon: '👤' }
                ]
            }
        };

        return config[this.currentRole] || config.borrower;
    }

    // Initialize role switcher component
    createRoleSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'role-switcher';
        
        let switcherHTML = '<div class="role-switcher-header">';
        switcherHTML += `<span class="current-role">${this.capitalizeFirst(this.currentRole)}</span>`;
        switcherHTML += '<span class="switcher-icon">▼</span>';
        switcherHTML += '</div>';
        
        switcherHTML += '<div class="role-switcher-menu">';
        this.userRoles.forEach(role => {
            if (role !== this.currentRole) {
                switcherHTML += `
                    <button class="role-option" data-role="${role}">
                        <span class="role-icon">${this.getRoleIcon(role)}</span>
                        <span class="role-label">${this.capitalizeFirst(role)}</span>
                    </button>
                `;
            }
        });
        switcherHTML += '</div>';
        
        switcher.innerHTML = switcherHTML;
        
        // Add event listeners
        switcher.querySelector('.role-switcher-header').addEventListener('click', () => {
            switcher.classList.toggle('open');
        });
        
        switcher.querySelectorAll('.role-option').forEach(option => {
            option.addEventListener('click', () => {
                const role = option.getAttribute('data-role');
                this.switchRole(role);
                switcher.classList.remove('open');
            });
        });
        
        return switcher;
    }

    // Add role switcher to page
    injectRoleSwitcher(containerSelector = '.header-actions') {
        const container = document.querySelector(containerSelector);
        if (!container || this.userRoles.size < 2) return;
        
        const switcher = this.createRoleSwitcher();
        container.prepend(switcher);
    }
}

// Initialize Role Manager
const roleManager = new RoleManager();

// Export for use in other modules
window.PesewaRoles = roleManager;

// Listen for auth events to update roles
window.addEventListener('auth:login', (event) => {
    const user = event.detail;
    if (user && user.role) {
        roleManager.loadUserRoles();
        roleManager.updateRoleUI();
    }
});

window.addEventListener('auth:logout', () => {
    roleManager.userRoles.clear();
    roleManager.currentRole = null;
    roleManager.updateRoleUI();
});