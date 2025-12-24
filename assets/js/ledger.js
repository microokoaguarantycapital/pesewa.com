/**
 * Lender and Borrower Ledger Management
 * Handles loan tracking, interest calculations, and status updates
 */

class LoanLedger {
    constructor() {
        this.currentLender = null;
        this.currentBorrower = null;
        this.loans = [];
        this.ledgerEntries = [];
        this.interestRate = 15; // Weekly interest percentage
        this.penaltyRate = 5; // Daily penalty percentage after day 7
        this.gracePeriod = 7; // Days before penalty applies
        
        this.initEventListeners();
        this.loadSampleData();
    }
    
    initEventListeners() {
        // Lender selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lender-card')) {
                const lenderId = e.target.closest('.lender-card').dataset.lenderId;
                this.selectLender(lenderId);
            }
            
            if (e.target.closest('.borrower-card')) {
                const borrowerId = e.target.closest('.borrower-card').dataset.borrowerId;
                this.selectBorrower(borrowerId);
            }
            
            // Loan status filters
            if (e.target.closest('[data-filter-status]')) {
                const status = e.target.closest('[data-filter-status]').dataset.filterStatus;
                this.filterLoansByStatus(status);
            }
            
            // Manual loan update
            if (e.target.id === 'update-loan-status') {
                this.showManualUpdateModal();
            }
            
            // Save manual update
            if (e.target.id === 'save-manual-update') {
                this.saveManualUpdate();
            }
            
            // Admin override
            if (e.target.id === 'admin-override-btn') {
                this.showAdminOverrideModal();
            }
            
            // Save admin override
            if (e.target.id === 'save-admin-override') {
                this.saveAdminOverride();
            }
            
            // Calculate settlement
            if (e.target.id === 'calculate-settlement') {
                this.calculateSettlement();
            }
            
            // Mark as settled
            if (e.target.id === 'mark-as-settled') {
                this.markLoanAsSettled();
            }
            
