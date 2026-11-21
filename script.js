// DEFAULT SEED MENU DATA
const DEFAULT_MENU = [
    {
        id: 1,
        name: "Wagyu Tenderloin Steak 200g",
        category: "main",
        price: 320000,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        description: "Daging Wagyu MB5 pilihan, disajikan dengan potato puree, asparagus panggang, dan saus truffle red wine.",
        tags: ["chef", "halal"],
        available: true
    },
    {
        id: 2,
        name: "Truffle Cream Fettuccine",
        category: "main",
        price: 145000,
        image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
        description: "Pasta fettuccine segar dengan krim truffle hitam buatan sendiri, keju Parmesan 24 bulan, dan jamur liar.",
        tags: ["chef", "halal"],
        available: true
    },
    {
        id: 3,
        name: "Nasi Goreng Buntut Daily Inn",
        category: "main",
        price: 115000,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
        description: "Nasi goreng rempah warisan dengan topping potongan buntut sapi bakar empuk, telur mata sapi, kerupuk udang & emping.",
        tags: ["halal", "spicy"],
        available: true
    },
    {
        id: 4,
        name: "American Club Breakfast Set",
        category: "breakfast",
        price: 95000,
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80",
        description: "Pilihan telur (scrambled/poached), sosis sapi premium, beef bacon, roti panggang sourdough, dan jus jeruk segar.",
        tags: ["halal"],
        available: true
    },
    {
        id: 5,
        name: "Gold Leaf Chocolate Lava Cake",
        category: "dessert",
        price: 75000,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        description: "Cokelat Belgian leleh hangat dengan lapisan emas 24k edible, disajikan bersandingan dengan es krim vanilla Madagascar.",
        tags: ["chef", "halal"],
        available: true
    },
    {
        id: 6,
        name: "Royal Iced Lychee Tea",
        category: "drink",
        price: 45000,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
        description: "Teh Earl Grey dingin diseduh segar disajikan dengan buah lada dan biji selasih beraroma mawar.",
        tags: ["halal"],
        available: true
    }
];

// GLOBAL APPLICATION STATE
let menuItems = [];
let cart = [];
let currentCategory = 'all';
let currentTag = 'all';
let searchQuery = '';
let orderMode = 'room'; // 'room' or 'table'
let locationNo = '304';
let lastLogoClick = 0;
let imageSourceMode = 'file'; // 'file' or 'url'
let currentImageData = '';

// RESTO OPERATIONAL HOURS STATE
let restoHours = {
    openTime: "06:00",
    closeTime: "23:00",
    forceStatus: "auto" // 'auto', 'force_open', 'force_closed'
};

// INITIALIZATION ON LOAD
window.onload = function() {
    loadStoredData();
    initRealtimeClock();
    checkRestoStatus();
    renderProducts();
    updateCartUI();
    updateAdminNavBtnUI();
};

// LOAD DATA FROM LOCALSTORAGE / SESSION
function loadStoredData() {
    const savedMenu = localStorage.getItem('dailyinn_menu');
    if (savedMenu) {
        try { menuItems = JSON.parse(savedMenu); } catch(e) { menuItems = DEFAULT_MENU; }
    } else {
        menuItems = DEFAULT_MENU;
        localStorage.setItem('dailyinn_menu', JSON.stringify(DEFAULT_MENU));
    }

    const savedHours = localStorage.getItem('dailyinn_resto_hours');
    if (savedHours) {
        try { restoHours = JSON.parse(savedHours); } catch(e){}
    }

    // Sync Admin Controls if elements exist
    const openEl = document.getElementById('admin-open-time');
    const closeEl = document.getElementById('admin-close-time');
    const forceEl = document.getElementById('admin-force-status');
    if (openEl) openEl.value = restoHours.openTime;
    if (closeEl) closeEl.value = restoHours.closeTime;
    if (forceEl) forceEl.value = restoHours.forceStatus;
}

