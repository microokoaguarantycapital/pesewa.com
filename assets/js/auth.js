'use strict';

// Authentication Module
const AuthModule = (function() {
    // Firebase configuration (replace with actual config)
    const firebaseConfig = {
        apiKey: "demo-api-key",
        authDomain: "pesewa-demo.firebaseapp.com",
        projectId: "pesewa-demo",
        storageBucket: "pesewa-demo.appspot.com",
        messagingSenderId: "demo-sender-id",
        appId: "demo-app-id"
    };

    // Authentication state
    let currentUser = null;
    let authToken = null;

    // Initialize Firebase (demo mode)
    function init() {
        console.log('Auth Module Initialized (Demo Mode)');
        
        // Check for existing session
        const savedUser = localStorage.getItem('pesewa_user');
        const savedToken = localStorage.getItem('pesewa_token');
        
        if (savedUser && savedToken) {
            currentUser = JSON.parse(savedUser);
            authToken = savedToken;
            console.log('User session restored:', currentUser);
        }
        
        // Setup auth state listeners
        setupAuthListeners();
    }

    // Setup authentication listeners
    function setupAuthListeners() {
        // Listen for auth state changes
        document.addEventListener('authStateChanged', (e) => {
            console.log('Auth state changed:', e.detail);
        });
        
        // Listen for token refresh
        document.addEventListener('tokenRefreshed', (e) => {
            console.log('Token refreshed:', e.detail);
            authToken = e.detail.token;
            localStorage.setItem('pesewa_token', authToken);
        });
    }

    // Register new user
    async function register(userData, role) {
        try {
            showLoading('Registering...');
            
            // Validate user data
            if (!validateRegistrationData(userData, role)) {
                throw new Error('Invalid registration data');
            }
            
            // Simulate Firebase registration
            const userId = await simulateFirebaseRegistration(userData, role);
            
            // Create user profile
            const userProfile = createUserProfile(userData, role, userId);
            
            // Store user data
            currentUser = userProfile;
            authToken = generateToken(userId);
            
            // Save to localStorage
            localStorage.setItem('pesewa_user', JSON.stringify(userProfile));
            localStorage.setItem('pesewa_token', authToken);
            
            // Dispatch event
            dispatchAuthEvent('registered', userProfile);
            
            return {
                success: true,
                user: userProfile,
                token: authToken
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Login user
    async function login(phone, password) {
        try {
            showLoading('Logging in...');
            
            // Validate credentials
            if (!phone || !password) {
                throw new Error('Phone and password are required');
            }
            
            // Simulate Firebase login
            const userId = await simulateFirebaseLogin(phone, password);
            
            // Get user profile (simulated)
            const userProfile = await getUserProfile(userId);
            
            // Update state
            currentUser = userProfile;
            authToken = generateToken(userId);
            
            // Save to localStorage
            localStorage.setItem('pesewa_user', JSON.stringify(userProfile));
            localStorage.setItem('pesewa_token', authToken);
            
            // Dispatch event
            dispatchAuthEvent('loggedIn', userProfile);
            
            return {
                success: true,
                user: userProfile,
                token: authToken
            };
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Logout user
    function logout() {
        try {
            // Clear state
            currentUser = null;
            authToken = null;
            
            // Clear localStorage
            localStorage.removeItem('pesewa_user');
            localStorage.removeItem('pesewa_token');
            
            // Dispatch event
            dispatchAuthEvent('loggedOut', null);
            
            return { success: true };
            
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Get current user
    function getCurrentUser() {
        return currentUser;
    }

    // Get auth token
    function getToken() {
        return authToken;
    }

    // Check if user is authenticated
    function isAuthenticated() {
        return currentUser !== null && authToken !== null;
    }

    // Check user role
    function hasRole(role) {
        return currentUser && currentUser.role === role;
    }

    // Check if user is borrower
    function isBorrower() {
        return hasRole('borrower') || (currentUser && currentUser.roles && currentUser.roles.includes('borrower'));
    }

    // Check if user is lender
    function isLender() {
        return hasRole('lender') || (currentUser && currentUser.roles && currentUser.roles.includes('lender'));
    }

    // Check if user is admin
    function isAdmin() {
        return hasRole('admin') || (currentUser && currentUser.roles && currentUser.roles.includes('admin'));
    }

    // Update user profile
    async function updateProfile(updates) {
        try {
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            showLoading('Updating profile...');
            
            // Validate updates
            const validatedUpdates = validateProfileUpdates(updates);
            
            // Simulate Firebase update
            await simulateFirebaseProfileUpdate(currentUser.id, validatedUpdates);
            
            // Update local user data
            currentUser = { ...currentUser, ...validatedUpdates, updatedAt: new Date().toISOString() };
            
            // Save to localStorage
            localStorage.setItem('pesewa_user', JSON.stringify(currentUser));
            
            // Dispatch event
            dispatchAuthEvent('profileUpdated', currentUser);
            
            return {
                success: true,
                user: currentUser
            };
            
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Change password
    async function changePassword(currentPassword, newPassword) {
        try {
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            showLoading('Changing password...');
            
            // Simulate password change
            await simulateFirebasePasswordChange(currentUser.phone, currentPassword, newPassword);
            
            // Dispatch event
            dispatchAuthEvent('passwordChanged', null);
            
            return { success: true };
            
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Request password reset
    async function resetPassword(phone) {
        try {
            showLoading('Sending reset link...');
            
            // Simulate password reset
            await simulateFirebasePasswordReset(phone);
            
            return { success: true };
            
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Verify phone number
    async function verifyPhone(phone, otp) {
        try {
            showLoading('Verifying phone...');
            
            // Simulate phone verification
            await simulateFirebasePhoneVerification(phone, otp);
            
            // Update user profile if logged in
            if (currentUser && currentUser.phone === phone) {
                currentUser.phoneVerified = true;
                localStorage.setItem('pesewa_user', JSON.stringify(currentUser));
                dispatchAuthEvent('phoneVerified', currentUser);
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('Phone verification error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Send OTP for phone verification
    async function sendOTP(phone) {
        try {
            showLoading('Sending OTP...');
            
            // Simulate OTP sending
            const otp = await simulateFirebaseSendOTP(phone);
            
            // In production, OTP would be sent via SMS
            console.log(`Demo OTP for ${phone}: ${otp}`);
            
            return { 
                success: true,
                otp: otp // Only returned in demo for testing
            };
            
        } catch (error) {
            console.error('OTP sending error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Validate registration data
    function validateRegistrationData(data, role) {
        const errors = [];
        
        // Common validation
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        
        if (!data.phone || !isValidPhone(data.phone)) {
            errors.push('Valid phone number is required');
        }
        
        if (!data.country) {
            errors.push('Country is required');
        }
        
        if (!data.location) {
            errors.push('Location is required');
        }
        
        // Role-specific validation
        if (role === 'borrower') {
            if (!data.id) {
                errors.push('National ID is required for borrowers');
            }
            
            if (!data.guarantor1 || !data.guarantor1.name || !data.guarantor1.phone) {
                errors.push('Guarantor 1 details are required');
            }
            
            if (!data.guarantor2 || !data.guarantor2.name || !data.guarantor2.phone) {
                errors.push('Guarantor 2 details are required');
            }
        }
        
        if (role === 'lender') {
            if (!data.id) {
                errors.push('ID/Registration number is required for lenders');
            }
            
            if (!data.tier) {
                errors.push('Subscription tier is required for lenders');
            }
            
            if (!data.referrer1 || !data.referrer1.name || !data.referrer1.phone) {
                errors.push('Referrer 1 details are required');
            }
            
            if (!data.referrer2 || !data.referrer2.name || !data.referrer2.phone) {
                errors.push('Referrer 2 details are required');
            }
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        return true;
    }

    // Validate profile updates
    function validateProfileUpdates(updates) {
        const allowedFields = ['name', 'email', 'location', 'avatar', 'preferences'];
        const validated = {};
        
        for (const field in updates) {
            if (allowedFields.includes(field)) {
                validated[field] = updates[field];
            }
        }
        
        return validated;
    }

    // Create user profile
    function createUserProfile(data, role, userId) {
        const now = new Date().toISOString();
        
        const profile = {
            id: userId,
            uid: userId,
            name: data.name,
            phone: data.phone,
            email: data.email || '',
            country: data.country,
            location: data.location,
            role: role,
            roles: [role],
            idNumber: data.id,
            tier: data.tier || null,
            categories: data.categories || [],
            guarantors: data.guarantor1 && data.guarantor2 ? [data.guarantor1, data.guarantor2] : [],
            referrers: data.referrer1 && data.referrer2 ? [data.referrer1, data.referrer2] : [],
            phoneVerified: false,
            emailVerified: false,
            subscriptionActive: role === 'lender' ? false : true,
            subscriptionExpiry: role === 'lender' ? null : null,
            rating: 5.0,
            totalLoans: 0,
            totalLent: 0,
            totalBorrowed: 0,
            repaymentRate: 100,
            groups: [],
            createdAt: now,
            updatedAt: now
        };
        
        return profile;
    }

    // Simulated Firebase functions (replace with actual Firebase SDK)
    async function simulateFirebaseRegistration(data, role) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 10% failure rate
                if (Math.random() < 0.1) {
                    reject(new Error('Registration failed. Please try again.'));
                    return;
                }
                
                const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                resolve(userId);
            }, 1500);
        });
    }
    
    async function simulateFirebaseLogin(phone, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo credentials
                const demoCredentials = {
                    '0720000000': 'password123',
                    '0730000000': 'password123',
                    'lender123': 'password123'
                };
                
                if (demoCredentials[phone] === password) {
                    const userId = phone === 'lender123' ? 'lender_demo_001' : 'borrower_demo_' + phone.substr(-4);
                    resolve(userId);
                } else {
                    reject(new Error('Invalid phone or password'));
                }
            }, 1000);
        });
    }
    
    async function getUserProfile(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const isLender = userId.includes('lender');
                const profile = {
                    id: userId,
                    uid: userId,
                    name: isLender ? 'Demo Lender' : 'Demo Borrower',
                    phone: isLender ? '0712345678' : '0720000000',
                    email: isLender ? 'lender@demo.com' : 'borrower@demo.com',
                    country: 'kenya',
                    location: 'Nairobi',
                    role: isLender ? 'lender' : 'borrower',
                    roles: [isLender ? 'lender' : 'borrower'],
                    idNumber: isLender ? 'L123456' : '12345678',
                    tier: isLender ? 'basic' : null,
                    categories: isLender ? ['fare', 'data', 'food'] : ['fare', 'data'],
                    phoneVerified: true,
                    emailVerified: false,
                    subscriptionActive: isLender ? true : true,
                    subscriptionExpiry: isLender ? '2024-12-28' : null,
                    rating: isLender ? 4.8 : 4.5,
                    totalLoans: isLender ? 25 : 5,
                    totalLent: isLender ? 50000 : 0,
                    totalBorrowed: isLender ? 0 : 15000,
                    repaymentRate: isLender ? 98 : 100,
                    groups: ['family_group_001', 'church_group_001'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: new Date().toISOString()
                };
                resolve(profile);
            }, 500);
        });
    }
    
    async function simulateFirebaseProfileUpdate(userId, updates) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1000);
        });
    }
    
    async function simulateFirebasePasswordChange(phone, currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo validation
                if (currentPassword === 'password123') {
                    resolve({ success: true });
                } else {
                    reject(new Error('Current password is incorrect'));
                }
            }, 1000);
        });
    }
    
    async function simulateFirebasePasswordReset(phone) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1000);
        });
    }
    
    async function simulateFirebasePhoneVerification(phone, otp) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo OTP: 123456
                if (otp === '123456') {
                    resolve({ success: true });
                } else {
                    reject(new Error('Invalid OTP'));
                }
            }, 1000);
        });
    }
    
    async function simulateFirebaseSendOTP(phone) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate 6-digit OTP
                const otp = '123456'; // In production, this would be random
                resolve(otp);
            }, 1000);
        });
    }

    // Utility functions
    function isValidPhone(phone) {
        // Basic phone validation
        const phoneRegex = /^[+]?[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    function generateToken(userId) {
        // Generate demo token
        return 'demo_token_' + userId + '_' + Date.now();
    }
    
    function dispatchAuthEvent(type, data) {
        const event = new CustomEvent('authStateChanged', {
            detail: { type, data }
        });
        document.dispatchEvent(event);
    }
    
    function showLoading(message) {
        if (window.PesewaApp && window.PesewaApp.showLoading) {
            window.PesewaApp.showLoading();
        } else {
            console.log('Loading:', message);
        }
    }
    
    function hideLoading() {
        if (window.PesewaApp && window.PesewaApp.hideLoading) {
            window.PesewaApp.hideLoading();
        }
    }

    // Public API
    return {
        init,
        register,
        login,
        logout,
        getCurrentUser,
        getToken,
        isAuthenticated,
        hasRole,
        isBorrower,
        isLender,
        isAdmin,
        updateProfile,
        changePassword,
        resetPassword,
        verifyPhone,
        sendOTP,
        validateRegistrationData
    };
})();

// Initialize auth module
document.addEventListener('DOMContentLoaded', AuthModule.init);

// Export for use in other modules
window.AuthModule = AuthModule;