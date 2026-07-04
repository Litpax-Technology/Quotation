// ══════════════════════════════════════════════
// LITPAX QUOTATION MAKER — script.js
// Battery: 18% GST | Charger: 5% GST
// ══════════════════════════════════════════════

// 🔴 Apna GAS URL yahan daalo
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxn-xUtBNMMqZ5ws4tesaxkL-1FCxiXVDIhVfrqXdRWoz8jaj-1RdDR7I4jWRz9rKfb4w/exec';

const BATT_GST = 18;
const CHAR_GST = 5;

// State
let battModels = [];   // [{model, capacityWh, voltage}]
let charModels = [];   // [{model, compat, output}]
let company    = {};
let bCount = 0, cCount = 0, savedQNo = null;
let modalType  = 'battery'; // 'battery' or 'charger'

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('navDate').textContent = fmt(new Date());
  document.getElementById('docDate').textContent = fmt(new Date());
  updateValidTill();

  if (GAS_URL === 'YOUR_GAS_DEPLOYED_URL_HERE') {
    setStatus('demo','Demo');
    document.getElementById('demoBanner').style.display = 'block';
    loadDemo(); return;
  }
  loadGAS();
});

// ── LOAD FROM GAS ─────────────────────────────
function loadGAS() {
  setStatus('','Connecting...');
  fetch(`${GAS_URL}?action=getConfig`)
    .then(r => r.json())
    .then(d => {
      if (!d.success) throw new Error(d.message);
      const all = d.products || [];
      battModels = all.filter(p => p.type === 'battery').map(p => ({
        model: p.model, capacityWh: p.capacityWh || '', voltage: p.voltage || ''
      }));
      charModels = all.filter(p => p.type === 'charger').map(p => ({
        model: p.model, compat: p.compat || '', output: p.output || ''
      }));
      company = d.company || {};
      applyCompany();
      hideLoader();
      setStatus('live', 'Live');
      addBattRow();
    })
    .catch(e => {
      setStatus('error','Error');
      document.getElementById('loader').innerHTML =
        `<div class="loader-box">
          <p style="color:#dc2626;font-weight:700;margin-bottom:8px">⚠ Load failed</p>
          <p style="color:#64748b;font-size:12px;margin-bottom:14px">${e.message}</p>
          <button onclick="loadGAS()" style="padding:8px 18px;background:#1e1b4b;color:#fff;border:none;border-radius:6px;cursor:pointer">Retry</button>
        </div>`;
    });
}

// ── DEMO DATA ─────────────────────────────────
function loadDemo() {
  company = {
    'Company Name':'Litpax Technology Pvt. Ltd.',
    'Address':'Plot No. 12, Industrial Area, Rohtak, Haryana – 124001',
    'Phone':'+91 98765 43210','Email':'sales@litpax.in',
    'GST':'06XXXXXX1234X1ZX','Website':'www.litpax.in',
    'Bank Name':'HDFC Bank','Account No':'XXXXXXXX1234','IFSC':'HDFC0001234',
    'Quote Prefix':'LTX-Q'
  };
  battModels = [
    {model:'48V 30Ah',  capacityWh:1440, voltage:'48V'},
    {model:'60V 30Ah',  capacityWh:1800, voltage:'60V'},
    {model:'72V 30Ah',  capacityWh:2160, voltage:'72V'},
    {model:'48V 60Ah',  capacityWh:2880, voltage:'48V'},
    {model:'60V 60Ah',  capacityWh:3600, voltage:'60V'},
    {model:'72V 60Ah',  capacityWh:4320, voltage:'72V'},
    {model:'12V 100Ah', capacityWh:1200, voltage:'12V'},
    {model:'24V 100Ah', capacityWh:2400, voltage:'24V'},
    {model:'48V 100Ah', capacityWh:4800, voltage:'48V'},
    {model:'48V 200Ah', capacityWh:9600, voltage:'48V'},
    {model:'36V 15Ah',  capacityWh:540,  voltage:'36V'},
    {model:'48V 20Ah',  capacityWh:960,  voltage:'48V'},
  ];
  charModels = [
    {model:'48V 10A Charger', compat:'48V Battery',  output:'48V / 10A'},
    {model:'60V 10A Charger', compat:'60V Battery',  output:'60V / 10A'},
    {model:'72V 10A Charger', compat:'72V Battery',  output:'72V / 10A'},
    {model:'12V 20A Charger', compat:'Inverter 12V', output:'12V / 20A'},
    {model:'36V 5A Charger',  compat:'E-Cycle',      output:'36V / 5A'},
  ];
  applyCompany();
  hideLoader();
  addBattRow();
}

