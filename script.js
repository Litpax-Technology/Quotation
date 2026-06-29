// ══════════════════════════════════════════════════════
// LITPAX QUOTATION MAKER — script.js
// ══════════════════════════════════════════════════════

// 🔴 Apna GAS deployed URL yahan daalo
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxV1VaKAuoJc0Jpgb1fPbj6ICJ6Qqn8d1i2v5JDvdT3Z-VoDawl3-Kd6ORbk0A6h9OwyQ/exec';

// ── STATE ─────────────────────────────────────────────
let productsData = []; // raw array from sheet
let companyData  = {};
let itemCounter  = 0;
let savedQNo     = null;

// productsData structure (from GAS):
// { category, model, capacityWh, voltage, absoluteRate, perWattRate, unit, hsnCode, description }

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  document.getElementById('navDate').textContent = formatDate(today);
  document.getElementById('docDate').textContent = formatDate(today);
  updateValidTill();

  if (GAS_URL === 'YOUR_GAS_DEPLOYED_URL_HERE') {
    setStatus('demo', 'Demo');
    document.getElementById('demoBanner').style.display = 'block';
    loadDemoData();
    return;
  }
  loadConfig();
});

// ── LOAD FROM GAS ─────────────────────────────────────
function loadConfig() {
  setStatus('', 'Connecting...');
  fetch(`${GAS_URL}?action=getConfig`)
    .then(r => r.json())
    .then(d => {
      if (!d.success) throw new Error(d.message);
      productsData = d.products;
      companyData  = d.company;
      applyCompany();
      hideLoader();
      setStatus('live', 'Live');
      addItem();
    })
    .catch(err => {
      setStatus('error', 'Error');
      document.getElementById('loader').innerHTML = `
        <div class="loader-inner">
          <p style="color:#dc2626;font-weight:700;font-size:15px;margin-bottom:8px">⚠ Load failed</p>
          <p style="color:#64748b;font-size:12px;margin-bottom:16px">${err.message}</p>
          <button onclick="loadConfig()" style="padding:8px 18px;background:#1e1b4b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">Retry</button>
        </div>`;
    });
}

