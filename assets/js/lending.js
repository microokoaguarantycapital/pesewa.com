'use strict';

// Lending Module
const LendingModule = (function() {
    // Lending configuration
    const CONFIG = {
        INTEREST_RATE: 0.10, // 10% weekly
        MAX_REPAYMENT_DAYS: 7,
        PENALTY_RATE: 0.05, // 5% daily after due date
        DEFAULT_PERIOD: 60, // Days until default (2 months)
        MIN_LOAN_AMOUNT: 5,
        DISBURSEMENT_TIME: 10 // Minutes
    };

    // Loan categories
    const CATEGORIES = [
        { id: 'fare', name: 'PesewaFare', icon: '🚌', maxAmount: 5000 },
        { id: 'data', name: 'PesewaData', icon: '📱', maxAmount: 2000 },
        { id: 'gas', name: 'PesewaCookingGas', icon: '🔥', maxAmount: 3000 },
        { id: 'food', name: 'PesewaFood', icon: '🍲', maxAmount: 3000 },
        { id: 'credo', name: 'Pesewacredo', icon: '🔧', maxAmount: 10000 },
        { id: 'water', name: 'PesewaWaterBill', icon: '💧', maxAmount: 2000 },
        { id: 'fuel', name: 'PesewaBikeCarTuktukFuel', icon: '⛽', maxAmount: 5000 },
        { id: 'repair', name: 'PesewaBikeCarTuktukRepair', icon: '🛠️', maxAmount: 8000 },
        { id: 'medicine', name: 'PesewaMedicine', icon: '💊', maxAmount: 5000 },
        { id: 'electricity', name: 'PesewaElectricityTokens', icon: '💡', maxAmount: 3000 },
        { id: 'schoolfees', name: 'Pesewaschoolfees', icon: '🎓', maxAmount: 20000 },
        { id: 'tv', name: 'PesewaTVSubscription', icon: '📺', maxAmount: 1000 }
    ];

    // Current lender state
    let lenderProfile = null;
    let activeLoans = [];
    let ledgerEntries = [];
    let pendingRequests = [];

    // Initialize module
    function init() {
        console.log('Lending Module Initialized');
        
        // Load lender data
        loadLenderData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize lending UI
        initLendingUI();
    }

    // Load lender data
    function loadLenderData() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        
        if (user && window.RolesModule && window.RolesModule.isLender()) {
            lenderProfile = {
                id: user.id,
                name: user.name,
                phone: user.phone,
                tier: user.tier,
                subscriptionActive: user.subscriptionActive || false,
                subscriptionExpiry: user.subscriptionExpiry || null,
                categories: user.categories || [],
                totalLent: user.totalLent || 0,
                totalEarned: user.totalEarned || 0,
                activeLoans: user.activeLoans || 0,
                repaymentRate: user.repaymentRate || 100,
                rating: user.rating || 5.0,
                ledgerCount: user.ledgerCount || 0
            };
            
            // Load ledger entries
            loadLedgerEntries();
            
            // Load active loans
            loadActiveLoans();
            
            // Load pending requests
            loadPendingRequests();
            
            console.log('Lender profile loaded:', lenderProfile);
        } else {
            console.log('User is not a lender or not logged in');
        }
    }

    // Load ledger entries
    function loadLedgerEntries() {
        const savedLedger = localStorage.getItem(`pesewa_ledger_${lenderProfile.id}`);
        
        if (savedLedger) {
            try {
                ledgerEntries = JSON.parse(savedLedger);
                console.log('Ledger entries loaded:', ledgerEntries.length);
            } catch (error) {
                console.error('Error parsing ledger entries:', error);
                ledgerEntries = [];
            }
        } else {
            // Load demo ledger entries
            loadDemoLedger();
        }
    }

    // Load demo ledger entries
    function loadDemoLedger() {
        ledgerEntries = [
            {
                id: 'loan_001',
                borrowerId: 'borrower_001',
                borrowerName: 'John Kimani',
                borrowerPhone: '0721000001',
                borrowerLocation: 'Nairobi',
                guarantor1: { name: 'Mary Wanjiku', phone: '0721000002' },
                guarantor2: { name: 'James Mwangi', phone: '0721000003' },
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
                notes: 'Paid early. Good borrower.',
                createdAt: '2024-12-15T10:30:00Z'
            },
            {
                id: 'loan_002',
                borrowerId: 'borrower_002',
                borrowerName: 'Sarah Achieng',
                borrowerPhone: '0721000004',
                borrowerLocation: 'Kisumu',
                guarantor1: { name: 'Peter Odhiambo', phone: '0721000005' },
                guarantor2: { name: 'Grace Akinyi', phone: '0721000006' },
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
                notes: 'For online work. Due in 3 days.',
                createdAt: '2024-12-18T14:20:00Z'
            },
            {
                id: 'loan_003',
                borrowerId: 'borrower_003',
                borrowerName: 'David Omondi',
                borrowerPhone: '0721000007',
                borrowerLocation: 'Mombasa',
                guarantor1: { name: 'Susan Atieno', phone: '0721000008' },
                guarantor2: { name: 'Robert Ochieng', phone: '0721000009' },
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
                notes: 'Paid 3 days late with penalty.',
                createdAt: '2024-12-10T09:15:00Z'
            },
            {
                id: 'loan_004',
                borrowerId: 'borrower_004',
                borrowerName: 'Esther Wambui',
                borrowerPhone: '0721000010',
                borrowerLocation: 'Nakuru',
                guarantor1: { name: 'Daniel Kamau', phone: '0721000011' },
                guarantor2: { name: 'Lucy Njeri', phone: '0721000012' },
                category: 'medicine',
                amount: 1500,
                interest: 150,
                totalDue: 1650,
                dateBorrowed: '2024-12-05',
                dueDate: '2024-12-12',
                repaymentDate: null,
                status: 'overdue',
                daysOverdue: 10,
                penalty: 825,
                amountPaid: 500,
                balance: 1975,
                rating: 1,
                notes: 'Partial payment received. Following up.',
                createdAt: '2024-12-05T11:45:00Z'
            }
        ];
        
        saveLedgerEntries();
    }

    // Load active loans
    function loadActiveLoans() {
        activeLoans = ledgerEntries.filter(entry => 
            entry.status === 'active' || entry.status === 'overdue'
        );
    }

    // Load pending requests
    function loadPendingRequests() {
        // In a real app, this would come from the server
        // For demo, create some pending requests
        pendingRequests = [
            {
                id: 'request_001',
                borrowerId: 'borrower_005',
                borrowerName: 'Michael Kipchoge',
                borrowerPhone: '0721000013',
                borrowerLocation: 'Eldoret',
                category: 'schoolfees',
                amount: 5000,
                purpose: 'School fees for final semester',
                dateRequested: '2024-12-22',
                status: 'pending',
                borrowerRating: 4.8,
                previousLoans: 3,
                repaymentRate: 100
            },
            {
                id: 'request_002',
                borrowerId: 'borrower_006',
                borrowerName: 'Joyce Muthoni',
                borrowerPhone: '0721000014',
                borrowerLocation: 'Thika',
                category: 'fuel',
                amount: 800,
                purpose: 'Fuel for boda boda business',
                dateRequested: '2024-12-21',
                status: 'pending',
                borrowerRating: 4.5,
                previousLoans: 2,
                repaymentRate: 100
            }
        ];
    }

    // Create a new loan offer
    async function createLoanOffer(offerData) {
        try {
            showLoading('Creating loan offer...');
            
            // Validate lender can offer loans
            if (!canOfferLoans()) {
                throw new Error('You cannot offer loans. Check your subscription status.');
            }
            
            // Validate offer data
            if (!validateLoanOffer(offerData)) {
                throw new Error('Invalid loan offer data');
            }
            
            // Check if amount exceeds tier limit
            if (!isAmountWithinLimit(offerData.amount)) {
                throw new Error(`Loan amount exceeds your tier limit (${getTierLimit()} per week)`);
            }
            
            // Check if category is offered by lender
            if (!isCategoryOffered(offerData.category)) {
                throw new Error('You do not offer loans in this category');
            }
            
            // Create loan offer
            const offerId = 'offer_' + Date.now();
            const offer = {
                id: offerId,
                lenderId: lenderProfile.id,
                lenderName: lenderProfile.name,
                category: offerData.category,
                amount: offerData.amount,
                interestRate: CONFIG.INTEREST_RATE,
                maxRepaymentDays: CONFIG.MAX_REPAYMENT_DAYS,
                penaltyRate: CONFIG.PENALTY_RATE,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Save offer (in real app, this would be to server)
            // For demo, save to localStorage
            saveLoanOffer(offer);
            
            // Update lender stats
            updateLenderStats();
            
            // Dispatch event
            dispatchLendingEvent('offerCreated', offer);
            
            return {
                success: true,
                offer: offer,
                message: 'Loan offer created successfully'
            };
            
        } catch (error) {
            console.error('Create loan offer error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Approve a loan request
    async function approveLoan(requestId, terms) {
        try {
            showLoading('Approving loan...');
            
            // Find the request
            const request = pendingRequests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Loan request not found');
            }
            
            // Validate lender can approve loans
            if (!canOfferLoans()) {
                throw new Error('You cannot approve loans. Check your subscription status.');
            }
            
            // Validate terms
            if (!validateLoanTerms(terms, request)) {
                throw new Error('Invalid loan terms');
            }
            
            // Check if amount exceeds tier limit
            if (!isAmountWithinLimit(terms.amount)) {
                throw new Error(`Loan amount exceeds your tier limit (${getTierLimit()} per week)`);
            }
            
            // Create ledger entry
            const loanId = 'loan_' + Date.now();
            const ledgerEntry = createLedgerEntry(loanId, request, terms);
            
            // Add to ledger
            ledgerEntries.unshift(ledgerEntry);
            
            // Update active loans
            activeLoans = ledgerEntries.filter(entry => 
                entry.status === 'active' || entry.status === 'overdue'
            );
            
            // Remove from pending requests
            pendingRequests = pendingRequests.filter(r => r.id !== requestId);
            
            // Save ledger
            saveLedgerEntries();
            
            // Update lender stats
            updateLenderStats();
            
            // Dispatch events
            dispatchLendingEvent('loanApproved', ledgerEntry);
            dispatchLendingEvent('ledgerUpdated', ledgerEntries);
            
            return {
                success: true,
                loan: ledgerEntry,
                message: 'Loan approved successfully. Ledger updated.'
            };
            
        } catch (error) {
            console.error('Approve loan error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Reject a loan request
    async function rejectLoan(requestId, reason) {
        try {
            showLoading('Rejecting loan...');
            
            // Find the request
            const request = pendingRequests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Loan request not found');
            }
            
            // Remove from pending requests
            pendingRequests = pendingRequests.filter(r => r.id !== requestId);
            
            // Dispatch event
            dispatchLendingEvent('loanRejected', { requestId, reason });
            
            return {
                success: true,
                message: 'Loan request rejected'
            };
            
        } catch (error) {
            console.error('Reject loan error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Record a loan repayment
    async function recordRepayment(loanId, paymentData) {
        try {
            showLoading('Recording repayment...');
            
            // Find the loan
            const loanIndex = ledgerEntries.findIndex(entry => entry.id === loanId);
            if (loanIndex === -1) {
                throw new Error('Loan not found');
            }
            
            const loan = ledgerEntries[loanIndex];
            
            // Validate payment
            if (!validatePayment(paymentData, loan)) {
                throw new Error('Invalid payment data');
            }
            
            // Update loan record
            const updatedLoan = updateLoanRepayment(loan, paymentData);
            
            // Replace in ledger
            ledgerEntries[loanIndex] = updatedLoan;
            
            // Update active loans
            activeLoans = ledgerEntries.filter(entry => 
                entry.status === 'active' || entry.status === 'overdue'
            );
            
            // Save ledger
            saveLedgerEntries();
            
            // Update lender stats
            updateLenderStats();
            
            // Dispatch events
            dispatchLendingEvent('repaymentRecorded', updatedLoan);
            dispatchLendingEvent('ledgerUpdated', ledgerEntries);
            
            return {
                success: true,
                loan: updatedLoan,
                message: 'Repayment recorded successfully'
            };
            
        } catch (error) {
            console.error('Record repayment error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Rate a borrower after loan completion
    async function rateBorrower(loanId, rating, feedback) {
        try {
            showLoading('Submitting rating...');
            
            // Find the loan
            const loanIndex = ledgerEntries.findIndex(entry => entry.id === loanId);
            if (loanIndex === -1) {
                throw new Error('Loan not found');
            }
            
            const loan = ledgerEntries[loanIndex];
            
            // Validate rating
            if (!rating || rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            
            // Update loan with rating
            loan.rating = rating;
            loan.notes = loan.notes ? loan.notes + '\n' + feedback : feedback;
            loan.updatedAt = new Date().toISOString();
            
            // Replace in ledger
            ledgerEntries[loanIndex] = loan;
            
            // Save ledger
            saveLedgerEntries();
            
            // Dispatch event
            dispatchLendingEvent('borrowerRated', { loanId, rating, feedback });
            
            return {
                success: true,
                message: 'Rating submitted successfully'
            };
            
        } catch (error) {
            console.error('Rate borrower error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Blacklist a borrower
    async function blacklistBorrower(loanId, reason) {
        try {
            showLoading('Blacklisting borrower...');
            
            // Find the loan
            const loanIndex = ledgerEntries.findIndex(entry => entry.id === loanId);
            if (loanIndex === -1) {
                throw new Error('Loan not found');
            }
            
            const loan = ledgerEntries[loanIndex];
            
            // Check if loan is overdue enough for blacklist
            if (!canBlacklistBorrower(loan)) {
                throw new Error('Borrower cannot be blacklisted yet. Minimum 2 months overdue required.');
            }
            
            // Update loan status
            loan.status = 'blacklisted';
            loan.blacklistReason = reason;
            loan.blacklistDate = new Date().toISOString().split('T')[0];
            loan.updatedAt = new Date().toISOString();
            
            // Replace in ledger
            ledgerEntries[loanIndex] = loan;
            
            // Save ledger
            saveLedgerEntries();
            
            // Dispatch event to blacklist module
            dispatchBlacklistEvent(loan);
            
            // Dispatch lending event
            dispatchLendingEvent('borrowerBlacklisted', loan);
            
            return {
                success: true,
                message: 'Borrower blacklisted successfully'
            };
            
        } catch (error) {
            console.error('Blacklist borrower error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Remove blacklist from borrower
    async function removeBlacklist(loanId) {
        try {
            showLoading('Removing blacklist...');
            
            // Find the loan
            const loanIndex = ledgerEntries.findIndex(entry => entry.id === loanId);
            if (loanIndex === -1) {
                throw new Error('Loan not found');
            }
            
            const loan = ledgerEntries[loanIndex];
            
            // Check if loan is fully repaid
            if (loan.balance > 0) {
                throw new Error('Cannot remove blacklist until loan is fully repaid');
            }
            
            // Update loan status
            loan.status = 'repaid';
            delete loan.blacklistReason;
            delete loan.blacklistDate;
            loan.updatedAt = new Date().toISOString();
            
            // Replace in ledger
            ledgerEntries[loanIndex] = loan;
            
            // Save ledger
            saveLedgerEntries();
            
            // Dispatch event to blacklist module
            dispatchRemoveBlacklistEvent(loan);
            
            // Dispatch lending event
            dispatchLendingEvent('blacklistRemoved', loan);
            
            return {
                success: true,
                message: 'Blacklist removed successfully'
            };
            
        } catch (error) {
            console.error('Remove blacklist error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Get lender dashboard statistics
    function getDashboardStats() {
        if (!lenderProfile) return null;
        
        const totalActive = activeLoans.length;
        const totalOverdue = ledgerEntries.filter(entry => entry.status === 'overdue').length;
        const totalRepaid = ledgerEntries.filter(entry => entry.status === 'repaid').length;
        const totalBlacklisted = ledgerEntries.filter(entry => entry.status === 'blacklisted').length;
        
        const totalAmountLent = ledgerEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const totalInterestEarned = ledgerEntries
            .filter(entry => entry.status === 'repaid')
            .reduce((sum, entry) => sum + entry.interest, 0);
        const totalPenaltyEarned = ledgerEntries
            .filter(entry => entry.status === 'repaid')
            .reduce((sum, entry) => sum + (entry.penalty || 0), 0);
        
        const totalEarned = totalInterestEarned + totalPenaltyEarned;
        const activeBalance = ledgerEntries
            .filter(entry => entry.status === 'active' || entry.status === 'overdue')
            .reduce((sum, entry) => sum + entry.balance, 0);
        
        return {
            totalLoans: ledgerEntries.length,
            totalActive,
            totalOverdue,
            totalRepaid,
            totalBlacklisted,
            totalAmountLent,
            totalInterestEarned,
            totalPenaltyEarned,
            totalEarned,
            activeBalance,
            repaymentRate: calculateRepaymentRate(),
            avgLoanSize: totalAmountLent / Math.max(ledgerEntries.length, 1),
            pendingRequests: pendingRequests.length
        };
    }

    // Get ledger entries with filters
    function getLedgerEntries(filters = {}) {
        let entries = [...ledgerEntries];
        
        // Apply filters
        if (filters.status) {
            entries = entries.filter(entry => entry.status === filters.status);
        }
        
        if (filters.category) {
            entries = entries.filter(entry => entry.category === filters.category);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            entries = entries.filter(entry => 
                entry.borrowerName.toLowerCase().includes(searchTerm) ||
                entry.borrowerPhone.includes(searchTerm) ||
                entry.id.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.startDate) {
            entries = entries.filter(entry => entry.dateBorrowed >= filters.startDate);
        }
        
        if (filters.endDate) {
            entries = entries.filter(entry => entry.dateBorrowed <= filters.endDate);
        }
        
        // Sort
        if (filters.sortBy) {
            entries.sort((a, b) => {
                if (filters.sortBy === 'date') {
                    return new Date(b.dateBorrowed) - new Date(a.dateBorrowed);
                } else if (filters.sortBy === 'amount') {
                    return b.amount - a.amount;
                } else if (filters.sortBy === 'balance') {
                    return b.balance - a.balance;
                }
                return 0;
            });
        } else {
            // Default sort by date (newest first)
            entries.sort((a, b) => new Date(b.dateBorrowed) - new Date(a.dateBorrowed));
        }
        
        return entries;
    }

    // Get active loans
    function getActiveLoans() {
        return activeLoans;
    }

    // Get pending requests
    function getPendingRequests() {
        return pendingRequests;
    }

    // Get categories offered by lender
    function getOfferedCategories() {
        if (!lenderProfile || !lenderProfile.categories) return [];
        
        return CATEGORIES.filter(category => 
            lenderProfile.categories.includes(category.id)
        );
    }

    // Check if lender can offer loans
    function canOfferLoans() {
        if (!lenderProfile) return false;
        
        // Check subscription status
        if (!lenderProfile.subscriptionActive) return false;
        
        // Check subscription expiry
        if (lenderProfile.subscriptionExpiry) {
            const expiryDate = new Date(lenderProfile.subscriptionExpiry);
            const today = new Date();
            if (expiryDate < today) return false;
        }
        
        return true;
    }

    // Get tier limit
    function getTierLimit() {
        if (!lenderProfile || !lenderProfile.tier) return 0;
        
        const tier = window.RolesModule ? window.RolesModule.getTierDetails(lenderProfile.tier) : null;
        return tier ? tier.maxWeekly : 0;
    }

    // Check if amount is within tier limit
    function isAmountWithinLimit(amount) {
        const tierLimit = getTierLimit();
        return amount <= tierLimit;
    }

    // Check if lender offers a category
    function isCategoryOffered(categoryId) {
        if (!lenderProfile || !lenderProfile.categories) return false;
        return lenderProfile.categories.includes(categoryId);
    }

    // Calculate repayment rate
    function calculateRepaymentRate() {
        const totalLoans = ledgerEntries.length;
        if (totalLoans === 0) return 100;
        
        const repaidLoans = ledgerEntries.filter(entry => entry.status === 'repaid').length;
        return Math.round((repaidLoans / totalLoans) * 100);
    }

    // Validate loan offer
    function validateLoanOffer(offer) {
        if (!offer.category || !offer.amount) {
            return false;
        }
        
        if (offer.amount < CONFIG.MIN_LOAN_AMOUNT) {
            return false;
        }
        
        const category = CATEGORIES.find(c => c.id === offer.category);
        if (!category) return false;
        
        if (offer.amount > category.maxAmount) {
            return false;
        }
        
        return true;
    }

    // Validate loan terms
    function validateLoanTerms(terms, request) {
        if (!terms.amount || !terms.repaymentDays) {
            return false;
        }
        
        if (terms.amount < CONFIG.MIN_LOAN_AMOUNT) {
            return false;
        }
        
        if (terms.repaymentDays < 1 || terms.repaymentDays > CONFIG.MAX_REPAYMENT_DAYS) {
            return false;
        }
        
        if (terms.amount > request.amount * 1.5) {
            return false; // Cannot exceed requested amount by more than 50%
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

    // Check if borrower can be blacklisted
    function canBlacklistBorrower(loan) {
        if (loan.status !== 'overdue') return false;
        
        const dueDate = new Date(loan.dueDate);
        const today = new Date();
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        return daysOverdue >= CONFIG.DEFAULT_PERIOD;
    }

    // Create ledger entry
    function createLedgerEntry(loanId, request, terms) {
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + terms.repaymentDays);
        
        const interest = terms.amount * CONFIG.INTEREST_RATE;
        const totalDue = terms.amount + interest;
        
        return {
            id: loanId,
            borrowerId: request.borrowerId,
            borrowerName: request.borrowerName,
            borrowerPhone: request.borrowerPhone,
            borrowerLocation: request.borrowerLocation,
            guarantor1: request.guarantor1 || { name: 'N/A', phone: 'N/A' },
            guarantor2: request.guarantor2 || { name: 'N/A', phone: 'N/A' },
            category: request.category,
            amount: terms.amount,
            interest: interest,
            totalDue: totalDue,
            dateBorrowed: now.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            repaymentDate: null,
            status: 'active',
            daysOverdue: 0,
            penalty: 0,
            amountPaid: 0,
            balance: totalDue,
            rating: null,
            notes: request.purpose || '',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };
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
        
        updatedLoan.updatedAt = now.toISOString();
        
        return updatedLoan;
    }

    // Update lender statistics
    function updateLenderStats() {
        if (!lenderProfile) return;
        
        const stats = getDashboardStats();
        
        lenderProfile.totalLent = stats.totalAmountLent;
        lenderProfile.totalEarned = stats.totalEarned;
        lenderProfile.activeLoans = stats.totalActive;
        lenderProfile.repaymentRate = stats.repaymentRate;
        lenderProfile.ledgerCount = ledgerEntries.length;
        
        // Update in AuthModule if available
        if (window.AuthModule) {
            const user = window.AuthModule.getCurrentUser();
            if (user) {
                Object.assign(user, {
                    totalLent: lenderProfile.totalLent,
                    totalEarned: lenderProfile.totalEarned,
                    activeLoans: lenderProfile.activeLoans,
                    repaymentRate: lenderProfile.repaymentRate
                });
                
                window.AuthModule.updateProfile({
                    totalLent: lenderProfile.totalLent,
                    totalEarned: lenderProfile.totalEarned,
                    activeLoans: lenderProfile.activeLoans,
                    repaymentRate: lenderProfile.repaymentRate
                }).catch(console.error);
            }
        }
    }

    // Save ledger entries
    function saveLedgerEntries() {
        if (!lenderProfile) return;
        
        try {
            localStorage.setItem(`pesewa_ledger_${lenderProfile.id}`, JSON.stringify(ledgerEntries));
        } catch (error) {
            console.error('Error saving ledger entries:', error);
        }
    }

    // Save loan offer
    function saveLoanOffer(offer) {
        // In a real app, this would be saved to server
        // For demo, save to localStorage
        try {
            const offers = JSON.parse(localStorage.getItem('pesewa_loan_offers') || '[]');
            offers.push(offer);
            localStorage.setItem('pesewa_loan_offers', JSON.stringify(offers));
        } catch (error) {
            console.error('Error saving loan offer:', error);
        }
    }

    // Initialize lending UI
    function initLendingUI() {
        // This would initialize any UI components specific to lending
        console.log('Lending UI initialized');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Listen for auth changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.type === 'loggedIn') {
                loadLenderData();
            } else if (e.detail.type === 'loggedOut') {
                lenderProfile = null;
                activeLoans = [];
                ledgerEntries = [];
                pendingRequests = [];
            }
        });
        
        // Listen for subscription updates
        document.addEventListener('subscriptionUpdated', (e) => {
            if (lenderProfile && e.detail.userId === lenderProfile.id) {
                lenderProfile.subscriptionActive = e.detail.active;
                lenderProfile.subscriptionExpiry = e.detail.expiry;
            }
        });
    }

    // Dispatch lending event
    function dispatchLendingEvent(type, data) {
        const event = new CustomEvent('lendingEvent', {
            detail: { type, data }
        });
        document.dispatchEvent(event);
    }

    // Dispatch blacklist event
    function dispatchBlacklistEvent(loan) {
        const event = new CustomEvent('blacklistAdded', {
            detail: {
                borrowerId: loan.borrowerId,
                borrowerName: loan.borrowerName,
                amount: loan.balance,
                daysOverdue: loan.daysOverdue,
                lenderId: lenderProfile.id,
                lenderName: lenderProfile.name,
                loanId: loan.id
            }
        });
        document.dispatchEvent(event);
    }

    // Dispatch remove blacklist event
    function dispatchRemoveBlacklistEvent(loan) {
        const event = new CustomEvent('blacklistRemoved', {
            detail: {
                borrowerId: loan.borrowerId,
                loanId: loan.id
            }
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
        createLoanOffer,
        approveLoan,
        rejectLoan,
        recordRepayment,
        rateBorrower,
        blacklistBorrower,
        removeBlacklist,
        getDashboardStats,
        getLedgerEntries,
        getActiveLoans,
        getPendingRequests,
        getOfferedCategories,
        canOfferLoans,
        getTierLimit,
        isCategoryOffered,
        validateLoanOffer
    };
})();

// Initialize lending module
document.addEventListener('DOMContentLoaded', LendingModule.init);

// Export for use in other modules
window.LendingModule = LendingModule;