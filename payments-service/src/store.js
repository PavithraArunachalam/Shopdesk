// Tiny in-memory store. Replace with your real database later.
export const orders = new Map();
export const payments = new Map();
let orderSeq = 1000;
let paymentSeq = 0;

export function createOrder({ customer, total, currency = 'EUR' }) {
  const id = `ORD-${++orderSeq}`;
  const order = { id, customer, total, currency, status: 'Pending', history: [{ status: 'Pending', at: new Date().toISOString() }] };
  orders.set(id, order);
  return order;
}

export function setOrderStatus(order, status) {
  order.status = status;
  order.history.push({ status, at: new Date().toISOString() });
}

export function createPayment(data) {
  const id = `PAY-${++paymentSeq}`;
  const payment = { id, ...data, status: 'received', orderId: null, reason: null, createdAt: new Date().toISOString() };
  payments.set(id, payment);
  return payment;
}

export function findPaymentByExternalId(externalId) {
  return [...payments.values()].find((p) => p.externalId === externalId);
}

// Demo data so the app is not empty
createOrder({ customer: 'Alice Martin', total: 59.9 });
createOrder({ customer: 'Bob Dupont', total: 120 });
