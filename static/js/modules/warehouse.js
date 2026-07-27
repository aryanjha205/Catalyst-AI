export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>Warehouse & Storage Zones</h1>
                <p>Track chemical placement, multiple zones, and stock movements.</p>
            </div>
            <div class="header-actions" style="display:flex; gap: 10px;">
                <button class="btn-pill" id="storeStockBtn" style="background: var(--primary-color); color: #fff; border:none; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <i class="fa-solid fa-box-open"></i> Store Product
                </button>
                <button class="btn-pill" id="addWarehouseBtn" style="background: var(--btn-bg); color: #fff; border:none; box-shadow: 0 4px 10px rgba(0,230,118,0.2);">
                    <i class="fa-solid fa-plus"></i> Add WH Asset
                </button>
            </div>
        </div>

        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(245, 158, 11, 0.2); position: relative; overflow: hidden;">
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700;">Global Warehouse Map</h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Optimize your storage layout. Manage bins, zones, and securely position flammable or toxic containers.
                </p>
            </div>
            
            <div style="flex: 0 0 300px; text-align: right; z-index: 2; position: relative;">
                <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.2) translateY(-10px) translateX(-10px);">
                    <path fill="rgba(255,255,255,0.1)" d="M41,-52.1C55.2,-40.8,70,-28.9,74.9,-13.4C79.8,2.1,74.8,21.3,64.2,37.3C53.7,53.2,37.5,65.9,19.3,71.2C1.1,76.5,-19,74.3,-35.1,65.2C-51.1,56.1,-63,40.1,-67.2,22.6C-71.4,5.2,-67.9,-13.7,-58.1,-27.7C-48.3,-41.7,-32.1,-50.8,-17.1,-52.9C-2.1,-55,13.1,-50.2,26.9,-63.5Z" transform="translate(100 100)" />
                    <path d="M70,190 C70,140 130,140 130,190 Z" fill="#FDE68A" />
                    <!-- Safety Vest -->
                    <path d="M85,140 L115,140 L125,190 L75,190 Z" fill="#D97706" opacity="0.8" />
                    <circle cx="100" cy="110" r="28" fill="#FDBA74" />
                    <!-- Hard Hat -->
                    <path d="M68,110 C68,80 132,80 132,110" fill="#FBBF24" />
                    <path d="M60,110 L140,110" stroke="#FBBF24" stroke-width="6" stroke-linecap="round" />
                    <!-- Box -->
                    <rect x="135" y="140" width="30" height="30" fill="#8B5CF6" transform="rotate(15 135 140)" />
                    <line x1="135" y1="155" x2="165" y2="155" stroke="#7C3AED" stroke-width="2" transform="rotate(15 135 140)" />
                    <path d="M90,105 C90,105 100,100 110,105" stroke="#1E293B" stroke-width="2" fill="none" />
                </svg>
            </div>
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
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