// REALTIME CLOCK & TIME-BASED GREETING
function initRealtimeClock() {
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const clockStr = now.toLocaleTimeString('id-ID', { hour12: false });
    
    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.innerText = clockStr;

    let greeting = "Good Morning";
    let iconClass = "fa-solid fa-sun";

    if (hours >= 4 && hours < 11) {
        greeting = "Selamat Pagi (Good Morning)";
        iconClass = "fa-solid fa-sun text-amber-400";
    } else if (hours >= 11 && hours < 15) {
        greeting = "Selamat Siang (Good Afternoon)";
        iconClass = "fa-solid fa-cloud-sun text-gold-400";
    } else if (hours >= 15 && hours < 18) {
        greeting = "Selamat Sore (Good Afternoon)";
        iconClass = "fa-solid fa-cloud-sun-rain text-amber-500";
    } else {
        greeting = "Selamat Malam (Good Night)";
        iconClass = "fa-solid fa-moon text-indigo-400";
    }

    const greetingEl = document.getElementById('time-greeting');
    const iconEl = document.getElementById('greeting-icon');
    if (greetingEl) greetingEl.innerText = greeting;
    if (iconEl) iconEl.innerHTML = `<i class="${iconClass}"></i>`;

    checkRestoStatus();
}

// RESTO OPERATIONAL HOURS STATUS CHECKER
function isRestoOpenNow() {
    if (restoHours.forceStatus === 'force_open') return true;
    if (restoHours.forceStatus === 'force_closed') return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = restoHours.openTime.split(':').map(Number);
    const [closeH, closeM] = restoHours.closeTime.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (closeMinutes >= openMinutes) {
        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else {
        // Crosses midnight
        return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
}

function checkRestoStatus() {
    const isOpen = isRestoOpenNow();
    const badgeDot = document.getElementById('resto-status-dot');
    const badgeText = document.getElementById('resto-status-text');
    const badgeBox = document.getElementById('header-resto-status-badge');

    if (!badgeDot || !badgeText || !badgeBox) return;

    if (isOpen) {
        badgeDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
        badgeText.className = "font-bold text-emerald-400 text-[11px]";
        badgeText.innerText = "Resto Buka";
        badgeBox.className = "flex items-center space-x-1.5 bg-darknavy-900 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs";
    } else {
        badgeDot.className = "w-2 h-2 rounded-full bg-red-500 animate-ping";
        badgeText.className = "font-bold text-red-400 text-[11px]";
        badgeText.innerText = "Resto Tutup";
        badgeBox.className = "flex items-center space-x-1.5 bg-darknavy-900 border border-red-500/40 px-3 py-1.5 rounded-full text-xs";
    }
}

function saveRestoHoursConfig() {
    const openEl = document.getElementById('admin-open-time');
    const closeEl = document.getElementById('admin-close-time');
    const forceEl = document.getElementById('admin-force-status');

    restoHours.openTime = openEl.value || "06:00";
    restoHours.closeTime = closeEl.value || "23:00";
    restoHours.forceStatus = forceEl.value || "auto";

    localStorage.setItem('dailyinn_resto_hours', JSON.stringify(restoHours));
    checkRestoStatus();
    showToast("Pengaturan jam operasional berhasil diperbarui!", "success");
}

function showRestoClosedModal() {
    const modal = document.getElementById('modal-resto-closed');
    const infoEl = document.getElementById('modal-closed-hours-info');
    if (infoEl) infoEl.innerText = `${restoHours.openTime} - ${restoHours.closeTime} WIB`;
    if (modal) modal.classList.remove('hidden');
}

function closeRestoClosedModal() {
    const modal = document.getElementById('modal-resto-closed');
    if (modal) modal.classList.add('hidden');
}

// RENDER PRODUCT CARDS IN INDEX GRID
function renderProducts() {
    const grid = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-search-state');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = menuItems.filter(item => {
        const matchesCat = currentCategory === 'all' || item.category === currentCategory;
        const matchesTag = currentTag === 'all' || (item.tags && item.tags.includes(currentTag));
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesTag && matchesSearch;
    });

    if (filtered.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    const isRestoOpen = isRestoOpenNow();

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = "glass-card rounded-3xl overflow-hidden flex flex-col justify-between group";

        let tagsHTML = '';
        if (item.tags) {
            if (item.tags.includes('chef')) tagsHTML += `<span class="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-md font-bold">⭐ Chef Choice</span> `;
            if (item.tags.includes('halal')) tagsHTML += `<span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-md font-bold">Halal</span> `;
            if (item.tags.includes('spicy')) tagsHTML += `<span class="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-md font-bold">🌶️ Pedas</span> `;
        }

        const formatPrice = "Rp " + item.price.toLocaleString('id-ID');

        card.innerHTML = `
            <div class="relative h-48 overflow-hidden cursor-pointer" onclick="openDetailModal(${item.id})">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" onerror="this.src='https://placehold.co/600x400/111827/f59e0b?text=Daily+Inn'">
                <div class="absolute inset-0 bg-gradient-to-t from-darknavy-950 via-transparent to-transparent opacity-80"></div>
                <div class="absolute top-3 left-3 flex flex-wrap gap-1">
                    ${tagsHTML}
                </div>
                ${!item.available ? '<div class="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center font-bold text-xs text-red-400 uppercase tracking-widest">Out of Stock</div>' : ''}
            </div>

            <div class="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div class="space-y-1.5 cursor-pointer" onclick="openDetailModal(${item.id})">
                    <h3 class="font-serif font-bold text-base text-slate-100 group-hover:text-gold-400 transition">${item.name}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">${item.description}</p>
                </div>

                <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] text-slate-500 block font-semibold uppercase">Harga</span>
                        <span class="font-mono font-bold text-gold-400 text-sm md:text-base">${formatPrice}</span>
                    </div>

                    ${item.available ? `
                        <button onclick="addToCart(${item.id})" class="px-3.5 py-2 rounded-xl ${isRestoOpen ? 'bg-gold-600 hover:bg-gold-500 text-black' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} font-bold text-xs shadow transition flex items-center space-x-1.5">
                            <i class="fa-solid fa-plus text-[10px]"></i>
                            <span>Pesan</span>
                        </button>
                    ` : `
                        <span class="text-[11px] text-red-400/80 italic font-semibold">Stok Habis</span>
                    `}
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// CART MANAGEMENT LOGIC
function addToCart(itemId) {
    if (!isRestoOpenNow()) {
        showRestoClosedModal();
        return;
    }

    const item = menuItems.find(i => i.id === itemId);
    if (!item || !item.available) return;

    const existing = cart.find(c => c.id === itemId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }

    updateCartUI();
    showToast(`"<b>${item.name}</b>" ditambahkan ke keranjang`, "success");
}

function updateQuantity(itemId, change) {
    const index = cart.findIndex(c => c.id === itemId);
    if (index !== -1) {
        cart[index].qty += change;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const serviceFee = subtotal * 0.10;
    const taxFee = subtotal * 0.11;
    const grandTotal = subtotal + serviceFee + taxFee;

    // Badges & Counters
    const badgeCount = document.getElementById('cart-badge-count');
    const summaryCount = document.getElementById('summary-item-count');
    const floatCount = document.getElementById('float-item-count');
    const floatPrice = document.getElementById('float-total-price');
    const floatBar = document.getElementById('floating-cart-bar');

    if (badgeCount) badgeCount.innerText = totalQty;
    if (summaryCount) summaryCount.innerText = `${totalQty} Item`;
    if (floatCount) floatCount.innerText = totalQty;
    if (floatPrice) floatPrice.innerText = "Rp " + grandTotal.toLocaleString('id-ID');

    // Floating Bar visibility
    if (floatBar) {
        if (totalQty > 0) {
            floatBar.classList.remove('translate-y-32', 'opacity-0');
        } else {
            floatBar.classList.add('translate-y-32', 'opacity-0');
        }
    }

    // Summary Totals
    const subtotalEl = document.getElementById('summary-subtotal');
    const serviceEl = document.getElementById('summary-service');
    const taxEl = document.getElementById('summary-tax');
    const grandEl = document.getElementById('summary-grandtotal');

    if (subtotalEl) subtotalEl.innerText = "Rp " + subtotal.toLocaleString('id-ID');
    if (serviceEl) serviceEl.innerText = "Rp " + serviceFee.toLocaleString('id-ID');
    if (taxEl) taxEl.innerText = "Rp " + taxFee.toLocaleString('id-ID');
    if (grandEl) grandEl.innerText = "Rp " + grandTotal.toLocaleString('id-ID');

    renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const emptyCart = document.getElementById('empty-cart-state');
    const btnSubmit = document.getElementById('btn-submit-order');
    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        if (emptyCart) emptyCart.classList.remove('hidden');
        if (btnSubmit) btnSubmit.disabled = true;
        return;
    } else {
        if (emptyCart) emptyCart.classList.add('hidden');
        if (btnSubmit) btnSubmit.disabled = false;
    }

    cart.forEach(item => {
        const card = document.createElement('div');
        card.className = "glass-panel rounded-2xl p-4 flex items-center justify-between gap-3 border border-slate-800";

        const itemTotal = "Rp " + (item.price * item.qty).toLocaleString('id-ID');

        card.innerHTML = `
            <div class="flex items-center space-x-3 overflow-hidden">
                <img src="${item.image}" class="w-14 h-14 rounded-xl object-cover flex-shrink-0" onerror="this.src='https://placehold.co/200x200/111827/f59e0b?text=Food'">
                <div class="truncate">
                    <h4 class="font-serif font-bold text-xs md:text-sm text-slate-100 truncate">${item.name}</h4>
                    <span class="text-[11px] text-gold-400 font-mono font-semibold">${itemTotal}</span>
                </div>
            </div>

            <div class="flex items-center space-x-2 flex-shrink-0">
                <button onclick="updateQuantity(${item.id}, -1)" class="w-7 h-7 rounded-lg bg-darknavy-900 border border-slate-700 text-slate-300 hover:border-gold-500 flex items-center justify-center text-xs transition">
                    <i class="fa-solid fa-minus text-[10px]"></i>
                </button>
                <span class="font-mono font-bold text-xs w-6 text-center text-slate-100">${item.qty}</span>
                <button onclick="updateQuantity(${item.id}, 1)" class="w-7 h-7 rounded-lg bg-darknavy-900 border border-slate-700 text-slate-300 hover:border-gold-500 flex items-center justify-center text-xs transition">
                    <i class="fa-solid fa-plus text-[10px]"></i>
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// DIRECT WHATSAPP ORDER SUBMISSION
function sendOrderViaWhatsApp() {
    if (!isRestoOpenNow()) {
        showRestoClosedModal();
        return;
    }

    if (cart.length === 0) {
        showToast("Keranjang Anda masih kosong!", "error");
        return;
    }

    // PERMANENT WHATSAPP NUMBER (089636200813)
    const targetPhone = "6289636200813";

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const serviceFee = subtotal * 0.10;
    const taxFee = subtotal * 0.11;
    const grandTotal = subtotal + serviceFee + taxFee;
    const notes = document.getElementById('order-notes')?.value || "-";

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const typeLabel = orderMode === 'room' ? 'ROOM SERVICE' : 'RESTO / MEJA';
    const locLabel = orderMode === 'room' ? `Kamar No: ${locationNo}` : `Meja No: ${locationNo}`;

    let text = `*PESANAN DIGITAL MENU - HOTEL DAILY INN*\n`;
    text += `-------------------------------------------\n`;
    text += `📌 *Tipe Pesanan:* ${typeLabel}\n`;
    text += `🏨 *Lokasi:* ${locLabel}\n`;
    text += `📅 *Waktu:* ${dateStr} (${timeStr} WIB)\n`;
    text += `-------------------------------------------\n\n`;

    text += `*RINCIAN ITEM PESANAN:*\n`;
    cart.forEach((item, index) => {
        const itemTot = (item.price * item.qty).toLocaleString('id-ID');
        text += `${index + 1}. *${item.name}* (${item.qty}x)\n   ↳ Rp ${itemTot}\n`;
    });

    text += `\n-------------------------------------------\n`;
    text += `💵 *Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}\n`;
    text += `🛎️ *Service (10%):* Rp ${serviceFee.toLocaleString('id-ID')}\n`;
    text += `🏛️ *Pajak (11%):* Rp ${taxFee.toLocaleString('id-ID')}\n`;
    text += `💰 *TOTAL BAYAR:* *Rp ${grandTotal.toLocaleString('id-ID')}*\n`;
    text += `-------------------------------------------\n`;
    text += `📝 *Catatan Khusus:* _${notes}_\n\n`;
    text += `Mohon segera diproses untuk pengantaran. Terima kasih! 🙏`;

    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${targetPhone}?text=${encodedText}`;

    window.open(waUrl, '_blank');
    showToast("Membuka WhatsApp F&B Hotel...", "success");
}

// PAGE & NAVIGATION SWITCHER
function switchPage(pageId) {
    const pIndex = document.getElementById('page-index');
    const pCart = document.getElementById('page-cart');
    const pAdmin = document.getElementById('page-admin');

    if (pIndex) pIndex.classList.add('hidden');
    if (pCart) pCart.classList.add('hidden');
    if (pAdmin) pAdmin.classList.add('hidden');

    if (pageId === 'index' && pIndex) pIndex.classList.remove('hidden');
    if (pageId === 'cart' && pCart) {
        pCart.classList.remove('hidden');
        updateCartUI();
    }
    if (pageId === 'admin' && pAdmin) {
        if (sessionStorage.getItem('dailyinn_admin_logged') === 'true') {
            pAdmin.classList.remove('hidden');
            renderAdminTable();
        } else {
            openAdminLoginModal();
            if (pIndex) pIndex.classList.remove('hidden');
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FILTER & SEARCH LOGIC
function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.dataset.cat === cat) {
            btn.className = "cat-btn border-b-2 border-gold-500 text-gold-400 font-semibold px-4 py-2.5 text-xs md:text-sm whitespace-nowrap transition";
        } else {
            btn.className = "cat-btn border-b-2 border-transparent text-slate-400 hover:text-slate-200 px-4 py-2.5 text-xs md:text-sm whitespace-nowrap transition";
        }
    });
    renderProducts();
}

function toggleTagFilter(tag) {
    currentTag = tag;
    document.querySelectorAll('.tag-filter-btn').forEach(btn => {
        if (btn.dataset.tag === tag) {
            btn.className = "tag-filter-btn active px-3.5 py-1.5 rounded-xl border border-slate-700 bg-gold-600 text-black font-semibold whitespace-nowrap transition";
        } else {
            btn.className = "tag-filter-btn px-3.5 py-1.5 rounded-xl border border-slate-700 bg-darknavy-900 text-slate-300 hover:border-gold-500 whitespace-nowrap transition";
        }
    });
    renderProducts();
}

function filterMenu() {
    const input = document.getElementById('search-input');
    if (input) {
        searchQuery = input.value;
        renderProducts();
    }
}

function resetFilters() {
    searchQuery = '';
    const input = document.getElementById('search-input');
    if (input) input.value = '';
    setCategory('all');
    toggleTagFilter('all');
}

// LOCATION & ORDER MODE SELECTION
function setOrderingMode(mode) {
    orderMode = mode;
    const btnRoom = document.getElementById('btn-mode-room');
    const btnTable = document.getElementById('btn-mode-table');
    const labelLoc = document.getElementById('location-input-label');

    if (mode === 'room') {
        if (btnRoom) btnRoom.className = "px-4 py-2 rounded-xl font-semibold bg-gold-600 text-black shadow-md transition";
        if (btnTable) btnTable.className = "px-4 py-2 rounded-xl text-slate-400 font-medium hover:text-slate-200 transition";
        if (labelLoc) labelLoc.innerText = "No. Kamar:";
    } else {
        if (btnTable) btnTable.className = "px-4 py-2 rounded-xl font-semibold bg-gold-600 text-black shadow-md transition";
        if (btnRoom) btnRoom.className = "px-4 py-2 rounded-xl text-slate-400 font-medium hover:text-slate-200 transition";
        if (labelLoc) labelLoc.innerText = "No. Meja:";
    }
    updateLocationSummary();
}

function updateLocationValue(val) {
    locationNo = val || "304";
    const headerDisp = document.getElementById('header-location-display');
    if (headerDisp) {
        headerDisp.innerText = orderMode === 'room' ? `Kamar: ${locationNo}` : `Meja: ${locationNo}`;
    }
    updateLocationSummary();
}

function updateLocationSummary() {
    const summary = document.getElementById('cart-location-summary');
    if (summary) {
        const label = orderMode === 'room' ? 'Room Service' : 'Resto';
        summary.innerText = `Hotel Daily Inn - ${label} (${locationNo})`;
    }
}

function focusLocationInput() {
    switchPage('index');
    const input = document.getElementById('input-location-no');
    if (input) input.focus();
}

// LOGO CLICK (DOUBLE CLICK TRIGGER) FOR ADMIN ACCESS
function handleLogoClick() {
    const now = new Date().getTime();
    if (now - lastLogoClick < 400) {
        openAdminLoginModal();
    }
    lastLogoClick = now;
}

// FOOTER / HIDDEN STAFF ACCESS BUTTON CLICK HANDLER
function handleAdminNavClick() {
    if (sessionStorage.getItem('dailyinn_admin_logged') === 'true') {
        switchPage('admin');
    } else {
        openAdminLoginModal();
    }
}

function updateAdminNavBtnUI() {
    const isLoggedIn = sessionStorage.getItem('dailyinn_admin_logged') === 'true';
    const btnText = document.getElementById('admin-btn-text');
    if (btnText) {
        btnText.innerText = isLoggedIn ? "Dashboard Admin" : "Staff Access";
    }
}

// ADMIN LOGIN MODAL HANDLERS
function openAdminLoginModal() {
    if (sessionStorage.getItem('dailyinn_admin_logged') === 'true') {
        switchPage('admin');
        return;
    }
    const modal = document.getElementById('modal-admin-login');
    if (modal) modal.classList.remove('hidden');
}

function closeAdminLoginModal() {
    const modal = document.getElementById('modal-admin-login');
    const err = document.getElementById('login-error-msg');
    if (modal) modal.classList.add('hidden');
    if (err) err.classList.add('hidden');
}

function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user-input').value;
    const pass = document.getElementById('admin-pass-input').value;
    const err = document.getElementById('login-error-msg');

    if (user === 'admin' && pass === 'admin123') {
        sessionStorage.setItem('dailyinn_admin_logged', 'true');
        closeAdminLoginModal();
        updateAdminNavBtnUI();
        switchPage('admin');
        showToast("Berhasil masuk ke Admin Panel!", "success");
    } else {
        if (err) err.classList.remove('hidden');
    }
}

function handleAdminLogout() {
    sessionStorage.removeItem('dailyinn_admin_logged');
    updateAdminNavBtnUI();
    switchPage('index');
    showToast("Telah logout dari Admin Panel", "info");
}

// ADMIN CRUD MENU MANAGEMENT
function renderAdminTable() {
    const tbody = document.getElementById('admin-menu-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    menuItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-darknavy-900/50 transition";

        let tagsStr = item.tags ? item.tags.join(', ') : '-';
        const statusBadge = item.available ? 
            '<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Tersedia</span>' :
            '<span class="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Habis</span>';

        tr.innerHTML = `
            <td class="p-4">
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" class="w-10 h-10 rounded-lg object-cover" onerror="this.src='https://placehold.co/100x100/111827/f59e0b?text=Food'">
                    <div>
                        <span class="font-bold text-slate-100 block">${item.name}</span>
                        <span class="text-[10px] text-slate-500 font-mono">ID: #${item.id}</span>
                    </div>
                </div>
            </td>
            <td class="p-4 font-semibold text-slate-300 uppercase text-[10px]">${item.category}</td>
            <td class="p-4 font-mono font-bold text-gold-400">Rp ${item.price.toLocaleString('id-ID')}</td>
            <td class="p-4 text-slate-400 text-[11px]">${tagsStr}</td>
            <td class="p-4">${statusBadge}</td>
            <td class="p-4 text-center">
                <div class="flex items-center justify-center space-x-2">
                    <button onclick="toggleItemStock(${item.id})" class="p-2 rounded-lg bg-darknavy-900 border border-slate-700 text-slate-300 hover:text-gold-400" title="Toggle Status Stok">
                        <i class="fa-solid fa-power-off"></i>
                    </button>
                    <button onclick="openMenuModal('edit', ${item.id})" class="p-2 rounded-lg bg-darknavy-900 border border-slate-700 text-amber-400 hover:bg-amber-500/20" title="Edit Detail">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteMenuItem(${item.id})" class="p-2 rounded-lg bg-darknavy-900 border border-slate-700 text-red-400 hover:bg-red-500/20" title="Hapus Menu">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function toggleItemStock(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        item.available = !item.available;
        saveMenuItemsToStorage();
        renderAdminTable();
        renderProducts();
        showToast(`Status stok <b>${item.name}</b> diperbarui`, "info");
    }
}

function deleteMenuItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        menuItems = menuItems.filter(i => i.id !== itemId);
        saveMenuItemsToStorage();
        renderAdminTable();
        renderProducts();
        showToast(`Menu <b>${item.name}</b> telah dihapus`, "error");
    }
}

