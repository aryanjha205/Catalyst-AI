export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Procurement & Supplier Relations</h1>
                <p>Manage raw material vendors, performance indices, and book Purchase Orders.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="addSupBtn" style="background:#ffffff; color:var(--text-dark); border:1px solid var(--border-color);">
                    <i class="fa-solid fa-handshake"></i> Onboard Supplier
                </button>
                <button class="btn-pill" id="bookPoBtn" style="background:var(--btn-bg); color:#fff; border:none;">
                    <i class="fa-solid fa-file-invoice"></i> Create PO
                </button>
            </div>
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
