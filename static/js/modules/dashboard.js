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

        <div class="content-card">
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
    `;
    return container;
}

export async function afterRender() {
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) {
        refreshBtn.onclick = () => loadDashboardData();
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
        document.getElementById('kpiIncome').textContent = `$${fin.net_income.toFixed(2)}`;

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
