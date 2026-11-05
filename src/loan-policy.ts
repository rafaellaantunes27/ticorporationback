/** Regra de negócio pura — sem acesso ao banco e independente do HTTP. */
export const MAX_ACTIVE_LOANS = 3;
export const LOAN_DURATION_DAYS = 14;

export type OpenLoan = { dueDate: Date | string; returnedAt?: Date | string | null };

export function activeLoans(loans: OpenLoan[]): OpenLoan[] {
  return loans.filter((loan) => loan.returnedAt == null);
}

export function isOverdue(loan: OpenLoan, referenceDate: Date): boolean {
  return loan.returnedAt == null && new Date(loan.dueDate).getTime() < referenceDate.getTime();
}

export function borrowingEligibility(
  loans: OpenLoan[],
  status: string,
  referenceDate: Date,
): { allowed: boolean; reason: string } {
  const open = activeLoans(loans);
  if (open.some((loan) => isOverdue(loan, referenceDate))) {
    return { allowed: false, reason: 'Devolva os itens em atraso antes de solicitar outro empréstimo.' };
  }
  if (open.length >= MAX_ACTIVE_LOANS) {
    return { allowed: false, reason: 'Limite de 3 empréstimos simultâneos atingido.' };
  }
  if (status !== 'AVAILABLE') {
    return { allowed: false, reason: status === 'MAINTENANCE' ? 'Equipamento em manutenção.' : 'Equipamento indisponível.' };
  }
  return { allowed: true, reason: '' };
}

export function dueDateFrom(borrowedAt: Date): Date {
  const result = new Date(borrowedAt.getTime());
  result.setUTCDate(result.getUTCDate() + LOAN_DURATION_DAYS);
  return result;
}
