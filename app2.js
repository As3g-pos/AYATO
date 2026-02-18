/* ============ JAYA - Part 2: Dashboard, Products, POS ============ */

// ===== DASHBOARD =====
function renderDashboard() {
    const invoices = loadData('invoices'), products = loadData('products'), customers = loadData('customers');
    const today = new Date().toISOString().split('T')[0];
    const exchanges = loadData('returns') || [];
    const netExchangeDiff = exchanges.filter(r => r.date === today).reduce((s, r) => {
        if (r.diffType === 'to_pay') return s + r.amount;
        if (r.diffType === 'refund') return s - r.amount;
        return s;
    }, 0);
    const todaySales = invoices.filter(i => i.date === today).reduce((s, i) => s + i.total, 0) + netExchangeDiff;
    document.getElementById('statSalesToday').textContent = fmt(todaySales);
    document.getElementById('statOrders').textContent = invoices.length;
    document.getElementById('statCustomers').textContent = customers.length;
    document.getElementById('statProducts').textContent = products.length;
    // Recent sales
    const recent = document.getElementById('recentSalesList');
    recent.innerHTML = invoices.slice(-5).reverse().map(inv => {
        const cust = inv.customerId ? customers.find(c => c.id === inv.customerId) : null;
        return `<div class="recent-item"><div><strong>${inv.id}</strong> - ${cust ? cust.name : 'عميل جديد'}<br><small style="color:var(--text-muted)">${fmtDate(inv.date)}</small></div><span class="amount">${fmt(inv.total)}</span></div>`;
    }).join('') || '<p style="color:var(--text-muted);padding:10px">لا توجد مبيعات</p>';
    // Low stock
    const lowStock = document.getElementById('lowStockList');
    const lowItems = products.filter(p => p.quantity <= 5);
    lowStock.innerHTML = lowItems.map(p => `<div class="recent-item"><span>${p.name} (${p.code})</span><span class="${p.quantity === 0 ? 'stock-warning' : 'stock-ok'}">${p.quantity === 0 ? 'نفد' : p.quantity + ' قطعة'}</span></div>`).join('') || '<p style="color:var(--text-muted);padding:10px">المخزون بحالة جيدة</p>';
    drawSalesChart(); drawTopProductsChart();
}
function drawSalesChart() {
    const canvas = document.getElementById('salesChart'); if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Reset canvas style width to allow parent to shrink if needed for measurement
    canvas.style.width = '100%';
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = 250;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const invoices = loadData('invoices');
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const data = days.map(d => invoices.filter(inv => inv.date === d).reduce((s, inv) => s + inv.total, 0));
    const maxVal = Math.max(...data, 100); // Minimum max value to avoid flat chart
    // Round up max to nice number
    const max = Math.ceil(maxVal / 100) * 100;

    const padding = { top: 40, bottom: 40, left: 50, right: 20 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Draw Grid Lines (Horizontal)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH * i / 4);
        const val = Math.round(max - (max * i / 4));

        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);

        // Axis Labels (Y)
        ctx.fillStyle = '#666';
        ctx.font = '11px Cairo';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Number(val).toLocaleString(), padding.left - 10, y);
    }
    ctx.stroke();

    // Draw Bars
    const barW = (chartW / 7) * 0.6;
    const gap = (chartW / 7) * 0.4;

    data.forEach((v, i) => {
        const barH = (v / max) * chartH;

        // Correct X calculation:
        const slotW = chartW / 7;
        const barX = padding.left + (slotW * i) + (slotW - barW) / 2;
        const barY = h - padding.bottom;

        // Bar Gradient
        const grad = ctx.createLinearGradient(barX, barY - barH, barX, barY);
        grad.addColorStop(0, '#e8c96d');
        grad.addColorStop(1, '#c8902e');

        // Shadow/Glow
        ctx.shadowColor = 'rgba(200, 144, 46, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = grad;

        // Rounded Top Bar
        if (v > 0) {
            ctx.beginPath();
            const r = 6; // radius
            // Ensure height is at least radius*2 for proper rounding, or minimal height
            const drawH = Math.max(barH, r * 2);

            ctx.moveTo(barX, barY);
            ctx.lineTo(barX, barY - drawH + r);
            ctx.quadraticCurveTo(barX, barY - drawH, barX + r, barY - drawH);
            ctx.lineTo(barX + barW - r, barY - drawH);
            ctx.quadraticCurveTo(barX + barW, barY - drawH, barX + barW, barY - drawH + r);
            ctx.lineTo(barX + barW, barY);
            ctx.fill();
        }

        ctx.shadowColor = 'transparent'; // Reset shadow

        // Axis Labels (X)
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '11px Cairo';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const dayName = new Date(days[i]).toLocaleDateString('ar-EG', { weekday: 'long' });
        ctx.fillText(dayName, barX + barW / 2, barY + 12);

        // Value on Top
        if (v > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Cairo';
            ctx.fillText(Number(v).toLocaleString(), barX + barW / 2, barY - Math.max(barH, 12) - 20);
        }
    });
}
function drawTopProductsChart() {
    const canvas = document.getElementById('topProductsChart');
    const legendContainer = document.getElementById('topProductsLegend');
    if (!canvas || !legendContainer) return;

    const ctx = canvas.getContext('2d');
    canvas.style.width = '100%';
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = 220;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const invoices = loadData('invoices');
    const prodSales = {};
    invoices.forEach(inv => inv.items.forEach(it => { prodSales[it.name] = (prodSales[it.name] || 0) + it.qty; }));

    const sorted = Object.entries(prodSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (!sorted.length) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Cairo';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات', w / 2, h / 2);
        legendContainer.innerHTML = '';
        return;
    }

    const colors = ['#c8902e', '#2ecc71', '#e84393', '#a855f7', '#3498db'];
    const total = sorted.reduce((s, e) => s + e[1], 0);
    let startAngle = -Math.PI / 2;
    const cx = w / 2, cy = h / 2;
    const r = 70;
    const thickness = 20;

    // Draw Segments
    sorted.forEach((entry, i) => {
        const slice = (entry[1] / total) * Math.PI * 2;
        const endAngle = startAngle + slice;

        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round'; // rounded ends for a smoother look
        ctx.stroke();

        // Gap between segments if multiple
        if (sorted.length > 1) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, startAngle, startAngle + 0.05);
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim();
            ctx.lineWidth = thickness + 2;
            ctx.stroke();
        }

        startAngle += slice;
    });

    // Inner Text
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    ctx.font = 'bold 24px Cairo';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    ctx.font = '12px Cairo';
    ctx.fillText('منتج', cx, cy + 20);

    // Generate Legend
    legendContainer.innerHTML = sorted.map((entry, i) => `
        <div class="legend-item">
            <span class="legend-color" style="background:${colors[i]}"></span>
            <span>${entry[0]}</span>
            <span style="font-weight:700;color:var(--text-primary)">${entry[1]}</span>
        </div>
    `).join('');
}