// ── DEMO DATA ──────────────────────────────────────────
function loadDemoData() {
  companyData = {
    'Company Name': 'Litpax Technology Pvt. Ltd.',
    'Address':      'Plot No. 12, Industrial Area, Rohtak, Haryana – 124001',
    'Phone':        '+91 98765 43210',
    'Email':        'sales@litpax.in',
    'GST':          '06XXXXXX1234X1ZX',
    'Website':      'www.litpax.in',
    'Bank Name':    'HDFC Bank',
    'Account No':   'XXXXXXXX1234',
    'IFSC':         'HDFC0001234',
    'Quote Prefix': 'LTX-Q',
  };

  // Products: Category → Model → specs
  productsData = [
    // 2 Wheeler
    { category:'2 Wheeler', model:'LTX-2W-48V-30Ah',  capacityWh:1440, voltage:'48V', absoluteRate:18500,  perWattRate:12.8, unit:'Nos', hsnCode:'85076000', description:'2 Wheeler LFP Battery 48V 30Ah' },
    { category:'2 Wheeler', model:'LTX-2W-60V-30Ah',  capacityWh:1800, voltage:'60V', absoluteRate:22000,  perWattRate:12.2, unit:'Nos', hsnCode:'85076000', description:'2 Wheeler LFP Battery 60V 30Ah' },
    { category:'2 Wheeler', model:'LTX-2W-72V-30Ah',  capacityWh:2160, voltage:'72V', absoluteRate:26500,  perWattRate:12.0, unit:'Nos', hsnCode:'85076000', description:'2 Wheeler LFP Battery 72V 30Ah' },
    // 3 Wheeler
    { category:'3 Wheeler', model:'LTX-3W-48V-60Ah',  capacityWh:2880, voltage:'48V', absoluteRate:36000,  perWattRate:12.5, unit:'Nos', hsnCode:'85076000', description:'3 Wheeler LFP Battery 48V 60Ah' },
    { category:'3 Wheeler', model:'LTX-3W-60V-60Ah',  capacityWh:3600, voltage:'60V', absoluteRate:44000,  perWattRate:12.2, unit:'Nos', hsnCode:'85076000', description:'3 Wheeler LFP Battery 60V 60Ah' },
    { category:'3 Wheeler', model:'LTX-3W-72V-60Ah',  capacityWh:4320, voltage:'72V', absoluteRate:52000,  perWattRate:12.0, unit:'Nos', hsnCode:'85076000', description:'3 Wheeler LFP Battery 72V 60Ah' },
    // Inverter
    { category:'Inverter',  model:'LTX-INV-12V-100Ah', capacityWh:1200, voltage:'12V', absoluteRate:14500,  perWattRate:12.1, unit:'Nos', hsnCode:'85076000', description:'Inverter LFP Battery 12V 100Ah' },
    { category:'Inverter',  model:'LTX-INV-24V-100Ah', capacityWh:2400, voltage:'24V', absoluteRate:28000,  perWattRate:11.7, unit:'Nos', hsnCode:'85076000', description:'Inverter LFP Battery 24V 100Ah' },
    { category:'Inverter',  model:'LTX-INV-48V-100Ah', capacityWh:4800, voltage:'48V', absoluteRate:54000,  perWattRate:11.2, unit:'Nos', hsnCode:'85076000', description:'Inverter LFP Battery 48V 100Ah' },
    // Solar
    { category:'Solar',     model:'LTX-SOL-48V-100Ah', capacityWh:4800, voltage:'48V', absoluteRate:58000,  perWattRate:12.1, unit:'Nos', hsnCode:'85076000', description:'Solar LFP Battery 48V 100Ah' },
    { category:'Solar',     model:'LTX-SOL-48V-200Ah', capacityWh:9600, voltage:'48V', absoluteRate:112000, perWattRate:11.7, unit:'Nos', hsnCode:'85076000', description:'Solar LFP Battery 48V 200Ah' },
    { category:'Solar',     model:'LTX-SOL-96V-100Ah', capacityWh:9600, voltage:'96V', absoluteRate:115000, perWattRate:12.0, unit:'Nos', hsnCode:'85076000', description:'Solar LFP Battery 96V 100Ah' },
    // E-Cycle
    { category:'E-Cycle',   model:'LTX-EC-36V-15Ah',  capacityWh:540,  voltage:'36V', absoluteRate:7500,   perWattRate:13.9, unit:'Nos', hsnCode:'85076000', description:'E-Cycle LFP Battery 36V 15Ah' },
    { category:'E-Cycle',   model:'LTX-EC-48V-15Ah',  capacityWh:720,  voltage:'48V', absoluteRate:9800,   perWattRate:13.6, unit:'Nos', hsnCode:'85076000', description:'E-Cycle LFP Battery 48V 15Ah' },
    { category:'E-Cycle',   model:'LTX-EC-48V-20Ah',  capacityWh:960,  voltage:'48V', absoluteRate:12500,  perWattRate:13.0, unit:'Nos', hsnCode:'85076000', description:'E-Cycle LFP Battery 48V 20Ah' },
  ];

  applyCompany();
  hideLoader();
  addItem();
}

// ── APPLY COMPANY ──────────────────────────────────────
function applyCompany() {
  const name  = companyData['Company Name'] || 'Litpax Technology Pvt. Ltd.';
  const addr  = companyData['Address']  || '';
  const phone = companyData['Phone']    || '';
  const email = companyData['Email']    || '';
  const gst   = companyData['GST']      || '';

  document.getElementById('docCompanyName').textContent = name;
  document.getElementById('docCompanyAddr').innerHTML =
    [addr, phone, email, gst ? `GSTIN: ${gst}` : ''].filter(Boolean).join(' &nbsp;|&nbsp; ');

  // Print sig
  const sigEl = document.getElementById('sigCompany');
  if (sigEl) sigEl.textContent = name;

  // Bank details
  const bank = [
    companyData['Bank Name'],
    companyData['Account No'] ? `A/C: ${companyData['Account No']}` : '',
    companyData['IFSC'] ? `IFSC: ${companyData['IFSC']}` : '',
  ].filter(Boolean).join('  |  ');
  document.getElementById('printBankDetails').textContent = bank;
}

// ── GET UNIQUE CATEGORIES ──────────────────────────────
function getCategories() {
  return [...new Set(productsData.map(p => p.category))];
}

// ── GET MODELS FOR CATEGORY ────────────────────────────
function getModelsForCategory(cat) {
  return productsData.filter(p => p.category === cat);
}

