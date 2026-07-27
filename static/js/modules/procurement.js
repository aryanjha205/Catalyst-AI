export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>Procurement & Supplier Relations</h1>
                <p>Manage raw material vendors, performance indices, and book Purchase Orders.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="addSupBtn" style="background:#ffffff; color:var(--text-dark); border:1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-handshake"></i> Onboard Supplier
                </button>
                <button class="btn-pill" id="bookPoBtn" style="background:var(--btn-bg); color:#fff; border:none; box-shadow: 0 4px 10px rgba(0,230,118,0.2);">
                    <i class="fa-solid fa-file-invoice"></i> Create PO
                </button>
            </div>
        </div>

        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #7c2d12 0%, #b45309 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(180, 83, 9, 0.2); position: relative; overflow: hidden;">
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700;">Strategic Sourcing</h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Maintain a reliable supply chain. Evaluate vendor performance and automate purchase orders for continuous operations.
                </p>
            </div>
            
            <div style="flex: 0 0 300px; text-align: right; z-index: 2; position: relative;">
                <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.2) translateY(-10px) translateX(-10px);">
                    <path fill="rgba(255,255,255,0.1)" d="M50,-60C65,-45,75,-25,75,-5C75,15,65,35,50,50C35,65,15,75,-5,75C-25,75,-45,65,-60,50C-75,35,-85,15,-85,-5C-85,-25,-75,-45,-60,-60C-45,-75,-25,-85,-5,-85C15,-85,35,-75,50,-60Z" transform="translate(100 100)" />
                    <!-- Body Suit -->
                    <path d="M65,190 C65,140 135,140 135,190 Z" fill="#64748B" />
                    <!-- Shirt -->
                    <path d="M90,140 L100,165 L110,140 Z" fill="#E2E8F0" />
                    <circle cx="100" cy="110" r="28" fill="#FDBA74" />
                    <!-- Hair/Glasses -->
                    <path d="M72,105 C72,70 128,70 128,105 C128,95 72,95 72,105 Z" fill="#0F172A" />
                    <rect x="80" y="100" width="15" height="8" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2" />
                    <rect x="105" y="100" width="15" height="8" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2" />
                    <path d="M95,104 L105,104" stroke="#FFFFFF" stroke-width="2" />
                    <!-- Box in Hand -->
                    <rect x="120" y="125" width="30" height="25" fill="#D97706" transform="rotate(10 120 125)" />
                    <line x1="120" y1="135" x2="150" y2="135" stroke="#92400E" stroke-width="2" transform="rotate(10 120 125)" />
                    <path d="M135,125 L135,150" stroke="#92400E" stroke-width="2" transform="rotate(10 120 125)" />
                </svg>
            </div>
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
        </div>

        <div class="content-card" style="min-height: auto; margin-bottom: 24px;">
            <h3>Purchase Orders Log</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="poTable">
                    <thead>
                        <tr>
                            <th>PO ID</th>
                            <th>Supplier ID</th>
                            <th>Total Value</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="4" style="text-align:center;">Loading POs...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="content-card" style="min-height: auto;">
            <h3>Supplier Directory</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="supplierTable">
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Email</th>
                            <th>Performance Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="3" style="text-align:center;">Loading suppliers...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const poTable = document.querySelector('#poTable tbody');
    const supplierTable = document.querySelector('#supplierTable tbody');

    const addSupBtn = document.getElementById('addSupBtn');
    const dialogSupplier = document.getElementById('dialogSupplier');
    const formSupplier = document.getElementById('formSupplier');

    const bookPoBtn = document.getElementById('bookPoBtn');
    const dialogPurchaseOrder = document.getElementById('dialogPurchaseOrder');
    const formPurchaseOrder = document.getElementById('formPurchaseOrder');

    if (addSupBtn && dialogSupplier) addSupBtn.onclick = () => dialogSupplier.showModal();
    if (bookPoBtn && dialogPurchaseOrder) bookPoBtn.onclick = () => dialogPurchaseOrder.showModal();

    if (formSupplier) {
        formSupplier.onsubmit = async (e) => {
            const payload = {
                name: document.getElementById('sup_name').value,
                email: document.getElementById('sup_email').value,
                performance_score: parseFloat(document.getElementById('sup_score').value || 5)
            };

            try {
                const res = await fetch('/api/procurement/suppliers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to onboard supplier');
                dialogSupplier.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    if (formPurchaseOrder) {
        formPurchaseOrder.onsubmit = async (e) => {
            const payload = {
                supplier_id: document.getElementById('po_supplier_id').value,
                total_amount: parseFloat(document.getElementById('po_amount').value)
            };

            try {
                const res = await fetch('/api/procurement/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to book PO');
                }
                dialogPurchaseOrder.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    try {
        const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
        
        const resS = await fetch('/api/procurement/suppliers', { headers: authH });
        const suppliers = await resS.json();
        supplierTable.innerHTML = suppliers.length ? suppliers.map(s => `
            <tr>
                <td><strong>${s.name}</strong><br><small style="color:var(--text-muted);">ID: <code>${s.id}</code></small></td>
                <td>${s.email}</td>
                <td><i class="fa-solid fa-star" style="color:#eab308;"></i> ${s.performance_score}/5</td>
            </tr>
        `).join('') : '<tr><td colspan="3" style="text-align:center;">No suppliers onboarded yet.</td></tr>';

        const resPO = await fetch('/api/procurement/orders', { headers: authH });
        const pos = await resPO.json();
        poTable.innerHTML = pos.length ? pos.map(p => `
            <tr>
                <td><code>${p.id.slice(0, 8)}</code></td>
                <td><code>${p.supplier_id.slice(0, 8)}</code></td>
                <td>₹${p.total_amount}</td>
                <td><span style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600;">${p.status}</span></td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No purchase orders generated.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

export function cleanup() {}
