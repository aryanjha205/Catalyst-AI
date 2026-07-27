export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-title">
                <h1>Quality Assurance & Quality Control</h1>
                <p>Verify raw material checklists, log production inspections, and release batches.</p>
            </div>
        </div>

        <div class="hero-section" style="display:flex; align-items:center; justify-content:space-between; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); border-radius: 20px; padding: 30px 40px; color: #fff; margin-bottom: 30px; box-shadow: 0 15px 30px rgba(20, 184, 166, 0.2); position: relative; overflow: hidden;">
            <div style="flex: 1; z-index: 2;">
                <h2 style="font-size: 2.2rem; margin-bottom: 15px; font-weight: 700;">Strict Quality Standards</h2>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; max-width: 600px; line-height: 1.6;">
                    Ensure all chemical batches meet rigorous compliance metrics before they are authorized for release.
                </p>
            </div>
            
            <div style="flex: 0 0 300px; text-align: right; z-index: 2; position: relative;">
                <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); transform: scale(1.2) translateY(-10px) translateX(-10px);">
                    <path fill="rgba(255,255,255,0.1)" d="M49,-64.2C64.6,-53.4,79,-41,84.6,-25.1C90.2,-9.2,87,10.2,77.5,26.4C68,42.6,52.2,55.6,35.1,63.9C18,72.2,-0.4,75.8,-18.2,71.5C-36,67.2,-53.2,55,-63.6,39.3C-74,23.6,-77.6,4.4,-72.6,-12.3C-67.6,-29,-54,-43.2,-39,-53.8C-24,-64.4,-7.6,-71.4,4,-76.3C15.6,-81.2,33.4,-75,49,-64.2Z" transform="translate(100 100)" />
                    <path d="M70,190 C70,140 130,140 130,190 Z" fill="#F8FAFC" />
                    <circle cx="100" cy="110" r="28" fill="#FDBA74" />
                    <!-- Cap -->
                    <path d="M65,95 C65,70 135,70 135,95 Z" fill="#14B8A6" />
                    <path d="M60,95 L110,95 C115,95 120,90 120,85 Z" fill="#0F766E" />
                    <!-- Checklist -->
                    <rect x="135" y="130" width="35" height="45" rx="3" fill="#FFFFFF" transform="rotate(-15 135 130)" />
                    <path d="M145,145 L150,150 L160,135" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-15 135 130)" />
                    <path d="M145,160 L150,165 L160,150" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-15 135 130)" />
                </svg>
            </div>
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1;"></div>
        </div>

        <div class="content-card" style="min-height: auto; margin-bottom: 24px;">
            <h3>QC Batch Approvals</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="qcTable">
                    <thead>
                        <tr>
                            <th>Batch Number</th>
                            <th>Status</th>
                            <th>COA Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="4" style="text-align:center;">Loading QC batches...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="content-card" style="min-height: auto;">
            <h3>QA Inspections Log</h3>
            <div class="table-wrapper" style="margin-top:15px;">
                <table class="data-table" id="qaTable">
                    <thead>
                        <tr>
                            <th>Inspection Type</th>
                            <th>Notes</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="3" style="text-align:center;">Loading inspections...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

export async function afterRender() {
    const qcTable = document.querySelector('#qcTable tbody');
    const qaTable = document.querySelector('#qaTable tbody');

    try {
        const authH = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
        
        const resQC = await fetch('/api/quality/qc', { headers: authH });
        const batches = await resQC.json();
        qcTable.innerHTML = batches.length ? batches.map(b => `
            <tr>
                <td><strong>${b.batch_number}</strong></td>
                <td><span class="status" style="background:${b.status === 'Approved' ? '#dcfce7' : b.status === 'Rejected' ? '#fee2e2' : '#f1f5f9'}; color:${b.status === 'Approved' ? '#166534' : b.status === 'Rejected' ? '#991b1b' : '#475569'}; padding:4px 8px; border-radius:12px; font-size:12px;">${b.status}</span></td>
                <td>${b.coa_generated ? '<span style="color:#166534;"><i class="fa-solid fa-file-pdf"></i> Verified</span>' : '<span style="color:#d97706;">Pending</span>'}</td>
                <td>
                    ${b.status === 'Hold' ? `
                        <button class="btn" style="padding:4px 8px; font-size:11px; background:#dcfce7; border:none; color:#166534;" onclick="window.updateQCStatus('${b.batch_number}', 'Approved')">Release</button>
                        <button class="btn" style="padding:4px 8px; font-size:11px; background:#fee2e2; border:none; color:#991b1b;" onclick="window.updateQCStatus('${b.batch_number}', 'Rejected')">Reject</button>
                    ` : '<span style="color:var(--text-muted); font-size:12px;">Locked</span>'}
                </td>
            </tr>
        `).join('') : '<tr><td colspan="4" style="text-align:center;">No production batches logged.</td></tr>';

        const resQA = await fetch('/api/quality/inspections', { headers: authH });
        const inspections = await resQA.json();
        qaTable.innerHTML = inspections.length ? inspections.map(i => `
            <tr>
                <td><strong>${i.inspection_type}</strong></td>
                <td>${i.notes || 'No remarks'}</td>
                <td><span style="color:${i.passed ? '#166534' : '#991b1b'}; font-weight:600;">${i.passed ? 'Passed' : 'Failed'}</span></td>
            </tr>
        `).join('') : '<tr><td colspan="3" style="text-align:center;">No inspections logged yet.</td></tr>';

    } catch (err) {
        console.error(err);
    }
}

window.updateQCStatus = async (batchNumber, statusVal) => {
    try {
        const res = await fetch(`/api/quality/qc/${batchNumber}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({ status: statusVal })
        });
        if (!res.ok) throw new Error('Failed to update batch QC status');
        await afterRender();
    } catch (err) {
        alert(err.message);
    }
};

export function cleanup() {}