// ===== PRODUCTS =====
function renderProducts() {
    const prods = loadData('products'); const search = (document.getElementById('productSearch')?.value || '').toLowerCase();
    const catFilter = document.getElementById('productCategoryFilter')?.value || '';
    const filtered = prods.filter(p => (!search || p.name.includes(search) || p.code.toLowerCase().includes(search)) && (!catFilter || p.category === catFilter));
    updateCategorySelects();
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = filtered.map(p => {
        const badge = p.quantity === 0 ? '<span class="product-card-badge badge-outstock">نفد</span>' : p.quantity <= 5 ? '<span class="product-card-badge badge-lowstock">كمية محدودة</span>' : '<span class="product-card-badge badge-instock">متوفر</span>';
        return `<div class="product-card">
            <div class="product-card-img">${badge}<i class="fas fa-tshirt"></i></div>
            <div class="product-card-body"><h4>${p.name}</h4><span class="category-tag">${p.category}</span>
            <div class="price-row"><span class="price">${fmt(p.salePrice)}</span><span class="stock">${p.quantity} قطعة</span></div></div>
            <div class="product-card-actions">
                <button class="btn-edit" onclick="editProduct(${p.id})" title="تعديل"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})" title="حذف"><i class="fas fa-trash"></i></button>
            </div></div>`;
    }).join('') || '<p style="padding:30px;text-align:center;color:var(--text-muted)">لا توجد منتجات</p>';
}
function updateCategorySelects() {
    const cats = loadData('categories');
    ['productCategoryFilter', 'prodCategory'].forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        const val = el.value;
        el.innerHTML = (id === 'productCategoryFilter' ? '<option value="">كل الفئات</option>' : '') + cats.map(c => `<option value="${c}">${c}</option>`).join('');
        if (val) el.value = val;
    });
}
window.refreshVariantStockInputs = function () {
    const table = document.getElementById('variantInventoryTable');
    const tbody = document.getElementById('variantTableBody');
    const thead = document.getElementById('variantTableHead');
    const selectedSizes = [...document.querySelectorAll('#productForm .size-checkboxes input:checked')].map(cb => cb.value);
    const colorsInput = document.getElementById('prodColors').value;
    const selectedColors = colorsInput.split(',').map(c => c.trim()).filter(c => c);

    if (selectedSizes.length === 0 || selectedColors.length === 0) {
        table.classList.add('hidden');
        return;
    }

    table.classList.remove('hidden');

    // Header: Colors / Sizes
    thead.innerHTML = '<th class="color-col">اللون \\ المقاس</th>' + selectedSizes.map(s => `<th>${s}</th>`).join('');

    // Body: Rows for each color
    tbody.innerHTML = selectedColors.map(color => `
        <tr>
            <td class="color-col">${color}</td>
            ${selectedSizes.map(size => `
                <td>
                    <input type="number" class="variant-stock-input" 
                        data-color="${color}" data-size="${size}" 
                        value="0" min="0">
                </td>
            `).join('')}
        </tr>
    `).join('');

    // Attach listeners
    tbody.querySelectorAll('.variant-stock-input').forEach(input => {
        input.addEventListener('input', updateProdQuantityFromVariants);
    });
    updateProdQuantityFromVariants();
};

