// Current country state
let currentCountry = null;
let countryStats = {};
let countryGroups = [];
let countryLenders = [];
let countryBorrowers = [];

// Initialize module
function init() {
    console.log('Countries Module Initialized');
    
    // Detect user's country
    detectUserCountry();
    
    // Load country data
    loadCountryData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize country UI
    initCountryUI();
}

// Detect user's country
function detectUserCountry() {
    // Try to get from user profile first
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    if (user && user.country) {
        currentCountry = user.country;
        console.log('Country detected from user profile:', currentCountry);
        return;
    }
    
    // Try to get from browser language/geolocation
    const browserLanguage = navigator.language || navigator.userLanguage;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Simple detection based on timezone
    if (timezone.includes('Nairobi')) currentCountry = 'kenya';
    else if (timezone.includes('Kampala')) currentCountry = 'uganda';
    else if (timezone.includes('Dar_es_Salaam')) currentCountry = 'tanzania';
    else if (timezone.includes('Kigali')) currentCountry = 'rwanda';
    else if (timezone.includes('Johannesburg')) currentCountry = 'south-africa';
    else if (timezone.includes('Lagos')) currentCountry = 'nigeria';
    else if (timezone.includes('Accra')) currentCountry = 'ghana';
    else {
        // Default to Kenya
        currentCountry = 'kenya';
    }
    
    console.log('Country detected from browser:', currentCountry);
}

// Load country data
function loadCountryData() {
    if (!currentCountry) return;
    
    const country = COUNTRIES[currentCountry];
    if (!country) {
        console.error('Country not found:', currentCountry);
        return;
    }
    
    // Load country-specific data
    loadCountryStats();
    loadCountryGroups();
    loadCountryLenders();
    loadCountryBorrowers();
    
    console.log('Country data loaded for:', country.name);
}

// Load country statistics
function loadCountryStats() {
    const country = COUNTRIES[currentCountry];
    if (!country) return;
    
    // In a real app, this would come from the server
    // For demo, generate some stats
    countryStats = {
        totalUsers: Math.floor(Math.random() * 100000) + 50000,
        activeLenders: Math.floor(Math.random() * 10000) + 5000,
        activeBorrowers: Math.floor(Math.random() * 90000) + 45000,
        loansToday: Math.floor(Math.random() * 1000) + 500,
        amountToday: formatCurrency(Math.floor(Math.random() * 5000000) + 2500000, currentCountry),
        weeklyGrowth: (Math.random() * 10 + 5).toFixed(1) + '%',
        avgLoanSize: formatCurrency(Math.floor(Math.random() * 5000) + 1500, currentCountry),
        topCity: getTopCity(currentCountry),
        peakHours: '8-10 AM, 5-7 PM'
    };
}

// Load country groups
function loadCountryGroups() {
    // In a real app, this would come from the Groups module
    // For demo, create some groups for the country
    const country = COUNTRIES[currentCountry];
    if (!country) return;
    
    const groupTemplates = [
        {
            name: `${country.capital} Professionals`,
            description: `Working professionals in ${country.capital} supporting each other`,
            memberCount: Math.floor(Math.random() * 500) + 100,
            activeLoans: Math.floor(Math.random() * 50) + 20,
            repaymentRate: 98 + Math.random() * 2,
            categories: ['data', 'fare', 'food']
        },
        {
            name: `${country.name} Market Traders`,
            description: 'Small business owners and market traders',
            memberCount: Math.floor(Math.random() * 800) + 200,
            activeLoans: Math.floor(Math.random() * 80) + 30,
            repaymentRate: 97 + Math.random() * 3,
            categories: ['credo', 'fuel', 'food']
        },
        {
            name: `${country.capital} Youth Group`,
            description: 'Young adults supporting education and business',
            memberCount: Math.floor(Math.random() * 300) + 50,
            activeLoans: Math.floor(Math.random() * 30) + 10,
            repaymentRate: 99 + Math.random() * 1,
            categories: ['schoolfees', 'data', 'fare']
        },
        {
            name: `${country.name} Women Entrepreneurs`,
            description: "Women supporting each other's businesses",
            memberCount: Math.floor(Math.random() * 400) + 100,
            activeLoans: Math.floor(Math.random() * 40) + 15,
            repaymentRate: 98.5 + Math.random() * 1.5,
            categories: ['food', 'medicine', 'credo']
        },
        {
            name: `${country.capital} Church Community`,
            description: 'Faith-based community support group',
            memberCount: Math.floor(Math.random() * 600) + 150,
            activeLoans: Math.floor(Math.random() * 60) + 25,
            repaymentRate: 99.5 + Math.random() * 0.5,
            categories: ['food', 'medicine', 'water']
        }
    ];
    
    countryGroups = groupTemplates.map((template, index) => ({
        id: `group_${currentCountry}_${index + 1}`,
        ...template,
        country: currentCountry,
        flag: country.flag,
        joinMethod: index % 2 === 0 ? 'referral' : 'approval',
        createdDaysAgo: Math.floor(Math.random() * 365) + 30
    }));
}

