/**
 * collectors.js - Manages debt collectors and recovery operations
 * Part of the Rotating Savings & Credit Association (ROSCA) Platform
 */

class DebtCollectorManager {
    constructor() {
        this.collectors = [];
        this.activeCases = [];
        this.recoveryHistory = [];
        this.initialize();
    }

    async initialize() {
        await this.loadCollectors();
        await this.loadActiveCases();
        await this.loadRecoveryHistory();
        this.setupEventListeners();
        this.renderCollectors();
        this.renderActiveCases();
        this.renderRecoveryHistory();
    }

    async loadCollectors() {
        try {
            const response = await fetch('/data/collectors.json');
            if (!response.ok) throw new Error('Failed to load collectors');
            const data = await response.json();
            this.collectors = data.collectors;
        } catch (error) {
            console.error('Error loading collectors:', error);
            // Fallback data
            this.collectors = [
                { id: 1, name: 'Alpha Recovery Agency', email: 'alpha@recovery.com', phone: '+254700111222', rating: 4.8, casesHandled: 124, successRate: 92, fee: 15 },
                { id: 2, name: 'Debt Solutions Ltd', email: 'info@debtsolutions.co.ke', phone: '+254711333444', rating: 4.5, casesHandled: 89, successRate: 85, fee: 12 },
                { id: 3, name: 'Credit Recovery Partners', email: 'crp@recovery.co.ke', phone: '+254722555666', rating: 4.2, casesHandled: 67, successRate: 78, fee: 10 },
                { id: 4, name: 'National Collection Bureau', email: 'ncb@collections.co.ke', phone: '+254733777888', rating: 4.7, casesHandled: 156, successRate: 94, fee: 18 }
            ];
        }
    }

    async loadActiveCases() {
        try {
            const auth = JSON.parse(localStorage.getItem('roscha_auth') || '{}');
            if (!auth.userId) return;

            const response = await fetch(`/api/collections/cases/user/${auth.userId}`);
            if (response.ok) {
                this.activeCases = await response.json();
            }
        } catch (error) {
            console.error('Error loading active cases:', error);
            this.activeCases = [];
        }
    }

    async loadRecoveryHistory() {
        try {
            const auth = JSON.parse(localStorage.getItem('roscha_auth') || '{}');
            if (!auth.userId) return;

            const response = await fetch(`/api/collections/history/user/${auth.userId}`);
            if (response.ok) {
                this.recoveryHistory = await response.json();
            }
        } catch (error) {
            console.error('Error loading recovery history:', error);
            this.recoveryHistory = [];
        }
    }

    setupEventListeners() {
        // Assign collector
        document.addEventListener('click', (e) => {
            if (e.target.closest('.assign-collector-btn')) {
                const caseId = e.target.dataset.caseId;
                this.showAssignCollectorModal(caseId);
            }

            if (e.target.closest('.select-collector-btn')) {
                const collectorId = parseInt(e.target.dataset.collectorId);
                const caseId = e.target.closest('.modal').dataset.caseId;
                this.assignCollector(caseId, collectorId);
            }

            if (e.target.closest('.update-case-status')) {
                const caseId = e.target.dataset.caseId;
                const newStatus = e.target.dataset.status;
                this.updateCaseStatus(caseId, newStatus);
            }

            if (e.target.closest('.view-case-details')) {
                const caseId = e.target.dataset.caseId;
                this.showCaseDetails(caseId);
            }

            if (e.target.closest('.add-collector-btn')) {
                this.showAddCollectorModal();
            }
        });

        // Search and filter
        const searchInput = document.getElementById('collector-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterCollectors(e.target.value));
        }

        const statusFilter = document.getElementById('case-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => this.filterCases(e.target.value));
        }
    }