// ── APPLY COMPANY ─────────────────────────────
function applyCompany() {
  const n = company['Company Name'] || 'Litpax Technology Pvt. Ltd.';
  document.getElementById('hName').textContent  = n;
  document.getElementById('hSub').textContent   = [company['Website'], company['GST'] ? 'GSTIN: '+company['GST'] : ''].filter(Boolean).join('  |  ');
  document.getElementById('hPhone').textContent = company['Phone']   || '';
  document.getElementById('hEmail').textContent = company['Email']   || '';
  document.getElementById('hAddr').textContent  = company['Address'] || '';
  document.getElementById('sigCo').textContent  = n;
  const bank = [company['Bank Name'], company['Account No']?'A/C: '+company['Account No']:'', company['IFSC']?'IFSC: '+company['IFSC']:''].filter(Boolean).join('  |  ');
  document.getElementById('printBank').textContent = bank ? 'Bank Details: '+bank : '';
}

// ══════════════════════════════════════════════
// BATTERY ROWS
// ══════════════════════════════════════════════
function addBattRow() {
  bCount++;
  const id = `b${bCount}`;
  const opts = battModels.map(m => `<option value="${m.model}">${m.model}</option>`).join('');

  const row = document.createElement('div');
  row.className = 'item-row'; row.id = id;
  row.innerHTML = `
    <select class="finput" id="${id}_mdl" onchange="onBMdl('${id}')">
      <option value="">— Select Model —</option>${opts}
    </select>
    <div class="info-pill" id="${id}_cap">—</div>
    <div class="info-pill" id="${id}_vlt">—</div>
    <input class="finput" type="number" id="${id}_qty" value="1" min="1" style="text-align:right" oninput="calcBRow('${id}')"/>
    <input class="finput mono" type="number" id="${id}_rate" placeholder="Enter Rate" min="0" step="0.01" style="text-align:right" oninput="calcBRow('${id}')"/>
    <div class="amt-cell" id="${id}_amt" data-val="0">₹0.00</div>
    <button type="button" class="btn-del" onclick="delRow('${id}','batt')">✕</button>`;
  document.getElementById('battList').appendChild(row);
  updateEmpty('batt');
  // focus model select
  setTimeout(() => document.getElementById(`${id}_mdl`).focus(), 50);
}

function onBMdl(id) {
  const mdl = document.getElementById(`${id}_mdl`).value;
  if (!mdl) {
    document.getElementById(`${id}_cap`).textContent = '—';
    document.getElementById(`${id}_vlt`).textContent = '—';
    calcBRow(id); return;
  }
  const p = battModels.find(m => m.model === mdl);
  document.getElementById(`${id}_cap`).textContent = p?.capacityWh ? p.capacityWh+' Wh' : '—';
  document.getElementById(`${id}_vlt`).textContent = p?.voltage || '—';
  // Focus rate field
  document.getElementById(`${id}_rate`).focus();
  calcBRow(id);
}

function calcBRow(id) {
  const qty  = parseFloat(document.getElementById(`${id}_qty`).value)  || 0;
  const rate = parseFloat(document.getElementById(`${id}_rate`).value) || 0;
  const amt  = qty * rate;
  const c = document.getElementById(`${id}_amt`);
  c.textContent = inr(amt); c.dataset.val = amt;
  recalcAll();
}