            // Mark as defaulted
            if (e.target.id === 'mark-as-defaulted') {
                this.markLoanAsDefaulted();
            }
        });
        
        // Search functionality
        const searchInput = document.getElementById('ledger-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchLoans(e.target.value);
            });
        }
        
        // Date range filter
        const dateFilter = document.getElementById('date-range-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filterByDateRange(e.target.value);
            });
        }
    }
    
    loadSampleData() {
        // Sample lenders
        this.lenders = [
            {
                id: 'lender_001',
                name: 'Michael Chen',
                phone: '+254 712 345 678',
                totalLent: 250000,
                activeLoans: 3,
                avgInterestRate: 15,
                rating: 4.8,
                joined: '2024-01-15',
                color: '#3B82F6'
            },
            {
                id: 'lender_002',
                name: 'Sarah Johnson',
                phone: '+254 723 456 789',
                totalLent: 180000,
                activeLoans: 2,
                avgInterestRate: 14.5,
                rating: 4.9,
                joined: '2024-02-10',
                color: '#10B981'
            },
            {
                id: 'lender_003',
                name: 'David Omondi',
                phone: '+254 734 567 890',
                totalLent: 320000,
                activeLoans: 5,
                avgInterestRate: 16,
                rating: 4.7,
                joined: '2024-01-05',
                color: '#8B5CF6'
            }
        ];
        
        // Sample borrowers
        this.borrowers = [
            {
                id: 'borrower_001',
                name: 'James Kamau',
                phone: '+254 701 234 567',
                totalBorrowed: 120000,
                activeLoans: 1,
                creditScore: 78,
                lastBorrowed: '2024-03-10',
                status: 'active',
                color: '#EF4444'
            },
            {
                id: 'borrower_002',
                name: 'Mary Wanjiku',
                phone: '+254 702 345 678',
                totalBorrowed: 85000,
                activeLoans: 2,
                creditScore: 85,
                lastBorrowed: '2024-03-12',
                status: 'active',
                color: '#F59E0B'
            },
            {
                id: 'borrower_003',
                name: 'Peter Otieno',
                phone: '+254 703 456 789',
                totalBorrowed: 150000,
                activeLoans: 1,
                creditScore: 65,
                lastBorrowed: '2024-03-05',
                status: 'overdue',
                color: '#6366F1'
            }
        ];
        
        // Sample loans
        this.loans = [
            {
                id: 'loan_001',
                lenderId: 'lender_001',
                borrowerId: 'borrower_001',
                amount: 50000,
                principal: 50000,
                interest: 7500,
                penalty: 0,
                totalDue: 57500,
                amountPaid: 15000,
                balance: 42500,
                disbursementDate: '2024-03-10',
                dueDate: '2024-03-24',
                lastPaymentDate: '2024-03-15',
                status: 'active', // active, overdue, defaulted, settled
                interestRate: 15,
                penaltyRate: 5,
                gracePeriod: 7,
                weeks: 2,
                dailyPenalty: 375,
                overdueDays: 0,
                collateral: 'Logbook KBX 123X',
                guarantor: 'John Maina',
                notes: 'Business expansion loan'
            },
            {
                id: 'loan_002',
                lenderId: 'lender_002',
                borrowerId: 'borrower_002',
                amount: 35000,
                principal: 35000,
                interest: 5250,
                penalty: 2625,
                totalDue: 42875,
                amountPaid: 10000,
                balance: 32875,
                disbursementDate: '2024-03-01',
                dueDate: '2024-03-15',
                lastPaymentDate: '2024-03-08',
                status: 'overdue',
                interestRate: 15,
                penaltyRate: 5,
                gracePeriod: 7,
                weeks: 2,
                dailyPenalty: 262.5,
                overdueDays: 10,
                collateral: 'National ID',
                guarantor: 'Sarah Mwangi',
                notes: 'School fees loan'
            },
            {
                id: 'loan_003',
                lenderId: 'lender_003',
                borrowerId: 'borrower_003',
                amount: 75000,
                principal: 75000,
                interest: 11250,
                penalty: 16875,
                totalDue: 103125,
                amountPaid: 20000,
                balance: 83125,
                disbursementDate: '2024-02-15',
                dueDate: '2024-03-01',
                lastPaymentDate: '2024-02-25',
                status: 'defaulted',
                interestRate: 15,
                penaltyRate: 5,
                gracePeriod: 7,
                weeks: 2,
                dailyPenalty: 562.5,
                overdueDays: 24,
                collateral: 'Land Title L.R 1234',
                guarantor: 'Thomas Oloo',
                notes: 'Medical emergency loan'
            },
            {
                id: 'loan_004',
                lenderId: 'lender_001',
                borrowerId: 'borrower_002',
                amount: 40000,
                principal: 40000,
                interest: 6000,
                penalty: 0,
                totalDue: 46000,
                amountPaid: 46000,
                balance: 0,
                disbursementDate: '2024-02-20',
                dueDate: '2024-03-05',
                lastPaymentDate: '2024-03-05',
                status: 'settled',
                interestRate: 15,
                penaltyRate: 5,
                gracePeriod: 7,
                weeks: 2,
                dailyPenalty: 300,
                overdueDays: 0,
                collateral: 'Passport A1234567',
                guarantor: 'Jane Akinyi',
                notes: 'Completed successfully'
            }
        ];
        
        // Sample ledger entries
        this.ledgerEntries = [
            {
                id: 'entry_001',
                loanId: 'loan_001',
                date: '2024-03-10',
                type: 'disbursement',
                amount: 50000,
                balanceBefore: 0,
                balanceAfter: 50000,
                description: 'Loan disbursed',
                recordedBy: 'system'
            },
            {
                id: 'entry_002',
                loanId: 'loan_001',
                date: '2024-03-15',
                type: 'payment',
                amount: 15000,
                balanceBefore: 57500,
                balanceAfter: 42500,
                description: 'Partial payment',
                recordedBy: 'agent_001'
            },
            {
                id: 'entry_003',
                loanId: 'loan_002',
                date: '2024-03-01',
                type: 'disbursement',
                amount: 35000,
                balanceBefore: 0,
                balanceAfter: 35000,
                description: 'Loan disbursed',
                recordedBy: 'system'
            },
            {
                id: 'entry_004',
                loanId: 'loan_002',
                date: '2024-03-08',
                type: 'payment',
                amount: 10000,
                balanceBefore: 40250,
                balanceAfter: 30250,
                description: 'Partial payment',
                recordedBy: 'agent_002'
            },
            {
                id: 'entry_005',
                loanId: 'loan_002',
                date: '2024-03-16',
                type: 'penalty',
                amount: 2625,
                balanceBefore: 32875,
                balanceAfter: 35500,
                description: 'Late payment penalty (10 days)',
                recordedBy: 'system'
            }
        ];
        
        // Render initial UI
        this.renderLenderCards();
        this.renderBorrowerCards();
        this.renderAllLoans();
    }
    
    selectLender(lenderId) {
        this.currentLender = this.lenders.find(l => l.id === lenderId);
        this.renderLenderDetails();
        this.renderLenderLoans();
        this.renderLenderLedger();
        
        // Update UI state
        document.querySelectorAll('.lender-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`.lender-card[data-lender-id="${lenderId}"]`).classList.add('active');
        
        // Show lender section
        document.getElementById('lender-details-section').classList.remove('hidden');
    }
    
    selectBorrower(borrowerId) {
        this.currentBorrower = this.borrowers.find(b => b.id === borrowerId);
        this.renderBorrowerDetails();
        this.renderBorrowerLoans();
        this.renderBorrowerLedger();
        
        // Update UI state
        document.querySelectorAll('.borrower-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`.borrower-card[data-borrower-id="${borrowerId}"]`).classList.add('active');
        
        // Show borrower section
        document.getElementById('borrower-details-section').classList.remove('hidden');
    }
    
    renderLenderCards() {
        const container = document.getElementById('lenders-container');
        if (!container) return;
        
        container.innerHTML = this.lenders.map(lender => `
            <div class="lender-card bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-200" data-lender-id="${lender.id}">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${lender.color}">
                            ${lender.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">${lender.name}</h3>
                            <p class="text-gray-600 text-sm">${lender.phone}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            ${lender.rating} ★
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-center p-3 bg-blue-50 rounded-lg">
                        <p class="text-2xl font-bold text-blue-700">${this.formatCurrency(lender.totalLent)}</p>
                        <p class="text-sm text-gray-600">Total Lent</p>
                    </div>
                    <div class="text-center p-3 bg-green-50 rounded-lg">
                        <p class="text-2xl font-bold text-green-700">${lender.activeLoans}</p>
                        <p class="text-sm text-gray-600">Active Loans</p>
                    </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>${lender.avgInterestRate}% avg. interest</span>
                    <span>Joined ${this.formatDate(lender.joined)}</span>
                </div>
            </div>
        `).join('');
    }
    
    renderBorrowerCards() {
        const container = document.getElementById('borrowers-container');
        if (!container) return;
        
        container.innerHTML = this.borrowers.map(borrower => `
            <div class="borrower-card bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-red-200" data-borrower-id="${borrower.id}">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${borrower.color}">
                            ${borrower.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">${borrower.name}</h3>
                            <p class="text-gray-600 text-sm">${borrower.phone}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${this.getBorrowerStatusClass(borrower.status)}">
                            ${borrower.status}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-center p-3 bg-red-50 rounded-lg">
                        <p class="text-2xl font-bold text-red-700">${this.formatCurrency(borrower.totalBorrowed)}</p>
                        <p class="text-sm text-gray-600">Total Borrowed</p>
                    </div>
                    <div class="text-center p-3 bg-yellow-50 rounded-lg">
                        <p class="text-2xl font-bold text-yellow-700">${borrower.creditScore}</p>
                        <p class="text-sm text-gray-600">Credit Score</p>
                    </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>${borrower.activeLoans} active loan(s)</span>
                    <span>Last: ${this.formatDate(borrower.lastBorrowed)}</span>
                </div>
            </div>
        `).join('');
    }
    
    renderLenderDetails() {
        if (!this.currentLender) return;
        
        const container = document.getElementById('lender-details');
        container.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style="background-color: ${this.currentLender.color}">
                            ${this.currentLender.name.charAt(0)}
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">${this.currentLender.name}</h2>
                            <p class="text-gray-600">${this.currentLender.phone}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    ${this.currentLender.rating} ★ Rating
                                </span>
                                <span class="text-sm text-gray-500">
                                    Member since ${this.formatDate(this.currentLender.joined)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="text-3xl font-bold text-blue-700">${this.formatCurrency(this.currentLender.totalLent)}</p>
                        <p class="text-gray-600">Total Amount Lent</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-4 gap-4 mt-6">
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-gray-900">${this.getLenderActiveLoansCount()}</p>
                        <p class="text-sm text-gray-600">Active Loans</p>
                    </div>
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-green-600">${this.formatCurrency(this.getLenderTotalEarnings())}</p>
                        <p class="text-sm text-gray-600">Total Earnings</p>
                    </div>
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-blue-600">${this.currentLender.avgInterestRate}%</p>
                        <p class="text-sm text-gray-600">Avg. Interest Rate</p>
                    </div>
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-purple-600">${this.getLenderSettledLoansCount()}</p>
                        <p class="text-sm text-gray-600">Settled Loans</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderBorrowerDetails() {
        if (!this.currentBorrower) return;
        
        const container = document.getElementById('borrower-details');
        container.innerHTML = `
            <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style="background-color: ${this.currentBorrower.color}">
                            ${this.currentBorrower.name.charAt(0)}
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">${this.currentBorrower.name}</h2>
                            <p class="text-gray-600">${this.currentBorrower.phone}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${this.getBorrowerStatusClass(this.currentBorrower.status)}">
                                    ${this.currentBorrower.status}
                                </span>
                                <span class="text-sm text-gray-500">
                                    Credit Score: ${this.currentBorrower.creditScore}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="text-3xl font-bold text-red-700">${this.formatCurrency(this.currentBorrower.totalBorrowed)}</p>
                        <p class="text-gray-600">Total Borrowed</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-4 gap-4 mt-6">
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-gray-900">${this.currentBorrower.activeLoans}</p>
                        <p class="text-sm text-gray-600">Active Loans</p>
                    </div>
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-yellow-600">${this.formatCurrency(this.getBorrowerTotalDue())}</p>
                        <p class="text-sm text-gray-600">Total Due</p>
                    </div>
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-green-600">${this.formatCurrency(this.getBorrowerTotalPaid())}</p>
                        <p class="text-sm text-gray-600">Total Paid</p>
                    </div>
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p class="text-2xl font-bold text-blue-600">${this.getBorrowerSettledLoansCount()}</p>
                        <p class="text-sm text-gray-600">Settled Loans</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAllLoans() {
        const container = document.getElementById('all-loans-container');
        if (!container) return;
        
        container.innerHTML = this.loans.map(loan => this.renderLoanCard(loan)).join('');
        
        this.updateLoanStats();
    }
    
    renderLenderLoans() {
        if (!this.currentLender) return;
        
        const lenderLoans = this.loans.filter(loan => loan.lenderId === this.currentLender.id);
        const container = document.getElementById('lender-loans-container');
        
        if (container) {
            container.innerHTML = lenderLoans.map(loan => this.renderLoanCard(loan)).join('');
        }
    }
    
    renderBorrowerLoans() {
        if (!this.currentBorrower) return;
        
        const borrowerLoans = this.loans.filter(loan => loan.borrowerId === this.currentBorrower.id);
        const container = document.getElementById('borrower-loans-container');
        
        if (container) {
            container.innerHTML = borrowerLoans.map(loan => this.renderLoanCard(loan)).join('');
        }
    }
    
    renderLoanCard(loan) {
        const lender = this.lenders.find(l => l.id === loan.lenderId);
        const borrower = this.borrowers.find(b => b.id === loan.borrowerId);
        
        return `
            <div class="loan-card bg-white rounded-xl shadow-md p-6 border-l-4 ${this.getLoanStatusBorderClass(loan.status)}">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="font-bold text-lg">Loan ${loan.id}</h3>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="text-sm text-gray-600">Lender: ${lender?.name || 'Unknown'}</span>
                            <span class="text-gray-300">•</span>
                            <span class="text-sm text-gray-600">Borrower: ${borrower?.name || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${this.getLoanStatusClass(loan.status)}">
                            ${loan.status.toUpperCase()}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">Due: ${this.formatDate(loan.dueDate)}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <p class="text-2xl font-bold text-gray-900">${this.formatCurrency(loan.amount)}</p>
                        <p class="text-sm text-gray-600">Principal Amount</p>
                    </div>
                    <div class="p-3 ${loan.status === 'settled' ? 'bg-green-50' : 'bg-yellow-50'} rounded-lg">
                        <p class="text-2xl font-bold ${loan.status === 'settled' ? 'text-green-700' : 'text-yellow-700'}">${this.formatCurrency(loan.balance)}</p>
                        <p class="text-sm text-gray-600">Current Balance</p>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Interest (${loan.interestRate}% weekly)</span>
                        <span>${this.formatCurrency(loan.interest)}</span>
                    </div>
                    ${loan.penalty > 0 ? `
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Penalty (${loan.penaltyRate}% daily)</span>
                        <span class="text-red-600">${this.formatCurrency(loan.penalty)}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between text-sm font-semibold text-gray-800 mt-2 pt-2 border-t">
                        <span>Total Due</span>
                        <span>${this.formatCurrency(loan.totalDue)}</span>
                    </div>
                </div>
                
                ${loan.status !== 'settled' && loan.status !== 'defaulted' ? `
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-600">Progress</span>
                        <span class="text-sm font-semibold">${((loan.amountPaid / loan.totalDue) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${(loan.amountPaid / loan.totalDue) * 100}%"></div>
                    </div>
                </div>
                ` : ''}
                
                <div class="flex items-center justify-between text-sm text-gray-600">
                    <div>
                        <span class="inline-block px-2 py-1 bg-gray-100 rounded mr-2">${loan.weeks} weeks</span>
                        ${loan.overdueDays > 0 ? `
                        <span class="inline-block px-2 py-1 bg-red-100 text-red-800 rounded">
                            ${loan.overdueDays} days overdue
                        </span>
                        ` : ''}
                    </div>
                    <button class="text-blue-600 hover:text-blue-800 font-medium view-loan-details" data-loan-id="${loan.id}">
                        View Details →
                    </button>
                </div>
            </div>
        `;
    }
    
    renderLenderLedger() {
        if (!this.currentLender) return;
        
        const lenderLoans = this.loans.filter(loan => loan.lenderId === this.currentLender.id);
        const loanIds = lenderLoans.map(loan => loan.id);
        const entries = this.ledgerEntries.filter(entry => loanIds.includes(entry.loanId));
        
        const container = document.getElementById('lender-ledger-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow overflow-hidden">
                <div class="px-6 py-4 border-b">
                    <h3 class="text-lg font-semibold text-gray-900">Transaction Ledger</h3>
                    <p class="text-sm text-gray-600">All transactions for ${this.currentLender.name}'s loans</p>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${entries.map(entry => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(entry.date)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">${entry.loanId}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${this.getEntryTypeClass(entry.type)}">
                                            ${entry.type}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">${entry.description}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm ${entry.type === 'payment' ? 'text-green-600' : 'text-red-600'}">
                                        ${entry.type === 'payment' ? '+' : '-'}${this.formatCurrency(entry.amount)}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatCurrency(entry.balanceAfter)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.recordedBy}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="px-6 py-4 border-t bg-gray-50">
                    <div class="flex justify-between items-center">
                        <p class="text-sm text-gray-600">
                            Showing ${entries.length} entries
                        </p>
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                            Export to CSV
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderBorrowerLedger() {
        if (!this.currentBorrower) return;
        
        const borrowerLoans = this.loans.filter(loan => loan.borrowerId === this.currentBorrower.id);
        const loanIds = borrowerLoans.map(loan => loan.id);
        const entries = this.ledgerEntries.filter(entry => loanIds.includes(entry.loanId));
        
        const container = document.getElementById('borrower-ledger-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow overflow-hidden">
                <div class="px-6 py-4 border-b">
                    <h3 class="text-lg font-semibold text-gray-900">Your Loan History</h3>
                    <p class="text-sm text-gray-600">All transactions for ${this.currentBorrower.name}</p>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${entries.map(entry => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(entry.date)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${this.getEntryTypeClass(entry.type)}">
                                            ${entry.type}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">${entry.description}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm ${entry.type === 'payment' ? 'text-green-600' : 'text-red-600'}">
                                        ${entry.type === 'payment' ? '-' : '+'}${this.formatCurrency(entry.amount)}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatCurrency(entry.balanceAfter)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="px-6 py-4 border-t bg-gray-50">
                    <div class="text-center">
                        <p class="text-sm text-gray-600">
                            Total Outstanding: <span class="font-semibold">${this.formatCurrency(this.getBorrowerTotalDue())}</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    filterLoansByStatus(status) {
        let filteredLoans = [];
        
        if (status === 'all') {
            filteredLoans = this.loans;
        } else {
            filteredLoans = this.loans.filter(loan => loan.status === status);
        }
        
        // Update active filter button
        document.querySelectorAll('[data-filter-status]').forEach(btn => {
            if (btn.dataset.filterStatus === status) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('bg-gray-100', 'text-gray-700');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            }
        });
        
        // Render filtered loans
        if (this.currentLender) {
            const lenderLoans = filteredLoans.filter(loan => loan.lenderId === this.currentLender.id);
            document.getElementById('lender-loans-container').innerHTML = 
                lenderLoans.map(loan => this.renderLoanCard(loan)).join('');
        } else if (this.currentBorrower) {
            const borrowerLoans = filteredLoans.filter(loan => loan.borrowerId === this.currentBorrower.id);
            document.getElementById('borrower-loans-container').innerHTML = 
                borrowerLoans.map(loan => this.renderLoanCard(loan)).join('');
        } else {
            document.getElementById('all-loans-container').innerHTML = 
                filteredLoans.map(loan => this.renderLoanCard(loan)).join('');
        }
        
        this.updateLoanStats();
    }
    
    searchLoans(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        const filteredLoans = this.loans.filter(loan => {
            const lender = this.lenders.find(l => l.id === loan.lenderId);
            const borrower = this.borrowers.find(b => b.id === loan.borrowerId);
            
            return (
                loan.id.toLowerCase().includes(normalizedQuery) ||
                lender?.name.toLowerCase().includes(normalizedQuery) ||
                borrower?.name.toLowerCase().includes(normalizedQuery) ||
                loan.notes.toLowerCase().includes(normalizedQuery)
            );
        });
        
        document.getElementById('all-loans-container').innerHTML = 
            filteredLoans.map(loan => this.renderLoanCard(loan)).join('');
    }
    
    filterByDateRange(range) {
        const now = new Date();
        let startDate = new Date();
        
        switch (range) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
            default:
                startDate = new Date(0); // Beginning of time
                break;
        }
        
        const filteredLoans = this.loans.filter(loan => {
            const disbursementDate = new Date(loan.disbursementDate);
            return disbursementDate >= startDate;
        });
        
        document.getElementById('all-loans-container').innerHTML = 
            filteredLoans.map(loan => this.renderLoanCard(loan)).join('');
    }
    
    showManualUpdateModal() {
        const modal = document.getElementById('manual-update-modal');
        if (!modal) return;
        
        // Get selected loan if any
        const selectedLoanId = this.getSelectedLoanId();
        const loan = this.loans.find(l => l.id === selectedLoanId);
        
        if (loan) {
            document.getElementById('update-loan-id').value = loan.id;
            document.getElementById('update-amount').value = loan.balance;
            document.getElementById('update-type').value = 'payment';
            document.getElementById('update-description').value = 'Manual payment update';
        }
        
        modal.classList.remove('hidden');
    }
    
    saveManualUpdate() {
        const loanId = document.getElementById('update-loan-id').value;
        const amount = parseFloat(document.getElementById('update-amount').value);
        const type = document.getElementById('update-type').value;
        const description = document.getElementById('update-description').value;
        
        if (!loanId || isNaN(amount) || amount <= 0) {
            this.showNotification('Please enter valid update details', 'error');
            return;
        }
        
        const loan = this.loans.find(l => l.id === loanId);
        if (!loan) {
            this.showNotification('Loan not found', 'error');
            return;
        }
        
        // Create new ledger entry
        const newEntry = {
            id: 'entry_' + Date.now(),
            loanId: loanId,
            date: new Date().toISOString().split('T')[0],
            type: type,
            amount: amount,
            balanceBefore: loan.balance,
            balanceAfter: type === 'payment' ? loan.balance - amount : loan.balance + amount,
            description: description,
            recordedBy: 'manual_update'
        };
        
        // Update loan
        if (type === 'payment') {
            loan.amountPaid += amount;
            loan.balance = Math.max(0, loan.balance - amount);
            
            if (loan.balance <= 0) {
                loan.status = 'settled';
            }
        } else if (type === 'penalty') {
            loan.penalty += amount;
            loan.totalDue += amount;
            loan.balance += amount;
        } else if (type === 'interest') {
            loan.interest += amount;
            loan.totalDue += amount;
            loan.balance += amount;
        }
        
        // Add to ledger
        this.ledgerEntries.push(newEntry);
        
        // Update UI
        if (this.currentLender) {
            this.renderLenderLoans();
            this.renderLenderLedger();
        } else if (this.currentBorrower) {
            this.renderBorrowerLoans();
            this.renderBorrowerLedger();
        }
        
        this.renderAllLoans();
        
        // Close modal
        document.getElementById('manual-update-modal').classList.add('hidden');
        
        this.showNotification('Loan updated successfully', 'success');
    }
    
    showAdminOverrideModal() {
        const modal = document.getElementById('admin-override-modal');
        if (!modal) return;
        
        // Get selected loan if any
        const selectedLoanId = this.getSelectedLoanId();
        const loan = this.loans.find(l => l.id === selectedLoanId);
        
        if (loan) {
            document.getElementById('admin-loan-id').value = loan.id;
            document.getElementById('admin-new-status').value = loan.status;
            document.getElementById('admin-reason').value = '';
        }
        
        modal.classList.remove('hidden');
    }
    
    saveAdminOverride() {
        const loanId = document.getElementById('admin-loan-id').value;
        const newStatus = document.getElementById('admin-new-status').value;
        const reason = document.getElementById('admin-reason').value;
        
        if (!loanId || !newStatus || !reason) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }
        
        const loan = this.loans.find(l => l.id === loanId);
        if (!loan) {
            this.showNotification('Loan not found', 'error');
            return;
        }
        
        // Create admin override entry
        const adminEntry = {
            id: 'admin_' + Date.now(),
            loanId: loanId,
            date: new Date().toISOString().split('T')[0],
            type: 'admin_override',
            amount: 0,
            balanceBefore: loan.balance,
            balanceAfter: loan.balance,
            description: `Status changed from ${loan.status} to ${newStatus}. Reason: ${reason}`,
            recordedBy: 'admin'
        };
        
        // Update loan status
        const oldStatus = loan.status;
        loan.status = newStatus;
        
        // If changing to settled, update balance to 0
        if (newStatus === 'settled' && oldStatus !== 'settled') {
            loan.amountPaid = loan.totalDue;
            loan.balance = 0;
            adminEntry.description += '. Loan marked as fully settled.';
        }
        
        // If changing to defaulted, apply full penalty
        if (newStatus === 'defaulted' && oldStatus !== 'defaulted') {
            const overdueDays = Math.max(0, this.calculateDaysOverdue(loan));
            const penalty = loan.principal * (this.penaltyRate / 100) * overdueDays;
            loan.penalty += penalty;
            loan.totalDue += penalty;
            loan.balance += penalty;
            adminEntry.description += `. Default penalty applied: ${this.formatCurrency(penalty)}`;
        }
        
        // Add to ledger
        this.ledgerEntries.push(adminEntry);
        
        // Update UI
        if (this.currentLender) {
            this.renderLenderLoans();
            this.renderLenderLedger();
        } else if (this.currentBorrower) {
            this.renderBorrowerLoans();
            this.renderBorrowerLedger();
        }
        
        this.renderAllLoans();
        
        // Close modal
        document.getElementById('admin-override-modal').classList.add('hidden');
        
        this.showNotification('Admin override applied successfully', 'success');
    }
    
    calculateSettlement() {
        const loanId = this.getSelectedLoanId();
        const loan = this.loans.find(l => l.id === loanId);
        
        if (!loan) {
            this.showNotification('Please select a loan first', 'error');
            return;
        }
        
        // Calculate total with updated penalties
        const overdueDays = this.calculateDaysOverdue(loan);
        const updatedPenalty = overdueDays > this.gracePeriod ? 
            loan.principal * (this.penaltyRate / 100) * (overdueDays - this.gracePeriod) : 0;
        
        const totalSettlement = loan.principal + loan.interest + updatedPenalty;
        const discount = totalSettlement * 0.1; // 10% discount for early settlement
        
        const settlementModal = document.getElementById('settlement-modal');
        if (settlementModal) {
            document.getElementById('settlement-loan-id').textContent = loan.id;
            document.getElementById('settlement-principal').textContent = this.formatCurrency(loan.principal);
            document.getElementById('settlement-interest').textContent = this.formatCurrency(loan.interest);
            document.getElementById('settlement-penalty').textContent = this.formatCurrency(updatedPenalty);
            document.getElementById('settlement-total').textContent = this.formatCurrency(totalSettlement);
            document.getElementById('settlement-discount').textContent = this.formatCurrency(discount);
            document.getElementById('settlement-final').textContent = this.formatCurrency(totalSettlement - discount);
            
            settlementModal.classList.remove('hidden');
        }
    }
    
    markLoanAsSettled() {
        const loanId = this.getSelectedLoanId();
        const loan = this.loans.find(l => l.id === loanId);
        
        if (!loan) {
            this.showNotification('Please select a loan first', 'error');
            return;
        }
        
        loan.status = 'settled';
        loan.amountPaid = loan.totalDue;
        loan.balance = 0;
        
        // Add ledger entry
        this.ledgerEntries.push({
            id: 'entry_' + Date.now(),
            loanId: loanId,
            date: new Date().toISOString().split('T')[0],
            type: 'settlement',
            amount: loan.totalDue,
            balanceBefore: loan.totalDue,
            balanceAfter: 0,
            description: 'Loan marked as fully settled',
            recordedBy: 'system'
        });
        
        // Update UI
        if (this.currentLender) {
            this.renderLenderLoans();
            this.renderLenderLedger();
        } else if (this.currentBorrower) {
            this.renderBorrowerLoans();
            this.renderBorrowerLedger();
        }
        
        this.renderAllLoans();
        this.showNotification('Loan marked as settled', 'success');
    }
    
    markLoanAsDefaulted() {
        const loanId = this.getSelectedLoanId();
        const loan = this.loans.find(l => l.id === loanId);
        
        if (!loan) {
            this.showNotification('Please select a loan first', 'error');
            return;
        }
        
        const overdueDays = this.calculateDaysOverdue(loan);
        const penalty = loan.principal * (this.penaltyRate / 100) * overdueDays;
        
        loan.status = 'defaulted';
        loan.penalty += penalty;
        loan.totalDue += penalty;
        loan.balance += penalty;
        
        // Add ledger entry
        this.ledgerEntries.push({
            id: 'entry_' + Date.now(),
            loanId: loanId,
            date: new Date().toISOString().split('T')[0],
            type: 'default',
            amount: penalty,
            balanceBefore: loan.balance - penalty,
            balanceAfter: loan.balance,
            description: `Loan marked as defaulted. Penalty applied for ${overdueDays} days overdue`,
            recordedBy: 'system'
        });
        
        // Update UI
        if (this.currentLender) {
            this.renderLenderLoans();
            this.renderLenderLedger();
        } else if (this.currentBorrower) {
            this.renderBorrowerLoans();
            this.renderBorrowerLedger();
        }
        
        this.renderAllLoans();
        this.showNotification('Loan marked as defaulted', 'warning');
    }
    
    updateLoanStats() {
        const activeLoans = this.loans.filter(l => l.status === 'active').length;
        const overdueLoans = this.loans.filter(l => l.status === 'overdue').length;
        const defaultedLoans = this.loans.filter(l => l.status === 'defaulted').length;
        const settledLoans = this.loans.filter(l => l.status === 'settled').length;
        
        const totalActiveAmount = this.loans
            .filter(l => l.status === 'active')
            .reduce((sum, loan) => sum + loan.balance, 0);
        
        const totalOverdueAmount = this.loans
            .filter(l => l.status === 'overdue')
            .reduce((sum, loan) => sum + loan.balance, 0);
        
        const totalDefaultedAmount = this.loans
            .filter(l => l.status === 'defaulted')
            .reduce((sum, loan) => sum + loan.balance, 0);
        
        const totalEarnings = this.loans
            .reduce((sum, loan) => sum + loan.interest + loan.penalty, 0);
        
        // Update stats display
        document.getElementById('stat-active-loans').textContent = activeLoans;
        document.getElementById('stat-overdue-loans').textContent = overdueLoans;
        document.getElementById('stat-defaulted-loans').textContent = defaultedLoans;
        document.getElementById('stat-settled-loans').textContent = settledLoans;
        
        document.getElementById('stat-active-amount').textContent = this.formatCurrency(totalActiveAmount);
        document.getElementById('stat-overdue-amount').textContent = this.formatCurrency(totalOverdueAmount);
        document.getElementById('stat-defaulted-amount').textContent = this.formatCurrency(totalDefaultedAmount);
        document.getElementById('stat-total-earnings').textContent = this.formatCurrency(totalEarnings);
    }
    
    getSelectedLoanId() {
        // In a real app, this would get the currently selected loan from UI state
        // For demo, return first loan ID
        return this.loans[0]?.id;
    }
    
    calculateDaysOverdue(loan) {
        const dueDate = new Date(loan.dueDate);
        const today = new Date();
        const diffTime = today - dueDate;
        return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }
    
    getLenderActiveLoansCount() {
        if (!this.currentLender) return 0;
        return this.loans.filter(loan => 
            loan.lenderId === this.currentLender.id && 
            (loan.status === 'active' || loan.status === 'overdue')
        ).length;
    }
    
    getLenderSettledLoansCount() {
        if (!this.currentLender) return 0;
        return this.loans.filter(loan => 
            loan.lenderId === this.currentLender.id && 
            loan.status === 'settled'
        ).length;
    }
    
    getLenderTotalEarnings() {
        if (!this.currentLender) return 0;
        return this.loans
            .filter(loan => loan.lenderId === this.currentLender.id)
            .reduce((sum, loan) => sum + loan.interest + loan.penalty, 0);
    }
    
    getBorrowerTotalDue() {
        if (!this.currentBorrower) return 0;
        return this.loans
            .filter(loan => loan.borrowerId === this.currentBorrower.id && loan.status !== 'settled')
            .reduce((sum, loan) => sum + loan.balance, 0);
    }
    
    getBorrowerTotalPaid() {
        if (!this.currentBorrower) return 0;
        return this.loans
            .filter(loan => loan.borrowerId === this.currentBorrower.id)
            .reduce((sum, loan) => sum + loan.amountPaid, 0);
    }
    
    getBorrowerSettledLoansCount() {
        if (!this.currentBorrower) return 0;
        return this.loans.filter(loan => 
            loan.borrowerId === this.currentBorrower.id && 
            loan.status === 'settled'
        ).length;
    }
    
    getLoanStatusClass(status) {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-yellow-100 text-yellow-800';
            case 'defaulted': return 'bg-red-100 text-red-800';
            case 'settled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    getLoanStatusBorderClass(status) {
        switch (status) {
            case 'active': return 'border-green-500';
            case 'overdue': return 'border-yellow-500';
            case 'defaulted': return 'border-red-500';
            case 'settled': return 'border-blue-500';
            default: return 'border-gray-500';
        }
    }
    
    getBorrowerStatusClass(status) {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-yellow-100 text-yellow-800';
            case 'defaulted': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    getEntryTypeClass(type) {
        switch (type) {
            case 'payment': return 'bg-green-100 text-green-800';
            case 'disbursement': return 'bg-blue-100 text-blue-800';
            case 'penalty': return 'bg-red-100 text-red-800';
            case 'interest': return 'bg-yellow-100 text-yellow-800';
            case 'admin_override': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification-toast fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize ledger when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.loanLedger = new LoanLedger();
    
    // Close modal handlers
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.add('hidden');
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
});