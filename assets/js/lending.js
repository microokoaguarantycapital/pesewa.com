'use strict';

// Pesewa.com - Lending Module
// Handles lender functionality: offering loans, managing ledgers, etc.

class LendingManager {
    constructor() {
        this.loansOffered = [];
        this.ledgers = [];
        this.currentLender = null;
        this.init();
    }

    init() {
        this.loadLenderData();
        this.loadLedgers();
        this.setupEventListeners();
        this.renderLenderDashboard();
    }

    loadLenderData() {
        // Check if user is a lender
        const user = PesewaAuth?.getUser();
        if (user && (user.role === 'lender' || user.role === 'both')) {
            this.currentLender = user;
            this.loadLoansOffered();
        }
    }

    loadLoansOffered() {
        // Load loans offered from localStorage (for demo)
        const loansData = localStorage.getItem(`pesewa_loans_${this.currentLender?.id}`);
        if (loansData) {
            try {
                this.loansOffered = JSON.parse(loansData);
            } catch (error) {
                console.error('Failed to load loans:', error);
                this.loansOffered = [];
            }
        }
    }

    loadLedgers() {
        // Load ledgers from localStorage (for demo)
        const ledgersData = localStorage.getItem(`pesewa_ledgers_${this.currentLender?.id}`);
        if (ledgersData) {
            try {
                this.ledgers = JSON.parse(ledgersData);
            } catch (error) {
                console.error('Failed to load ledgers:', error);
                this.ledgers = this.getSampleLedgers();
            }
        } else {
            this.ledgers = this.getSampleLedgers();
            this.saveLedgers();
        }
    }

    getSampleLedgers() {
        // Sample ledgers for demo
        return [
            {
                id: 'ledger_1',
                lenderId: this.currentLender?.id,
                borrowerId: 'user_2',
                borrowerName: 'John Kimani',
                borrowerPhone: '+254712345678',
                groupId: 'group_1',
                category: 'PesewaFare',
                amount: 250,
                interestRate: 15, // 15% per week
                disbursementFee: 10,
                totalAmount: 260,
                disbursedDate: '2024-03-20T10:30:00Z',
                dueDate: '2024-03-27T10:30:00Z',
                status: 'active',
                amountRepaid: 0,
                amountDue: 287.5, // 260 + 15% interest
                daysOverdue: 0,
                guarantor1: '+254723456789',
                guarantor2: '+254734567890',
                rating: 5,
                blacklisted: false,
                notes: 'Transport to job interview'
            },
            {
                id: 'ledger_2',
                lenderId: this.currentLender?.id,
                borrowerId: 'user_3',
                borrowerName: 'Mama Jimmy',
                borrowerPhone: '+254745678901',
                groupId: 'group_1',
                category: 'PesewaCookingGas',
                amount: 1200,
                interestRate: 15,
                disbursementFee: 50,
                totalAmount: 1250,
                disbursedDate: '2024-03-18T14:20:00Z',
                dueDate: '2024-03-25T14:20:00Z',
                status: 'repaid',
                amountRepaid: 1437.5, // 1250 + 15% interest
                amountDue: 0,
                daysOverdue: 0,
                guarantor1: '+254756789012',
                guarantor2: '+254767890123',
                rating: 5,
                blacklisted: false,
                notes: 'Emergency cooking gas refill'
            },
            {
                id: 'ledger_3',
                lenderId: this.currentLender?.id,
                borrowerId: 'user_4',
                borrowerName: 'Pastor Ndungu',
                borrowerPhone: '+254778901234',
                groupId: 'group_2',
                category: 'PesewaData',
                amount: 1000,
                interestRate: 15,
                disbursementFee: 40,
                totalAmount: 1040,
                disbursedDate: '2024-03-15T09:15:00Z',
                dueDate: '2024-03-22T09:15:00Z',
                status: 'overdue',
                amountRepaid: 500,
                amountDue: 696, // 1040 + 15% interest - 500
                daysOverdue: 5,
                guarantor1: '+254789012345',
                guarantor2: '+254790123456',
                rating: 3,
                blacklisted: false,
                notes: 'Internet data for online work'
            }
        ];
    }