function updateProdQuantityFromVariants() {
    const total = [...document.querySelectorAll('.variant-stock-input')].reduce((sum, input) => sum + (+input.value || 0), 0);
    document.getElementById('prodQuantity').value = total;
}

// Color Tag Management
window.addColorTag = function (color) {
    color = color.trim().replace(/,/g, ''); // Remove commas if pasted
    if (!color) return;
    const hiddenInput = document.getElementById('prodColors');
    let colors = hiddenInput.value ? hiddenInput.value.split(',').map(c => c.trim()) : [];

    if (colors.includes(color)) {
        toast('هذا اللون مضاف بالفعل', 'warning');
        return;
    }

    colors.push(color);
    hiddenInput.value = colors.join(', ');
    renderColorTags();
    refreshVariantStockInputs();
};

window.removeColorTag = function (color) {
    const hiddenInput = document.getElementById('prodColors');
    let colors = hiddenInput.value.split(',').map(c => c.trim());
    colors = colors.filter(c => c !== color);
    hiddenInput.value = colors.join(', ');
    renderColorTags();
    refreshVariantStockInputs();
};

function renderColorTags() {
    const container = document.getElementById('colorTagsContainer');
    const hiddenInput = document.getElementById('prodColors');
    const colors = hiddenInput.value ? hiddenInput.value.split(',').map(c => c.trim()) : [];

    container.innerHTML = colors.map(c => `
        <span class="color-tag">
            ${c}
            <i class="fas fa-times" onclick="removeColorTag('${c}')"></i>
        </span>
    `).join('');
}

function initProducts() {
    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productModalTitle').textContent = 'إضافة منتج';
        document.getElementById('productForm').reset();
        document.getElementById('prodId').value = '';
        document.getElementById('prodCode').value = '';
        document.getElementById('variantInventoryTable').classList.add('hidden');

        // Clear color tags
        document.getElementById('colorTagsContainer').innerHTML = '';
        document.getElementById('prodColors').value = '';
        document.getElementById('prodColorsInput').value = '';

        updateCategorySelects(); openModal('productModal');
        setTimeout(() => document.getElementById('prodCode').focus(), 300);
    });

    // Handler for color tags (Enter key)
    document.getElementById('prodColorsInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addColorTag(e.target.value);
            e.target.value = '';
        }
    });

    // Listen for size checkbox changes
    document.querySelectorAll('#productForm .size-checkboxes input').forEach(cb => {
        cb.addEventListener('change', refreshVariantStockInputs);
    });
    document.getElementById('prodColors').addEventListener('input', refreshVariantStockInputs);

    document.getElementById('productForm').addEventListener('submit', e => {
        e.preventDefault();
        const prods = loadData('products');
        const sizes = [...document.querySelectorAll('#productForm .size-checkboxes input:checked')].map(cb => cb.value);

        const variantStock = {};
        document.querySelectorAll('.variant-stock-input').forEach(input => {
            const c = input.dataset.color;
            const s = input.dataset.size;
            if (!variantStock[c]) variantStock[c] = {};
            variantStock[c][s] = +input.value;
        });

        const data = {
            name: document.getElementById('prodName').value,
            code: document.getElementById('prodCode').value,
            category: document.getElementById('prodCategory').value,
            costPrice: +document.getElementById('prodCostPrice').value,
            salePrice: +document.getElementById('prodSalePrice').value,
            quantity: +document.getElementById('prodQuantity').value,
            sizes,
            variantStock,
            colors: document.getElementById('prodColors').value,
            description: document.getElementById('prodDescription').value
        };

        const editId = document.getElementById('prodId').value;
        if (editId) {
            const idx = prods.findIndex(p => p.id == editId);
            if (idx > -1) { prods[idx] = { ...prods[idx], ...data }; }
            toast('تم تعديل المنتج بنجاح');
        }
        else {
            data.id = genId(prods);
            prods.push(data);
            toast('تم إضافة المنتج بنجاح');
        }
        saveData('products', prods); closeModal('productModal'); renderProducts();
    });
    document.getElementById('productSearch').addEventListener('input', renderProducts);
    document.getElementById('productCategoryFilter').addEventListener('change', renderProducts);
}

