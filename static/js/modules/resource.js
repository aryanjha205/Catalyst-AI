export function renderResourcePage(title, subtitle, headers) {
    const container = document.createElement('div');
    container.innerHTML = `<div class="page-header"><div class="page-title"><h1>${title}</h1><p>${subtitle}</p></div></div>
        <div class="content-card"><div class="table-wrapper"><table class="data-table" id="resourceTable"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody><tr><td colspan="${headers.length}" style="text-align:center">Loading…</td></tr></tbody></table></div></div>`;
    return container;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

export async function loadRows(url, tableId, toCells) {
    const body = document.querySelector(`#${tableId} tbody`);
    try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });
        if (!response.ok) throw new Error('Request failed');
        const data = await response.json();
        body.innerHTML = data.length ? data.map(item => `<tr>${toCells(item).map(value => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${body.closest('table').querySelectorAll('th').length}" style="text-align:center">No records found.</td></tr>`;
    } catch (_) {
        body.innerHTML = `<tr><td colspan="${body.closest('table').querySelectorAll('th').length}" style="text-align:center">Unable to load records.</td></tr>`;
    }
}
