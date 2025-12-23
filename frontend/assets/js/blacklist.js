'use strict';

// Blacklist Module
const BlacklistModule = (function() {
    // Blacklist configuration
    const CONFIG = {
        DEFAULT_DAYS: 60, // Days until automatic blacklisting
        PENALTY_RATE: 0.05, // 5% daily penalty
        MIN_OVERDUE_AMOUNT: 100, // Minimum amount to be blacklisted
        AUTO_BLACKLIST: true, // Auto-blacklist after default period
        REMOVAL_DAYS: 30 // Days after repayment to auto-remove from blacklist
    };

    // Blacklist entry template
    const BLACKLIST_TEMPLATE = {
        id: '',
        borrowerId: '',
        borrowerName: '',
        borrowerPhone: '',
        borrowerLocation: '',
        lenderId: '',
        lenderName: '',
        loanId: '',
        amount: 0,
        interest: 0,
        penalty: 0,
        totalDue: 0,
        amountPaid: 0,
        balance: 0,
        dateBorrowed: '',
        dueDate: '',
        blacklistDate: '',
        daysOverdue: 0,
        reason: '',
        status: 'active', // active, cleared, appealed
        appealReason: '',
        appealStatus: '', // pending, approved, rejected
        appealDate: '',
        appealDecision: '',
        appealDecidedBy: '',
        appealDecisionDate: '',
        removalDate: '',
        removedBy: '',
        notes: '',
        createdAt: '',
        updatedAt: ''
    };

    // Current blacklist state
    let blacklistEntries = [];
    let blacklistStats = null;

    // Initialize module
    function init() {
        console.log('Blacklist Module Initialized');
        
        // Load blacklist data
        loadBlacklistData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize blacklist UI
        initBlacklistUI();
        
        // Start periodic checks
        startPeriodicChecks();
    }

    // Load blacklist data
    function loadBlacklistData() {
        // Try to load from localStorage
        const savedBlacklist = localStorage.getItem('pesewa_blacklist');
        
        if (savedBlacklist) {
            try {
                blacklistEntries = JSON.parse(savedBlacklist);
                console.log('Blacklist entries loaded:', blacklistEntries.length);
            } catch (error) {
                console.error('Error parsing blacklist entries:', error);
                blacklistEntries = [];
            }
        } else {
            // Load demo blacklist data
            loadDemoBlacklist();
        }
        
        // Calculate statistics
        calculateStats();
    }

    // Load demo blacklist
    function loadDemoBlacklist() {
        blacklistEntries = [
            {
                id: 'blacklist_001',
                borrowerId: 'borrower_005',
                borrowerName: 'Michael Kipchoge',
                borrowerPhone: '0721000013',
                borrowerLocation: 'Eldoret',
                lenderId: 'lender_demo',
                lenderName: 'Demo Lender',
                loanId: 'loan_005',
                amount: 5000,
                interest: 500,
                penalty: 12100,
                totalDue: 5500,
                amountPaid: 1000,
                balance: 16600,
                dateBorrowed: '2024-11-01',
                dueDate: '2024-11-08',
                blacklistDate: '2024-12-01',
                daysOverdue: 44,
                reason: 'Defaulted on school fees loan. No communication.',
                status: 'active',
                appealReason: '',
                appealStatus: '',
                appealDate: '',
                appealDecision: '',
                appealDecidedBy: '',
                appealDecisionDate: '',
                removalDate: '',
                removedBy: '',
                notes: 'Sent to debt collectors. Guarantors notified.',
                createdAt: '2024-12-01T09:00:00Z',
                updatedAt: '2024-12-01T09:00:00Z'
            },
            {
                id: 'blacklist_002',
                borrowerId: 'borrower_006',
                borrowerName: 'Joyce Muthoni',
                borrowerPhone: '0721000014',
                borrowerLocation: 'Thika',
                lenderId: 'lender_002',
                lenderName: 'Pastor Samuel',
                loanId: 'loan_006',
                amount: 3000,
                interest: 300,
                penalty: 4950,
                totalDue: 3300,
                amountPaid: 1500,
                balance: 6750,
                dateBorrowed: '2024-10-15',
                dueDate: '2024-10-22',
                blacklistDate: '2024-11-22',
                daysOverdue: 61,
                reason: 'Repeated late payments. Now completely defaulted.',
                status: 'cleared',
                appealReason: 'Had medical emergency in family',
                appealStatus: 'approved',
                appealDate: '2024-11-25',
                appealDecision: 'Payment plan approved',
                appealDecidedBy: 'admin_001',
                appealDecisionDate: '2024-11-28',
                removalDate: '2024-12-05',
                removedBy: 'lender_002',
                notes: 'Cleared balance on 2024-12-05. Removed from blacklist.',
                createdAt: '2024-11-22T11:30:00Z',
                updatedAt: '2024-12-05T14:15:00Z'
            },
            {
                id: 'blacklist_003',
                borrowerId: 'borrower_007',
                borrowerName: 'David Ochieng',
                borrowerPhone: '0721000015',
                borrowerLocation: 'Kisumu',
                lenderId: 'lender_003',
                lenderName: 'Dr. Wangari',
                loanId: 'loan_007',
                amount: 2000,
                interest: 200,
                penalty: 3300,
                totalDue: 2200,
                amountPaid: 500,
                balance: 5000,
                dateBorrowed: '2024-11-10',
                dueDate: '2024-11-17',
                blacklistDate: '2024-12-17',
                daysOverdue: 30,
                reason: 'Partial payment then disappeared.',
                status: 'active',
                appealReason: 'Lost phone, could not communicate',
                appealStatus: 'pending',
                appealDate: '2024-12-20',
                appealDecision: '',
                appealDecidedBy: '',
                appealDecisionDate: '',
                removalDate: '',
                removedBy: '',
                notes: 'Attempting to contact through guarantors.',
                createdAt: '2024-12-17T10:00:00Z',
                updatedAt: '2024-12-20T09:30:00Z'
            }
        ];
        
        saveBlacklistEntries();
    }

    // Add borrower to blacklist
    async function addToBlacklist(blacklistData) {
        try {
            showLoading('Adding to blacklist...');
            
            // Validate blacklist data
            if (!validateBlacklistData(blacklistData)) {
                throw new Error('Invalid blacklist data');
            }
            
            // Check if borrower is already blacklisted
            if (isBorrowerBlacklisted(blacklistData.borrowerId)) {
                throw new Error('Borrower is already blacklisted');
            }
            
            // Create blacklist entry
            const entryId = 'blacklist_' + Date.now();
            const now = new Date().toISOString();
            
            const newEntry = {
                ...BLACKLIST_TEMPLATE,
                ...blacklistData,
                id: entryId,
                blacklistDate: now.split('T')[0],
                status: 'active',
                createdAt: now,
                updatedAt: now
            };
            
            // Add to blacklist
            blacklistEntries.unshift(newEntry);
            
            // Save blacklist
            saveBlacklistEntries();
            
            // Calculate updated statistics
            calculateStats();
            
            // Update UI
            updateBlacklistUI();
            
            // Dispatch events
            dispatchBlacklistEvent('added', newEntry);
            
            // Notify borrower (in real app)
            notifyBorrowerBlacklisted(newEntry);
            
            return {
                success: true,
                entry: newEntry,
                message: 'Borrower added to blacklist successfully'
            };
            
        } catch (error) {
            console.error('Add to blacklist error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Remove borrower from blacklist
    async function removeFromBlacklist(entryId, reason, removedBy) {
        try {
            showLoading('Removing from blacklist...');
            
            // Find the entry
            const entryIndex = blacklistEntries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                throw new Error('Blacklist entry not found');
            }
            
            const entry = blacklistEntries[entryIndex];
            
            // Check if entry can be removed
            if (entry.status === 'cleared') {
                throw new Error('Borrower is already cleared from blacklist');
            }
            
            // Update entry
            const updatedEntry = {
                ...entry,
                status: 'cleared',
                removalDate: new Date().toISOString().split('T')[0],
                removedBy: removedBy || 'system',
                notes: entry.notes ? entry.notes + '\n' + `Removed: ${reason}` : `Removed: ${reason}`,
                updatedAt: new Date().toISOString()
            };
            
            // Replace in blacklist
            blacklistEntries[entryIndex] = updatedEntry;
            
            // Save blacklist
            saveBlacklistEntries();
            
            // Calculate updated statistics
            calculateStats();
            
            // Update UI
            updateBlacklistUI();
            
            // Dispatch events
            dispatchBlacklistEvent('removed', updatedEntry);
            
            // Notify borrower (in real app)
            notifyBorrowerRemoved(updatedEntry);
            
            return {
                success: true,
                entry: updatedEntry,
                message: 'Borrower removed from blacklist successfully'
            };
            
        } catch (error) {
            console.error('Remove from blacklist error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Submit appeal
    async function submitAppeal(entryId, appealData) {
        try {
            showLoading('Submitting appeal...');
            
            // Find the entry
            const entryIndex = blacklistEntries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                throw new Error('Blacklist entry not found');
            }
            
            const entry = blacklistEntries[entryIndex];
            
            // Check if appeal can be submitted
            if (entry.appealStatus === 'pending') {
                throw new Error('Appeal already submitted and pending');
            }
            
            if (entry.appealStatus === 'approved') {
                throw new Error('Appeal already approved');
            }
            
            // Update entry with appeal
            const updatedEntry = {
                ...entry,
                appealReason: appealData.reason,
                appealStatus: 'pending',
                appealDate: new Date().toISOString().split('T')[0],
                notes: entry.notes ? entry.notes + '\n' + `Appeal submitted: ${appealData.reason}` : `Appeal submitted: ${appealData.reason}`,
                updatedAt: new Date().toISOString()
            };
            
            // Replace in blacklist
            blacklistEntries[entryIndex] = updatedEntry;
            
            // Save blacklist
            saveBlacklistEntries();
            
            // Update UI
            updateBlacklistUI();
            
            // Dispatch events
            dispatchBlacklistEvent('appealSubmitted', updatedEntry);
            
            // Notify admin (in real app)
            notifyAdminAppealSubmitted(updatedEntry);
            
            return {
                success: true,
                entry: updatedEntry,
                message: 'Appeal submitted successfully'
            };
            
        } catch (error) {
            console.error('Submit appeal error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Review appeal (admin function)
    async function reviewAppeal(entryId, decision, decidedBy, decisionNotes = '') {
        try {
            showLoading('Reviewing appeal...');
            
            // Find the entry
            const entryIndex = blacklistEntries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                throw new Error('Blacklist entry not found');
            }
            
            const entry = blacklistEntries[entryIndex];
            
            // Check if appeal is pending
            if (entry.appealStatus !== 'pending') {
                throw new Error('No pending appeal to review');
            }
            
            // Update entry with appeal decision
            const updatedEntry = {
                ...entry,
                appealStatus: decision,
                appealDecision: decisionNotes,
                appealDecidedBy: decidedBy,
                appealDecisionDate: new Date().toISOString().split('T')[0],
                notes: entry.notes ? entry.notes + '\n' + `Appeal ${decision}: ${decisionNotes}` : `Appeal ${decision}: ${decisionNotes}`,
                updatedAt: new Date().toISOString()
            };
            
            // If approved, remove from blacklist
            if (decision === 'approved') {
                updatedEntry.status = 'cleared';
                updatedEntry.removalDate = new Date().toISOString().split('T')[0];
                updatedEntry.removedBy = decidedBy;
            }
            
            // Replace in blacklist
            blacklistEntries[entryIndex] = updatedEntry;
            
            // Save blacklist
            saveBlacklistEntries();
            
            // Calculate updated statistics
            calculateStats();
            
            // Update UI
            updateBlacklistUI();
            
            // Dispatch events
            dispatchBlacklistEvent('appealReviewed', updatedEntry);
            
            // Notify borrower (in real app)
            notifyBorrowerAppealDecision(updatedEntry);
            
            return {
                success: true,
                entry: updatedEntry,
                message: `Appeal ${decision} successfully`
            };
            
        } catch (error) {
            console.error('Review appeal error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Auto-blacklist overdue loans
    async function autoBlacklistOverdueLoans() {
        try {
            console.log('Checking for overdue loans to auto-blacklist...');
            
            // Get overdue loans from ledger module
            const ledgerModule = window.LedgerModule;
            if (!ledgerModule) {
                console.log('Ledger module not available');
                return;
            }
            
            // Get overdue entries
            const overdueEntries = ledgerModule.getLedgerEntries({ status: 'overdue' });
            
            let blacklistedCount = 0;
            
            for (const entry of overdueEntries) {
                // Check if overdue enough for blacklisting
                const daysOverdue = ledgerModule.calculateDaysOverdue(entry);
                
                if (daysOverdue >= CONFIG.DEFAULT_DAYS && 
                    entry.balance >= CONFIG.MIN_OVERDUE_AMOUNT &&
                    !isBorrowerBlacklisted(entry.borrowerId)) {
                    
                    // Create blacklist entry
                    const blacklistData = {
                        borrowerId: entry.borrowerId,
                        borrowerName: entry.borrowerName,
                        borrowerPhone: entry.borrowerPhone,
                        borrowerLocation: entry.borrowerLocation,
                        lenderId: entry.lenderId,
                        lenderName: entry.lenderName,
                        loanId: entry.id,
                        amount: entry.amount,
                        interest: entry.interest,
                        penalty: ledgerModule.calculatePenalty(entry),
                        totalDue: entry.totalDue,
                        amountPaid: entry.amountPaid,
                        balance: entry.balance,
                        dateBorrowed: entry.dateBorrowed,
                        dueDate: entry.dueDate,
                        daysOverdue: daysOverdue,
                        reason: `Auto-blacklisted: ${daysOverdue} days overdue`,
                        notes: `Automatic blacklisting after ${CONFIG.DEFAULT_DAYS} days overdue. Original loan: ${entry.id}`
                    };
                    
                    // Add to blacklist
                    await addToBlacklist(blacklistData);
                    blacklistedCount++;
                }
            }
            
            if (blacklistedCount > 0) {
                console.log(`Auto-blacklisted ${blacklistedCount} borrowers`);
                
                // Dispatch event
                dispatchBlacklistEvent('autoBlacklisted', { count: blacklistedCount });
            }
            
        } catch (error) {
            console.error('Auto-blacklist error:', error);
        }
    }

    // Check for cleared blacklist entries
    async function checkClearedEntries() {
        try {
            console.log('Checking for cleared blacklist entries...');
            
            const activeEntries = blacklistEntries.filter(entry => entry.status === 'active');
            let clearedCount = 0;
            
            for (const entry of activeEntries) {
                // Check if balance is paid (would come from ledger in real app)
                // For demo, check if it's been more than REMOVAL_DAYS since repayment
                if (entry.removalDate) {
                    const removalDate = new Date(entry.removalDate);
                    const today = new Date();
                    const daysSinceRemoval = Math.floor((today - removalDate) / (1000 * 60 * 60 * 24));
                    
                    if (daysSinceRemoval >= CONFIG.REMOVAL_DAYS) {
                        // Auto-remove from active blacklist view
                        // (In real app, would archive or change status)
                        console.log(`Entry ${entry.id} ready for archival`);
                    }
                }
            }
            
        } catch (error) {
            console.error('Check cleared entries error:', error);
        }
    }

    // Get blacklist entries with filters
    function getBlacklistEntries(filters = {}) {
        let entries = [...blacklistEntries];
        
        // Apply filters
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                entries = entries.filter(entry => filters.status.includes(entry.status));
            } else {
                entries = entries.filter(entry => entry.status === filters.status);
            }
        }
        
        if (filters.lenderId) {
            entries = entries.filter(entry => entry.lenderId === filters.lenderId);
        }
        
        if (filters.country) {
            // This would filter by borrower location country
            // For demo, skip this filter
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            entries = entries.filter(entry => 
                entry.borrowerName.toLowerCase().includes(searchTerm) ||
                entry.borrowerPhone.includes(searchTerm) ||
                entry.id.toLowerCase().includes(searchTerm) ||
                entry.reason.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.minAmount) {
            entries = entries.filter(entry => entry.balance >= filters.minAmount);
        }
        
        if (filters.maxAmount) {
            entries = entries.filter(entry => entry.balance <= filters.maxAmount);
        }
        
        if (filters.minDays) {
            entries = entries.filter(entry => entry.daysOverdue >= filters.minDays);
        }
        
        if (filters.maxDays) {
            entries = entries.filter(entry => entry.daysOverdue <= filters.maxDays);
        }
        
        if (filters.startDate) {
            entries = entries.filter(entry => entry.blacklistDate >= filters.startDate);
        }
        
        if (filters.endDate) {
            entries = entries.filter(entry => entry.blacklistDate <= filters.endDate);
        }
        
        // Sort
        if (filters.sortBy) {
            const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
            
            entries.sort((a, b) => {
                let aValue, bValue;
                
                switch (filters.sortBy) {
                    case 'date':
                        aValue = new Date(a.blacklistDate);
                        bValue = new Date(b.blacklistDate);
                        break;
                    case 'amount':
                        aValue = a.balance;
                        bValue = b.balance;
                        break;
                    case 'days':
                        aValue = a.daysOverdue;
                        bValue = b.daysOverdue;
                        break;
                    case 'borrower':
                        aValue = a.borrowerName.toLowerCase();
                        bValue = b.borrowerName.toLowerCase();
                        break;
                    case 'lender':
                        aValue = a.lenderName.toLowerCase();
                        bValue = b.lenderName.toLowerCase();
                        break;
                    default:
                        return 0;
                }
                
                if (aValue < bValue) return -1 * sortOrder;
                if (aValue > bValue) return 1 * sortOrder;
                return 0;
            });
        } else {
            // Default sort by date (newest first)
            entries.sort((a, b) => new Date(b.blacklistDate) - new Date(a.blacklistDate));
        }
        
        return entries;
    }

    // Get blacklist entry by ID
    function getBlacklistEntry(entryId) {
        return blacklistEntries.find(entry => entry.id === entryId) || null;
    }

    // Get blacklist entry by borrower ID
    function getBlacklistEntryByBorrower(borrowerId) {
        return blacklistEntries.find(entry => 
            entry.borrowerId === borrowerId && entry.status === 'active'
        ) || null;
    }

    // Get blacklist statistics
    function getBlacklistStats() {
        return blacklistStats;
    }

    // Calculate blacklist statistics
    function calculateStats() {
        const totalEntries = blacklistEntries.length;
        
        const activeEntries = blacklistEntries.filter(entry => entry.status === 'active');
        const clearedEntries = blacklistEntries.filter(entry => entry.status === 'cleared');
        const appealedEntries = blacklistEntries.filter(entry => entry.appealStatus === 'pending');
        
        const totalAmount = blacklistEntries.reduce((sum, entry) => sum + entry.balance, 0);
        const activeAmount = activeEntries.reduce((sum, entry) => sum + entry.balance, 0);
        const clearedAmount = clearedEntries.reduce((sum, entry) => sum + entry.balance, 0);
        
        const avgAmount = totalEntries > 0 ? totalAmount / totalEntries : 0;
        const avgDays = totalEntries > 0 ? 
            blacklistEntries.reduce((sum, entry) => sum + entry.daysOverdue, 0) / totalEntries : 0;
        
        // Lender breakdown
        const lenderBreakdown = {};
        blacklistEntries.forEach(entry => {
            if (!lenderBreakdown[entry.lenderId]) {
                lenderBreakdown[entry.lenderId] = {
                    name: entry.lenderName,
                    count: 0,
                    totalAmount: 0
                };
            }
            lenderBreakdown[entry.lenderId].count++;
            lenderBreakdown[entry.lenderId].totalAmount += entry.balance;
        });
        
        // Monthly breakdown (last 6 months)
        const monthlyBreakdown = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyBreakdown[monthKey] = {
                added: 0,
                cleared: 0,
                amount: 0
            };
        }
        
        blacklistEntries.forEach(entry => {
            const blacklistDate = new Date(entry.blacklistDate);
            const monthKey = `${blacklistDate.getFullYear()}-${String(blacklistDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyBreakdown[monthKey]) {
                monthlyBreakdown[monthKey].added++;
                monthlyBreakdown[monthKey].amount += entry.balance;
            }
            
            if (entry.removalDate) {
                const removalDate = new Date(entry.removalDate);
                const removalMonthKey = `${removalDate.getFullYear()}-${String(removalDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (monthlyBreakdown[removalMonthKey]) {
                    monthlyBreakdown[removalMonthKey].cleared++;
                }
            }
        });
        
        blacklistStats = {
            totalEntries,
            activeEntries: activeEntries.length,
            clearedEntries: clearedEntries.length,
            appealedEntries: appealedEntries.length,
            totalAmount,
            activeAmount,
            clearedAmount,
            avgAmount: parseFloat(avgAmount.toFixed(2)),
            avgDays: parseFloat(avgDays.toFixed(1)),
            lenderBreakdown,
            monthlyBreakdown,
            clearanceRate: totalEntries > 0 ? 
                Math.round((clearedEntries.length / totalEntries) * 100) : 0
        };
        
        return blacklistStats;
    }

    // Check if borrower is blacklisted
    function isBorrowerBlacklisted(borrowerId) {
        return blacklistEntries.some(entry => 
            entry.borrowerId === borrowerId && entry.status === 'active'
        );
    }

    // Get blacklist status for borrower
    function getBorrowerBlacklistStatus(borrowerId) {
        const entry = getBlacklistEntryByBorrower(borrowerId);
        
        if (!entry) {
            return {
                blacklisted: false,
                message: 'Not blacklisted'
            };
        }
        
        return {
            blacklisted: true,
            entry: entry,
            message: `Blacklisted since ${entry.blacklistDate}. Balance: ${formatCurrency(entry.balance)}`
        };
    }

    // Validate blacklist data
    function validateBlacklistData(data) {
        if (!data.borrowerId || !data.borrowerName || !data.lenderId || !data.lenderName) {
            return false;
        }
        
        if (!data.loanId || !data.amount || !data.balance) {
            return false;
        }
        
        if (data.balance <= 0) {
            return false;
        }
        
        if (!data.reason || data.reason.trim().length < 10) {
            return false;
        }
        
        return true;
    }

    // Format currency
    function formatCurrency(amount) {
        return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Save blacklist entries
    function saveBlacklistEntries() {
        try {
            localStorage.setItem('pesewa_blacklist', JSON.stringify(blacklistEntries));
        } catch (error) {
            console.error('Error saving blacklist entries:', error);
        }
    }

    // Initialize blacklist UI
    function initBlacklistUI() {
        // This would initialize any UI components specific to the blacklist
        console.log('Blacklist UI initialized');
    }

    // Update blacklist UI
    function updateBlacklistUI() {
        // Dispatch event for UI components to update
        const event = new CustomEvent('blacklistUpdated', {
            detail: {
                entries: blacklistEntries,
                stats: blacklistStats
            }
        });
        document.dispatchEvent(event);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Listen for lending events
        document.addEventListener('lendingEvent', (e) => {
            if (e.detail.type === 'borrowerBlacklisted') {
                // Add to blacklist when lender blacklists a borrower
                const loan = e.detail.data;
                
                const blacklistData = {
                    borrowerId: loan.borrowerId,
                    borrowerName: loan.borrowerName,
                    borrowerPhone: loan.borrowerPhone,
                    borrowerLocation: loan.borrowerLocation,
                    lenderId: loan.lenderId,
                    lenderName: loan.lenderName,
                    loanId: loan.id,
                    amount: loan.amount,
                    interest: loan.interest,
                    penalty: loan.penalty || 0,
                    totalDue: loan.totalDue,
                    amountPaid: loan.amountPaid,
                    balance: loan.balance,
                    dateBorrowed: loan.dateBorrowed,
                    dueDate: loan.dueDate,
                    daysOverdue: loan.daysOverdue,
                    reason: 'Blacklisted by lender',
                    notes: loan.notes || ''
                };
                
                addToBlacklist(blacklistData).catch(console.error);
            }
            
            if (e.detail.type === 'blacklistRemoved') {
                // Remove from blacklist when lender removes blacklist
                const loan = e.detail.data;
                const entry = getBlacklistEntryByBorrower(loan.borrowerId);
                
                if (entry) {
                    removeFromBlacklist(
                        entry.id,
                        'Blacklist removed by lender after full repayment',
                        loan.lenderId
                    ).catch(console.error);
                }
            }
        });
        
        // Listen for ledger events
        document.addEventListener('ledgerEvent', (e) => {
            if (e.detail.type === 'entryUpdated') {
                const entry = e.detail.data;
                
                // Check if this is a blacklisted entry that was repaid
                if (entry.status === 'repaid') {
                    const blacklistEntry = getBlacklistEntryByBorrower(entry.borrowerId);
                    
                    if (blacklistEntry && entry.balance <= 0) {
                        removeFromBlacklist(
                            blacklistEntry.id,
                            'Balance fully repaid',
                            'system'
                        ).catch(console.error);
                    }
                }
            }
        });
    }

    // Start periodic checks
    function startPeriodicChecks() {
        // Check for overdue loans to auto-blacklist every hour
        setInterval(() => {
            if (CONFIG.AUTO_BLACKLIST) {
                autoBlacklistOverdueLoans();
            }
            checkClearedEntries();
        }, 60 * 60 * 1000); // Every hour
        
        // Initial check
        setTimeout(() => {
            if (CONFIG.AUTO_BLACKLIST) {
                autoBlacklistOverdueLoans();
            }
            checkClearedEntries();
        }, 5000);
    }

    // Notify borrower blacklisted (simulated)
    function notifyBorrowerBlacklisted(entry) {
        // In a real app, this would send SMS/email to borrower
        console.log(`Notification sent to borrower ${entry.borrowerName} (${entry.borrowerPhone}): You have been blacklisted.`);
    }

    // Notify borrower removed (simulated)
    function notifyBorrowerRemoved(entry) {
        // In a real app, this would send SMS/email to borrower
        console.log(`Notification sent to borrower ${entry.borrowerName} (${entry.borrowerPhone}): You have been removed from blacklist.`);
    }

    // Notify admin appeal submitted (simulated)
    function notifyAdminAppealSubmitted(entry) {
        // In a real app, this would notify platform administrators
        console.log(`Appeal notification sent to admin for blacklist entry ${entry.id}`);
    }

    // Notify borrower appeal decision (simulated)
    function notifyBorrowerAppealDecision(entry) {
        // In a real app, this would send SMS/email to borrower
        console.log(`Appeal decision notification sent to borrower ${entry.borrowerName}: ${entry.appealStatus}`);
    }

    // Dispatch blacklist event
    function dispatchBlacklistEvent(type, data) {
        const event = new CustomEvent('blacklistEvent', {
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
        BLACKLIST_TEMPLATE,
        addToBlacklist,
        removeFromBlacklist,
        submitAppeal,
        reviewAppeal,
        getBlacklistEntries,
        getBlacklistEntry,
        getBlacklistEntryByBorrower,
        getBlacklistStats,
        calculateStats,
        isBorrowerBlacklisted,
        getBorrowerBlacklistStatus,
        validateBlacklistData,
        formatCurrency,
        autoBlacklistOverdueLoans
    };
})();

// Initialize blacklist module
document.addEventListener('DOMContentLoaded', BlacklistModule.init);

// Export for use in other modules
window.BlacklistModule = BlacklistModule;