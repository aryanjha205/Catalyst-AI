export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Sales & CRM</h1>
                <p>Manage customer directories, credit limits, and book sales orders.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="addCustBtn" style="background:#ffffff; color:var(--text-dark); border:1px solid var(--border-color);">
                    <i class="fa-solid fa-user-plus"></i> Onboard Customer
                </button>
                <button class="btn-pill" id="bookOrderBtn" style="background:var(--btn-bg); color:#fff; border:none;">
                    <i class="fa-solid fa-cart-shopping"></i> Book Sales Order
                </button>
            </div>
        </div>

        <div class="content-card" style="min-height: auto; margin-bottom: 24px;">
            <h3>Sales Orders Log</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="soTable">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer ID</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="4" style="text-align:center;">Loading orders...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="content-card" style="min-height: auto;">
            <h3>Customer Directory</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="custTable">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Credit Limit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="3" style="text-align:center;">Loading customers...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const soTable = document.querySelector('#soTable tbody');
    const custTable = document.querySelector('#custTable tbody');

    const addCustBtn = document.getElementById('addCustBtn');
    const dialogCustomer = document.getElementById('dialogCustomer');
    const formCustomer = document.getElementById('formCustomer');

    const bookOrderBtn = document.getElementById('bookOrderBtn');
    const dialogSalesOrder = document.getElementById('dialogSalesOrder');
    const formSalesOrder = document.getElementById('formSalesOrder');

    if (addCustBtn && dialogCustomer) addCustBtn.onclick = () => dialogCustomer.showModal();
    if (bookOrderBtn && dialogSalesOrder) bookOrderBtn.onclick = () => dialogSalesOrder.showModal();

    if (formCustomer) {
        formCustomer.onsubmit = async (e) => {
            const payload = {
                name: document.getElementById('cust_name').value,
                email: document.getElementById('cust_email').value,
                credit_limit: parseFloat(document.getElementById('cust_credit').value || 5000)
            };

            try {
                const res = await fetch('/api/sales/customers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to onboard customer');
                dialogCustomer.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    if (formSalesOrder) {
        formSalesOrder.onsubmit = async (e) => {
            const payload = {
                customer_id: document.getElementById('so_customer_id').value,
                total_amount: parseFloat(document.getElementById('so_amount').value)
            };

            try {
                const res = await fetch('/api/sales/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to book order');
                }
                dialogSalesOrder.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    try {
        const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
        
        const resC = await fetch('/api/sales/customers', { headers: authH });
        const customers = await resC.json();
        custTable.innerHTML = customers.length ? customers.map(c => `
            <tr>
                <td><strong>${c.name}</strong><br><small style="color:var(--text-muted);">ID: <code>${c.id}</code></small></td>
                <td>${c.email}</td>
                <td>$${c.credit_limit}</td>
            </tr>
        `).join('') : '<tr><td colspan="3" style="text-align:center;">No customers onboarded.</td></tr>';

        const resO = await fetch('/api/sales/orders', { headers: authH });
        const orders = await resO.json();
        soTable.innerHTML = orders.length ? orders.map(o => `
            <tr>
                <td><code>${o.id.slice(0, 8)}</code></td>
                <td><code>${o.customer_id.slice(0, 8)}</code></td>
                <td>$${o.total_amount}</td>
                <td><span style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600;">${o.status}</span></td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No sales orders booked.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

export function cleanup() {}
