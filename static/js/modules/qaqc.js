export async function render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Quality Assurance & Quality Control (QA/QC)</h1>
                <p>Verify raw material checklists, log production inspections, and release batches.</p>
            </div>
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