function openMenuModal(mode, itemId = null) {
    const modal = document.getElementById('modal-menu-form');
    const title = document.getElementById('modal-menu-title');
    if (!modal) return;

    if (mode === 'add') {
        title.innerText = "Tambah Menu Baru";
        document.getElementById('form-item-id').value = '';
        document.getElementById('form-item-name').value = '';
        document.getElementById('form-item-category').value = 'main';
        document.getElementById('form-item-price').value = '';
        document.getElementById('form-item-image').value = '';
        document.getElementById('form-item-file').value = '';
        document.getElementById('form-item-desc').value = '';
        document.getElementById('form-tag-chef').checked = false;
        document.getElementById('form-tag-halal').checked = true;
        document.getElementById('form-tag-spicy').checked = false;
        document.getElementById('form-item-available').value = "true";
        
        setImageSourceMode('file');
        updateImagePreview('');
    } else if (mode === 'edit' && itemId) {
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;

        title.innerText = "Edit Menu Hidangan";
        document.getElementById('form-item-id').value = item.id;
        document.getElementById('form-item-name').value = item.name;
        document.getElementById('form-item-category').value = item.category;
        document.getElementById('form-item-price').value = item.price;
        document.getElementById('form-item-image').value = item.image || '';
        document.getElementById('form-item-file').value = '';
        document.getElementById('form-item-desc').value = item.description;
        document.getElementById('form-tag-chef').checked = item.tags && item.tags.includes('chef');
        document.getElementById('form-tag-halal').checked = item.tags && item.tags.includes('halal');
        document.getElementById('form-tag-spicy').checked = item.tags && item.tags.includes('spicy');
        document.getElementById('form-item-available').value = item.available ? "true" : "false";

        // Auto detect if current image is Data URL or external link
        if (item.image && item.image.startsWith('data:image')) {
            setImageSourceMode('file');
        } else {
            setImageSourceMode('url');
        }
        updateImagePreview(item.image);
    }

    modal.classList.remove('hidden');
}