window.editProduct = function (id) {
    const p = loadData('products').find(x => x.id === id); if (!p) return;
    document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
    document.getElementById('prodId').value = p.id; document.getElementById('prodName').value = p.name;
    document.getElementById('prodCode').value = p.code; document.getElementById('prodCostPrice').value = p.costPrice;
    document.getElementById('prodSalePrice').value = p.salePrice; document.getElementById('prodQuantity').value = p.quantity;
    document.getElementById('prodColors').value = p.colors || '';
    document.getElementById('prodDescription').value = p.description || '';

    renderColorTags(); // New call to show tags

    updateCategorySelects(); document.getElementById('prodCategory').value = p.category;

    // Set size checkboxes
    document.querySelectorAll('#productForm .size-checkboxes input').forEach(cb => {
        cb.checked = (p.sizes || []).includes(cb.value);
    });

    // Render variant stock table
    refreshVariantStockInputs();

    // Fill values from variantStock
    if (p.variantStock) {
        document.querySelectorAll('.variant-stock-input').forEach(input => {
            const c = input.dataset.color;
            const s = input.dataset.size;
            if (p.variantStock[c] && p.variantStock[c][s] !== undefined) {
                input.value = p.variantStock[c][s];
            }
        });
    } else if (p.sizeStock) {
        // Migration: pull from old sizeStock if it exists
        document.querySelectorAll('.variant-stock-input').forEach(input => {
            const s = input.dataset.size;
            if (p.sizeStock[s] !== undefined) {
                input.value = p.sizeStock[s];
            }
        });
    }
    updateProdQuantityFromVariants();

    openModal('productModal');
};
window.deleteProduct = function (id) { if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return; const prods = loadData('products').filter(p => p.id !== id); saveData('products', prods); toast('تم حذف المنتج'); renderProducts(); };

