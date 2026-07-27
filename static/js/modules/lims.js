export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>Laboratory Information System (LIMS)</h1>
                <p>Register samples, log test results (pH, moisture, viscosity, purity), and issue COAs.</p>
            </div>
            <div class="header-actions">
                <button class="btn-pill" id="registerSampleBtn" style="background: var(--btn-bg); color: #fff; border:none; box-shadow: 0 4px 10px rgba(0,230,118,0.2);">
                    <i class="fa-solid fa-plus"></i> Register Sample
                </button>
            </div>
        </div>

        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #be185d 0%, #f43f5e 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(244, 63, 94, 0.2); position: relative; overflow: hidden;">
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700;">Lab Sample Analysis</h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Log samples directly into the LIMS system. Conduct tests with precision and generate compliant Certificates of Analysis.
                </p>
            </div>
            
            <div style="flex: 0 0 300px; text-align: right; z-index: 2; position: relative;">
                <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.2) translateY(-10px) translateX(-10px);">
                    <path fill="rgba(255,255,255,0.1)" d="M50,-59.4C64.6,-49.2,76.2,-33.5,81.1,-15.8C86,1.9,84.1,21.6,73.5,36.9C62.9,52.2,43.6,63.1,23.3,68C3,72.9,-18.3,71.8,-35.1,63.5C-51.9,55.2,-64.2,39.7,-70.7,21.9C-77.2,4.1,-77.9,-16,-70,-31.6C-62.1,-47.2,-45.6,-58.3,-29.6,-62.7C-13.6,-67.1,1.9,-64.8,17.2,-61.7C32.5,-58.6,47.6,-54.6,50,-59.4Z" transform="translate(100 100)" />
                    <path d="M70,190 C70,140 130,140 130,190 Z" fill="#FFFFFF" />
                    <!-- Tie/Shirt -->
                    <path d="M90,140 L100,160 L110,140 Z" fill="#9333EA" />
                    <circle cx="100" cy="110" r="28" fill="#FDBA74" />
                    <!-- Hair -->
                    <path d="M70,110 C70,70 130,70 130,110 C130,120 110,130 100,130 C90,130 70,120 70,110 Z" fill="#78350F" />
                    <!-- Test Tube -->
                    <rect x="135" y="110" width="10" height="40" rx="5" fill="#E2E8F0" opacity="0.7" transform="rotate(20 135 110)" />
                    <path d="M135,130 L145,130 L145,150 C145,155 135,155 135,150 Z" fill="#F43F5E" transform="rotate(20 135 110)" />
                    <circle cx="140" cy="120" r="2" fill="#FDE047" transform="rotate(20 135 110)" />
                    <circle cx="142" cy="115" r="1.5" fill="#FDE047" transform="rotate(20 135 110)" />
                </svg>
            </div>
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
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
