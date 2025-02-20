// DOM Elements
let splashScreen, loginScreen, registerScreen, homeScreen, sideMenu;
let profileScreen, privacyScreen, termsScreen, logoutDialog;
let contactScreen;

// Initialize app
function init() {
    // Initialize elements
    splashScreen = document.getElementById('splashScreen');
    loginScreen = document.getElementById('loginScreen');
    registerScreen = document.getElementById('registerScreen');
    homeScreen = document.getElementById('homeScreen');
    sideMenu = document.getElementById('sideMenu');
    profileScreen = document.getElementById('profileScreen');
    privacyScreen = document.getElementById('privacyScreen');
    termsScreen = document.getElementById('termsScreen');
    logoutDialog = document.getElementById('logoutDialog');
    contactScreen = document.getElementById('contactScreen');

    // Setup event listeners
    setupEventListeners();

    // Make sure menu is closed initially
    if (sideMenu) {
        sideMenu.classList.remove('active');
    }

    // Show splash screen for 2 seconds
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.display = 'none';
            
            // Check if user is logged in from localStorage
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (isLoggedIn === 'true') {
                showHomeScreen();
            } else {
                showLoginScreen();
            }
        }
    }, 2000);

    initializeTheme();
}

// Event Listeners Setup
function setupEventListeners() {
    // Login Form
    const loginBtn = document.querySelector('.login-btn');
    const showRegisterBtn = document.getElementById('showRegister');
    
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterScreen();
        });
    }

    // Register Form
    const registerBtn = document.querySelector('.register-btn');
    const showLoginBtn = document.getElementById('showLogin');
    
    if (registerBtn) registerBtn.addEventListener('click', handleRegistration);
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginScreen();
        });
    }

    // Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);

    // Theme Toggle
    const themeSwitch = document.querySelector('.theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }

    // Menu Items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.item;
            
            handleMenuItemClick(action);
        });
    });

    // Logout functionality
    document.querySelector('.logout-btn')?.addEventListener('click', handleLogout);

    // Contact Buttons
    const whatsappBtn = document.querySelector('.contact-btn.whatsapp');
    const telegramBtn = document.querySelector('.contact-btn.telegram');

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            window.open(`https://wa.me/${marketData.whatsappNumber.replace('+', '')}`, '_blank');
        });
    }

    if (telegramBtn) {
        telegramBtn.addEventListener('click', () => {
            window.open(`https://t.me/${marketData.telegramLink.replace('+', '')}`, '_blank');
        });
    }

    // Add click event listener to document
    document.addEventListener('click', (e) => {
        // Check if menu is open
        if (sideMenu && sideMenu.classList.contains('active')) {
            // Check if click is outside menu and not on menu button
            const menuBtn = document.querySelector('.menu-btn');
            if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                sideMenu.classList.remove('active');
            }
        }
    });

    // Prevent menu from closing when clicking inside it
    sideMenu?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Prevent menu from closing when clicking menu button
    document.querySelector('.menu-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Screen Management
function showLoginScreen() {
    hideAllScreens();
    if (loginScreen) loginScreen.style.display = 'block';
}

function showRegisterScreen() {
    hideAllScreens();
    if (registerScreen) registerScreen.style.display = 'block';
}

function showHomeScreen() {
    hideAllScreens();
    if (homeScreen) {
        homeScreen.style.display = 'block';
        setupBannerSlider();
        updateHomeContent();
        // Make sure menu is closed when showing home screen
        if (sideMenu) {
            sideMenu.classList.remove('active');
        }
    }
}

function hideAllScreens() {
    [splashScreen, loginScreen, registerScreen, homeScreen, 
     profileScreen, privacyScreen, termsScreen, contactScreen].forEach(screen => {
        if (screen) screen.style.display = 'none';
    });
}

// Authentication Functions
function handleLogin() {
    const phone = document.getElementById('loginPhone')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!phone || !password) {
        alert('Please fill all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phone && u.password === password);

    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true'); // Set login state
        showHomeScreen();
    } else {
        alert('Invalid credentials');
    }
}

function handleRegistration() {
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!name || !phone || !email || !password) {
        alert('Please fill all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.some(u => u.phone === phone)) {
        alert('User already exists with this phone number');
        return;
    }

    // Save user with password
    users.push({
        name,
        phone,
        email,
        password, // Store password permanently
        blocked: false,
        registeredOn: new Date().toISOString()
    });

    localStorage.setItem('users', JSON.stringify(users));
    showLoginScreen();
    showSuccess('Registration successful! Please login.');
}

// Home Screen Content
function updateHomeContent() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = user.name || 'User';
    
    updateDateTime();
    updateTime();
    setInterval(updateTime, 1000);
    
    setupBannerSlider();
    updateGuessNumbers();
    setupMarketTabs();
}