// Load country lenders
function loadCountryLenders() {
    // In a real app, this would come from the server
    // For demo, create some lenders for the country
    const country = COUNTRIES[currentCountry];
    if (!country) return;
    
    const cities = getCitiesByCountry(currentCountry);
    countryLenders = Array.from({ length: 8 }, (_, index) => {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const amountLent = Math.floor(Math.random() * 500000) + 100000;
        
        return {
            id: `lender_${currentCountry}_${index + 1}`,
            name: generateLocalName(currentCountry, index),
            avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
            location: city,
            amountLent: formatCurrency(amountLent, currentCountry),
            activeLoans: Math.floor(Math.random() * 15) + 5,
            repaymentRate: 95 + Math.random() * 5,
            memberSince: `${Math.floor(Math.random() * 3) + 1} years`,
            rating: (4 + Math.random()).toFixed(1),
            badges: getRandomBadges(index)
        };
    });
}

// Load country borrowers
function loadCountryBorrowers() {
    // In a real app, this would come from the server
    // For demo, create some borrowers for the country
    const country = COUNTRIES[currentCountry];
    if (!country) return;
    
    const cities = getCitiesByCountry(currentCountry);
    const occupations = getOccupationsByCountry(currentCountry);
    
    countryBorrowers = Array.from({ length: 8 }, (_, index) => {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const occupation = occupations[Math.floor(Math.random() * occupations.length)];
        const amountBorrowed = Math.floor(Math.random() * 100000) + 5000;
        
        return {
            id: `borrower_${currentCountry}_${index + 1}`,
            name: generateLocalName(currentCountry, index + 8),
            avatar: `https://i.pravatar.cc/150?img=${index + 9}`,
            location: city,
            occupation: occupation,
            amountBorrowed: formatCurrency(amountBorrowed, currentCountry),
            loansCompleted: Math.floor(Math.random() * 20) + 5,
            repaymentRate: 85 + Math.random() * 15,
            lastLoan: `${Math.floor(Math.random() * 30) + 1} days ago`,
            riskLevel: index % 3 === 0 ? 'low' : index % 3 === 1 ? 'medium' : 'high'
        };
    });
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('click', function(e) {
        // Country selector
        if (e.target.closest('.country-selector')) {
            const countryId = e.target.closest('.country-selector').dataset.country;
            if (countryId && COUNTRIES[countryId]) {
                setCurrentCountry(countryId);
            }
        }
        
        // View country details
        if (e.target.closest('.view-country-details')) {
            const countryId = e.target.closest('.view-country-details').dataset.country;
            if (countryId && COUNTRIES[countryId]) {
                showCountryDetails(countryId);
            }
        }
        
        // Join country group
        if (e.target.closest('.join-country-group')) {
            const groupId = e.target.closest('.join-country-group').dataset.groupId;
            joinCountryGroup(groupId);
        }
    });
    
    // Country search
    const searchInput = document.getElementById('country-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterCountries(e.target.value);
        });
    }
}

// Initialize country UI
function initCountryUI() {
    // Update current country display
    updateCountryDisplay();
    
    // Render country list
    renderCountryList();
    
    // Render country stats
    renderCountryStats();
    
    // Render country groups
    renderCountryGroups();
    
    // Render country lenders
    renderCountryLenders();
    
    // Render country borrowers
    renderCountryBorrowers();
}

// Update country display
function updateCountryDisplay() {
    const country = COUNTRIES[currentCountry];
    if (!country) return;
    
    // Update country name in UI
    const countryNameElements = document.querySelectorAll('.current-country-name');
    countryNameElements.forEach(el => {
        el.textContent = country.name;
        el.innerHTML = `${country.flag} ${country.name}`;
    });
    
    // Update country currency in UI
    const currencyElements = document.querySelectorAll('.current-country-currency');
    currencyElements.forEach(el => {
        el.textContent = country.currencySymbol;
    });
    
    // Update page title if on country page
    if (document.title.includes('Country')) {
        document.title = `${country.name} - ROSCA Platform`;
    }
}

