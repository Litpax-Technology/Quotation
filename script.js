// ═══════════════════════════════════════════════════════════
// LITPAX QUOTATION MAKER — script.js
// ═══════════════════════════════════════════════════════════

// 🔴 STEP 1: Apna deployed GAS URL yahan daalo
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwSZHXISRO_TZ0Qo2yI6Kab2XZ7DO8Wi5BnNZp955BvWpgXq5k9T8w1yfN8k_aO_75AUA/exec';

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
let productsData = [];
let companyData  = {};
let itemCounter  = 0;
let savedQNo     = null;

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Set dates
  const now   = new Date();
  const dated = formatDate(now);
  document.getElementById('topbarDate').textContent = dated;
  document.getElementById('qnoDate').textContent    = dated;
  document.getElementById('printQDate').textContent  = dated;

  if (GAS_URL === 'YOUR_GAS_DEPLOYED_URL_HERE') {
    setStatus('demo', 'Demo Mode');
    document.getElementById('configNotice').style.display = 'flex';
    hideLoader();
    loadDemoData();
    return;
  }

  loadConfig();
});

// ═══════════════════════════════════════════════════════════
// LOAD CONFIG FROM GAS
// ═══════════════════════════════════════════════════════════
function loadConfig() {
  setStatus('', 'Connecting...');
  fetch(`${GAS_URL}?action=getConfig`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) throw new Error(data.message);
      productsData = data.products;
      companyData  = data.company;
      applyCompanyDetails();
      hideLoader();
      setStatus('connected', 'Live');
      addItem();
    })
    .catch(err => {
      setStatus('error', 'Error');
      document.getElementById('loaderScreen').innerHTML = `
        <div class="loader-box">
          <p style="color:#dc2626;font-weight:600;font-size:15px">⚠ Failed to load</p>
          <p style="color:#64748b;font-size:13px;margin-top:4px">${err.message}</p>
          <button class="btn btn-primary btn-sm" style="margin-top:16px" onclick="loadConfig()">Retry</button>
        </div>`;
    });
}

// ═══════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════
function loadDemoData() {
  companyData = {
    'Company Name': 'Litpax Technology Pvt. Ltd.',
    'Address':      'Plot No. 12, Industrial Area\nRohtak, Haryana – 124001',
    'Phone':        '+91 98765 43210',
    'Email':        'sales@litpax.in',
    'GST':          '06XXXXXX1234X1ZX',
    'Website':      'www.litpax.in',
    'Bank Name':    'HDFC Bank',
    'Account No':   'XXXXXXXX1234',
    'IFSC':         'HDFC0001234',
    'Quote Prefix': 'LTX-Q',
  };
  productsData = [
    { batteryType:'LFP 12V 100Ah', capacityWh:1200,  voltage:'12V',  absoluteRate:18000,  perWattRate:15.0,  unit:'Nos', hsnCode:'85076000', description:'LFP Battery Pack 12V 100Ah' },
    { batteryType:'LFP 24V 100Ah', capacityWh:2400,  voltage:'24V',  absoluteRate:34000,  perWattRate:14.2,  unit:'Nos', hsnCode:'85076000', description:'LFP Battery Pack 24V 100Ah' },
    { batteryType:'LFP 48V 100Ah', capacityWh:4800,  voltage:'48V',  absoluteRate:62000,  perWattRate:12.9,  unit:'Nos', hsnCode:'85076000', description:'LFP Battery Pack 48V 100Ah' },
    { batteryType:'LFP 48V 200Ah', capacityWh:9600,  voltage:'48V',  absoluteRate:118000, perWattRate:12.3,  unit:'Nos', hsnCode:'85076000', description:'LFP Battery Pack 48V 200Ah' },
    { batteryType:'LFP 72V 100Ah', capacityWh:7200,  voltage:'72V',  absoluteRate:88000,  perWattRate:12.2,  unit:'Nos', hsnCode:'85076000', description:'LFP Battery Pack 72V 100Ah' },
    { batteryType:'NMC 48V 50Ah',  capacityWh:2400,  voltage:'48V',  absoluteRate:38000,  perWattRate:15.8,  unit:'Nos', hsnCode:'85076000', description:'NMC Battery Pack 48V 50Ah'  },
    { batteryType:'NMC 60V 30Ah',  capacityWh:1800,  voltage:'60V',  absoluteRate:29000,  perWattRate:16.1,  unit:'Nos', hsnCode:'85076000', description:'NMC Battery Pack 60V 30Ah'  },
  ];
  applyCompanyDetails();
  addItem();
}

