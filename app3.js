/* ============ JAYA - Part 3: Invoices, Customers, Inventory, Employees, Discounts, Returns, Reports, Settings, Init ============ */

// ===== INVOICES =====
function renderInvoices() {
    const invoices = loadData('invoices'), customers = loadData('customers');
    const search = (document.getElementById('invoiceSearch')?.value || '').toLowerCase();
    const dateF = document.getElementById('invoiceDateFilter')?.value || '';
    const filtered = invoices.filter(i => (!search || i.id.toLowerCase().includes(search)) && (!dateF || i.date === dateF));
    document.getElementById('invoicesBody').innerHTML = filtered.reverse().map(inv => {
        const cust = inv.customerId ? customers.find(c => c.id === inv.customerId) : null;
        const pm = { cash: '<i class="fas fa-money-bill-wave"></i> كاش', visa: '<i class="fab fa-cc-visa"></i> فيزا', transfer: '<i class="fas fa-university"></i> تحويل' };
        const status = inv.status === 'completed' ? '<span class="status-badge status-paid">مكتمل</span>' : inv.status === 'pending' ? '<span class="status-badge status-pending">معلق</span>' : '<span class="status-badge status-cancelled">ملغي</span>';
        return `<tr>
            <td><strong>${inv.id}</strong></td>
            <td>${fmtDate(inv.date)}</td>
            <td>${cust ? cust.name : 'عميل جديد'}</td>
            <td><div class="invoice-items-preview" title="${inv.items.map(it => it.name).join('\n')}">${inv.items.length} منتجات</div></td>
            <td><strong>${fmt(inv.total)}</strong></td>
            <td>${pm[inv.paymentMethod] || inv.paymentMethod}</td>
            <td>${status}</td>
            <td class="actions">
                <button class="btn-view" onclick="viewInvoice('${inv.id}')" title="عرض الفاتورة"><i class="fas fa-eye"></i></button>
                <button class="btn-print" onclick="viewInvoice('${inv.id}')" title="طباعة"><i class="fas fa-print"></i></button>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px">لا توجد فواتير</td></tr>';
}
function initInvoices() {
    document.getElementById('invoiceSearch')?.addEventListener('input', renderInvoices);
    document.getElementById('invoiceDateFilter')?.addEventListener('change', renderInvoices);
    document.getElementById('printInvoiceBtn')?.addEventListener('click', () => window.print());
}
window.viewInvoice = function (id) { const inv = loadData('invoices').find(i => i.id === id); if (inv) showInvoicePrint(inv); };
function getReceiptDesign() {
    const s = loadData('settings');
    return {
        align: s.rcptAlign || 'center', titleSize: s.rcptTitleSize || 14, bodySize: s.rcptBodySize || 9,
        padding: s.rcptPadding ?? 5, width: s.rcptWidth || 80,
        showLogo: s.rcptShowLogo !== false, showName: s.rcptShowName !== false,
        showAddr: s.rcptShowAddr !== false, showPhone: s.rcptShowPhone !== false,
        showInvNum: s.rcptShowInvNum !== false, showDate: s.rcptShowDate !== false,
        showCustomer: s.rcptShowCustomer !== false, showPayment: s.rcptShowPayment !== false,
        showTerms: s.rcptShowTerms !== false, showFooter: s.rcptShowFooter !== false,
        effect: s.rcptEffect || 'none', logo: s.rcptLogo || '',
        header: s.invoiceHeader || '', footer: s.invoiceFooter || '\u0634\u0643\u0631\u0627\u064b \u0644\u062a\u0633\u0648\u0642\u0643\u0645',
        terms: s.invoiceTerms || '', storeName: s.storeName || 'JAYA Clothing Store',
        storeAddr: s.storeAddress || '', storePhone: s.storePhone || '',
        centerPrint: s.rcptCenterPrint || false,
        lblProduct: s.rcptLblName || '\u0627\u0644\u0645\u0646\u062a\u062c',
        lblPrice: s.rcptLblPrice || '\u0627\u0644\u0633\u0639\u0631',
        lblQty: s.rcptLblQty || '\u0643',
        lblTotal: s.rcptLblTotal || '\u0627\u0644\u062c\u0645\u0644\u0629'
    };
}
function getReceiptDesignFromUI() {
    const el = id => document.getElementById(id);
    const s = loadData('settings');
    return {
        align: el('rcptAlign')?.value || 'center', titleSize: +(el('rcptTitleSize')?.value || 14),
        bodySize: +(el('rcptBodySize')?.value || 9), padding: +(el('rcptPadding')?.value ?? 5),
        width: +(el('rcptWidth')?.value || 80),
        showLogo: el('rcptShowLogo')?.checked !== false, showName: el('rcptShowName')?.checked !== false,
        showAddr: el('rcptShowAddr')?.checked !== false, showPhone: el('rcptShowPhone')?.checked !== false,
        showInvNum: el('rcptShowInvNum')?.checked !== false, showDate: el('rcptShowDate')?.checked !== false,
        showCustomer: el('rcptShowCustomer')?.checked !== false, showPayment: el('rcptShowPayment')?.checked !== false,
        showTerms: el('rcptShowTerms')?.checked !== false, showFooter: el('rcptShowFooter')?.checked !== false,
        effect: el('rcptEffect')?.value || 'none', logo: s.rcptLogo || '',
        header: el('settInvoiceHeader')?.value || '', footer: el('settInvoiceFooter')?.value || '\u0634\u0643\u0631\u0627\u064b \u0644\u062a\u0633\u0648\u0642\u0643\u0645',
        terms: el('settInvoiceTerms')?.value || '', storeName: s.storeName || 'JAYA Clothing Store',
        storeAddr: s.storeAddress || '', storePhone: s.storePhone || '',
        centerPrint: el('rcptCenterPrint')?.checked || false,
        lblProduct: el('rcptLblName')?.value || '\u0627\u0644\u0645\u0646\u062a\u062c',
        lblPrice: el('rcptLblPrice')?.value || '\u0627\u0644\u0633\u0639\u0631',
        lblQty: el('rcptLblQty')?.value || '\u0643',
        lblTotal: el('rcptLblTotal')?.value || '\u0627\u0644\u062c\u0645\u0644\u0629'
    };
}
function getEffectHTML(effect, position) {
    const pos = position || 'top';
    const starRow = `<div style="text-align:center;margin:4px 0;line-height:1;opacity:0.3;font-size:7pt;letter-spacing:3px;color:#000;">✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦</div>`;
    const crescentRow = `<div style="text-align:center;margin:4px 0;line-height:1;opacity:0.35;font-size:8pt;letter-spacing:5px;color:#000;">☪ ✦ ☪ ✦ ☪</div>`;
    const lanternBorder = `<div style="text-align:center;margin:2px 0;opacity:0.25;font-size:6pt;letter-spacing:2px;color:#000;">╬═══════════════╬</div>`;
    const effects = {
        ramadan: pos === 'top'
            ? `${lanternBorder}${crescentRow}<div style="text-align:center;font-weight:800;font-size:9pt;margin:2px 0;opacity:0.5;">✦ رمضان كريم ✦</div>${starRow}`
            : `${starRow}${lanternBorder}`,
        eid: pos === 'top'
            ? `<div style="text-align:center;margin:4px 0;opacity:0.3;font-size:6pt;letter-spacing:2px;color:#000;">✿ · ✿ · ✿ · ✿ · ✿ · ✿ · ✿</div><div style="text-align:center;font-weight:800;font-size:9pt;margin:2px 0;opacity:0.5;">✦ عيد مبارك ✦</div>${starRow}`
            : `${starRow}<div style="text-align:center;margin:4px 0;opacity:0.3;font-size:6pt;letter-spacing:2px;color:#000;">✿ · ✿ · ✿ · ✿ · ✿ · ✿ · ✿</div>`,
        sale: pos === 'top'
            ? `<div style="text-align:center;margin:4px 0;opacity:0.3;font-size:6pt;letter-spacing:1px;color:#000;">▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸</div><div style="text-align:center;font-weight:900;font-size:10pt;margin:2px 0;border:1px solid rgba(0,0,0,0.2);padding:2px;opacity:0.6;">★ SALE ★</div>${starRow}`
            : `${starRow}<div style="text-align:center;margin:4px 0;opacity:0.3;font-size:6pt;letter-spacing:1px;color:#000;">▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸</div>`,
        winter: pos === 'top'
            ? `<div style="text-align:center;margin:4px 0;opacity:0.2;font-size:7pt;letter-spacing:4px;color:#000;">❅ ❆ ❅ ❆ ❅ ❆ ❅</div>${starRow}`
            : `${starRow}<div style="text-align:center;margin:4px 0;opacity:0.2;font-size:7pt;letter-spacing:4px;color:#000;">❅ ❆ ❅ ❆ ❅ ❆ ❅</div>`
    };
    return effects[effect] || '';
}
function buildReceiptHTML(d, inv, cust) {
    const pm = { cash: '\u0643\u0627\u0634', visa: '\u0641\u064a\u0632\u0627', transfer: '\u062a\u062d\u0648\u064a\u0644' };
    const items = inv ? inv.items : [{ name: '\u0645\u0646\u062a\u062c \u062a\u062c\u0631\u064a\u0628\u064a', price: 500, qty: 1 }];
    const subtotal = inv ? inv.subtotal : 500, discount = inv ? inv.discount : 0, tax = inv ? inv.tax : 0, total = inv ? inv.total : 500;
    const invId = inv ? inv.id : '5', invDate = inv ? fmtDate(inv.date) : fmtDate(new Date().toISOString());
    const custName = cust ? cust.name : 'عميل جديد', payMethod = inv ? (pm[inv.paymentMethod] || inv.paymentMethod) : '\u0643\u0627\u0634';
    const logoSrc = d.logo || 'logo.jpg';
    const topEffect = getEffectHTML(d.effect, 'top');
    const bottomEffect = d.effect !== 'none' ? getEffectHTML(d.effect, 'bottom') : '';
    const marginStyle = d.centerPrint ? 'margin: 0 auto !important;' : 'margin: 0 !important;';
    return `<div style="width:${d.width}mm; max-width: 100%; padding:${d.padding}px; font-family:'Cairo',sans-serif; text-align:${d.align}; font-size:${d.bodySize}pt; direction:rtl; color:#000; background:#fff; box-sizing: border-box; overflow: hidden; ${marginStyle}">
        ${topEffect}
        <div style="border-bottom:1px dashed #000; padding-bottom:8px; margin-bottom:8px; text-align: center;">
            ${d.showLogo && logoSrc ? `<img src="${logoSrc}" alt="Logo" style="max-width: 60mm; max-height: 30mm; filter:grayscale(100%); margin-bottom: 5px;">` : ''}
            ${d.showName ? `<div style="font-size:${d.titleSize}pt; font-weight:800; margin:4px 0;">${d.storeName}</div>` : ''}
            ${d.showAddr && d.storeAddr ? `<div style="font-size:${d.bodySize - 1}pt;">${d.storeAddr}</div>` : ''}
            ${d.showPhone && d.storePhone ? `<div style="font-size:${d.bodySize - 1}pt;">\u0647\u0627\u062a\u0641: ${d.storePhone}</div>` : ''}
            ${d.header ? `<div style="margin-top:4px; font-weight:700; border-top:1px dashed #000; padding-top:4px;">${d.header}</div>` : ''}
        </div>
        <div style="border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:8px; text-align: right;">
            ${d.showInvNum ? `<div><strong>\u0641\u0627\u062a\u0648\u0631\u0629:</strong> ${invId}</div>` : ''}
            ${d.showDate ? `<div><strong>\u0627\u0644\u062a\u0627\u0631\u064a\u062e:</strong> ${invDate}</div>` : ''}
            ${d.showCustomer ? `<div><strong>\u0627\u0644\u0639\u0645\u064a\u0644:</strong> ${custName}</div>` : ''}
            ${d.showPayment ? `<div><strong>\u0627\u0644\u062f\u0641\u0639:</strong> ${payMethod}</div>` : ''}
        </div>
        <table style="width:100%; border-collapse:collapse; margin-bottom:8px; text-align:center; font-size:${d.bodySize}pt; table-layout: fixed;">
            <thead>
                <tr style="border-bottom:1px solid #000; background:#eee;">
                    <th style="padding:4px; width: 40%; text-align: right;">${d.lblProduct}</th>
                    <th style="padding:4px; width: 20%;">${d.lblPrice}</th>
                    <th style="padding:4px; width: 15%;">${d.lblQty}</th>
                    <th style="padding:4px; width: 25%;">${d.lblTotal}</th>
                </tr>
            </thead>
            <tbody>${items.map(it => `<tr style="border-bottom:1px solid #eee;"><td style="padding:4px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${it.name}</td><td style="padding:4px;">${it.price}</td><td style="padding:4px;">${it.qty}</td><td style="padding:4px;">${it.price * it.qty}</td></tr>`).join('')}</tbody>
        </table>
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between;"><span>\u0627\u0644\u0645\u062c\u0645\u0648\u0639:</span><span>${fmt(subtotal)}</span></div>
            ${discount > 0 ? `<div style="display:flex; justify-content:space-between;"><span>\u0627\u0644\u062e\u0635\u0645:</span><span>-${fmt(discount)}</span></div>` : ''}
            ${tax > 0 ? `<div style="display:flex; justify-content:space-between;"><span>\u0627\u0644\u0636\u0631\u064a\u0628\u0629:</span><span>${fmt(tax)}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; border-top:1px solid #000; padding-top:4px; font-size:${d.bodySize + 4}pt; font-weight:800;"><span>\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a:</span><span>${fmt(total)}</span></div>
        </div>
        ${d.showTerms && d.terms ? `<div style="border-top:1px dashed #000; padding-top:5px; font-size:${d.bodySize - 1}pt; white-space:pre-wrap;">${d.terms}</div>` : ''}
        ${d.showFooter ? `<div style="border-top:1px solid #000; padding-top:5px; margin-top:6px; font-weight:700;">${d.footer}</div>` : ''}
        ${bottomEffect}
    </div>`;
}
window.handleLogoUpload = function (e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
        const s = loadData('settings');
        s.rcptLogo = ev.target.result;
        saveData('settings', s);
        updateReceiptPreview();
        toast('\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0634\u0639\u0627\u0631');
    };
    reader.readAsDataURL(file);
};
window.updateReceiptPreview = function () {
    const box = document.getElementById('receiptPreviewBox');
    if (!box) return;
    box.innerHTML = buildReceiptHTML(getReceiptDesignFromUI(), null, null);
};
function showInvoicePrint(inv) {
    const customers = loadData('customers');
    const cust = inv.customerId ? customers.find(c => c.id === inv.customerId) : null;
    const d = getReceiptDesign();
    const content = document.getElementById('invoicePrintContent');
    content.innerHTML = buildReceiptHTML(d, inv, cust);
    openModal('invoicePrintModal');
}

// ===== CUSTOMERS =====
function renderCustomers() {
    const customers = loadData('customers');
    const search = (document.getElementById('customerSearch')?.value || '').toLowerCase();
    const tierF = document.getElementById('customerTierFilter')?.value || '';
    const filtered = customers.filter(c => (!search || c.name.includes(search) || c.phone.includes(search)) && (!tierF || c.tier === tierF));
    document.getElementById('customersBody').innerHTML = filtered.map(c =>
        `<tr><td><strong>${c.name}</strong></td><td>${c.phone}</td><td><span class="loyalty-badge ${getTierClass(c.tier)}"><i class="fas fa-star"></i> ${c.tier}</span></td>
        <td>${c.points}</td><td>${fmt(c.totalPurchases)}</td>
        <td class="actions"><button class="btn-edit" onclick="editCustomer(${c.id})" title="تعديل"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" onclick="deleteCustomer(${c.id})" title="حذف"><i class="fas fa-trash"></i></button></td></tr>`
    ).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px">لا يوجد عملاء</td></tr>';
}
function initCustomers() {
    document.getElementById('addCustomerBtn').addEventListener('click', () => {
        document.getElementById('customerModalTitle').textContent = 'إضافة عميل'; document.getElementById('customerForm').reset(); document.getElementById('custId').value = '';
        openModal('customerModal');
    });
    document.getElementById('customerForm').addEventListener('submit', e => {
        e.preventDefault(); const custs = loadData('customers');
        const data = { name: document.getElementById('custName').value, phone: document.getElementById('custPhone').value, email: document.getElementById('custEmail').value, address: document.getElementById('custAddress').value, notes: document.getElementById('custNotes').value };
        const editId = document.getElementById('custId').value;
        if (editId) { const idx = custs.findIndex(c => c.id == editId); if (idx > -1) { custs[idx] = { ...custs[idx], ...data }; } toast('تم تعديل العميل'); }
        else { data.id = genId(custs); data.points = 0; data.totalPurchases = 0; data.tier = 'برونز'; custs.push(data); toast('تم إضافة العميل'); }
        saveData('customers', custs); closeModal('customerModal'); renderCustomers();
    });
    document.getElementById('customerSearch')?.addEventListener('input', renderCustomers);
    document.getElementById('customerTierFilter')?.addEventListener('change', renderCustomers);
}
window.editCustomer = function (id) {
    const c = loadData('customers').find(x => x.id === id); if (!c) return;
    document.getElementById('customerModalTitle').textContent = 'تعديل العميل'; document.getElementById('custId').value = c.id;
    document.getElementById('custName').value = c.name; document.getElementById('custPhone').value = c.phone;
    document.getElementById('custEmail').value = c.email || ''; document.getElementById('custAddress').value = c.address || '';
    document.getElementById('custNotes').value = c.notes || ''; openModal('customerModal');
};
window.deleteCustomer = function (id) { if (!confirm('هل أنت متأكد؟')) return; saveData('customers', loadData('customers').filter(c => c.id !== id)); toast('تم حذف العميل'); renderCustomers(); };

// ===== INVENTORY =====
function renderInventory() {
    const prods = loadData('products');
    const search = (document.getElementById('inventorySearch')?.value || '').toLowerCase();
    const stockF = document.getElementById('inventoryStockFilter')?.value || '';

    let totalItems = 0;
    let totalValueCost = 0;
    let totalValueSale = 0;

    const filtered = prods.filter(p => {
        if (search && !p.name.includes(search) && !p.code.toLowerCase().includes(search)) return false;
        if (stockF === 'low') return p.quantity > 0 && p.quantity <= 5;
        if (stockF === 'out') return p.quantity === 0;
        if (stockF === 'ok') return p.quantity > 5;
        return true;
    });

    document.getElementById('inventoryBody').innerHTML = filtered.map(p => {
        const qty = p.quantity || 0;
        const purchasePrice = p.purchasePrice || 0;
        const salePrice = p.salePrice || 0;
        const totalVal = qty * salePrice;

        totalItems += qty;
        totalValueCost += qty * purchasePrice;
        totalValueSale += totalVal;

        const status = qty === 0 ? '<span class="loyalty-badge" style="background:rgba(231,76,60,0.15);color:#e74c3c">نفد</span>' : qty <= 5 ? '<span class="loyalty-badge" style="background:rgba(232,67,147,0.15);color:#e84393">منخفض</span>' : '<span class="loyalty-badge" style="background:rgba(46,204,113,0.15);color:#2ecc71">متوفر</span>';

        return `<tr>
            <td>${p.code}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>${fmt(purchasePrice)}</td>
            <td>${fmt(salePrice)}</td>
            <td><div style="font-weight:700">${qty}</div></td>
            <td style="color:var(--gold-4); font-weight:700">${fmt(totalVal)}</td>
            <td>${status}</td>
            <td>
                <button class="btn-small" onclick="viewProductStockDetail(${p.id})">
                    <i class="fas fa-list-ul"></i> التفاصيل
                </button>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-muted)">لا توجد نتائج</td></tr>';

    // Update Summary
    if (document.getElementById('invTotalValueCost')) document.getElementById('invTotalValueCost').textContent = fmt(totalValueCost);
    if (document.getElementById('invTotalValueSale')) document.getElementById('invTotalValueSale').textContent = fmt(totalValueSale);
    if (document.getElementById('invTotalItems')) document.getElementById('invTotalItems').textContent = totalItems;
}

window.viewProductStockDetail = function (productId) {
    const products = loadData('products');
    const p = products.find(x => x.id == productId);
    if (!p) return;

    let variantTable = '';
    if (p.variantStock) {
        let rows = '';
        for (const color in p.variantStock) {
            for (const size in p.variantStock[color]) {
                const qty = p.variantStock[color][size];
                if (qty > 0) {
                    rows += `
                        <tr>
                            <td style="padding:10px; border-bottom:1px solid var(--border);">${color}</td>
                            <td style="padding:10px; border-bottom:1px solid var(--border); text-align:center;">${size}</td>
                            <td style="padding:10px; border-bottom:1px solid var(--border); text-align:center; font-weight:700;">${qty}</td>
                            <td style="padding:10px; border-bottom:1px solid var(--border); text-align:center; color:var(--gold-4);">${fmt(qty * p.salePrice)}</td>
                        </tr>`;
                }
            }
        }
        variantTable = `
            <table style="width:100%; border-collapse: collapse; margin-top:15px; background: rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background:var(--bg-secondary); color:var(--gold-3);">
                        <th style="padding:10px; text-align:right;">اللون</th>
                        <th style="padding:10px;">المقاس</th>
                        <th style="padding:10px;">الكمية</th>
                        <th style="padding:10px;">القيمة الإجمالية</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="4" style="text-align:center; padding:20px;">لا يوجد مخزون متاح</td></tr>'}
                </tbody>
            </table>`;
    } else {
        variantTable = '<p style="padding:20px; text-align:center; color:var(--text-muted);">لا توجد تفاصيل ألوان ومقاسات مفعّلة لهذا المنتج.</p>';
    }

    const content = `
    <div style="direction:rtl; text-align:right; font-family:'Cairo';">
        <h2 style="color:var(--gold-3); border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:20px;">
            تفاصيل مخزون المنتج: ${p.name}
        </h2>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin-bottom:20px;">
            <div style="background:var(--bg-secondary); padding:10px; border-radius:8px; border:1px solid var(--border);">
                <small style="color:var(--text-muted)">كود المنتج</small>
                <div style="font-weight:700">${p.code}</div>
            </div>
            <div style="background:var(--bg-secondary); padding:10px; border-radius:8px; border:1px solid var(--border);">
                <small style="color:var(--text-muted)">سعر التكلفة</small>
                <div style="font-weight:700">${fmt(p.purchasePrice || 0)}</div>
            </div>
            <div style="background:var(--bg-secondary); padding:10px; border-radius:8px; border:1px solid var(--border);">
                <small style="color:var(--text-muted)">سعر البيع</small>
                <div style="font-weight:700; color:var(--gold-4)">${fmt(p.salePrice || 0)}</div>
            </div>
            <div style="background:var(--bg-secondary); padding:10px; border-radius:8px; border:1px solid var(--border);">
                <small style="color:var(--text-muted)">إجمالي الكمية</small>
                <div style="font-weight:700">${p.quantity || 0}</div>
            </div>
        </div>

        <h4 style="margin-top:20px;"><i class="fas fa-layer-group"></i> تفاصيل التوفر (اللون والمقاس):</h4>
        ${variantTable}

        <div style="margin-top:30px; text-align:center;">
             <button class="btn-primary" onclick="closeModal('invoicePrintModal')">إغلاق</button>
        </div>
    </div>`;

    document.getElementById('invoicePrintContent').innerHTML = content;
    openModal('invoicePrintModal');
};
function initInventory() {
    document.getElementById('inventorySearch')?.addEventListener('input', renderInventory);
    document.getElementById('inventoryStockFilter')?.addEventListener('change', renderInventory);
}

// ===== EMPLOYEES =====
function renderEmployees() {
    const emps = loadData('employees');
    document.getElementById('employeesGrid').innerHTML = emps.map(e =>
        `<div class="employee-card"><div class="employee-card-top"><div class="employee-avatar">${e.name.charAt(0)}</div><div><h4>${e.name}</h4><p>${e.role}</p></div></div>
        <div class="employee-meta"><span><i class="fas fa-phone"></i> ${e.phone}</span><span><i class="fas fa-money-bill"></i> الراتب: ${fmt(e.salary || 0)}</span>
        <span><i class="fas fa-shield-alt"></i> ${e.permission === 'admin' ? 'مدير' : 'موظف'}</span></div>
        <div class="card-actions"><button class="btn-edit" onclick="editEmployee(${e.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" onclick="deleteEmployee(${e.id})"><i class="fas fa-trash"></i></button></div></div>`
    ).join('') || '<p style="padding:30px;text-align:center;color:var(--text-muted)">لا يوجد موظفين</p>';
}
function initEmployees() {
    document.getElementById('addEmployeeBtn').addEventListener('click', () => {
        document.getElementById('employeeModalTitle').textContent = 'إضافة موظف';
        document.getElementById('employeeForm').reset();
        document.getElementById('empId').value = '';
        if (window.togglePagePerms) window.togglePagePerms();
        openModal('employeeModal');
    });
    document.getElementById('employeeForm').addEventListener('submit', e => {
        e.preventDefault(); const emps = loadData('employees');
        const allowedPages = Array.from(document.querySelectorAll('.empPagePerm:checked')).map(cb => cb.value);
        const data = { name: document.getElementById('empName').value, phone: document.getElementById('empPhone').value, role: document.getElementById('empRole').value, salary: +document.getElementById('empSalary').value, username: document.getElementById('empUsername').value, password: document.getElementById('empPassword').value, permission: document.getElementById('empPermission').value, allowedPages: allowedPages };
        const editId = document.getElementById('empId').value;
        if (editId) { const idx = emps.findIndex(e => e.id == editId); if (idx > -1) { emps[idx] = { ...emps[idx], ...data }; } toast('تم تعديل الموظف'); }
        else { data.id = genId(emps); data.salesCount = 0; emps.push(data); toast('تم إضافة الموظف'); }
        // Update users
        if (data.username && data.password) {
            const users = loadData('users'); const existingU = users.findIndex(u => u.username === data.username);
            if (existingU > -1) { users[existingU].password = data.password; users[existingU].name = data.name; users[existingU].role = data.permission; users[existingU].allowedPages = data.permission === 'admin' ? null : allowedPages; }
            else { users.push({ id: genId(users), username: data.username, password: data.password, name: data.name, role: data.permission, allowedPages: data.permission === 'admin' ? null : allowedPages }); }
            saveData('users', users);
        }
        saveData('employees', emps); closeModal('employeeModal'); renderEmployees();
    });
}
window.editEmployee = function (id) {
    const e = loadData('employees').find(x => x.id === id); if (!e) return;
    document.getElementById('employeeModalTitle').textContent = 'تعديل الموظف'; document.getElementById('empId').value = e.id;
    document.getElementById('empName').value = e.name; document.getElementById('empPhone').value = e.phone;
    document.getElementById('empRole').value = e.role; document.getElementById('empSalary').value = e.salary || '';
    document.getElementById('empUsername').value = e.username || ''; document.getElementById('empPassword').value = '';
    document.getElementById('empPermission').value = e.permission || 'employee';
    // Restore page permissions
    const pages = e.allowedPages || [];
    document.querySelectorAll('.empPagePerm').forEach(cb => { cb.checked = e.permission === 'admin' || pages.includes(cb.value); });
    togglePagePerms();
    openModal('employeeModal');
};
window.togglePagePerms = function () {
    const perm = document.getElementById('empPermission').value;
    const group = document.getElementById('pagePermsGroup');
    if (perm === 'admin') { group.style.display = 'none'; }
    else { group.style.display = 'block'; }
};
window.deleteEmployee = function (id) { if (!confirm('هل أنت متأكد؟')) return; saveData('employees', loadData('employees').filter(e => e.id !== id)); toast('تم حذف الموظف'); renderEmployees(); };

// ===== DISCOUNTS =====
function renderDiscounts() {
    const discs = loadData('discounts'); const today = new Date().toISOString().split('T')[0];
    document.getElementById('discountsGrid').innerHTML = discs.map(d => {
        const active = d.start <= today && d.end >= today;
        return `<div class="discount-card"><div class="discount-icon"><i class="fas fa-tag"></i></div><h4>${d.name}</h4>
        <div class="discount-value">${d.type === 'percentage' ? d.value + '%' : fmt(d.value)}</div>
        <div class="discount-code">${d.code}</div>
        <div class="discount-dates"><i class="fas fa-calendar"></i> ${fmtDate(d.start)} - ${fmtDate(d.end)}</div>
        ${d.minPurchase > 0 ? `<div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px">حد أدنى: ${fmt(d.minPurchase)}</div>` : ''}
        <span class="discount-status ${active ? 'discount-active' : 'discount-expired'}">${active ? 'نشط' : 'منتهي'}</span>
        <div class="card-actions"><button class="btn-edit" onclick="editDiscount(${d.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" onclick="deleteDiscount(${d.id})"><i class="fas fa-trash"></i></button></div></div>`;
    }).join('') || '<p style="padding:30px;text-align:center;color:var(--text-muted)">لا توجد عروض</p>';
}
function initDiscounts() {
    document.getElementById('addDiscountBtn').addEventListener('click', () => {
        document.getElementById('discountModalTitle').textContent = 'إضافة عرض'; document.getElementById('discountForm').reset(); document.getElementById('discId').value = '';
        openModal('discountModal');
    });
    document.getElementById('discountForm').addEventListener('submit', e => {
        e.preventDefault(); const discs = loadData('discounts');
        const data = { name: document.getElementById('discName').value, code: document.getElementById('discCode').value.toUpperCase(), type: document.getElementById('discType').value, value: +document.getElementById('discValue').value, start: document.getElementById('discStart').value, end: document.getElementById('discEnd').value, minPurchase: +document.getElementById('discMinPurchase').value };
        const editId = document.getElementById('discId').value;
        if (editId) { const idx = discs.findIndex(d => d.id == editId); if (idx > -1) { discs[idx] = { ...discs[idx], ...data }; } toast('تم تعديل العرض'); }
        else { data.id = genId(discs); discs.push(data); toast('تم إضافة العرض'); }
        saveData('discounts', discs); closeModal('discountModal'); renderDiscounts();
    });
}
window.editDiscount = function (id) {
    const d = loadData('discounts').find(x => x.id === id); if (!d) return;
    document.getElementById('discountModalTitle').textContent = 'تعديل العرض'; document.getElementById('discId').value = d.id;
    document.getElementById('discName').value = d.name; document.getElementById('discCode').value = d.code;
    document.getElementById('discType').value = d.type; document.getElementById('discValue').value = d.value;
    document.getElementById('discStart').value = d.start; document.getElementById('discEnd').value = d.end;
    document.getElementById('discMinPurchase').value = d.minPurchase || 0; openModal('discountModal');
};
window.deleteDiscount = function (id) { if (!confirm('هل أنت متأكد؟')) return; saveData('discounts', loadData('discounts').filter(d => d.id !== id)); toast('تم حذف العرض'); renderDiscounts(); };

// ===== EXCHANGES (Replaced Returns) =====
function renderReturns() {
    const exchanges = loadData('returns') || [];
    document.getElementById('returnsBody').innerHTML = exchanges.map(r =>
        `<tr>
            <td>${r.id}</td>
            <td><span class="badge" style="background:var(--gold-2);color:#000">استبدال</span></td>
            <td>${r.invoiceId}</td>
            <td>${r.oldProduct.name}</td>
            <td>${r.oldProduct.color || '-'}</td>
            <td>${r.oldProduct.size || '-'}</td>
            <td>${r.oldProduct.qty}</td>
            <td>${fmtDate(r.date)}</td>
            <td>${fmt(r.amount)} (${r.diffType === 'to_pay' ? 'مدفوع' : r.diffType === 'refund' ? 'مسترد' : 'متساوي'})</td>
            <td>
                <button class="btn-small" onclick="viewExchangeDetail('${r.id}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>`
    ).join('') || '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:30px">لا توجد عمليات استبدال</td></tr>';
}

window.viewExchangeDetail = function (id) {
    const exchanges = loadData('returns') || [];
    const exch = exchanges.find(r => r.id === id);
    if (!exch) return;

    const invoices = loadData('invoices') || [];
    const inv = invoices.find(i => i.id === exch.invoiceId);

    let content = `
    <div style="direction:rtl; text-align:right; font-family:'Cairo';">
        <h2 style="color:var(--gold-3); border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:20px;">
            تفاصيل عملية الاستبدال
        </h2>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
            <div><strong>رقم العملية:</strong> ${exch.id}</div>
            <div><strong>رقم الفاتورة الأصلية:</strong> ${exch.invoiceId}</div>
            <div><strong>التاريخ:</strong> ${fmtDate(exch.date)}</div>
            <div><strong>السياسة:</strong> استبدال فقط</div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background:var(--bg-card); border:1px solid var(--border); padding:15px; border-radius:var(--radius-sm); margin-bottom:20px;">
                <h4 style="margin-bottom:10px;"><i class="fas fa-undo"></i> المنتج المرجع:</h4>
                <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    <div><strong>الاسم:</strong> ${exch.oldProduct.name}</div>
                    <div><strong>اللون:</strong> ${exch.oldProduct.color || '-'}</div>
                    <div><strong>المقاس:</strong> ${exch.oldProduct.size || '-'}</div>
                    <div><strong>الكمية:</strong> ${exch.oldProduct.qty}</div>
                </div>
            </div>

            <div style="background:var(--bg-card); border:2px solid var(--gold-2); padding:15px; border-radius:var(--radius-sm); margin-bottom:20px;">
                <h4 style="margin-bottom:10px; color:var(--gold-3);"><i class="fas fa-plus-circle"></i> المنتج البديل:</h4>
                <div style="padding: 10px; background: rgba(212, 175, 55, 0.1); border-radius: 4px;">
                    <div><strong>الاسم:</strong> ${exch.newProduct.name}</div>
                    <div><strong>اللون:</strong> ${exch.newProduct.color || '-'}</div>
                    <div><strong>المقاس:</strong> ${exch.newProduct.size || '-'}</div>
                    <div><strong>الكمية:</strong> ${exch.newProduct.qty}</div>
                </div>
            </div>
        </div>

        ${inv ? `
        <div style="margin-top: 10px; margin-bottom: 20px;">
            <h4 style="margin-bottom:10px;"><i class="fas fa-file-invoice"></i> محتويات الفاتورة الأصلية (${inv.id}):</h4>
            <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="background: var(--bg-secondary);">
                        <th style="padding:8px; border:1px solid var(--border);">المنتج</th>
                        <th style="padding:8px; border:1px solid var(--border);">اللون</th>
                        <th style="padding:8px; border:1px solid var(--border);">المقاس</th>
                        <th style="padding:8px; border:1px solid var(--border);">السعر</th>
                    </tr>
                </thead>
                <tbody>
                    ${inv.items.map(it => `
                        <tr>
                            <td style="padding:8px; border:1px solid var(--border);">${it.name}</td>
                            <td style="padding:8px; border:1px solid var(--border); text-align:center;">${it.color || '-'}</td>
                            <td style="padding:8px; border:1px solid var(--border); text-align:center;">${it.size || '-'}</td>
                            <td style="padding:8px; border:1px solid var(--border); text-align:center;">${fmt(it.price)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div style="text-align:center; padding:15px; background:var(--bg-secondary); border-radius:var(--radius-sm); font-size:1.2rem;">
            <strong>${exch.diffType === 'to_pay' ? 'فرق السعر المدفوع:' : exch.diffType === 'refund' ? 'المبلغ المسترد للعميل:' : 'إجمالي الاستبدال:'}</strong>
            <span style="color:var(--gold-4); font-weight:800; margin-right:10px;">${fmt(exch.amount)}</span>
        </div>
        
        <div style="margin-top:20px; text-align:center;">
             <button class="btn-primary" onclick="window.print()"><i class="fas fa-print"></i> طباعة فاتورة الاستبدال</button>
        </div>
    </div>
    `;

    document.getElementById('invoicePrintContent').innerHTML = content;
    openModal('invoicePrintModal');
};

function renderReplacementProducts() {
    const prods = loadData('products');
    const select = document.getElementById('exchNewProductId');
    if (!select) return;
    select.innerHTML = prods.map(p => `<option value="${p.id}" data-price="${p.salePrice}">${p.name} (${fmt(p.salePrice)})</option>`).join('');

    select.onchange = () => {
        const p = prods.find(x => x.id == select.value);
        if (p) {
            document.getElementById('exchNewSize').innerHTML = (p.sizes || []).map(s => `<option value="${s}">${s}</option>`).join('');
            const colors = (p.colors || '').split(',').map(c => c.trim()).filter(c => c);
            document.getElementById('exchNewColor').innerHTML = colors.map(c => `<option value="${c}">${c}</option>`).join('') || '<option value="Default">Default</option>';
        }
        calculateExchangeSummary();
    };
    select.onchange();
}

function calculateExchangeSummary() {
    const retProd = document.getElementById('retProductId');
    const retOpt = retProd ? retProd.options[retProd.selectedIndex] : null;
    const retPrice = retOpt ? +retOpt.dataset.price : 0;
    const retQty = +document.getElementById('retQuantity').value || 0;
    const retTotal = retPrice * retQty;

    const newProd = document.getElementById('exchNewProductId');
    const newOpt = newProd ? newProd.options[newProd.selectedIndex] : null;
    const newPrice = newOpt ? +newOpt.dataset.price : 0;
    const newQty = +document.getElementById('exchNewQty').value || 0;
    const newTotal = newPrice * newQty;
    const diff = newTotal - retTotal;

    let summary = '';
    if (diff > 0) summary = `مطلوب دفع فرق: ${fmt(diff)}`;
    else if (diff < 0) summary = `المبلغ المستحق للعميل: ${fmt(Math.abs(diff))}`;
    else summary = `التبديل متساوي السعر (لا يوجد فرق)`;

    const el = document.getElementById('retSummaryText');
    if (el) el.textContent = summary;
}

function initReturns() {
    document.getElementById('addReturnBtn')?.addEventListener('click', () => {
        document.getElementById('returnForm').reset();
        document.getElementById('exchInvoiceDetails').classList.add('hidden');
        document.getElementById('exchWarning').classList.add('hidden');
        const submitBtn = document.querySelector('#returnModal .btn-save');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }

        const invoices = loadData('invoices');
        const exchanges = loadData('returns') || [];
        const filteredInvoices = invoices.filter(inv => !exchanges.some(ex => ex.invoiceId === inv.id));

        document.getElementById('retInvoiceId').innerHTML = '<option value="">اختر فاتورة</option>' +
            filteredInvoices.map(i => `<option value="${i.id}">${i.id} - ${fmt(i.total)}</option>`).join('');
        renderReplacementProducts(); // Init replacement dropdown
        openModal('returnModal');
    });

    ['retQuantity', 'exchNewQty', 'exchNewProductId'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculateExchangeSummary);
    });

    document.getElementById('retInvoiceId')?.addEventListener('change', () => {
        const invId = document.getElementById('retInvoiceId').value;
        const inv = loadData('invoices').find(i => i.id === invId);
        const exchanges = loadData('returns') || [];
        const alreadyExchanged = exchanges.find(r => r.invoiceId === invId);

        const detailsEl = document.getElementById('exchInvoiceDetails');
        const itemsList = document.getElementById('exchInvoiceItemsList');
        const warningEl = document.getElementById('exchWarning');
        const submitBtn = document.querySelector('#returnModal .btn-save');

        if (inv) {
            detailsEl.classList.remove('hidden');
            itemsList.innerHTML = inv.items.map(it => `<div>- ${it.name} | ${it.size || ''} - ${it.color || ''} | ${fmt(it.price)}</div>`).join('');
            document.getElementById('retProductId').innerHTML = inv.items.map(it => `<option value="${it.productId}" data-price="${it.price}" data-name="${it.name}" data-size="${it.size || ''}" data-color="${it.color || ''}">${it.name} [${it.color || ''} / ${it.size || ''}]</option>`).join('');

            if (alreadyExchanged) {
                warningEl.classList.remove('hidden');
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
                submitBtn.style.cursor = 'not-allowed';
            } else {
                warningEl.classList.add('hidden');
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        } else {
            detailsEl.classList.add('hidden');
            warningEl.classList.add('hidden');
            document.getElementById('retProductId').innerHTML = '';
        }
        calculateExchangeSummary();
    });

    document.getElementById('returnForm')?.addEventListener('submit', e => {
        e.preventDefault();
        const exchanges = loadData('returns') || [];
        const invId = document.getElementById('retInvoiceId').value;

        const oldProdSelect = document.getElementById('retProductId');
        const oldProdOpt = oldProdSelect.options[oldProdSelect.selectedIndex];
        if (!oldProdOpt) return;
        const oldPrice = +oldProdOpt.dataset.price;
        const oldQty = +document.getElementById('retQuantity').value;

        const newProdSelect = document.getElementById('exchNewProductId');
        const newProdOpt = newProdSelect.options[newProdSelect.selectedIndex];
        const newProdId = +newProdSelect.value;
        const newProdName = newProdOpt.text.split(' (')[0];
        const newPrice = +newProdOpt.dataset.price;
        const newQty = +document.getElementById('exchNewQty').value;
        const newSize = document.getElementById('exchNewSize').value.trim();
        const newColor = document.getElementById('exchNewColor').value.trim();
        const oldColor = (oldProdOpt.dataset.color || '').trim();
        const oldSize = (oldProdOpt.dataset.size || '').trim();

        const amount = newPrice * newQty - oldPrice * oldQty;

        const exchObj = {
            id: 'EX-' + String(exchanges.length + 1).padStart(3, '0'),
            type: 'exchange',
            invoiceId: invId,
            oldProduct: { id: +oldProdSelect.value, name: oldProdOpt.dataset.name, qty: oldQty, size: oldSize, color: oldColor },
            newProduct: { id: newProdId, name: newProdName, qty: newQty, size: newSize, color: newColor },
            date: new Date().toISOString().split('T')[0],
            amount: Math.abs(amount),
            diffType: amount > 0 ? 'to_pay' : amount < 0 ? 'refund' : 'even'
        };

        exchanges.push(exchObj);
        saveData('returns', exchanges);

        const products = loadData('products');
        const pOld = products.find(p => p.id == exchObj.oldProduct.id);
        if (pOld) {
            pOld.quantity = (pOld.quantity || 0) + oldQty;
            if (pOld.variantStock && oldColor && oldSize) {
                if (!pOld.variantStock[oldColor]) pOld.variantStock[oldColor] = {};
                pOld.variantStock[oldColor][oldSize] = (pOld.variantStock[oldColor][oldSize] || 0) + oldQty;
                console.log(`Restored ${oldQty} to variant ${oldColor}/${oldSize} for product ${pOld.name}`);
            } else if (pOld.sizeStock && oldSize) {
                pOld.sizeStock[oldSize] = (pOld.sizeStock[oldSize] || 0) + oldQty;
            }
        }

        const pNew = products.find(p => p.id == newProdId);
        if (pNew) {
            pNew.quantity = (pNew.quantity || 0) - newQty;
            if (pNew.variantStock && newColor && newSize) {
                if (!pNew.variantStock[newColor]) pNew.variantStock[newColor] = {};
                pNew.variantStock[newColor][newSize] = (pNew.variantStock[newColor][newSize] || 0) - newQty;
                console.log(`Deducted ${newQty} from variant ${newColor}/${newSize} for product ${pNew.name}`);
            } else if (pNew.sizeStock && newSize) {
                pNew.sizeStock[newSize] = (pNew.sizeStock[newSize] || 0) - newQty;
            }
        }
        saveData('products', products);

        toast('تمت عملية الاستبدال بنجاح');
        addNotification(`استبدال ${exchObj.id}`, 'sync-alt');
        closeModal('returnModal');
        renderReturns();
        renderDashboard();
    });
}


// ===== REPORTS =====
function renderReport() {
    const type = document.getElementById('reportType').value;
    const date = document.getElementById('reportDate').value || new Date().toISOString().split('T')[0];
    const invoices = loadData('invoices');
    const returns = loadData('returns') || [];

    let filteredInv = [], filteredRet = [];
    if (type === 'daily') {
        filteredInv = invoices.filter(i => i.date === date);
        filteredRet = returns.filter(r => r.date === date);
    } else if (type === 'weekly') {
        const d = new Date(date); const start = new Date(d); start.setDate(d.getDate() - 7);
        filteredInv = invoices.filter(i => new Date(i.date) >= start && new Date(i.date) <= d);
        filteredRet = returns.filter(r => new Date(r.date) >= start && new Date(r.date) <= d);
    } else {
        const month = date.substring(0, 7);
        filteredInv = invoices.filter(i => i.date.startsWith(month));
        filteredRet = returns.filter(r => r.date.startsWith(month));
    }

    const totalSales = filteredInv.reduce((s, i) => s + i.total, 0);
    const totalItems = filteredInv.reduce((s, i) => s + i.items.reduce((ss, it) => ss + it.qty, 0), 0);

    // Net Exchange Adjustments: Payments (+) and Refunds (-) from swaps
    const netExchangeAdjustment = filteredRet.reduce((s, r) => {
        if (r.diffType === 'to_pay') return s - r.amount; // Customer paid MORE (inverse deduction)
        if (r.diffType === 'refund') return s + r.amount; // Store gave money back (deduction)
        return s;
    }, 0);

    const netSales = totalSales - netExchangeAdjustment;

    document.getElementById('reportStats').innerHTML = `
        <div class="report-stat"><h4>${fmt(totalSales)}</h4><p>إجمالي المبيعات الجديدة</p></div>
        <div class="report-stat"><h4>${filteredInv.length}</h4><p>عدد الفواتير</p></div>
        <div class="report-stat"><h4>${totalItems}</h4><p>قطع مباعة جديدة</p></div>
        <div class="report-stat"><h4>${fmt(netExchangeAdjustment)}</h4><p>صافي تسويات الاستبدال</p></div>
        <div class="report-stat"><h4>${fmt(netSales)}</h4><p>صافي المبيعات النهائي</p></div>`;

    const customers = loadData('customers');
    document.getElementById('reportBody').innerHTML = filteredInv.map(inv => {
        const cust = inv.customerId ? customers.find(c => c.id === inv.customerId) : null;
        return `<tr><td>${inv.id}</td><td>${fmtDate(inv.date)}</td><td>${cust ? cust.name : 'عميل جديد'}</td><td>${inv.items.map(it => it.name).join(', ')}</td><td>${fmt(inv.total)}</td></tr>`;
    }).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">لا توجد بيانات</td></tr>';
    drawReportChart(filteredInv);
}
function drawReportChart(data) {
    const canvas = document.getElementById('reportChart'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); const w = canvas.width = canvas.parentElement.clientWidth - 48; const h = canvas.height = 250;
    ctx.clearRect(0, 0, w, h);
    if (!data.length) { ctx.fillStyle = '#666'; ctx.font = '14px Cairo'; ctx.fillText('لا توجد بيانات', w / 2 - 30, h / 2); return; }
    const grouped = {}; data.forEach(inv => { grouped[inv.date] = (grouped[inv.date] || 0) + inv.total; });
    const labels = Object.keys(grouped).sort(); const values = labels.map(l => grouped[l]);
    const max = Math.max(...values, 1); const barW = Math.min((w - 60) / labels.length, 60); const baseY = h - 30;
    values.forEach((v, i) => {
        const barH = (v / max) * (h - 60); const x = 40 + i * (barW + 8);
        const grad = ctx.createLinearGradient(x, baseY - barH, x, baseY);
        grad.addColorStop(0, '#e8c96d'); grad.addColorStop(1, '#c8902e');
        ctx.fillStyle = grad; ctx.fillRect(x, baseY - barH, barW * 0.8, barH);
        ctx.fillStyle = '#a0a0a0'; ctx.font = '9px Cairo'; ctx.textAlign = 'center';
        ctx.fillText(labels[i].substring(5), x + barW * 0.4, baseY + 14);
    });
}
function initReports() {
    document.getElementById('generateReportBtn').addEventListener('click', renderReport);
    document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('exportReportBtn').addEventListener('click', () => {
        const data = { invoices: loadData('invoices'), products: loadData('products'), customers: loadData('customers'), returns: loadData('returns') };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `jaya-report-${new Date().toISOString().split('T')[0]}.json`; a.click();
        toast('تم تصدير التقرير');
    });
}

// ===== SETTINGS =====
function renderSettings() {
    const settings = loadData('settings'); const cats = loadData('categories');
    document.getElementById('settStoreName').value = settings.storeName || '';
    document.getElementById('settStoreAddress').value = settings.storeAddress || '';
    document.getElementById('settStorePhone').value = settings.storePhone || '';
    document.getElementById('settTaxRate').value = settings.taxRate || 0;
    document.getElementById('settCurrency').value = settings.currency || 'ج.م';
    document.getElementById('settNextInvoiceNumber').value = settings.nextInvoiceNumber || 1;
    document.getElementById('settInvoiceHeader').value = settings.invoiceHeader || '';
    document.getElementById('settInvoiceFooter').value = settings.invoiceFooter || '';
    document.getElementById('settInvoiceTerms').value = settings.invoiceTerms || '';
    document.getElementById('rcptAlign').value = settings.rcptAlign || 'center';
    document.getElementById('rcptTitleSize').value = settings.rcptTitleSize || 14;
    document.getElementById('rcptBodySize').value = settings.rcptBodySize || 9;
    document.getElementById('rcptPadding').value = settings.rcptPadding ?? 5;
    document.getElementById('rcptWidth').value = settings.rcptWidth || 80;
    document.getElementById('rcptShowLogo').checked = settings.rcptShowLogo !== false;
    document.getElementById('rcptShowName').checked = settings.rcptShowName !== false;
    document.getElementById('rcptShowAddr').checked = settings.rcptShowAddr !== false;
    document.getElementById('rcptShowPhone').checked = settings.rcptShowPhone !== false;
    document.getElementById('rcptShowInvNum').checked = settings.rcptShowInvNum !== false;
    document.getElementById('rcptShowDate').checked = settings.rcptShowDate !== false;
    document.getElementById('rcptShowCustomer').checked = settings.rcptShowCustomer !== false;
    document.getElementById('rcptShowPayment').checked = settings.rcptShowPayment !== false;
    document.getElementById('rcptShowTerms').checked = settings.rcptShowTerms !== false;
    document.getElementById('rcptShowFooter').checked = settings.rcptShowFooter !== false;
    document.getElementById('rcptCenterPrint').checked = settings.rcptCenterPrint || false;
    document.getElementById('rcptLblName').value = settings.rcptLblName || '\u0627\u0644\u0645\u0646\u062a\u062c';
    document.getElementById('rcptLblPrice').value = settings.rcptLblPrice || '\u0627\u0644\u0633\u0639\u0631';
    document.getElementById('rcptLblQty').value = settings.rcptLblQty || '\u0643';
    document.getElementById('rcptLblTotal').value = settings.rcptLblTotal || '\u0627\u0644\u062c\u0645\u0644\u0629';
    document.getElementById('rcptEffect').value = settings.rcptEffect || 'none';
    updateReceiptPreview();
    const catList = document.getElementById('categoriesList');
    catList.innerHTML = cats.map((c, i) => `<div class="cat-item"><span>${c}</span><button onclick="deleteCategory(${i})"><i class="fas fa-times"></i></button></div>`).join('');
}
function initSettings() {
    document.getElementById('saveStoreInfoBtn').addEventListener('click', () => {
        const s = loadData('settings'); s.storeName = document.getElementById('settStoreName').value; s.storeAddress = document.getElementById('settStoreAddress').value; s.storePhone = document.getElementById('settStorePhone').value;
        saveData('settings', s); toast('تم حفظ معلومات المحل');
    });
    document.getElementById('saveTaxBtn').addEventListener('click', () => { const s = loadData('settings'); s.taxRate = +document.getElementById('settTaxRate').value; saveData('settings', s); toast('تم حفظ نسبة الضريبة'); });
    document.getElementById('saveCurrencyBtn').addEventListener('click', () => { const s = loadData('settings'); s.currency = document.getElementById('settCurrency').value; saveData('settings', s); toast('تم حفظ العملة'); });
    document.getElementById('saveInvoiceNumBtn').addEventListener('click', () => {
        const s = loadData('settings');
        s.nextInvoiceNumber = +document.getElementById('settNextInvoiceNumber').value;
        saveData('settings', s);
        toast('تم حفظ رقم الفاتورة القادم');
    });
    document.getElementById('saveInvoiceTemplateBtn').addEventListener('click', () => {
        const s = loadData('settings');
        s.invoiceHeader = document.getElementById('settInvoiceHeader').value;
        s.invoiceFooter = document.getElementById('settInvoiceFooter').value;
        s.invoiceTerms = document.getElementById('settInvoiceTerms').value;
        s.rcptAlign = document.getElementById('rcptAlign').value;
        s.rcptTitleSize = +document.getElementById('rcptTitleSize').value;
        s.rcptBodySize = +document.getElementById('rcptBodySize').value;
        s.rcptPadding = +document.getElementById('rcptPadding').value;
        s.rcptWidth = +document.getElementById('rcptWidth').value;
        s.rcptShowLogo = document.getElementById('rcptShowLogo').checked;
        s.rcptShowName = document.getElementById('rcptShowName').checked;
        s.rcptShowAddr = document.getElementById('rcptShowAddr').checked;
        s.rcptShowPhone = document.getElementById('rcptShowPhone').checked;
        s.rcptShowInvNum = document.getElementById('rcptShowInvNum').checked;
        s.rcptShowDate = document.getElementById('rcptShowDate').checked;
        s.rcptShowCustomer = document.getElementById('rcptShowCustomer').checked;
        s.rcptShowPayment = document.getElementById('rcptShowPayment').checked;
        s.rcptShowTerms = document.getElementById('rcptShowTerms').checked;
        s.rcptShowFooter = document.getElementById('rcptShowFooter').checked;
        s.rcptCenterPrint = document.getElementById('rcptCenterPrint').checked;
        s.rcptLblName = document.getElementById('rcptLblName').value;
        s.rcptLblPrice = document.getElementById('rcptLblPrice').value;
        s.rcptLblQty = document.getElementById('rcptLblQty').value;
        s.rcptLblTotal = document.getElementById('rcptLblTotal').value;
        s.rcptEffect = document.getElementById('rcptEffect').value;
        saveData('settings', s);
        toast('تم حفظ تصميم البون');
    });
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        const allData = {}; Object.keys(DEFAULT_DATA).forEach(k => { allData[k] = loadData(k); });
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `jaya-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
        toast('تم تصدير النسخة الاحتياطية');
    });
    document.getElementById('importDataInput').addEventListener('change', e => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader(); reader.onload = ev => {
            try { const data = JSON.parse(ev.target.result); Object.keys(data).forEach(k => saveData(k, data[k])); toast('تم استيراد البيانات بنجاح'); renderDashboard(); }
            catch { toast('خطأ في قراءة الملف', 'error'); }
        }; reader.readAsText(file);
    });
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        const np = document.getElementById('settNewPassword').value, cp = document.getElementById('settConfirmPassword').value;
        if (!np) { toast('أدخل كلمة المرور الجديدة', 'warning'); return; }
        if (np !== cp) { toast('كلمة المرور غير متطابقة', 'error'); return; }
        const users = loadData('users'); const u = users.find(x => x.id === currentUser.id); if (u) { u.password = np; saveData('users', users); toast('تم تغيير كلمة المرور'); }
    });
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        const val = document.getElementById('newCategoryInput').value.trim(); if (!val) return;
        const cats = loadData('categories'); if (cats.includes(val)) { toast('الفئة موجودة بالفعل', 'warning'); return; }
        cats.push(val); saveData('categories', cats); document.getElementById('newCategoryInput').value = ''; renderSettings(); toast('تم إضافة الفئة');
    });

    // Full System Reset
    document.getElementById('resetSystemBtn')?.addEventListener('click', () => {
        if (!confirm('⚠️ تحذير: أنت على وشك حذف كافة بيانات النظام! هل أنت متأكد؟')) return;
        if (!confirm('🚨 تأكيد نهائي: سيتم حذف كافة المنتجات، الفواتير، والعملاء. لا يمكن التراجع عن هذا الإجراء!')) return;

        const resetData = {
            products: [],
            customers: [],
            invoices: [],
            returns: [],
            notifications: []
        };

        const promises = Object.keys(resetData).map(key => {
            return db.ref('store/' + key).set(resetData[key]);
        });

        // Reset next invoice number
        const s = loadData('settings');
        s.nextInvoiceNumber = 1;
        promises.push(db.ref('store/settings').set(s));

        Promise.all(promises).then(() => {
            toast('تم تصفير النظام بنجاح، سيتم إعادة التحميل...');
            setTimeout(() => location.reload(), 2000);
        }).catch(err => {
            console.error('Reset error:', err);
            toast('حدث خطأ أثناء التصفير', 'error');
        });
    });
}
window.deleteCategory = function (idx) {
    const cats = loadData('categories'); cats.splice(idx, 1); saveData('categories', cats); renderSettings();
};

// ===== GLOBAL SEARCH =====
function initGlobalSearch() {
    document.getElementById('globalSearch').addEventListener('input', e => {
        const q = e.target.value.trim().toLowerCase(); if (q.length < 2) return;
        // Search in products
        const prods = loadData('products').filter(p => p.name.includes(q) || p.code.toLowerCase().includes(q));
        if (prods.length) { document.querySelector('[data-page="products"]').click(); document.getElementById('productSearch').value = q; renderProducts(); }
    });
}

// ===== INIT APP =====
function initApp() {
    renderDashboard(); renderNotifications(); checkLowStock(); applyPagePermissions();
}

// ===== DOM READY - FIREBASE ASYNC INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    initParticles(); initLogin(); initNav(); initTheme(); initModals(); initNotifPanel();
    initProducts(); initPOS(); initInvoices(); initCustomers(); initInventory(); initEmployees();
    initDiscounts(); initReturns(); initReports(); initSettings(); initGlobalSearch();

    // Show loading indicator on login button
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات من السحابة...';
    loginBtn.disabled = true;

    // Load all data from Firebase
    try {
        await loadAllFromFirebase();
        listenForChanges();
        loginBtn.innerHTML = '<span>تسجيل الدخول</span><i class="fas fa-arrow-left"></i>';
        loginBtn.disabled = false;
        console.log('✅ Firebase connected - JAYA Cloud System Ready');

        // Check for saved session
        const savedUser = localStorage.getItem('jaya_user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                // Verify user still exists in loaded data
                const users = loadData('users');
                const validUser = users.find(u => u.username === user.username);

                if (validUser) {
                    currentUser = validUser;
                    document.getElementById('loginPage').classList.add('hidden');
                    document.getElementById('mainApp').classList.remove('hidden');
                    document.getElementById('currentUser').textContent = validUser.name;
                    initApp();
                    toast('تم استعادة الجلسة: مرحباً ' + validUser.name);
                } else {
                    localStorage.removeItem('jaya_user'); // Invalid user
                }
            } catch (e) {
                console.error('Session restore error', e);
                localStorage.removeItem('jaya_user');
            }
        }
    } catch (err) {
        console.error('Firebase init error:', err);
        loginBtn.innerHTML = '<span>تسجيل الدخول (بدون اتصال)</span><i class="fas fa-arrow-left"></i>';
        loginBtn.disabled = false;
    }

    // Handle Window Resize for Charts
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const activeLink = document.querySelector('.nav-link.active');
            if (activeLink && activeLink.dataset.page === 'dashboard') {
                renderDashboard(); // Redraws both charts
            }
        }, 250);
    });
});
