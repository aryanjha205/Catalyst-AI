export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>Executive Dashboard</h1>
                <p>Real-time enterprise overview, LIMS, and QA/QC metrics.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="refreshDashboardBtn" style="background:var(--card-bg); color:var(--text-dark); border:1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-rotate-right"></i> Refresh
                </button>
            </div>
        </div>

        <!-- Professional Hero Section with Human Cartoon Poster -->
        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(59, 130, 246, 0.2); position: relative; overflow: hidden;">
            
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700; color: #ffffff;">Welcome back, Manager! <span style="font-size: 2rem;">👋</span></h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Your plant is operating at <strong>optimal efficiency</strong>. All key performance indicators are healthy. The AI predictive engine has generated new insights for your supply chain.
                </p>
                <button class="btn-pill" style="background: #ffffff; color: #1e3a8a; font-weight: 600; padding: 12px 24px; border: none; font-size: 1rem; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                    <i class="fa-solid fa-chart-line"></i> View Detailed Analytics
                </button>
            </div>

            <!-- Attractive Human Cartoon SVG Poster -->
            <div style="flex: 0 0 350px; text-align: right; z-index: 2; position: relative;">
                <svg width="280" height="220" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.3) translateY(-10px) translateX(-20px);">
                    <!-- Background blobs -->
                    <path fill="rgba(255,255,255,0.1)" d="M54.1,-63.9C69.3,-50.2,80.4,-32.8,85.2,-13.6C90,5.6,88.5,26.5,77,41.9C65.5,57.3,44.1,67.2,21.8,73.4C-0.5,79.6,-23.7,82.1,-43.3,73.7C-62.9,65.3,-78.9,46,-84.9,23.8C-90.9,1.6,-86.9,-23.4,-74,-42.6C-61.1,-61.8,-39.3,-75.2,-19.7,-77.8C-0.1,-80.4,17.4,-72.1,34.9,-63.9Z" transform="translate(100 100)" />
                    <!-- Character Body -->
                    <path d="M70,190 C70,140 130,140 130,190 Z" fill="#E2E8F0" />
                    <!-- Lab Coat detail -->
                    <path d="M100,140 L100,190" stroke="#CBD5E1" stroke-width="2" />
                    <!-- Tie/Shirt -->
                    <path d="M90,140 L100,160 L110,140 Z" fill="#3B82F6" />
                    <!-- Head / Face -->
                    <circle cx="100" cy="110" r="30" fill="#FFD3B6" />
                    <!-- Hair -->
                    <path d="M68,110 C68,70 132,70 132,110 C132,90 68,90 68,110 Z" fill="#475569" />
                    <path d="M90,75 C90,65 110,65 110,75 Z" fill="#475569" />
                    <!-- Glasses -->
                    <rect x="80" y="100" width="16" height="10" rx="3" fill="none" stroke="#1E293B" stroke-width="2" />
                    <rect x="104" y="100" width="16" height="10" rx="3" fill="none" stroke="#1E293B" stroke-width="2" />
                    <path d="M96,105 L104,105" stroke="#1E293B" stroke-width="2" />
                    <!-- Smile -->
                    <path d="M90,125 Q100,135 110,125" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" />
                    <!-- Clipboard -->
                    <rect x="60" y="145" width="25" height="35" rx="2" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" transform="rotate(-15 60 145)" />
                    <rect x="65" y="142" width="15" height="4" rx="1" fill="#94A3B8" transform="rotate(-15 60 145)" />
                    <line x1="65" y1="155" x2="80" y2="155" stroke="#CBD5E1" stroke-width="1" transform="rotate(-15 60 145)" />
                    <line x1="65" y1="162" x2="75" y2="162" stroke="#CBD5E1" stroke-width="1" transform="rotate(-15 60 145)" />
                    <circle cx="150" cy="80" r="15" fill="#FCD34D" opacity="0.8" />
                    <circle cx="40" cy="50" r="8" fill="#60A5FA" opacity="0.6" />
                </svg>
            </div>
            
            <!-- Decorative elements background -->
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
            <div style="position: absolute; bottom: -80px; left: -20px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
        </div>

        <!-- Key Metrics Cards -->
        <section class="grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:30px;">
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:16px; padding:24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="color:var(--text-muted); font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Total Inventory</span>
                    <div style="width:40px; height:40px; border-radius:10px; background:rgba(59,130,246,0.1); display:flex; align-items:center; justify-content:center; color:#3b82f6;">
                        <i class="fa-solid fa-boxes-stacked"></i>
                    </div>
                </div>
                <strong id="kpiInventory" style="display:block; font-size:2rem; color:var(--text-dark);">—</strong>
                <div style="margin-top:10px; font-size:0.85rem; color:#10b981;"><i class="fa-solid fa-arrow-trend-up"></i> +4.2% from last month</div>
            </article>

            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:16px; padding:24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="color:var(--text-muted); font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Active Batches</span>
                    <div style="width:40px; height:40px; border-radius:10px; background:rgba(245,158,11,0.1); display:flex; align-items:center; justify-content:center; color:#f59e0b;">
                        <i class="fa-solid fa-industry"></i>
                    </div>
                </div>
                <strong id="kpiBatches" style="display:block; font-size:2rem; color:var(--text-dark);">—</strong>
                <div style="margin-top:10px; font-size:0.85rem; color:#10b981;"><i class="fa-solid fa-arrow-trend-up"></i> Running smoothly</div>
            </article>

            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:16px; padding:24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="color:var(--text-muted); font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Pending LIMS Tests</span>
                    <div style="width:40px; height:40px; border-radius:10px; background:rgba(239,68,68,0.1); display:flex; align-items:center; justify-content:center; color:#ef4444;">
                        <i class="fa-solid fa-vial-virus"></i>
                    </div>
                </div>
                <strong id="kpiLims" style="display:block; font-size:2rem; color:var(--text-dark);">—</strong>
                <div style="margin-top:10px; font-size:0.85rem; color:#ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Requires attention</div>
            </article>

            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:16px; padding:24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="color:var(--text-muted); font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Net Income</span>
                    <div style="width:40px; height:40px; border-radius:10px; background:rgba(16,185,129,0.1); display:flex; align-items:center; justify-content:center; color:#10b981;">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                </div>
                <strong id="kpiIncome" style="display:block; font-size:2rem; color:var(--text-dark);">—</strong>
                <div style="margin-top:10px; font-size:0.85rem; color:#10b981;"><i class="fa-solid fa-arrow-trend-up"></i> +12% vs last quarter</div>
            </article>
        </section>

        <!-- Lower Dashboard Section: Logs & AI -->
        <div class="grid" style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
            <div class="content-card" style="min-height: auto; border-radius: 16px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;"><i class="fa-solid fa-clipboard-list" style="color:var(--text-muted); margin-right:8px;"></i> System Activity Audit Logs</h3>
                    <button class="btn-pill" style="font-size:12px; background:var(--bg-light); color:var(--text-dark); border:1px solid var(--border-color);">View All</button>
                </div>
                <div class="table-wrapper">
                    <table class="data-table" id="auditLogsTable">
                        <thead style="background:var(--bg-light);">
                            <tr>
                                <th style="border-radius: 8px 0 0 8px;">Time</th>
                                <th>Action</th>
                                <th>Target Entity</th>
                                <th style="border-radius: 0 8px 8px 0;">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" style="text-align:center; padding: 30px;">Loading audit logs...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="content-card" style="min-height: auto; border-radius: 16px; padding: 24px; background: linear-gradient(180deg, rgba(16,185,129,0.03) 0%, rgba(255,255,255,1) 100%); border: 1px solid rgba(16,185,129,0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.03); position: relative; overflow: hidden;">
                <!-- Decorative AI background -->
                <div style="position: absolute; top: -30px; right: -30px; font-size: 150px; opacity: 0.03; color: var(--secondary-color); pointer-events: none;">
                    <i class="fa-solid fa-microchip"></i>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; position: relative; z-index: 2;">
                    <h3 style="margin:0; color:var(--secondary-color); display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-brain fa-fade" style="font-size: 1.2rem;"></i> AI Predictive Engine
                    </h3>
                </div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom: 20px; line-height: 1.5; position: relative; z-index: 2;">
                    Leverage advanced machine learning to forecast upcoming inventory demands and optimize safety reserves based on historical trends.
                </p>
                <button class="btn-pill" id="runForecastBtn" style="background:var(--secondary-color); color:#fff; border:none; padding:10px 16px; font-size:14px; width: 100%; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(16,185,129,0.2); position: relative; z-index: 2;">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Run Intelligent Forecast
                </button>
                <div id="forecastResult" style="font-size:0.95rem; line-height:1.6; color:var(--text-dark); position: relative; z-index: 2;">
                    <div style="text-align: center; color: var(--text-muted); padding: 20px; border: 1px dashed var(--border-color); border-radius: 12px; background: rgba(255,255,255,0.5);">
                        Ready for analysis.
                    </div>
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