    renderCollectors() {
        const container = document.getElementById('collectors-container');
        if (!container) return;

        container.innerHTML = this.collectors.map(collector => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card collector-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="card-title mb-1">${collector.name}</h5>
                                <div class="rating mb-2">
                                    ${this.generateStarRating(collector.rating)}
                                    <span class="ms-2">${collector.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <span class="badge bg-success">${collector.successRate}% Success</span>
                        </div>
                        
                        <div class="collector-info mb-3">
                            <p class="mb-1"><i class="fas fa-envelope me-2"></i> ${collector.email}</p>
                            <p class="mb-1"><i class="fas fa-phone me-2"></i> ${collector.phone}</p>
                            <p class="mb-1"><i class="fas fa-briefcase me-2"></i> ${collector.casesHandled} cases handled</p>
                            <p class="mb-0"><i class="fas fa-percentage me-2"></i> Fee: ${collector.fee}% of recovered amount</p>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-primary assign-collector-btn" 
                                    data-collector-id="${collector.id}">
                                Assign to Case
                            </button>
                            <button class="btn btn-outline-secondary">
                                Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderActiveCases() {
        const container = document.getElementById('active-cases-container');
        if (!container) return;

        if (this.activeCases.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <h5>No Active Cases</h5>
                    <p>You don't have any active debt collection cases.</p>
                    <button class="btn btn-primary" id="create-new-case">Create New Case</button>
                </div>
            `;
            return;
        }

        const casesHtml = this.activeCases.map(caseItem => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">Case #${caseItem.id}</h6>
                            <p class="card-text mb-1">
                                <strong>Debtor:</strong> ${caseItem.debtorName}<br>
                                <strong>Amount:</strong> ${formatCurrency(caseItem.amount)}<br>
                                <strong>Due Since:</strong> ${new Date(caseItem.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-${this.getStatusBadgeClass(caseItem.status)} mb-2">
                                ${caseItem.status}
                            </span>
                            <div>
                                <button class="btn btn-sm btn-outline-primary view-case-details" 
                                        data-case-id="${caseItem.id}">
                                    Details
                                </button>
                                ${caseItem.status === 'pending' ? `
                                    <button class="btn btn-sm btn-outline-warning assign-collector-btn" 
                                            data-case-id="${caseItem.id}">
                                        Assign Collector
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    ${caseItem.assignedCollector ? `
                        <div class="mt-3 pt-3 border-top">
                            <p class="mb-1"><strong>Assigned Collector:</strong> ${caseItem.assignedCollector}</p>
                            <p class="mb-0"><strong>Last Update:</strong> ${new Date(caseItem.lastUpdate).toLocaleDateString()}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = casesHtml;
    }

    renderRecoveryHistory() {
        const container = document.getElementById('recovery-history-container');
        if (!container) return;

        if (this.recoveryHistory.length === 0) {
            container.innerHTML = '<p class="text-muted">No recovery history found.</p>';
            return;
        }

        const tableRows = this.recoveryHistory.map(recovery => `
            <tr>
                <td>${new Date(recovery.date).toLocaleDateString()}</td>
                <td>${recovery.caseId}</td>
                <td>${recovery.debtorName}</td>
                <td>${formatCurrency(recovery.amount)}</td>
                <td>${formatCurrency(recovery.recovered)}</td>
                <td>${recovery.collectorName}</td>
                <td><span class="badge bg-${recovery.status === 'fully recovered' ? 'success' : 'warning'}">${recovery.status}</span></td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Case ID</th>
                            <th>Debtor</th>
                            <th>Amount</th>
                            <th>Recovered</th>
                            <th>Collector</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }
        return stars;
    }

    getStatusBadgeClass(status) {
        const statusClasses = {
            'pending': 'warning',
            'assigned': 'info',
            'in progress': 'primary',
            'partially recovered': 'warning',
            'fully recovered': 'success',
            'closed': 'secondary'
        };
        return statusClasses[status.toLowerCase()] || 'secondary';
    }

    showAssignCollectorModal(caseId) {
        const modal = document.getElementById('assign-collector-modal');
        if (!modal) return;

        // Set case ID on modal
        modal.dataset.caseId = caseId;

        // Update modal content
        const caseItem = this.activeCases.find(c => c.id == caseId);
        if (caseItem) {
            modal.querySelector('#case-details').textContent = 
                `Case #${caseId}: ${formatCurrency(caseItem.amount)} from ${caseItem.debtorName}`;
        }

        // Render collector options
        const container = modal.querySelector('#collector-options');
        container.innerHTML = this.collectors.map(collector => `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${collector.name}</h6>
                            <small class="text-muted">
                                ${collector.rating} stars • ${collector.successRate}% success rate • Fee: ${collector.fee}%
                            </small>
                        </div>
                        <button class="btn btn-primary btn-sm select-collector-btn" 
                                data-collector-id="${collector.id}">
                            Select
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    async assignCollector(caseId, collectorId) {
        try {
            const collector = this.collectors.find(c => c.id === collectorId);
            if (!collector) return;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update case
            const caseIndex = this.activeCases.findIndex(c => c.id == caseId);
            if (caseIndex !== -1) {
                this.activeCases[caseIndex].assignedCollector = collector.name;
                this.activeCases[caseIndex].status = 'assigned';
                this.activeCases[caseIndex].lastUpdate = new Date().toISOString();
                
                // Update UI
                this.renderActiveCases();
                
                // Close modal
                const modal = document.getElementById('assign-collector-modal');
                const bsModal = bootstrap.Modal.getInstance(modal);
                bsModal.hide();

                alert(`Successfully assigned ${collector.name} to case #${caseId}`);
            }
        } catch (error) {
            console.error('Error assigning collector:', error);
            alert('Failed to assign collector. Please try again.');
        }
    }

    updateCaseStatus(caseId, newStatus) {
        const caseIndex = this.activeCases.findIndex(c => c.id == caseId);
        if (caseIndex !== -1) {
            this.activeCases[caseIndex].status = newStatus;
            this.activeCases[caseIndex].lastUpdate = new Date().toISOString();
            this.renderActiveCases();
        }
    }

    showCaseDetails(caseId) {
        const caseItem = this.activeCases.find(c => c.id == caseId);
        if (!caseItem) return;

        const modal = document.getElementById('case-details-modal');
        if (!modal) return;

        // Populate modal with case details
        modal.querySelector('#case-id').textContent = caseId;
        modal.querySelector('#debtor-name').textContent = caseItem.debtorName;
        modal.querySelector('#amount').textContent = formatCurrency(caseItem.amount);
        modal.querySelector('#due-date').textContent = new Date(caseItem.dueDate).toLocaleDateString();
        modal.querySelector('#status').innerHTML = `<span class="badge bg-${this.getStatusBadgeClass(caseItem.status)}">${caseItem.status}</span>`;
        modal.querySelector('#created-date').textContent = new Date(caseItem.createdDate).toLocaleDateString();
        
        if (caseItem.assignedCollector) {
            modal.querySelector('#assigned-collector').textContent = caseItem.assignedCollector;
            modal.querySelector('#collector-info').classList.remove('d-none');
        } else {
            modal.querySelector('#collector-info').classList.add('d-none');
        }

        // Show status update buttons based on current status
        const statusButtons = modal.querySelector('#status-update-buttons');
        statusButtons.innerHTML = this.getStatusUpdateButtons(caseId, caseItem.status);

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    getStatusUpdateButtons(caseId, currentStatus) {
        const buttons = {
            'pending': [
                { label: 'Mark as Assigned', status: 'assigned', class: 'info' },
                { label: 'Close Case', status: 'closed', class: 'secondary' }
            ],
            'assigned': [
                { label: 'Mark as In Progress', status: 'in progress', class: 'primary' },
                { label: 'Partially Recovered', status: 'partially recovered', class: 'warning' }
            ],
            'in progress': [
                { label: 'Fully Recovered', status: 'fully recovered', class: 'success' },
                { label: 'Partially Recovered', status: 'partially recovered', class: 'warning' }
            ],
            'partially recovered': [
                { label: 'Fully Recovered', status: 'fully recovered', class: 'success' },
                { label: 'Close Case', status: 'closed', class: 'secondary' }
            ]
        };

        const currentButtons = buttons[currentStatus.toLowerCase()] || [];
        
        return currentButtons.map(btn => `
            <button class="btn btn-${btn.class} btn-sm update-case-status" 
                    data-case-id="${caseId}" 
                    data-status="${btn.status}">
                ${btn.label}
            </button>
        `).join('');
    }

    showAddCollectorModal() {
        const modal = document.getElementById('add-collector-modal');
        if (!modal) return;

        // Reset form
        const form = modal.querySelector('form');
        form.reset();

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Handle form submission
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.addNewCollector(new FormData(form));
            bsModal.hide();
        };
    }

    async addNewCollector(formData) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newCollector = {
                id: this.collectors.length + 1,
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                rating: parseFloat(formData.get('rating')),
                casesHandled: parseInt(formData.get('casesHandled')),
                successRate: parseInt(formData.get('successRate')),
                fee: parseInt(formData.get('fee'))
            };

            this.collectors.push(newCollector);
            this.renderCollectors();
            
            alert('Collector added successfully!');
        } catch (error) {
            console.error('Error adding collector:', error);
            alert('Failed to add collector. Please try again.');
        }
    }

    filterCollectors(searchTerm) {
        const collectorCards = document.querySelectorAll('.collector-card');
        const searchLower = searchTerm.toLowerCase();

        collectorCards.forEach(card => {
            const collectorName = card.querySelector('.card-title').textContent.toLowerCase();
            const collectorEmail = card.querySelector('.collector-info').textContent.toLowerCase();
            
            if (collectorName.includes(searchLower) || collectorEmail.includes(searchLower)) {
                card.parentElement.classList.remove('d-none');
            } else {
                card.parentElement.classList.add('d-none');
            }
        });
    }

    filterCases(status) {
        if (status === 'all') {
            document.querySelectorAll('.card.mb-3').forEach(card => {
                card.parentElement.classList.remove('d-none');
            });
        } else {
            document.querySelectorAll('.card.mb-3').forEach(card => {
                const badgeText = card.querySelector('.badge').textContent.toLowerCase();
                if (badgeText === status.toLowerCase()) {
                    card.parentElement.classList.remove('d-none');
                } else {
                    card.parentElement.classList.add('d-none');
                }
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('collectors-page') || 
        document.getElementById('active-cases-container') ||
        document.getElementById('recovery-history-container')) {
        window.debtCollectorManager = new DebtCollectorManager();
    }
});