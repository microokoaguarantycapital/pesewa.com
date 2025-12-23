/**
 * pwa.js - Progressive Web App functionality
 * Part of the Rotating Savings & Credit Association (ROSCA) Platform
 */

class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.initialize();
    }

    initialize() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineDetection();
        this.setupBackgroundSync();
        this.setupPeriodicSync();
        this.setupPushNotifications();
        this.updateOnlineStatus();
        this.checkForUpdates();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered with scope:', registration.scope);

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for appinstalled event
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.deferredPrompt = null;
            this.hideInstallButton();
            
            // Track installation
            this.trackInstallation();
        });

        // Create install button if needed
        this.createInstallButton();
    }

    createInstallButton() {
        // Check if install button already exists
        this.installButton = document.getElementById('pwa-install-btn');
        
        if (!this.installButton && !this.isStandalone) {
            this.installButton = document.createElement('button');
            this.installButton.id = 'pwa-install-btn';
            this.installButton.className = 'btn btn-primary d-none';
            this.installButton.innerHTML = '<i class="fas fa-download me-2"></i> Install App';
            this.installButton.addEventListener('click', () => this.installPWA());
            
            // Add to page
            const container = document.querySelector('.pwa-install-container') || 
                            document.querySelector('header') || 
                            document.body;
            container.appendChild(this.installButton);
        }
    }

    showInstallButton() {
        if (this.installButton && !this.isStandalone) {
            this.installButton.classList.remove('d-none');
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideInstallButton();
            }, 10000);
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.classList.add('d-none');
        }
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    setupOfflineDetection() {
        // Update online/offline status
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());

        // Create offline indicator
        this.createOfflineIndicator();
    }

    createOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.className = 'offline-indicator d-none';
        indicator.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show m-0 rounded-0" role="alert">
                <i class="fas fa-wifi-slash me-2"></i>
                <strong>You are offline.</strong> Some features may be limited.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.prepend(indicator);
        
        // Handle dismiss
        indicator.querySelector('.btn-close').addEventListener('click', () => {
            indicator.classList.add('d-none');
        });
    }

    updateOnlineStatus() {
        const isOnline = navigator.onLine;
        const indicator = document.getElementById('offline-indicator');
        
        if (indicator) {
            if (isOnline) {
                indicator.classList.add('d-none');
                
                // Show reconnected message
                this.showToast('Reconnected', 'You are back online.', 'success');
                
                // Sync pending changes
                this.syncPendingChanges();
            } else {
                indicator.classList.remove('d-none');
                this.showToast('Offline', 'You are offline. Working in limited mode.', 'warning');
            }
        }

        // Update online status badge
        const onlineBadge = document.getElementById('online-status-badge');
        if (onlineBadge) {
            onlineBadge.className = `badge bg-${isOnline ? 'success' : 'warning'}`;
            onlineBadge.innerHTML = `<i class="fas fa-${isOnline ? 'wifi' : 'wifi-slash'} me-1"></i> ${isOnline ? 'Online' : 'Offline'}`;
        }

        // Update page content based on status
        this.updateContentForOffline(isOnline);
    }

    updateContentForOffline(isOnline) {
        // Disable/enable form submissions
        document.querySelectorAll('form').forEach(form => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                if (!isOnline && !form.classList.contains('offline-allowed')) {
                    submitBtn.disabled = true;
                    submitBtn.title = 'Available online only';
                } else {
                    submitBtn.disabled = false;
                    submitBtn.title = '';
                }
            }
        });

        // Show/hide online-only features
        document.querySelectorAll('.online-only').forEach(element => {
            element.classList.toggle('d-none', !isOnline);
        });

        // Show/hide offline-only features
        document.querySelectorAll('.offline-only').forEach(element => {
            element.classList.toggle('d-none', isOnline);
        });
    }

    async setupBackgroundSync() {
        if ('sync' in registration) {
            try {
                await registration.sync.register('sync-pending-changes');
                console.log('Background sync registered');
            } catch (error) {
                console.error('Background sync registration failed:', error);
            }
        }
    }

    async setupPeriodicSync() {
        if ('periodicSync' in registration) {
            try {
                await registration.periodicSync.register('daily-sync', {
                    minInterval: 24 * 60 * 60 * 1000 // 24 hours
                });
                console.log('Periodic sync registered');
            } catch (error) {
                console.error('Periodic sync registration failed:', error);
            }
        }
    }

    async setupPushNotifications() {
        if ('Notification' in window && 'PushManager' in window) {
            // Request permission
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                await this.subscribeToPush();
            }
        }
    }

    async subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('BLH_V8J7gKj4k2W7Q4n8x1pLm3zN6cV9bX2yT5wR0eS7dF1gH4jK8nM2qP3tW6vY9zC1xL5rA0uB4iE7oD2fG9hJ3kM6pQ1tV4wY7zB0nL5')
            });
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            console.log('Push notification subscription successful');
        } catch (error) {
            console.error('Push notification subscription failed:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async sendSubscriptionToServer(subscription) {
        // In a real app, send to your backend
        const auth = JSON.parse(localStorage.getItem('roscha_auth') || '{}');
        if (!auth.userId) return;

        try {
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: auth.userId,
                    subscription: subscription
                })
            });
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }

    showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="alert alert-info alert-dismissible fade show m-3" role="alert">
                <i class="fas fa-sync-alt me-2"></i>
                <strong>Update available!</strong> A new version of the app is available.
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-info me-2" id="refresh-app">
                        Refresh Now
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" data-bs-dismiss="alert">
                        Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Handle refresh
        notification.querySelector('#refresh-app').addEventListener('click', () => {
            window.location.reload();
        });
    }

    showToast(title, message, type = 'info') {
        // Create toast container if not exists
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }

        // Create toast
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        container.appendChild(toast);

        // Initialize and show toast
        const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
        bsToast.show();

        // Remove toast after hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    async syncPendingChanges() {
        const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');
        if (pendingChanges.length === 0) return;

        this.showToast('Syncing', 'Syncing your changes with the server...', 'info');

        for (const change of pendingChanges) {
            try {
                await fetch(change.url, {
                    method: change.method,
                    headers: change.headers,
                    body: change.body
                });
                
                // Remove from pending changes
                const index = pendingChanges.indexOf(change);
                pendingChanges.splice(index, 1);
                localStorage.setItem('pending_changes', JSON.stringify(pendingChanges));
            } catch (error) {
                console.error('Failed to sync change:', error);
            }
        }

        if (pendingChanges.length === 0) {
            this.showToast('Sync Complete', 'All changes have been synchronized.', 'success');
        } else {
            this.showToast('Sync Incomplete', `${pendingChanges.length} changes pending sync.`, 'warning');
        }
    }

    checkForUpdates() {
        // Check for updates every hour
        setInterval(() => {
            if (navigator.onLine && 'serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.update();
                });
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    trackInstallation() {
        // Track installation in analytics
        const installEvent = {
            type: 'pwa_installed',
            timestamp: new Date().toISOString(),
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            standalone: this.isStandalone
        };

        // Save to localStorage for later sync
        const analytics = JSON.parse(localStorage.getItem('pwa_analytics') || '[]');
        analytics.push(installEvent);
        localStorage.setItem('pwa_analytics', JSON.stringify(analytics));

        // Try to send immediately
        this.sendAnalytics(installEvent);
    }

    async sendAnalytics(event) {
        try {
            await fetch('/api/analytics/pwa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (error) {
            // Save for later if offline
            console.error('Failed to send analytics:', error);
        }
    }

    // Utility method to save pending changes
    static savePendingChange(url, method, data) {
        const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');
        pendingChanges.push({
            url: url,
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('pending_changes', JSON.stringify(pendingChanges));
    }

    // Utility method to check if app is installed
    static isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.pwaHandler = new PWAHandler();
});

// Export utility functions
window.PWA = {
    savePendingChange: PWAHandler.savePendingChange,
    isAppInstalled: PWAHandler.isAppInstalled
};