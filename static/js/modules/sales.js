export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>Sales & CRM</h1>
                <p>Manage customer directories, credit limits, and book sales orders.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="addCustBtn" style="background:#ffffff; color:var(--text-dark); border:1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-user-plus"></i> Onboard Customer
                </button>
                <button class="btn-pill" id="bookOrderBtn" style="background:var(--btn-bg); color:#fff; border:none; box-shadow: 0 4px 10px rgba(0,230,118,0.2);">
                    <i class="fa-solid fa-cart-shopping"></i> Book Sales Order
                </button>
            </div>
        </div>

        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(2, 132, 199, 0.2); position: relative; overflow: hidden;">
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700;">Revenue & Client Management</h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Build strong relationships. Track client credit limits, negotiate deals, and monitor outbound sales volume seamlessly.
                </p>
            </div>
            
            <div style="flex: 0 0 300px; text-align: right; z-index: 2; position: relative;">
                <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.2) translateY(-10px) translateX(-10px);">
                    <path fill="rgba(255,255,255,0.1)" d="M49,-64.2C64.6,-53.4,79,-41,84.6,-25.1C90.2,-9.2,87,10.2,77.5,26.4C68,42.6,52.2,55.6,35.1,63.9C18,72.2,-0.4,75.8,-18.2,71.5C-36,67.2,-53.2,55,-63.6,39.3C-74,23.6,-77.6,4.4,-72.6,-12.3C-67.6,-29,-54,-43.2,-39,-53.8C-24,-64.4,-7.6,-71.4,4,-76.3C15.6,-81.2,33.4,-75,49,-64.2Z" transform="translate(100 100)" />
                    <!-- Body Suit -->
                    <path d="M60,190 C60,130 140,130 140,190 Z" fill="#0F172A" />
                    <!-- Shirt/Tie -->
                    <path d="M90,130 L100,160 L110,130 Z" fill="#FFFFFF" />
                    <path d="M97,130 L100,150 L103,130 Z" fill="#EF4444" />
                    <!-- Head -->
                    <circle cx="100" cy="100" r="28" fill="#FDBA74" />
                    <!-- Hair -->
                    <path d="M72,95 C72,60 128,60 128,95 C128,85 72,85 72,95 Z" fill="#475569" />
                    <!-- Chart Graphic -->
                    <rect x="130" y="110" width="40" height="30" rx="2" fill="#F8FAFC" transform="rotate(-15 130 110)" />
                    <rect x="135" y="125" width="6" height="10" fill="#10B981" transform="rotate(-15 130 110)" />
                    <rect x="145" y="120" width="6" height="15" fill="#3B82F6" transform="rotate(-15 130 110)" />
                    <rect x="155" y="115" width="6" height="20" fill="#F59E0B" transform="rotate(-15 130 110)" />
                    <!-- Arrow -->
                    <path d="M135,130 L145,120 L155,110 L165,100" stroke="#EF4444" stroke-width="2" fill="none" transform="rotate(-15 130 110)" />
                </svg>
            </div>
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
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
                <td>₹${c.credit_limit}</td>
            </tr>
        `).join('') : '<tr><td colspan="3" style="text-align:center;">No customers onboarded.</td></tr>';

        const resO = await fetch('/api/sales/orders', { headers: authH });
        const orders = await resO.json();
        soTable.innerHTML = orders.length ? orders.map(o => `
            <tr>
                <td><code>${o.id.slice(0, 8)}</code></td>
                <td><code>${o.customer_id.slice(0, 8)}</code></td>
                <td>₹${o.total_amount}</td>
                <td><span style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600;">${o.status}</span></td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No sales orders booked.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

export function cleanup() {}
