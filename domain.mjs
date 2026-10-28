export function validProduct(name, minimum) {
  return typeof name === 'string' && name.trim().length > 0 && Number.isSafeInteger(minimum) && minimum >= 0 && minimum <= 2147483647;
}
export function nextBalance(current, type, quantity) {
  if (!Number.isSafeInteger(current) || current < 0 || !Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 2147483647 || !['entrada', 'saida'].includes(type)) throw new Error('Movimento inválido');
  const balance = current + (type === 'entrada' ? quantity : -quantity);
  if (!Number.isSafeInteger(balance) || balance < 0 || balance > 2147483647) throw new Error('Estoque insuficiente');
  return balance;
}