// ═══════════════════════════════════════════════════════════
// APPLY COMPANY DETAILS
// ═══════════════════════════════════════════════════════════
function applyCompanyDetails() {
  const name  = companyData['Company Name'] || 'Litpax Technology Pvt. Ltd.';
  const addr  = companyData['Address']      || '';
  const phone = companyData['Phone']        || '';
  const email = companyData['Email']        || '';
  const gst   = companyData['GST']          || '';
  const bank  = companyData['Bank Name']    || '';
  const acNo  = companyData['Account No']   || '';
  const ifsc  = companyData['IFSC']         || '';

  document.getElementById('printCompanyName').textContent = name;
  document.getElementById('printCompanyNameFooter').textContent = name;
  document.getElementById('printCompanyAddr').innerHTML =
    [addr, phone, email, gst ? `GSTIN: ${gst}` : ''].filter(Boolean).join('<br>');

  document.getElementById('printBankDetails').textContent =
    [bank, acNo ? `A/C: ${acNo}` : '', ifsc ? `IFSC: ${ifsc}` : ''].filter(Boolean).join('  |  ');
}

// ═══════════════════════════════════════════════════════════
// ADD ITEM ROW
// ═══════════════════════════════════════════════════════════
function addItem() {
  itemCounter++;
  const id = `item_${itemCounter}`;

  const productOptions = productsData.map((p, i) =>
    `<option value="${i}">${p.batteryType}</option>`
  ).join('');

  const row = document.createElement('div');
  row.className = 'item-row';
  row.id = id;
  row.innerHTML = `
    <select class="field-input" id="${id}_product" onchange="onProductChange('${id}')">
      <option value="">— Select Battery Type —</option>
      ${productOptions}
    </select>

    <div class="field-readonly" id="${id}_cap">—</div>

    <div class="field-readonly" id="${id}_volt">—</div>

    <div class="rate-toggle" id="${id}_toggle">
      <button type="button" class="rate-toggle-btn active" id="${id}_btnAbs"
        onclick="setRateType('${id}','absolute')">Absolute<br>₹/Unit</button>
      <button type="button" class="rate-toggle-btn" id="${id}_btnWatt"
        onclick="setRateType('${id}','perWatt')">Per Watt<br>₹/Wh</button>
    </div>

    <input class="field-input" type="number" id="${id}_qty"
      placeholder="Qty" min="1" value="1" oninput="calcRow('${id}')"/>

    <input class="field-input" type="number" id="${id}_rate"
      placeholder="0.00" min="0" step="0.01" oninput="calcRow('${id}')"/>

    <div class="amount-cell" id="${id}_amount" data-val="0">₹0.00</div>

    <button type="button" class="btn-delete" onclick="removeItem('${id}')" title="Remove item">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M2.22 2.22a.75.75 0 011.06 0L8 6.94l4.72-4.72a.75.75 0 111.06 1.06L9.06 8l4.72 4.72a.75.75 0 11-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 11-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 010-1.06z" fill="currentColor"/>
      </svg>
    </button>
  `;

  document.getElementById('itemsList').appendChild(row);
  updateEmptyState();
  document.getElementById(`${id}_product`).focus();
}

// ═══════════════════════════════════════════════════════════
// ON PRODUCT CHANGE
// ═══════════════════════════════════════════════════════════
function onProductChange(id) {
  const idx = document.getElementById(`${id}_product`).value;
  if (idx === '') {
    document.getElementById(`${id}_cap`).textContent  = '—';
    document.getElementById(`${id}_volt`).textContent = '—';
    document.getElementById(`${id}_rate`).value = '';
    calcRow(id);
    return;
  }

  const p = productsData[parseInt(idx)];
  document.getElementById(`${id}_cap`).textContent  = p.capacityWh ? `${p.capacityWh} Wh` : '—';
  document.getElementById(`${id}_volt`).textContent = p.voltage    || '—';

  const isWatt = document.getElementById(`${id}_btnWatt`).classList.contains('active');
  document.getElementById(`${id}_rate`).value = isWatt ? p.perWattRate : p.absoluteRate;
  calcRow(id);
}

