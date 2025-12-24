'use strict';

// Pesewa.com - Groups Management
// Handles group creation, joining, and management

class GroupManager {
    constructor() {
        this.groups = [];
        this.userGroups = new Set();
        this.currentGroup = null;
        this.init();
    }

    init() {
        this.loadGroups();
        this.loadUserGroups();
        this.setupEventListeners();
        this.renderGroups();
    }

    loadGroups() {
        // Load groups from localStorage (for demo)
        const groupsData = localStorage.getItem('pesewa_groups');
        if (groupsData) {
            try {
                this.groups = JSON.parse(groupsData);
            } catch (error) {
                console.error('Failed to load groups:', error);
                this.groups = this.getDefaultGroups();
            }
        } else {
            this.groups = this.getDefaultGroups();
            this.saveGroups();
        }
    }

    loadUserGroups() {
        // Load user's groups from localStorage (for demo)
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.groups && Array.isArray(user.groups)) {
                    this.userGroups = new Set(user.groups);
                }
            } catch (error) {
                console.error('Failed to load user groups:', error);
            }
        }
    }

    getDefaultGroups() {
        // Sample groups for demo
        return [
            {
                id: 'group_1',
                name: 'Nairobi Professionals',
                country: 'KE',
                type: 'professional',
                description: 'Emergency lending group for Nairobi professionals',
                admin: 'admin_1',
                members: ['user_1', 'user_2', 'user_3'],
                maxMembers: 1000,
                currentMembers: 3,
                referralRequired: true,
                rating: 4.8,
                createdAt: '2024-01-15T10:30:00Z',
                isActive: true,
                categories: ['PesewaFare', 'PesewaData', 'PesewaFood']
            },
            {
                id: 'group_2',
                name: 'Kampala Family Circle',
                country: 'UG',
                type: 'family',
                description: 'Family support group in Kampala',
                admin: 'user_4',
                members: ['user_4', 'user_5', 'user_6'],
                maxMembers: 500,
                currentMembers: 3,
                referralRequired: true,
                rating: 4.9,
                createdAt: '2024-02-10T14:20:00Z',
                isActive: true,
                categories: ['PesewaCookingGas', 'PesewaMedicine', 'PesewaElectricityTokens']
            },
            {
                id: 'group_3',
                name: 'Dar es Salaam Business',
                country: 'TZ',
                type: 'business',
                description: 'Business community lending group',
                admin: 'user_7',
                members: ['user_7', 'user_8'],
                maxMembers: 200,
                currentMembers: 2,
                referralRequired: true,
                rating: 4.7,
                createdAt: '2024-03-05T09:15:00Z',
                isActive: true,
                categories: ['PesewaFare', 'PesewaData', 'Pesewacredo']
            }
        ];
    }

    setupEventListeners() {
        // Group creation form
        const createForm = document.getElementById('createGroupForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleGroupCreation();
            });
        }

        // Join group buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.join-group-btn')) {
                const button = e.target.closest('.join-group-btn');
                const groupId = button.getAttribute('data-group-id');
                this.handleJoinGroup(groupId);
            }
        });

        // Leave group buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.leave-group-btn')) {
                const button = e.target.closest('.leave-group-btn');
                const groupId = button.getAttribute('data-group-id');
                this.handleLeaveGroup(groupId);
            }
        });

        // View group details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-group-btn')) {
                const button = e.target.closest('.view-group-btn');
                const groupId = button.getAttribute('data-group-id');
                this.showGroupDetails(groupId);
            }
        });

        // Group filters
        const filterInputs = document.querySelectorAll('.group-filter');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.filterGroups());
        });

        // Group search
        const searchInput = document.getElementById('groupSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchGroups(e.target.value);
            });
        }
    }

    handleGroupCreation() {
        const form = document.getElementById('createGroupForm');
        const formData = new FormData(form);
        
        const groupData = {
            name: formData.get('groupName'),
            country: formData.get('country'),
            type: formData.get('groupType'),
            description: formData.get('description'),
            maxMembers: parseInt(formData.get('maxMembers')) || 1000,
            categories: Array.from(formData.getAll('categories')),
            referralRequired: formData.get('referralRequired') === 'on'
        };

        // Validate
        if (!groupData.name || !groupData.country) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Check if user can create more groups (demo limit: 5 groups)
        if (this.getUserCreatedGroups().length >= 5) {
            this.showMessage('You have reached the maximum number of groups you can create', 'error');
            return;
        }

        // Create group
        const newGroup = this.createGroup(groupData);
        
        // Add creator as admin and first member
        const user = PesewaAuth?.getUser();
        if (user) {
            newGroup.admin = user.id;
            newGroup.members.push(user.id);
            newGroup.currentMembers = 1;
        }

        // Save to groups list
        this.groups.push(newGroup);
        this.saveGroups();

        // Add to user's groups
        this.userGroups.add(newGroup.id);
        this.saveUserGroups();

        // Show success message
        this.showMessage(`Group "${newGroup.name}" created successfully!`, 'success');
        
        // Reset form
        form.reset();
        
        // Render updated groups list
        this.renderGroups();
        
        // Dispatch event
        this.dispatchGroupEvent('created', newGroup);
    }

    createGroup(data) {
        return {
            id: 'group_' + Date.now(),
            ...data,
            admin: null,
            members: [],
            currentMembers: 0,
            rating: 5.0,
            createdAt: new Date().toISOString(),
            isActive: true,
            totalLoans: 0,
            totalRepaid: 0,
            defaultRate: 0
        };
    }

    handleJoinGroup(groupId) {
        // Check if user is authenticated
        if (!PesewaAuth?.isLoggedIn()) {
            this.showMessage('Please log in to join groups', 'error');
            return;
        }

        // Check if user is already in group
        if (this.userGroups.has(groupId)) {
            this.showMessage('You are already a member of this group', 'warning');
            return;
        }

        // Check if user has reached group limit (max 4)
        if (this.userGroups.size >= 4) {
            this.showMessage('You can only join up to 4 groups', 'error');
            return;
        }

        const group = this.getGroupById(groupId);
        if (!group) {
            this.showMessage('Group not found', 'error');
            return;
        }

        // Check if group is full
        if (group.currentMembers >= group.maxMembers) {
            this.showMessage('This group is full', 'error');
            return;
        }

        // Check referral requirement
        if (group.referralRequired) {
            this.showReferralDialog(group);
        } else {
            this.joinGroup(group);
        }
    }

    showReferralDialog(group) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">Join ${group.name}</h3>
                <p>This group requires a referral from an existing member.</p>
                <div class="form-group">
                    <label for="referralCode">Referral Code</label>
                    <input type="text" id="referralCode" placeholder="Enter referral code">
                </div>
                <div class="form-group">
                    <label for="referralName">Referrer's Name</label>
                    <input type="text" id="referralName" placeholder="Name of person who referred you">
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="submitReferral">Submit</button>
                    <button class="btn btn-outline" id="cancelJoin">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#submitReferral').addEventListener('click', () => {
            const referralCode = modal.querySelector('#referralCode').value;
            const referralName = modal.querySelector('#referralName').value;
            
            if (!referralCode || !referralName) {
                this.showMessage('Please provide referral details', 'error', modal);
                return;
            }

            // For demo, accept any non-empty referral
            this.joinGroup(group);
            modal.remove();
        });

        modal.querySelector('#cancelJoin').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    joinGroup(group) {
        const user = PesewaAuth?.getUser();
        if (!user) return;

        // Add user to group
        group.members.push(user.id);
        group.currentMembers++;
        
        // Add group to user's groups
        this.userGroups.add(group.id);
        
        // Save changes
        this.saveGroups();
        this.saveUserGroups();
        
        // Show success message
        this.showMessage(`You have successfully joined ${group.name}`, 'success');
        
        // Update UI
        this.renderGroups();
        
        // Dispatch event
        this.dispatchGroupEvent('joined', {
            group: group,
            userId: user.id
        });
    }

    handleLeaveGroup(groupId) {
        const user = PesewaAuth?.getUser();
        if (!user) return;

        const group = this.getGroupById(groupId);
        if (!group) return;

        // Check if user is the admin
        if (group.admin === user.id) {
            this.showMessage('As admin, you cannot leave the group. Transfer admin rights first.', 'error');
            return;
        }

        // Confirm leave
        if (!confirm(`Are you sure you want to leave ${group.name}?`)) {
            return;
        }

        // Remove user from group
        const memberIndex = group.members.indexOf(user.id);
        if (memberIndex > -1) {
            group.members.splice(memberIndex, 1);
            group.currentMembers--;
        }

        // Remove group from user's groups
        this.userGroups.delete(groupId);
        
        // Save changes
        this.saveGroups();
        this.saveUserGroups();
        
        // Show message
        this.showMessage(`You have left ${group.name}`, 'success');
        
        // Update UI
        this.renderGroups();
        
        // Dispatch event
        this.dispatchGroupEvent('left', {
            group: group,
            userId: user.id
        });
    }

    showGroupDetails(groupId) {
        const group = this.getGroupById(groupId);
        if (!group) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        
        const isMember = this.userGroups.has(groupId);
        const isAdmin = group.admin === PesewaAuth?.getUserId();
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="group-header">
                    <div class="group-icon">👥</div>
                    <div>
                        <h3 class="modal-title">${group.name}</h3>
                        <div class="group-meta">
                            <span class="badge badge-outline">${this.getCountryFlag(group.country)} ${this.getCountryName(group.country)}</span>
                            <span class="badge badge-primary">${group.type}</span>
                            <span class="badge ${isMember ? 'badge-success' : 'badge-outline'}">
                                ${isMember ? 'Member' : 'Join to Participate'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="group-description">
                    <p>${group.description || 'No description provided.'}</p>
                </div>
                
                <div class="group-stats">
                    <div class="stat-item">
                        <div class="stat-value">${group.currentMembers}/${group.maxMembers}</div>
                        <div class="stat-label">Members</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${group.rating.toFixed(1)}/5.0</div>
                        <div class="stat-label">Rating</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${group.referralRequired ? 'Yes' : 'No'}</div>
                        <div class="stat-label">Referral Required</div>
                    </div>
                </div>
                
                <div class="group-categories">
                    <h4>Available Loan Categories</h4>
                    <div class="categories-list">
                        ${group.categories.map(cat => `
                            <span class="category-tag">${this.getCategoryIcon(cat)} ${cat}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="group-actions">
                    ${isMember ? `
                        <button class="btn btn-primary" data-action="view-dashboard">Go to Group Dashboard</button>
                        ${!isAdmin ? '<button class="btn btn-outline" data-action="leave">Leave Group</button>' : ''}
                    ` : `
                        <button class="btn btn-primary" data-action="join">Join Group</button>
                    `}
                    ${isAdmin ? `
                        <button class="btn btn-warning" data-action="manage">Manage Group</button>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('[data-action="join"]')?.addEventListener('click', () => {
            modal.remove();
            this.handleJoinGroup(groupId);
        });

        modal.querySelector('[data-action="leave"]')?.addEventListener('click', () => {
            modal.remove();
            this.handleLeaveGroup(groupId);
        });

        modal.querySelector('[data-action="view-dashboard"]')?.addEventListener('click', () => {
            modal.remove();
            this.viewGroupDashboard(groupId);
        });

        modal.querySelector('[data-action="manage"]')?.addEventListener('click', () => {
            modal.remove();
            this.manageGroup(groupId);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    viewGroupDashboard(groupId) {
        // Navigate to group dashboard
        window.location.href = `/pages/groups/dashboard.html?group=${groupId}`;
    }

    manageGroup(groupId) {
        // Navigate to group management
        window.location.href = `/pages/groups/manage.html?group=${groupId}`;
    }

    filterGroups() {
        const country = document.getElementById('filterCountry')?.value;
        const type = document.getElementById('filterType')?.value;
        const membership = document.getElementById('filterMembership')?.value;

        let filtered = this.groups;

        // Filter by country
        if (country && country !== 'all') {
            filtered = filtered.filter(group => group.country === country);
        }

        // Filter by type
        if (type && type !== 'all') {
            filtered = filtered.filter(group => group.type === type);
        }

        // Filter by membership
        if (membership === 'my-groups') {
            filtered = filtered.filter(group => this.userGroups.has(group.id));
        } else if (membership === 'available') {
            filtered = filtered.filter(group => !this.userGroups.has(group.id));
        }

        this.renderGroups(filtered);
    }

    searchGroups(query) {
        if (!query.trim()) {
            this.renderGroups();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.groups.filter(group => 
            group.name.toLowerCase().includes(searchTerm) ||
            group.description?.toLowerCase().includes(searchTerm) ||
            group.type.toLowerCase().includes(searchTerm)
        );

        this.renderGroups(filtered);
    }

    renderGroups(groupsToRender = null) {
        const container = document.getElementById('groupsContainer');
        if (!container) return;

        const groups = groupsToRender || this.groups;
        const user = PesewaAuth?.getUser();

        if (groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3 class="empty-title">No Groups Found</h3>
                    <p class="empty-description">No groups match your search criteria.</p>
                    <button class="btn btn-primary" id="createFirstGroup">Create Your First Group</button>
                </div>
            `;

            container.querySelector('#createFirstGroup')?.addEventListener('click', () => {
                document.getElementById('createGroupForm')?.scrollIntoView();
            });
            return;
        }

        container.innerHTML = groups.map(group => {
            const isMember = this.userGroups.has(group.id);
            const isAdmin = group.admin === user?.id;
            const isFull = group.currentMembers >= group.maxMembers;

            return `
                <div class="group-card ${isMember ? 'member' : ''} ${isFull ? 'full' : ''}">
                    <div class="group-card-header">
                        <div class="group-card-title">
                            <h4>${group.name}</h4>
                            <div class="group-card-subtitle">
                                <span class="group-country">${this.getCountryFlag(group.country)} ${this.getCountryName(group.country)}</span>
                                <span class="group-type">${group.type}</span>
                                ${isAdmin ? '<span class="group-admin">👑 Admin</span>' : ''}
                            </div>
                        </div>
                        <div class="group-card-rating">
                            <span class="rating-stars">${'★'.repeat(Math.floor(group.rating))}${'☆'.repeat(5 - Math.floor(group.rating))}</span>
                            <span class="rating-value">${group.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    
                    <div class="group-card-body">
                        <p class="group-description">${group.description || 'No description provided.'}</p>
                        
                        <div class="group-stats">
                            <div class="group-stat">
                                <span class="stat-icon">👥</span>
                                <span class="stat-text">${group.currentMembers}/${group.maxMembers} members</span>
                            </div>
                            <div class="group-stat">
                                <span class="stat-icon">📅</span>
                                <span class="stat-text">${this.formatDate(group.createdAt)}</span>
                            </div>
                            <div class="group-stat">
                                <span class="stat-icon">🔒</span>
                                <span class="stat-text">${group.referralRequired ? 'Referral required' : 'Open to join'}</span>
                            </div>
                        </div>
                        
                        <div class="group-categories">
                            ${group.categories.slice(0, 3).map(cat => `
                                <span class="category-badge">${this.getCategoryIcon(cat)} ${cat}</span>
                            `).join('')}
                            ${group.categories.length > 3 ? `<span class="more-categories">+${group.categories.length - 3} more</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="group-card-actions">
                        ${isMember ? `
                            <button class="btn btn-primary view-group-btn" data-group-id="${group.id}">View Dashboard</button>
                            ${!isAdmin ? '<button class="btn btn-outline leave-group-btn" data-group-id="${group.id}">Leave</button>' : ''}
                        ` : `
                            <button class="btn btn-primary join-group-btn" data-group-id="${group.id}" ${isFull ? 'disabled' : ''}>
                                ${isFull ? 'Group Full' : 'Join Group'}
                            </button>
                            <button class="btn btn-outline view-group-btn" data-group-id="${group.id}">View Details</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Helper methods
    getGroupById(id) {
        return this.groups.find(group => group.id === id);
    }

    getUserCreatedGroups() {
        const userId = PesewaAuth?.getUserId();
        if (!userId) return [];
        return this.groups.filter(group => group.admin === userId);
    }

    getCountryFlag(code) {
        const flags = {
            'KE': '🇰🇪', 'UG': '🇺🇬', 'TZ': '🇹🇿', 'RW': '🇷🇼', 'BI': '🇧🇮',
            'SO': '🇸🇴', 'SS': '🇸🇸', 'ET': '🇪🇹', 'CD': '🇨🇩', 'NG': '🇳🇬',
            'ZA': '🇿🇦', 'GH': '🇬🇭'
        };
        return flags[code] || '🏳️';
    }

    getCountryName(code) {
        const countries = {
            'KE': 'Kenya', 'UG': 'Uganda', 'TZ': 'Tanzania', 'RW': 'Rwanda',
            'BI': 'Burundi', 'SO': 'Somalia', 'SS': 'South Sudan', 'ET': 'Ethiopia',
            'CD': 'Congo', 'NG': 'Nigeria', 'ZA': 'South Africa', 'GH': 'Ghana'
        };
        return countries[code] || code;
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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showMessage(message, type = 'info', container = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `group-message alert alert-${type}`;
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

    saveGroups() {
        localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
    }

    saveUserGroups() {
        const user = PesewaAuth?.getUser();
        if (user) {
            user.groups = Array.from(this.userGroups);
            localStorage.setItem('pesewa_user', JSON.stringify(user));
        }
    }

    dispatchGroupEvent(type, data) {
        const event = new CustomEvent(`group:${type}`, { detail: data });
        window.dispatchEvent(event);
    }

    // Public methods
    getUserGroups() {
        return Array.from(this.userGroups).map(id => this.getGroupById(id)).filter(Boolean);
    }

    canJoinMoreGroups() {
        return this.userGroups.size < 4;
    }

    getAvailableGroups() {
        return this.groups.filter(group => 
            !this.userGroups.has(group.id) && 
            group.currentMembers < group.maxMembers
        );
    }
}

// Initialize Group Manager
const groupManager = new GroupManager();

// Export for use in other modules
window.PesewaGroups = groupManager;

// Update groups when user logs in/out
window.addEventListener('auth:login', () => {
    groupManager.loadUserGroups();
    groupManager.renderGroups();
});

window.addEventListener('auth:logout', () => {
    groupManager.userGroups.clear();
    groupManager.renderGroups();
});