// Admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@subhomarket.com',
    password: 'admin123'
};

// Initialize admin panel
function initAdmin() {
    // Clear admin login on page load
    localStorage.removeItem('adminLoggedIn');
    
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isAdminLoggedIn) {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
    setupAdminEventListeners();
    loadDashboardStats();
    initializeTheme();
    
    // Initialize markets data if empty
    if (!localStorage.getItem('markets')) {
        localStorage.setItem('markets', JSON.stringify([
            { name: 'Kalyan', guessNumber: '123-45-678', openTime: '10:00', closeTime: '20:00', active: true },
            { name: 'Mayapur', guessNumber: '234-56-789', openTime: '11:00', closeTime: '21:00', active: true },
            { name: 'Rajasthan', guessNumber: '345-67-890', openTime: '12:00', closeTime: '22:00', active: true },
            { name: 'Goa', guessNumber: '456-78-901', openTime: '13:00', closeTime: '21:00', active: true },
            { name: 'Delhi', guessNumber: '567-89-012', openTime: '14:00', closeTime: '22:00', active: true },
            { name: 'Pune', guessNumber: '678-90-123', openTime: '15:00', closeTime: '23:00', active: true },
            { name: 'Karnataka', guessNumber: '789-01-234', openTime: '16:00', closeTime: '00:00', active: true },
            { name: 'Mumbai', guessNumber: '890-12-345', openTime: '10:30', closeTime: '20:30', active: true },
            { name: 'Chennai', guessNumber: '901-23-456', openTime: '11:30', closeTime: '21:30', active: true },
            { name: 'Kolkata', guessNumber: '012-34-567', openTime: '12:30', closeTime: '22:30', active: true },
            { name: 'Hyderabad', guessNumber: '123-45-678', openTime: '13:30', closeTime: '23:30', active: true },
            { name: 'Bengaluru', guessNumber: '234-56-789', openTime: '14:30', closeTime: '00:30', active: true },
            { name: 'Ahmedabad', guessNumber: '345-67-890', openTime: '15:30', closeTime: '01:30', active: true },
            { name: 'Surat', guessNumber: '456-78-901', openTime: '16:30', closeTime: '02:30', active: true },
            { name: 'Jaipur', guessNumber: '567-89-012', openTime: '17:30', closeTime: '03:30', active: true }
        ]));
    }
    
    // Start clock
    updateAdminClock();
    setInterval(updateAdminClock, 1000);
    
    // Initial market status check
    checkMarketStatus();
}

// Event listeners
function setupAdminEventListeners() {
    // Menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('logout')) return;
            
            // Update active menu item
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            const section = item.dataset.section;
            showSection(section);
        });
    });
}

// Admin login
function handleAdminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminDashboard();
        showSuccess('Login successful!');
    } else {
        alert('Invalid email or password!');
    }
}