// ══════════════════════════════════════════════
// CHARGER ROWS
// ══════════════════════════════════════════════
function addCharRow() {
  cCount++;
  const id = `c${cCount}`;
  const opts = charModels.map(m => `<option value="${m.model}">${m.model}</option>`).join('');

  const row = document.createElement('div');
  row.className = 'item-row'; row.id = id;
  row.innerHTML = `
    <select class="finput" id="${id}_mdl" onchange="onCMdl('${id}')">
      <option value="">— Select Model —</option>${opts}
    </select>
    <div class="info-pill" id="${id}_cmp">—</div>
    <div class="info-pill" id="${id}_out">—</div>
    <input class="finput" type="number" id="${id}_qty" value="1" min="1" style="text-align:right" oninput="calcCRow('${id}')"/>
    <input class="finput mono" type="number" id="${id}_rate" placeholder="Enter Rate" min="0" step="0.01" style="text-align:right" oninput="calcCRow('${id}')"/>
    <div class="amt-cell" id="${id}_amt" data-val="0">₹0.00</div>
    <button type="button" class="btn-del" onclick="delRow('${id}','char')">✕</button>`;
  document.getElementById('charList').appendChild(row);
  updateEmpty('char');
  setTimeout(() => document.getElementById(`${id}_mdl`).focus(), 50);
}

function onCMdl(id) {
  const mdl = document.getElementById(`${id}_mdl`).value;
  if (!mdl) {
    document.getElementById(`${id}_cmp`).textContent = '—';
    document.getElementById(`${id}_out`).textContent = '—';
    calcCRow(id); return;
  }
  const p = charModels.find(m => m.model === mdl);
  document.getElementById(`${id}_cmp`).textContent = p?.compat || '—';
  document.getElementById(`${id}_out`).textContent = p?.output || '—';
  document.getElementById(`${id}_rate`).focus();
  calcCRow(id);
}

function calcCRow(id) {
  const qty  = parseFloat(document.getElementById(`${id}_qty`).value)  || 0;
  const rate = parseFloat(document.getElementById(`${id}_rate`).value) || 0;
  const amt  = qty * rate;
  const c = document.getElementById(`${id}_amt`);
  c.textContent = inr(amt); c.dataset.val = amt;
  recalcAll();
}

// ── DELETE ROW ────────────────────────────────
function delRow(id, type) {
  const r = document.getElementById(id);
  if (!r) return;
  r.style.opacity = '0'; r.style.transition = 'opacity .15s';
  setTimeout(() => { r.remove(); recalcAll(); updateEmpty(type); }, 150);
}

// ── RECALC ────────────────────────────────────
function recalcAll() {
  let bSub = 0;
  document.querySelectorAll('#battList .amt-cell').forEach(e => bSub += parseFloat(e.dataset.val||0));
  const bGst = bSub * BATT_GST / 100, bTot = bSub + bGst;

  let cSub = 0;
  document.querySelectorAll('#charList .amt-cell').forEach(e => cSub += parseFloat(e.dataset.val||0));
  const cGst = cSub * CHAR_GST / 100, cTot = cSub + cGst;

  const grand = bTot + cTot;

  s('battSubtotalDisp', inr(bSub)); s('battGstDisp', inr(bGst)); s('battTotalDisp', inr(bTot));
  s('charSubtotalDisp', inr(cSub)); s('charGstDisp', inr(cGst)); s('charTotalDisp', inr(cTot));
  s('gtBatt', inr(bTot)); s('gtChar', inr(cTot)); s('grandTotal', inr(grand));
  s('amountWords', n2w(Math.round(grand)));
  s('sbBatt', inr(bSub)); s('sbBattGst', inr(bGst));
  s('sbChar', inr(cSub)); s('sbCharGst', inr(cGst));
  s('sbGrand', inr(grand));
}

// ── EMPTY STATE ───────────────────────────────
function updateEmpty(type) {
  const listId  = type === 'batt' ? 'battList' : 'charList';
  const emptyId = type === 'batt' ? 'battEmpty' : 'charEmpty';
  document.getElementById(emptyId).style.display =
    document.querySelectorAll(`#${listId} .item-row`).length ? 'none' : 'block';
}

