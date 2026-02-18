/* ============ JAYA CLOTHING STORE - FIREBASE REALTIME DATABASE VERSION ============ */

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyBgBNvhd8O1vpkym8kTJwANF5Ru6k7aeC0",
    authDomain: "brand-jaya.firebaseapp.com",
    projectId: "brand-jaya",
    storageBucket: "brand-jaya.firebasestorage.app",
    messagingSenderId: "406485018942",
    appId: "1:406485018942:web:7c45374a0da772857e246f",
    measurementId: "G-6CG6M9VMQ7",
    // ⚠️ مهم جداً: تأكد من رابط قاعدة البيانات
    databaseURL: "https://brand-jaya-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database(); // Use Realtime Database

// ===== DEFAULT DATA =====
// ===== DEFAULT DATA (EXCLUSIVE & PROFESSIONAL) =====
const DEFAULT_DATA = {
    users: [
        { id: 1, username: 'admin', password: 'admin', name: 'المدير العام', role: 'admin' },
        { id: 2, username: 'staff', password: '1234', name: 'سارة محمد', role: 'employee' }
    ],
    categories: ['فساتين سهرة', 'عبايات', 'بدل رسمية', 'إكسسوارات', 'حقائب', 'أحذية'],
    products: [],
    customers: [],
    employees: [
        { id: 1, name: 'المدير العام', phone: '', role: 'مدير', salary: 0, username: 'admin', password: 'admin', permission: 'admin', salesCount: 0 }
    ],
    invoices: [],
    discounts: [],
    returns: [],
    settings: { storeName: 'JAYA Luxury Boutique', storeAddress: 'برج المملكة - الدور الثاني', storePhone: '+966 50 000 0000', taxRate: 15, currency: 'ر.س', nextInvoiceNumber: 1 },
    notifications: []
};

// ===== FIREBASE DATA LAYER (Realtime Database) =====
const dataCache = {};
let firebaseReady = false;

// Load from Realtime Database into cache
async function loadAllFromFirebase() {
    const collections = Object.keys(DEFAULT_DATA);
    const promises = collections.map(async (key) => {
        try {
            const snapshot = await db.ref('store/' + key).once('value');
            if (snapshot.exists()) {
                dataCache[key] = snapshot.val();
            } else {
                // First time: seed with defaults
                dataCache[key] = JSON.parse(JSON.stringify(DEFAULT_DATA[key]));
                await db.ref('store/' + key).set(dataCache[key]);
            }
        } catch (err) {
            console.warn('Firebase read error for ' + key + ':', err);
            dataCache[key] = JSON.parse(JSON.stringify(DEFAULT_DATA[key]));
        }
    });
    await Promise.all(promises);
    firebaseReady = true;
}

// Synchronous read from cache
function loadData(key) {
    if (dataCache[key] !== undefined) return dataCache[key];
    if (DEFAULT_DATA[key]) return JSON.parse(JSON.stringify(DEFAULT_DATA[key]));
    return null;
}

// Save to cache + async sync to Realtime Database
function saveData(key, data) {
    dataCache[key] = data;
    console.log(`Saving data for ${key}...`, data);
    // Async write to Realtime Database (fire and forget with error handling)
    db.ref('store/' + key).set(data).then(() => {
        console.log(`✅ ${key} saved to Firebase successfully`);
    }).catch(err => {
        console.error('Firebase write error for ' + key + ':', err);
        toast('خطأ في حفظ البيانات للسحابة', 'error');
    });
}