// IMAGE SOURCE TOGGLE & PREVIEW HANDLING
function setImageSourceMode(mode) {
    imageSourceMode = mode;
    const tabFolder = document.getElementById('tab-img-folder');
    const tabFile = document.getElementById('tab-img-file');
    const tabUrl = document.getElementById('tab-img-url');

    const boxFolder = document.getElementById('img-folder-input-box');
    const boxFile = document.getElementById('img-file-input-box');
    const boxUrl = document.getElementById('img-url-input-box');

    // Reset active states
    [tabFolder, tabFile, tabUrl].forEach(tab => {
        if(tab) tab.className = "py-1.5 rounded-lg text-[10px] md:text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition";
    });
    [boxFolder, boxFile, boxUrl].forEach(box => {
        if(box) box.classList.add('hidden');
    });

    if (mode === 'folder') {
        if (tabFolder) tabFolder.className = "py-1.5 rounded-lg text-[10px] md:text-[11px] font-semibold bg-gold-600 text-black shadow transition";
        if (boxFolder) boxFolder.classList.remove('hidden');
    } else if (mode === 'file') {
        if (tabFile) tabFile.className = "py-1.5 rounded-lg text-[10px] md:text-[11px] font-semibold bg-gold-600 text-black shadow transition";
        if (boxFile) boxFile.classList.remove('hidden');
    } else {
        if (tabUrl) tabUrl.className = "py-1.5 rounded-lg text-[10px] md:text-[11px] font-semibold bg-gold-600 text-black shadow transition";
        if (boxUrl) boxUrl.classList.remove('hidden');
    }
}

