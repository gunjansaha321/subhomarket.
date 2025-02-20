// Data synchronization between website and app
class DataSync {
    constructor() {
        this.syncInterval = 10000; // 10 seconds
        this.init();
    }

    init() {
        this.startSync();
        this.setupStorageListener();
    }

    startSync() {
        setInterval(() => this.syncData(), this.syncInterval);
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'syncData') {
                this.handleStorageChange(JSON.parse(e.newValue));
            }
        });
    }

    syncData() {
        const data = {
            markets: JSON.parse(localStorage.getItem('markets') || '[]'),
            banners: JSON.parse(localStorage.getItem('banners') || '[]'),
            content: JSON.parse(localStorage.getItem('content') || '{}'),
            users: JSON.parse(localStorage.getItem('users') || '[]'),
            timestamp: Date.now()
        };

        localStorage.setItem('syncData', JSON.stringify(data));
        this.broadcastSync(data);
    }

    handleStorageChange(data) {
        if (!data) return;

        // Update local storage
        if (data.markets) localStorage.setItem('markets', JSON.stringify(data.markets));
        if (data.banners) localStorage.setItem('banners', JSON.stringify(data.banners));
        if (data.content) localStorage.setItem('content', JSON.stringify(data.content));
        if (data.users) localStorage.setItem('users', JSON.stringify(data.users));

        // Update UI
        this.updateUI();
    }

    updateUI() {
        // Update website
        if (typeof updateMarketStatus === 'function') updateMarketStatus();
        if (typeof setupBannerSlider === 'function') setupBannerSlider();
        if (typeof updateHomeContent === 'function') updateHomeContent();

        // Update admin panel
        if (typeof loadMarkets === 'function') loadMarkets();
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
        if (typeof loadUsers === 'function') loadUsers();
        if (typeof loadBanners === 'function') loadBanners();
    }

    broadcastSync(data) {
        window.dispatchEvent(new CustomEvent('dataSync', { detail: data }));
    }
}

// Initialize sync
const dataSync = new DataSync();

// Debug sync events
window.addEventListener('dataSync', (e) => {
    console.log('Data synced:', new Date().toLocaleTimeString());
});

// Real-time sync configuration
const SYNC_INTERVAL = 5000; // 5 seconds

// Initialize sync
function initSync() {
    // Start periodic sync
    setInterval(syncData, SYNC_INTERVAL);
    
    // Add storage event listener for cross-tab sync
    window.addEventListener('storage', handleStorageChange);
}

// Sync all data
function syncData() {
    syncMarkets();
    syncBanners();
    syncUsers();
    syncContent();
}

// Handle storage changes
function handleStorageChange(event) {
    switch(event.key) {
        case 'markets':
            loadMarkets();
            loadDashboardStats();
            break;
        case 'banners':
            loadBanners();
            updateBannerSlider();
            break;
        case 'users':
            loadUsers();
            loadDashboardStats();
            break;
        case 'privacyPolicy':
        case 'terms':
        case 'contact':
            loadContent();
            break;
    }
}

// Sync markets data
function syncMarkets() {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    markets.forEach(market => {
        const shouldBeOpen = shouldMarketBeOpen(market);
        if (market.active !== shouldBeOpen) {
            market.active = shouldBeOpen;
            updateMarketStatus(market);
        }
    });
}

// Update market status
function updateMarketStatus(market) {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const index = markets.findIndex(m => m.name === market.name);
    if (index !== -1) {
        markets[index] = market;
        localStorage.setItem('markets', JSON.stringify(markets));
        
        // Update UI if on admin panel
        if (document.getElementById('adminDashboard')) {
            loadMarkets();
            loadDashboardStats();
        }
        
        // Update UI if on website
        if (document.getElementById('guessNumbers')) {
            updateGuessNumbers();
        }
    }
}

// Sync banners
function syncBanners() {
    const banners = JSON.parse(localStorage.getItem('banners') || '[]');
    if (document.getElementById('adminDashboard')) {
        loadBanners();
    }
    if (document.querySelector('.banner-slider')) {
        updateBannerSlider();
    }
}

// Update banner slider
function updateBannerSlider() {
    const banners = JSON.parse(localStorage.getItem('banners') || '[]');
    const slider = document.querySelector('.banner-slider');
    if (slider) {
        slider.innerHTML = banners.map((banner, index) => `
            <div class="banner-slide ${index === 0 ? 'active' : ''}">
                <img src="${banner.image}" alt="Banner ${banner.position}">
            </div>
        `).join('');
    }
}

// Start sync when DOM is loaded
document.addEventListener('DOMContentLoaded', initSync); 