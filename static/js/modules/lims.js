export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Laboratory Information Management System (LIMS)</h1>
                <p>Register samples, log test results (pH, moisture, viscosity, purity), and issue COAs.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="registerSampleBtn" style="background: var(--btn-bg); color: #fff; border:none;">
                    <i class="fa-solid fa-plus"></i> Register Sample
                </button>
            </div>
        </div>

        <div class="content-card">
            <div class="table-wrapper">
                <table class="data-table" id="limsTable">
                    <thead>
                        <tr>
                            <th>Sample ID</th>
                            <th>Test Type</th>
                            <th>Current Result</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="5" style="text-align:center;">Loading lab samples...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const limsTable = document.querySelector('#limsTable tbody');
    const registerSampleBtn = document.getElementById('registerSampleBtn');
    const dialogLims = document.getElementById('dialogLims');
    const formLims = document.getElementById('formLims');

    if (registerSampleBtn && dialogLims) registerSampleBtn.onclick = () => dialogLims.showModal();

    if (formLims) {
        formLims.onsubmit = async (e) => {
            const payload = {
                sample_id: document.getElementById('lims_sample').value,
                test_type: document.getElementById('lims_test_type').value,
                result_value: document.getElementById('lims_result').value || null
            };

            try {
                const res = await fetch('/api/lims/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to register sample');
                dialogLims.close();
                await afterRender();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    try {
        const res = await fetch('/api/lims/', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        const samples = await res.json();
        limsTable.innerHTML = samples.length ? samples.map(s => `
            <tr>
                <td><strong>${s.sample_id}</strong></td>
                <td><span style="font-weight:600;">${s.test_type}</span></td>
                <td><code>${s.result_value || 'Pending'}</code></td>
                <td><span class="status" style="background:${s.status === 'Approved' ? '#dcfce7' : s.status === 'Rejected' ? '#fee2e2' : '#f1f5f9'}; color:${s.status === 'Approved' ? '#166534' : s.status === 'Rejected' ? '#991b1b' : '#475569'}; padding:4px 8px; border-radius:12px; font-size:12px;">${s.status}</span></td>
                <td>
                    ${s.status === 'Pending' ? `
                        <div style="display:flex; gap: 8px;">
                            <input type="text" id="res_${s.id}" placeholder="Enter Value" style="padding:4px 8px; font-size:12px; border:1px solid #ccc; border-radius:6px; width:100px;">
                            <button class="btn" style="padding:4px 8px; font-size:11px; background:#dcfce7; border:none; color:#166534;" onclick="window.submitTestResult('${s.id}', 'Approved')">Approve (COA)</button>
                            <button class="btn" style="padding:4px 8px; font-size:11px; background:#fee2e2; border:none; color:#991b1b;" onclick="window.submitTestResult('${s.id}', 'Rejected')">Reject</button>
                        </div>
                    ` : `
                        <span style="color:var(--text-muted); font-size:12px;"><i class="fa-solid fa-file-pdf"></i> COA Archived</span>
                    `}
                </td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align:center;">No lab test samples logged.</td></tr>';
    } catch (err) {
        console.error(err);
    }
}

window.submitTestResult = async (testId, statusVal) => {
    const valInput = document.getElementById(`res_${testId}`);
    const resVal = valInput ? valInput.value : 'Done';
    if (!resVal && statusVal === 'Approved') {
        alert('Please enter a result value first (e.g. pH 6.8)!');
        return;
    }

    try {
        const res = await fetch(`/api/lims/${testId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({ result_value: resVal, status: statusVal })
        });
        if (!res.ok) throw new Error('Failed to update result');
        await afterRender();
    } catch (err) {
        alert(err.message);
    }
};

export function cleanup() {}
