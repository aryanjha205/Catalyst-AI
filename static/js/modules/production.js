import { renderResourcePage, loadRows } from './resource.js';

export async function render() {
    return renderResourcePage('Production Orders', 'Plan and track manufacturing batches.', ['Batch', 'Planned quantity', 'Status']);
}

export async function afterRender() {
    await loadRows('/api/production', 'resourceTable', item => [item.batch_number || '—', item.quantity_planned ?? '—', item.status || 'Planned']);
}
