'use strict';

// Borrowing Module
const BorrowingModule = (function() {
    // Borrowing configuration
    const CONFIG = {
        INTEREST_RATE: 0.10, // 10% weekly
        MAX_REPAYMENT_DAYS: 7,
        PENALTY_RATE: 0.05, // 5% daily after due date
        DEFAULT_PERIOD: 60, // Days until default (2 months)
        MIN_LOAN_AMOUNT: 5,
        MAX_GROUPS: 4,
        DISBURSEMENT_TIME: 10 // Minutes
    };

    // Loan categories
    const CATEGORIES = [
        { id: 'fare', name: 'PesewaFare', icon: '🚌', description: 'Transportation costs' },
        { id: 'data', name: 'PesewaData', icon: '📱', description: 'Internet bundles and airtime' },
        { id: 'gas', name: 'PesewaCookingGas', icon: '🔥', description: 'Cooking gas refills' },
        { id: 'food', name: 'PesewaFood', icon: '🍲', description: 'Food and groceries' },
        { id: 'credo', name: 'Pesewacredo', icon: '🔧', description: 'Tools and urgent repairs' },
        { id: 'water', name: 'PesewaWaterBill', icon: '💧', description: 'Water bills and needs' },
        { id: 'fuel', name: 'PesewaBikeCarTuktukFuel', icon: '⛽', description: 'Vehicle fuel' },
        { id: 'repair', name: 'PesewaBikeCarTuktukRepair', icon: '🛠️', description: 'Vehicle repairs' },
        { id: 'medicine', name: 'PesewaMedicine', icon: '💊', description: 'Medical expenses' },
        { id: 'electricity', name: 'PesewaElectricityTokens', icon: '💡', description: 'Electricity tokens' },
        { id: 'schoolfees', name: 'Pesewaschoolfees', icon: '🎓', description: 'School fees' },
        { id: 'tv', name: 'PesewaTVSubscription', icon: '📺', description: 'TV subscriptions' }
    ];

    // Current borrower state
    let borrowerProfile = null;
    let activeLoans = [];
    let loanHistory = [];
    let availableLenders = [];
    let loanRequests = [];

    // Initialize module
    function init() {
        console.log('Borrowing Module Initialized');
        
        // Load borrower data
        loadBorrowerData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize borrowing UI
        initBorrowingUI();
    }

    // Load borrower data
    function loadBorrowerData() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        
        if (user && (window.RolesModule ? window.RolesModule.isBorrower() : true)) {
            borrowerProfile = {
                id: user.id,
                name: user.name,
                phone: user.phone,
                country: user.country,
                location: user.location,
                rating: user.rating || 5.0,
                totalBorrowed: user.totalBorrowed || 0,
                totalRepaid: user.totalRepaid || 0,
                repaymentRate: user.repaymentRate || 100,
                activeLoans: user.activeLoans || 0,
                groups: user.groups || [],
                categories: user.categories || [],
                guarantors: user.guarantors || [],
                createdAt: user.createdAt
            };
            
            // Load loan data
            loadLoanData();
            
            // Load available lenders
            loadAvailableLenders();
            
            console.log('Borrower profile loaded:', borrowerProfile);
        } else {
            console.log('User is not a borrower or not logged in');
        }
    }

    // Load loan data
    function loadLoanData() {
        const savedLoans = localStorage.getItem(`pesewa_loans_${borrowerProfile.id}`);
        
        if (savedLoans) {
            try {
                const allLoans = JSON.parse(savedLoans);
                activeLoans = allLoans.filter(loan => 
                    loan.status === 'active' || loan.status === 'overdue'
                );
                loanHistory = allLoans.filter(loan => 
                    loan.status === 'repaid' || loan.status === 'defaulted'
                );
                console.log('Loans loaded:', { active: activeLoans.length, history: loanHistory.length });
            } catch (error) {
                console.error('Error parsing loans:', error);
                activeLoans = [];
                loanHistory = [];
            }
        } else {
            // Load demo loans
            loadDemoLoans();
        }
        
        // Load loan requests
        loadLoanRequests();
    }

    // Load demo loans
    function loadDemoLoans() {
        const demoLoans = [
            {
                id: 'loan_001',
                lenderId: 'lender_001',
                lenderName: 'Family Support Group',
                category: 'fare',
                amount: 250,
                interest: 25,
                totalDue: 275,
                dateBorrowed: '2024-12-15',
                dueDate: '2024-12-22',
                repaymentDate: '2024-12-21',
                status: 'repaid',
                daysOverdue: 0,
                penalty: 0,
                amountPaid: 275,
                balance: 0,
                rating: 5,
                lenderRating: 4.8,
                notes: 'Transport to job interview',
                groupId: 'family_group_001',
                paymentMethod: 'M-Pesa',
                createdAt: '2024-12-15T10:30:00Z'
            },
            {
                id: 'loan_002',
                lenderId: 'lender_002',
                lenderName: 'Church Benevolence Fund',
                category: 'data',
                amount: 1000,
                interest: 100,
                totalDue: 1100,
                dateBorrowed: '2024-12-18',
                dueDate: '2024-12-25',
                repaymentDate: null,
                status: 'active',
                daysOverdue: 0,
                penalty: 0,
                amountPaid: 0,
                balance: 1100,
                rating: null,
                lenderRating: 4.9,
                notes: 'Internet for online work',
                groupId: 'church_group_001',
                paymentMethod: 'Bank Transfer',
                createdAt: '2024-12-18T14:20:00Z'
            },
            {
                id: 'loan_003',
                lenderId: 'lender_003',
                lenderName: 'Nairobi Professionals',
                category: 'food',
                amount: 500,
                interest: 50,
                totalDue: 550,
                dateBorrowed: '2024-12-10',
                dueDate: '2024-12-17',
                repaymentDate: '2024-12-20',
                status: 'repaid',
                daysOverdue: 3,
                penalty: 82.5,
                amountPaid: 632.5,
                balance: 0,
                rating: 3,
                lenderRating: 4.7,
                notes: 'Groceries for family',
                groupId: 'professionals_group_001',
                paymentMethod: 'M-Pesa',
                createdAt: '2024-12-10T09:15:00Z'
            }
        ];
        
        activeLoans = demoLoans.filter(loan => loan.status === 'active');
        loanHistory = demoLoans.filter(loan => loan.status === 'repaid');
        
        saveLoans();
    }

    // Load available lenders
    function loadAvailableLenders() {
        // In a real app, this would come from the server based on borrower's groups
        // For demo, create some available lenders
        availableLenders = [
            {
                id: 'lender_001',
                name: 'John Kamau',
                rating: 4.8,
                tier: 'premium',
                categories: ['fare', 'food', 'medicine'],
                maxAmount: 5000,
                responseTime: '5 min',
                groupId: 'family_group_001',
                groupName: 'Family Support Group'
            },
            {
                id: 'lender_002',
                name: 'Pastor Samuel',
                rating: 4.9,
                tier: 'super',
                categories: ['data', 'electricity', 'water'],
                maxAmount: 20000,
                responseTime: '10 min',
                groupId: 'church_group_001',
                groupName: 'Church Benevolence Fund'
            },
            {
                id: 'lender_003',
                name: 'Dr. Wangari',
                rating: 4.7,
                tier: 'premium',
                categories: ['credo', 'fuel', 'repair'],
                maxAmount: 5000,
                responseTime: '15 min',
                groupId: 'professionals_group_001',
                groupName: 'Nairobi Professionals'
            }
        ];
    }

    // Load loan requests
    function loadLoanRequests() {
        const savedRequests = localStorage.getItem(`pesewa_requests_${borrowerProfile.id}`);
        
        if (savedRequests) {
            try {
                loanRequests = JSON.parse(savedRequests);
            } catch (error) {
                console.error('Error parsing loan requests:', error);
                loanRequests = [];
            }
        }
    }

    // Request a new loan
    async function requestLoan(requestData) {
        try {
            showLoading('Submitting loan request...');
            
            // Validate borrower can request loans
            if (!canRequestLoans()) {
                throw new Error('You cannot request new loans. Check your borrowing limits or blacklist status.');
            }
            
            // Validate request data
            if (!validateLoanRequest(requestData)) {
                throw new Error('Invalid loan request data');
            }
            
            // Check if borrower has active loan in same group
            if (hasActiveLoanInGroup(requestData.groupId)) {
                throw new Error('You already have an active loan in this group');
            }
            
            // Check borrowing limits
            if (!isWithinBorrowingLimits(requestData.amount)) {
                throw new Error('Loan amount exceeds your borrowing limits');
            }
            
            // Create loan request
            const requestId = 'request_' + Date.now();
            const request = {
                id: requestId,
                borrowerId: borrowerProfile.id,
                borrowerName: borrowerProfile.name,
                borrowerPhone: borrowerProfile.phone,
                borrowerLocation: borrowerProfile.location,
                guarantor1: borrowerProfile.guarantors[0] || { name: 'N/A', phone: 'N/A' },
                guarantor2: borrowerProfile.guarantors[1] || { name: 'N/A', phone: 'N/A' },
                category: requestData.category,
                amount: requestData.amount,
                purpose: requestData.purpose || '',
                groupId: requestData.groupId,
                lenderId: requestData.lenderId,
                status: 'pending',
                dateRequested: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };
            
            // Add to loan requests
            loanRequests.unshift(request);
            
            // Save requests
            saveLoanRequests();
            
            // Dispatch event
            dispatchBorrowingEvent('requestSubmitted', request);
            
            // Simulate lender notification
            simulateLenderNotification(request);
            
            return {
                success: true,
                request: request,
                message: 'Loan request submitted successfully. Lender will respond within 10 minutes.'
            };
            
        } catch (error) {
            console.error('Request loan error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Cancel a loan request
    async function cancelLoanRequest(requestId) {
        try {
            showLoading('Cancelling request...');
            
            // Find the request
            const requestIndex = loanRequests.findIndex(r => r.id === requestId);
            if (requestIndex === -1) {
                throw new Error('Loan request not found');
            }
            
            const request = loanRequests[requestIndex];
            
            // Check if request can be cancelled
            if (request.status !== 'pending') {
                throw new Error('Only pending requests can be cancelled');
            }
            
            // Remove from loan requests
            loanRequests.splice(requestIndex, 1);
            
            // Save requests
            saveLoanRequests();
            
            // Dispatch event
            dispatchBorrowingEvent('requestCancelled', request);
            
            return {
                success: true,
                message: 'Loan request cancelled successfully'
            };
            
        } catch (error) {
            console.error('Cancel loan request error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Repay a loan
    async function repayLoan(loanId, paymentData) {
        try {
            showLoading('Processing repayment...');
            
            // Find the loan
            const loanIndex = activeLoans.findIndex(loan => loan.id === loanId);
            if (loanIndex === -1) {
                throw new Error('Loan not found or not active');
            }
            
            const loan = activeLoans[loanIndex];
            
            // Validate payment
            if (!validatePayment(paymentData, loan)) {
                throw new Error('Invalid payment data');
            }
            
            // Process payment
            const paymentResult = await processPayment(paymentData, loan);
            
            if (!paymentResult.success) {
                throw new Error(paymentResult.message || 'Payment failed');
            }
            
            // Update loan record
            const updatedLoan = updateLoanRepayment(loan, paymentData);
            
            // Update active loans
            if (updatedLoan.status === 'repaid') {
                activeLoans.splice(loanIndex, 1);
                loanHistory.unshift(updatedLoan);
            } else {
                activeLoans[loanIndex] = updatedLoan;
            }
            
            // Save loans
            saveLoans();
            
            // Update borrower stats
            updateBorrowerStats();
            
            // Dispatch events
            dispatchBorrowingEvent('repaymentMade', updatedLoan);
            dispatchBorrowingEvent('loansUpdated', {
                active: activeLoans,
                history: loanHistory
            });
            
            return {
                success: true,
                loan: updatedLoan,
                message: 'Repayment processed successfully'
            };
            
        } catch (error) {
            console.error('Repay loan error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Make partial repayment
    async function makePartialRepayment(loanId, amount) {
        try {
            const paymentData = {
                amount: amount,
                method: 'manual',
                reference: 'partial_' + Date.now(),
                notes: 'Partial repayment'
            };
            
            return await repayLoan(loanId, paymentData);
            
        } catch (error) {
            console.error('Partial repayment error:', error);
            throw error;
        }
    }

    // Get borrower dashboard statistics
    function getDashboardStats() {
        if (!borrowerProfile) return null;
        
        const totalActive = activeLoans.length;
        const totalOverdue = activeLoans.filter(loan => loan.status === 'overdue').length;
        const totalRepaid = loanHistory.length;
        
        const totalBorrowed = [...activeLoans, ...loanHistory].reduce((sum, loan) => sum + loan.amount, 0);
        const totalRepaidAmount = loanHistory.reduce((sum, loan) => sum + loan.amountPaid, 0);
        const totalInterestPaid = loanHistory.reduce((sum, loan) => sum + loan.interest, 0);
        const totalPenaltyPaid = loanHistory.reduce((sum, loan) => sum + (loan.penalty || 0), 0);
        
        const activeBalance = activeLoans.reduce((sum, loan) => sum + loan.balance, 0);
        const totalPaid = totalInterestPaid + totalPenaltyPaid;
        
        return {
            totalLoans: totalActive + totalRepaid,
            totalActive,
            totalOverdue,
            totalRepaid,
            totalBorrowed,
            totalRepaidAmount,
            totalInterestPaid,
            totalPenaltyPaid,
            totalPaid,
            activeBalance,
            repaymentRate: borrowerProfile.repaymentRate,
            avgLoanSize: totalBorrowed / Math.max(totalActive + totalRepaid, 1),
            pendingRequests: loanRequests.length,
            availableLenders: availableLenders.length
        };
    }

    // Get active loans
    function getActiveLoans() {
        return activeLoans;
    }

    // Get loan history
    function getLoanHistory() {
        return loanHistory;
    }

    // Get loan requests
    function getLoanRequests() {
        return loanRequests;
    }

    // Get available lenders
    function getAvailableLenders(groupId = null) {
        let lenders = availableLenders;
        
        if (groupId) {
            lenders = lenders.filter(lender => lender.groupId === groupId);
        }
        
        return lenders;
    }

    // Get lender details
    function getLenderDetails(lenderId) {
        return availableLenders.find(lender => lender.id === lenderId) || null;
    }

    // Get category details
    function getCategoryDetails(categoryId) {
        return CATEGORIES.find(category => category.id === categoryId) || null;
    }

    // Check if borrower can request loans
    function canRequestLoans() {
        if (!borrowerProfile) return false;
        
        // Check if borrower is blacklisted
        if (isBlacklisted()) {
            return false;
        }
        
        // Check active loans count
        if (activeLoans.length >= CONFIG.MAX_GROUPS) {
            return false;
        }
        
        // Check repayment rate
        if (borrowerProfile.repaymentRate < 70) {
            return false;
        }
        
        return true;
    }

    // Check if borrower is blacklisted
    function isBlacklisted() {
        // This would check with the Blacklist module
        // For demo, check localStorage
        const blacklist = localStorage.getItem(`pesewa_blacklist_${borrowerProfile.id}`);
        return blacklist !== null;
    }

    // Check if borrower has active loan in group
    function hasActiveLoanInGroup(groupId) {
        return activeLoans.some(loan => loan.groupId === groupId);
    }

    // Check if amount is within borrowing limits
    function isWithinBorrowingLimits(amount) {
        // Get borrower's tier-based limit
        const tierLimit = getBorrowingLimit();
        
        // Check total active balance
        const activeBalance = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
        
        return (activeBalance + amount) <= tierLimit;
    }

    // Get borrowing limit based on rating
    function getBorrowingLimit() {
        if (!borrowerProfile) return 1500; // Default basic tier
        
        const rating = borrowerProfile.rating || 5.0;
        
        if (rating >= 4.5) {
            return 5000; // Premium tier equivalent
        } else if (rating >= 4.0) {
            return 3000;
        } else if (rating >= 3.0) {
            return 1500; // Basic tier
        } else {
            return 500; // Limited for low ratings
        }
    }

    // Calculate loan terms
    function calculateLoanTerms(amount, days = CONFIG.MAX_REPAYMENT_DAYS) {
        const interest = amount * CONFIG.INTEREST_RATE;
        const total = amount + interest;
        const daily = total / Math.min(days, CONFIG.MAX_REPAYMENT_DAYS);
        
        return {
            amount,
            interest,
            total,
            daily,
            days,
            interestRate: CONFIG.INTEREST_RATE * 100,
            penaltyRate: CONFIG.PENALTY_RATE * 100
        };
    }

    // Calculate penalty for overdue loan
    function calculatePenalty(loan) {
        if (loan.status !== 'overdue') return 0;
        
        const dueDate = new Date(loan.dueDate);
        const today = new Date();
        const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
        
        if (daysOverdue <= 0) return 0;
        
        return loan.totalDue * CONFIG.PENALTY_RATE * daysOverdue;
    }

    // Validate loan request
    function validateLoanRequest(request) {
        if (!request.category || !request.amount || !request.groupId || !request.lenderId) {
            return false;
        }
        
        if (request.amount < CONFIG.MIN_LOAN_AMOUNT) {
            return false;
        }
        
        // Check category exists
        const category = CATEGORIES.find(c => c.id === request.category);
        if (!category) return false;
        
        // Check lender exists
        const lender = availableLenders.find(l => l.id === request.lenderId);
        if (!lender) return false;
        
        // Check lender offers this category
        if (!lender.categories.includes(request.category)) {
            return false;
        }
        
        // Check amount within lender's limit
        if (request.amount > lender.maxAmount) {
            return false;
        }
        
        return true;
    }

    // Validate payment
    function validatePayment(payment, loan) {
        if (!payment.amount || payment.amount <= 0) {
            return false;
        }
        
        if (payment.amount > loan.balance) {
            return false;
        }
        
        return true;
    }

    // Process payment (simulated)
    async function processPayment(payment, loan) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 95% success rate
                const success = Math.random() < 0.95;
                
                if (success) {
                    resolve({
                        success: true,
                        reference: 'PMT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                        message: 'Payment successful'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Payment failed. Please try again.'
                    });
                }
            }, 2000);
        });
    }

    // Update loan repayment
    function updateLoanRepayment(loan, payment) {
        const now = new Date();
        const updatedLoan = { ...loan };
        
        // Add payment
        updatedLoan.amountPaid += payment.amount;
        updatedLoan.balance = updatedLoan.totalDue - updatedLoan.amountPaid;
        
        // Check if fully paid
        if (updatedLoan.balance <= 0) {
            updatedLoan.status = 'repaid';
            updatedLoan.repaymentDate = now.toISOString().split('T')[0];
            
            // Calculate penalty if late
            const dueDate = new Date(updatedLoan.dueDate);
            const daysLate = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));
            
            if (daysLate > 0) {
                updatedLoan.daysOverdue = daysLate;
                updatedLoan.penalty = updatedLoan.totalDue * CONFIG.PENALTY_RATE * daysLate;
            }
        } else if (now > new Date(updatedLoan.dueDate)) {
            // Update overdue status
            const dueDate = new Date(updatedLoan.dueDate);
            updatedLoan.daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
            updatedLoan.status = 'overdue';
        }
        
        // Update payment reference if provided
        if (payment.reference) {
            updatedLoan.lastPaymentRef = payment.reference;
        }
        
        updatedLoan.updatedAt = now.toISOString();
        
        return updatedLoan;
    }

    // Update borrower statistics
    function updateBorrowerStats() {
        if (!borrowerProfile) return;
        
        const stats = getDashboardStats();
        
        borrowerProfile.totalBorrowed = stats.totalBorrowed;
        borrowerProfile.totalRepaid = stats.totalRepaidAmount;
        borrowerProfile.activeLoans = stats.totalActive;
        borrowerProfile.repaymentRate = calculateActualRepaymentRate();
        
        // Update in AuthModule if available
        if (window.AuthModule) {
            const user = window.AuthModule.getCurrentUser();
            if (user) {
                Object.assign(user, {
                    totalBorrowed: borrowerProfile.totalBorrowed,
                    totalRepaid: borrowerProfile.totalRepaid,
                    activeLoans: borrowerProfile.activeLoans,
                    repaymentRate: borrowerProfile.repaymentRate
                });
                
                window.AuthModule.updateProfile({
                    totalBorrowed: borrowerProfile.totalBorrowed,
                    totalRepaid: borrowerProfile.totalRepaid,
                    activeLoans: borrowerProfile.activeLoans,
                    repaymentRate: borrowerProfile.repaymentRate
                }).catch(console.error);
            }
        }
    }

    // Calculate actual repayment rate
    function calculateActualRepaymentRate() {
        const allLoans = [...activeLoans, ...loanHistory];
        if (allLoans.length === 0) return 100;
        
        const repaidLoans = allLoans.filter(loan => loan.status === 'repaid').length;
        return Math.round((repaidLoans / allLoans.length) * 100);
    }

    // Save loans
    function saveLoans() {
        if (!borrowerProfile) return;
        
        try {
            const allLoans = [...activeLoans, ...loanHistory];
            localStorage.setItem(`pesewa_loans_${borrowerProfile.id}`, JSON.stringify(allLoans));
        } catch (error) {
            console.error('Error saving loans:', error);
        }
    }

    // Save loan requests
    function saveLoanRequests() {
        if (!borrowerProfile) return;
        
        try {
            localStorage.setItem(`pesewa_requests_${borrowerProfile.id}`, JSON.stringify(loanRequests));
        } catch (error) {
            console.error('Error saving loan requests:', error);
        }
    }

    // Simulate lender notification
    function simulateLenderNotification(request) {
        // In a real app, this would trigger a notification to the lender
        // For demo, just log it
        console.log(`Notification sent to lender ${request.lenderId} for loan request ${request.id}`);
        
        // Simulate auto-approval after delay for demo
        setTimeout(() => {
            simulateAutoApproval(request);
        }, 5000);
    }

    // Simulate auto-approval for demo
    function simulateAutoApproval(request) {
        // Only auto-approve if request is still pending
        const requestIndex = loanRequests.findIndex(r => r.id === request.id);
        if (requestIndex === -1 || loanRequests[requestIndex].status !== 'pending') return;
        
        // Update request status
        loanRequests[requestIndex].status = 'approved';
        loanRequests[requestIndex].approvedAt = new Date().toISOString();
        
        // Create loan record
        const loanId = 'loan_' + Date.now();
        const loan = createLoanFromRequest(loanId, request);
        
        // Add to active loans
        activeLoans.unshift(loan);
        
        // Save data
        saveLoanRequests();
        saveLoans();
        
        // Update borrower stats
        updateBorrowerStats();
        
        // Dispatch events
        dispatchBorrowingEvent('requestApproved', request);
        dispatchBorrowingEvent('loanCreated', loan);
        dispatchBorrowingEvent('loansUpdated', {
            active: activeLoans,
            history: loanHistory
        });
        
        // Show notification to user
        if (window.PesewaApp) {
            window.PesewaApp.showNotification(
                `Your loan request for ${window.PesewaApp.formatCurrency(request.amount)} has been approved!`,
                'success'
            );
        }
    }

    // Create loan from approved request
    function createLoanFromRequest(loanId, request) {
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + CONFIG.MAX_REPAYMENT_DAYS);
        
        const terms = calculateLoanTerms(request.amount);
        
        const lender = getLenderDetails(request.lenderId);
        
        return {
            id: loanId,
            lenderId: request.lenderId,
            lenderName: lender ? lender.name : 'Unknown Lender',
            category: request.category,
            amount: request.amount,
            interest: terms.interest,
            totalDue: terms.total,
            dateBorrowed: now.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            repaymentDate: null,
            status: 'active',
            daysOverdue: 0,
            penalty: 0,
            amountPaid: 0,
            balance: terms.total,
            rating: null,
            lenderRating: lender ? lender.rating : 5.0,
            notes: request.purpose,
            groupId: request.groupId,
            paymentMethod: 'Not specified',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };
    }

    // Initialize borrowing UI
    function initBorrowingUI() {
        // This would initialize any UI components specific to borrowing
        console.log('Borrowing UI initialized');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Listen for auth changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.type === 'loggedIn') {
                loadBorrowerData();
            } else if (e.detail.type === 'loggedOut') {
                borrowerProfile = null;
                activeLoans = [];
                loanHistory = [];
                availableLenders = [];
                loanRequests = [];
            }
        });
        
        // Listen for group changes
        document.addEventListener('groupsUpdated', (e) => {
            if (borrowerProfile) {
                // Reload available lenders based on new groups
                loadAvailableLenders();
            }
        });
    }

    // Dispatch borrowing event
    function dispatchBorrowingEvent(type, data) {
        const event = new CustomEvent('borrowingEvent', {
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
        CATEGORIES,
        requestLoan,
        cancelLoanRequest,
        repayLoan,
        makePartialRepayment,
        getDashboardStats,
        getActiveLoans,
        getLoanHistory,
        getLoanRequests,
        getAvailableLenders,
        getLenderDetails,
        getCategoryDetails,
        canRequestLoans,
        isBlacklisted,
        getBorrowingLimit,
        calculateLoanTerms,
        calculatePenalty,
        validateLoanRequest
    };
})();

// Initialize borrowing module
document.addEventListener('DOMContentLoaded', BorrowingModule.init);

// Export for use in other modules
window.BorrowingModule = BorrowingModule;