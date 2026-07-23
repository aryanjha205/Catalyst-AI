import { renderResourcePage, loadRows } from './resource.js';

export async function render() {
    return renderResourcePage('Finance', 'Tenant-isolated ledger entries and balances.', ['Account', 'Type', 'Amount']);
}

export async function afterRender() {
    await loadRows('/api/finance', 'resourceTable', item => [item.account_name || '—', item.transaction_type || '—', item.amount ?? 0]);
}
