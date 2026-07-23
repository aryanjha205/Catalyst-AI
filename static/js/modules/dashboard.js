export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Executive Dashboard</h1>
                <p>Real-time enterprise overview, LIMS, and QA/QC metrics.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="refreshDashboardBtn"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
            </div>
        </div>

        <section class="grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:18px; margin-bottom:24px;">
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Total Inventory</span>
                <strong id="kpiInventory" style="display:block; margin-top:7px; font-size:32px;">—</strong>
            </article>
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Active Batches</span>
                <strong id="kpiBatches" style="display:block; margin-top:7px; font-size:32px;">—</strong>
            </article>
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Pending LIMS Tests</span>
                <strong id="kpiLims" style="display:block; margin-top:7px; font-size:32px;">—</strong>
            </article>
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Net Income</span>
                <strong id="kpiIncome" style="display:block; margin-top:7px; font-size:32px;">—</strong>
            </article>
        </section>

        <div class="grid" style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; margin-top:24px;">
            <div class="content-card" style="min-height: auto;">
                <h3>Recent System Activity Audit Logs</h3>
                <div class="table-wrapper" style="margin-top:15px;">
                    <table class="data-table" id="auditLogsTable">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Action</th>
                                <th>Target Entity</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" style="text-align:center;">Loading audit logs...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="content-card" style="min-height: auto; border: 1px dashed var(--secondary-color); background: rgba(0,200,83,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="color:var(--secondary-color);"><i class="fa-solid fa-brain"></i> AI Predictive Engine</h3>
                    <button class="btn-pill" id="runForecastBtn" style="background:var(--secondary-color); color:#fff; border:none; padding:6px 12px; font-size:12px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Run Forecast</button>
                </div>
                <div id="forecastResult" style="font-size:0.92rem; line-height:1.5; color:var(--text-dark);">
                    Click <strong>Run Forecast</strong> to calculate expected future inventory demands and safety reserves recommendations.
                </div>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    const runForecastBtn = document.getElementById('runForecastBtn');

    if (refreshBtn) {
        refreshBtn.onclick = () => loadDashboardData();
    }

    if (runForecastBtn) {
        runForecastBtn.onclick = async () => {
            const forecastResult = document.getElementById('forecastResult');
            forecastResult.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running predictive model analytics...';
            try {
                const res = await fetch('/api/ai/forecast', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });
                if (!res.ok) throw new Error('Forecast failed');
                const data = await res.json();
                forecastResult.innerHTML = `
                    <div style="background:rgba(255,255,255,0.7); padding:12px; border-radius:8px; border:1px solid rgba(0,0,0,0.05); margin-bottom:12px;">
                        <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase;">Predicted Demand</span>
                        <strong style="display:block; font-size:20px; color:var(--secondary-color);">${data.predicted_demand_kg} kg</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.7); padding:12px; border-radius:8px; border:1px solid rgba(0,0,0,0.05); margin-bottom:12px;">
                        <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase;">Safety Rec</span>
                        <strong style="display:block; font-size:20px; color:#1e40af;">${data.safety_stock_recommendation} kg</strong>
                    </div>
                    <p style="font-size:13px; margin:0;">${data.explanation}</p>
                    <small style="display:block; margin-top:8px; color:var(--text-muted);">Confidence level: ${(data.confidence_score * 100).toFixed(0)}%</small>
                `;
            } catch (err) {
                forecastResult.textContent = 'Could not run forecasting: ' + err.message;
            }
        };
    }

    await loadDashboardData();
}

async function loadDashboardData() {
    const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
    try {
        const resInv = await fetch('/api/inventory', { headers: authH });
        const inv = await resInv.json();
        const totalStock = inv.reduce((sum, item) => sum + item.current_stock, 0);
        document.getElementById('kpiInventory').textContent = `${totalStock.toFixed(1)} kg`;

        const resProd = await fetch('/api/production/', { headers: authH });
        const prods = await resProd.json();
        const activeBatches = prods.filter(p => p.status === 'In Progress').length;
        document.getElementById('kpiBatches').textContent = activeBatches;

        const resLims = await fetch('/api/lims/', { headers: authH });
        const lims = await resLims.json();
        const pendingLims = lims.filter(l => l.status === 'Pending').length;
        document.getElementById('kpiLims').textContent = pendingLims;

        const resFin = await fetch('/api/finance/summary', { headers: authH });
        const fin = await resFin.json();
        document.getElementById('kpiIncome').textContent = `₹${fin.net_income.toFixed(2)}`;

        const resAudit = await fetch('/api/admin/', { headers: authH });
        const logs = await resAudit.json();
        const auditBody = document.querySelector('#auditLogsTable tbody');
        auditBody.innerHTML = logs.length ? logs.slice(-5).reverse().map(l => `
            <tr>
                <td>${new Date(l.created_at).toLocaleTimeString()}</td>
                <td><strong>${l.action}</strong></td>
                <td><code>${l.entity}</code></td>
                <td>${l.details}</td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No recent audit activity found.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

export function cleanup() {}
