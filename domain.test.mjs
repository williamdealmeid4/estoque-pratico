import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextBalance, validProduct } from './domain.mjs';

test('movimentos atualizam saldo e impedem estoque negativo', () => {
  assert.equal(nextBalance(7, 'entrada', 3), 10);
  assert.equal(nextBalance(7, 'saida', 3), 4);
  assert.throws(() => nextBalance(2, 'saida', 3));
  assert.throws(() => nextBalance(2, 'entrada', 0));
});
test('produto exige nome e estoque mínimo inteiro não negativo', () => {
  assert.equal(validProduct('Algodão', 2), true);
  assert.equal(validProduct('  ', 2), false);
  assert.equal(validProduct('Agulha', -1), false);
  assert.equal(validProduct('Agulha', 1.5), false);
});
test('limita quantidades ao máximo do banco', () => {
  assert.equal(validProduct('Tecido', 2147483648), false);
  assert.throws(() => nextBalance(2147483647, 'entrada', 1));
});