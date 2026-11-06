import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');
describe('Spec 004 — verificacao de evidencias estaticas da API',()=>{
 it('EMP-CA-09: transação usa serializable e atualização condicional [estática]',()=>{
  const source=text('../src/main.ts');assert.match(source,/Serializable/);assert.match(source,/updateMany\(\{ where: \{ id: equipmentId, status: 'AVAILABLE'/);
 });
 it('EMP-CA-10: apenas empréstimos do usuário são buscados [estática]',()=>{
  const source=text('../src/main.ts');assert.match(source,/where: \{ userId: user.id, returnedAt: null \}/);
 });
 it('EMP-CA-11: Operações exige papel consultado no banco [estática]',()=>{
  const source=text('../src/main.ts');assert.match(source,/requireOperations\(req\)/);assert.match(source,/operator.role !== 'OPERATIONS'/);
 });
});