// ===== POS =====
function renderPOS() {
    const prods = loadData('products').filter(p => p.quantity > 0);
    const cats = loadData('categories'); const customers = loadData('customers');
    const search = (document.getElementById('posSearch')?.value || '').toLowerCase();
    // categories
    const posCats = document.getElementById('posCategories');
    posCats.innerHTML = `<button class="pos-cat-btn active" data-cat="">الكل</button>` + cats.map(c => `<button class="pos-cat-btn" data-cat="${c}">${c}</button>`).join('');
    posCats.querySelectorAll('.pos-cat-btn').forEach(btn => btn.addEventListener('click', () => {
        posCats.querySelectorAll('.pos-cat-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
        renderPOSProducts(btn.dataset.cat);
    }));
    renderPOSProducts('');
    // Initial customer list
    renderPOSCustomersList('');
    // Tax
    const settings = loadData('settings');
    document.getElementById('posTaxRate').textContent = settings.taxRate || 0;
    updateCart();
}
function renderPOSProducts(cat) {
    const prods = loadData('products').filter(p => p.quantity > 0);
    const search = (document.getElementById('posSearch')?.value || '').toLowerCase();
    const filtered = prods.filter(p => (!cat || p.category === cat) && (!search || p.name.includes(search) || p.code.toLowerCase().includes(search)));
    document.getElementById('posProductsGrid').innerHTML = filtered.map(p => {
        const isLow = p.quantity <= 5;
        return `
        <div class="pos-product-item" onclick="addToCart(${p.id})">
            <div class="pos-product-img">
                <i class="fas fa-tshirt"></i>
            </div>
            <div class="pos-product-info">
                <h4>${p.name}</h4>
                <div class="price">${fmt(p.salePrice)}</div>
                <div class="stock-tag ${isLow ? 'low' : ''}">
                    ${isLow ? `<i class="fas fa-exclamation-triangle"></i> ` : ''} متبقي: ${p.quantity}
                </div>
            </div>
        </div>`;
    }).join('') || '<p style="padding:30px;text-align:center;color:var(--text-muted);grid-column:1/-1">لا توجد منتجات</p>';
}

function renderPOSCustomersList(query = '') {
    const customers = loadData('customers');
    const filtered = customers.filter(c =>
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
    );
    const custSel = document.getElementById('posCustomerSelect');
    if (!custSel) return;

    const currentVal = custSel.value;
    custSel.innerHTML = '<option value="">عميل جديد</option>' +
        filtered.map(c => `<option value="${c.id}">${c.name} - ${c.phone}</option>`).join('');

    // Restore selection if it still exists in the filtered list
    if (currentVal && filtered.some(c => c.id == currentVal)) {
        custSel.value = currentVal;
    }
}
window.addToCart = function (productId) {
    const p = loadData('products').find(x => x.id === productId); if (!p) return;

    // Check if we already have a selection or if it's a simple product
    const sizes = p.sizes || [];
    const colors = (p.colors || '').split(',').map(s => s.trim()).filter(s => s);

    // Mandatory selection modal
    document.getElementById('selProdId').value = productId;
    document.getElementById('selProdName').textContent = p.name;

    const sizeGrid = document.getElementById('selProdSizes');
    sizeGrid.innerHTML = (sizes.length ? sizes : ['One Size']).map(s => `<button class="sel-btn" onclick="selectAttr(this, 'size')">${s}</button>`).join('');

    const colorGrid = document.getElementById('selProdColors');
    colorGrid.innerHTML = (colors.length ? colors : ['Default Color']).map(c => `<button class="sel-btn" onclick="selectAttr(this, 'color')">${c}</button>`).join('');

    openModal('posSelectionModal');

    // Disable Add button until both selected
    const confirmBtn = document.getElementById('confirmPosAdd');
    confirmBtn.disabled = true;
};

window.selectAttr = function (btn, type) {
    const grid = btn.parentElement;
    grid.querySelectorAll('.sel-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const hasSize = document.querySelector('#selProdSizes .sel-btn.active');
    const hasColor = document.querySelector('#selProdColors .sel-btn.active');
    document.getElementById('confirmPosAdd').disabled = !(hasSize && hasColor);
};

document.getElementById('confirmPosAdd').addEventListener('click', () => {
    const productId = +document.getElementById('selProdId').value;
    const p = loadData('products').find(x => x.id === productId);
    const size = document.querySelector('#selProdSizes .sel-btn.active').textContent;
    const color = document.querySelector('#selProdColors .sel-btn.active').textContent;

    // Calculate max available for this specific size and color
    let maxQty = p.quantity;
    if (p.variantStock && p.variantStock[color] && p.variantStock[color][size] !== undefined) {
        maxQty = p.variantStock[color][size];
    } else if (p.sizeStock && p.sizeStock[size] !== undefined) {
        maxQty = p.sizeStock[size];
    }

    const itemKey = `${productId}-${size}-${color}`;
    const existing = cart.find(c => c.itemKey === itemKey);

    if (existing) {
        if (existing.qty >= maxQty) { toast('الكمية غير متاحة لهذا اللون والمقاس', 'warning'); return; }
        existing.qty++;
    }
    else {
        if (maxQty <= 0) { toast('هذا اللون والمقاس غير متوفر حالياً', 'warning'); return; }
        cart.push({ itemKey, productId, name: p.name, price: p.salePrice, qty: 1, maxQty, size, color });
    }

    closeModal('posSelectionModal');
    updateCart();
    toast(`تمت إضافة ${p.name} (${size}/${color})`);
});

window.removeFromCart = function (itemKey) { cart = cart.filter(c => c.itemKey !== itemKey); updateCart(); };
window.changeQty = function (itemKey, delta) {
    const item = cart.find(c => c.itemKey === itemKey); if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(c => c.itemKey !== itemKey);
    else if (item.qty > item.maxQty) { item.qty = item.maxQty; toast('الكمية غير متاحة', 'warning'); }
    updateCart();
};
function updateCart() {
    const cartDiv = document.getElementById('posCartItems');
    if (cart.length === 0) { cartDiv.innerHTML = '<div class="empty-cart"><i class="fas fa-cart-plus"></i><p>السلة فارغة</p></div>'; }
    else {
        cartDiv.innerHTML = cart.map(c => `<div class="cart-item">
            <div class="cart-item-info">
                <h4>${c.name}</h4>
                <div class="cart-item-meta"><span>${c.size}</span> | <span>${c.color}</span></div>
                <span class="cart-item-price">${fmt(c.price)}</span>
            </div>
            <div class="cart-item-qty"><button onclick="changeQty('${c.itemKey}',-1)">-</button><span>${c.qty}</span><button onclick="changeQty('${c.itemKey}',1)">+</button></div>
            <button class="cart-item-remove" onclick="removeFromCart('${c.itemKey}')"><i class="fas fa-trash"></i></button></div>`).join('');
    }
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    let discountAmount = 0;
    if (appliedDiscount) { discountAmount = appliedDiscount.type === 'percentage' ? subtotal * appliedDiscount.value / 100 : appliedDiscount.value; }
    const settings = loadData('settings'); const taxRate = settings.taxRate || 0;
    const afterDiscount = subtotal - discountAmount; const tax = afterDiscount * taxRate / 100; const total = afterDiscount + tax;
    document.getElementById('posSubtotal').textContent = fmt(subtotal);
    document.getElementById('posDiscount').textContent = '-' + fmt(discountAmount);
    document.getElementById('posDiscountRow').classList.toggle('hidden', discountAmount === 0);
    document.getElementById('posTax').textContent = fmt(tax);
    document.getElementById('posTotal').textContent = fmt(total);

    // Update mobile cart count
    const mobileCount = document.getElementById('mobileCartCount');
    if (mobileCount) {
        mobileCount.textContent = cart.reduce((s, c) => s + c.qty, 0);
    }
}
function processCheckout() {
    if (cart.length === 0) { toast('السلة فارغة', 'warning'); return; }
    const customerId = document.getElementById('posCustomerSelect').value;

    if (!customerId) {
        // Guest checkout - ask for data
        document.getElementById('walkInName').value = '';
        document.getElementById('walkInPhone').value = '';
        openModal('walkInModal');
    } else {
        finalizeCheckout(+customerId);
    }
}

function finalizeCheckout(customerId = null) {
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    let discountAmount = 0;
    if (appliedDiscount) { discountAmount = appliedDiscount.type === 'percentage' ? subtotal * appliedDiscount.value / 100 : appliedDiscount.value; }
    const settings = loadData('settings'); const taxRate = settings.taxRate || 0;
    const afterDiscount = subtotal - discountAmount; const tax = afterDiscount * taxRate / 100; const total = afterDiscount + tax;

    // Create invoice
    const invoice = { id: genInvId(), date: new Date().toISOString().split('T')[0], customerId, items: cart.map(c => ({ itemKey: c.itemKey, productId: c.productId, name: c.name, price: c.price, qty: c.qty, size: c.size, color: c.color })), subtotal, discount: discountAmount, tax, total, paymentMethod: selectedPayment, status: 'completed' };
    const invoices = loadData('invoices'); invoices.push(invoice); saveData('invoices', invoices);

    // Update stock
    console.log('Finalizing stock for cart:', cart);
    const products = loadData('products');
    cart.forEach(c => {
        const p = products.find(x => x.id == c.productId);
        if (p) {
            const oldQty = p.quantity;
            p.quantity = (p.quantity || 0) - c.qty;
            console.log(`Deducting ${c.qty} from ${p.name}. Old: ${oldQty}, New: ${p.quantity}`);

            if (p.variantStock && c.color && c.size) {
                if (p.variantStock[c.color] && p.variantStock[c.color][c.size] !== undefined) {
                    p.variantStock[c.color][c.size] -= c.qty;
                    console.log(`Deducted from variant ${c.color}/${c.size}. New variant stock: ${p.variantStock[c.color][c.size]}`);
                }
            } else if (p.sizeStock && c.size) {
                const cleanSize = String(c.size).trim();
                const sizeKey = Object.keys(p.sizeStock).find(k => k.trim() === cleanSize);
                if (sizeKey !== undefined) {
                    p.sizeStock[sizeKey] -= c.qty;
                    console.log(`Deducted from size ${sizeKey}. New size stock: ${p.sizeStock[sizeKey]}`);
                }
            }
        } else {
            console.warn(`Product not found for ID: ${c.productId}. Search list:`, products.map(x => x.id));
        }
    });
    saveData('products', products);

    // Update customer
    if (customerId) {
        const customers = loadData('customers'); const cust = customers.find(c => c.id === customerId);
        if (cust) { cust.totalPurchases += total; cust.points += Math.floor(total / 100); updateTier(cust); saveData('customers', customers); }
    }

    // Increment nextInvoiceNumber
    settings.nextInvoiceNumber = (settings.nextInvoiceNumber || 1) + 1;
    saveData('settings', settings);

    addNotification(`فاتورة جديدة ${invoice.id} بقيمة ${fmt(total)}`, 'file-invoice');
    toast('تم إتمام البيع بنجاح - ' + invoice.id, 'success');
    showInvoicePrint(invoice);

    // Reset
    cart = []; appliedDiscount = null; document.getElementById('posCouponInput').value = ''; updateCart(); renderPOSProducts('');
}

function initPOS() {
    document.getElementById('posSearch').addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const prods = loadData('products');
        const exactMatch = prods.find(p => p.code === query && p.quantity > 0);

        if (exactMatch) {
            addToCart(exactMatch.id);
            e.target.value = '';
            renderPOSProducts(document.querySelector('.pos-cat-btn.active')?.dataset.cat || '');
            toast(`تمت إضافة: ${exactMatch.name}`);
        } else {
            renderPOSProducts(document.querySelector('.pos-cat-btn.active')?.dataset.cat || '');
        }
    });
    document.getElementById('clearCartBtn').addEventListener('click', () => { cart = []; appliedDiscount = null; document.getElementById('posCouponInput').value = ''; updateCart(); });
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.addEventListener('click', () => { document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active')); opt.classList.add('active'); selectedPayment = opt.dataset.method; });
    });
    document.getElementById('applyCouponBtn').addEventListener('click', () => {
        const code = document.getElementById('posCouponInput').value.trim().toUpperCase();
        if (!code) return;
        const discounts = loadData('discounts'); const today = new Date().toISOString().split('T')[0];
        const disc = discounts.find(d => d.code.toUpperCase() === code && d.start <= today && d.end >= today);
        if (!disc) { toast('الكوبون غير صالح أو منتهي', 'error'); appliedDiscount = null; }
        else {
            const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
            if (disc.minPurchase && subtotal < disc.minPurchase) { toast(`الحد الأدنى للشراء ${fmt(disc.minPurchase)}`, 'warning'); return; }
            appliedDiscount = disc; toast('تم تطبيق الكوبون: ' + disc.name, 'success');
        }
        updateCart();
    });
    document.getElementById('checkoutBtn').addEventListener('click', processCheckout);

    // Walk-in modal listeners
    document.getElementById('skipWalkInBtn').addEventListener('click', () => {
        closeModal('walkInModal');
        finalizeCheckout(null);
    });

    document.getElementById('saveWalkInBtn').addEventListener('click', () => {
        const name = document.getElementById('walkInName').value.trim();
        const phone = document.getElementById('walkInPhone').value.trim();
        const address = document.getElementById('walkInAddress').value.trim();

        if (name && phone) {
            const customers = loadData('customers');
            const newCust = {
                id: genId(customers),
                name,
                phone,
                tier: 'برونز',
                points: 0,
                totalPurchases: 0,
                email: '',
                address,
                notes: 'تمت إضافته من المبيعات'
            };
            customers.push(newCust);
            saveData('customers', customers);
            document.getElementById('walkInName').value = '';
            document.getElementById('walkInPhone').value = '';
            document.getElementById('walkInAddress').value = '';
            closeModal('walkInModal');
            finalizeCheckout(newCust.id);
            toast('تم إضافة العميل الجديد ومتابعة البيع');
        } else {
            toast('يرجى إدخال الاسم ورقم الهاتف أو الضغط على تخطي', 'warning');
        }
    });

    // Customer search listener
    document.getElementById('posCustomerSearch')?.addEventListener('input', (e) => {
        renderPOSCustomersList(e.target.value.trim());
    });
}
