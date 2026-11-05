import { borrowingEligibility, dueDateFrom, isOverdue } from './loan-policy';

describe('PRD: regras de empréstimos', () => {
  test('EMPREST-CA-01: item disponível sem empréstimos pode ser solicitado', () => {
    expect(borrowingEligibility([], 'AVAILABLE', new Date('2026-11-05')).allowed).toBe(true);
  });
  test('EMPREST-CA-02: o quarto empréstimo é bloqueado', () => {
    expect(borrowingEligibility(Array(3).fill({ dueDate: '2026-11-19' }), 'AVAILABLE', new Date('2026-11-05')).allowed).toBe(false);
  });
  test('EMPREST-CA-03: um atraso bloqueia a solicitação', () => {
    expect(borrowingEligibility([{ dueDate: '2026-10-01' }], 'AVAILABLE', new Date('2026-11-05')).allowed).toBe(false);
  });
  test('EMPREST-CA-04: manutenção não é disponível', () => {
    expect(borrowingEligibility([], 'MAINTENANCE', new Date('2026-11-05')).allowed).toBe(false);
  });
  test('EMPREST-CA-05: prazo de quatorze dias', () => {
    expect(dueDateFrom(new Date('2026-11-05T00:00:00Z')).toISOString()).toBe('2026-11-19T00:00:00.000Z');
  });
  test('EMPREST-CA-06: item devolvido não está atrasado', () => {
    expect(isOverdue({ dueDate: '2026-10-01', returnedAt: '2026-09-30' }, new Date('2026-11-05'))).toBe(false);
  });
});