// Listen for realtime changes from other devices
function listenForChanges() {
    Object.keys(DEFAULT_DATA).forEach(key => {
        db.ref('store/' + key).on('value', snapshot => {
            if (snapshot.exists() && firebaseReady) {
                const newData = snapshot.val();
                const oldJson = JSON.stringify(dataCache[key]);
                const newJson = JSON.stringify(newData);
                if (oldJson !== newJson) {
                    dataCache[key] = newData;
                    // Refresh current page without re-triggering navigation animation
                    const activePageLink = document.querySelector('.nav-link.active');
                    if (activePageLink) {
                        const page = activePageLink.dataset.page;
                        if (page === 'dashboard') renderDashboard();
                        else if (page === 'products') renderProducts();
                        else if (page === 'pos') renderPOS();
                        else if (page === 'invoices') renderInvoices();
                        else if (page === 'customers') renderCustomers();
                        else if (page === 'inventory') renderInventory();
                        else if (page === 'employees') renderEmployees();
                        else if (page === 'discounts') renderDiscounts();
                        else if (page === 'returns') renderReturns();
                        else if (page === 'reports') renderReport();
                        else if (page === 'settings') renderSettings();
                    }
                }
            }
        }, err => console.warn('Listener error for ' + key + ':', err));
    });
}

function genId(arr) { return arr.length ? Math.max(...arr.map(i => i.id || 0)) + 1 : 1; }
function genInvId() {
    const settings = loadData('settings');
    return String(settings.nextInvoiceNumber || 1);
}

// ===== UTILITY =====
function fmt(n) { const s = loadData('settings'); return Number(n).toLocaleString('ar-EG') + ' ' + (s?.currency || 'ج.م'); }
function fmtDate(d) { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); }
function toast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
function getTierClass(t) { return t === 'VIP' ? 'loyalty-vip' : t === 'ذهبي' ? 'loyalty-gold' : t === 'فضي' ? 'loyalty-silver' : 'loyalty-bronze'; }
function updateTier(c) { c.tier = c.totalPurchases >= 10000 ? 'VIP' : c.totalPurchases >= 5000 ? 'ذهبي' : c.totalPurchases >= 2000 ? 'فضي' : 'برونز'; return c; }

// ===== APP STATE =====
let currentUser = null, cart = [], selectedPayment = 'cash', appliedDiscount = null;

// ===== LOGIN =====
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        const u = document.getElementById('loginUsername').value.trim();
        const p = document.getElementById('loginPassword').value.trim();
        const users = loadData('users');
        const user = users.find(x => x.username === u && x.password === p);
        if (user) {
            currentUser = user;
            localStorage.setItem('jaya_user', JSON.stringify(user)); // Save session
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            document.getElementById('currentUser').textContent = user.name;
            initApp();
            applyPagePermissions();
            toast('مرحباً ' + user.name + ' ☁️ متصل بالسحابة');
        }
        else { toast('بيانات الدخول غير صحيحة', 'error'); }
    });
}

function applyPagePermissions() {
    if (!currentUser) return;
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        const page = link.dataset.page;
        // Default to showing if legacy user or admin
        let shouldShow = true;

        if (currentUser.role !== 'admin') {
            if (currentUser.allowedPages && Array.isArray(currentUser.allowedPages)) {
                if (!currentUser.allowedPages.includes(page)) {
                    shouldShow = false;
                }
            }
            // If allowedPages is undefined, we default to true (legacy support)
        }

        link.style.display = shouldShow ? 'flex' : 'none';
    });

    // Check if current active page is allowed
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink && activeLink.style.display === 'none') {
        // Redirect to first visible page
        const firstVisible = Array.from(links).find(l => l.style.display !== 'none');
        if (firstVisible) firstVisible.click();
    }
}

