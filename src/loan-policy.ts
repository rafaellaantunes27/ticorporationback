/** Regra de negócio pura: dias úteis = segunda a sexta, sem feriados customizados.
 * Datas preservam a hora UTC da solicitação para previsibilidade no servidor.
 */
export const MAX_ACTIVE_LOANS = 5;
export const LOAN_DURATION_BUSINESS_DAYS = 14;
export type OpenLoan = { dueDate: Date | string; returnedAt?: Date | string | null };
export function activeLoans(loans: OpenLoan[]): OpenLoan[] {
  return loans.filter((loan) => loan.returnedAt == null);
}
export function isOverdue(loan: OpenLoan, referenceDate: Date): boolean {
  return loan.returnedAt == null && new Date(loan.dueDate).getTime() < referenceDate.getTime();
}
export function borrowingEligibility(loans: OpenLoan[], status: string, referenceDate: Date): { allowed: boolean; reason: string } {
  const open = activeLoans(loans);
  if (open.some((loan) => isOverdue(loan, referenceDate))) {
    return { allowed: false, reason: 'Há empréstimo em atraso. Regularize antes de solicitar outro.' };
  }
  if (open.length >= MAX_ACTIVE_LOANS) {
    return { allowed: false, reason: 'Limite de 5 empréstimos em aberto atingido.' };
  }
  if (status !== 'AVAILABLE') {
    return { allowed: false, reason: status === 'MAINTENANCE' ? 'Equipamento em manutenção.' : 'Equipamento indisponível.' };
  }
  return { allowed: true, reason: '' };
}
export function dueDateFrom(borrowedAt: Date): Date {
  const result = new Date(borrowedAt.getTime());
  if (!Number.isFinite(result.getTime())) throw new Error('Data de solicitação inválida.');
  let businessDays = 0;
  while (businessDays < LOAN_DURATION_BUSINESS_DAYS) {
    result.setUTCDate(result.getUTCDate() + 1);
    const weekday = result.getUTCDay();
    if (weekday !== 0 && weekday !== 6) businessDays++;
  }
  return result;
}
