export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>Production & Recipe Master</h1>
                <p>Manage formulation percentages, versioning, mixing sequences, and batch runs.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="addFormulaBtn" style="background: #ffffff; color: var(--text-dark); border:1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-flask"></i> Create Recipe
                </button>
                <button class="btn-pill" id="scheduleBatchBtn" style="background: var(--btn-bg); color: #fff; border:none; box-shadow: 0 4px 10px rgba(0,230,118,0.2);">
                    <i class="fa-solid fa-circle-play"></i> Schedule Batch
                </button>
            </div>
        </div>

        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(99, 102, 241, 0.2); position: relative; overflow: hidden;">
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700;">Precision Batch Mixing</h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Control every phase of production. Enforce formula consistency and track mixing temperatures in real-time.
                </p>
            </div>
            
            <div style="flex: 0 0 300px; text-align: right; z-index: 2; position: relative;">
                <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.2) translateY(-10px) translateX(-10px);">
                    <path fill="rgba(255,255,255,0.1)" d="M47.7,-64.4C60.2,-52.7,67.6,-34.5,70.9,-16.4C74.3,1.7,73.5,19.6,65.3,34.2C57.1,48.8,41.4,60.1,24.1,65.9C6.8,71.7,-12,72,-28.9,65.4C-45.7,58.8,-60.7,45.3,-68.8,28.8C-76.9,12.3,-78.1,-7.2,-71.4,-23.1C-64.7,-39,-50.1,-51.4,-35.1,-62C-20,-72.6,-4.5,-81.4,6.7,-78.1C17.9,-74.8,35.2,-76.1,47.7,-64.4Z" transform="translate(100 100)" />
                    <path d="M70,190 C70,140 130,140 130,190 Z" fill="#F8FAFC" />
                    <!-- Apron -->
                    <path d="M85,140 L115,140 L120,190 L80,190 Z" fill="#1E40AF" opacity="0.9" />
                    <circle cx="100" cy="110" r="28" fill="#FDBA74" />
                    <!-- Goggles -->
                    <rect x="75" y="100" width="50" height="15" rx="5" fill="#38BDF8" opacity="0.6" stroke="#0EA5E9" stroke-width="2" />
                    <path d="M72,85 C72,60 128,60 128,85 C128,95 72,95 72,85 Z" fill="#1E293B" />
                    <!-- Flask -->
                    <path d="M140,130 L150,130 L160,160 C165,170 150,175 145,175 C140,175 125,170 130,160 Z" fill="#10B981" opacity="0.8" />
                    <path d="M145,130 L145,115 M145,115 L140,115 M145,115 L150,115" stroke="#CBD5E1" stroke-width="3" />
                </svg>
            </div>
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
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

        <div class="grid" style="display:grid; grid-template-columns: 1.55fr 1fr; gap:20px; margin-top:24px;">
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

            <div class="content-card" style="min-height: auto; border: 1px dashed var(--secondary-color); background: rgba(0,200,83,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="color:var(--secondary-color);"><i class="fa-solid fa-microchip"></i> AI Schedule Optimizer</h3>
                    <button class="btn-pill" id="runOptimizeBtn" style="background:var(--secondary-color); color:#fff; border:none; padding:6px 12px; font-size:12px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Optimize Schedule</button>
                </div>
                <div id="optimizeResult" style="font-size:0.92rem; line-height:1.5; color:var(--text-dark);">
                    Click <strong>Optimize Schedule</strong> to calculate optimal mixing sequences and machine assignments.
                </div>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const formulasTable = document.querySelector('#formulasTable tbody');
    const prodOrdersTable = document.querySelector('#prodOrdersTable tbody');
    const runOptimizeBtn = document.getElementById('runOptimizeBtn');

    if (runOptimizeBtn) {
        runOptimizeBtn.onclick = async () => {
            const resultDiv = document.getElementById('optimizeResult');
            resultDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading AI optimization variables...';
            try {
                const res = await fetch('/api/ai/optimize-production', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });
                if (!res.ok) throw new Error('Optimization failed');
                const data = await res.json();
                resultDiv.innerHTML = `
                    <div style="background:rgba(255,255,255,0.7); padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.05); margin-bottom:10px;">
                        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Mixing Sequence</span>
                        <p style="margin:4px 0 0 0; font-size:12px; font-weight:600; color:var(--text-dark);">${data.optimal_mixing_sequence}</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.7); padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.05); margin-bottom:10px;">
                        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Recommended Machine</span>
                        <strong style="display:block; font-size:14px; color:#1e40af;">${data.suggested_machine_id}</strong>
                    </div>
                    <p style="font-size:12px; margin:0; color:#374151;">${data.recommendation_notes}</p>
                    <small style="display:block; margin-top:6px; color:var(--text-muted);">Process Efficiency: ${(data.efficiency_score * 100).toFixed(0)}%</small>
                `;
            } catch (err) {
                resultDiv.textContent = 'Optimize failed: ' + err.message;
            }
        };
    }

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
