let selectedChemical = "Ethanol";
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

        <!-- 3D CSS Drums Interactive Display -->
        <div class="drum-display-section">
            <div class="drum-controls">
                <div>
                    <h3>3D Chemical Storage Visualization</h3>
                    <p style="margin: 0; font-size:0.9rem; color:var(--text-muted);">Click on a drum to select where to project the chemical name.</p>
                </div>
                <div>
                    <label for="drumSelector" style="font-weight:600; margin-right:8px;">Project onto:</label>
                    <select id="drumSelector" style="padding:6px 12px; border-radius:8px; border:1px solid var(--border-color);">
                        <option value="0">Drum 1: Flammable (Red)</option>
                        <option value="1">Drum 2: Toxic (Yellow)</option>
                        <option value="2">Drum 3: Safe (Green)</option>
                    </select>
                </div>
            </div>

            <div class="drums-container">
                <!-- Drum 1: Flammable -->
                <div class="chemical-drum drum-flammable" id="drum-0" data-index="0">
                    <div class="drum-top"></div>
                    <div class="drum-body">
                        <div class="drum-band drum-band-1"></div>
                        <div class="hazard-diamond">
                            <i class="fa-solid fa-fire"></i>
                        </div>
                        <div class="drum-label" id="label-drum-0">No Chemical Projected</div>
                        <div class="drum-band drum-band-2"></div>
                    </div>
                    <div class="drum-bottom"></div>
                </div>

                <!-- Drum 2: Toxic -->
                <div class="chemical-drum drum-toxic" id="drum-1" data-index="1">
                    <div class="drum-top"></div>
                    <div class="drum-body">
                        <div class="drum-band drum-band-1"></div>
                        <div class="hazard-diamond">
                            <i class="fa-solid fa-skull-crossbones"></i>
                        </div>
                        <div class="drum-label" id="label-drum-1">No Chemical Projected</div>
                        <div class="drum-band drum-band-2"></div>
                    </div>
                    <div class="drum-bottom"></div>
                </div>

                <!-- Drum 3: Safe -->
                <div class="chemical-drum drum-safe" id="drum-2" data-index="2">
                    <div class="drum-top"></div>
                    <div class="drum-body">
                        <div class="drum-band drum-band-1"></div>
                        <div class="hazard-diamond">
                            <i class="fa-solid fa-leaf"></i>
                        </div>
                        <div class="drum-label" id="label-drum-2">No Chemical Projected</div>
                        <div class="drum-band drum-band-2"></div>
                    </div>
                    <div class="drum-bottom"></div>
                </div>
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

    const drumSelector = document.getElementById('drumSelector');
    const updateDrumLabels = () => {
        for (let i = 0; i < 3; i++) {
            const labelEl = document.getElementById(`label-drum-${i}`);
            const drumEl = document.getElementById(`drum-${i}`);
            if (i === activeDrumIndex) {
                labelEl.textContent = selectedChemical;
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

    document.querySelectorAll('.chemical-drum').forEach(drum => {
        drum.onclick = () => {
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
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No inventory items found. Add some to get started.</td></tr>';
            selectedChemical = "None Active";
            updateDrumLabels();
            return;
        }

        selectedChemical = data[0].chemical_name;
        updateDrumLabels();

        tableBody.innerHTML = data.map(item => `
            <tr style="cursor:pointer;" class="inventory-row" data-name="${item.chemical_name}">
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

        document.querySelectorAll('.inventory-row').forEach(row => {
            row.onclick = () => {
                selectedChemical = row.getAttribute('data-name');
                updateDrumLabels();
            };
        });

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ef4444;">Error loading inventory. Please try again.</td></tr>';
    }
}

export function cleanup() {
    // Cleanup
}
