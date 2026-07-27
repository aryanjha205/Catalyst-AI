export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>General Ledger & Finance</h1>
                <p>Track Double-entry bookkeeping ledger transactions, debits, credits, and net balances.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="postFinBtn" style="background:var(--btn-bg); color:#fff; border:none; box-shadow: 0 4px 10px rgba(0,230,118,0.2);">
                    <i class="fa-solid fa-file-invoice-dollar"></i> Post Journal Entry
                </button>
            </div>
        </div>

        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #166534 0%, #22c55e 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(34, 197, 94, 0.2); position: relative; overflow: hidden;">
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700;">Financial Intelligence</h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Gain crystal-clear visibility into company finances. Monitor net income, analyze cash flow, and ensure compliance.
                </p>
            </div>
            
            <div style="flex: 0 0 300px; text-align: right; z-index: 2; position: relative;">
                <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.2) translateY(-10px) translateX(-10px);">
                    <path fill="rgba(255,255,255,0.1)" d="M50,-60C65,-45,75,-25,75,-5C75,15,65,35,50,50C35,65,15,75,-5,75C-25,75,-45,65,-60,50C-75,35,-85,15,-85,-5C-85,-25,-75,-45,-60,-60C-45,-75,-25,-85,-5,-85C15,-85,35,-75,50,-60Z" transform="translate(100 100)" />
                    <!-- Body Suit -->
                    <path d="M60,190 C60,140 140,140 140,190 Z" fill="#047857" />
                    <!-- Shirt/Tie -->
                    <path d="M90,140 L100,165 L110,140 Z" fill="#FFFFFF" />
                    <path d="M98,140 L100,160 L102,140 Z" fill="#FACC15" />
                    <circle cx="100" cy="110" r="28" fill="#FDBA74" />
                    <!-- Hair -->
                    <path d="M72,105 C72,70 128,70 128,105 C128,95 72,95 72,105 Z" fill="#1E293B" />
                    <!-- Calculator/Phone -->
                    <rect x="135" y="130" width="20" height="30" rx="3" fill="#1E293B" transform="rotate(15 135 130)" />
                    <rect x="138" y="133" width="14" height="10" fill="#34D399" transform="rotate(15 135 130)" />
                    <!-- Graph behind -->
                    <path d="M10,130 Q40,160 60,120 T100,100" fill="none" stroke="#FDE047" stroke-width="4" stroke-dasharray="5,5" />
                    <circle cx="100" cy="100" r="5" fill="#FDE047" />
                </svg>
            </div>
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
        </div>

        <section class="grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:24px;">
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Total Debits</span>
                <strong id="totalDebits" style="display:block; margin-top:7px; font-size:32px;">₹0.00</strong>
            </article>
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Total Credits</span>
                <strong id="totalCredits" style="display:block; margin-top:7px; font-size:32px;">₹0.00</strong>
            </article>
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Net Income / Surplus</span>
                <strong id="netIncome" style="display:block; margin-top:7px; font-size:32px;">₹0.00</strong>
            </article>
        </section>

        <div class="grid" style="display:grid; grid-template-columns: 1.55fr 1fr; gap:20px; margin-top:24px;">
            <div class="content-card" style="min-height: auto;">
                <h3>General Ledger Transactions</h3>
                <div class="table-wrapper" style="margin-top:15px;">
                    <table class="data-table" id="finTable">
                        <thead>
                            <tr>
                                <th>Transaction Date</th>
                                <th>Account Name</th>
                                <th>Transaction Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" style="text-align:center;">Loading ledger entries...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="content-card" style="min-height: auto; border: 1px dashed var(--secondary-color); background: rgba(0,200,83,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="color:var(--secondary-color);"><i class="fa-solid fa-coins"></i> AI Cost Auditor</h3>
                    <button class="btn-pill" id="runAuditBtn" style="background:var(--secondary-color); color:#fff; border:none; padding:6px 12px; font-size:12px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Audit Ledgers</button>
                </div>
                <div id="auditResult" style="font-size:0.92rem; line-height:1.5; color:var(--text-dark);">
                    Click <strong>Audit Ledgers</strong> to run AI double-entry transaction integrity auditing and expense optimization advice.
                </div>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const finTable = document.querySelector('#finTable tbody');
    const runAuditBtn = document.getElementById('runAuditBtn');

    if (runAuditBtn) {
        runAuditBtn.onclick = async () => {
            const auditResult = document.getElementById('auditResult');
            auditResult.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Auditing ledger transaction balances...';
            try {
                const res = await fetch('/api/ai/finance-audit', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });
                if (!res.ok) throw new Error('Ledger audit failed');
                const data = await res.json();
                auditResult.innerHTML = `
                    <div style="background:rgba(255,255,255,0.7); padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.05); margin-bottom:10px;">
                        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Ledger Integrity Risk</span>
                        <strong style="display:block; font-size:16px; color:${data.risk_score > 0.2 ? '#ca3f3f' : '#00c853'};">${(data.risk_score * 100).toFixed(0)}% Risk</strong>
                    </div>
                    <ul style="padding-left:16px; margin:0; font-size:12px; line-height:1.5; color:#374151;">
                        ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                `;
            } catch (err) {
                auditResult.textContent = 'Audit failed: ' + err.message;
            }
        };
    }
    
    const postFinBtn = document.getElementById('postFinBtn');
    const dialogFinance = document.getElementById('dialogFinance');
    const formFinance = document.getElementById('formFinance');

    if (postFinBtn && dialogFinance) postFinBtn.onclick = () => dialogFinance.showModal();

    if (formFinance) {
        formFinance.onsubmit = async (e) => {
            const payload = {
                account_name: document.getElementById('fin_account').value,
                transaction_type: document.getElementById('fin_type').value,
                amount: parseFloat(document.getElementById('fin_amount').value)
            };

            try {
                const res = await fetch('/api/finance/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to post ledger entry');
                dialogFinance.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    try {
        const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
        
        const resSum = await fetch('/api/finance/summary', { headers: authH });
        const summary = await resSum.json();
        
        document.getElementById('totalDebits').textContent = `₹${summary.total_debits.toFixed(2)}`;
        document.getElementById('totalCredits').textContent = `₹${summary.total_credits.toFixed(2)}`;
        document.getElementById('netIncome').textContent = `₹${summary.net_income.toFixed(2)}`;
        if (summary.net_income < 0) {
            document.getElementById('netIncome').style.color = '#ca3f3f';
        } else {
            document.getElementById('netIncome').style.color = '#00c853';
        }

        const resL = await fetch('/api/finance/', { headers: authH });
        const ledger = await resL.json();
        finTable.innerHTML = ledger.length ? ledger.map(l => `
            <tr>
                <td>${new Date(l.created_at).toLocaleDateString()}</td>
                <td><strong>${l.account_name}</strong></td>
                <td><span style="color:${l.transaction_type === 'Debit' ? '#1e40af' : '#166534'}; font-weight:600;">${l.transaction_type}</span></td>
                <td>₹${l.amount.toFixed(2)}</td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No ledger transactions posted yet.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

export function cleanup() {}
