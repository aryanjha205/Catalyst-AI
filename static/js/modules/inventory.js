let selectedChemical = "Ethanol";
let selectedPrice = "0.00";
let activeDrumIndex = 0; // 0: Flammable, 1: Toxic, 2: Safe

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

        <div class="content-card" style="min-height: auto; margin-bottom: 24px;">
            <div class="card-toolbar">
                <div class="search-bar">
                    <i class="fa-solid fa-search"></i>
                    <input type="text" placeholder="Search inventory by CAS or Name..." id="inventorySearch">
                </div>
            </div>

            <div class="table-wrapper">
                <table class="data-table" id="inventoryTable">
                    <thead>
                        <tr>
                            <th>Product Code</th>
                            <th>Chemical Name</th>
                            <th>CAS Number</th>
                            <th>Current Stock (kg/L)</th>
                            <th>Price (₹)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="6" style="text-align:center;">Loading inventory...</td>
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
    const btnSuggest = document.getElementById('btnStockAISuggest');

    if (addStockBtn && dialogStock) {
        addStockBtn.addEventListener('click', () => {
            dialogStock.showModal();
        });
    }

    if (btnSuggest) {
        btnSuggest.onclick = async () => {
            const chemicalName = document.getElementById('stock_name').value.trim();
            if (!chemicalName) {
                alert('Please enter a chemical name first to suggest details!');
                return;
            }

            const originalText = btnSuggest.innerHTML;
            btnSuggest.disabled = true;
            btnSuggest.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Suggesting...';

            try {
                const res = await fetch('/api/ai/suggest-chemical', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify({ name: chemicalName })
                });

                if (!res.ok) throw new Error('AI suggestion failed');
                const suggested = await res.json();

                if (suggested.chemical_name) {
                    document.getElementById('stock_name').value = suggested.chemical_name;
                }
                if (suggested.cas_number) {
                    document.getElementById('stock_cas').value = suggested.cas_number;
                }
                if (suggested.hazard_class) {
                    document.getElementById('stock_hazard').value = suggested.hazard_class;
                }
            } catch (err) {
                console.error(err);
                alert('Could not suggest details. Please enter manually.');
            } finally {
                btnSuggest.disabled = false;
                btnSuggest.innerHTML = originalText;
            }
        };
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
                hazard_class: document.getElementById('stock_hazard').value || null,
                purchase_price: parseFloat(document.getElementById('stock_purchase_price')?.value || 0),
                selling_price: parseFloat(document.getElementById('stock_selling_price')?.value || 0)
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

    const drumSelector = document.getElementById('drumSelector');
    const updateDrumLabels = () => {
        for (let i = 0; i < 3; i++) {
            const labelEl = document.getElementById(`label-drum-${i}`);
            const drumEl = document.getElementById(`drum-${i}`);
            if (i === activeDrumIndex) {
                labelEl.textContent = `${selectedChemical} - ₹${selectedPrice}`;
                drumEl.classList.add('selected');
            } else {
                labelEl.textContent = "No Chemical Projected";
                drumEl.classList.remove('selected');
            }
        }
    };

    if (drumSelector) {
        drumSelector.onchange = (e) => {
            activeDrumIndex = parseInt(e.target.value);
            updateDrumLabels();
        };
    }
    
    const stockNameInput = document.getElementById('stock_name');
    if (stockNameInput) {
        stockNameInput.addEventListener('input', (e) => {
            selectedChemical = e.target.value || "No Name";
            updateDrumLabels();
        });
    }

    const stockPriceInput = document.getElementById('stock_selling_price');
    if (stockPriceInput) {
        stockPriceInput.addEventListener('input', (e) => {
            selectedPrice = e.target.value || "0.00";
            updateDrumLabels();
        });
    }

    document.querySelectorAll('.chemical-drum').forEach(drum => {
        drum.onclick = () => {
            // Can still click if they want, but the main feature is in the add product dialog
            activeDrumIndex = parseInt(drum.getAttribute('data-index'));
            if (drumSelector) drumSelector.value = activeDrumIndex;
            updateDrumLabels();
        };
    });

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
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No inventory items found. Add some to get started.</td></tr>';
            selectedChemical = "None Active";
            selectedPrice = "0.00";
            updateDrumLabels();
            return;
        }

        selectedChemical = data[0].chemical_name;
        selectedPrice = data[0].selling_price || "0.00";
        updateDrumLabels();

        tableBody.innerHTML = data.map(item => `
            <tr style="cursor:pointer;" class="inventory-row" data-name="${item.chemical_name}" data-price="${item.selling_price || 0}">
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
                <td><strong>₹${(item.selling_price || 0).toFixed(2)}</strong></td>
                <td><button class="action-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
            </tr>
        `).join('');

        document.querySelectorAll('.inventory-row').forEach(row => {
            row.onclick = () => {
                selectedChemical = row.getAttribute('data-name');
                selectedPrice = row.getAttribute('data-price');
                updateDrumLabels();
            };
        });

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #ef4444;">Error loading inventory. Please try again.</td></tr>';
    }
}

export function cleanup() {
    // Cleanup
}
