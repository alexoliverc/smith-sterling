import {
  describe,
  expect,
  it,
} from 'vitest';

describe('infraestrutura de testes', () => {
  it('executa TypeScript no ambiente Node', () => {
    expect(1 + 1).toBe(2);
  });
});
