export const darkTagStyle = (bg, color = '#fff') => ({
  backgroundColor: bg,
  color,
  border: 'none',
  fontWeight: 600,
});

export const TYPE_TAG = {
  sale: darkTagStyle('#166534'),
  purchase: darkTagStyle('#1e3a8a'),
};

export const PARTY_TAG = {
  customer: darkTagStyle('#0f766e'),
  supplier: darkTagStyle('#9a3412'),
};

export const STATUS_TAG = {
  pending: darkTagStyle('#475569'),
  partial: darkTagStyle('#b45309'),
  paid: darkTagStyle('#15803d'),
  overdue: darkTagStyle('#b91c1c'),
  cancelled: darkTagStyle('#64748b'),
};

export const METHOD_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  credit_card: 'Credit card',
  debit_card: 'Debit card',
  cheque: 'Cheque',
  online: 'Online',
  wallet: 'Wallet',
};

export function formatPaymentDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function getPartyDisplay(payment) {
  if (!payment) return { label: '—', type: '—', isCustomer: true };
  const isCustomer = payment.party_type === 'customer' || payment.payment_type === 'sale';
  const name =
    payment.party_name ||
    (isCustomer ? payment.customer?.name : payment.supplier?.name) ||
    '—';
  return {
    label: name,
    type: isCustomer ? 'Customer' : 'Supplier',
    isCustomer,
  };
}
