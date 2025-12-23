'use strict';

// Subscriptions Module
const SubscriptionsModule = (function() {
    // Subscription configuration
    const CONFIG = {
        EXPIRY_DAY: 28, // Subscription expires on 28th of each month
        GRACE_PERIOD: 7, // Grace period in days after expiry
        AUTO_RENEW: true, // Auto-renew subscriptions
        RENEWAL_REMINDER_DAYS: 3, // Days before expiry to send reminder
        CURRENCY: '₵'
    };

    // Subscription tiers
    const TIERS = {
        basic: {
            id: 'basic',
            name: 'Basic Tier',
            monthly: 50,
            biAnnual: 250,
            annual: 500,
            maxWeekly: 1500,
            features: [
                'Up to ₵1,500 per week',
                'No CRB check required',
                'Basic ledger management',
                'Up to 2 groups',
                'Email support'
            ],
            color: '#0A65FC'
        },
        premium: {
            id: 'premium',
            name: 'Premium Tier',
            monthly: 250,
            biAnnual: 1500,
            annual: 2500,
            maxWeekly: 5000,
            features: [
                'Up to ₵5,000 per week',
                'No CRB check required',
                'Advanced ledger management',
                'Up to 3 groups',
                'Priority support',
                'Basic analytics'
            ],
            color: '#20BF6F'
        },
        super: {
            id: 'super',
            name: 'Super Tier',
            monthly: 1000,
            biAnnual: 5000,
            annual: 8500,
            maxWeekly: 20000,
            features: [
                'Up to ₵20,000 per week',
                'CRB check required',
                'Advanced analytics',
                'Up to 4 groups',
                'Premium support',
                'Debt collection assistance',
                'Business tools'
            ],
            color: '#FF9F1C'
        }
    };

    // Payment methods
    const PAYMENT_METHODS = [
        { id: 'mpesa', name: 'M-Pesa', icon: '📱', countries: ['kenya', 'tanzania'] },
        { id: 'airtelmoney', name: 'Airtel Money', icon: '📱', countries: ['kenya', 'uganda', 'tanzania', 'rwanda'] },
        { id: 'bank', name: 'Bank Transfer', icon: '🏦', countries: 'all' },
        { id: 'paypal', name: 'PayPal', icon: '💳', countries: 'all' },
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', countries: 'all' }
    ];

    // Current subscription state
    let currentSubscription = null;
    let subscriptionHistory = [];
    let paymentHistory = [];
    let availableTiers = [];

    // Initialize module
    function init() {
        console.log('Subscriptions Module Initialized');
        
        // Load subscription data
        loadSubscriptionData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize subscription UI
        initSubscriptionUI();
        
        // Start subscription checks
        startSubscriptionChecks();
    }

    // Load subscription data
    function loadSubscriptionData() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        
        if (user) {
            // Load current subscription
            const savedSubscription = localStorage.getItem(`pesewa_subscription_${user.id}`);
            
            if (savedSubscription) {
                try {
                    currentSubscription = JSON.parse(savedSubscription);
                    console.log('Current subscription loaded:', currentSubscription);
                } catch (error) {
                    console.error('Error parsing subscription:', error);
                    currentSubscription = null;
                }
            }
            
            // Load subscription history
            const savedHistory = localStorage.getItem(`pesewa_subscription_history_${user.id}`);
            if (savedHistory) {
                try {
                    subscriptionHistory = JSON.parse(savedHistory);
                } catch (error) {
                    console.error('Error parsing subscription history:', error);
                    subscriptionHistory = [];
                }
            }
            
            // Load payment history
            const savedPayments = localStorage.getItem(`pesewa_payment_history_${user.id}`);
            if (savedPayments) {
                try {
                    paymentHistory = JSON.parse(savedPayments);
                } catch (error) {
                    console.error('Error parsing payment history:', error);
                    paymentHistory = [];
                }
            }
            
            // If no current subscription but user is a lender, create demo
            if (!currentSubscription && window.RolesModule && window.RolesModule.isLender()) {
                createDemoSubscription(user);
            }
            
            // Update available tiers based on user's country
            updateAvailableTiers(user.country);
            
            // Update user's subscription status in AuthModule
            updateUserSubscriptionStatus();
        }
    }

    // Create demo subscription
    function createDemoSubscription(user) {
        currentSubscription = {
            id: 'sub_' + Date.now(),
            userId: user.id,
            tier: 'basic',
            period: 'monthly',
            amount: TIERS.basic.monthly,
            startDate: new Date().toISOString().split('T')[0],
            expiryDate: calculateExpiryDate(new Date(), 'monthly'),
            status: 'active',
            autoRenew: true,
            paymentMethod: 'mpesa',
            lastPaymentId: 'pay_' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Create initial payment record
        const payment = {
            id: currentSubscription.lastPaymentId,
            subscriptionId: currentSubscription.id,
            userId: user.id,
            amount: currentSubscription.amount,
            tier: currentSubscription.tier,
            period: currentSubscription.period,
            paymentMethod: currentSubscription.paymentMethod,
            status: 'completed',
            reference: 'DEMO' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            notes: 'Demo subscription activation'
        };
        
        paymentHistory.unshift(payment);
        
        // Save data
        saveSubscriptionData();
        
        console.log('Demo subscription created:', currentSubscription);
    }

    // Subscribe to a tier
    async function subscribe(tierId, period, paymentMethod) {
        try {
            showLoading('Processing subscription...');
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to subscribe');
            }
            
            // Validate tier and period
            if (!isValidTier(tierId) || !isValidPeriod(period)) {
                throw new Error('Invalid tier or subscription period');
            }
            
            // Get tier details
            const tier = TIERS[tierId];
            if (!tier) {
                throw new Error('Tier not found');
            }
            
            // Calculate amount
            const amount = tier[period];
            if (!amount) {
                throw new Error('Invalid subscription period for this tier');
            }
            
            // Check if user has active subscription
            if (hasActiveSubscription()) {
                // Handle upgrade/downgrade
                return await changeSubscription(tierId, period, paymentMethod);
            }
            
            // Process payment
            const paymentResult = await processPayment({
                amount: amount,
                tier: tierId,
                period: period,
                method: paymentMethod,
                userId: user.id
            });
            
            if (!paymentResult.success) {
                throw new Error(paymentResult.message || 'Payment failed');
            }
            
            // Create subscription
            const subscriptionId = 'sub_' + Date.now();
            const startDate = new Date();
            const expiryDate = calculateExpiryDate(startDate, period);
            
            const newSubscription = {
                id: subscriptionId,
                userId: user.id,
                tier: tierId,
                period: period,
                amount: amount,
                startDate: startDate.toISOString().split('T')[0],
                expiryDate: expiryDate,
                status: 'active',
                autoRenew: true,
                paymentMethod: paymentMethod,
                lastPaymentId: paymentResult.paymentId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Update current subscription
            currentSubscription = newSubscription;
            
            // Add to history
            subscriptionHistory.unshift({
                ...newSubscription,
                action: 'new'
            });
            
            // Add payment to history
            paymentHistory.unshift({
                id: paymentResult.paymentId,
                subscriptionId: subscriptionId,
                userId: user.id,
                amount: amount,
                tier: tierId,
                period: period,
                paymentMethod: paymentMethod,
                status: 'completed',
                reference: paymentResult.reference,
                date: new Date().toISOString().split('T')[0],
                notes: 'New subscription'
            });
            
            // Save data
            saveSubscriptionData();
            
            // Update user profile
            updateUserSubscriptionStatus();
            
            // Update RolesModule tier
            if (window.RolesModule) {
                window.RolesModule.updateTier(tierId);
            }
            
            // Dispatch events
            dispatchSubscriptionEvent('subscribed', newSubscription);
            dispatchSubscriptionEvent('paymentCompleted', paymentResult);
            
            return {
                success: true,
                subscription: newSubscription,
                payment: paymentResult,
                message: 'Subscription activated successfully'
            };
            
        } catch (error) {
            console.error('Subscribe error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Change subscription (upgrade/downgrade)
    async function changeSubscription(newTierId, newPeriod, paymentMethod) {
        try {
            showLoading('Updating subscription...');
            
            if (!currentSubscription) {
                throw new Error('No active subscription to change');
            }
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to change subscription');
            }
            
            // Validate new tier and period
            if (!isValidTier(newTierId) || !isValidPeriod(newPeriod)) {
                throw new Error('Invalid tier or subscription period');
            }
            
            // Get tier details
            const newTier = TIERS[newTierId];
            if (!newTier) {
                throw new Error('Tier not found');
            }
            
            // Calculate prorated amount if changing mid-cycle
            const amount = calculateProratedAmount(newTierId, newPeriod);
            
            // Process payment
            const paymentResult = await processPayment({
                amount: amount,
                tier: newTierId,
                period: newPeriod,
                method: paymentMethod,
                userId: user.id,
                changeFrom: currentSubscription.tier,
                changeFromPeriod: currentSubscription.period
            });
            
            if (!paymentResult.success) {
                throw new Error(paymentResult.message || 'Payment failed');
            }
            
            // Update subscription
            const oldSubscription = { ...currentSubscription };
            const startDate = new Date();
            const expiryDate = calculateExpiryDate(startDate, newPeriod);
            
            const updatedSubscription = {
                ...currentSubscription,
                tier: newTierId,
                period: newPeriod,
                amount: amount,
                startDate: startDate.toISOString().split('T')[0],
                expiryDate: expiryDate,
                paymentMethod: paymentMethod,
                lastPaymentId: paymentResult.paymentId,
                updatedAt: new Date().toISOString()
            };
            
            // Update current subscription
            currentSubscription = updatedSubscription;
            
            // Add to history
            subscriptionHistory.unshift({
                ...updatedSubscription,
                action: 'changed',
                previousTier: oldSubscription.tier,
                previousPeriod: oldSubscription.period
            });
            
            // Add payment to history
            paymentHistory.unshift({
                id: paymentResult.paymentId,
                subscriptionId: currentSubscription.id,
                userId: user.id,
                amount: amount,
                tier: newTierId,
                period: newPeriod,
                paymentMethod: paymentMethod,
                status: 'completed',
                reference: paymentResult.reference,
                date: new Date().toISOString().split('T')[0],
                notes: `Changed from ${oldSubscription.tier} (${oldSubscription.period})`
            });
            
            // Save data
            saveSubscriptionData();
            
            // Update user profile
            updateUserSubscriptionStatus();
            
            // Update RolesModule tier
            if (window.RolesModule) {
                window.RolesModule.updateTier(newTierId);
            }
            
            // Dispatch events
            dispatchSubscriptionEvent('changed', {
                old: oldSubscription,
                new: updatedSubscription
            });
            
            return {
                success: true,
                subscription: updatedSubscription,
                payment: paymentResult,
                message: 'Subscription updated successfully'
            };
            
        } catch (error) {
            console.error('Change subscription error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Cancel subscription
    async function cancelSubscription(reason = '') {
        try {
            showLoading('Cancelling subscription...');
            
            if (!currentSubscription) {
                throw new Error('No active subscription to cancel');
            }
            
            // Update subscription status
            currentSubscription.status = 'cancelled';
            currentSubscription.cancelledDate = new Date().toISOString().split('T')[0];
            currentSubscription.cancellationReason = reason;
            currentSubscription.autoRenew = false;
            currentSubscription.updatedAt = new Date().toISOString();
            
            // Add to history
            subscriptionHistory.unshift({
                ...currentSubscription,
                action: 'cancelled'
            });
            
            // Save data
            saveSubscriptionData();
            
            // Update user profile
            updateUserSubscriptionStatus();
            
            // Dispatch event
            dispatchSubscriptionEvent('cancelled', currentSubscription);
            
            // Show warning about losing lender access
            showCancellationWarning();
            
            return {
                success: true,
                message: 'Subscription cancelled successfully'
            };
            
        } catch (error) {
            console.error('Cancel subscription error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Renew subscription
    async function renewSubscription(paymentMethod = null) {
        try {
            showLoading('Renewing subscription...');
            
            if (!currentSubscription) {
                throw new Error('No subscription to renew');
            }
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to renew subscription');
            }
            
            // Get tier details
            const tier = TIERS[currentSubscription.tier];
            if (!tier) {
                throw new Error('Tier not found');
            }
            
            // Calculate amount
            const amount = tier[currentSubscription.period];
            
            // Use existing payment method if not specified
            const method = paymentMethod || currentSubscription.paymentMethod;
            
            // Process payment
            const paymentResult = await processPayment({
                amount: amount,
                tier: currentSubscription.tier,
                period: currentSubscription.period,
                method: method,
                userId: user.id,
                isRenewal: true
            });
            
            if (!paymentResult.success) {
                throw new Error(paymentResult.message || 'Payment failed');
            }
            
            // Update subscription
            const oldExpiry = currentSubscription.expiryDate;
            const newExpiry = calculateExpiryDate(new Date(), currentSubscription.period);
            
            currentSubscription.status = 'active';
            currentSubscription.startDate = new Date().toISOString().split('T')[0];
            currentSubscription.expiryDate = newExpiry;
            currentSubscription.paymentMethod = method;
            currentSubscription.lastPaymentId = paymentResult.paymentId;
            currentSubscription.updatedAt = new Date().toISOString();
            
            // Add to history
            subscriptionHistory.unshift({
                ...currentSubscription,
                action: 'renewed',
                previousExpiry: oldExpiry
            });
            
            // Add payment to history
            paymentHistory.unshift({
                id: paymentResult.paymentId,
                subscriptionId: currentSubscription.id,
                userId: user.id,
                amount: amount,
                tier: currentSubscription.tier,
                period: currentSubscription.period,
                paymentMethod: method,
                status: 'completed',
                reference: paymentResult.reference,
                date: new Date().toISOString().split('T')[0],
                notes: 'Subscription renewal'
            });
            
            // Save data
            saveSubscriptionData();
            
            // Update user profile
            updateUserSubscriptionStatus();
            
            // Dispatch events
            dispatchSubscriptionEvent('renewed', currentSubscription);
            dispatchSubscriptionEvent('paymentCompleted', paymentResult);
            
            return {
                success: true,
                subscription: currentSubscription,
                payment: paymentResult,
                message: 'Subscription renewed successfully'
            };
            
        } catch (error) {
            console.error('Renew subscription error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Get current subscription
    function getCurrentSubscription() {
        return currentSubscription;
    }

    // Get subscription history
    function getSubscriptionHistory(limit = 10) {
        return subscriptionHistory.slice(0, limit);
    }

    // Get payment history
    function getPaymentHistory(limit = 10) {
        return paymentHistory.slice(0, limit);
    }

    // Get available tiers
    function getAvailableTiers() {
        return availableTiers;
    }

    // Get tier details
    function getTierDetails(tierId) {
        return TIERS[tierId] || null;
    }

    // Get payment methods for country
    function getPaymentMethods(country = null) {
        if (!country) {
            return PAYMENT_METHODS;
        }
        
        return PAYMENT_METHODS.filter(method => 
            method.countries === 'all' || method.countries.includes(country)
        );
    }

    // Check if subscription is active
    function isSubscriptionActive() {
        if (!currentSubscription || currentSubscription.status !== 'active') {
            return false;
        }
        
        // Check expiry date
        const expiryDate = new Date(currentSubscription.expiryDate);
        const today = new Date();
        
        return today <= expiryDate;
    }

    // Check if subscription is expired
    function isSubscriptionExpired() {
        if (!currentSubscription || currentSubscription.status !== 'active') {
            return false;
        }
        
        const expiryDate = new Date(currentSubscription.expiryDate);
        const today = new Date();
        
        return today > expiryDate;
    }

    // Check if subscription is in grace period
    function isInGracePeriod() {
        if (!isSubscriptionExpired()) {
            return false;
        }
        
        const expiryDate = new Date(currentSubscription.expiryDate);
        const today = new Date();
        const daysExpired = Math.floor((today - expiryDate) / (1000 * 60 * 60 * 24));
        
        return daysExpired <= CONFIG.GRACE_PERIOD;
    }

    // Check if subscription needs renewal
    function needsRenewal() {
        if (!currentSubscription || currentSubscription.status !== 'active') {
            return false;
        }
        
        const expiryDate = new Date(currentSubscription.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        return daysUntilExpiry <= CONFIG.RENEWAL_REMINDER_DAYS;
    }

    // Get days until expiry
    function getDaysUntilExpiry() {
        if (!currentSubscription || !isSubscriptionActive()) {
            return null;
        }
        
        const expiryDate = new Date(currentSubscription.expiryDate);
        const today = new Date();
        const days = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        return Math.max(0, days);
    }

    // Get days since expiry
    function getDaysSinceExpiry() {
        if (!currentSubscription || !isSubscriptionExpired()) {
            return null;
        }
        
        const expiryDate = new Date(currentSubscription.expiryDate);
        const today = new Date();
        const days = Math.floor((today - expiryDate) / (1000 * 60 * 60 * 24));
        
        return Math.max(0, days);
    }

    // Calculate expiry date
    function calculateExpiryDate(startDate, period) {
        const date = new Date(startDate);
        
        switch (period) {
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'biAnnual':
                date.setMonth(date.getMonth() + 6);
                break;
            case 'annual':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        
        // Set to expiry day of month
        date.setDate(CONFIG.EXPIRY_DAY);
        
        return date.toISOString().split('T')[0];
    }

    // Calculate prorated amount for subscription change
    function calculateProratedAmount(newTierId, newPeriod) {
        if (!currentSubscription) {
            return TIERS[newTierId][newPeriod];
        }
        
        // For demo, just return full amount
        // In production, this would calculate based on remaining days
        return TIERS[newTierId][newPeriod];
    }

    // Process payment (simulated)
    async function processPayment(paymentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 95% success rate
                const success = Math.random() < 0.95;
                
                if (success) {
                    const paymentId = 'pay_' + Date.now();
                    const reference = 'PESEWA' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
                    
                    resolve({
                        success: true,
                        paymentId: paymentId,
                        reference: reference,
                        message: 'Payment successful'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Payment failed. Please try again or use a different payment method.'
                    });
                }
            }, 2000);
        });
    }

    // Update available tiers based on country
    function updateAvailableTiers(country) {
        availableTiers = Object.values(TIERS);
        
        // In production, certain tiers might not be available in some countries
        // For demo, all tiers are available everywhere
    }

    // Update user subscription status in AuthModule
    function updateUserSubscriptionStatus() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (!user) return;
        
        const subscriptionActive = isSubscriptionActive();
        const subscriptionExpiry = currentSubscription ? currentSubscription.expiryDate : null;
        
        // Update user profile
        window.AuthModule.updateProfile({
            subscriptionActive: subscriptionActive,
            subscriptionExpiry: subscriptionExpiry,
            tier: currentSubscription ? currentSubscription.tier : null
        }).catch(console.error);
        
        // Dispatch event
        dispatchSubscriptionEvent('statusUpdated', {
            active: subscriptionActive,
            expiry: subscriptionExpiry,
            tier: currentSubscription ? currentSubscription.tier : null
        });
    }

    // Save subscription data
    function saveSubscriptionData() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (!user) return;
        
        try {
            if (currentSubscription) {
                localStorage.setItem(`pesewa_subscription_${user.id}`, JSON.stringify(currentSubscription));
            }
            localStorage.setItem(`pesewa_subscription_history_${user.id}`, JSON.stringify(subscriptionHistory));
            localStorage.setItem(`pesewa_payment_history_${user.id}`, JSON.stringify(paymentHistory));
        } catch (error) {
            console.error('Error saving subscription data:', error);
        }
    }

    // Check subscription status periodically
    function startSubscriptionChecks() {
        // Check every minute for demo, would be less frequent in production
        setInterval(() => {
            checkSubscriptionStatus();
        }, 60 * 1000);
        
        // Initial check
        setTimeout(() => {
            checkSubscriptionStatus();
        }, 5000);
    }

    // Check subscription status and send notifications
    function checkSubscriptionStatus() {
        if (!currentSubscription) return;
        
        // Check if needs renewal reminder
        if (needsRenewal() && currentSubscription.autoRenew) {
            sendRenewalReminder();
        }
        
        // Check if expired
        if (isSubscriptionExpired() && !isInGracePeriod()) {
            handleSubscriptionExpiry();
        }
        
        // Check if in grace period
        if (isInGracePeriod()) {
            sendGracePeriodWarning();
        }
    }

    // Send renewal reminder
    function sendRenewalReminder() {
        const days = getDaysUntilExpiry();
        
        if (days !== null && days <= CONFIG.RENEWAL_REMINDER_DAYS) {
            const message = `Your subscription expires in ${days} day${days !== 1 ? 's' : ''}. Renew now to continue lending.`;
            
            dispatchSubscriptionEvent('renewalReminder', {
                days: days,
                message: message,
                subscription: currentSubscription
            });
            
            // Show notification
            if (window.PesewaApp) {
                window.PesewaApp.showNotification(message, 'warning');
            }
        }
    }

    // Send grace period warning
    function sendGracePeriodWarning() {
        const days = getDaysSinceExpiry();
        
        if (days !== null && days <= CONFIG.GRACE_PERIOD) {
            const remainingDays = CONFIG.GRACE_PERIOD - days;
            const message = `Your subscription expired ${days} day${days !== 1 ? 's' : ''} ago. You have ${remainingDays} day${remainingDays !== 1 ? 's' : ''} grace period to renew.`;
            
            dispatchSubscriptionEvent('gracePeriodWarning', {
                daysExpired: days,
                remainingDays: remainingDays,
                message: message
            });
            
            // Show notification
            if (window.PesewaApp) {
                window.PesewaApp.showNotification(message, 'warning');
            }
        }
    }

    // Handle subscription expiry
    function handleSubscriptionExpiry() {
        if (currentSubscription.status === 'active') {
            currentSubscription.status = 'expired';
            currentSubscription.updatedAt = new Date().toISOString();
            
            saveSubscriptionData();
            updateUserSubscriptionStatus();
            
            const message = 'Your subscription has expired. You can no longer lend until you renew.';
            
            dispatchSubscriptionEvent('expired', {
                subscription: currentSubscription,
                message: message
            });
            
            // Show notification
            if (window.PesewaApp) {
                window.PesewaApp.showNotification(message, 'error');
            }
        }
    }

    // Show cancellation warning
    function showCancellationWarning() {
        const message = 'Your subscription has been cancelled. You can no longer lend until you subscribe again.';
        
        if (window.PesewaApp) {
            window.PesewaApp.showNotification(message, 'warning');
        }
    }

    // Validate tier
    function isValidTier(tierId) {
        return TIERS.hasOwnProperty(tierId);
    }

    // Validate period
    function isValidPeriod(period) {
        return ['monthly', 'biAnnual', 'annual'].includes(period);
    }

    // Check if user has active subscription
    function hasActiveSubscription() {
        return currentSubscription && currentSubscription.status === 'active';
    }

    // Initialize subscription UI
    function initSubscriptionUI() {
        console.log('Subscription UI initialized');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Listen for auth changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.type === 'loggedIn') {
                loadSubscriptionData();
            } else if (e.detail.type === 'loggedOut') {
                currentSubscription = null;
                subscriptionHistory = [];
                paymentHistory = [];
                availableTiers = [];
            }
        });
    }

    // Dispatch subscription event
    function dispatchSubscriptionEvent(type, data) {
        const event = new CustomEvent('subscriptionEvent', {
            detail: { type, data }
        });
        document.dispatchEvent(event);
    }

    // Show loading
    function showLoading(message) {
        if (window.PesewaApp && window.PesewaApp.showLoading) {
            window.PesewaApp.showLoading();
        }
    }

    // Hide loading
    function hideLoading() {
        if (window.PesewaApp && window.PesewaApp.hideLoading) {
            window.PesewaApp.hideLoading();
        }
    }

    // Public API
    return {
        init,
        CONFIG,
        TIERS,
        PAYMENT_METHODS,
        subscribe,
        changeSubscription,
        cancelSubscription,
        renewSubscription,
        getCurrentSubscription,
        getSubscriptionHistory,
        getPaymentHistory,
        getAvailableTiers,
        getTierDetails,
        getPaymentMethods,
        isSubscriptionActive,
        isSubscriptionExpired,
        isInGracePeriod,
        needsRenewal,
        getDaysUntilExpiry,
        getDaysSinceExpiry,
        calculateExpiryDate,
        hasActiveSubscription
    };
})();

// Initialize subscriptions module
document.addEventListener('DOMContentLoaded', SubscriptionsModule.init);

// Export for use in other modules
window.SubscriptionsModule = SubscriptionsModule;