'use strict';

// Ledger Module
const LedgerModule = (function() {
    // Ledger configuration
    const CONFIG = {
        INTEREST_RATE: 0.10, // 10% weekly
        PENALTY_RATE: 0.05, // 5% daily after due date
        DEFAULT_DAYS: 60, // Days until default
        CURRENCY: '₵',
        DATE_FORMAT: 'YYYY-MM-DD'
    };

    // Ledger entry template
    const LEDGER_TEMPLATE = {
        id: '',
        loanId: '',
        borrowerId: '',
        borrowerName: '',
        borrowerPhone: '',
        borrowerLocation: '',
        guarantor1: { name: '', phone: '' },
        guarantor2: { name: '', phone: '' },
        category: '',
        amount: 0,
        interest: 0,
        totalDue: 0,
        dateBorrowed: '',
        dueDate: '',
        repaymentDate: null,
        status: 'active', // active, overdue, repaid, defaulted, blacklisted
        daysOverdue: 0,
        penalty: 0,
        amountPaid: 0,
        balance: 0,
        rating: null,
        notes: '',
        lenderId: '',
        lenderName: '',
        groupId: '',
        groupName: '',
        paymentMethod: '',
        paymentReferences: [],
        createdAt: '',
        updatedAt: ''
    };

    // Current ledger state
    let ledgerEntries = [];
    let ledgerStats = null;
    let currentFilters = {};

    // Initialize module
    function init() {
        console.log('Ledger Module Initialized');
        
        // Load ledger data
        loadLedgerData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize ledger UI
        initLedgerUI();
    }

    // Load ledger data
    function loadLedgerData() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        
        if (user) {
            // Try to load from localStorage
            const savedLedger = localStorage.getItem(`pesewa_ledger_${user.id}`);
            
            if (savedLedger) {
                try {
                    ledgerEntries = JSON.parse(savedLedger);
                    console.log('Ledger entries loaded:', ledgerEntries.length);
                } catch (error) {
                    console.error('Error parsing ledger entries:', error);
                    ledgerEntries = [];
                }
            } else {
                // Load demo ledger if user is a lender
                if (window.RolesModule && window.RolesModule.isLender()) {
                    loadDemoLedger();
                }
            }
            
            // Calculate statistics
            calculateStats();
            
            // Update UI
            updateLedgerUI();
        }
    }

    // Load demo ledger
    function loadDemoLedger() {
        ledgerEntries = [
            {
                id: 'ledger_001',
                loanId: 'loan_001',
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
                lenderId: 'lender_demo',
                lenderName: 'Demo Lender',
                groupId: 'family_group_001',
                groupName: 'Family Support Group',
                paymentMethod: 'M-Pesa',
                paymentReferences: ['MPESA123456'],
                createdAt: '2024-12-15T10:30:00Z',
                updatedAt: '2024-12-21T14:20:00Z'
            },
            {
                id: 'ledger_002',
                loanId: 'loan_002',
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
                lenderId: 'lender_demo',
                lenderName: 'Demo Lender',
                groupId: 'church_group_001',
                groupName: 'Church Benevolence Fund',
                paymentMethod: 'Bank Transfer',
                paymentReferences: [],
                createdAt: '2024-12-18T14:20:00Z',
                updatedAt: '2024-12-18T14:20:00Z'
            },
            {
                id: 'ledger_003',
                loanId: 'loan_003',
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
                lenderId: 'lender_demo',
                lenderName: 'Demo Lender',
                groupId: 'professionals_group_001',
                groupName: 'Nairobi Professionals',
                paymentMethod: 'M-Pesa',
                paymentReferences: ['MPESA789012', 'MPESA345678'],
                createdAt: '2024-12-10T09:15:00Z',
                updatedAt: '2024-12-20T16:45:00Z'
            },
            {
                id: 'ledger_004',
                loanId: 'loan_004',
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
                lenderId: 'lender_demo',
                lenderName: 'Demo Lender',
                groupId: 'family_group_001',
                groupName: 'Family Support Group',
                paymentMethod: 'M-Pesa',
                paymentReferences: ['MPESA901234'],
                createdAt: '2024-12-05T11:45:00Z',
                updatedAt: '2024-12-15T10:30:00Z'
            },
            {
                id: 'ledger_005',
                loanId: 'loan_005',
                borrowerId: 'borrower_005',
                borrowerName: 'Michael Kipchoge',
                borrowerPhone: '0721000013',
                borrowerLocation: 'Eldoret',
                guarantor1: { name: 'Nancy Chebet', phone: '0721000014' },
                guarantor2: { name: 'Samuel Kibet', phone: '0721000015' },
                category: 'schoolfees',
                amount: 5000,
                interest: 500,
                totalDue: 5500,
                dateBorrowed: '2024-11-01',
                dueDate: '2024-11-08',
                repaymentDate: null,
                status: 'blacklisted',
                daysOverdue: 44,
                penalty: 12100,
                amountPaid: 1000,
                balance: 16600,
                rating: 1,
                notes: 'Defaulted. Sent to debt collectors.',
                lenderId: 'lender_demo',
                lenderName: 'Demo Lender',
                groupId: 'church_group_001',
                groupName: 'Church Benevolence Fund',
                paymentMethod: 'Bank Transfer',
                paymentReferences: ['BANK567890'],
                createdAt: '2024-11-01T08:00:00Z',
                updatedAt: '2024-12-01T09:00:00Z'
            }
        ];
        
        saveLedgerEntries();
    }

    // Add a new ledger entry
    async function addLedgerEntry(entryData) {
        try {
            showLoading('Adding to ledger...');
            
            // Validate entry data
            if (!validateLedgerEntry(entryData)) {
                throw new Error('Invalid ledger entry data');
            }
            
            // Create new entry
            const entryId = 'ledger_' + Date.now();
            const now = new Date().toISOString();
            
            const newEntry = {
                ...LEDGER_TEMPLATE,
                ...entryData,
                id: entryId,
                balance: entryData.totalDue,
                createdAt: now,
                updatedAt: now
            };
            
            // Add to ledger
            ledgerEntries.unshift(newEntry);
            
            // Save ledger
            saveLedgerEntries();
            
            // Calculate updated statistics
            calculateStats();
            
            // Update UI
            updateLedgerUI();
            
            // Dispatch event
            dispatchLedgerEvent('entryAdded', newEntry);
            
            return {
                success: true,
                entry: newEntry,
                message: 'Ledger entry added successfully'
            };
            
        } catch (error) {
            console.error('Add ledger entry error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Update a ledger entry
    async function updateLedgerEntry(entryId, updates) {
        try {
            showLoading('Updating ledger...');
            
            // Find the entry
            const entryIndex = ledgerEntries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                throw new Error('Ledger entry not found');
            }
            
            const entry = ledgerEntries[entryIndex];
            
            // Validate updates
            const validatedUpdates = validateLedgerUpdates(updates, entry);
            
            // Apply updates
            const updatedEntry = {
                ...entry,
                ...validatedUpdates,
                updatedAt: new Date().toISOString()
            };
            
            // Recalculate balance if payment was made
            if (updates.amountPaid !== undefined) {
                updatedEntry.balance = Math.max(0, updatedEntry.totalDue - updatedEntry.amountPaid);
                
                // Update status based on balance
                if (updatedEntry.balance <= 0) {
                    updatedEntry.status = 'repaid';
                    updatedEntry.repaymentDate = new Date().toISOString().split('T')[0];
                    
                    // Calculate penalty if overdue
                    if (updatedEntry.daysOverdue > 0) {
                        updatedEntry.penalty = calculatePenalty(updatedEntry);
                    }
                } else if (isOverdue(updatedEntry)) {
                    updatedEntry.status = 'overdue';
                    updatedEntry.daysOverdue = calculateDaysOverdue(updatedEntry);
                }
            }
            
            // Check for default
            if (updatedEntry.daysOverdue >= CONFIG.DEFAULT_DAYS && updatedEntry.status !== 'repaid') {
                updatedEntry.status = 'defaulted';
            }
            
            // Replace in ledger
            ledgerEntries[entryIndex] = updatedEntry;
            
            // Save ledger
            saveLedgerEntries();
            
            // Calculate updated statistics
            calculateStats();
            
            // Update UI
            updateLedgerUI();
            
            // Dispatch event
            dispatchLedgerEvent('entryUpdated', updatedEntry);
            
            return {
                success: true,
                entry: updatedEntry,
                message: 'Ledger entry updated successfully'
            };
            
        } catch (error) {
            console.error('Update ledger entry error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Record a payment
    async function recordPayment(entryId, paymentData) {
        try {
            // Find the entry
            const entryIndex = ledgerEntries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                throw new Error('Ledger entry not found');
            }
            
            const entry = ledgerEntries[entryIndex];
            
            // Validate payment
            if (!validatePayment(paymentData, entry)) {
                throw new Error('Invalid payment data');
            }
            
            // Prepare updates
            const updates = {
                amountPaid: entry.amountPaid + paymentData.amount
            };
            
            // Add payment reference
            if (paymentData.reference) {
                updates.paymentReferences = [
                    ...(entry.paymentReferences || []),
                    paymentData.reference
                ];
            }
            
            // Add notes if provided
            if (paymentData.notes) {
                updates.notes = entry.notes ? entry.notes + '\n' + paymentData.notes : paymentData.notes;
            }
            
            // Update payment method if provided
            if (paymentData.method) {
                updates.paymentMethod = paymentData.method;
            }
            
            // Update the entry
            return await updateLedgerEntry(entryId, updates);
            
        } catch (error) {
            console.error('Record payment error:', error);
            throw error;
        }
    }

    // Rate a borrower
    async function rateBorrower(entryId, rating, feedback) {
        try {
            // Validate rating
            if (!rating || rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            
            // Prepare updates
            const updates = {
                rating: rating
            };
            
            // Add feedback to notes
            if (feedback) {
                updates.notes = `Rating: ${rating}/5. Feedback: ${feedback}`;
            }
            
            // Update the entry
            return await updateLedgerEntry(entryId, updates);
            
        } catch (error) {
            console.error('Rate borrower error:', error);
            throw error;
        }
    }

    // Update borrower blacklist status
    async function updateBlacklistStatus(entryId, blacklisted, reason = '') {
        try {
            // Find the entry
            const entryIndex = ledgerEntries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                throw new Error('Ledger entry not found');
            }
            
            const entry = ledgerEntries[entryIndex];
            
            // Prepare updates
            const updates = {
                status: blacklisted ? 'blacklisted' : (isOverdue(entry) ? 'overdue' : 'active')
            };
            
            // Add blacklist reason to notes
            if (blacklisted && reason) {
                updates.notes = entry.notes ? entry.notes + '\n' + `Blacklisted: ${reason}` : `Blacklisted: ${reason}`;
            } else if (!blacklisted && reason) {
                updates.notes = entry.notes ? entry.notes + '\n' + `Blacklist removed: ${reason}` : `Blacklist removed: ${reason}`;
            }
            
            // Update the entry
            return await updateLedgerEntry(entryId, updates);
            
        } catch (error) {
            console.error('Update blacklist status error:', error);
            throw error;
        }
    }

    // Delete a ledger entry
    async function deleteLedgerEntry(entryId) {
        try {
            showLoading('Deleting entry...');
            
            // Find the entry
            const entryIndex = ledgerEntries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                throw new Error('Ledger entry not found');
            }
            
            const entry = ledgerEntries[entryIndex];
            
            // Check if entry can be deleted (only if no payments made)
            if (entry.amountPaid > 0) {
                throw new Error('Cannot delete ledger entry with payments recorded');
            }
            
            // Remove from ledger
            ledgerEntries.splice(entryIndex, 1);
            
            // Save ledger
            saveLedgerEntries();
            
            // Calculate updated statistics
            calculateStats();
            
            // Update UI
            updateLedgerUI();
            
            // Dispatch event
            dispatchLedgerEvent('entryDeleted', { entryId, borrowerName: entry.borrowerName });
            
            return {
                success: true,
                message: 'Ledger entry deleted successfully'
            };
            
        } catch (error) {
            console.error('Delete ledger entry error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Get ledger entries with filters
    function getLedgerEntries(filters = {}) {
        let entries = [...ledgerEntries];
        
        // Store current filters
        currentFilters = { ...filters };
        
        // Apply filters
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                entries = entries.filter(entry => filters.status.includes(entry.status));
            } else {
                entries = entries.filter(entry => entry.status === filters.status);
            }
        }
        
        if (filters.category) {
            entries = entries.filter(entry => entry.category === filters.category);
        }
        
        if (filters.groupId) {
            entries = entries.filter(entry => entry.groupId === filters.groupId);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            entries = entries.filter(entry => 
                entry.borrowerName.toLowerCase().includes(searchTerm) ||
                entry.borrowerPhone.includes(searchTerm) ||
                entry.id.toLowerCase().includes(searchTerm) ||
                entry.notes.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.startDate) {
            entries = entries.filter(entry => entry.dateBorrowed >= filters.startDate);
        }
        
        if (filters.endDate) {
            entries = entries.filter(entry => entry.dateBorrowed <= filters.endDate);
        }
        
        if (filters.minAmount) {
            entries = entries.filter(entry => entry.amount >= filters.minAmount);
        }
        
        if (filters.maxAmount) {
            entries = entries.filter(entry => entry.amount <= filters.maxAmount);
        }
        
        // Sort
        if (filters.sortBy) {
            const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
            
            entries.sort((a, b) => {
                let aValue, bValue;
                
                switch (filters.sortBy) {
                    case 'date':
                        aValue = new Date(a.dateBorrowed);
                        bValue = new Date(b.dateBorrowed);
                        break;
                    case 'dueDate':
                        aValue = new Date(a.dueDate);
                        bValue = new Date(b.dueDate);
                        break;
                    case 'amount':
                        aValue = a.amount;
                        bValue = b.amount;
                        break;
                    case 'balance':
                        aValue = a.balance;
                        bValue = b.balance;
                        break;
                    case 'borrower':
                        aValue = a.borrowerName.toLowerCase();
                        bValue = b.borrowerName.toLowerCase();
                        break;
                    case 'status':
                        aValue = a.status;
                        bValue = b.status;
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
            entries.sort((a, b) => new Date(b.dateBorrowed) - new Date(a.dateBorrowed));
        }
        
        return entries;
    }

    // Get ledger entry by ID
    function getLedgerEntry(entryId) {
        return ledgerEntries.find(entry => entry.id === entryId) || null;
    }

    // Get ledger statistics
    function getLedgerStats() {
        return ledgerStats;
    }

    // Calculate ledger statistics
    function calculateStats() {
        const totalEntries = ledgerEntries.length;
        
        const activeEntries = ledgerEntries.filter(entry => entry.status === 'active');
        const overdueEntries = ledgerEntries.filter(entry => entry.status === 'overdue');
        const repaidEntries = ledgerEntries.filter(entry => entry.status === 'repaid');
        const blacklistedEntries = ledgerEntries.filter(entry => entry.status === 'blacklisted' || entry.status === 'defaulted');
        
        const totalAmountLent = ledgerEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const totalInterestEarned = repaidEntries.reduce((sum, entry) => sum + entry.interest, 0);
        const totalPenaltyEarned = repaidEntries.reduce((sum, entry) => sum + (entry.penalty || 0), 0);
        const totalEarned = totalInterestEarned + totalPenaltyEarned;
        
        const activeBalance = [...activeEntries, ...overdueEntries, ...blacklistedEntries]
            .reduce((sum, entry) => sum + entry.balance, 0);
        
        const totalAmountPaid = ledgerEntries.reduce((sum, entry) => sum + entry.amountPaid, 0);
        
        const repaymentRate = totalEntries > 0 ? 
            Math.round((repaidEntries.length / totalEntries) * 100) : 100;
        
        const avgLoanSize = totalEntries > 0 ? totalAmountLent / totalEntries : 0;
        const avgRating = repaidEntries.length > 0 ?
            repaidEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / repaidEntries.length : 0;
        
        // Category breakdown
        const categoryBreakdown = {};
        ledgerEntries.forEach(entry => {
            if (!categoryBreakdown[entry.category]) {
                categoryBreakdown[entry.category] = {
                    count: 0,
                    totalAmount: 0,
                    totalEarned: 0
                };
            }
            categoryBreakdown[entry.category].count++;
            categoryBreakdown[entry.category].totalAmount += entry.amount;
            
            if (entry.status === 'repaid') {
                categoryBreakdown[entry.category].totalEarned += entry.interest + (entry.penalty || 0);
            }
        });
        
        // Monthly breakdown (last 6 months)
        const monthlyBreakdown = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyBreakdown[monthKey] = {
                loans: 0,
                amount: 0,
                earned: 0
            };
        }
        
        ledgerEntries.forEach(entry => {
            const date = new Date(entry.dateBorrowed);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyBreakdown[monthKey]) {
                monthlyBreakdown[monthKey].loans++;
                monthlyBreakdown[monthKey].amount += entry.amount;
                
                if (entry.status === 'repaid') {
                    monthlyBreakdown[monthKey].earned += entry.interest + (entry.penalty || 0);
                }
            }
        });
        
        ledgerStats = {
            totalEntries,
            activeEntries: activeEntries.length,
            overdueEntries: overdueEntries.length,
            repaidEntries: repaidEntries.length,
            blacklistedEntries: blacklistedEntries.length,
            totalAmountLent,
            totalInterestEarned,
            totalPenaltyEarned,
            totalEarned,
            activeBalance,
            totalAmountPaid,
            repaymentRate,
            avgLoanSize,
            avgRating: parseFloat(avgRating.toFixed(1)),
            categoryBreakdown,
            monthlyBreakdown
        };
        
        return ledgerStats;
    }

    // Export ledger data
    function exportLedger(format = 'csv', filters = {}) {
        try {
            const entries = getLedgerEntries(filters);
            
            if (format === 'csv') {
                return exportToCSV(entries);
            } else if (format === 'json') {
                return exportToJSON(entries);
            } else if (format === 'pdf') {
                return exportToPDF(entries);
            } else {
                throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Export ledger error:', error);
            throw error;
        }
    }

    // Export to CSV
    function exportToCSV(entries) {
        const headers = [
            'ID', 'Borrower Name', 'Borrower Phone', 'Category', 'Amount', 'Interest',
            'Total Due', 'Date Borrowed', 'Due Date', 'Repayment Date', 'Status',
            'Days Overdue', 'Penalty', 'Amount Paid', 'Balance', 'Rating', 'Group',
            'Payment Method', 'Notes'
        ];
        
        const rows = entries.map(entry => [
            entry.id,
            entry.borrowerName,
            entry.borrowerPhone,
            entry.category,
            entry.amount,
            entry.interest,
            entry.totalDue,
            entry.dateBorrowed,
            entry.dueDate,
            entry.repaymentDate || '',
            entry.status,
            entry.daysOverdue,
            entry.penalty,
            entry.amountPaid,
            entry.balance,
            entry.rating || '',
            entry.groupName,
            entry.paymentMethod,
            entry.notes.replace(/,/g, ';').replace(/\n/g, ' ')
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return {
            content: csvContent,
            filename: `pesewa_ledger_${new Date().toISOString().split('T')[0]}.csv`,
            type: 'text/csv'
        };
    }

    // Export to JSON
    function exportToJSON(entries) {
        return {
            content: JSON.stringify(entries, null, 2),
            filename: `pesewa_ledger_${new Date().toISOString().split('T')[0]}.json`,
            type: 'application/json'
        };
    }

    // Export to PDF (simulated)
    function exportToPDF(entries) {
        // In a real app, this would generate an actual PDF
        // For demo, return a simulated result
        return {
            content: 'PDF generation would happen here',
            filename: `pesewa_ledger_${new Date().toISOString().split('T')[0]}.pdf`,
            type: 'application/pdf'
        };
    }

    // Generate ledger report
    function generateReport(period = 'month', filters = {}) {
        const entries = getLedgerEntries(filters);
        const stats = calculateStats();
        
        const now = new Date();
        let periodStart, periodEnd;
        
        if (period === 'week') {
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - 7);
            periodEnd = now;
        } else if (period === 'month') {
            periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (period === 'quarter') {
            periodStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (period === 'year') {
            periodStart = new Date(now.getFullYear() - 1, 0, 1);
            periodEnd = new Date(now.getFullYear() - 1, 11, 31);
        } else {
            periodStart = new Date(entries[entries.length - 1]?.dateBorrowed || now);
            periodEnd = now;
        }
        
        const periodEntries = entries.filter(entry => {
            const entryDate = new Date(entry.dateBorrowed);
            return entryDate >= periodStart && entryDate <= periodEnd;
        });
        
        const periodStats = {
            period: {
                start: periodStart.toISOString().split('T')[0],
                end: periodEnd.toISOString().split('T')[0]
            },
            totalLoans: periodEntries.length,
            totalAmount: periodEntries.reduce((sum, entry) => sum + entry.amount, 0),
            totalEarned: periodEntries
                .filter(entry => entry.status === 'repaid')
                .reduce((sum, entry) => sum + entry.interest + (entry.penalty || 0), 0),
            repaymentRate: periodEntries.length > 0 ?
                Math.round((periodEntries.filter(entry => entry.status === 'repaid').length / periodEntries.length) * 100) : 0,
            topCategories: Object.entries(
                periodEntries.reduce((acc, entry) => {
                    acc[entry.category] = (acc[entry.category] || 0) + 1;
                    return acc;
                }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 3)
        };
        
        return {
            summary: periodStats,
            entries: periodEntries,
            charts: {
                // Chart data would be generated here
            }
        };
    }

    // Validate ledger entry
    function validateLedgerEntry(entry) {
        if (!entry.borrowerName || !entry.borrowerPhone || !entry.category || !entry.amount) {
            return false;
        }
        
        if (entry.amount <= 0) {
            return false;
        }
        
        if (!entry.dateBorrowed) {
            return false;
        }
        
        return true;
    }

    // Validate ledger updates
    function validateLedgerUpdates(updates, entry) {
        const allowedFields = [
            'amountPaid', 'status', 'rating', 'notes', 'paymentMethod',
            'paymentReferences', 'repaymentDate', 'penalty', 'daysOverdue'
        ];
        
        const validated = {};
        
        for (const field in updates) {
            if (allowedFields.includes(field)) {
                validated[field] = updates[field];
            }
        }
        
        return validated;
    }

    // Validate payment
    function validatePayment(payment, entry) {
        if (!payment.amount || payment.amount <= 0) {
            return false;
        }
        
        if (payment.amount > entry.balance) {
            return false;
        }
        
        return true;
    }

    // Calculate days overdue
    function calculateDaysOverdue(entry) {
        if (entry.status === 'repaid' && entry.repaymentDate) {
            const dueDate = new Date(entry.dueDate);
            const repaymentDate = new Date(entry.repaymentDate);
            return Math.max(0, Math.floor((repaymentDate - dueDate) / (1000 * 60 * 60 * 24)));
        }
        
        if (entry.status === 'active' || entry.status === 'overdue' || entry.status === 'blacklisted') {
            const dueDate = new Date(entry.dueDate);
            const today = new Date();
            return Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
        }
        
        return 0;
    }

    // Calculate penalty
    function calculatePenalty(entry) {
        if (entry.daysOverdue <= 0) return 0;
        
        return entry.totalDue * CONFIG.PENALTY_RATE * entry.daysOverdue;
    }

    // Check if entry is overdue
    function isOverdue(entry) {
        if (entry.status === 'repaid') return false;
        
        const dueDate = new Date(entry.dueDate);
        const today = new Date();
        return today > dueDate;
    }

    // Save ledger entries
    function saveLedgerEntries() {
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (!user) return;
        
        try {
            localStorage.setItem(`pesewa_ledger_${user.id}`, JSON.stringify(ledgerEntries));
        } catch (error) {
            console.error('Error saving ledger entries:', error);
        }
    }

    // Initialize ledger UI
    function initLedgerUI() {
        // This would initialize any UI components specific to the ledger
        console.log('Ledger UI initialized');
    }

    // Update ledger UI
    function updateLedgerUI() {
        // Dispatch event for UI components to update
        const event = new CustomEvent('ledgerUpdated', {
            detail: {
                entries: ledgerEntries,
                stats: ledgerStats,
                filters: currentFilters
            }
        });
        document.dispatchEvent(event);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Listen for auth changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.type === 'loggedIn') {
                loadLedgerData();
            } else if (e.detail.type === 'loggedOut') {
                ledgerEntries = [];
                ledgerStats = null;
                currentFilters = {};
            }
        });
        
        // Listen for lending events
        document.addEventListener('lendingEvent', (e) => {
            if (e.detail.type === 'loanApproved' || e.detail.type === 'repaymentRecorded') {
                // Reload ledger data if a loan was approved or repayment recorded
                loadLedgerData();
            }
        });
    }

    // Dispatch ledger event
    function dispatchLedgerEvent(type, data) {
        const event = new CustomEvent('ledgerEvent', {
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
        LEDGER_TEMPLATE,
        addLedgerEntry,
        updateLedgerEntry,
        recordPayment,
        rateBorrower,
        updateBlacklistStatus,
        deleteLedgerEntry,
        getLedgerEntries,
        getLedgerEntry,
        getLedgerStats,
        calculateStats,
        exportLedger,
        generateReport,
        validateLedgerEntry,
        calculateDaysOverdue,
        calculatePenalty,
        isOverdue
    };
})();

// Initialize ledger module
document.addEventListener('DOMContentLoaded', LedgerModule.init);

// Export for use in other modules
window.LedgerModule = LedgerModule;