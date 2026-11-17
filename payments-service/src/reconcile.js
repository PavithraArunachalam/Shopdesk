import { orders, setOrderStatus } from './store.js';
import { matchPayment } from './matcher.js';

const MIN_CONFIDENCE = 0.8;

// The LLM suggests; this code decides. Money rules are never left to the model.
export async function reconcile(payment) {
  const openOrders = [...orders.values()].filter((o) => o.status === 'Pending');

  let match;
  try {
    match = await matchPayment(payment, openOrders);
  } catch (err) {
    match = { orderId: null, confidence: 0, reason: `matcher error: ${err.message}` };
  }

  const order = openOrders.find((o) => o.id === match.orderId);
  if (!order) return review(payment, match.reason || 'no matching open order');
  if (match.confidence < MIN_CONFIDENCE) return review(payment, `low confidence (${match.confidence})`);
  if (payment.currency !== order.currency) return review(payment, 'currency does not match order');
  if (Math.round(payment.amount * 100) !== Math.round(order.total * 100)) {
    return review(payment, `amount ${payment.amount} does not match order total ${order.total}`);
  }

  setOrderStatus(order, 'Paid');
  payment.status = 'reconciled';
  payment.orderId = order.id;
  payment.reason = match.reason;
  return payment;
}

function review(payment, reason) {
  payment.status = 'needs_review';
  payment.reason = reason;
  return payment;
}
