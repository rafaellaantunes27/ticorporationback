import { describe,it } from 'node:test';
import assert from 'node:assert/strict';
import { borrowingEligibility, dueDateFrom, isOverdue } from './src/loan-policy.ts';
const now=new Date('2026-11-05T10:00:00Z');
describe('Prática — empréstimos',()=>{
 it('EMP-CA-01: disponível e sem dívida permite solicitar',()=>{assert.equal(borrowingEligibility([],'AVAILABLE',now).allowed,true)});
 it('EMP-CA-02: cinco abertos recusam sexto; quatro permitem quinto',()=>{
  const four=Array.from({length:4},()=>({dueDate:'2027-01-01'}));
  assert.equal(borrowingEligibility(four,'AVAILABLE',now).allowed,true);
  assert.match(borrowingEligibility([...four,{dueDate:'2027-01-01'}],'AVAILABLE',now).reason,/5 empréstimos/)
 });
 it('EMP-CA-03: bloqueio por atraso',()=>{assert.equal(borrowingEligibility([{dueDate:'2026-10-01'}],'AVAILABLE',now).allowed,false)});
 it('EMP-CA-04: manutenção e emprestado não permitem',()=>{for(const x of ['MAINTENANCE','BORROWED']) assert.equal(borrowingEligibility([],x,now).allowed,false)});
 it('EMP-CA-05: quatorze dias úteis, fim de semana é ignorado',()=>{assert.equal(dueDateFrom(now).toISOString(),'2026-11-25T10:00:00.000Z')});
 it('EMP-CA-06: devolvido não está atrasado',()=>{assert.equal(isOverdue({dueDate:'2026-10-01',returnedAt:'2026-09-30'},now),false)});
});
