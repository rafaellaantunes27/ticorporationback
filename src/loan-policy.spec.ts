import { borrowingEligibility, dueDateFrom, isOverdue } from './loan-policy';
const BASE = new Date('2026-11-05T10:00:00Z');
describe('Prática SDD — empréstimos', () => {
 test('EMP-CA-01: disponível pode ser solicitado com zero empréstimos', () => {
  expect(borrowingEligibility([], 'AVAILABLE', BASE).allowed).toBe(true);
 });
 test('EMP-CA-02: quinto é permitido e sexto recusado com motivo explícito', () => {
  const four = Array(4).fill({dueDate:'2026-12-20T10:00:00Z'});
  expect(borrowingEligibility(four,'AVAILABLE',BASE).allowed).toBe(true);
  expect(borrowingEligibility([...four,...four.slice(0,1)],'AVAILABLE',BASE).reason).toMatch(/5 empréstimos/);
 });
 test('EMP-CA-03: atraso bloqueia nova solicitação', () => {
  expect(borrowingEligibility([{dueDate:'2026-10-01'}],'AVAILABLE',BASE).allowed).toBe(false);
 });
 test('EMP-CA-04: equipamento em manutenção ou emprestado fica bloqueado', () => {
  expect(borrowingEligibility([],'MAINTENANCE',BASE).allowed).toBe(false);
  expect(borrowingEligibility([],'BORROWED',BASE).allowed).toBe(false);
 });
 test('EMP-CA-05: 14 dias úteis pula finais de semana', () => {
  expect(dueDateFrom(BASE).toISOString()).toBe('2026-11-25T10:00:00.000Z');
  expect(dueDateFrom(new Date('2026-11-06T10:00:00Z')).toISOString()).toBe('2026-11-26T10:00:00.000Z');
 });
 test('EMP-CA-06: devolvido não conta como atraso', () => {
  expect(isOverdue({dueDate:'2026-10-01',returnedAt:'2026-09-30'},BASE)).toBe(false);
 });
});