function updateFolderAssetPreview(filename) {
    if (filename && filename.trim() !== '') {
        const fullPath = `./assets/menu/${filename.trim()}`;
        updateImagePreview(fullPath);
    } else {
        updateImagePreview('');
    }
}

function handleImageFileSelect(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            updateImagePreview(currentImageData);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateImagePreview(src) {
    const previewImg = document.getElementById('form-img-preview');
    const placeholder = document.getElementById('form-img-placeholder');
    currentImageData = src;

    if (src && src.trim() !== '') {
        if (previewImg) {
            previewImg.src = src;
            previewImg.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
    } else {
        if (previewImg) previewImg.classList.add('hidden');
        if (placeholder) placeholder.classList.remove('hidden');
    }
}

function handleSaveMenuItem(e) {
    e.preventDefault();
    const idVal = document.getElementById('form-item-id').value;
    const name = document.getElementById('form-item-name').value;
    const category = document.getElementById('form-item-category').value;
    const price = parseInt(document.getElementById('form-item-price').value);
    const description = document.getElementById('form-item-desc').value;

    // Pick Image from active source mode
    let image = currentImageData;
    if (imageSourceMode === 'folder') {
        const filename = document.getElementById('form-item-folder-filename').value.trim();
        image = filename ? `./assets/img/menu/${filename}` : '';
    } else if (imageSourceMode === 'url') {
        image = document.getElementById('form-item-image').value;
    }

    if (!image || image.trim() === '') {
        image = 'https://placehold.co/600x400/111827/f59e0b?text=Daily+Inn+Menu';
    }

    const tags = [];
    if (document.getElementById('form-tag-chef').checked) tags.push('chef');
    if (document.getElementById('form-tag-halal').checked) tags.push('halal');
    if (document.getElementById('form-tag-spicy').checked) tags.push('spicy');

    const available = document.getElementById('form-item-available').value === "true";

    if (idVal) {
        // EDIT EXISTING
        const item = menuItems.find(i => i.id === parseInt(idVal));
        if (item) {
            item.name = name;
            item.category = category;
            item.price = price;
            item.image = image;
            item.description = description;
            item.tags = tags;
            item.available = available;
        }
    } else {
        // ADD NEW
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
        menuItems.push({ id: newId, name, category, price, image, description, tags, available });
    }

    saveMenuItemsToStorage();
    closeMenuModal();
    renderAdminTable();
    renderProducts();
    showToast("Perubahan data menu berhasil disimpan!", "success");
}

function saveMenuItemsToStorage() {
    localStorage.setItem('dailyinn_menu', JSON.stringify(menuItems));
}

function resetDefaultMenuData() {
    menuItems = DEFAULT_MENU;
    localStorage.setItem('dailyinn_menu', JSON.stringify(DEFAULT_MENU));
    renderAdminTable();
    renderProducts();
    showToast("Data menu telah dikembalikan ke standar awal", "info");
}


// Fungsi untuk menutup modal form tambah/edit menu
function closeMenuModal() {
    const modal = document.getElementById('modal-menu-form');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// DETAIL MODAL VIEWER
function openDetailModal(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('detail-modal-img').src = item.image;
    document.getElementById('detail-modal-title').innerText = item.name;
    document.getElementById('detail-modal-price').innerText = "Rp " + item.price.toLocaleString('id-ID');
    document.getElementById('detail-modal-desc').innerText = item.description;

    const tagsContainer = document.getElementById('detail-modal-tags');
    tagsContainer.innerHTML = '';
    if (item.tags) {
        if (item.tags.includes('chef')) tagsContainer.innerHTML += `<span class="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-bold">⭐ Chef Choice</span>`;
        if (item.tags.includes('halal')) tagsContainer.innerHTML += `<span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">Halal</span>`;
        if (item.tags.includes('spicy')) tagsContainer.innerHTML += `<span class="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] px-2 py-0.5 rounded font-bold">🌶️ Pedas</span>`;
    }

    const btnAdd = document.getElementById('detail-modal-add-btn');
    if (item.available && isRestoOpenNow()) {
        btnAdd.disabled = false;
        btnAdd.className = "w-full py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs transition shadow-lg";
        btnAdd.onclick = () => { addToCart(item.id); closeDetailModal(); };
    } else {
        btnAdd.disabled = true;
        btnAdd.className = "w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed";
    }

    document.getElementById('modal-item-detail').classList.remove('hidden');
}

function closeDetailModal() {
    const modal = document.getElementById('modal-item-detail');
    if (modal) modal.classList.add('hidden');
}

// TOAST NOTIFICATION UTILITY SYSTEM
function showToast(message, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let borderClass = "border-gold-500/50";
    let icon = `<i class="fa-solid fa-circle-info text-gold-400"></i>`;

    if (type === 'success') {
        borderClass = "border-emerald-500/50";
        icon = `<i class="fa-solid fa-circle-check text-emerald-400"></i>`;
    } else if (type === 'error') {
        borderClass = "border-red-500/50";
        icon = `<i class="fa-solid fa-triangle-exclamation text-red-400"></i>`;
    }

    toast.className = `glass-panel border ${borderClass} px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs text-slate-100 pointer-events-auto animate-toast`;
    toast.innerHTML = `${icon} <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}