// Show/Hide functions
function showAdminLogin() {
    document.getElementById('adminLoginScreen').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showAdminDashboard() {
    document.getElementById('adminLoginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadDashboardStats();
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    // Show selected section
    document.getElementById(`${section}Section`).style.display = 'block';
    
    // Load section data
    switch(section) {
        case 'users':
            loadUsers();
            break;
        case 'markets':
            loadMarkets();
            break;
        case 'banners':
            loadBanners();
            break;
        case 'content':
            loadContent();
            break;
    }
}

// Show success message
function showSuccess(message) {
    const successMsg = document.getElementById('successMessage');
    successMsg.querySelector('p').textContent = message;
    successMsg.classList.add('show');
    
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

// Load dashboard stats with users
function loadDashboardStats() {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const activeMarkets = markets.filter(m => m.active);
    const inactiveMarkets = markets.filter(m => !m.active);
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('activeUsers').textContent = users.filter(u => !u.blocked).length;
    document.getElementById('totalMarkets').textContent = markets.length;
    document.getElementById('activeMarkets').textContent = activeMarkets.length;
    document.getElementById('inactiveMarkets').textContent = inactiveMarkets.length;
}

// Format time to 12-hour format with AM/PM
function formatTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Load markets with formatted time
function loadMarkets() {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const tbody = document.querySelector('#marketDetailsTable tbody');
    
    tbody.innerHTML = markets.map(market => {
        const isWithinHours = shouldMarketBeOpen(market);
        const statusClass = market.active ? 'status-active' : 'status-inactive';
        const statusText = market.active ? 'Active' : 'Inactive';
        
        return `
        <tr>
            <td>${market.name}</td>
            <td>${market.guessNumber}</td>
            <td>${formatTime(market.openTime)}</td>
            <td>${formatTime(market.closeTime)}</td>
            <td>
                <div class="market-status-badge ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusText}
                </div>
            </td>
            <td class="action-buttons">
                <button onclick="editMarket('${market.name}')" class="edit-btn">Edit</button>
                <button onclick="toggleMarketStatus('${market.name}')" 
                    class="${market.active ? 'hide-btn' : 'unhide-btn'}"
                    ${!isWithinHours ? 'disabled title="Outside operating hours"' : ''}>
                    ${market.active ? 'Hide' : 'Unhide'}
                </button>
                <button onclick="deleteMarket('${market.name}')" class="delete-btn">Delete</button>
            </td>
        </tr>
    `}).join('');
}

// Load users with passwords
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tbody = document.querySelector('#usersTable tbody');
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.phone}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td>${user.blocked ? 'Blocked' : 'Active'}</td>
            <td class="user-actions-cell">
                <button onclick="toggleUserStatus('${user.phone}')" 
                    class="${user.blocked ? 'unblock-btn' : 'block-btn'}">
                    ${user.blocked ? 'Unblock' : 'Block'}
                </button>
                <button onclick="deleteUser('${user.phone}')" 
                    class="delete-btn">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Banners management
function loadBanners() {
    const banners = JSON.parse(localStorage.getItem('banners') || '[]');
    const container = document.querySelector('.banners-grid');
    
    container.innerHTML = banners.map((banner, index) => {
        return `
            <div class="banner-card">
                <img src="${banner.image}" alt="Banner ${banner.position}">
                <div class="banner-info">
                    <p>Position: Banner ${banner.position}</p>
                    <p>Added on: ${new Date(banner.addedOn).toLocaleDateString()}</p>
                </div>
                <div class="banner-actions">
                    <button onclick="deleteBanner(${index})" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Delete banner
function deleteBanner(index) {
    if (confirm('Are you sure you want to delete this banner?')) {
        const banners = JSON.parse(localStorage.getItem('banners') || '[]');
        banners.splice(index, 1);
        localStorage.setItem('banners', JSON.stringify(banners));
        loadBanners();
        showSuccess('Banner deleted successfully!');
    }
}

// Content management
function loadContent() {
    document.getElementById('privacyEditor').value = localStorage.getItem('privacyPolicy') || '';
    document.getElementById('termsEditor').value = localStorage.getItem('terms') || '';
    document.getElementById('contactEditor').value = localStorage.getItem('contact') || '';
}

// Market functions
function showAddMarketModal() {
    document.getElementById('addMarketModal').style.display = 'flex';
}

function closeAddMarketModal() {
    document.getElementById('addMarketModal').style.display = 'none';
}

// Format guess number while typing
function formatGuessNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substr(0, 8);
    
    if (value.length >= 5) {
        value = value.substr(0, 3) + '-' + value.substr(3, 2) + '-' + value.substr(5);
    } else if (value.length >= 3) {
        value = value.substr(0, 3) + '-' + value.substr(3);
    }
    
    input.value = value;
}

// Add event listeners for guess number formatting
document.getElementById('guessNumber')?.addEventListener('input', (e) => formatGuessNumber(e.target));
document.getElementById('newGuessNumber')?.addEventListener('input', (e) => formatGuessNumber(e.target));

// Convert 24h time to 12h format with period
function convertTo12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return {
        time: `${hours12.toString().padStart(2, '0')}:${minutes}`,
        period
    };
}

// Convert 12h time to 24h format
function convertTo24Hour(time12, period) {
    const [hours, minutes] = time12.split(':');
    let hours24 = parseInt(hours);
    
    if (period === 'PM' && hours24 !== 12) hours24 += 12;
    if (period === 'AM' && hours24 === 12) hours24 = 0;
    
    return `${hours24.toString().padStart(2, '0')}:${minutes}`;
}

// Add new market with time period
function addNewMarket() {
    const name = document.getElementById('marketName').value;
    const guessNumber = document.getElementById('guessNumber').value;
    const openTime = document.getElementById('openTime').value;
    const openPeriod = document.getElementById('openTimePeriod').value;
    const closeTime = document.getElementById('closeTime').value;
    const closePeriod = document.getElementById('closeTimePeriod').value;

    if (!name || !guessNumber || !openTime || !closeTime) {
        alert('Please fill all fields');
        return;
    }

    // Validate guess number format
    if (!/^\d{3}-\d{2}-\d{3}$/.test(guessNumber)) {
        alert('Invalid guess number format. Use XXX-XX-XXX');
        return;
    }

    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    
    markets.push({
        name,
        guessNumber,
        openTime: convertTo24Hour(openTime, openPeriod),
        closeTime: convertTo24Hour(closeTime, closePeriod),
        active: true
    });

    localStorage.setItem('markets', JSON.stringify(markets));
    closeAddMarketModal();
    loadMarkets();
    loadDashboardStats();
    showSuccess('Market added successfully!');
}

// Banner preview and validation
function previewBanner(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const preview = document.getElementById('bannerPreview');
    const sizeInfo = document.getElementById('currentBannerSize');
    const uploadBtn = document.getElementById('uploadBannerBtn');
    
    if (file) {
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const width = this.width;
                const height = this.height;
                
                // Check if dimensions are correct (800x200)
                const isValidSize = width === 800 && height === 200;
                
                sizeInfo.textContent = `Current size: ${width} x ${height} pixels`;
                sizeInfo.className = isValidSize ? 'banner-size-success' : 'banner-size-error';
                
                if (!isValidSize) {
                    sizeInfo.textContent += ' (Invalid size)';
                }
                
                uploadBtn.disabled = !isValidSize;
                
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Upload banner with position
function uploadBanner() {
    const fileInput = document.getElementById('bannerInput');
    const position = document.getElementById('bannerPosition').value;
    
    if (!fileInput.files[0]) {
        alert('Please select a banner image');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const banners = JSON.parse(localStorage.getItem('banners') || '[]');
        
        // Update or add banner at selected position
        banners[position - 1] = {
            image: e.target.result,
            position: position,
            addedOn: new Date().toISOString()
        };
        
        localStorage.setItem('banners', JSON.stringify(banners));
        resetBannerForm();
        loadBanners();
        showSuccess('Banner updated successfully!');
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// Reset banner form
function resetBannerForm() {
    document.getElementById('bannerInput').value = '';
    document.getElementById('bannerPreview').style.display = 'none';
    document.getElementById('currentBannerSize').textContent = '';
    document.getElementById('bannerStartTime').value = '';
    document.getElementById('bannerEndTime').value = '';
    document.getElementById('uploadBannerBtn').disabled = true;
}

// Content update functions
function updatePrivacyPolicy() {
    const content = document.getElementById('privacyEditor').value;
    localStorage.setItem('privacyPolicy', content);
    alert('Privacy Policy updated successfully');
}

function updateTerms() {
    const content = document.getElementById('termsEditor').value;
    localStorage.setItem('terms', content);
    alert('Terms & Conditions updated successfully');
}

function updateContact() {
    const content = document.getElementById('contactEditor').value;
    localStorage.setItem('contact', content);
    alert('Contact Information updated successfully');
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    showAdminLogin();
}

// Update guess number modal
function showUpdateGuessModal() {
    const modal = document.getElementById('updateGuessModal');
    const select = document.getElementById('marketSelect');
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    
    // Clear previous options
    select.innerHTML = '<option value="">Select Market</option>';
    
    // Add market options
    markets.forEach(market => {
        const option = document.createElement('option');
        option.value = market.name;
        option.textContent = market.name;
        select.appendChild(option);
    });
    
    modal.style.display = 'flex';
}

function closeUpdateGuessModal() {
    document.getElementById('updateGuessModal').style.display = 'none';
}

function updateGuessNumber() {
    const marketName = document.getElementById('marketSelect').value;
    const newGuessNumber = document.getElementById('newGuessNumber').value;
    const newOpenTime = document.getElementById('newOpenTime').value;
    const newOpenPeriod = document.getElementById('newOpenTimePeriod').value;
    const newCloseTime = document.getElementById('newCloseTime').value;
    const newClosePeriod = document.getElementById('newCloseTimePeriod').value;

    if (!marketName || !newGuessNumber || !newOpenTime || !newCloseTime) {
        alert('Please fill all fields');
        return;
    }

    // Validate guess number format
    if (!/^\d{3}-\d{2}-\d{3}$/.test(newGuessNumber)) {
        alert('Invalid guess number format. Use XXX-XX-XXX');
        return;
    }

    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const market = markets.find(m => m.name === marketName);
    
    if (market) {
        market.guessNumber = newGuessNumber;
        market.openTime = convertTo24Hour(newOpenTime, newOpenPeriod);
        market.closeTime = convertTo24Hour(newCloseTime, newClosePeriod);
        
        localStorage.setItem('markets', JSON.stringify(markets));
        closeUpdateGuessModal();
        loadMarkets();
        showSuccess('Market updated successfully!');
    }
}

// Check if market should be open based on time
function shouldMarketBeOpen(market) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHours, openMinutes] = market.openTime.split(':').map(Number);
    const openTime = openHours * 60 + openMinutes;
    
    const [closeHours, closeMinutes] = market.closeTime.split(':').map(Number);
    const closeTime = closeHours * 60 + closeMinutes;
    
    return currentTime >= openTime && currentTime < closeTime;
}

// Auto market status check
function checkMarketStatus() {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    let hasChanges = false;
    
    markets.forEach(market => {
        const shouldBeOpen = shouldMarketBeOpen(market);
        if (market.active !== shouldBeOpen) {
            market.active = shouldBeOpen;
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        localStorage.setItem('markets', JSON.stringify(markets));
        loadMarkets();
        loadDashboardStats();
    }
}

// Toggle market status manually
function toggleMarketStatus(marketName) {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const market = markets.find(m => m.name === marketName);
    
    if (market) {
        // Only allow activation if within open hours
        if (!market.active && !shouldMarketBeOpen(market)) {
            alert('Cannot activate market outside of operating hours');
            return;
        }
        
        market.active = !market.active;
        localStorage.setItem('markets', JSON.stringify(markets));
        loadMarkets();
        loadDashboardStats();
        showSuccess(`Market ${market.active ? 'activated' : 'deactivated'} successfully!`);
    }
}

// Show market details
function showMarketDetails() {
    const modal = document.getElementById('marketDetailsModal');
    const tbody = document.querySelector('#marketDetailsTable tbody');
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    
    if (markets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">No markets found</td>
            </tr>
        `;
    } else {
        tbody.innerHTML = markets.map(market => `
            <tr>
                <td>${market.name}</td>
                <td>${market.guessNumber}</td>
                <td>${market.openTime}</td>
                <td>${market.closeTime}</td>
                <td class="status-cell">
                    <span class="status-dot ${market.active ? 'active' : 'inactive'}"></span>
                    ${market.active ? 'Active' : 'Inactive'}
                </td>
                <td class="action-buttons">
                    <button onclick="editMarket('${market.name}')" class="edit-btn">Edit</button>
                    <button onclick="toggleMarketStatus('${market.name}')" 
                        class="${market.active ? 'hide-btn' : 'unhide-btn'}">
                        ${market.active ? 'Hide' : 'Unhide'}
                    </button>
                    <button onclick="deleteMarket('${market.name}')" class="delete-btn">Delete</button>
                </td>
            </tr>
        `).join('');
    }
    
    modal.style.display = 'flex';
}

function closeMarketDetailsModal() {
    document.getElementById('marketDetailsModal').style.display = 'none';
}

// Update edit market function
function editMarket(marketName) {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const market = markets.find(m => m.name === marketName);
    
    if (market) {
        // First show the update modal
        showUpdateGuessModal();
        
        // Then set the values
        setTimeout(() => {
            document.getElementById('marketSelect').value = market.name;
            document.getElementById('newGuessNumber').value = market.guessNumber;
            document.getElementById('newOpenTime').value = market.openTime;
            document.getElementById('newCloseTime').value = market.closeTime;
        }, 100);
        
        closeMarketDetailsModal();
    }
}

// Update delete market function
function deleteMarket(marketName) {
    if (confirm(`Are you sure you want to delete ${marketName}?`)) {
        const markets = JSON.parse(localStorage.getItem('markets') || '[]');
        const updatedMarkets = markets.filter(m => m.name !== marketName);
        
        localStorage.setItem('markets', JSON.stringify(updatedMarkets));
        loadMarkets();
        loadDashboardStats();
        closeMarketDetailsModal();
        showSuccess('Market deleted successfully!');
    }
}

// Theme toggle
function toggleAdminTheme() {
    const body = document.body;
    const themeBtn = document.querySelector('.theme-btn');
    const modeIcon = themeBtn.querySelector('.mode-icon');
    const modeText = themeBtn.querySelector('.mode-text');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        modeIcon.textContent = '🌙';
        modeText.textContent = 'Dark Mode';
    } else {
        modeIcon.textContent = '🌞';
        modeText.textContent = 'Light Mode';
    }
    
    localStorage.setItem('adminDarkMode', body.classList.contains('dark-mode'));
}

// Initialize theme
function initializeTheme() {
    const isDarkMode = localStorage.getItem('adminDarkMode') === 'true';
    const themeBtn = document.querySelector('.theme-btn');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeBtn.querySelector('.mode-icon').textContent = '🌙';
        themeBtn.querySelector('.mode-text').textContent = 'Dark Mode';
    }
}

// Update admin clock
function updateAdminClock() {
    const now = new Date();
    const timeElement = document.getElementById('adminTime');
    const dateElement = document.getElementById('adminDate');
    
    if (timeElement && dateElement) {
        // Format time with AM/PM
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        
        timeElement.textContent = `${formattedHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
        
        // Format date
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        dateElement.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
    
    // Check market status every minute
    if (now.getSeconds() === 0) {
        checkMarketStatus();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin); 