// ── ADD ITEM ROW ───────────────────────────────────────
function addItem() {
  itemCounter++;
  const id = `row_${itemCounter}`;

  const catOptions = getCategories().map(c =>
    `<option value="${c}">${c}</option>`
  ).join('');

  const row = document.createElement('div');
  row.className = 'item-row';
  row.id = id;
  row.innerHTML = `
    <!-- Category -->
    <select class="finput" id="${id}_cat" onchange="onCatChange('${id}')">
      <option value="">— Category —</option>
      ${catOptions}
    </select>

    <!-- Model (populated on category select) -->
    <select class="finput" id="${id}_model" onchange="onModelChange('${id}')" disabled>
      <option value="">— Select category first —</option>
    </select>

    <!-- Capacity (readonly) -->
    <div class="info-pill" id="${id}_cap">—</div>

    <!-- Voltage (readonly) -->
    <div class="info-pill" id="${id}_volt">—</div>

    <!-- Rate mode toggle -->
    <div class="rate-toggle">
      <button type="button" class="rtbtn on" id="${id}_btnAbs"
        onclick="setRateMode('${id}','absolute')">Absolute<br>₹/Unit</button>
      <button type="button" class="rtbtn" id="${id}_btnWatt"
        onclick="setRateMode('${id}','perWatt')">Per Watt<br>₹/Wh</button>
    </div>

    <!-- Qty -->
    <input class="finput" type="number" id="${id}_qty" value="1" min="1"
      oninput="calcRow('${id}')"/>

    <!-- Rate -->
    <input class="finput mono" type="number" id="${id}_rate" placeholder="0.00"
      min="0" step="0.01" oninput="calcRow('${id}')"/>

    <!-- Amount -->
    <div class="amt-cell" id="${id}_amt" data-val="0">₹0.00</div>

    <!-- Delete -->
    <button type="button" class="btn-del" onclick="removeItem('${id}')" title="Remove">✕</button>
  `;

  document.getElementById('itemsList').appendChild(row);
  updateEmpty();
}

// ── ON CATEGORY CHANGE ─────────────────────────────────
function onCatChange(id) {
  const cat   = document.getElementById(`${id}_cat`).value;
  const modelSel = document.getElementById(`${id}_model`);

  // Reset downstream
  document.getElementById(`${id}_cap`).textContent  = '—';
  document.getElementById(`${id}_volt`).textContent = '—';
  document.getElementById(`${id}_rate`).value = '';
  document.getElementById(`${id}_amt`).textContent = '₹0.00';
  document.getElementById(`${id}_amt`).dataset.val  = '0';

  if (!cat) {
    modelSel.innerHTML = '<option value="">— Select category first —</option>';
    modelSel.disabled  = true;
    recalcTotals();
    return;
  }

  const models = getModelsForCategory(cat);
  modelSel.innerHTML = `<option value="">— Select model —</option>` +
    models.map(m => `<option value="${m.model}">${m.model}</option>`).join('');
  modelSel.disabled = false;
  modelSel.focus();
  recalcTotals();
}

// ── ON MODEL CHANGE ────────────────────────────────────
function onModelChange(id) {
  const cat   = document.getElementById(`${id}_cat`).value;
  const model = document.getElementById(`${id}_model`).value;

  if (!model) {
    document.getElementById(`${id}_cap`).textContent  = '—';
    document.getElementById(`${id}_volt`).textContent = '—';
    document.getElementById(`${id}_rate`).value = '';
    calcRow(id);
    return;
  }

  const p = productsData.find(x => x.category === cat && x.model === model);
  if (!p) return;

  document.getElementById(`${id}_cap`).textContent  = p.capacityWh ? `${p.capacityWh} Wh` : '—';
  document.getElementById(`${id}_volt`).textContent = p.voltage || '—';

  // Fill rate based on current mode
  const isWatt = document.getElementById(`${id}_btnWatt`).classList.contains('on');
  document.getElementById(`${id}_rate`).value = isWatt ? p.perWattRate : p.absoluteRate;

  calcRow(id);
}

// ── SET RATE MODE ──────────────────────────────────────
function setRateMode(id, mode) {
  const btnAbs  = document.getElementById(`${id}_btnAbs`);
  const btnWatt = document.getElementById(`${id}_btnWatt`);

  if (mode === 'absolute') {
    btnAbs.classList.add('on');
    btnWatt.classList.remove('on');
  } else {
    btnWatt.classList.add('on');
    btnAbs.classList.remove('on');
  }

  // Refill rate from product
  const cat   = document.getElementById(`${id}_cat`).value;
  const model = document.getElementById(`${id}_model`).value;
  if (cat && model) {
    const p = productsData.find(x => x.category === cat && x.model === model);
    if (p) {
      document.getElementById(`${id}_rate`).value = mode === 'absolute' ? p.absoluteRate : p.perWattRate;
    }
  }
  calcRow(id);
}

