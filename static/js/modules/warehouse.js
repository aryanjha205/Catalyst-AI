export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Warehouse & Storage Zones</h1>
                <p>Track chemical placement, multiple zones, and stock movements.</p>
            </div>
            <div class="header-actions" style="display:flex; gap: 10px;">
                <button class="btn-pill" id="storeStockBtn" style="background: var(--primary-color); color: #fff; border:none;">
                    <i class="fa-solid fa-box-open"></i> Store Product
                </button>
                <button class="btn-pill" id="addWarehouseBtn" style="background: var(--btn-bg); color: #fff; border:none;">
                    <i class="fa-solid fa-plus"></i> Add WH Asset
                </button>
            </div>
        </div>

        <div class="content-card" style="min-height: auto; margin-bottom: 24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3>Active Warehouses</h3>
            </div>
            <div class="table-wrapper">
                <table class="data-table" id="whTable">
                    <thead>
                        <tr>
                            <th>Warehouse Name</th>
                            <th>Location</th>
                            <th>Capacity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="3" style="text-align:center;">Loading warehouses...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div class="content-card" style="min-height: auto;">
                <h3>Storage Zones</h3>
                <div class="table-wrapper" style="margin-top:15px;">
                    <table class="data-table" id="zonesTable">
                        <thead>
                            <tr>
                                <th>Zone ID</th>
                                <th>Zone Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="2" style="text-align:center;">Loading zones...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="content-card" style="min-height: auto;">
                <h3>Active Racks & Bins</h3>
                <div class="table-wrapper" style="margin-top:15px;">
                    <table class="data-table" id="binsTable">
                        <thead>
                            <tr>
                                <th>Bin Name</th>
                                <th>Barcode</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="2" style="text-align:center;">Loading bins...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        <div class="content-card" style="margin-top:20px; min-height: auto;">
            <h3>Stock in Bins</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="stockTable">
                    <thead>
                        <tr>
                            <th>Product Code</th>
                            <th>Chemical Name</th>
                            <th>Bin / Location</th>
                            <th>Quantity</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="5" style="text-align:center;">Loading stock...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const whTable = document.querySelector('#whTable tbody');
    const zonesTable = document.querySelector('#zonesTable tbody');
    const binsTable = document.querySelector('#binsTable tbody');
    const stockTable = document.querySelector('#stockTable tbody');
    const btn = document.getElementById('addWarehouseBtn');
    const storeBtn = document.getElementById('storeStockBtn');
    const dialog = document.getElementById('dialogWarehouse');
    const form = document.getElementById('formWarehouse');
    const dialogStore = document.getElementById('dialogStoreStock');
    const formStore = document.getElementById('formStoreStock');

    if (btn && dialog) {
        btn.onclick = () => dialog.showModal();
    }

    if (storeBtn && dialogStore) {
        storeBtn.onclick = async () => {
            // Load products and bins for dropdowns
            try {
                const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
                const resP = await fetch('/api/inventory', { headers: authH });
                const products = await resP.json();
                const selP = document.getElementById('store_product_id');
                selP.innerHTML = '<option value="">Select Product...</option>' + products.map(p => `<option value="${p.id}">${p.chemical_name} (${p.product_code})</option>`).join('');

                const resB = await fetch('/api/warehouse/bins', { headers: authH });
                const bins = await resB.json();
                const selB = document.getElementById('store_bin_id');
                selB.innerHTML = '<option value="">Select Destination Bin...</option>' + bins.map(b => `<option value="${b.id}">${b.name} (${b.barcode})</option>`).join('');
                
                dialogStore.showModal();
            } catch (err) {
                console.error(err);
            }
        };
    }

    if (formStore) {
        formStore.onsubmit = async (e) => {
            e.preventDefault();
            const payload = {
                product_id: document.getElementById('store_product_id').value,
                bin_id: document.getElementById('store_bin_id').value,
                quantity: parseFloat(document.getElementById('store_qty').value)
            };
            try {
                const res = await fetch('/api/warehouse/store', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to store stock');
                dialogStore.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    if (form) {
        form.onsubmit = async (e) => {
            const whType = document.getElementById('wh_type').value;
            const whName = document.getElementById('wh_name').value;
            const whParentId = document.getElementById('wh_parent_id').value;

            let url = '/api/warehouse/';
            let payload = {};

            if (whType === 'warehouse') {
                payload = { name: whName, location: 'Main site', capacity: 10000 };
            } else if (whType === 'zone') {
                url += 'zones';
                payload = { warehouse_id: whParentId, name: whName };
            } else if (whType === 'rack') {
                url += 'racks';
                payload = { zone_id: whParentId, name: whName };
            } else if (whType === 'bin') {
                url += 'bins';
                payload = { rack_id: whParentId, name: whName };
            }

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to save asset');
                }
                dialog.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    try {
        const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
        
        const resWh = await fetch('/api/warehouse', { headers: authH });
        const whs = await resWh.json();
        whTable.innerHTML = whs.length ? whs.map(w => `<tr><td><strong>${w.name}</strong></td><td>${w.location}</td><td>${w.capacity} kg</td></tr>`).join('') : '<tr><td colspan="3" style="text-align:center;">No warehouses configured.</td></tr>';

        const resZ = await fetch('/api/warehouse/zones', { headers: authH });
        const zones = await resZ.json();
        zonesTable.innerHTML = zones.length ? zones.map(z => `<tr><td><code>${z.id.slice(0, 8)}</code></td><td>${z.name}</td></tr>`).join('') : '<tr><td colspan="2" style="text-align:center;">No zones found.</td></tr>';

        const resB = await fetch('/api/warehouse/bins', { headers: authH });
        const bins = await resB.json();
        binsTable.innerHTML = bins.length ? bins.map(b => `<tr><td><strong>${b.name}</strong></td><td><code>${b.barcode}</code></td></tr>`).join('') : '<tr><td colspan="2" style="text-align:center;">No bins found.</td></tr>';

        const resStock = await fetch('/api/warehouse/stock', { headers: authH });
        const stockData = await resStock.json();
        stockTable.innerHTML = stockData.length ? stockData.map(s => `
            <tr>
                <td><strong>${s.product_code}</strong></td>
                <td>${s.product_name}</td>
                <td><span class="status-badge status-active">${s.bin_name}</span></td>
                <td>${s.quantity}</td>
                <td>${new Date(s.issue_date).toLocaleDateString()}</td>
            </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;">No stock stored in bins.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

export function cleanup() {}
