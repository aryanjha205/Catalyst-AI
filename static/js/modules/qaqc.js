import { renderResourcePage, loadRows } from './resource.js';

export async function render() {
    return renderResourcePage('Quality Assurance', 'Incoming, in-process, and final inspections.', ['Inspection', 'Notes', 'Result']);
}

export async function afterRender() {
    await loadRows('/api/quality', 'resourceTable', item => [item.inspection_type || '—', item.notes || '—', item.passed ? 'Passed' : 'Pending / failed']);
}
