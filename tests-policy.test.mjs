import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { borrowingEligibility, dueDateFrom, isOverdue } from './src/loan-policy.ts';

describe('PRD — empréstimos internos', () => {
  it('EMPREST-CA-01 permite item disponível a quem não tem empréstimos', () => {
    assert.equal(borrowingEligibility([], 'AVAILABLE', new Date('2026-11-05')).allowed, true);
  });
  it('EMPREST-CA-02 bloqueia ao atingir três empréstimos', () => {
    const active = Array.from({ length: 3 }, () => ({ dueDate: '2026-11-12' }));
    assert.match(borrowingEligibility(active, 'AVAILABLE', new Date('2026-11-05')).reason, /Limite/);
  });
  it('EMPREST-CA-03 bloqueia se houver qualquer item em atraso', () => {
    assert.equal(borrowingEligibility([{ dueDate: '2026-10-01' }], 'AVAILABLE', new Date('2026-11-05')).allowed, false);
  });
  it('EMPREST-CA-04 rejeita equipamento em manutenção', () => {
    assert.equal(borrowingEligibility([], 'MAINTENANCE', new Date('2026-11-05')).allowed, false);
  });
  it('EMPREST-CA-05 calcula devolução para 14 dias', () => {
    assert.equal(dueDateFrom(new Date('2026-11-05T10:00:00Z')).toISOString(), '2026-11-19T10:00:00.000Z');
  });
  it('EMPREST-CA-06 não considera devolvido como em atraso', () => {
    assert.equal(isOverdue({ dueDate: '2026-09-01', returnedAt: '2026-08-31' }, new Date('2026-11-05')), false);
  });
});
