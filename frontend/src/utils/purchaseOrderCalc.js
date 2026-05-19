export function lineAmount(quantity, price) {
  return Number(quantity || 0) * Number(price || 0);
}

export function orderItemsTotal(items = []) {
  return items.reduce((sum, it) => sum + lineAmount(it.quantity, it.price), 0);
}

export function returnsTotal(returns = []) {
  return returns.reduce((sum, r) => sum + lineAmount(r.quantity, r.price), 0);
}

export function netOrderTotal(po) {
  if (!po || po.status === 'cancelled') return 0;
  const items = po.items || [];
  const returns = po.returns || [];
  return Math.max(0, orderItemsTotal(items) - returnsTotal(returns));
}

export function orderRemaining(po) {
  const net = po?.net_total != null ? Number(po.net_total) : netOrderTotal(po);
  const paid = Number(po?.amount_paid || 0);
  return Math.max(0, net - paid);
}

export function formatPkr(n) {
  const num = Number(n || 0);
  return `PKR ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