// ===== PARTICLES =====
function initParticles() {
    const c = document.getElementById('particles');
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 6}s;animation-duration:${4 + Math.random() * 4}s;width:${2 + Math.random() * 4}px;height:${2 + Math.random() * 4}px;`;
        c.appendChild(p);
    }
}

// ===== NAVIGATION =====
function initNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = link.dataset.page;

            // 1. Close mobile menu IMMEDIATELY (feel responsive)
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');

            // 2. Check permissions
            if (currentUser && currentUser.role !== 'admin' && currentUser.allowedPages && !currentUser.allowedPages.includes(page)) {
                toast('ليس لديك صلاحية لهذه الصفحة', 'error');
                return;
            }

            // 3. Update UI state (Links & Pages)
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const targetPage = document.getElementById('page-' + page);
            if (targetPage) targetPage.classList.add('active');

            // 4. Update Title
            const titles = {
                dashboard: 'لوحة التحكم', products: 'المنتجات', pos: 'نقطة البيع',
                invoices: 'الفواتير', customers: 'العملاء', inventory: 'المخزون',
                employees: 'الموظفين', discounts: 'العروض والخصومات', returns: 'المرتجعات',
                reports: 'التقارير', settings: 'الإعدادات'
            };
            document.getElementById('pageTitle').textContent = titles[page] || '';

            // 5. Trigger render functions (freshens data)
            if (page === 'dashboard') renderDashboard();
            else if (page === 'products') renderProducts();
            else if (page === 'pos') renderPOS();
            else if (page === 'invoices') renderInvoices();
            else if (page === 'customers') renderCustomers();
            else if (page === 'inventory') renderInventory();
            else if (page === 'employees') renderEmployees();
            else if (page === 'discounts') renderDiscounts();
            else if (page === 'returns') renderReturns();
            else if (page === 'reports') {
                const rDate = document.getElementById('reportDate');
                if (rDate) rDate.value = new Date().toISOString().split('T')[0];
                renderReport();
            }
            else if (page === 'settings') renderSettings();
        });
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('jaya_user'); // Clear session
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    });

    // Sidebar Toggle for Desktop
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
    }

    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebarOverlay').classList.add('active');
    });

    // Sidebar Close Buttons
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('active');
        });
    }

    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // POS Cart Toggle for Mobile
    const cartToggle = document.getElementById('posCartToggleBtn');
    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            document.getElementById('posCartSection').classList.add('open');
        });
    }

    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            document.getElementById('posCartSection').classList.remove('open');
        });
    }
}

// ===== THEME =====
function initTheme() {
    const saved = localStorage.getItem('jaya_theme') || 'dark';
    if (saved === 'light') { document.documentElement.setAttribute('data-theme', 'light'); document.getElementById('themeIcon').className = 'fas fa-sun'; }
    document.getElementById('themeToggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? '' : 'light';
        document.documentElement.setAttribute('data-theme', next || '');
        document.getElementById('themeIcon').className = next === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('jaya_theme', next || 'dark');
    });
}

// ===== MODALS =====
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function initModals() {
    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
    document.querySelectorAll('.modal-overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) ov.classList.add('hidden'); }));
}

// ===== NOTIFICATIONS =====
function addNotification(text, icon = 'bell') {
    const notifs = loadData('notifications') || [];
    notifs.unshift({ text, icon, time: new Date().toISOString() });
    if (notifs.length > 50) notifs.pop();
    saveData('notifications', notifs);
    renderNotifications();
}
function renderNotifications() {
    const notifs = loadData('notifications') || [];
    const badge = document.getElementById('notifBadge');
    badge.textContent = notifs.length;
    badge.style.display = notifs.length ? 'flex' : 'none';
    const list = document.getElementById('notifList');
    list.innerHTML = notifs.length === 0 ? '<p style="padding:20px;text-align:center;color:var(--text-muted)">لا توجد إشعارات</p>' :
        notifs.slice(0, 20).map(n => `<div class="notif-item"><i class="fas fa-${n.icon}"></i><div><div class="notif-text">${n.text}</div><div class="notif-time">${fmtDate(n.time)}</div></div></div>`).join('');
}
function initNotifPanel() {
    document.getElementById('notifBtn').addEventListener('click', () => document.getElementById('notifPanel').classList.toggle('hidden'));
    document.getElementById('clearNotifs').addEventListener('click', () => { saveData('notifications', []); renderNotifications(); });
    document.addEventListener('click', e => { if (!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) document.getElementById('notifPanel').classList.add('hidden'); });
}

// ===== CHECK LOW STOCK =====
function checkLowStock() {
    const prods = loadData('products');
    prods.filter(p => p.quantity > 0 && p.quantity <= 5).forEach(p => {
        addNotification(`تنبيه: المنتج "${p.name}" كميته منخفضة (${p.quantity})`, 'exclamation-triangle');
    });
    prods.filter(p => p.quantity === 0).forEach(p => {
        addNotification(`تحذير: المنتج "${p.name}" نفد من المخزون!`, 'times-circle');
    });
}
