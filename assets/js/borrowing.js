'use strict';

// Pesewa.com - Borrowing Module
// Handles borrower functionality: requesting loans, viewing loans, etc.

class BorrowingManager {
    constructor() {
        this.currentBorrower = null;
        this.activeLoans = [];
        this.loanHistory = [];
        this.availableLenders = [];
        this.init();
    }

    init() {
        this.loadBorrowerData();
        this.loadBorrowerLoans();
        this.setupEventListeners();
        this.renderBorrowerDashboard();
    }

    loadBorrowerData() {
        // Check if user is a borrower
        const user = PesewaAuth?.getUser();
        if (user && (user.role === 'borrower' || user.role === 'both')) {
            this.currentBorrower = user;
        }
    }

    loadBorrowerLoans() {
        // Load borrower's loans from localStorage (for demo)
        const loansData = localStorage.getItem(`pesewa_borrower_loans_${this.currentBorrower?.id}`);
        if (loansData) {
            try {
                const allLoans = JSON.parse(loansData);
                this.activeLoans = allLoans.filter(loan => loan.status === 'active' || loan.status === 'pending');
                this.loanHistory = allLoans.filter(loan => loan.status === 'repaid' || loan.status === 'defaulted');
            } catch (error) {
                console.error('Failed to load borrower loans:', error);
                this.activeLoans = [];
                this.loanHistory = [];
            }
        } else {
            this.activeLoans = this.getSampleActiveLoans();
            this.loanHistory = this.getSampleLoanHistory();
            this.saveBorrowerLoans();
        }
    }

    getSampleActiveLoans() {
        return [
            {
                id: 'loan_1',
                borrowerId: this.currentBorrower?.id,
                borrowerName: 'John Kimani',
                lenderId: 'lender_1',
                lenderName: 'M-Pesa Group',
                groupId: 'group_1',
                category: 'PesewaFare',
                amount: 250,
                interestRate: 15,
                disbursementFee: 10,
                totalAmount: 260,
                disbursedDate: '2024-03-20T10:30:00Z',
                dueDate: '2024-03-27T10:30:00Z',
                status: 'active',
                amountRepaid: 0,
                amountDue: 287.5,
                daysOverdue: 0,
                guarantor1: '+254723456789',
                guarantor2: '+254734567890',
                rating: null,
                blacklisted: false,
                notes: 'Transport to job interview',
                repaymentMethod: 'M-Pesa',
                repaymentPhone: '+254712345678'
            },
            {
                id: 'loan_2',
                borrowerId: this.currentBorrower?.id,
                borrowerName: 'John Kimani',
                lenderId: 'lender_2',
                lenderName: 'Family Circle',
                groupId: 'group_2',
                category: 'PesewaData',
                amount: 1000,
                interestRate: 15,
                disbursementFee: 40,
                totalAmount: 1040,
                disbursedDate: '2024-03-22T14:00:00Z',
                dueDate: '2024-03-29T14:00:00Z',
                status: 'pending',
                amountRepaid: 0,
                amountDue: 1196,
                daysOverdue: 0,
                guarantor1: '+254756789012',
                guarantor2: '+254767890123',
                rating: null,
                blacklisted: false,
                notes: 'Internet data for work',
                repaymentMethod: 'Bank Transfer',
                repaymentAccount: '1234567890'
            }
        ];
    }

    getSampleLoanHistory() {
        return [
            {
                id: 'loan_3',
                borrowerId: this.currentBorrower?.id,
                borrowerName: 'John Kimani',
                lenderId: 'lender_3',
                lenderName: 'Business Network',
                groupId: 'group_3',
                category: 'PesewaCookingGas',
                amount: 1200,
                interestRate: 15,
                disbursementFee: 50,
                totalAmount: 1250,
                disbursedDate: '2024-03-10T09:00:00Z',
                dueDate: '2024-03-17T09:00:00Z',
                status: 'repaid',
                amountRepaid: 1437.5,
                amountDue: 0,
                daysOverdue: 0,
                guarantor1: '+254789012345',
                guarantor2: '+254790123456',
                rating: 5,
                blacklisted: false,
                notes: 'Emergency cooking gas refill',
                repaymentMethod: 'M-Pesa',
                repaymentDate: '2024-03-17T08:30:00Z'
            }
        ];
    }

