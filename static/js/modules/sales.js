import { renderResourcePage, loadRows } from './resource.js';

export async function render() {
    return renderResourcePage('Sales & CRM', 'Sales orders and customer activity.', ['Order', 'Amount', 'Status']);
}

export async function afterRender() {
    await loadRows('/api/sales', 'resourceTable', item => [item.id.slice(0, 8), item.total_amount ?? 0, item.status || 'Draft']);
}
