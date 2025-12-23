/**
 * utils.js - Utility functions and helpers for the ROSCA Platform
 * Part of the Rotating Savings & Credit Association (ROSCA) Platform
 */

class Utils {
    constructor() {
        this.debounceTimers = new Map();
        this.throttleFlags = new Map();
        this.cache = new Map();
    }

    // DOM Utilities
    static $(selector) {
        return document.querySelector(selector);
    }

    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else if (key === 'style') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Append children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    static showElement(selector) {
        const element = typeof selector === 'string' ? this.$(selector) : selector;
        if (element) element.classList.remove('d-none');
    }

    static hideElement(selector) {
        const element = typeof selector === 'string' ? this.$(selector) : selector;
        if (element) element.classList.add('d-none');
    }

    static toggleElement(selector) {
        const element = typeof selector === 'string' ? this.$(selector) : selector;
        if (element) element.classList.toggle('d-none');
    }

    // Form Utilities
    static serializeForm(form) {
        const data = {};
        new FormData(form).forEach((value, key) => {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });
        return data;
    }

    static validateForm(form, rules) {
        const errors = {};
        const formData = this.serializeForm(form);
        
        Object.entries(rules).forEach(([field, rule]) => {
            const value = formData[field];
            
            if (rule.required && !value) {
                errors[field] = rule.requiredMessage || `${field} is required`;
            } else if (rule.pattern && value && !rule.pattern.test(value)) {
                errors[field] = rule.patternMessage || `${field} is invalid`;
            } else if (rule.minLength && value && value.length < rule.minLength) {
                errors[field] = rule.minLengthMessage || `${field} must be at least ${rule.minLength} characters`;
            } else if (rule.maxLength && value && value.length > rule.maxLength) {
                errors[field] = rule.maxLengthMessage || `${field} must be at most ${rule.maxLength} characters`;
            } else if (rule.min && value && parseFloat(value) < rule.min) {
                errors[field] = rule.minMessage || `${field} must be at least ${rule.min}`;
            } else if (rule.max && value && parseFloat(value) > rule.max) {
                errors[field] = rule.maxMessage || `${field} must be at most ${rule.max}`;
            } else if (rule.custom && value) {
                const customError = rule.custom(value, formData);
                if (customError) errors[field] = customError;
            }
        });
        
        return errors;
    }

    static showFormErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
        