function updateDateTime() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    
    const dayInfo = document.getElementById('dayInfo');
    const dateInfo = document.getElementById('dateInfo');
    
    if (dayInfo) dayInfo.textContent = days[now.getDay()];
    if (dateInfo) {
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        dateInfo.textContent = `${day}/${month}/${year}`;
    }
}

function updateTime() {
    const timeInfo = document.getElementById('timeInfo');
    if (timeInfo) {
        timeInfo.textContent = new Date().toLocaleTimeString();
    }
}

function updateGuessNumbers() {
    const container = document.getElementById('guessNumbers');
    if (!container) return;

    container.innerHTML = marketData.bazars.map(bazar => `
        <div class="market-card" data-market="${bazar.name.toLowerCase()}">
            <h3 class="market-name">${bazar.name}</h3>
            <p class="guess-number">${bazar.guessNumber}</p>
            <div class="market-time">
                <span>Open: ${bazar.openTime}</span>
                <span>Close: ${bazar.closeTime}</span>
            </div>
        </div>
    `).join('');
}

function setupMarketTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const markets = document.querySelectorAll('.market-card');
    
    // Show all markets initially
    markets.forEach(card => card.style.display = 'block');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Filter markets
            const selectedMarket = tab.dataset.market;
            markets.forEach(card => {
                if (selectedMarket === 'all') {
                    card.style.display = 'block';
                } else {
                    card.style.display = 
                        card.dataset.market === selectedMarket.toLowerCase() 
                            ? 'block' 
                            : 'none';
                }
            });
        });
    });
}

// Menu Functions
function toggleMenu() {
    if (sideMenu) {
        sideMenu.classList.toggle('active');
    }
}

// Add logout function
function handleLogout() {
    localStorage.removeItem('user');
    toggleMenu();
    showLoginScreen();
}

// Update banner slider with 10 second interval
function setupBannerSlider() {
    const bannerSlider = document.querySelector('.banner-slider');
    if (!bannerSlider) return;

    let currentSlide = 0;
    const banners = [
        './assets/images/banners/banner1.jpg',
        './assets/images/banners/banner2.jpg',
        './assets/images/banners/banner3.jpg'
    ];

    function updateSlider() {
        bannerSlider.innerHTML = banners.map((banner, index) => `
            <div class="banner-slide ${index === currentSlide ? 'active' : ''}" 
                 style="transform: translateX(${(index - currentSlide) * 100}%)">
                <img src="${banner}" 
                     alt="Banner ${index + 1}" 
                     loading="lazy">
            </div>
        `).join('');
    }

    updateSlider();

    // Change slide every 10 seconds
    setInterval(() => {
        currentSlide = (currentSlide + 1) % banners.length;
        updateSlider();
    }, 10000); // Changed to 10000ms (10 seconds)
}

// Add screen show functions
function showProfileScreen() {
    hideAllScreens();
    if (profileScreen) {
        profileScreen.style.display = 'block';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profilePhone').value = user.phone || '';
    }
}

function showPrivacyScreen() {
    hideAllScreens();
    if (privacyScreen) privacyScreen.style.display = 'block';
}

function showTermsScreen() {
    hideAllScreens();
    if (termsScreen) termsScreen.style.display = 'block';
}

// Profile update function
function updateProfile() {
    const newName = document.getElementById('profileName').value;
    if (!newName) {
        alert('Please enter your name');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.name = newName;
    localStorage.setItem('user', JSON.stringify(user));

    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.phone === user.phone);
    if (userIndex !== -1) {
        users[userIndex].name = newName;
        localStorage.setItem('users', JSON.stringify(users));
    }

    const messageEl = document.getElementById('profileUpdateMessage');
    messageEl.textContent = 'Profile update successful 🎉';
    setTimeout(() => messageEl.textContent = '', 3000);
}

// Update logout functions
function showLogoutDialog() {
    const dialog = document.getElementById('logoutDialog');
    if (dialog) {
        dialog.style.display = 'flex';
    }
}

