export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>General Ledger & Financial Accounting</h1>
                <p>Track Double-entry bookkeeping ledger transactions, debits, credits, and net balances.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="postFinBtn" style="background:var(--btn-bg); color:#fff; border:none;">
                    <i class="fa-solid fa-file-invoice-dollar"></i> Post Journal Entry
                </button>
            </div>
        </div>

        <section class="grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:24px;">
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Total Debits</span>
                <strong id="totalDebits" style="display:block; margin-top:7px; font-size:32px;">$0.00</strong>
            </article>
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Total Credits</span>
                <strong id="totalCredits" style="display:block; margin-top:7px; font-size:32px;">$0.00</strong>
            </article>
            <article class="metric" style="background:#ffffff; border:1px solid var(--border-color); border-radius:14px; padding:20px;">
                <span style="color:var(--text-muted); font-size:14px;">Net Income / Surplus</span>
                <strong id="netIncome" style="display:block; margin-top:7px; font-size:32px;">$0.00</strong>
            </article>
        </section>

        <div class="content-card">
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
    `;
    return container;
}

export async function afterRender() {
    const finTable = document.querySelector('#finTable tbody');
    
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
        
        document.getElementById('totalDebits').textContent = `$${summary.total_debits.toFixed(2)}`;
        document.getElementById('totalCredits').textContent = `$${summary.total_credits.toFixed(2)}`;
        document.getElementById('netIncome').textContent = `$${summary.net_income.toFixed(2)}`;
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
                <td>$${l.amount.toFixed(2)}</td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No ledger transactions posted yet.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

export function cleanup() {}
