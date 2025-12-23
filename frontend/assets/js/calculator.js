/**
 * calculator.js - Financial calculators for ROSCA operations
 * Part of the Rotating Savings & Credit Association (ROSCA) Platform
 */

class FinancialCalculator {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setDefaultValues();
        this.calculateAll();
    }

    setupEventListeners() {
        // Calculator input changes
        document.querySelectorAll('.calc-input').forEach(input => {
            input.addEventListener('input', () => this.calculateAll());
            input.addEventListener('change', () => this.calculateAll());
        });

        // Calculator tabs
        document.querySelectorAll('.calc-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchCalculator(e.target.dataset.calc));
        });

        // Reset buttons
        document.querySelectorAll('.reset-calc-btn').forEach(btn => {
            btn.addEventListener('click', () => this.resetCalculator(btn.dataset.calc));
        });

        // Save calculation
        document.getElementById('save-calculation')?.addEventListener('click', () => this.saveCalculation());

        // Share calculation
        document.getElementById('share-calculation')?.addEventListener('click', () => this.shareCalculation());

        // Print calculation
        document.getElementById('print-calculation')?.addEventListener('click', () => this.printCalculation());
    }

    setDefaultValues() {
        // Set default values for inputs
        const defaults = {
            'contribution-amount': 1000,
            'members-count': 10,
            'rotation-period': 1,
            'interest-rate': 5,
            'loan-amount': 50000,
            'loan-tenure': 12,
            'loan-interest': 12,
            'savings-amount': 5000,
            'savings-duration': 12,
            'savings-rate': 8,
            'investment-amount': 100000,
            'investment-duration': 60,
            'investment-return': 15
        };

        Object.entries(defaults).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
                // Trigger input event to update any linked displays
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    calculateAll() {
        this.calculateROSCA();
        this.calculateLoan();
        this.calculateSavings();
        this.calculateInvestment();
        this.updateSummary();
    }

    calculateROSCA() {
        const contribution = parseFloat(document.getElementById('contribution-amount').value) || 0;
        const members = parseInt(document.getElementById('members-count').value) || 1;
        const period = parseInt(document.getElementById('rotation-period').value) || 1;
        const interest = parseFloat(document.getElementById('interest-rate').value) || 0;

        // Basic calculations
        const totalPool = contribution * members;
        const rotationValue = totalPool; // Value received when it's your turn
        
        // With interest
        const interestAmount = totalPool * (interest / 100);
        const totalWithInterest = totalPool + interestAmount;
        
        // Timing
        const yourTurnMonth = period; // Assuming you're in position 1
        const monthsToYourTurn = yourTurnMonth - 1;
        
        // Update display
        this.updateResult('total-pool', totalPool);
        this.updateResult('rotation-value', rotationValue);
        this.updateResult('interest-amount', interestAmount);
        this.updateResult('total-with-interest', totalWithInterest);
        this.updateResult('your-turn-month', yourTurnMonth);
        this.updateResult('months-to-wait', monthsToYourTurn);
        
        // Update chart if available
        this.updateROSCAChart(contribution, members, period);
    }

    calculateLoan() {
        const amount = parseFloat(document.getElementById('loan-amount').value) || 0;
        const tenure = parseInt(document.getElementById('loan-tenure').value) || 1;
        const interest = parseFloat(document.getElementById('loan-interest').value) || 0;

        // Monthly interest rate
        const monthlyRate = interest / 100 / 12;
        
        // EMI calculation using formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
        const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                   (Math.pow(1 + monthlyRate, tenure) - 1);
        
        const totalPayment = emi * tenure;
        const totalInterest = totalPayment - amount;
        
        // Update display
        this.updateResult('emi-amount', emi);
        this.updateResult('total-payment', totalPayment);
        this.updateResult('total-interest', totalInterest);
        this.updateResult('interest-percentage', (totalInterest / amount * 100).toFixed(2));
        
        // Update amortization table
        this.updateAmortizationTable(amount, tenure, interest, emi);
    }

    calculateSavings() {
        const amount = parseFloat(document.getElementById('savings-amount').value) || 0;
        const duration = parseInt(document.getElementById('savings-duration').value) || 1;
        const rate = parseFloat(document.getElementById('savings-rate').value) || 0;

        // Monthly savings calculation with compound interest
        const monthlyRate = rate / 100 / 12;
        let futureValue = 0;
        
        for (let i = 0; i < duration; i++) {
            futureValue = (futureValue + amount) * (1 + monthlyRate);
        }
        
        const totalDeposited = amount * duration;
        const interestEarned = futureValue - totalDeposited;
        
        // Update display
        this.updateResult('savings-future-value', futureValue);
        this.updateResult('savings-total-deposited', totalDeposited);
        this.updateResult('savings-interest-earned', interestEarned);
        this.updateResult('savings-annual-return', (interestEarned / totalDeposited * 12 / duration * 100).toFixed(2));
        
        // Update savings chart
        this.updateSavingsChart(amount, duration, rate);
    }

    calculateInvestment() {
        const amount = parseFloat(document.getElementById('investment-amount').value) || 0;
        const duration = parseInt(document.getElementById('investment-duration').value) || 1;
        const returnRate = parseFloat(document.getElementById('investment-return').value) || 0;

        // Compound interest calculation
        const annualRate = returnRate / 100;
        const futureValue = amount * Math.pow(1 + annualRate, duration / 12); // Duration in months
        
        const profit = futureValue - amount;
        const annualizedReturn = (Math.pow(futureValue / amount, 12 / duration) - 1) * 100;
        
        // Update display
        this.updateResult('investment-future-value', futureValue);
        this.updateResult('investment-profit', profit);
        this.updateResult('investment-annualized-return', annualizedReturn);
        this.updateResult('investment-doubling-time', (72 / returnRate).toFixed(1));
        
        // Update investment chart
        this.updateInvestmentChart(amount, duration, returnRate);
    }

    updateResult(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Format based on element type
        if (elementId.includes('amount') || elementId.includes('value') || 
            elementId.includes('payment') || elementId.includes('interest') ||
            elementId.includes('profit') || elementId.includes('emi')) {
            element.textContent = formatCurrency(value);
        } else if (elementId.includes('percentage') || elementId.includes('rate') || 
                   elementId.includes('return') || elementId.includes('month') || 
                   elementId.includes('wait')) {
            element.textContent = value.toFixed(2);
        } else {
            element.textContent = Math.round(value);
        }
    }

    updateROSCAChart(contribution, members, period) {
        const canvas = document.getElementById('rosca-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if any
        if (window.roscaChart) {
            window.roscaChart.destroy();
        }

        // Prepare data
        const labels = Array.from({length: members}, (_, i) => `Month ${i + 1}`);
        const data = Array.from({length: members}, (_, i) => {
            if (i < period) {
                return contribution * (i + 1); // Accumulating before your turn
            } else {
                return contribution * period; // After your turn
            }
        });

        window.roscaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cumulative Savings',
                    data: data,
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    updateAmortizationTable(amount, tenure, interest, emi) {
        const container = document.getElementById('amortization-table');
        if (!container) return;

        const monthlyRate = interest / 100 / 12;
        let remainingBalance = amount;
        let tableHTML = '';

        for (let month = 1; month <= tenure; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = emi - interestPayment;
            remainingBalance -= principalPayment;

            tableHTML += `
                <tr>
                    <td>${month}</td>
                    <td>${formatCurrency(emi)}</td>
                    <td>${formatCurrency(principalPayment)}</td>
                    <td>${formatCurrency(interestPayment)}</td>
                    <td>${formatCurrency(remainingBalance > 0 ? remainingBalance : 0)}</td>
                </tr>
            `;
        }

        container.innerHTML = tableHTML;
    }

    updateSavingsChart(amount, duration, rate) {
        const canvas = document.getElementById('savings-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (window.savingsChart) {
            window.savingsChart.destroy();
        }

        const labels = Array.from({length: duration}, (_, i) => `Month ${i + 1}`);
        const monthlyRate = rate / 100 / 12;
        const data = [];
        let balance = 0;

        for (let i = 0; i < duration; i++) {
            balance = (balance + amount) * (1 + monthlyRate);
            data.push(balance);
        }

        window.savingsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Savings Balance',
                    data: data,
                    backgroundColor: '#1cc88a',
                    borderColor: '#1cc88a',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    updateInvestmentChart(amount, duration, returnRate) {
        const canvas = document.getElementById('investment-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (window.investmentChart) {
            window.investmentChart.destroy();
        }

        const labels = [];
        const data = [];
        const annualRate = returnRate / 100;

        for (let year = 0; year <= Math.ceil(duration / 12); year++) {
            labels.push(`Year ${year}`);
            const value = amount * Math.pow(1 + annualRate, year);
            data.push(value);
        }

        window.investmentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Investment Value',
                    data: data,
                    borderColor: '#f6c23e',
                    backgroundColor: 'rgba(246, 194, 62, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    updateSummary() {
        // Update summary cards with key calculations
        const emi = document.getElementById('emi-amount')?.textContent || '0';
        const totalSavings = document.getElementById('savings-future-value')?.textContent || '0';
        const investmentValue = document.getElementById('investment-future-value')?.textContent || '0';
        const roscaPool = document.getElementById('total-pool')?.textContent || '0';

        document.getElementById('summary-emi')?.textContent = emi;
        document.getElementById('summary-savings')?.textContent = totalSavings;
        document.getElementById('summary-investment')?.textContent = investmentValue;
        document.getElementById('summary-rosca')?.textContent = roscaPool;
    }

    switchCalculator(calcType) {
        // Hide all calculator sections
        document.querySelectorAll('.calculator-section').forEach(section => {
            section.classList.add('d-none');
        });

        // Show selected calculator
        document.getElementById(`${calcType}-calculator`)?.classList.remove('d-none');

        // Update active tab
        document.querySelectorAll('.calc-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.calc-tab[data-calc="${calcType}"]`)?.classList.add('active');

        // Recalculate for the active calculator
        switch(calcType) {
            case 'rosca':
                this.calculateROSCA();
                break;
            case 'loan':
                this.calculateLoan();
                break;
            case 'savings':
                this.calculateSavings();
                break;
            case 'investment':
                this.calculateInvestment();
                break;
        }
    }

    resetCalculator(calcType) {
        const defaults = {
            'rosca': {
                'contribution-amount': 1000,
                'members-count': 10,
                'rotation-period': 1,
                'interest-rate': 5
            },
            'loan': {
                'loan-amount': 50000,
                'loan-tenure': 12,
                'loan-interest': 12
            },
            'savings': {
                'savings-amount': 5000,
                'savings-duration': 12,
                'savings-rate': 8
            },
            'investment': {
                'investment-amount': 100000,
                'investment-duration': 60,
                'investment-return': 15
            }
        };

        const inputs = defaults[calcType];
        if (!inputs) return;

        Object.entries(inputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        this.calculateAll();
    }

    saveCalculation() {
        const calculationData = {
            timestamp: new Date().toISOString(),
            rosca: {
                contribution: document.getElementById('contribution-amount').value,
                members: document.getElementById('members-count').value,
                period: document.getElementById('rotation-period').value,
                interest: document.getElementById('interest-rate').value,
                totalPool: document.getElementById('total-pool').textContent
            },
            loan: {
                amount: document.getElementById('loan-amount').value,
                tenure: document.getElementById('loan-tenure').value,
                interest: document.getElementById('loan-interest').value,
                emi: document.getElementById('emi-amount').textContent
            },
            savings: {
                amount: document.getElementById('savings-amount').value,
                duration: document.getElementById('savings-duration').value,
                rate: document.getElementById('savings-rate').value,
                futureValue: document.getElementById('savings-future-value').textContent
            },
            investment: {
                amount: document.getElementById('investment-amount').value,
                duration: document.getElementById('investment-duration').value,
                returnRate: document.getElementById('investment-return').value,
                futureValue: document.getElementById('investment-future-value').textContent
            }
        };

        // Save to localStorage
        const savedCalculations = JSON.parse(localStorage.getItem('saved_calculations') || '[]');
        savedCalculations.push(calculationData);
        localStorage.setItem('saved_calculations', JSON.stringify(savedCalculations.slice(-10))); // Keep last 10

        alert('Calculation saved successfully!');
    }

    shareCalculation() {
        const calculationText = `
ROSCA Calculator Results:
- Total Pool: ${document.getElementById('total-pool').textContent}
- EMI: ${document.getElementById('emi-amount').textContent}
- Future Savings: ${document.getElementById('savings-future-value').textContent}
- Investment Value: ${document.getElementById('investment-future-value').textContent}

Calculated on ${new Date().toLocaleDateString()}
        `.trim();

        if (navigator.share) {
            navigator.share({
                title: 'My ROSCA Calculation',
                text: calculationText,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(calculationText).then(() => {
                alert('Calculation copied to clipboard!');
            }).catch(console.error);
        }
    }

    printCalculation() {
        const printContent = document.getElementById('calculator-section').innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>ROSCA Calculator Results</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 30px; }
                    .result-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; }
                    .result-value { font-size: 1.2em; font-weight: bold; color: #2e59d9; }
                    @media print {
                        .no-print { display: none; }
                        .page-break { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>ROSCA Calculator Results</h1>
                    <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                </div>
                ${printContent}
                <div class="mt-4 text-muted">
                    <p>Generated by ROSCA Platform - https://rosca.example.com</p>
                </div>
            </body>
            </html>
        `;

        window.print();
        document.body.innerHTML = originalContent;
        location.reload(); // Restore event listeners
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calculator-page') || 
        document.querySelector('.calculator-section')) {
        window.financialCalculator = new FinancialCalculator();
    }
});

// Utility function for currency formatting
function formatCurrency(value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    
    const country = getCurrentCountryInfo();
    if (country) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: country.currency,
            minimumFractionDigits: 2
        }).format(value);
    }
    
    return '$' + value.toFixed(2);
}