// ═══════════════════════════════════════════════════════════
// SET RATE TYPE
// ═══════════════════════════════════════════════════════════
function setRateType(id, type) {
  const btnAbs  = document.getElementById(`${id}_btnAbs`);
  const btnWatt = document.getElementById(`${id}_btnWatt`);

  if (type === 'absolute') {
    btnAbs.classList.add('active');
    btnWatt.classList.remove('active');
  } else {
    btnWatt.classList.add('active');
    btnAbs.classList.remove('active');
  }

  const idx = document.getElementById(`${id}_product`).value;
  if (idx !== '') {
    const p = productsData[parseInt(idx)];
    document.getElementById(`${id}_rate`).value = type === 'absolute' ? p.absoluteRate : p.perWattRate;
  }
  calcRow(id);
}

// ═══════════════════════════════════════════════════════════
// CALC ROW
// ═══════════════════════════════════════════════════════════
function calcRow(id) {
  const idx    = document.getElementById(`${id}_product`).value;
  const qty    = parseFloat(document.getElementById(`${id}_qty`).value)  || 0;
  const rate   = parseFloat(document.getElementById(`${id}_rate`).value) || 0;
  const isWatt = document.getElementById(`${id}_btnWatt`).classList.contains('active');

  let amount = 0;
  if (isWatt && idx !== '') {
    const capWh = productsData[parseInt(idx)]?.capacityWh || 0;
    amount = qty * rate * capWh;
  } else {
    amount = qty * rate;
  }

  const cell = document.getElementById(`${id}_amount`);
  cell.textContent  = formatINR(amount);
  cell.dataset.val  = amount;
  recalcTotals();
}

// ═══════════════════════════════════════════════════════════
// REMOVE ITEM
// ═══════════════════════════════════════════════════════════
function removeItem(id) {
  const row = document.getElementById(id);
  if (row) {
    row.style.opacity = '0';
    row.style.transition = 'opacity 0.2s';
    setTimeout(() => { row.remove(); recalcTotals(); updateEmptyState(); }, 200);
  }
}

// ═══════════════════════════════════════════════════════════
// RECALC TOTALS
// ═══════════════════════════════════════════════════════════
function recalcTotals() {
  let subtotal = 0;
  document.querySelectorAll('.amount-cell').forEach(el => {
    subtotal += parseFloat(el.dataset.val || 0);
  });

  const gstPct = parseFloat(document.getElementById('gstSelect').value) || 0;
  const gstAmt = subtotal * gstPct / 100;
  const grand  = subtotal + gstAmt;

  document.getElementById('subtotalVal').textContent   = formatINR(subtotal);
  document.getElementById('gstVal').textContent        = formatINR(gstAmt);
  document.getElementById('grandTotalVal').textContent = formatINR(grand);
  document.getElementById('printGstLabel').textContent = `(${gstPct}%)`;
  document.getElementById('amountWords').textContent   = numberToWords(Math.round(grand));
}

// ═══════════════════════════════════════════════════════════
// UPDATE EMPTY STATE
// ═══════════════════════════════════════════════════════════
function updateEmptyState() {
  const hasItems = document.querySelectorAll('.item-row').length > 0;
  document.getElementById('emptyState').style.display = hasItems ? 'none' : 'flex';
}

// ═══════════════════════════════════════════════════════════
// COLLECT ITEMS
// ═══════════════════════════════════════════════════════════
function collectItems() {
  const rows  = document.querySelectorAll('.item-row');
  const items = [];
  rows.forEach(row => {
    const id  = row.id;
    const idx = document.getElementById(`${id}_product`).value;
    if (idx === '') return;
    const p      = productsData[parseInt(idx)];
    const qty    = parseFloat(document.getElementById(`${id}_qty`).value)  || 0;
    const rate   = parseFloat(document.getElementById(`${id}_rate`).value) || 0;
    const isWatt = document.getElementById(`${id}_btnWatt`).classList.contains('active');
    const amount = parseFloat(document.getElementById(`${id}_amount`).dataset.val || 0);
    items.push({
      batteryType: p.batteryType,
      capacityWh:  p.capacityWh,
      voltage:     p.voltage,
      hsnCode:     p.hsnCode,
      unit:        p.unit,
      qty, rate,
      rateType: isWatt ? 'perWatt' : 'absolute',
      amount,
    });
  });
  return items;
}

