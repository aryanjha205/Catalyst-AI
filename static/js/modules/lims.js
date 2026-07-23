import { renderResourcePage, loadRows } from './resource.js';

export async function render() {
    return renderResourcePage('Laboratory', 'Monitor samples, testing, and approvals.', ['Sample', 'Test', 'Result', 'Status']);
}

export async function afterRender() {
    await loadRows('/api/lims', 'resourceTable', item => [item.sample_id || '—', item.test_type || '—', item.result_value || 'Pending', item.status || 'Pending']);
}