        // Show new errors
        Object.entries(errors).forEach(([field, message]) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('is-invalid');
                
                const feedback = this.createElement('div', {
                    className: 'invalid-feedback',
                    textContent: message
                });
                
                input.parentNode.appendChild(feedback);
            }
        });
        
        return Object.keys(errors).length === 0;
    }

    static formatCurrency(amount, currencyCode = null) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        
        const country = getCurrentCountryInfo();
        const currency = currencyCode || (country ? country.currency : 'USD');
        const locale = country ? this.getCountryLocale(country.code) : 'en-US';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    static getCountryLocale(countryCode) {
        const locales = {
            'ke': 'en-KE',
            'ug': 'en-UG',
            'tz': 'en-TZ',
            'rw': 'en-RW',
            'bi': 'fr-BI',
            'so': 'so-SO',
            'ss': 'en-SS',
            'et': 'am-ET',
            'cd': 'fr-CD',
            'ng': 'en-NG',
            'za': 'en-ZA',
            'gh': 'en-GH'
        };
        
        return locales[countryCode] || 'en-US';
    }

    static formatDate(date, format = 'medium') {
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (format === 'relative') {
            if (diffDays === 0) {
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            }
        }
        
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            medium: { year: 'numeric', month: 'long', day: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        
        return d.toLocaleDateString('en-US', options[format] || options.medium);
    }

    static formatNumber(number, decimals = 2) {
        if (typeof number !== 'number') {
            number = parseFloat(number) || 0;
        }
        
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    static formatPercentage(value, decimals = 1) {
        return `${this.formatNumber(value, decimals)}%`;
    }

    // Storage Utilities
    static setItem(key, value, ttl = null) {
        const item = {
            value: value,
            expiry: ttl ? Date.now() + ttl : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    static getItem(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            
            if (item.expiry && Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (error) {
            return itemStr; // Return as string if not JSON
        }
    }

    static removeItem(key) {
        localStorage.removeItem(key);
    }

    static clearStorage(prefix = '') {
        if (prefix) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } else {
            localStorage.clear();
        }
    }

    // API Utilities
    static async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    static async fetchWithCache(url, options = {}, ttl = 300000) { // 5 minutes default
        const cacheKey = `cache_${url}_${JSON.stringify(options)}`;
        const cached = this.getItem(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            const response = await this.fetchWithTimeout(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.setItem(cacheKey, data, ttl);
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    static async postJSON(url, data, options = {}) {
        return this.fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            ...options
        });
    }

    static async putJSON(url, data, options = {}) {
        return this.fetchWithTimeout(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            ...options
        });
    }

    static async deleteJSON(url, options = {}) {
        return this.fetchWithTimeout(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
    }

    // String Utilities
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static titleCase(str) {
        return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    static truncate(str, length, suffix = '...') {
        if (str.length <= length) return str;
        return str.substr(0, length - suffix.length) + suffix;
    }

    static slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Validation Utilities
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // Date Utilities
    static getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    static isToday(date) {
        const today = new Date();
        const compare = new Date(date);
        return today.toDateString() === compare.toDateString();
    }

    static isFuture(date) {
        return new Date(date) > new Date();
    }

    static isPast(date) {
        return new Date(date) < new Date();
    }

    // Array Utilities
    static chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static uniqueArray(array) {
        return [...new Set(array)];
    }

    static sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Object Utilities
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static mergeObjects(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.mergeObjects(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    static isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }

    static pick(obj, keys) {
        return keys.reduce((result, key) => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    }

    static omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    }

    // Function Utilities
    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.debounceTimers.get(func));
            this.debounceTimers.set(func, setTimeout(() => {
                this.debounceTimers.delete(func);
                func.apply(this, args);
            }, wait));
        };
    }

    throttle(func, limit) {
        return (...args) => {
            if (!this.throttleFlags.get(func)) {
                func.apply(this, args);
                this.throttleFlags.set(func, true);
                setTimeout(() => this.throttleFlags.delete(func), limit);
            }
        };
    }

    static async retry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retry(fn, retries - 1, delay * 2); // Exponential backoff
        }
    }

    // UI Utilities
    static showLoading(selector = 'body') {
        const container = typeof selector === 'string' ? this.$(selector) : selector;
        if (!container) return;
        
        const loader = this.createElement('div', {
            className: 'loading-overlay'
        }, [
            this.createElement('div', {
                className: 'spinner-border text-primary',
                role: 'status'
            }, [
                this.createElement('span', {
                    className: 'visually-hidden',
                    textContent: 'Loading...'
                })
            ])
        ]);
        
        loader.id = 'global-loader';
        container.appendChild(loader);
    }

    static hideLoading() {
        const loader = this.$('#global-loader');
        if (loader) loader.remove();
    }

    static showModal(id, options = {}) {
        const modal = this.$(`#${id}`);
        if (!modal) return;
        
        const bsModal = new bootstrap.Modal(modal, options);
        bsModal.show();
        return bsModal;
    }

    static hideModal(id) {
        const modal = this.$(`#${id}`);
        if (!modal) return;
        
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
    }

    static showToast(message, type = 'info', duration = 5000) {
        // Implementation depends on your toast library
        // This is a simple implementation
        const toast = this.createElement('div', {
            className: `toast toast-${type}`,
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: '9999'
            }
        }, [
            this.createElement('div', {
                className: 'toast-message',
                textContent: message
            })
        ]);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text);
    }

    // Security Utilities
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Performance Utilities
    static measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    static async measureAsyncPerformance(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
}

// Make Utils available globally
window.Utils = Utils;

// Initialize utility functions that need setup
document.addEventListener('DOMContentLoaded', () => {
    // Initialize any utility that needs DOM ready state
});

// Export commonly used functions for convenience
window.formatCurrency = Utils.formatCurrency;
window.formatDate = Utils.formatDate;
window.formatNumber = Utils.formatNumber;
window.generateId = Utils.generateId;
window.isValidEmail = Utils.isValidEmail;
window.copyToClipboard = Utils.copyToClipboard;