// Render country list
function renderCountryList() {
    const container = document.getElementById('countries-list');
    if (!container) return;
    
    const countriesArray = Object.values(COUNTRIES);
    
    container.innerHTML = countriesArray.map(country => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card country-card ${currentCountry === country.id ? 'border-primary' : ''}" 
                 data-country="${country.id}">
                <div class="card-body text-center">
                    <div class="country-flag mb-3" style="font-size: 3rem;">
                        ${country.flag}
                    </div>
                    <h5 class="card-title">${country.name}</h5>
                    <p class="card-text text-muted mb-2">
                        ${country.capital} • ${country.population}
                    </p>
                    <p class="card-text">
                        <strong>${formatCurrency(1000, country.id)}</strong><br>
                        <small>Active Groups: ${country.activeGroups.toLocaleString()}</small>
                    </p>
                    <div class="d-grid gap-2">
                        <button class="btn ${currentCountry === country.id ? 'btn-primary' : 'btn-outline-primary'} country-selector" 
                                data-country="${country.id}">
                            ${currentCountry === country.id ? 'Current' : 'Select'}
                        </button>
                        <button class="btn btn-outline-secondary view-country-details" 
                                data-country="${country.id}">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Render country stats
function renderCountryStats() {
    const container = document.getElementById('country-stats');
    if (!container) return;
    
    const country = COUNTRIES[currentCountry];
    if (!country) return;
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Users</h6>
                                <h2 class="card-text">${countryStats.totalUsers?.toLocaleString() || '0'}</h2>
                            </div>
                            <i class="fas fa-users fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Active Lenders</h6>
                                <h2 class="card-text">${countryStats.activeLenders?.toLocaleString() || '0'}</h2>
                            </div>
                            <i class="fas fa-hand-holding-usd fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Loans Today</h6>
                                <h2 class="card-text">${countryStats.loansToday?.toLocaleString() || '0'}</h2>
                            </div>
                            <i class="fas fa-exchange-alt fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Amount Today</h6>
                                <h2 class="card-text">${countryStats.amountToday || '₵0'}</h2>
                            </div>
                            <i class="fas fa-money-bill-wave fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">Country Information</h6>
                        <ul class="list-unstyled">
                            <li><strong>Capital:</strong> ${country.capital}</li>
                            <li><strong>Population:</strong> ${country.population}</li>
                            <li><strong>Currency:</strong> ${country.currency} (${country.currencySymbol})</li>
                            <li><strong>Timezone:</strong> ${country.timezone}</li>
                            <li><strong>Language:</strong> ${getLanguageName(country.language)}</li>
                            <li><strong>Phone Code:</strong> ${country.phoneCode}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">Platform Stats</h6>
                        <ul class="list-unstyled">
                            <li><strong>Active Groups:</strong> ${country.activeGroups.toLocaleString()}</li>
                            <li><strong>Total Lent:</strong> ${country.totalLent}</li>
                            <li><strong>Repayment Rate:</strong> ${country.repaymentRate}%</li>
                            <li><strong>Average Loan Size:</strong> ${countryStats.avgLoanSize || '₵0'}</li>
                            <li><strong>Weekly Growth:</strong> ${countryStats.weeklyGrowth || '0%'}</li>
                            <li><strong>Top City:</strong> ${countryStats.topCity || 'N/A'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render country groups
function renderCountryGroups() {
    const container = document.getElementById('country-groups');
    if (!container) return;
    
    if (countryGroups.length === 0) {
        container.innerHTML = '<p class="text-muted">No groups found for this country.</p>';
        return;
    }
    
    const groupsHtml = countryGroups.slice(0, 4).map(group => `
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="card group-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h6 class="card-title mb-1">${group.name}</h6>
                            <small class="text-muted">${group.country.toUpperCase()} • ${group.joinMethod}</small>
                        </div>
                        <span class="badge bg-success">${group.repaymentRate.toFixed(1)}%</span>
                    </div>
                    <p class="card-text small mb-3">${group.description}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <i class="fas fa-users me-1"></i>
                            <small>${group.memberCount} members</small>
                        </div>
                        <div>
                            <i class="fas fa-money-bill-wave me-1"></i>
                            <small>${group.activeLoans} loans</small>
                        </div>
                    </div>
                    <div class="mb-3">
                        ${group.categories.map(cat => `
                            <span class="badge bg-light text-dark me-1">${cat}</span>
                        `).join('')}
                    </div>
                    <button class="btn btn-outline-primary btn-sm w-100 join-country-group" 
                            data-group-id="${group.id}">
                        Join Group
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="row">
            ${groupsHtml}
        </div>
        <div class="text-center mt-4">
            <a href="/pages/groups.html?country=${currentCountry}" class="btn btn-primary">
                View All Groups in ${COUNTRIES[currentCountry].name}
            </a>
        </div>
    `;
}

// Render country lenders
function renderCountryLenders() {
    const container = document.getElementById('country-lenders');
    if (!container) return;
    
    if (countryLenders.length === 0) {
        container.innerHTML = '<p class="text-muted">No lenders found for this country.</p>';
        return;
    }
    
    const lendersHtml = countryLenders.slice(0, 4).map(lender => `
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="card lender-card">
                <div class="card-body text-center">
                    <img src="${lender.avatar}" alt="${lender.name}" 
                         class="rounded-circle mb-3" width="80" height="80">
                    <h6 class="card-title mb-1">${lender.name}</h6>
                    <p class="card-text text-muted small mb-3">
                        <i class="fas fa-map-marker-alt me-1"></i> ${lender.location}
                    </p>
                    <div class="mb-3">
                        <div class="rating">
                            ${generateStarRating(lender.rating)}
                            <span class="ms-1">${lender.rating}</span>
                        </div>
                    </div>
                    <p class="card-text">
                        <strong>${lender.amountLent}</strong><br>
                        <small>${lender.activeLoans} active loans</small>
                    </p>
                    <div class="mb-3">
                        ${lender.badges.map(badge => `
                            <span class="badge bg-${badge.color} me-1">${badge.text}</span>
                        `).join('')}
                    </div>
                    <button class="btn btn-outline-primary btn-sm">
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="row">
            ${lendersHtml}
        </div>
    `;
}

// Render country borrowers
function renderCountryBorrowers() {
    const container = document.getElementById('country-borrowers');
    if (!container) return;
    
    if (countryBorrowers.length === 0) {
        container.innerHTML = '<p class="text-muted">No borrowers found for this country.</p>';
        return;
    }
    
    const borrowersHtml = countryBorrowers.slice(0, 4).map(borrower => `
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="card borrower-card">
                <div class="card-body text-center">
                    <img src="${borrower.avatar}" alt="${borrower.name}" 
                         class="rounded-circle mb-3" width="80" height="80">
                    <h6 class="card-title mb-1">${borrower.name}</h6>
                    <p class="card-text text-muted small mb-3">
                        <i class="fas fa-map-marker-alt me-1"></i> ${borrower.location}<br>
                        <i class="fas fa-briefcase me-1"></i> ${borrower.occupation}
                    </p>
                    <div class="mb-3">
                        <span class="badge bg-${borrower.riskLevel === 'low' ? 'success' : borrower.riskLevel === 'medium' ? 'warning' : 'danger'}">
                            ${borrower.riskLevel} risk
                        </span>
                    </div>
                    <p class="card-text">
                        <strong>${borrower.amountBorrowed}</strong><br>
                        <small>${borrower.loansCompleted} loans completed</small>
                    </p>
                    <p class="card-text small">
                        <i class="fas fa-chart-line me-1"></i> ${borrower.repaymentRate.toFixed(1)}% repayment
                    </p>
                    <button class="btn btn-outline-primary btn-sm">
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="row">
            ${borrowersHtml}
        </div>
    `;
}

// Show country details modal
function showCountryDetails(countryId) {
    const country = COUNTRIES[countryId];
    if (!country) return;
    
    // Create modal if doesn't exist
    let modal = document.getElementById('country-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'country-details-modal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary country-selector" data-country="${countryId}">
                            Select Country
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update modal content
    modal.querySelector('.modal-title').innerHTML = `
        ${country.flag} ${country.name} - Country Details
    `;
    
    modal.querySelector('.modal-body').innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Country Information</h6>
                <ul class="list-unstyled">
                    <li><strong>Capital:</strong> ${country.capital}</li>
                    <li><strong>Population:</strong> ${country.population}</li>
                    <li><strong>Currency:</strong> ${country.currency} (${country.currencySymbol})</li>
                    <li><strong>Timezone:</strong> ${country.timezone}</li>
                    <li><strong>Language:</strong> ${getLanguageName(country.language)}</li>
                    <li><strong>Phone Code:</strong> ${country.phoneCode}</li>
                    <li><strong>Support Email:</strong> ${country.supportEmail}</li>
                    <li><strong>Support Phone:</strong> ${country.supportPhone}</li>
                    <li><strong>Office Address:</strong> ${country.officeAddress}</li>
                </ul>
            </div>
            <div class="col-md-6">
                <h6>Platform Statistics</h6>
                <ul class="list-unstyled">
                    <li><strong>Active Groups:</strong> ${country.activeGroups.toLocaleString()}</li>
                    <li><strong>Total Amount Lent:</strong> ${country.totalLent}</li>
                    <li><strong>Repayment Rate:</strong> ${country.repaymentRate}%</li>
                </ul>
                
                <h6 class="mt-4">Featured Groups</h6>
                <ul>
                    ${country.featuredGroups.map(group => `<li>${group}</li>`).join('')}
                </ul>
                
                <h6 class="mt-4">Popular Categories</h6>
                <div class="mt-2">
                    ${country.popularCategories.map(cat => `
                        <span class="badge bg-primary me-1">${cat}</span>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-12">
                <h6>Country Map</h6>
                <div id="country-map" style="height: 300px; background: #f8f9fa; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                    <div class="text-center">
                        <div style="font-size: 4rem;">${country.flag}</div>
                        <p class="text-muted">Map of ${country.name}</p>
                        <p>Coordinates: ${country.coordinates.lat.toFixed(6)}, ${country.coordinates.lng.toFixed(6)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Set current country
function setCurrentCountry(countryId) {
    if (!COUNTRIES[countryId]) {
        console.error('Invalid country:', countryId);
        return;
    }
    
    const oldCountry = currentCountry;
    currentCountry = countryId;
    
    // Save to localStorage
    localStorage.setItem('selected_country', countryId);
    
    // Update user profile if logged in
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    if (user && window.AuthModule.updateUserProfile) {
        window.AuthModule.updateUserProfile({ country: countryId });
    }
    
    // Reload country data
    loadCountryData();
    
    // Update UI
    updateCountryDisplay();
    renderCountryList();
    renderCountryStats();
    renderCountryGroups();
    renderCountryLenders();
    renderCountryBorrowers();
    
    // Dispatch event for other modules
    document.dispatchEvent(new CustomEvent('countryChanged', {
        detail: { 
            oldCountry: oldCountry,
            newCountry: countryId,
            country: COUNTRIES[countryId]
        }
    }));
    
    console.log('Country changed to:', countryId);
}

// Filter countries
function filterCountries(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const countryCards = document.querySelectorAll('.country-card');
    
    countryCards.forEach(card => {
        const countryId = card.dataset.country;
        const country = COUNTRIES[countryId];
        if (!country) return;
        
        const countryName = country.name.toLowerCase();
        const capital = country.capital.toLowerCase();
        
        if (countryName.includes(searchLower) || capital.includes(searchLower)) {
            card.parentElement.classList.remove('d-none');
        } else {
            card.parentElement.classList.add('d-none');
        }
    });
}

// Join country group
function joinCountryGroup(groupId) {
    const group = countryGroups.find(g => g.id === groupId);
    if (!group) {
        alert('Group not found');
        return;
    }
    
    // Check if user is logged in
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    if (!user) {
        alert('Please login to join a group');
        return;
    }
    
    // In a real app, this would make an API call
    alert(`Request to join "${group.name}" has been sent. The group admin will review your application.`);
    
    // Log the action
    console.log(`User ${user.id} requested to join group ${groupId}`);
}

// Helper functions
function formatCurrency(amount, countryId) {
    const country = COUNTRIES[countryId];
    if (!country) return amount.toFixed(2);
    
    if (countryId === 'ghana') {
        return `GH₵ ${amount.toLocaleString('en-GH')}`;
    } else if (countryId === 'nigeria') {
        return `₦ ${amount.toLocaleString('en-NG')}`;
    } else if (countryId === 'kenya') {
        return `KSh ${amount.toLocaleString('en-KE')}`;
    } else if (countryId === 'uganda') {
        return `USh ${amount.toLocaleString('en-UG')}`;
    } else if (countryId === 'tanzania') {
        return `TSh ${amount.toLocaleString('en-TZ')}`;
    } else if (countryId === 'south-africa') {
        return `R ${amount.toLocaleString('en-ZA')}`;
    }
    
    return `${country.currencySymbol} ${amount.toLocaleString()}`;
}

function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'sw': 'Swahili',
        'rw': 'Kinyarwanda',
        'fr': 'French',
        'so': 'Somali',
        'am': 'Amharic'
    };
    return languages[code] || code;
}

function getTopCity(countryId) {
    const cities = {
        'kenya': 'Nairobi',
        'uganda': 'Kampala',
        'tanzania': 'Dar es Salaam',
        'rwanda': 'Kigali',
        'burundi': 'Bujumbura',
        'somalia': 'Mogadishu',
        'south-sudan': 'Juba',
        'ethiopia': 'Addis Ababa',
        'congo': 'Kinshasa',
        'nigeria': 'Lagos',
        'south-africa': 'Johannesburg',
        'ghana': 'Accra'
    };
    return cities[countryId] || 'Unknown';
}

function getCitiesByCountry(countryId) {
    const cityMap = {
        'kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
        'uganda': ['Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbale'],
        'tanzania': ['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Zanzibar'],
        'rwanda': ['Kigali', 'Butare', 'Gisenyi', 'Ruhengeri', 'Byumba'],
        'burundi': ['Bujumbura', 'Gitega', 'Ngozi', 'Rumonge', 'Kayanza'],
        'somalia': ['Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Marka'],
        'south-sudan': ['Juba', 'Wau', 'Malakal', 'Yei', 'Rumbek'],
        'ethiopia': ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar'],
        'congo': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani'],
        'nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
        'south-africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'],
        'ghana': ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast']
    };
    return cityMap[countryId] || ['City 1', 'City 2', 'City 3'];
}

function getOccupationsByCountry(countryId) {
    const occupations = [
        'Farmer', 'Trader', 'Teacher', 'Driver', 'Nurse',
        'Business Owner', 'Student', 'Civil Servant', 'Artisan', 'Freelancer'
    ];
    return occupations;
}

function generateLocalName(countryId, index) {
    const firstNames = ['John', 'Mary', 'David', 'Sarah', 'James', 'Grace', 'Michael', 'Joy', 'Peter', 'Faith'];
    const lastNames = ['Mutiso', 'Kamau', 'Onyango', 'Mwangi', 'Odhiambo', 'Njoroge', 'Kipchoge', 'Wanjiku', 'Akinyi', 'Atieno'];
    
    if (countryId === 'nigeria' || countryId === 'ghana') {
        const africanFirst = ['Chinedu', 'Ngozi', 'Kwame', 'Ama', 'Emeka', 'Chiamaka', 'Kofi', 'Esi', 'Olu', 'Adwoa'];
        const africanLast = ['Okoro', 'Adebayo', 'Mensah', 'Owusu', 'Ibrahim', 'Diallo', 'Traore', 'Sow', 'Diop', 'Ndiaye'];
        return `${africanFirst[index % africanFirst.length]} ${africanLast[(index + 1) % africanLast.length]}`;
    }
    
    if (countryId === 'south-africa') {
        const saFirst = ['Thabo', 'Lerato', 'Sipho', 'Nomsa', 'Mandla', 'Zanele', 'Bongani', 'Palesa', 'Vusi', 'Nokuthula'];
        const saLast = ['Mbeki', 'Zuma', 'Ramaphosa', 'Mandela', 'Tutu', 'Sisulu', 'Modise', 'Molefe', 'Ndlovu', 'Khumalo'];
        return `${saFirst[index % saFirst.length]} ${saLast[(index + 1) % saLast.length]}`;
    }
    
    return `${firstNames[index % firstNames.length]} ${lastNames[(index + 1) % lastNames.length]}`;
}

function getRandomBadges(index) {
    const badges = [
        { text: 'Top Lender', color: 'success' },
        { text: 'Verified', color: 'info' },
        { text: 'Fast Payer', color: 'warning' },
        { text: 'Community Leader', color: 'primary' },
        { text: 'Early Member', color: 'secondary' }
    ];
    
    // Return 2-3 random badges
    const count = 2 + (index % 2);
    const shuffled = [...badges].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateStarRating(rating) {
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

// Public API
return {
    init: init,
    setCurrentCountry: setCurrentCountry,
    getCurrentCountry: function() {
        return COUNTRIES[currentCountry];
    },
    getCountries: function() {
        return COUNTRIES;
    },
    getCountryStats: function() {
        return countryStats;
    },
    getCountryGroups: function() {
        return countryGroups;
    },
    getCountryLenders: function() {
        return countryLenders;
    },
    getCountryBorrowers: function() {
        return countryBorrowers;
    },
    formatCurrency: formatCurrency
};