// ── CALC ROW ───────────────────────────────────────────
function calcRow(id) {
  const cat   = document.getElementById(`${id}_cat`).value;
  const model = document.getElementById(`${id}_model`).value;
  const qty   = parseFloat(document.getElementById(`${id}_qty`).value)  || 0;
  const rate  = parseFloat(document.getElementById(`${id}_rate`).value) || 0;
  const isWatt = document.getElementById(`${id}_btnWatt`).classList.contains('on');

  let amount = 0;
  if (isWatt && cat && model) {
    const p = productsData.find(x => x.category === cat && x.model === model);
    const capWh = p?.capacityWh || 0;
    amount = qty * rate * capWh;
  } else {
    amount = qty * rate;
  }

  const cell = document.getElementById(`${id}_amt`);
  cell.textContent  = fmtINR(amount);
  cell.dataset.val  = amount;
  recalcTotals();
}

// ── REMOVE ITEM ────────────────────────────────────────
function removeItem(id) {
  const row = document.getElementById(id);
  if (!row) return;
  row.style.opacity    = '0';
  row.style.transition = 'opacity .18s';
  setTimeout(() => { row.remove(); recalcTotals(); updateEmpty(); }, 180);
}

// ── RECALC TOTALS ──────────────────────────────────────
function recalcTotals() {
  let sub = 0;
  document.querySelectorAll('.amt-cell').forEach(el => { sub += parseFloat(el.dataset.val || 0); });

  const gstPct = parseFloat(document.getElementById('gstSelect').value) || 0;
  const gstAmt = sub * gstPct / 100;
  const grand  = sub + gstAmt;

  document.getElementById('subtotalVal').textContent   = fmtINR(sub);
  document.getElementById('gstVal').textContent        = fmtINR(gstAmt);
  document.getElementById('grandTotalVal').textContent = fmtINR(grand);
  document.getElementById('gstPctLabel').textContent   = `${gstPct}%`;
  document.getElementById('amountWords').textContent   = numToWords(Math.round(grand));
}

// ── UPDATE VALID TILL ──────────────────────────────────
function updateValidTill() {
  const days = parseInt(document.getElementById('validityDays').value) || 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  document.getElementById('docValidTill').textContent = formatDate(d);
}

// ── EMPTY STATE ────────────────────────────────────────
function updateEmpty() {
  const hasRows = document.querySelectorAll('.item-row').length > 0;
  document.getElementById('emptyState').style.display = hasRows ? 'none' : 'block';
}

// ── COLLECT ITEMS ──────────────────────────────────────
function collectItems() {
  const rows  = document.querySelectorAll('.item-row');
  const items = [];
  rows.forEach(row => {
    const id    = row.id;
    const cat   = document.getElementById(`${id}_cat`).value;
    const model = document.getElementById(`${id}_model`).value;
    if (!cat || !model) return;

    const p      = productsData.find(x => x.category === cat && x.model === model);
    const qty    = parseFloat(document.getElementById(`${id}_qty`).value)  || 0;
    const rate   = parseFloat(document.getElementById(`${id}_rate`).value) || 0;
    const isWatt = document.getElementById(`${id}_btnWatt`).classList.contains('on');
    const amount = parseFloat(document.getElementById(`${id}_amt`).dataset.val || 0);

    items.push({
      category:   cat,
      model:      model,
      capacityWh: p?.capacityWh || '',
      voltage:    p?.voltage    || '',
      unit:       p?.unit       || 'Nos',
      qty, rate,
      rateType: isWatt ? 'perWatt' : 'absolute',
      amount,
    });
  });
  return items;
}

// ── BUILD PRINT ROWS ───────────────────────────────────
function buildPrintItems(items) {
  const c = document.getElementById('printItemsList');
  c.innerHTML = '';
  items.forEach((item, i) => {
    const rateLabel = item.rateType === 'perWatt'
      ? `${fmtINR(item.rate)}/Wh`
      : fmtINR(item.rate);

    const div = document.createElement('div');
    div.className = 'print-row';
    div.innerHTML = `
      <div>${i + 1}</div>
      <div>${item.category} — ${item.model}</div>
      <div>${item.capacityWh ? item.capacityWh + ' Wh' : '—'}</div>
      <div>${item.voltage || '—'}</div>
      <div class="pr-qty">${item.qty} ${item.unit}</div>
      <div class="pr-rate">${rateLabel}</div>
      <div class="pr-amt">${fmtINR(item.amount)}</div>
    `;
    c.appendChild(div);
  });
}

// ── FILL PRINT TERMS ───────────────────────────────────
function fillPrintTerms() {
  const notes    = document.getElementById('notes').value.trim();
  const validity = document.getElementById('validityDays').value || '30';
  const gstPct   = document.getElementById('gstSelect').value;

  document.getElementById('printTerms').innerHTML = notes
    ? notes.split('\n').filter(l => l.trim()).map(l =>
        `<div>${l.replace(/^[•\-]\s*/, '• ')}</div>`).join('')
    : `<div>• Quotation valid for ${validity} days.</div>
       <div>• GST @ ${gstPct}% as applicable.</div>
       <div>• Payment: 50% advance, balance before dispatch.</div>
       <div>• Delivery: 15–20 working days from order confirmation.</div>`;
}