    setupEventListeners() {
        // Request loan form
        const requestForm = document.getElementById('requestLoanForm');
        if (requestForm) {
            requestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoanRequest();
            });
        }

        // Repay loan form
        const repayForm = document.getElementById('repayLoanForm');
        if (repayForm) {
            repayForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoanRepayment();
            });
        }

        // Filter loans
        const filterInputs = document.querySelectorAll('.loan-filter');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.filterLoans());
        });

        // Search loans
        const searchInput = document.getElementById('loanSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchLoans(e.target.value);
            });
        }

        // View loan details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-loan-btn')) {
                const button = e.target.closest('.view-loan-btn');
                const loanId = button.getAttribute('data-loan-id');
                this.showLoanDetails(loanId);
            }
        });

        // Repay loan button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.repay-loan-btn')) {
                const button = e.target.closest('.repay-loan-btn');
                const loanId = button.getAttribute('data-loan-id');
                this.showRepaymentModal(loanId);
            }
        });

        // Calculate loan terms
        const loanAmountInput = document.getElementById('requestAmount');
        if (loanAmountInput) {
            loanAmountInput.addEventListener('input', () => this.calculateRequestTerms());
        }

        // Group selection for loan request
        const groupSelect = document.getElementById('requestGroup');
        if (groupSelect) {
            groupSelect.addEventListener('change', () => this.updateAvailableLenders());
        }

        // Category selection for loan request
        const categorySelect = document.getElementById('requestCategory');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.updateAvailableLenders());
        }

        // Setup loan calculator
        this.setupBorrowerCalculator();
    }

    setupBorrowerCalculator() {
        const calculator = document.getElementById('borrowerCalculator');
        if (!calculator) return;

        const amountInput = calculator.querySelector('#borrowerAmount');
        const daysInput = calculator.querySelector('#borrowerDays');
        const amountValue = calculator.querySelector('#borrowerAmountValue');
        const daysValue = calculator.querySelector('#borrowerDaysValue');
        const interestDisplay = calculator.querySelector('#borrowerInterest');
        const totalDisplay = calculator.querySelector('#borrowerTotal');
        const dailyDisplay = calculator.querySelector('#borrowerDaily');
        const penaltyDisplay = calculator.querySelector('#borrowerPenalty');

        const updateCalculator = () => {
            const amount = parseFloat(amountInput.value) || 0;
            const days = parseInt(daysInput.value) || 7;
            
            // Update display values
            amountValue.textContent = `₵${amount.toLocaleString()}`;
            daysValue.textContent = `${days} days`;
            
            // Calculate terms (15% weekly interest)
            const weeklyInterest = 15;
            const dailyInterest = weeklyInterest / 7;
            const totalInterest = (amount * weeklyInterest / 100) * (days / 7);
            const totalAmount = amount + totalInterest;
            const dailyPayment = totalAmount / days;
            
            // Calculate penalty (5% daily after 7 days)
            const penaltyDays = Math.max(0, days - 7);
            const dailyPenalty = 5;
            const totalPenalty = penaltyDays > 0 ? (amount * dailyPenalty / 100) * penaltyDays : 0;
            
            // Update displays
            interestDisplay.textContent = `₵${totalInterest.toFixed(2)}`;
            totalDisplay.textContent = `₵${totalAmount.toFixed(2)}`;
            dailyDisplay.textContent = `₵${dailyPayment.toFixed(2)}/day`;
            penaltyDisplay.textContent = penaltyDays > 0 ? `₵${totalPenalty.toFixed(2)} (${penaltyDays} days)` : 'None';
        };

        if (amountInput) amountInput.addEventListener('input', updateCalculator);
        if (daysInput) daysInput.addEventListener('input', updateCalculator);
        
        updateCalculator(); // Initial calculation
    }

    handleLoanRequest() {
        const form = document.getElementById('requestLoanForm');
        if (!form) return;

        const formData = new FormData(form);
        
        const loanRequest = {
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount')) || 0,
            lenderId: formData.get('lender'),
            groupId: formData.get('group'),
            purpose: formData.get('purpose'),
            repaymentMethod: formData.get('repaymentMethod'),
            repaymentDetails: formData.get('repaymentDetails'),
            urgency: formData.get('urgency'),
            notes: formData.get('notes')
        };

        // Validate
        if (!loanRequest.category || !loanRequest.amount || loanRequest.amount <= 0) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Check if borrower has active loans in same group
        const activeInGroup = this.activeLoans.filter(loan => 
            loan.groupId === loanRequest.groupId && loan.status === 'active'
        );
        
        if (activeInGroup.length > 0) {
            this.showMessage('You already have an active loan in this group. You can only have one active loan per group.', 'error');
            return;
        }

        // Check total active loans across groups (max 4 groups)
        const uniqueGroups = new Set(this.activeLoans.map(loan => loan.groupId));
        if (uniqueGroups.size >= 4 && !uniqueGroups.has(loanRequest.groupId)) {
            this.showMessage('You cannot borrow from more than 4 groups at a time', 'error');
            return;
        }

        // Create loan request
        const newLoan = this.createLoanRequest(loanRequest);
        
        // Add to active loans (pending approval)
        this.activeLoans.push(newLoan);
        this.saveBorrowerLoans();

        // Show success message
        this.showMessage('Loan request submitted successfully! Awaiting lender approval.', 'success');
        
        // Reset form
        form.reset();
        
        // Update UI
        this.renderBorrowerDashboard();
        
        // Dispatch event
        this.dispatchBorrowingEvent('request-submitted', newLoan);
        
        // Show confirmation modal
        this.showRequestConfirmation(newLoan);
    }

    createLoanRequest(data) {
        // Get lender details
        const lender = this.getLenderById(data.lenderId);
        const group = PesewaGroups?.getGroupById(data.groupId);
        
        // Calculate due date (7 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        
        return {
            id: 'loan_' + Date.now(),
            borrowerId: this.currentBorrower?.id,
            borrowerName: this.currentBorrower?.fullName || 'Unknown',
            lenderId: data.lenderId,
            lenderName: lender?.name || 'Unknown Lender',
            groupId: data.groupId,
            groupName: group?.name || 'Unknown Group',
            category: data.category,
            amount: data.amount,
            interestRate: 15, // Fixed 15% per week
            disbursementFee: this.calculateDisbursementFee(data.amount),
            totalAmount: data.amount + this.calculateDisbursementFee(data.amount),
            requestedDate: new Date().toISOString(),
            dueDate: dueDate.toISOString(),
            status: 'pending',
            amountRepaid: 0,
            amountDue: 0, // Will be set when approved
            daysOverdue: 0,
            guarantor1: this.currentBorrower?.referrer1 || '',
            guarantor2: this.currentBorrower?.referrer2 || '',
            rating: null,
            blacklisted: false,
            purpose: data.purpose,
            repaymentMethod: data.repaymentMethod,
            repaymentDetails: data.repaymentDetails,
            urgency: data.urgency,
            notes: data.notes,
            isCrossGroup: this.isCrossGroupLoan(data.groupId)
        };
    }

    calculateDisbursementFee(amount) {
        // Calculate disbursement fee (example: 5% with minimum 10 and maximum 100)
        const fee = amount * 0.05;
        return Math.min(Math.max(fee, 10), 100);
    }

    isCrossGroupLoan(groupId) {
        // Check if this is a cross-group loan (borrowing in group A to repay group B)
        const hasActiveLoans = this.activeLoans.some(loan => 
            loan.status === 'active' && loan.groupId !== groupId
        );
        return hasActiveLoans;
    }

    handleLoanRepayment() {
        const form = document.getElementById('repayLoanForm');
        const loanId = form.getAttribute('data-loan-id');
        
        if (!loanId) {
            this.showMessage('No loan selected for repayment', 'error');
            return;
        }

        const formData = new FormData(form);
        const repaymentData = {
            amount: parseFloat(formData.get('repaymentAmount')) || 0,
            method: formData.get('repaymentMethod'),
            transactionId: formData.get('transactionId'),
            receiptProof: formData.get('receiptProof'),
            notes: formData.get('notes')
        };

        // Find loan
        const loanIndex = this.activeLoans.findIndex(l => l.id === loanId);
        if (loanIndex === -1) {
            this.showMessage('Loan not found', 'error');
            return;
        }

        const loan = this.activeLoans[loanIndex];

        // Validate repayment amount
        if (repaymentData.amount <= 0) {
            this.showMessage('Please enter a valid repayment amount', 'error');
            return;
        }

        if (repaymentData.amount > loan.amountDue) {
            this.showMessage(`Repayment amount cannot exceed ₵${loan.amountDue}`, 'error');
            return;
        }

        // Update loan
        loan.amountRepaid += repaymentData.amount;
        loan.amountDue = Math.max(0, loan.amountDue - repaymentData.amount);
        
        // Add repayment record
        if (!loan.repaymentHistory) {
            loan.repaymentHistory = [];
        }
        
        loan.repaymentHistory.push({
            amount: repaymentData.amount,
            method: repaymentData.method,
            transactionId: repaymentData.transactionId,
            date: new Date().toISOString(),
            notes: repaymentData.notes
        });

        // Check if fully repaid
        if (loan.amountDue <= 0) {
            loan.status = 'repaid';
            loan.repaidDate = new Date().toISOString();
            
            // Move to history
            this.loanHistory.push(loan);
            this.activeLoans.splice(loanIndex, 1);
        }

        // Save updates
        this.saveBorrowerLoans();

        // Show success message
        this.showMessage('Repayment recorded successfully!', 'success');
        
        // Reset form
        form.reset();
        
        // Update UI
        this.renderBorrowerDashboard();
        
        // Dispatch event
        this.dispatchBorrowingEvent('repayment-made', {
            loanId: loanId,
            amount: repaymentData.amount,
            remaining: loan.amountDue
        });
    }

    updateAvailableLenders() {
        const groupId = document.getElementById('requestGroup')?.value;
        const category = document.getElementById('requestCategory')?.value;
        
        if (!groupId || !category) {
            this.availableLenders = [];
            this.renderLenderOptions();
            return;
        }

        // For demo, get lenders from the selected group that offer the selected category
        const group = PesewaGroups?.getGroupById(groupId);
        if (!group) {
            this.availableLenders = [];
            this.renderLenderOptions();
            return;
        }

        // Mock lenders (in real app, this would come from backend)
        this.availableLenders = [
            {
                id: 'lender_1',
                name: 'M-Pesa Group',
                rating: 4.8,
                maxAmount: 5000,
                disbursementTime: '<10 min',
                categories: ['PesewaFare', 'PesewaData', 'PesewaFood']
            },
            {
                id: 'lender_2',
                name: 'Family Circle',
                rating: 4.9,
                maxAmount: 2000,
                disbursementTime: '<30 min',
                categories: ['PesewaCookingGas', 'PesewaMedicine', 'PesewaElectricityTokens']
            },
            {
                id: 'lender_3',
                name: 'Business Network',
                rating: 4.7,
                maxAmount: 10000,
                disbursementTime: '<1 hour',
                categories: ['PesewaFare', 'Pesewacredo', 'PesewaBikeCarTuktukFuel']
            }
        ].filter(lender => lender.categories.includes(category));

        this.renderLenderOptions();
    }

    renderLenderOptions() {
        const lenderSelect = document.getElementById('requestLender');
        if (!lenderSelect) return;

        lenderSelect.innerHTML = '<option value="">Select a lender</option>';
        
        this.availableLenders.forEach(lender => {
            const option = document.createElement('option');
            option.value = lender.id;
            option.textContent = `${lender.name} (Rating: ${lender.rating}★, Max: ₵${lender.maxAmount.toLocaleString()})`;
            lenderSelect.appendChild(option);
        });

        // Show lender details if one is selected
        lenderSelect.addEventListener('change', (e) => {
            this.showSelectedLenderDetails(e.target.value);
        });
    }

    showSelectedLenderDetails(lenderId) {
        const lender = this.availableLenders.find(l => l.id === lenderId);
        const detailsContainer = document.getElementById('lenderDetails');
        
        if (!lender || !detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="lender-card">
                <h4>${lender.name}</h4>
                <div class="lender-stats">
                    <div class="stat-item">
                        <span class="stat-label">Rating:</span>
                        <span class="stat-value">${lender.rating} ★</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Max Amount:</span>
                        <span class="stat-value">₵${lender.maxAmount.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Disbursement:</span>
                        <span class="stat-value">${lender.disbursementTime}</span>
                    </div>
                </div>
                <div class="lender-categories">
                    <strong>Categories offered:</strong>
                    <div class="categories-list">
                        ${lender.categories.map(cat => `
                            <span class="category-tag">${this.getCategoryIcon(cat)} ${cat}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showLoanDetails(loanId) {
        const loan = this.getLoanById(loanId);
        if (!loan) return;

        const modal = document.createElement('div');
        modal.className = 'modal show loan-details-modal';
        
        const group = PesewaGroups?.getGroupById(loan.groupId);
        const daysOverdue = loan.daysOverdue || 0;
        const penalty = daysOverdue > 7 ? (loan.amountDue * 0.05 * (daysOverdue - 7)) : 0;
        const isPending = loan.status === 'pending';
        const isActive = loan.status === 'active';
        const isOverdue = daysOverdue > 0;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="loan-header">
                    <div class="loan-icon">${this.getCategoryIcon(loan.category)}</div>
                    <div>
                        <h3 class="modal-title">${loan.category}</h3>
                        <div class="loan-meta">
                            <span class="badge ${loan.status === 'active' ? 'badge-success' : loan.status === 'pending' ? 'badge-warning' : loan.status === 'repaid' ? 'badge-primary' : 'badge-danger'}">
                                ${loan.status.toUpperCase()}
                            </span>
                            <span class="badge badge-outline">${group?.name || 'Unknown Group'}</span>
                            ${loan.isCrossGroup ? '<span class="badge badge-warning">Cross-Group</span>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="loan-sections">
                    <div class="loan-section">
                        <h4>Loan Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Amount:</span>
                                <span class="info-value">₵${loan.amount.toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Interest Rate:</span>
                                <span class="info-value">${loan.interestRate}% per week</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Disbursement Fee:</span>
                                <span class="info-value">₵${loan.disbursementFee || 0}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Total Amount:</span>
                                <span class="info-value">₵${loan.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="loan-section">
                        <h4>Timeline</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">${isPending ? 'Requested' : 'Disbursed'}:</span>
                                <span class="info-value">${this.formatDate(isPending ? loan.requestedDate : loan.disbursedDate)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Due Date:</span>
                                <span class="info-value">${this.formatDate(loan.dueDate)}</span>
                            </div>
                            ${loan.repaidDate ? `
                                <div class="info-item">
                                    <span class="info-label">Repaid Date:</span>
                                    <span class="info-value">${this.formatDate(loan.repaidDate)}</span>
                                </div>
                            ` : ''}
                            <div class="info-item">
                                <span class="info-label">Days ${isOverdue ? 'Overdue' : 'Remaining'}:</span>
                                <span class="info-value ${isOverdue ? 'text-danger' : ''}">
                                    ${isOverdue ? `${daysOverdue} days` : this.calculateDaysRemaining(loan.dueDate)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="loan-section">
                        <h4>Repayment Status</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Amount Due:</span>
                                <span class="info-value ${isOverdue ? 'text-danger' : ''}">₵${loan.amountDue.toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Amount Repaid:</span>
                                <span class="info-value">₵${loan.amountRepaid.toLocaleString()}</span>
                            </div>
                            ${penalty > 0 ? `
                                <div class="info-item">
                                    <span class="info-label">Late Penalty:</span>
                                    <span class="info-value text-danger">₵${penalty.toFixed(2)}</span>
                                </div>
                            ` : ''}
                            ${loan.rating ? `
                                <div class="info-item">
                                    <span class="info-label">Your Rating:</span>
                                    <span class="info-value">
                                        <span class="rating-stars">${'★'.repeat(Math.floor(loan.rating))}${'☆'.repeat(5 - Math.floor(loan.rating))}</span>
                                        (${loan.rating.toFixed(1)})
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="loan-section">
                        <h4>Lender Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Lender:</span>
                                <span class="info-value">${loan.lenderName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Repayment Method:</span>
                                <span class="info-value">${loan.repaymentMethod}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Payment Details:</span>
                                <span class="info-value">${loan.repaymentDetails || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${loan.purpose ? `
                        <div class="loan-section">
                            <h4>Loan Purpose</h4>
                            <p class="loan-purpose">${loan.purpose}</p>
                        </div>
                    ` : ''}
                    
                    ${loan.notes ? `
                        <div class="loan-section">
                            <h4>Notes</h4>
                            <div class="loan-notes">${loan.notes}</div>
                        </div>
                    ` : ''}
                    
                    ${loan.repaymentHistory?.length > 0 ? `
                        <div class="loan-section">
                            <h4>Repayment History</h4>
                            <div class="repayment-history">
                                ${loan.repaymentHistory.map(repayment => `
                                    <div class="repayment-item">
                                        <div class="repayment-date">${this.formatDate(repayment.date)}</div>
                                        <div class="repayment-amount">₵${repayment.amount.toLocaleString()}</div>
                                        <div class="repayment-method">${repayment.method}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="loan-actions">
                    ${isActive ? `
                        <button class="btn btn-primary repay-loan-btn" data-loan-id="${loan.id}">Make Repayment</button>
                    ` : ''}
                    ${isPending ? `
                        <button class="btn btn-danger" onclick="PesewaBorrowing.cancelLoanRequest('${loan.id}')">Cancel Request</button>
                    ` : ''}
                    ${loan.status === 'repaid' && !loan.rating ? `
                        <button class="btn btn-outline" onclick="PesewaBorrowing.rateLender('${loan.id}')">Rate Lender</button>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listener for repay button
        modal.querySelector('.repay-loan-btn')?.addEventListener('click', () => {
            modal.remove();
            this.showRepaymentModal(loanId);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showRepaymentModal(loanId) {
        const loan = this.getLoanById(loanId);
        if (!loan) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        
        const daysOverdue = loan.daysOverdue || 0;
        const penalty = daysOverdue > 7 ? (loan.amountDue * 0.05 * (daysOverdue - 7)) : 0;
        const totalDue = loan.amountDue + penalty;

        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">Make Repayment</h3>
                <p>Repay loan for ${loan.category}</p>
                
                <div class="repayment-summary">
                    <div class="summary-item">
                        <span class="summary-label">Amount Due:</span>
                        <span class="summary-value">₵${loan.amountDue.toLocaleString()}</span>
                    </div>
                    ${penalty > 0 ? `
                        <div class="summary-item">
                            <span class="summary-label">Late Penalty (5% daily):</span>
                            <span class="summary-value text-danger">+₵${penalty.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-item total">
                        <span class="summary-label">Total to Pay:</span>
                        <span class="summary-value">₵${totalDue.toLocaleString()}</span>
                    </div>
                </div>
                
                <form id="repaymentForm">
                    <div class="form-group">
                        <label for="repaymentAmount">Amount to Repay (₵)</label>
                        <input type="number" id="repaymentAmount" value="${totalDue}" min="1" max="${totalDue}" step="0.01" required>
                        <div class="form-helper">You can pay partial amounts</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="repaymentMethod">Payment Method</label>
                        <select id="repaymentMethod" required>
                            <option value="">Select method</option>
                            <option value="M-Pesa">M-Pesa</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="transactionId">Transaction ID/Reference</label>
                        <input type="text" id="transactionId" placeholder="e.g., M-Pesa confirmation code" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="receiptProof">Receipt/Proof (Optional)</label>
                        <input type="file" id="receiptProof" accept="image/*,.pdf">
                    </div>
                    
                    <div class="form-group">
                        <label for="repaymentNotes">Notes (Optional)</label>
                        <textarea id="repaymentNotes" placeholder="Add any notes about this repayment"></textarea>
                    </div>
                    
                    <div class="payment-details">
                        <h4>Pay to:</h4>
                        <p><strong>${loan.lenderName}</strong></p>
                        <p>${loan.repaymentMethod}: ${loan.repaymentDetails || 'Contact lender for details'}</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="submit" class="btn btn-primary">Submit Repayment</button>
                        <button type="button" class="btn btn-outline" id="cancelRepayment">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup form submission
        const form = modal.querySelector('#repaymentForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const repaymentData = {
                amount: parseFloat(modal.querySelector('#repaymentAmount').value),
                method: modal.querySelector('#repaymentMethod').value,
                transactionId: modal.querySelector('#transactionId').value,
                receiptProof: modal.querySelector('#receiptProof').files[0]?.name,
                notes: modal.querySelector('#repaymentNotes').value
            };

            // For demo, simulate repayment
            this.simulateRepayment(loanId, repaymentData);
            modal.remove();
        });

        // Cancel button
        modal.querySelector('#cancelRepayment').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    simulateRepayment(loanId, repaymentData) {
        // Find loan
        const loan = this.getLoanById(loanId);
        if (!loan) return;

        // Update loan
        loan.amountRepaid += repaymentData.amount;
        loan.amountDue = Math.max(0, loan.amountDue - repaymentData.amount);
        
        // Add repayment record
        if (!loan.repaymentHistory) {
            loan.repaymentHistory = [];
        }
        
        loan.repaymentHistory.push({
            ...repaymentData,
            date: new Date().toISOString()
        });

        // Check if fully repaid
        if (loan.amountDue <= 0) {
            loan.status = 'repaid';
            loan.repaidDate = new Date().toISOString();
            
            // Move to history
            const loanIndex = this.activeLoans.findIndex(l => l.id === loanId);
            if (loanIndex > -1) {
                this.loanHistory.push(loan);
                this.activeLoans.splice(loanIndex, 1);
            }
        }

        // Save updates
        this.saveBorrowerLoans();

        // Show success message
        this.showMessage(`Repayment of ₵${repaymentData.amount} submitted successfully!`, 'success');
        
        // Update UI
        this.renderBorrowerDashboard();
        
        // Dispatch event
        this.dispatchBorrowingEvent('repayment-submitted', {
            loanId: loanId,
            ...repaymentData
        });
    }

    showRequestConfirmation(loan) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">✅</div>
                <h3 class="modal-title">Loan Request Submitted!</h3>
                
                <div class="confirmation-details">
                    <div class="detail-item">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">₵${loan.amount.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">${loan.category}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Lender:</span>
                        <span class="detail-value">${loan.lenderName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Group:</span>
                        <span class="detail-value">${loan.groupName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Purpose:</span>
                        <span class="detail-value">${loan.purpose || 'Not specified'}</span>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h4>What happens next?</h4>
                    <ol>
                        <li>Lender reviews your request (usually within 10 minutes)</li>
                        <li>If approved, funds will be disbursed to your preferred method</li>
                        <li>Repay within 7 days to avoid penalties</li>
                        <li>Build your reputation for better loan terms</li>
                    </ol>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" id="viewRequest">View Request Status</button>
                    <button class="btn btn-outline" id="closeConfirmation">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // View request button
        modal.querySelector('#viewRequest').addEventListener('click', () => {
            modal.remove();
            this.showLoanDetails(loan.id);
        });

        // Close button
        modal.querySelector('#closeConfirmation').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    filterLoans() {
        const status = document.getElementById('filterLoanStatus')?.value;
        const category = document.getElementById('filterLoanCategory')?.value;
        const group = document.getElementById('filterLoanGroup')?.value;

        let filtered = this.activeLoans;

        // Filter by status
        if (status && status !== 'all') {
            filtered = filtered.filter(loan => loan.status === status);
        }

        // Filter by category
        if (category && category !== 'all') {
            filtered = filtered.filter(loan => loan.category === category);
        }

        // Filter by group
        if (group && group !== 'all') {
            filtered = filtered.filter(loan => loan.groupId === group);
        }

        this.renderActiveLoans(filtered);
    }

    searchLoans(query) {
        if (!query.trim()) {
            this.renderActiveLoans();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.activeLoans.filter(loan => 
            loan.lenderName.toLowerCase().includes(searchTerm) ||
            loan.category.toLowerCase().includes(searchTerm) ||
            loan.purpose?.toLowerCase().includes(searchTerm) ||
            loan.notes?.toLowerCase().includes(searchTerm)
        );

        this.renderActiveLoans(filtered);
    }

    renderBorrowerDashboard() {
        // Update dashboard stats
        this.updateBorrowerStats();
        
        // Render active loans
        this.renderActiveLoans();
        
        // Render loan history
        this.renderLoanHistory();
        
        // Update request form with borrower's groups
        this.updateRequestForm();
    }

    updateBorrowerStats() {
        const stats = this.calculateBorrowerStats();
        
        // Update stat cards
        const totalBorrowedElem = document.getElementById('totalBorrowed');
        const activeLoansElem = document.getElementById('activeLoansCount');
        const totalRepaidElem = document.getElementById('totalRepaid');
        const avgRatingElem = document.getElementById('borrowerRating');
        const defaultRateElem = document.getElementById('borrowerDefaultRate');
        const groupsCountElem = document.getElementById('groupsCount');

        if (totalBorrowedElem) totalBorrowedElem.textContent = `₵${stats.totalBorrowed.toLocaleString()}`;
        if (activeLoansElem) activeLoansElem.textContent = stats.activeLoans;
        if (totalRepaidElem) totalRepaidElem.textContent = `₵${stats.totalRepaid.toLocaleString()}`;
        if (avgRatingElem) avgRatingElem.textContent = stats.avgRating.toFixed(1);
        if (defaultRateElem) defaultRateElem.textContent = `${stats.defaultRate}%`;
        if (groupsCountElem) groupsCountElem.textContent = stats.groupsCount;
    }

    calculateBorrowerStats() {
        const allLoans = [...this.activeLoans, ...this.loanHistory];
        
        const stats = {
            totalBorrowed: allLoans.reduce((sum, loan) => sum + loan.amount, 0),
            activeLoans: this.activeLoans.filter(loan => loan.status === 'active').length,
            pendingLoans: this.activeLoans.filter(loan => loan.status === 'pending').length,
            totalRepaid: this.loanHistory.reduce((sum, loan) => sum + loan.amountRepaid, 0),
            avgRating: 0,
            defaultRate: 0,
            groupsCount: new Set(allLoans.map(loan => loan.groupId)).size
        };

        // Calculate average rating from rated loans
        const ratedLoans = this.loanHistory.filter(loan => loan.rating);
        stats.avgRating = ratedLoans.length > 0 
            ? ratedLoans.reduce((sum, loan) => sum + loan.rating, 0) / ratedLoans.length 
            : 0;

        // Calculate default rate (loans with >60 days overdue)
        const defaultedLoans = allLoans.filter(loan => loan.daysOverdue > 60);
        stats.defaultRate = allLoans.length > 0 
            ? (defaultedLoans.length / allLoans.length * 100).toFixed(1) 
            : 0;

        return stats;
    }

    updateRequestForm() {
        const groupSelect = document.getElementById('requestGroup');
        if (!groupSelect) return;

        // Get user's groups
        const userGroups = PesewaGroups?.getUserGroups() || [];
        
        groupSelect.innerHTML = '<option value="">Select a group</option>';
        userGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = `${group.name} (${group.country})`;
            groupSelect.appendChild(option);
        });
    }

    renderActiveLoans(loansToRender = null) {
        const container = document.getElementById('activeLoansContainer');
        if (!container) return;

        const loans = loansToRender || this.activeLoans;

        if (loans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <h3 class="empty-title">No Active Loans</h3>
                    <p class="empty-description">You don't have any active or pending loans.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('requestLoanForm').scrollIntoView()">
                        Request Your First Loan
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = loans.map(loan => {
            const daysOverdue = loan.daysOverdue || 0;
            const isPending = loan.status === 'pending';
            const isOverdue = daysOverdue > 0;
            const penalty = daysOverdue > 7 ? (loan.amountDue * 0.05 * (daysOverdue - 7)) : 0;

            return `
                <div class="loan-card ${loan.status} ${isOverdue ? 'overdue' : ''}">
                    <div class="loan-card-header">
                        <div class="loan-card-title">
                            <h4>${loan.category}</h4>
                            <div class="loan-card-subtitle">
                                <span class="loan-lender">${loan.lenderName}</span>
                                <span class="loan-group">${loan.groupName}</span>
                                ${loan.isCrossGroup ? '<span class="loan-cross">🔄 Cross-Group</span>' : ''}
                            </div>
                        </div>
                        <div class="loan-card-status">
                            <span class="badge ${loan.status === 'active' ? 'badge-success' : loan.status === 'pending' ? 'badge-warning' : 'badge-danger'}">
                                ${loan.status.toUpperCase()}
                            </span>
                            ${isOverdue ? `<span class="badge badge-danger">${daysOverdue} days overdue</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="loan-card-body">
                        <div class="loan-amounts">
                            <div class="amount-item">
                                <span class="amount-label">Amount:</span>
                                <span class="amount-value">₵${loan.amount.toLocaleString()}</span>
                            </div>
                            <div class="amount-item">
                                <span class="amount-label">Due:</span>
                                <span class="amount-value ${isOverdue ? 'text-danger' : ''}">₵${loan.amountDue.toLocaleString()}</span>
                            </div>
                            ${penalty > 0 ? `
                                <div class="amount-item">
                                    <span class="amount-label">Penalty:</span>
                                    <span class="amount-value text-danger">₵${penalty.toFixed(2)}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="loan-timeline">
                            <div class="timeline-item">
                                <span class="timeline-label">${isPending ? 'Requested' : 'Disbursed'}:</span>
                                <span class="timeline-value">${this.formatDate(isPending ? loan.requestedDate : loan.disbursedDate)}</span>
                            </div>
                            <div class="timeline-item">
                                <span class="timeline-label">Due:</span>
                                <span class="timeline-value">${this.formatDate(loan.dueDate)}</span>
                            </div>
                            <div class="timeline-item">
                                <span class="timeline-label">Days ${isOverdue ? 'Overdue' : 'Left'}:</span>
                                <span class="timeline-value ${isOverdue ? 'text-danger' : ''}">
                                    ${isOverdue ? daysOverdue : this.calculateDaysRemaining(loan.dueDate)}
                                </span>
                            </div>
                        </div>
                        
                        ${loan.purpose ? `
                            <div class="loan-purpose">
                                <p><strong>Purpose:</strong> ${loan.purpose}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="loan-card-actions">
                        <button class="btn btn-primary view-loan-btn" data-loan-id="${loan.id}">View Details</button>
                        ${loan.status === 'active' ? `
                            <button class="btn btn-success repay-loan-btn" data-loan-id="${loan.id}">Repay Now</button>
                        ` : ''}
                        ${loan.status === 'pending' ? `
                            <button class="btn btn-outline" onclick="PesewaBorrowing.cancelLoanRequest('${loan.id}')">Cancel</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderLoanHistory() {
        const container = document.getElementById('loanHistoryContainer');
        if (!container) return;

        if (this.loanHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📜</div>
                    <h3 class="empty-title">No Loan History</h3>
                    <p class="empty-description">You haven't repaid any loans yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.loanHistory.map(loan => `
            <div class="history-card ${loan.status}">
                <div class="history-header">
                    <h4>${loan.category}</h4>
                    <div class="history-meta">
                        <span class="badge ${loan.status === 'repaid' ? 'badge-success' : 'badge-danger'}">
                            ${loan.status.toUpperCase()}
                        </span>
                        <span class="history-date">${this.formatDate(loan.repaidDate || loan.dueDate)}</span>
                    </div>
                </div>
                
                <div class="history-details">
                    <div class="detail-row">
                        <span class="detail-label">Lender:</span>
                        <span class="detail-value">${loan.lenderName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">₵${loan.amount.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Repaid:</span>
                        <span class="detail-value">₵${loan.amountRepaid.toLocaleString()}</span>
                    </div>
                    ${loan.rating ? `
                        <div class="detail-row">
                            <span class="detail-label">Your Rating:</span>
                            <span class="detail-value">
                                <span class="rating-stars">${'★'.repeat(Math.floor(loan.rating))}${'☆'.repeat(5 - Math.floor(loan.rating))}</span>
                                (${loan.rating.toFixed(1)})
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="history-actions">
                    <button class="btn btn-outline view-loan-btn" data-loan-id="${loan.id}">View Details</button>
                    ${!loan.rating && loan.status === 'repaid' ? `
                        <button class="btn btn-outline" onclick="PesewaBorrowing.rateLender('${loan.id}')">Rate Lender</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    calculateRequestTerms() {
        const amountInput = document.getElementById('requestAmount');
        const amountDisplay = document.getElementById('requestAmountDisplay');
        const interestDisplay = document.getElementById('requestInterest');
        const totalDisplay = document.getElementById('requestTotal');
        const dailyDisplay = document.getElementById('requestDaily');

        if (!amountInput || !amountDisplay) return;

        const amount = parseFloat(amountInput.value) || 0;
        
        // Update amount display
        amountDisplay.textContent = `₵${amount.toLocaleString()}`;
        
        // Calculate terms (15% weekly interest, 7 days)
        const weeklyInterest = 15;
        const interest = amount * weeklyInterest / 100;
        const disbursementFee = this.calculateDisbursementFee(amount);
        const total = amount + interest + disbursementFee;
        const daily = total / 7;
        
        // Update displays
        if (interestDisplay) interestDisplay.textContent = `₵${interest.toFixed(2)}`;
        if (totalDisplay) totalDisplay.textContent = `₵${total.toFixed(2)}`;
        if (dailyDisplay) dailyDisplay.textContent = `₵${daily.toFixed(2)}/day`;
    }

    // Helper methods
    getLoanById(id) {
        return [...this.activeLoans, ...this.loanHistory].find(loan => loan.id === id);
    }

    getLenderById(id) {
        // Mock lender lookup
        return this.availableLenders.find(l => l.id === id);
    }

    getCategoryIcon(category) {
        const icons = {
            'PesewaFare': '🚌',
            'PesewaData': '📱',
            'PesewaCookingGas': '🔥',
            'PesewaFood': '🍲',
            'Pesewacredo': '🔧',
            'PesewaWaterBill': '💧',
            'PesewaBikeCarTuktukFuel': '⛽',
            'PesewaBikeCarTuktukRepair': '🛠️',
            'PesewaMedicine': '💊',
            'PesewaElectricityTokens': '💡',
            'Pesewaschoolfees': '🎓',
            'PesewaTVSubscription': '📺'
        };
        return icons[category] || '💰';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    calculateDaysRemaining(dueDateString) {
        const dueDate = new Date(dueDateString);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} days` : 'Today';
    }

    showMessage(message, type = 'info', container = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `borrowing-message alert alert-${type}`;
        messageDiv.innerHTML = `
            <div class="alert-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</div>
            <div class="alert-content">
                <p class="alert-message">${message}</p>
            </div>
        `;

        const targetContainer = container || document.body;
        targetContainer.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    saveBorrowerLoans() {
        if (this.currentBorrower) {
            const allLoans = [...this.activeLoans, ...this.loanHistory];
            localStorage.setItem(`pesewa_borrower_loans_${this.currentBorrower.id}`, JSON.stringify(allLoans));
        }
    }

    dispatchBorrowingEvent(type, data) {
        const event = new CustomEvent(`borrowing:${type}`, { detail: data });
        window.dispatchEvent(event);
    }

    // Public methods
    getActiveLoans() {
        return this.activeLoans.filter(loan => loan.status === 'active');
    }

    getPendingLoans() {
        return this.activeLoans.filter(loan => loan.status === 'pending');
    }

    getOverdueLoans() {
        return this.activeLoans.filter(loan => loan.daysOverdue > 0);
    }

    getTotalDebt() {
        return this.activeLoans.reduce((total, loan) => total + loan.amountDue, 0);
    }

    // Actions for UI buttons
    cancelLoanRequest(loanId) {
        const loan = this.getLoanById(loanId);
        if (!loan || loan.status !== 'pending') return;

        if (confirm(`Are you sure you want to cancel your loan request for ₵${loan.amount}?`)) {
            const loanIndex = this.activeLoans.findIndex(l => l.id === loanId);
            if (loanIndex > -1) {
                this.activeLoans.splice(loanIndex, 1);
                this.saveBorrowerLoans();
                this.renderBorrowerDashboard();
                this.showMessage('Loan request cancelled', 'success');
            }
        }
    }

    rateLender(loanId) {
        const loan = this.getLoanById(loanId);
        if (!loan || loan.status !== 'repaid' || loan.rating) return;

        const rating = prompt('Rate the lender (1-5 stars):');
        if (rating && rating >= 1 && rating <= 5) {
            loan.rating = parseFloat(rating);
            this.saveBorrowerLoans();
            this.renderBorrowerDashboard();
            this.showMessage('Thank you for rating the lender!', 'success');
        }
    }
}

// Initialize Borrowing Manager
const borrowingManager = new BorrowingManager();

// Export for use in other modules
window.PesewaBorrowing = borrowingManager;

// Update borrowing data when user logs in/out
window.addEventListener('auth:login', () => {
    borrowingManager.loadBorrowerData();
    borrowingManager.loadBorrowerLoans();
    borrowingManager.renderBorrowerDashboard();
});

window.addEventListener('auth:logout', () => {
    borrowingManager.currentBorrower = null;
    borrowingManager.activeLoans = [];
    borrowingManager.loanHistory = [];
});