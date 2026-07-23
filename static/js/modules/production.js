export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Production & Recipe Master</h1>
                <p>Manage formulation percentages, versioning, mixing sequences, and batch runs.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="addFormulaBtn" style="background: #ffffff; color: var(--text-dark); border:1px solid var(--border-color);">
                    <i class="fa-solid fa-flask"></i> Create Recipe
                </button>
                <button class="btn-pill" id="scheduleBatchBtn" style="background: var(--btn-bg); color: #fff; border:none;">
                    <i class="fa-solid fa-circle-play"></i> Schedule Batch
                </button>
            </div>
        </div>

        <div class="content-card" style="min-height: auto; margin-bottom: 24px;">
            <h3>Production Batch Orders</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="prodOrdersTable">
                    <thead>
                        <tr>
                            <th>Batch Code</th>
                            <th>Product ID</th>
                            <th>Quantity Planned</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="5" style="text-align:center;">Loading orders...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="content-card" style="min-height: auto;">
            <h3>Active Formulations</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="formulasTable">
                    <thead>
                        <tr>
                            <th>Recipe Name</th>
                            <th>Version</th>
                            <th>Finished Product</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="4" style="text-align:center;">Loading formulas...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const formulasTable = document.querySelector('#formulasTable tbody');
    const prodOrdersTable = document.querySelector('#prodOrdersTable tbody');

    const addFormulaBtn = document.getElementById('addFormulaBtn');
    const dialogFormula = document.getElementById('dialogFormula');
    const formFormula = document.getElementById('formFormula');

    const scheduleBatchBtn = document.getElementById('scheduleBatchBtn');
    const dialogProduction = document.getElementById('dialogProduction');
    const formProduction = document.getElementById('formProduction');

    if (addFormulaBtn && dialogFormula) addFormulaBtn.onclick = () => dialogFormula.showModal();
    if (scheduleBatchBtn && dialogProduction) scheduleBatchBtn.onclick = () => dialogProduction.showModal();

    if (formFormula) {
        formFormula.onsubmit = async (e) => {
            let ingredients = [];
            try {
                ingredients = JSON.parse(document.getElementById('formula_ingredients_json').value);
            } catch (err) {
                alert('Invalid JSON in ingredients list!');
                return;
            }

            const payload = {
                product_id: document.getElementById('formula_product_id').value,
                name: document.getElementById('formula_name').value,
                version: document.getElementById('formula_version').value || '1.0.0',
                mixing_sequence: document.getElementById('formula_sequence').value || '',
                process_parameters: document.getElementById('formula_params').value || '',
                ingredients: ingredients
            };

            try {
                const res = await fetch('/api/production/formulas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to create recipe');
                }
                dialogFormula.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    if (formProduction) {
        formProduction.onsubmit = async (e) => {
            const payload = {
                product_id: document.getElementById('prod_product_id').value,
                quantity_planned: parseFloat(document.getElementById('prod_qty').value),
                batch_number: document.getElementById('prod_batch').value || null
            };

            try {
                const res = await fetch('/api/production/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to schedule batch');
                }
                dialogProduction.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    try {
        const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
        
        const resP = await fetch('/api/production/', { headers: authH });
        const orders = await resP.json();
        prodOrdersTable.innerHTML = orders.length ? orders.map(o => `
            <tr>
                <td><strong>${o.batch_number}</strong></td>
                <td><code>${o.product_id.slice(0, 8)}</code></td>
                <td>${o.quantity_planned} kg</td>
                <td><span class="status" style="background:${o.status === 'Completed' ? '#dcfce7' : o.status === 'In Progress' ? '#dbeafe' : '#f1f5f9'}; color:${o.status === 'Completed' ? '#166534' : o.status === 'In Progress' ? '#1e40af' : '#475569'}; padding: 4px 8px; border-radius:12px; font-size:12px;">${o.status}</span></td>
                <td>
                    ${o.status === 'Planned' ? `<button class="btn" style="padding:4px 8px; font-size:11px;" onclick="window.updateBatchStatus('${o.id}', 'In Progress')">Start Run</button>` : ''}
                    ${o.status === 'In Progress' ? `<button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="window.updateBatchStatus('${o.id}', 'Completed')">Complete</button>` : ''}
                </td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align:center;">No batch manufacturing runs scheduled.</td></tr>';

        const resF = await fetch('/api/production/formulas', { headers: authH });
        const formulas = await resF.json();
        formulasTable.innerHTML = formulas.length ? formulas.map(f => `
            <tr>
                <td><strong>${f.name}</strong></td>
                <td>${f.version}</td>
                <td><code>${f.product_id.slice(0, 8)}</code></td>
                <td><span style="color:#166534; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Approved</span></td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No recipes configured yet.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

window.updateBatchStatus = async (orderId, newStatus) => {
    try {
        const res = await fetch(`/api/production/orders/${orderId}/status?status=${newStatus}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        if (!res.ok) throw new Error('Failed to update status');
        await afterRender();
    } catch (err) {
        alert(err.message);
    }
};

export function cleanup() {}
