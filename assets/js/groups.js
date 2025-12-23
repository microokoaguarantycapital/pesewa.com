'use strict';

// Groups Module
const GroupsModule = (function() {
    // Group structure
    const GROUP_TEMPLATE = {
        id: '',
        name: '',
        description: '',
        country: '',
        flag: '',
        adminId: '',
        adminName: '',
        createdDate: '',
        memberCount: 0,
        maxMembers: 1000,
        minMembers: 5,
        activeLoans: 0,
        totalLent: 0,
        totalRepaid: 0,
        repaymentRate: 100,
        categories: [],
        rules: '',
        isPrivate: true,
        joinMethod: 'referral', // referral, approval, open
        status: 'active', // active, inactive, suspended
        members: [],
        lenders: [],
        borrowers: [],
        chatEnabled: true,
        lastActivity: ''
    };

    // Current user's groups
    let userGroups = [];
    let allGroups = [];
    let currentGroup = null;

    // Initialize module
    function init() {
        console.log('Groups Module Initialized');
        
        // Load groups data
        loadGroupsData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup group chat if enabled
        setupGroupChat();
    }

    // Load groups data
    function loadGroupsData() {
        // Try to load from localStorage first
        const savedGroups = localStorage.getItem('pesewa_groups');
        const savedUserGroups = localStorage.getItem('pesewa_user_groups');
        
        if (savedGroups) {
            try {
                allGroups = JSON.parse(savedGroups);
                console.log('Groups loaded from localStorage:', allGroups.length);
            } catch (error) {
                console.error('Error parsing groups from localStorage:', error);
                allGroups = [];
            }
        }
        
        if (savedUserGroups) {
            try {
                userGroups = JSON.parse(savedUserGroups);
                console.log('User groups loaded from localStorage:', userGroups.length);
            } catch (error) {
                console.error('Error parsing user groups from localStorage:', error);
                userGroups = [];
            }
        }
        
        // If no data in localStorage, load demo data
        if (allGroups.length === 0) {
            loadDemoGroups();
        }
        
        // Update UI
        updateGroupsUI();
    }

    // Load demo groups
    function loadDemoGroups() {
        const demoGroups = [
            {
                id: 'family_group_001',
                name: 'Family Support Group',
                description: 'Family members helping each other with emergency needs',
                country: 'kenya',
                flag: '🇰🇪',
                adminId: 'admin_001',
                adminName: 'John Kamau',
                createdDate: '2024-01-15',
                memberCount: 45,
                maxMembers: 1000,
                minMembers: 5,
                activeLoans: 12,
                totalLent: 150000,
                totalRepaid: 145000,
                repaymentRate: 96.7,
                categories: ['fare', 'food', 'medicine', 'schoolfees'],
                rules: 'Family members only. Maximum loan: ₵5,000. Repayment within 7 days.',
                isPrivate: true,
                joinMethod: 'referral',
                status: 'active',
                members: [],
                lenders: ['lender_001', 'lender_002', 'lender_003'],
                borrowers: Array.from({length: 42}, (_, i) => `borrower_${i + 1}`),
                chatEnabled: true,
                lastActivity: '2024-12-22T10:30:00Z'
            },
            {
                id: 'church_group_001',
                name: 'Church Benevolence Fund',
                description: 'Church members supporting each other in times of need',
                country: 'kenya',
                flag: '🇰🇪',
                adminId: 'admin_002',
                adminName: 'Pastor Samuel',
                createdDate: '2024-02-20',
                memberCount: 120,
                maxMembers: 1000,
                minMembers: 5,
                activeLoans: 25,
                totalLent: 300000,
                totalRepaid: 295000,
                repaymentRate: 98.3,
                categories: ['fare', 'food', 'medicine', 'electricity', 'water'],
                rules: 'Church members in good standing. Maximum loan: ₵3,000. Must attend weekly service.',
                isPrivate: true,
                joinMethod: 'approval',
                status: 'active',
                members: [],
                lenders: ['lender_004', 'lender_005', 'lender_006'],
                borrowers: Array.from({length: 117}, (_, i) => `borrower_${i + 43}`),
                chatEnabled: true,
                lastActivity: '2024-12-22T09:15:00Z'
            },
            {
                id: 'professionals_group_001',
                name: 'Nairobi Professionals',
                description: 'Working professionals supporting career growth and emergencies',
                country: 'kenya',
                flag: '🇰🇪',
                adminId: 'admin_003',
                adminName: 'Dr. Wangari',
                createdDate: '2024-03-10',
                memberCount: 85,
                maxMembers: 1000,
                minMembers: 5,
                activeLoans: 18,
                totalLent: 250000,
                totalRepaid: 245000,
                repaymentRate: 98.0,
                categories: ['data', 'fare', 'food', 'credo', 'fuel'],
                rules: 'Professionals with verifiable employment. Maximum loan: ₵10,000. CRB check required.',
                isPrivate: true,
                joinMethod: 'referral',
                status: 'active',
                members: [],
                lenders: ['lender_007', 'lender_008', 'lender_009'],
                borrowers: Array.from({length: 82}, (_, i) => `borrower_${i + 160}`),
                chatEnabled: true,
                lastActivity: '2024-12-21T16:45:00Z'
            },
            {
                id: 'youth_group_001',
                name: 'Youth Empowerment',
                description: 'Young adults supporting each other for business and education',
                country: 'uganda',
                flag: '🇺🇬',
                adminId: 'admin_004',
                adminName: 'Sarah Nakato',
                createdDate: '2024-04-05',
                memberCount: 65,
                maxMembers: 1000,
                minMembers: 5,
                activeLoans: 15,
                totalLent: 120000,
                totalRepaid: 118000,
                repaymentRate: 98.3,
                categories: ['schoolfees', 'data', 'fare', 'food', 'tv'],
                rules: 'Ages 18-35. Business or education focus. Maximum loan: ₵2,000.',
                isPrivate: true,
                joinMethod: 'approval',
                status: 'active',
                members: [],
                lenders: ['lender_010', 'lender_011'],
                borrowers: Array.from({length: 63}, (_, i) => `borrower_${i + 242}`),
                chatEnabled: true,
                lastActivity: '2024-12-20T14:20:00Z'
            },
            {
                id: 'market_group_001',
                name: 'Market Traders Association',
                description: 'Small business owners supporting inventory and emergency needs',
                country: 'tanzania',
                flag: '🇹🇿',
                adminId: 'admin_005',
                adminName: 'Mohamed Juma',
                createdDate: '2024-05-12',
                memberCount: 95,
                maxMembers: 1000,
                minMembers: 5,
                activeLoans: 22,
                totalLent: 180000,
                totalRepaid: 175000,
                repaymentRate: 97.2,
                categories: ['credo', 'fuel', 'repair', 'food', 'water'],
                rules: 'Registered market traders. Maximum loan: ₵5,000. Business proof required.',
                isPrivate: true,
                joinMethod: 'referral',
                status: 'active',
                members: [],
                lenders: ['lender_012', 'lender_013', 'lender_014'],
                borrowers: Array.from({length: 92}, (_, i) => `borrower_${i + 305}`),
                chatEnabled: true,
                lastActivity: '2024-12-22T08:00:00Z'
            }
        ];

        allGroups = demoGroups;
        
        // Auto-join user to some demo groups if not already joined
        const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
        if (user) {
            userGroups = allGroups.slice(0, 2).map(group => ({
                groupId: group.id,
                groupName: group.name,
                role: group.lenders.includes(user.id) ? 'lender' : 'borrower',
                joinDate: '2024-12-01',
                status: 'active'
            }));
            
            saveUserGroups();
        }
        
        saveGroups();
    }

    // Create a new group
    async function createGroup(groupData) {
        try {
            showLoading('Creating group...');
            
            // Validate group data
            if (!validateGroupData(groupData)) {
                throw new Error('Invalid group data');
            }
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to create a group');
            }
            
            // Check if user can create more groups
            if (!canCreateMoreGroups()) {
                throw new Error('You have reached the maximum number of groups you can admin');
            }
            
            // Create group object
            const newGroup = {
                ...GROUP_TEMPLATE,
                id: 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: groupData.name,
                description: groupData.description || '',
                country: groupData.country || user.country || 'kenya',
                flag: getCountryFlag(groupData.country || user.country || 'kenya'),
                adminId: user.id,
                adminName: user.name,
                createdDate: new Date().toISOString().split('T')[0],
                memberCount: 1, // Admin is first member
                categories: groupData.categories || [],
                rules: groupData.rules || '',
                isPrivate: groupData.isPrivate !== false,
                joinMethod: groupData.joinMethod || 'referral',
                status: 'active',
                members: [{
                    userId: user.id,
                    userName: user.name,
                    role: 'admin',
                    joinDate: new Date().toISOString().split('T')[0],
                    status: 'active'
                }],
                lenders: user.role === 'lender' ? [user.id] : [],
                borrowers: user.role === 'borrower' ? [user.id] : [],
                chatEnabled: groupData.chatEnabled !== false,
                lastActivity: new Date().toISOString()
            };
            
            // Add to all groups
            allGroups.unshift(newGroup);
            
            // Add to user's groups
            userGroups.unshift({
                groupId: newGroup.id,
                groupName: newGroup.name,
                role: 'admin',
                joinDate: new Date().toISOString().split('T')[0],
                status: 'active'
            });
            
            // Save to localStorage
            saveGroups();
            saveUserGroups();
            
            // Update UI
            updateGroupsUI();
            
            // Dispatch event
            dispatchGroupEvent('created', newGroup);
            
            return {
                success: true,
                group: newGroup,
                message: 'Group created successfully'
            };
            
        } catch (error) {
            console.error('Create group error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Join a group
    async function joinGroup(groupId, referralCode = '') {
        try {
            showLoading('Joining group...');
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to join a group');
            }
            
            // Check if user is already in group
            if (isUserInGroup(groupId)) {
                throw new Error('You are already a member of this group');
            }
            
            // Check group limit
            if (!canJoinMoreGroups()) {
                throw new Error('You have reached the maximum number of groups');
            }
            
            // Find group
            const group = allGroups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check group status
            if (group.status !== 'active') {
                throw new Error('This group is not accepting new members');
            }
            
            // Check if group is full
            if (group.memberCount >= group.maxMembers) {
                throw new Error('This group is full');
            }
            
            // Validate join method
            if (group.joinMethod === 'referral' && !referralCode) {
                throw new Error('This group requires a referral code to join');
            }
            
            // For approval method, create join request
            if (group.joinMethod === 'approval') {
                return await createJoinRequest(groupId, user);
            }
            
            // For open or referral with valid code, join directly
            const userRole = window.RolesModule ? window.RolesModule.hasRole('lender') ? 'lender' : 'borrower' : 'borrower';
            
            // Add user to group
            group.members.push({
                userId: user.id,
                userName: user.name,
                role: userRole,
                joinDate: new Date().toISOString().split('T')[0],
                status: 'active'
            });
            
            group.memberCount++;
            
            if (userRole === 'lender') {
                group.lenders.push(user.id);
            } else {
                group.borrowers.push(user.id);
            }
            
            group.lastActivity = new Date().toISOString();
            
            // Add to user's groups
            userGroups.push({
                groupId: group.id,
                groupName: group.name,
                role: userRole,
                joinDate: new Date().toISOString().split('T')[0],
                status: 'active'
            });
            
            // Save to localStorage
            saveGroups();
            saveUserGroups();
            
            // Update UI
            updateGroupsUI();
            
            // Dispatch event
            dispatchGroupEvent('joined', { group, userRole });
            
            return {
                success: true,
                group: group,
                message: 'Successfully joined group'
            };
            
        } catch (error) {
            console.error('Join group error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Leave a group
    async function leaveGroup(groupId) {
        try {
            showLoading('Leaving group...');
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to leave a group');
            }
            
            // Find group
            const group = allGroups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check if user is admin
            if (group.adminId === user.id) {
                throw new Error('Group admin cannot leave. Transfer admin role first or delete group.');
            }
            
            // Check if user has active loans
            if (hasActiveLoansInGroup(groupId)) {
                throw new Error('Cannot leave group with active loans');
            }
            
            // Remove user from group
            group.members = group.members.filter(m => m.userId !== user.id);
            group.lenders = group.lenders.filter(l => l !== user.id);
            group.borrowers = group.borrowers.filter(b => b !== user.id);
            group.memberCount = group.members.length;
            group.lastActivity = new Date().toISOString();
            
            // Remove from user's groups
            userGroups = userGroups.filter(g => g.groupId !== groupId);
            
            // Save to localStorage
            saveGroups();
            saveUserGroups();
            
            // Update UI
            updateGroupsUI();
            
            // Dispatch event
            dispatchGroupEvent('left', { groupId, userId: user.id });
            
            return {
                success: true,
                message: 'Successfully left group'
            };
            
        } catch (error) {
            console.error('Leave group error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Get group by ID
    function getGroup(groupId) {
        return allGroups.find(group => group.id === groupId) || null;
    }

    // Get user's groups
    function getUserGroups() {
        return userGroups.map(userGroup => {
            const group = getGroup(userGroup.groupId);
            return group ? { ...group, userRole: userGroup.role, joinDate: userGroup.joinDate } : null;
        }).filter(g => g !== null);
    }

    // Get all groups for a country
    function getGroupsByCountry(country) {
        return allGroups.filter(group => group.country === country && group.status === 'active');
    }

    // Search groups
    function searchGroups(query, filters = {}) {
        let results = allGroups.filter(group => group.status === 'active');
        
        // Apply search query
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(group => 
                group.name.toLowerCase().includes(searchTerm) ||
                group.description.toLowerCase().includes(searchTerm) ||
                group.adminName.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply filters
        if (filters.country) {
            results = results.filter(group => group.country === filters.country);
        }
        
        if (filters.categories && filters.categories.length > 0) {
            results = results.filter(group => 
                filters.categories.some(category => group.categories.includes(category))
            );
        }
        
        if (filters.joinMethod) {
            results = results.filter(group => group.joinMethod === filters.joinMethod);
        }
        
        if (filters.minMembers !== undefined) {
            results = results.filter(group => group.memberCount >= filters.minMembers);
        }
        
        if (filters.maxMembers !== undefined) {
            results = results.filter(group => group.memberCount <= filters.maxMembers);
        }
        
        return results;
    }

    // Check if user is in a group
    function isUserInGroup(groupId) {
        return userGroups.some(g => g.groupId === groupId);
    }

    // Check if user can create more groups
    function canCreateMoreGroups() {
        // Count groups where user is admin
        const adminGroups = userGroups.filter(g => g.role === 'admin').length;
        
        // Maximum 5 groups per admin
        return adminGroups < 5;
    }

    // Check if user can join more groups
    function canJoinMoreGroups() {
        if (!window.RolesModule) return userGroups.length < 4;
        
        return window.RolesModule.canJoinGroup(userGroups.length);
    }

    // Check if user has active loans in a group
    function hasActiveLoansInGroup(groupId) {
        // This would check with the Loans module
        // For now, return false
        return false;
    }

    // Create join request for approval-required groups
    async function createJoinRequest(groupId, user) {
        // In a real app, this would send a request to the group admin
        // For demo, auto-approve after delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Join request submitted. Awaiting admin approval.',
                    requiresApproval: true
                });
            }, 1000);
        });
    }

    // Update group information
    async function updateGroup(groupId, updates) {
        try {
            showLoading('Updating group...');
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to update a group');
            }
            
            const group = getGroup(groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check if user is admin
            if (group.adminId !== user.id) {
                throw new Error('Only group admin can update group information');
            }
            
            // Validate updates
            const validatedUpdates = validateGroupUpdates(updates);
            
            // Apply updates
            Object.assign(group, validatedUpdates, {
                lastActivity: new Date().toISOString()
            });
            
            // Save to localStorage
            saveGroups();
            
            // Update UI
            updateGroupsUI();
            
            // Dispatch event
            dispatchGroupEvent('updated', group);
            
            return {
                success: true,
                group: group,
                message: 'Group updated successfully'
            };
            
        } catch (error) {
            console.error('Update group error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Delete group
    async function deleteGroup(groupId) {
        try {
            showLoading('Deleting group...');
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to delete a group');
            }
            
            const group = getGroup(groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check if user is admin
            if (group.adminId !== user.id) {
                throw new Error('Only group admin can delete the group');
            }
            
            // Check if group has active loans
            if (group.activeLoans > 0) {
                throw new Error('Cannot delete group with active loans');
            }
            
            // Remove from all groups
            allGroups = allGroups.filter(g => g.id !== groupId);
            
            // Remove from user's groups
            userGroups = userGroups.filter(g => g.groupId !== groupId);
            
            // Save to localStorage
            saveGroups();
            saveUserGroups();
            
            // Update UI
            updateGroupsUI();
            
            // Dispatch event
            dispatchGroupEvent('deleted', { groupId, groupName: group.name });
            
            return {
                success: true,
                message: 'Group deleted successfully'
            };
            
        } catch (error) {
            console.error('Delete group error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Get group statistics
    function getGroupStats(groupId) {
        const group = getGroup(groupId);
        if (!group) return null;
        
        return {
            totalMembers: group.memberCount,
            activeLenders: group.lenders.length,
            activeBorrowers: group.borrowers.length,
            totalLent: group.totalLent,
            totalRepaid: group.totalRepaid,
            repaymentRate: group.repaymentRate,
            activeLoans: group.activeLoans,
            avgLoanSize: group.totalLent / Math.max(group.activeLoans, 1),
            createdDaysAgo: Math.floor((new Date() - new Date(group.createdDate)) / (1000 * 60 * 60 * 24))
        };
    }

    // Get group members
    function getGroupMembers(groupId) {
        const group = getGroup(groupId);
        if (!group) return [];
        
        return group.members;
    }

    // Invite member to group
    async function inviteMember(groupId, phone, name) {
        try {
            showLoading('Sending invitation...');
            
            const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
            if (!user) {
                throw new Error('You must be logged in to invite members');
            }
            
            const group = getGroup(groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check if user is admin or has invite permissions
            const isAdmin = group.adminId === user.id;
            const canInvite = isAdmin || (group.joinMethod === 'referral' && group.members.some(m => m.userId === user.id));
            
            if (!canInvite) {
                throw new Error('You do not have permission to invite members to this group');
            }
            
            // Generate referral code
            const referralCode = generateReferralCode(groupId, phone);
            
            // In a real app, this would send SMS or email
            // For demo, return the referral code
            return {
                success: true,
                referralCode: referralCode,
                message: `Invitation sent to ${name || phone}. Share this code: ${referralCode}`
            };
            
        } catch (error) {
            console.error('Invite member error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Generate referral code
    function generateReferralCode(groupId, phone) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 4);
        return `PESEWA-${groupId.substr(0, 4)}-${phone.substr(-4)}-${timestamp}-${random}`.toUpperCase();
    }

    // Validate group data
    function validateGroupData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 3) {
            errors.push('Group name must be at least 3 characters');
        }
        
        if (data.name && data.name.length > 50) {
            errors.push('Group name cannot exceed 50 characters');
        }
        
        if (data.description && data.description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
        }
        
        if (data.rules && data.rules.length > 1000) {
            errors.push('Rules cannot exceed 1000 characters');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        return true;
    }

    // Validate group updates
    function validateGroupUpdates(updates) {
        const allowedFields = ['description', 'rules', 'categories', 'joinMethod', 'chatEnabled'];
        const validated = {};
        
        for (const field in updates) {
            if (allowedFields.includes(field)) {
                validated[field] = updates[field];
            }
        }
        
        return validated;
    }

    // Get country flag emoji
    function getCountryFlag(countryCode) {
        const flags = {
            'kenya': '🇰🇪',
            'uganda': '🇺🇬',
            'tanzania': '🇹🇿',
            'rwanda': '🇷🇼',
            'burundi': '🇧🇮',
            'somalia': '🇸🇴',
            'south-sudan': '🇸🇸',
            'ethiopia': '🇪🇹',
            'congo': '🇨🇩',
            'nigeria': '🇳🇬',
            'south-africa': '🇿🇦',
            'ghana': '🇬🇭'
        };
        
        return flags[countryCode.toLowerCase()] || '🏳️';
    }

    // Save groups to localStorage
    function saveGroups() {
        try {
            localStorage.setItem('pesewa_groups', JSON.stringify(allGroups));
        } catch (error) {
            console.error('Error saving groups to localStorage:', error);
        }
    }

    // Save user groups to localStorage
    function saveUserGroups() {
        try {
            localStorage.setItem('pesewa_user_groups', JSON.stringify(userGroups));
        } catch (error) {
            console.error('Error saving user groups to localStorage:', error);
        }
    }

    // Update groups UI
    function updateGroupsUI() {
        // Dispatch event for UI components to update
        const event = new CustomEvent('groupsUpdated', {
            detail: {
                userGroups: getUserGroups(),
                allGroupsCount: allGroups.length
            }
        });
        document.dispatchEvent(event);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Listen for auth changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.type === 'loggedIn' || e.detail.type === 'registered') {
                loadGroupsData();
            } else if (e.detail.type === 'loggedOut') {
                userGroups = [];
                updateGroupsUI();
            }
        });
    }

    // Setup group chat (demo)
    function setupGroupChat() {
        // This would initialize WebSocket or Firebase for real-time chat
        console.log('Group chat initialized (demo mode)');
    }

    // Dispatch group event
    function dispatchGroupEvent(type, data) {
        const event = new CustomEvent('groupEvent', {
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
        createGroup,
        joinGroup,
        leaveGroup,
        getGroup,
        getUserGroups,
        getGroupsByCountry,
        searchGroups,
        isUserInGroup,
        canCreateMoreGroups,
        canJoinMoreGroups,
        updateGroup,
        deleteGroup,
        getGroupStats,
        getGroupMembers,
        inviteMember,
        validateGroupData
    };
})();

// Initialize groups module
document.addEventListener('DOMContentLoaded', GroupsModule.init);

// Export for use in other modules
window.GroupsModule = GroupsModule;