// ══════════════════════════════════════════════
// ADD NEW MODEL MODAL
// ══════════════════════════════════════════════
function openModal(type) {
  modalType = type;
  document.getElementById('modalTitle').textContent = type === 'battery' ? 'Add New Battery Model' : 'Add New Charger Model';
  document.getElementById('mModel').value = '';
  document.getElementById('mCap').value   = '';
  document.getElementById('mVolt').value  = '';

  // For charger — swap cap/volt labels to compat/output
  const capField  = document.getElementById('mCap');
  const voltField = document.getElementById('mVolt');
  const capLabel  = capField.previousElementSibling;
  const voltLabel = voltField.previousElementSibling;

  if (type === 'battery') {
    capLabel.textContent  = 'Capacity (Wh)'; capField.placeholder  = 'e.g. 1920';
    voltLabel.textContent = 'Voltage';        voltField.placeholder = 'e.g. 60V';
  } else {
    capLabel.textContent  = 'Compatibility'; capField.placeholder  = 'e.g. 48V Battery';
    voltLabel.textContent = 'Output';         voltField.placeholder = 'e.g. 48V / 10A';
    capField.type = 'text';
  }

  document.getElementById('modalOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById('mModel').focus(), 100);
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.getElementById('mCap').type = 'number'; // reset
}

function saveNewModel() {
  const modelName = document.getElementById('mModel').value.trim();
  if (!modelName) { toast('Model name required!','error'); return; }

  const capVal  = document.getElementById('mCap').value.trim();
  const voltVal = document.getElementById('mVolt').value.trim();

  const btn = document.getElementById('modalSaveBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  if (modalType === 'battery') {
    // Add to local list
    battModels.push({ model: modelName, capacityWh: capVal, voltage: voltVal });
    // Refresh all battery dropdowns
    refreshBattDropdowns(modelName);
  } else {
    charModels.push({ model: modelName, compat: capVal, output: voltVal });
    refreshCharDropdowns(modelName);
  }

  // Save to GAS if configured
  if (GAS_URL !== 'YOUR_GAS_DEPLOYED_URL_HERE') {
    const payload = { type: modalType, model: modelName, field2: capVal, field3: voltVal };
    fetch(`${GAS_URL}?action=addModel&data=${encodeURIComponent(JSON.stringify(payload))}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) toast(`✅ "${modelName}" saved to sheet!`,'success');
        else toast(`Model added locally. Sheet error: ${res.message}`,'info');
      })
      .catch(() => toast(`"${modelName}" added locally (sheet sync failed)`,'info'));
  } else {
    toast(`✅ "${modelName}" added!`,'success');
  }

  btn.disabled = false; btn.textContent = 'Save Model';
  closeModalDirect();
}

function refreshBattDropdowns(selectModel) {
  const opts = battModels.map(m => `<option value="${m.model}">${m.model}</option>`).join('');
  document.querySelectorAll('#battList .item-row').forEach(row => {
    const sel = document.getElementById(`${row.id}_mdl`);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = `<option value="">— Select Model —</option>${opts}`;
    sel.value = selectModel || cur; // select newly added
  });
  // if row exists, trigger model change on last row
  const rows = document.querySelectorAll('#battList .item-row');
  if (rows.length) {
    const lastId = rows[rows.length-1].id;
    document.getElementById(`${lastId}_mdl`).value = selectModel;
    onBMdl(lastId);
  }
}

function refreshCharDropdowns(selectModel) {
  const opts = charModels.map(m => `<option value="${m.model}">${m.model}</option>`).join('');
  document.querySelectorAll('#charList .item-row').forEach(row => {
    const sel = document.getElementById(`${row.id}_mdl`);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = `<option value="">— Select Model —</option>${opts}`;
    sel.value = selectModel || cur;
  });
  const rows = document.querySelectorAll('#charList .item-row');
  if (rows.length) {
    const lastId = rows[rows.length-1].id;
    document.getElementById(`${lastId}_mdl`).value = selectModel;
    onCMdl(lastId);
  }
}

// ── VALID TILL ────────────────────────────────
function updateValidTill() {
  const d = new Date();
  d.setDate(d.getDate() + (parseInt(document.getElementById('validityDays').value)||30));
  document.getElementById('docValidTill').textContent = fmt(d);
}

// ── COLLECT ITEMS ─────────────────────────────
function collectBatt() {
  return [...document.querySelectorAll('#battList .item-row')].map(r => {
    const id  = r.id;
    const mdl = document.getElementById(`${id}_mdl`).value;
    if (!mdl) return null;
    const p   = battModels.find(m => m.model === mdl);
    const qty = parseFloat(document.getElementById(`${id}_qty`).value)||0;
    const rate= parseFloat(document.getElementById(`${id}_rate`).value)||0;
    return { type:'battery', model:mdl, capacityWh:p?.capacityWh||'', voltage:p?.voltage||'', qty, rate, amount:qty*rate };
  }).filter(Boolean);
}

function collectChar() {
  return [...document.querySelectorAll('#charList .item-row')].map(r => {
    const id  = r.id;
    const mdl = document.getElementById(`${id}_mdl`).value;
    if (!mdl) return null;
    const p   = charModels.find(m => m.model === mdl);
    const qty = parseFloat(document.getElementById(`${id}_qty`).value)||0;
    const rate= parseFloat(document.getElementById(`${id}_rate`).value)||0;
    return { type:'charger', model:mdl, compat:p?.compat||'', output:p?.output||'', qty, rate, amount:qty*rate };
  }).filter(Boolean);
}

// ── BUILD PRINT ROWS ──────────────────────────
function buildPrint(bItems, cItems) {
  const bc = document.getElementById('printBattList');
  bc.innerHTML = '';
  bItems.forEach((item,i) => {
    const d = document.createElement('div');
    d.className = 'pr-row';
    d.innerHTML = `
      <div>${i+1}</div>
      <div><strong>${item.model}</strong></div>
      <div>${item.capacityWh ? item.capacityWh+' Wh' : '—'}</div>
      <div>${item.voltage || '—'}</div>
      <div class="c-qty">${item.qty} Nos</div>
      <div>${inr(item.rate)}</div>
      <div class="c-amt">${inr(item.amount)}</div>`;
    bc.appendChild(d);
  });

  const cc = document.getElementById('printCharList');
  cc.innerHTML = '';
  cItems.forEach((item,i) => {
    const d = document.createElement('div');
    d.className = 'pr-row';
    d.innerHTML = `
      <div>${i+1}</div>
      <div><strong>${item.model}</strong></div>
      <div>${item.compat || '—'}</div>
      <div>${item.output || '—'}</div>
      <div class="c-qty">${item.qty} Nos</div>
      <div>${inr(item.rate)}</div>
      <div class="c-amt">${inr(item.amount)}</div>`;
    cc.appendChild(d);
  });
}

function fillTerms() {
  const notes = document.getElementById('notes').value.trim();
  const days  = document.getElementById('validityDays').value || '30';
  document.getElementById('printTerms').innerHTML = notes
    ? notes.split('\n').filter(l=>l.trim()).map(l=>`<div>${l.replace(/^[•\-]\s*/,'• ')}</div>`).join('')
    : `<div>• Valid for ${days} days from date of issue.</div>
       <div>• Battery: 18% GST | Charger: 5% GST applicable.</div>
       <div>• Payment: 50% advance, balance before dispatch.</div>
       <div>• Delivery: 15–20 working days from order confirmation.</div>`;
}

// ── SAVE ──────────────────────────────────────
function saveQuotation() {
  const name = document.getElementById('custName').value.trim();
  if (!name) { toast('Customer name required!','error'); return; }
  const bItems = collectBatt(), cItems = collectChar();
  if (!bItems.length && !cItems.length) { toast('Koi item add karein!','error'); return; }
  buildPrint(bItems, cItems); fillTerms();

  if (GAS_URL === 'YOUR_GAS_DEPLOYED_URL_HERE') {
    document.getElementById('docQNo').textContent = 'LTX-Q-DEMO';
    toast('Demo mode — print kar sakte hain!','info'); return;
  }

  const btn = document.getElementById('saveBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  const bSub  = sum('#battList'), bGst = bSub*BATT_GST/100, bTot = bSub+bGst;
  const cSub  = sum('#charList'), cGst = cSub*CHAR_GST/100, cTot = cSub+cGst;

  const payload = {
    customer: { name, phone:v('custPhone'), email:v('custEmail'), address:v('custAddress'), gst:v('custGST') },
    battItems:bItems, charItems:cItems,
    battSubtotal:bSub, battGstAmt:bGst,
    charSubtotal:cSub, charGstAmt:cGst,
    grandTotal: bTot+cTot,
    notes: v('notes'), validityDays: v('validityDays')
  };

  fetch(`${GAS_URL}?action=saveQuotation&data=${encodeURIComponent(JSON.stringify(payload))}`)
    .then(r => r.json())
    .then(res => {
      if (!res.success) throw new Error(res.message);
      savedQNo = res.quotationNo;
      document.getElementById('docQNo').textContent = savedQNo;
      toast(`✅ Saved! ${savedQNo}`,'success');
      btn.disabled = false; btn.innerHTML = '💾 Save Quotation';
    })
    .catch(e => {
      toast('❌ '+e.message,'error');
      btn.disabled = false; btn.innerHTML = '💾 Save Quotation';
    });
}

// ── PRINT ─────────────────────────────────────
function previewPrint() {
  if (!document.getElementById('custName').value.trim()) { toast('Customer name daalo!','error'); return; }
  const bItems = collectBatt(), cItems = collectChar();
  if (!bItems.length && !cItems.length) { toast('Koi item add karein!','error'); return; }
  buildPrint(bItems, cItems); fillTerms();
  if (!savedQNo) document.getElementById('docQNo').textContent = 'DRAFT';
  window.print();
}

// ── RESET ─────────────────────────────────────
function resetForm() {
  if (!confirm('Reset karna chahte hain?')) return;
  ['custName','custPhone','custEmail','custAddress','custGST','notes'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('validityDays').value = '30';
  document.getElementById('battList').innerHTML = '';
  document.getElementById('charList').innerHTML = '';
  document.getElementById('printBattList').innerHTML = '';
  document.getElementById('printCharList').innerHTML = '';
  document.getElementById('docQNo').textContent = 'Auto';
  savedQNo = null; bCount = 0; cCount = 0;
  recalcAll(); updateValidTill();
  updateEmpty('batt'); updateEmpty('char');
  addBattRow();
}

// ── HELPERS ───────────────────────────────────
function hideLoader() {
  const l = document.getElementById('loader');
  l.style.opacity = '0'; l.style.transition = 'opacity .3s';
  setTimeout(() => l.style.display = 'none', 300);
  document.getElementById('app').style.display = 'block';
}
function setStatus(t,l) {
  document.getElementById('navPill').className = `npill ${t}`;
  document.getElementById('navLbl').textContent = l;
}
function fmt(d) { return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function inr(n) { return '₹'+Number((n||0).toFixed(2)).toLocaleString('en-IN',{minimumFractionDigits:2}); }
function s(id,val) { const e=document.getElementById(id); if(e) e.textContent=val; }
function v(id)  { return document.getElementById(id)?.value||''; }
function sum(sel) { let t=0; document.querySelectorAll(`${sel} .amt-cell`).forEach(e=>t+=parseFloat(e.dataset.val||0)); return t; }
function toast(msg,type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast show ${type}`;
  clearTimeout(t._t); t._t = setTimeout(()=>t.className='toast',3500);
}
function n2w(n) {
  if(!n) return 'Zero Rupees Only';
  const o=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const t=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function w(x){
    if(!x)return '';if(x<20)return o[x]+' ';
    if(x<100)return t[Math.floor(x/10)]+(x%10?' '+o[x%10]:'')+' ';
    if(x<1000)return o[Math.floor(x/100)]+' Hundred '+w(x%100);
    if(x<100000)return w(Math.floor(x/1000))+'Thousand '+w(x%1000);
    if(x<10000000)return w(Math.floor(x/100000))+'Lakh '+w(x%100000);
    return w(Math.floor(x/10000000))+'Crore '+w(x%10000000);
  }
  return w(n).trim()+' Rupees Only';
}
