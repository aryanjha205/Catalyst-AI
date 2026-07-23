export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Chemical Inventory</h1>
                <p>Manage raw materials, finished products, and stock levels.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" style="background: var(--btn-bg); color: #fff; border:none;" id="addStockBtn">
                    <i class="fa-solid fa-plus"></i> Add Stock
                </button>
            </div>
        </div>

        <div class="content-card">
            <div class="card-toolbar">
                <div class="search-bar">
                    <i class="fa-solid fa-search"></i>
                    <input type="text" placeholder="Search inventory by CAS or Name...">
                </div>
                <button class="btn-pill"><i class="fa-solid fa-filter"></i> Filter</button>
            </div>

            <div class="table-wrapper">
                <table class="data-table" id="inventoryTable">
                    <thead>
                        <tr>
                            <th>Product Code</th>
                            <th>Chemical Name</th>
                            <th>CAS Number</th>
                            <th>Current Stock (kg/L)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="5" style="text-align:center;">Loading inventory...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/inventory', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch inventory');
        
        const data = await res.json();
        
        if(data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No inventory items found. Add some to get started.</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(item => `
            <tr>
                <td><strong>${item.product_code}</strong></td>
                <td>${item.chemical_name}</td>
                <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace;">${item.cas_number || 'N/A'}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <div style="flex:1; height: 6px; background: rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                            <div style="width: ${Math.min(item.current_stock / 1000 * 100, 100)}%; height: 100%; background: var(--secondary-color);"></div>
                        </div>
                        <span style="font-weight:600; min-width: 50px;">${item.current_stock}</span>
                    </div>
                </td>
                <td><button class="action-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ef4444;">Error loading inventory. Please try again.</td></tr>';
    }
}

export function cleanup() {
    // Cleanup if needed
}