// ── SAVE QUOTATION ─────────────────────────────────────
function saveQuotation() {
  const name = document.getElementById('custName').value.trim();
  if (!name) { showToast('Customer name required!', 'error'); return; }

  const items = collectItems();
  if (!items.length) { showToast('Kam se kam ek item add karein!', 'error'); return; }

  buildPrintItems(items);
  fillPrintTerms();

  if (GAS_URL === 'YOUR_GAS_DEPLOYED_URL_HERE') {
    savedQNo = 'LTX-Q-DEMO';
    document.getElementById('docQNo').textContent = savedQNo;
    showToast('Demo mode — quotation ready to print!', 'info');
    return;
  }

  const sub   = parseFloat(document.getElementById('subtotalVal').textContent.replace(/[₹,]/g,'')) || 0;
  const gstPc = parseFloat(document.getElementById('gstSelect').value) || 0;
  const gstAm = parseFloat(document.getElementById('gstVal').textContent.replace(/[₹,]/g,'')) || 0;
  const grand = parseFloat(document.getElementById('grandTotalVal').textContent.replace(/[₹,]/g,'')) || 0;

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const payload = {
    customer: {
      name,
      phone:   document.getElementById('custPhone').value,
      email:   document.getElementById('custEmail').value,
      address: document.getElementById('custAddress').value,
      gst:     document.getElementById('custGST').value,
    },
    items, subtotal: sub, gstPercent: gstPc, gstAmount: gstAm, grandTotal: grand,
    notes:        document.getElementById('notes').value,
    validityDays: document.getElementById('validityDays').value,
  };

  fetch(`${GAS_URL}?action=saveQuotation&data=${encodeURIComponent(JSON.stringify(payload))}`)
    .then(r => r.json())
    .then(res => {
      if (!res.success) throw new Error(res.message);
      savedQNo = res.quotationNo;
      document.getElementById('docQNo').textContent = savedQNo;
      showToast(`✅ Saved! ${savedQNo}`, 'success');
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Quotation';
    })
    .catch(err => {
      showToast('❌ ' + err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Quotation';
    });
}

// ── PREVIEW & PRINT ────────────────────────────────────
function previewPrint() {
  const name = document.getElementById('custName').value.trim();
  if (!name) { showToast('Customer name enter karein!', 'error'); return; }
  const items = collectItems();
  if (!items.length) { showToast('Kam se kam ek item add karein!', 'error'); return; }
  buildPrintItems(items);
  fillPrintTerms();
  if (!savedQNo) document.getElementById('docQNo').textContent = 'DRAFT';
  window.print();
}

// ── RESET ──────────────────────────────────────────────
function resetForm() {
  if (!confirm('Form reset karna chahte hain?')) return;
  ['custName','custPhone','custEmail','custGST','custAddress','notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('validityDays').value = '30';
  document.getElementById('itemsList').innerHTML = '';
  document.getElementById('printItemsList').innerHTML = '';
  document.getElementById('docQNo').textContent = 'Auto-generate';
  savedQNo = null; itemCounter = 0;
  recalcTotals(); updateValidTill(); updateEmpty();
  addItem();
}

// ── HELPERS ────────────────────────────────────────────
function hideLoader() {
  const l = document.getElementById('loader');
  l.style.opacity = '0'; l.style.transition = 'opacity .3s';
  setTimeout(() => l.style.display = 'none', 300);
  document.getElementById('app').style.display = 'block';
}

function setStatus(type, label) {
  const el = document.getElementById('navStatus');
  el.className = `nav-status ${type}`;
  document.getElementById('navStatusLabel').textContent = label;
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function fmtINR(n) {
  if (isNaN(n)) return '₹0.00';
  return '₹' + Number(n.toFixed(2)).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = 'toast', 3500);
}

function numToWords(n) {
  if (n === 0) return 'Zero Rupees Only';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function w(num) {
    if (!num) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '') + ' ';
    if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred ' + w(num%100);
    if (num < 100000) return w(Math.floor(num/1000)) + 'Thousand ' + w(num%1000);
    if (num < 10000000) return w(Math.floor(num/100000)) + 'Lakh ' + w(num%100000);
    return w(Math.floor(num/10000000)) + 'Crore ' + w(num%10000000);
  }
  return w(n).trim() + ' Rupees Only';
}
