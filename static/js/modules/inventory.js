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
    const addStockBtn = document.getElementById('addStockBtn');
    const dialogStock = document.getElementById('dialogStock');
    const formStock = document.getElementById('formStock');

    if (addStockBtn && dialogStock) {
        addStockBtn.addEventListener('click', () => {
            dialogStock.showModal();
        });
    }

    if (formStock) {
        formStock.onsubmit = async (e) => {
            const payload = {
                product_code: document.getElementById('stock_code').value,
                chemical_name: document.getElementById('stock_name').value,
                cas_number: document.getElementById('stock_cas').value || null,
                category: document.getElementById('stock_category').value,
                current_stock: parseFloat(document.getElementById('stock_qty').value || 0),
                safety_stock: parseFloat(document.getElementById('stock_safety').value || 0),
                reorder_level: parseFloat(document.getElementById('stock_reorder').value || 0),
                hazard_class: document.getElementById('stock_hazard').value || null
            };

            try {
                const res = await fetch('/api/inventory/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to save product');
                dialogStock.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

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
                <td><span style="background: rgba(0,0,0,0.05); padding: 4px 8px; border-radius: 4px; font-family: monospace;">${item.cas_number || 'N/A'}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <div style="flex:1; height: 6px; background: rgba(0,0,0,0.05); border-radius:3px; overflow:hidden;">
                            <div style="width: ${Math.min((item.current_stock / (item.safety_stock || 1000)) * 100, 100)}%; height: 100%; background: var(--secondary-color);"></div>
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
    // Cleanup
}