function closeLogoutDialog() {
    const dialog = document.getElementById('logoutDialog');
    if (dialog) {
        dialog.style.display = 'none';
        toggleMenu(); // Close menu when clicking No
        showHomeScreen(); // Show home screen when clicking No
    }
}

function confirmLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn'); // Clear login state
    const dialog = document.getElementById('logoutDialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
    toggleMenu();
    showLoginScreen();
}

// Add exit dialog functions
function showExitDialog() {
    const dialog = document.getElementById('exitDialog');
    if (dialog) {
        dialog.style.display = 'flex';
    }
}

function closeExitDialog() {
    const dialog = document.getElementById('exitDialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

function confirmExit() {
    window.close();
}

// Update handleMenuItemClick function
function handleMenuItemClick(action) {
    switch(action) {
        case 'profile':
            showProfileScreen();
            toggleMenu();
            break;
        case 'privacy':
            showPrivacyScreen();
            toggleMenu();
            break;
        case 'terms':
            showTermsScreen();
            toggleMenu();
            break;
        case 'contact':
            showContactScreen();
            toggleMenu();
            break;
        case 'logout':
            showLogoutDialog();
            // Don't close menu for logout
            break;
        case 'exit':
            showExitDialog();
            // Don't close menu for exit
            break;
    }
}

// Add show function for contact screen
function showContactScreen() {
    hideAllScreens();
    if (contactScreen) contactScreen.style.display = 'block';
}

// Theme toggle function
function toggleTheme() {
    const body = document.body;
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    
    // Update all theme button texts
    themeButtons.forEach(btn => {
        const modeText = btn.querySelector('.mode-text');
        if (modeText) {
            modeText.textContent = body.classList.contains('dark-mode') ? 'Dark Mode' : 'Light Mode';
        }
    });
}

// Initialize theme on load
function initializeTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeButtons.forEach(btn => {
            const modeText = btn.querySelector('.mode-text');
            if (modeText) {
                modeText.textContent = 'Dark Mode';
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Initialize theme
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Check if market should be open
function shouldMarketBeOpen(market) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHours, openMinutes] = market.openTime.split(':').map(Number);
    const openTime = openHours * 60 + openMinutes;
    
    const [closeHours, closeMinutes] = market.closeTime.split(':').map(Number);
    const closeTime = closeHours * 60 + closeMinutes;
    
    return currentTime >= openTime && currentTime < closeTime;
}

// Format time remaining
function formatTimeRemaining(timeInMinutes) {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return `${hours}h ${minutes}m`;
}

// Update market status and countdown
function updateMarketStatus() {
    const markets = JSON.parse(localStorage.getItem('markets') || '[]');
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    markets.forEach(market => {
        const marketElement = document.querySelector(`[data-market="${market.name}"]`);
        if (!marketElement) return;
        
        const [openHours, openMinutes] = market.openTime.split(':').map(Number);
        const openTime = openHours * 60 + openMinutes;
        
        const [closeHours, closeMinutes] = market.closeTime.split(':').map(Number);
        const closeTime = closeHours * 60 + closeMinutes;
        
        const statusElement = marketElement.querySelector('.market-status');
        const countdownElement = marketElement.querySelector('.market-countdown');
        
        const isWithinHours = shouldMarketBeOpen(market);
        
        if (!isWithinHours || !market.active) {
            statusElement.textContent = 'MARKET CLOSED';
            statusElement.classList.remove('open');
            statusElement.classList.add('closed');
            
            // Show time until next opening if before open time
            if (currentTime < openTime) {
                const timeUntilOpen = openTime - currentTime;
                countdownElement.textContent = `Opens in: ${formatTimeRemaining(timeUntilOpen)}`;
                countdownElement.style.color = '#16a34a';
            } else {
                countdownElement.textContent = '';
            }
        } else {
            statusElement.textContent = 'MARKET OPEN';
            statusElement.classList.remove('closed');
            statusElement.classList.add('open');
            
            // Show time until closing
            const timeUntilClose = closeTime - currentTime;
            countdownElement.textContent = `Closes in: ${formatTimeRemaining(timeUntilClose)}`;
            countdownElement.style.color = '#dc2626';
        }
    });
}

// Update more frequently
setInterval(updateMarketStatus, 30000); // Update every 30 seconds 