// ═══════════════════════════════════════════════════════════
// BUILD PRINT ITEMS LIST
// ═══════════════════════════════════════════════════════════
function buildPrintItems(items) {
  const container = document.getElementById('printItemsList');
  container.innerHTML = '';
  items.forEach((item, i) => {
    const rateLabel = item.rateType === 'perWatt'
      ? `${formatINR(item.rate)}/Wh`
      : formatINR(item.rate);
    const div = document.createElement('div');
    div.className = 'print-item-row';
    div.innerHTML = `
      <div>${i + 1}</div>
      <div>${item.batteryType}</div>
      <div>${item.capacityWh ? item.capacityWh + ' Wh' : '—'}</div>
      <div>${item.voltage || '—'}</div>
      <div style="font-family:monospace;font-size:11px">${item.hsnCode || '—'}</div>
      <div class="col-qty">${item.qty} ${item.unit}</div>
      <div class="col-rate">${rateLabel}</div>
      <div class="col-amount">${formatINR(item.amount)}</div>
    `;
    container.appendChild(div);
  });
}

// ═══════════════════════════════════════════════════════════
// SAVE QUOTATION
// ═══════════════════════════════════════════════════════════
function saveQuotation() {
  const custName = document.getElementById('custName').value.trim();
  if (!custName) { showToast('Customer name required!', 'error'); return; }

  const items = collectItems();
  if (!items.length) { showToast('Kam se kam ek battery item add karein!', 'error'); return; }

  if (GAS_URL === 'YOUR_GAS_DEPLOYED_URL_HERE') {
    // Demo mode — just assign a demo number
    savedQNo = 'LTX-Q-DEMO';
    document.getElementById('qnoValue').textContent = savedQNo;
    document.getElementById('printQNo').textContent  = savedQNo;
    buildPrintItems(items);
    fillPrintTerms();
    showToast('✅ Demo mode — quotation ready to print!', 'info');
    return;
  }

  const subtotal   = parseAmountText(document.getElementById('subtotalVal').textContent);
  const gstPct     = parseFloat(document.getElementById('gstSelect').value) || 0;
  const gstAmount  = parseAmountText(document.getElementById('gstVal').textContent);
  const grandTotal = parseAmountText(document.getElementById('grandTotalVal').textContent);

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<div class="loader-spinner" style="width:16px;height:16px;border-width:2px;margin-right:6px"></div> Saving...`;

  const payload = {
    customer: {
      name:    custName,
      phone:   document.getElementById('custPhone').value,
      email:   document.getElementById('custEmail').value,
      address: document.getElementById('custAddress').value,
      gst:     document.getElementById('custGST').value,
    },
    items, subtotal, gstPercent: gstPct, gstAmount, grandTotal,
    notes:        document.getElementById('notes').value,
    validityDays: document.getElementById('validityDays').value,
  };

  fetch(`${GAS_URL}?action=saveQuotation&data=${encodeURIComponent(JSON.stringify(payload))}`)
    .then(r => r.json())
    .then(res => {
      if (!res.success) throw new Error(res.message);
      savedQNo = res.quotationNo;
      document.getElementById('qnoValue').textContent = savedQNo;
      document.getElementById('printQNo').textContent  = savedQNo;
      buildPrintItems(items);
      fillPrintTerms();
      showToast(`✅ Saved! Quotation: ${savedQNo}`, 'success');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.75 1A2.75 2.75 0 001 3.75v8.5A2.75 2.75 0 003.75 15h8.5A2.75 2.75 0 0015 12.25V5.56a.75.75 0 00-.22-.53l-3.81-3.81A.75.75 0 0010.44 1H3.75zm0 1.5h6.19l3.56 3.56v7.19c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-8.5c0-.69.56-1.25 1.25-1.25zM8 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/></svg> Save Quotation`;
    })
    .catch(err => {
      showToast('❌ ' + err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.75 1A2.75 2.75 0 001 3.75v8.5A2.75 2.75 0 003.75 15h8.5A2.75 2.75 0 0015 12.25V5.56a.75.75 0 00-.22-.53l-3.81-3.81A.75.75 0 0010.44 1H3.75zm0 1.5h6.19l3.56 3.56v7.19c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-8.5c0-.69.56-1.25 1.25-1.25zM8 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/></svg> Save Quotation`;
    });
}

// ═══════════════════════════════════════════════════════════
// FILL PRINT TERMS
// ═══════════════════════════════════════════════════════════
function fillPrintTerms() {
  const notesVal  = document.getElementById('notes').value.trim();
  const validity  = document.getElementById('validityDays').value || '30';
  const custName  = document.getElementById('custName').value.trim();
  const gstPct    = document.getElementById('gstSelect').value;

  // Valid till date
  const validTill = new Date();
  validTill.setDate(validTill.getDate() + parseInt(validity));
  document.getElementById('printValidTill').textContent = formatDate(validTill);

  // Print customer details in header
  document.getElementById('printTerms').innerHTML = notesVal
    ? notesVal.split('\n').map(l => l ? `<div>• ${l.replace(/^[•\-]\s*/,'')}</div>` : '').join('')
    : `<div>• Quotation valid for ${validity} days from date of issue.</div>
       <div>• GST @ ${gstPct}% applicable as per government norms.</div>
       <div>• Payment: 50% advance, balance before dispatch.</div>
       <div>• Delivery: 15–20 working days from order confirmation.</div>`;
}

// ═══════════════════════════════════════════════════════════
// PREVIEW & PRINT
// ═══════════════════════════════════════════════════════════
function previewPrint() {
  const custName = document.getElementById('custName').value.trim();
  if (!custName) { showToast('Customer name enter karein pehle!', 'error'); return; }

  const items = collectItems();
  if (!items.length) { showToast('Kam se kam ek item add karein!', 'error'); return; }

  // Build print items even without saving
  buildPrintItems(items);
  fillPrintTerms();

  if (!savedQNo) {
    document.getElementById('printQNo').textContent = 'DRAFT';
  }

  window.print();
}

// ═══════════════════════════════════════════════════════════
// RESET FORM
// ═══════════════════════════════════════════════════════════
function resetForm() {
  if (!confirm('Form reset karna chahte hain? Sab data clear ho jaayega.')) return;
  ['custName','custPhone','custEmail','custGST','custAddress','notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('validityDays').value = '30';
  document.getElementById('itemsList').innerHTML = '';
  document.getElementById('printItemsList').innerHTML = '';
  document.getElementById('qnoValue').textContent = 'Will be auto-generated';
  document.getElementById('printQNo').textContent  = '—';
  savedQNo = null;
  itemCounter = 0;
  recalcTotals();
  updateEmptyState();
  addItem();
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function hideLoader() {
  const l = document.getElementById('loaderScreen');
  l.style.opacity = '0';
  l.style.transition = 'opacity 0.3s';
  setTimeout(() => { l.style.display = 'none'; }, 300);
  document.getElementById('mainForm').style.display = 'block';
}

function setStatus(type, label) {
  const el = document.getElementById('connectionStatus');
  el.className = `topbar-status ${type}`;
  el.querySelector('.status-label').textContent = label;
}

function formatDate(date) {
  return date.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function formatINR(n) {
  if (isNaN(n)) return '₹0.00';
  return '₹' + Number(n.toFixed(2)).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function parseAmountText(str) {
  return parseFloat(str.replace(/[₹,]/g, '')) || 0;
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3500);
}

// ── Number to Words (INR) ─────────────────────────────────
function numberToWords(n) {
  if (n === 0) return 'Zero Rupees Only';
  const ones  = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                  'Seventeen','Eighteen','Nineteen'];
  const tens  = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function words(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '') + ' ';
    if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred ' + words(num%100);
    if (num < 100000) return words(Math.floor(num/1000)) + 'Thousand ' + words(num%1000);
    if (num < 10000000) return words(Math.floor(num/100000)) + 'Lakh ' + words(num%100000);
    return words(Math.floor(num/10000000)) + 'Crore ' + words(num%10000000);
  }

  return words(n).trim() + ' Rupees Only';
}
