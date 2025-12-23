'use strict';

// User Roles Module
const RolesModule = (function() {
    // Role definitions
    const ROLES = {
        BORROWER: 'borrower',
        LENDER: 'lender',
        ADMIN: 'admin',
        GROUP_ADMIN: 'group_admin',
        MODERATOR: 'moderator'
    };

    // Permission definitions
    const PERMISSIONS = {
        // Borrower permissions
        BORROWER: {
            REQUEST_LOAN: 'request_loan',
            VIEW_OWN_LOANS: 'view_own_loans',
            VIEW_GROUPS: 'view_groups',
            JOIN_GROUP: 'join_group',
            LEAVE_GROUP: 'leave_group',
            RATE_LENDER: 'rate_lender',
            UPDATE_PROFILE: 'update_profile'
        },
        
        // Lender permissions
        LENDER: {
            OFFER_LOAN: 'offer_loan',
            VIEW_LEDGER: 'view_ledger',
            UPDATE_LEDGER: 'update_ledger',
            RATE_BORROWER: 'rate_borrower',
            BLACKLIST_BORROWER: 'blacklist_borrower',
            REMOVE_BLACKLIST: 'remove_blacklist',
            MANAGE_SUBSCRIPTION: 'manage_subscription',
            VIEW_BORROWER_HISTORY: 'view_borrower_history'
        },
        
        // Group admin permissions
        GROUP_ADMIN: {
            MANAGE_GROUP: 'manage_group',
            INVITE_MEMBERS: 'invite_members',
            REMOVE_MEMBERS: 'remove_members',
            APPROVE_JOIN_REQUESTS: 'approve_join_requests',
            SET_GROUP_RULES: 'set_group_rules',
            VIEW_GROUP_STATS: 'view_group_stats'
        },
        
        // Platform admin permissions
        ADMIN: {
            MANAGE_ALL_GROUPS: 'manage_all_groups',
            MANAGE_ALL_USERS: 'manage_all_users',
            MANAGE_BLACKLIST: 'manage_blacklist',
            MANAGE_DEBT_COLLECTORS: 'manage_debt_collectors',
            VIEW_PLATFORM_STATS: 'view_platform_stats',
            MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
            RESOLVE_DISPUTES: 'resolve_disputes',
            SYSTEM_OVERRIDES: 'system_overrides'
        }
    };

    // Tier definitions
    const TIERS = {
        BASIC: {
            id: 'basic',
            name: 'Basic Tier',
            maxWeekly: 1500,
            borrowerSubscription: false,
            lenderSubscription: {
                monthly: 50,
                biAnnual: 250,
                annual: 500
            },
            crbCheck: false,
            features: [
                'Up to ₵1,500 per week',
                'No CRB check',
                'Basic ledger management',
                'Up to 2 groups'
            ]
        },
        PREMIUM: {
            id: 'premium',
            name: 'Premium Tier',
            maxWeekly: 5000,
            borrowerSubscription: true,
            lenderSubscription: {
                monthly: 250,
                biAnnual: 1500,
                annual: 2500
            },
            crbCheck: false,
            features: [
                'Up to ₵5,000 per week',
                'No CRB check',
                'Advanced ledger management',
                'Up to 3 groups',
                'Priority support'
            ]
        },
        SUPER: {
            id: 'super',
            name: 'Super Tier',
            maxWeekly: 20000,
            borrowerSubscription: true,
            lenderSubscription: {
                monthly: 1000,
                biAnnual: 5000,
                annual: 8500
            },
            crbCheck: true,
            features: [
                'Up to ₵20,000 per week',
                'CRB check required',
                'Advanced analytics',
                'Up to 4 groups',
                'Premium support',
                'Debt collection assistance'
            ]
        }
    };

    // Current user roles and permissions
    let userRoles = [];
    let userPermissions = new Set();
    let userTier = null;

    // Initialize module
    function init() {
        console.log('Roles Module Initialized');
        
        // Load user roles from auth module or localStorage
        loadUserRoles();
        
        // Setup role change listeners
        setupRoleListeners();
    }

    // Load user roles
    function loadUserRoles() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        
        if (user) {
            userRoles = user.roles || [user.role];
            userTier = user.tier || null;
            
            // Calculate permissions based on roles
            calculatePermissions();
            
            console.log('User roles loaded:', userRoles);
            console.log('User tier:', userTier);
            console.log('User permissions:', Array.from(userPermissions));
        } else {
            // Default to guest permissions
            userRoles = [];
            userPermissions = new Set();
            userTier = null;
        }
    }

    // Calculate permissions based on roles
    function calculatePermissions() {
        userPermissions.clear();
        
        userRoles.forEach(role => {
            const rolePermissions = getPermissionsForRole(role);
            rolePermissions.forEach(permission => {
                userPermissions.add(permission);
            });
        });
        
        // Add tier-based permissions
        if (userTier) {
            const tierPermissions = getPermissionsForTier(userTier);
            tierPermissions.forEach(permission => {
                userPermissions.add(permission);
            });
        }
    }

    // Get permissions for a specific role
    function getPermissionsForRole(role) {
        switch (role) {
            case ROLES.BORROWER:
                return Object.values(PERMISSIONS.BORROWER);
            case ROLES.LENDER:
                return Object.values(PERMISSIONS.LENDER);
            case ROLES.GROUP_ADMIN:
                return [
                    ...Object.values(PERMISSIONS.BORROWER),
                    ...Object.values(PERMISSIONS.LENDER),
                    ...Object.values(PERMISSIONS.GROUP_ADMIN)
                ];
            case ROLES.ADMIN:
                return [
                    ...Object.values(PERMISSIONS.BORROWER),
                    ...Object.values(PERMISSIONS.LENDER),
                    ...Object.values(PERMISSIONS.GROUP_ADMIN),
                    ...Object.values(PERMISSIONS.ADMIN)
                ];
            default:
                return [];
        }
    }

    // Get permissions for a specific tier
    function getPermissionsForTier(tierId) {
        const tier = TIERS[tierId.toUpperCase()];
        if (!tier) return [];
        
        const permissions = [];
        
        switch (tierId) {
            case 'basic':
                permissions.push('access_basic_features');
                break;
            case 'premium':
                permissions.push('access_premium_features');
                permissions.push('higher_loan_limits');
                permissions.push('priority_support');
                break;
            case 'super':
                permissions.push('access_super_features');
                permissions.push('highest_loan_limits');
                permissions.push('premium_support');
                permissions.push('debt_collection_assistance');
                permissions.push('advanced_analytics');
                break;
        }
        
        return permissions;
    }

    // Check if user has a specific permission
    function hasPermission(permission) {
        return userPermissions.has(permission);
    }

    // Check if user has any of the given permissions
    function hasAnyPermission(permissions) {
        return permissions.some(permission => userPermissions.has(permission));
    }

    // Check if user has all of the given permissions
    function hasAllPermissions(permissions) {
        return permissions.every(permission => userPermissions.has(permission));
    }

    // Check if user has a specific role
    function hasRole(role) {
        return userRoles.includes(role);
    }

    // Check if user has any of the given roles
    function hasAnyRole(roles) {
        return roles.some(role => userRoles.includes(role));
    }

    // Get user's tier
    function getTier() {
        return userTier;
    }

    // Get tier details
    function getTierDetails(tierId) {
        return TIERS[tierId.toUpperCase()] || null;
    }

    // Get all tiers
    function getAllTiers() {
        return Object.values(TIERS);
    }

    // Get subscription price for tier
    function getSubscriptionPrice(tierId, period = 'monthly') {
        const tier = TIERS[tierId.toUpperCase()];
        if (!tier) return 0;
        
        return tier.lenderSubscription[period] || 0;
    }

    // Get max loan amount for tier
    function getMaxLoanAmount(tierId) {
        const tier = TIERS[tierId.toUpperCase()];
        return tier ? tier.maxWeekly : 0;
    }

    // Check if user can request loan amount
    function canRequestLoanAmount(amount) {
        if (!userTier) return false;
        
        const maxAmount = getMaxLoanAmount(userTier);
        return amount <= maxAmount;
    }

    // Check if user can join another group
    function canJoinGroup(currentGroupCount) {
        if (!userTier) return currentGroupCount < 2; // Default for non-lenders
        
        const tier = TIERS[userTier.toUpperCase()];
        if (!tier) return false;
        
        switch (userTier) {
            case 'basic':
                return currentGroupCount < 2;
            case 'premium':
                return currentGroupCount < 3;
            case 'super':
                return currentGroupCount < 4;
            default:
                return currentGroupCount < 2;
        }
    }

    // Get user's group limit
    function getGroupLimit() {
        if (!userTier) return 2;
        
        switch (userTier) {
            case 'basic':
                return 2;
            case 'premium':
                return 3;
            case 'super':
                return 4;
            default:
                return 2;
        }
    }

    // Switch user role (for users with multiple roles)
    function switchRole(newRole) {
        if (!userRoles.includes(newRole)) {
            throw new Error(`User does not have role: ${newRole}`);
        }
        
        // Update active role (first role in array is considered active)
        const otherRoles = userRoles.filter(role => role !== newRole);
        userRoles = [newRole, ...otherRoles];
        
        // Recalculate permissions
        calculatePermissions();
        
        // Dispatch event
        dispatchRoleChangeEvent(newRole);
        
        return true;
    }

    // Add role to user (admin function)
    function addRole(role) {
        if (!Object.values(ROLES).includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }
        
        if (!userRoles.includes(role)) {
            userRoles.push(role);
            calculatePermissions();
            dispatchRoleChangeEvent(role, 'added');
        }
        
        return true;
    }

    // Remove role from user (admin function)
    function removeRole(role) {
        if (role === ROLES.BORROWER || role === ROLES.LENDER) {
            throw new Error(`Cannot remove base role: ${role}`);
        }
        
        const index = userRoles.indexOf(role);
        if (index > -1) {
            userRoles.splice(index, 1);
            calculatePermissions();
            dispatchRoleChangeEvent(role, 'removed');
        }
        
        return true;
    }

    // Update user tier
    function updateTier(newTier) {
        if (!TIERS[newTier.toUpperCase()]) {
            throw new Error(`Invalid tier: ${newTier}`);
        }
        
        const oldTier = userTier;
        userTier = newTier;
        
        // Recalculate permissions with new tier
        calculatePermissions();
        
        // Dispatch event
        dispatchTierChangeEvent(newTier, oldTier);
        
        return true;
    }

    // Get user's subscription status
    function getSubscriptionStatus() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (!user || !userTier) return null;
        
        return {
            tier: userTier,
            active: user.subscriptionActive || false,
            expiry: user.subscriptionExpiry || null,
            price: getSubscriptionPrice(userTier, 'monthly'),
            features: TIERS[userTier.toUpperCase()]?.features || []
        };
    }

    // Check if subscription is active
    function isSubscriptionActive() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (!user || !userTier) return false;
        
        if (!user.subscriptionActive) return false;
        
        // Check expiry date
        if (user.subscriptionExpiry) {
            const expiryDate = new Date(user.subscriptionExpiry);
            const now = new Date();
            return expiryDate > now;
        }
        
        return true;
    }

    // Calculate subscription expiry date
    function calculateExpiryDate(startDate, period = 'monthly') {
        const date = new Date(startDate);
        
        switch (period) {
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                // Set to 28th of month
                date.setDate(28);
                break;
            case 'biAnnual':
                date.setMonth(date.getMonth() + 6);
                date.setDate(28);
                break;
            case 'annual':
                date.setFullYear(date.getFullYear() + 1);
                date.setDate(28);
                break;
        }
        
        return date.toISOString().split('T')[0];
    }

    // Get role display name
    function getRoleDisplayName(role) {
        const displayNames = {
            [ROLES.BORROWER]: 'Borrower',
            [ROLES.LENDER]: 'Lender',
            [ROLES.ADMIN]: 'Administrator',
            [ROLES.GROUP_ADMIN]: 'Group Admin',
            [ROLES.MODERATOR]: 'Moderator'
        };
        
        return displayNames[role] || role;
    }

    // Get tier display name
    function getTierDisplayName(tierId) {
        const tier = TIERS[tierId.toUpperCase()];
        return tier ? tier.name : tierId;
    }

    // Setup role change listeners
    function setupRoleListeners() {
        // Listen for auth state changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.type === 'loggedIn' || e.detail.type === 'registered') {
                loadUserRoles();
            } else if (e.detail.type === 'loggedOut') {
                userRoles = [];
                userPermissions.clear();
                userTier = null;
            }
        });
        
        // Listen for profile updates
        document.addEventListener('profileUpdated', (e) => {
            if (e.detail && e.detail.tier !== undefined) {
                userTier = e.detail.tier;
                calculatePermissions();
            }
        });
    }

    // Dispatch role change event
    function dispatchRoleChangeEvent(role, action = 'switched') {
        const event = new CustomEvent('roleChanged', {
            detail: {
                role,
                action,
                currentRoles: [...userRoles],
                currentPermissions: [...userPermissions]
            }
        });
        document.dispatchEvent(event);
    }

    // Dispatch tier change event
    function dispatchTierChangeEvent(newTier, oldTier) {
        const event = new CustomEvent('tierChanged', {
            detail: {
                newTier,
                oldTier,
                tierDetails: getTierDetails(newTier)
            }
        });
        document.dispatchEvent(event);
    }

    // Get user's dashboard URL based on roles
    function getDashboardUrl() {
        if (hasRole(ROLES.ADMIN)) {
            return 'pages/dashboard/admin-dashboard.html';
        } else if (hasRole(ROLES.LENDER) && hasRole(ROLES.BORROWER)) {
            // Users with both roles - default to lender if subscription active
            return isSubscriptionActive() ? 'pages/dashboard/lender-dashboard.html' : 'pages/dashboard/borrower-dashboard.html';
        } else if (hasRole(ROLES.LENDER)) {
            return 'pages/dashboard/lender-dashboard.html';
        } else {
            return 'pages/dashboard/borrower-dashboard.html';
        }
    }

    // Get user's navigation items based on roles
    function getNavigationItems() {
        const items = [];
        
        // Common items for all authenticated users
        if (userRoles.length > 0) {
            items.push({ url: getDashboardUrl(), icon: '📊', label: 'Dashboard' });
            items.push({ url: 'pages/groups.html', icon: '👥', label: 'Groups' });
            items.push({ url: 'pages/profile.html', icon: '👤', label: 'Profile' });
        }
        
        // Borrower-specific items
        if (hasRole(ROLES.BORROWER)) {
            items.push({ url: 'pages/borrowing.html', icon: '📝', label: 'Borrow' });
            items.push({ url: 'pages/loans.html', icon: '💰', label: 'My Loans' });
        }
        
        // Lender-specific items (only if subscription active)
        if (hasRole(ROLES.LENDER) && isSubscriptionActive()) {
            items.push({ url: 'pages/lending.html', icon: '🏦', label: 'Lend' });
            items.push({ url: 'pages/ledger.html', icon: '📋', label: 'Ledger' });
            items.push({ url: 'pages/subscriptions.html', icon: '🎫', label: 'Subscription' });
        }
        
        // Admin-specific items
        if (hasRole(ROLES.ADMIN)) {
            items.push({ url: 'pages/admin.html', icon: '⚙️', label: 'Admin' });
            items.push({ url: 'pages/blacklist.html', icon: '⚫', label: 'Blacklist' });
            items.push({ url: 'pages/debt-collectors.html', icon: '👮', label: 'Collectors' });
        }
        
        // Country page for all
        items.push({ url: 'pages/countries/index.html', icon: '🌍', label: 'Countries' });
        
        return items;
    }

    // Public API
    return {
        init,
        ROLES,
        PERMISSIONS,
        TIERS,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        getTier,
        getTierDetails,
        getAllTiers,
        getSubscriptionPrice,
        getMaxLoanAmount,
        canRequestLoanAmount,
        canJoinGroup,
        getGroupLimit,
        switchRole,
        addRole,
        removeRole,
        updateTier,
        getSubscriptionStatus,
        isSubscriptionActive,
        calculateExpiryDate,
        getRoleDisplayName,
        getTierDisplayName,
        getDashboardUrl,
        getNavigationItems
    };
})();

// Initialize roles module
document.addEventListener('DOMContentLoaded', RolesModule.init);

// Export for use in other modules
window.RolesModule = RolesModule;