    setupEventListeners() {
        // Offer loan form
        const offerForm = document.getElementById('offerLoanForm');
        if (offerForm) {
            offerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOfferLoan();
            });
        }

        // Update ledger form
        const updateForm = document.getElementById('updateLedgerForm');
        if (updateForm) {
            updateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateLedger();
            });
        }

        // Filter ledgers
        const filterInputs = document.querySelectorAll('.ledger-filter');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.filterLedgers());
        });

        // Search ledgers
        const searchInput = document.getElementById('ledgerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchLedgers(e.target.value);
            });
        }

        // Rate borrower
        document.addEventListener('click', (e) => {
            if (e.target.closest('.rate-borrower-btn')) {
                const button = e.target.closest('.rate-borrower-btn');
                const ledgerId = button.getAttribute('data-ledger-id');
                this.showRatingModal(ledgerId);
            }
        });

        // Blacklist borrower
        document.addEventListener('click', (e) => {
            if (e.target.closest('.blacklist-borrower-btn')) {
                const button = e.target.closest('.blacklist-borrower-btn');
                const ledgerId = button.getAttribute('data-ledger-id');
                this.showBlacklistModal(ledgerId);
            }
        });

        // View ledger details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-ledger-btn')) {
                const button = e.target.closest('.view-ledger-btn');
                const ledgerId = button.getAttribute('data-ledger-id');
                this.showLedgerDetails(ledgerId);
            }
        });

        // Calculate loan terms
        const loanAmountInput = document.getElementById('loanAmount');
        if (loanAmountInput) {
            loanAmountInput.addEventListener('input', () => this.calculateLoanTerms());
        }

        // Loan calculator
        this.setupLoanCalculator();
    }

    setupLoanCalculator() {
        const calculator = document.getElementById('loanCalculator');
        if (!calculator) return;

        const amountInput = calculator.querySelector('#calcAmount');
        const daysInput = calculator.querySelector('#calcDays');
        const amountValue = calculator.querySelector('#calcAmountValue');
        const daysValue = calculator.querySelector('#calcDaysValue');
        const interestDisplay = calculator.querySelector('#calcInterest');
        const totalDisplay = calculator.querySelector('#calcTotal');
        const dailyDisplay = calculator.querySelector('#calcDaily');

        const updateCalculator = () => {
            const amount = parseFloat(amountInput.value) || 0;
            const days = parseInt(daysInput.value) || 7;
            
            // Update display values
            amountValue.textContent = `₵${amount.toLocaleString()}`;
            daysValue.textContent = `${days} days`;
            
            // Calculate terms
            const weeklyInterest = 15; // 15% per week
            const dailyInterest = weeklyInterest / 7;
            const totalInterest = (amount * weeklyInterest / 100) * (days / 7);
            const totalAmount = amount + totalInterest;
            const dailyPayment = totalAmount / days;
            
            // Update displays
            interestDisplay.textContent = `₵${totalInterest.toFixed(2)}`;
            totalDisplay.textContent = `₵${totalAmount.toFixed(2)}`;
            dailyDisplay.textContent = `₵${dailyPayment.toFixed(2)}/day`;
        };

        if (amountInput) amountInput.addEventListener('input', updateCalculator);
        if (daysInput) daysInput.addEventListener('input', updateCalculator);
        
        updateCalculator(); // Initial calculation
    }

    handleOfferLoan() {
        const form = document.getElementById('offerLoanForm');
        const formData = new FormData(form);
        
        const loanData = {
            category: formData.get('category'),
            maxAmount: parseFloat(formData.get('maxAmount')) || 0,
            interestRate: 15, // Fixed 15% per week
            disbursementFee: parseFloat(formData.get('disbursementFee')) || 0,
            repaymentPeriod: parseInt(formData.get('repaymentPeriod')) || 7,
            groups: Array.from(formData.getAll('groups')),
            description: formData.get('description'),
            conditions: formData.get('conditions')
        };

        // Validate
        if (!loanData.category || !loanData.maxAmount || loanData.maxAmount <= 0) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Check subscription status
        if (!this.checkLenderSubscription()) {
            this.showMessage('Your lender subscription has expired. Please renew to offer loans.', 'error');
            return;
        }

        // Create loan offer
        const loanOffer = this.createLoanOffer(loanData);
        this.loansOffered.push(loanOffer);
        this.saveLoansOffered();

        // Show success message
        this.showMessage('Loan offer created successfully!', 'success');
        
        // Reset form
        form.reset();
        
        // Update UI
        this.renderLoanOffers();
        
        // Dispatch event
        this.dispatchLendingEvent('offer-created', loanOffer);
    }

    createLoanOffer(data) {
        return {
            id: 'offer_' + Date.now(),
            lenderId: this.currentLender?.id,
            ...data,
            status: 'active',
            createdAt: new Date().toISOString(),
            totalOffers: 0,
            activeLoans: 0,
            repaidLoans: 0,
            defaultedLoans: 0
        };
    }

    handleUpdateLedger() {
        const form = document.getElementById('updateLedgerForm');
        const ledgerId = form.getAttribute('data-ledger-id');
        
        if (!ledgerId) {
            this.showMessage('No ledger selected', 'error');
            return;
        }

        const formData = new FormData(form);
        const updateData = {
            amountRepaid: parseFloat(formData.get('amountRepaid')) || 0,
            status: formData.get('status'),
            notes: formData.get('notes'),
            updatedAt: new Date().toISOString()
        };

        // Find ledger
        const ledgerIndex = this.ledgers.findIndex(l => l.id === ledgerId);
        if (ledgerIndex === -1) {
            this.showMessage('Ledger not found', 'error');
            return;
        }

        const ledger = this.ledgers[ledgerIndex];

        // Update ledger
        ledger.amountRepaid += updateData.amountRepaid;
        ledger.amountDue = Math.max(0, ledger.amountDue - updateData.amountRepaid);
        
        if (updateData.status) {
            ledger.status = updateData.status;
        }

        if (updateData.notes) {
            ledger.notes = ledger.notes ? `${ledger.notes}\n${updateData.notes}` : updateData.notes;
        }

        // Update days overdue
        if (ledger.status === 'active') {
            const dueDate = new Date(ledger.dueDate);
            const now = new Date();
            const daysOverdue = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));
            ledger.daysOverdue = daysOverdue;
            
            if (daysOverdue > 0) {
                ledger.status = 'overdue';
            }
        }

        // Check if fully repaid
        if (ledger.amountDue <= 0) {
            ledger.status = 'repaid';
            ledger.repaidDate = new Date().toISOString();
        }

        // Save updates
        this.saveLedgers();

        // Show success message
        this.showMessage('Ledger updated successfully!', 'success');
        
        // Reset form
        form.reset();
        
        // Update UI
        this.renderLedgers();
        
        // Dispatch event
        this.dispatchLendingEvent('ledger-updated', ledger);
    }

    showRatingModal(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">Rate Borrower</h3>
                <p>Rate ${ledger.borrowerName}'s repayment behavior</p>
                
                <div class="rating-input">
                    <div class="rating-stars-large">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <span class="star" data-value="${star}">☆</span>
                        `).join('')}
                    </div>
                    <div class="rating-value">0/5</div>
                </div>
                
                <div class="form-group">
                    <label for="ratingComments">Comments (optional)</label>
                    <textarea id="ratingComments" placeholder="Add comments about the borrower's repayment behavior"></textarea>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" id="submitRating">Submit Rating</button>
                    <button class="btn btn-outline" id="cancelRating">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup star rating
        const stars = modal.querySelectorAll('.star');
        const ratingValue = modal.querySelector('.rating-value');
        let selectedRating = 0;

        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const value = parseInt(star.getAttribute('data-value'));
                this.updateStarDisplay(stars, value);
            });

            star.addEventListener('mouseout', () => {
                this.updateStarDisplay(stars, selectedRating);
            });

            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-value'));
                ratingValue.textContent = `${selectedRating}/5`;
            });
        });

        // Submit rating
        modal.querySelector('#submitRating').addEventListener('click', () => {
            if (selectedRating === 0) {
                this.showMessage('Please select a rating', 'error', modal);
                return;
            }

            this.updateBorrowerRating(ledgerId, selectedRating, modal.querySelector('#ratingComments').value);
            modal.remove();
        });

        // Cancel
        modal.querySelector('#cancelRating').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    updateStarDisplay(stars, rating) {
        stars.forEach(star => {
            const value = parseInt(star.getAttribute('data-value'));
            star.textContent = value <= rating ? '★' : '☆';
            star.style.color = value <= rating ? 'var(--orange-primary)' : 'var(--gray-border)';
        });
    }

    updateBorrowerRating(ledgerId, rating, comments) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        // Update ledger rating
        ledger.rating = rating;
        
        // Add rating record
        if (!ledger.ratingHistory) {
            ledger.ratingHistory = [];
        }
        
        ledger.ratingHistory.push({
            rating: rating,
            comments: comments,
            ratedBy: this.currentLender?.id,
            ratedAt: new Date().toISOString()
        });

        // Save changes
        this.saveLedgers();

        // Show success message
        this.showMessage(`Rating submitted for ${ledger.borrowerName}`, 'success');
        
        // Update UI
        this.renderLedgers();
        
        // Dispatch event
        this.dispatchLendingEvent('borrower-rated', {
            ledgerId: ledgerId,
            rating: rating,
            borrowerId: ledger.borrowerId
        });
    }

    showBlacklistModal(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">Blacklist Borrower</h3>
                <p>Are you sure you want to blacklist ${ledger.borrowerName}?</p>
                
                <div class="blacklist-warning">
                    <div class="warning-icon">⚠️</div>
                    <div class="warning-content">
                        <h4>Consequences of Blacklisting:</h4>
                        <ul>
                            <li>Borrower will be blocked from new loans platform-wide</li>
                            <li>Borrower cannot join new groups</li>
                            <li>Blacklist badge will be visible to all lenders</li>
                            <li>Only platform admin can remove blacklist</li>
                        </ul>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="blacklistReason">Reason for blacklisting</label>
                    <textarea id="blacklistReason" placeholder="Explain why you're blacklisting this borrower" required></textarea>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-danger" id="confirmBlacklist">Blacklist Borrower</button>
                    <button class="btn btn-outline" id="cancelBlacklist">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Confirm blacklist
        modal.querySelector('#confirmBlacklist').addEventListener('click', () => {
            const reason = modal.querySelector('#blacklistReason').value;
            if (!reason.trim()) {
                this.showMessage('Please provide a reason for blacklisting', 'error', modal);
                return;
            }

            this.blacklistBorrower(ledgerId, reason);
            modal.remove();
        });

        // Cancel
        modal.querySelector('#cancelBlacklist').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    blacklistBorrower(ledgerId, reason) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        // Update ledger
        ledger.blacklisted = true;
        ledger.blacklistReason = reason;
        ledger.blacklistedAt = new Date().toISOString();
        ledger.blacklistedBy = this.currentLender?.id;

        // Save changes
        this.saveLedgers();

        // Show success message
        this.showMessage(`${ledger.borrowerName} has been blacklisted`, 'success');
        
        // Update UI
        this.renderLedgers();
        
        // Dispatch event (admin would be notified in real system)
        this.dispatchLendingEvent('borrower-blacklisted', {
            ledgerId: ledgerId,
            borrowerId: ledger.borrowerId,
            reason: reason
        });
    }

    showLedgerDetails(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal show ledger-details-modal';
        
        const group = PesewaGroups?.getGroupById(ledger.groupId);
        const daysOverdue = ledger.daysOverdue || 0;
        const penalty = daysOverdue > 7 ? (ledger.amountDue * 0.05 * (daysOverdue - 7)) : 0;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="ledger-header">
                    <div class="ledger-icon">📋</div>
                    <div>
                        <h3 class="modal-title">Ledger Details</h3>
                        <div class="ledger-meta">
                            <span class="badge ${ledger.status === 'active' ? 'badge-success' : ledger.status === 'overdue' ? 'badge-warning' : 'badge-primary'}">
                                ${ledger.status.toUpperCase()}
                            </span>
                            <span class="badge badge-outline">${this.getCategoryIcon(ledger.category)} ${ledger.category}</span>
                            ${ledger.blacklisted ? '<span class="badge badge-danger">BLACKLISTED</span>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="ledger-sections">
                    <div class="ledger-section">
                        <h4>Borrower Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Name:</span>
                                <span class="info-value">${ledger.borrowerName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Phone:</span>
                                <span class="info-value">${ledger.borrowerPhone}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Group:</span>
                                <span class="info-value">${group?.name || 'Unknown Group'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Rating:</span>
                                <span class="info-value">
                                    <span class="rating-stars">${'★'.repeat(Math.floor(ledger.rating))}${'☆'.repeat(5 - Math.floor(ledger.rating))}</span>
                                    (${ledger.rating.toFixed(1)})
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ledger-section">
                        <h4>Loan Details</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Amount:</span>
                                <span class="info-value">₵${ledger.amount.toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Interest Rate:</span>
                                <span class="info-value">${ledger.interestRate}% per week</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Disbursement Fee:</span>
                                <span class="info-value">₵${ledger.disbursementFee || 0}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Total Disbursed:</span>
                                <span class="info-value">₵${ledger.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ledger-section">
                        <h4>Repayment Status</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Disbursed:</span>
                                <span class="info-value">${this.formatDate(ledger.disbursedDate)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Due Date:</span>
                                <span class="info-value">${this.formatDate(ledger.dueDate)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Days Overdue:</span>
                                <span class="info-value ${daysOverdue > 0 ? 'text-danger' : ''}">${daysOverdue} days</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Penalty:</span>
                                <span class="info-value">₵${penalty.toFixed(2)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Amount Repaid:</span>
                                <span class="info-value">₵${ledger.amountRepaid.toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Amount Due:</span>
                                <span class="info-value">₵${ledger.amountDue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ledger-section">
                        <h4>Guarantors</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Guarantor 1:</span>
                                <span class="info-value">${ledger.guarantor1}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Guarantor 2:</span>
                                <span class="info-value">${ledger.guarantor2}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${ledger.notes ? `
                        <div class="ledger-section">
                            <h4>Notes</h4>
                            <div class="ledger-notes">${ledger.notes}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="ledger-actions">
                    ${ledger.status !== 'repaid' ? `
                        <button class="btn btn-primary" data-action="update-ledger" data-ledger-id="${ledger.id}">Update Repayment</button>
                    ` : ''}
                    ${!ledger.blacklisted ? `
                        <button class="btn btn-outline" data-action="rate-borrower" data-ledger-id="${ledger.id}">Rate Borrower</button>
                        <button class="btn btn-danger" data-action="blacklist" data-ledger-id="${ledger.id}">Blacklist</button>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for actions
        modal.querySelector('[data-action="update-ledger"]')?.addEventListener('click', () => {
            modal.remove();
            this.showUpdateLedgerForm(ledgerId);
        });

        modal.querySelector('[data-action="rate-borrower"]')?.addEventListener('click', () => {
            modal.remove();
            this.showRatingModal(ledgerId);
        });

        modal.querySelector('[data-action="blacklist"]')?.addEventListener('click', () => {
            modal.remove();
            this.showBlacklistModal(ledgerId);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showUpdateLedgerForm(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const form = document.getElementById('updateLedgerForm');
        if (!form) return;

        // Set ledger ID
        form.setAttribute('data-ledger-id', ledgerId);

        // Pre-fill form
        const amountInput = form.querySelector('#amountRepaid');
        if (amountInput) {
            amountInput.max = ledger.amountDue;
            amountInput.placeholder = `Max: ₵${ledger.amountDue}`;
        }

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }

    filterLedgers() {
        const status = document.getElementById('filterStatus')?.value;
        const category = document.getElementById('filterCategory')?.value;
        const group = document.getElementById('filterGroup')?.value;

        let filtered = this.ledgers;

        // Filter by status
        if (status && status !== 'all') {
            filtered = filtered.filter(ledger => ledger.status === status);
        }

        // Filter by category
        if (category && category !== 'all') {
            filtered = filtered.filter(ledger => ledger.category === category);
        }

        // Filter by group
        if (group && group !== 'all') {
            filtered = filtered.filter(ledger => ledger.groupId === group);
        }

        this.renderLedgers(filtered);
    }

    searchLedgers(query) {
        if (!query.trim()) {
            this.renderLedgers();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.ledgers.filter(ledger => 
            ledger.borrowerName.toLowerCase().includes(searchTerm) ||
            ledger.borrowerPhone.includes(searchTerm) ||
            ledger.category.toLowerCase().includes(searchTerm) ||
            ledger.notes?.toLowerCase().includes(searchTerm)
        );

        this.renderLedgers(filtered);
    }

    renderLenderDashboard() {
        // Update dashboard stats
        this.updateDashboardStats();
        
        // Render loan offers
        this.renderLoanOffers();
        
        // Render ledgers
        this.renderLedgers();
    }

    updateDashboardStats() {
        const stats = this.calculateLenderStats();
        
        // Update stat cards
        const totalLoansElem = document.getElementById('totalLoans');
        const activeLoansElem = document.getElementById('activeLoans');
        const totalLentElem = document.getElementById('totalLent');
        const totalRepaidElem = document.getElementById('totalRepaid');
        const defaultRateElem = document.getElementById('defaultRate');
        const avgRatingElem = document.getElementById('avgRating');

        if (totalLoansElem) totalLoansElem.textContent = stats.totalLoans;
        if (activeLoansElem) activeLoansElem.textContent = stats.activeLoans;
        if (totalLentElem) totalLentElem.textContent = `₵${stats.totalLent.toLocaleString()}`;
        if (totalRepaidElem) totalRepaidElem.textContent = `₵${stats.totalRepaid.toLocaleString()}`;
        if (defaultRateElem) defaultRateElem.textContent = `${stats.defaultRate}%`;
        if (avgRatingElem) avgRatingElem.textContent = stats.avgRating.toFixed(1);
    }

    calculateLenderStats() {
        const stats = {
            totalLoans: this.ledgers.length,
            activeLoans: this.ledgers.filter(l => l.status === 'active').length,
            overdueLoans: this.ledgers.filter(l => l.status === 'overdue').length,
            repaidLoans: this.ledgers.filter(l => l.status === 'repaid').length,
            totalLent: this.ledgers.reduce((sum, l) => sum + l.amount, 0),
            totalRepaid: this.ledgers.reduce((sum, l) => sum + l.amountRepaid, 0),
            totalDue: this.ledgers.reduce((sum, l) => sum + l.amountDue, 0),
            defaultRate: 0,
            avgRating: 0
        };

        // Calculate default rate (overdue > 60 days)
        const defaultedLoans = this.ledgers.filter(l => l.daysOverdue > 60).length;
        stats.defaultRate = stats.totalLoans > 0 ? (defaultedLoans / stats.totalLoans * 100).toFixed(1) : 0;

        // Calculate average rating
        const ratedLoans = this.ledgers.filter(l => l.rating > 0);
        stats.avgRating = ratedLoans.length > 0 
            ? ratedLoans.reduce((sum, l) => sum + l.rating, 0) / ratedLoans.length 
            : 0;

        return stats;
    }

    renderLoanOffers() {
        const container = document.getElementById('loanOffersContainer');
        if (!container) return;

        if (this.loansOffered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <h3 class="empty-title">No Loan Offers</h3>
                    <p class="empty-description">You haven't created any loan offers yet.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('offerLoanForm').scrollIntoView()">
                        Create Your First Offer
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.loansOffered.map(offer => `
            <div class="loan-offer-card">
                <div class="offer-header">
                    <h4>${offer.category}</h4>
                    <span class="badge ${offer.status === 'active' ? 'badge-success' : 'badge-outline'}">
                        ${offer.status}
                    </span>
                </div>
                
                <div class="offer-details">
                    <div class="offer-detail">
                        <span class="detail-label">Max Amount:</span>
                        <span class="detail-value">₵${offer.maxAmount.toLocaleString()}</span>
                    </div>
                    <div class="offer-detail">
                        <span class="detail-label">Interest:</span>
                        <span class="detail-value">${offer.interestRate}% per week</span>
                    </div>
                    <div class="offer-detail">
                        <span class="detail-label">Period:</span>
                        <span class="detail-value">${offer.repaymentPeriod} days</span>
                    </div>
                    <div class="offer-detail">
                        <span class="detail-label">Disbursement Fee:</span>
                        <span class="detail-value">₵${offer.disbursementFee}</span>
                    </div>
                </div>
                
                ${offer.description ? `
                    <div class="offer-description">
                        <p>${offer.description}</p>
                    </div>
                ` : ''}
                
                <div class="offer-stats">
                    <span class="stat-item">Offers: ${offer.totalOffers}</span>
                    <span class="stat-item">Active: ${offer.activeLoans}</span>
                    <span class="stat-item">Repaid: ${offer.repaidLoans}</span>
                </div>
                
                <div class="offer-actions">
                    <button class="btn btn-outline" onclick="PesewaLending.editOffer('${offer.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="PesewaLending.deleteOffer('${offer.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderLedgers(ledgersToRender = null) {
        const container = document.getElementById('ledgersContainer');
        if (!container) return;

        const ledgers = ledgersToRender || this.ledgers;

        if (ledgers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3 class="empty-title">No Ledgers</h3>
                    <p class="empty-description">You don't have any active loans or ledgers yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ledgers.map(ledger => {
            const daysOverdue = ledger.daysOverdue || 0;
            const isOverdue = daysOverdue > 0;
            const penalty = daysOverdue > 7 ? (ledger.amountDue * 0.05 * (daysOverdue - 7)) : 0;
            const group = PesewaGroups?.getGroupById(ledger.groupId);

            return `
                <div class="ledger-card ${ledger.status} ${ledger.blacklisted ? 'blacklisted' : ''}">
                    <div class="ledger-header">
                        <div class="ledger-title">
                            <h4>${ledger.borrowerName}</h4>
                            <div class="ledger-subtitle">
                                <span class="ledger-category">${this.getCategoryIcon(ledger.category)} ${ledger.category}</span>
                                <span class="ledger-group">${group?.name || 'Unknown Group'}</span>
                            </div>
                        </div>
                        <div class="ledger-status">
                            <span class="badge ${ledger.status === 'active' ? 'badge-success' : ledger.status === 'overdue' ? 'badge-warning' : 'badge-primary'}">
                                ${ledger.status.toUpperCase()}
                            </span>
                            ${ledger.blacklisted ? '<span class="badge badge-danger">BLACKLISTED</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="ledger-details">
                        <div class="ledger-amounts">
                            <div class="amount-item">
                                <span class="amount-label">Amount:</span>
                                <span class="amount-value">₵${ledger.amount.toLocaleString()}</span>
                            </div>
                            <div class="amount-item">
                                <span class="amount-label">Due:</span>
                                <span class="amount-value ${isOverdue ? 'text-danger' : ''}">₵${ledger.amountDue.toLocaleString()}</span>
                            </div>
                            ${penalty > 0 ? `
                                <div class="amount-item">
                                    <span class="amount-label">Penalty:</span>
                                    <span class="amount-value text-danger">₵${penalty.toFixed(2)}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="ledger-meta">
                            <div class="meta-item">
                                <span class="meta-icon">📅</span>
                                <span class="meta-text">Due: ${this.formatDate(ledger.dueDate)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">⏰</span>
                                <span class="meta-text ${isOverdue ? 'text-danger' : ''}">${isOverdue ? `${daysOverdue} days overdue` : 'On time'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">⭐</span>
                                <span class="meta-text">Rating: ${ledger.rating.toFixed(1)}/5</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ledger-actions">
                        <button class="btn btn-primary view-ledger-btn" data-ledger-id="${ledger.id}">View Details</button>
                        ${ledger.status !== 'repaid' ? `
                            <button class="btn btn-outline" onclick="PesewaLending.showUpdateLedgerForm('${ledger.id}')">Update</button>
                        ` : ''}
                        ${!ledger.blacklisted ? `
                            <button class="btn btn-outline rate-borrower-btn" data-ledger-id="${ledger.id}">Rate</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Helper methods
    checkLenderSubscription() {
        // For demo, assume subscription is active
        // In real app, check subscription expiry date
        return true;
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    calculateLoanTerms() {
        const amountInput = document.getElementById('loanAmount');
        const amountDisplay = document.getElementById('loanAmountDisplay');
        const interestDisplay = document.getElementById('loanInterest');
        const totalDisplay = document.getElementById('loanTotal');
        const dailyDisplay = document.getElementById('loanDaily');

        if (!amountInput || !amountDisplay) return;

        const amount = parseFloat(amountInput.value) || 0;
        
        // Update amount display
        amountDisplay.textContent = `₵${amount.toLocaleString()}`;
        
        // Calculate terms (15% weekly interest, 7 days)
        const weeklyInterest = 15;
        const interest = amount * weeklyInterest / 100;
        const total = amount + interest;
        const daily = total / 7;
        
        // Update displays
        if (interestDisplay) interestDisplay.textContent = `₵${interest.toFixed(2)}`;
        if (totalDisplay) totalDisplay.textContent = `₵${total.toFixed(2)}`;
        if (dailyDisplay) dailyDisplay.textContent = `₵${daily.toFixed(2)}/day`;
    }

    showMessage(message, type = 'info', container = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `lending-message alert alert-${type}`;
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

    saveLoansOffered() {
        if (this.currentLender) {
            localStorage.setItem(`pesewa_loans_${this.currentLender.id}`, JSON.stringify(this.loansOffered));
        }
    }

    saveLedgers() {
        if (this.currentLender) {
            localStorage.setItem(`pesewa_ledgers_${this.currentLender.id}`, JSON.stringify(this.ledgers));
        }
    }

    dispatchLendingEvent(type, data) {
        const event = new CustomEvent(`lending:${type}`, { detail: data });
        window.dispatchEvent(event);
    }

    // Public methods
    getActiveLoans() {
        return this.ledgers.filter(ledger => ledger.status === 'active');
    }

    getOverdueLoans() {
        return this.ledgers.filter(ledger => ledger.status === 'overdue');
    }

    getBlacklistedBorrowers() {
        return this.ledgers.filter(ledger => ledger.blacklisted);
    }

    getTotalPortfolioValue() {
        return this.ledgers.reduce((total, ledger) => total + ledger.amountDue, 0);
    }
}

// Initialize Lending Manager
const lendingManager = new LendingManager();

// Export for use in other modules
window.PesewaLending = lendingManager;

// Update lending data when user logs in/out
window.addEventListener('auth:login', () => {
    lendingManager.loadLenderData();
    lendingManager.loadLedgers();
    lendingManager.renderLenderDashboard();
});

window.addEventListener('auth:logout', () => {
    lendingManager.currentLender = null;
    lendingManager.loansOffered = [];
    lendingManager.ledgers = [];
});