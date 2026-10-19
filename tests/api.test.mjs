import {test} from 'node:test';import assert from 'node:assert/strict';
import handler from '../api/index.js';import {validDate,validateEquipment,validatePerson,validateLoan,sameSecret} from '../lib/core.mjs';
function fake(url,method='GET',headers={}){let status=0,content='',replyHeaders={};const req={url,method,headers};const res={setHeader(n,v){replyHeaders[n]=v},end(data=''){content=data},set statusCode(s){status=s},get statusCode(){return status}};return {req,res,read:()=>({status,headers:replyHeaders,body:content?JSON.parse(content):null})}}
test('GET /api/health funciona sem banco',async()=>{const f=fake('/api/health');await handler(f.req,f.res);assert.equal(f.read().status,200);assert.equal(f.read().body.status,'ok')});
test('demo sem banco é somente leitura',async()=>{const f=fake('/api/equipment','POST');await handler(f.req,f.res);assert.equal(f.read().status,503)});
test('GET /api/state demo retorna dados sem segredo',async()=>{const f=fake('/api/state');await handler(f.req,f.res);assert.equal(f.read().status,200);assert.equal(f.read().body.equipment.length,3)});
test('validação de equipamento',()=>{assert.equal(validateEquipment({code:'TI-010',name:'Item',brand:'Dell',category:'Notebooks',serial:'A',location:'SP'}),true);assert.equal(validateEquipment({code:'',name:'Item',brand:'Dell',category:'Notebooks',serial:'A',location:'SP'}),false)});
test('validação de colaborador',()=>assert.equal(validatePerson({name:'Joana',email:'a@empresa.com',department:'RH'}),true));
test('validação de datas',()=>{assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2026-02-28'),true)});
test('sem UUID, empréstimo é rejeitado',()=>assert.equal(validateLoan({equipmentId:'1',personId:'2',checkoutAt:'2026-03-01',dueAt:'2026-03-08'}),false));
test('chave não é comparada sem comprimento equivalente',()=>{assert.equal(sameSecret('a','aa'),false);assert.equal(sameSecret('abc','abc'),true)});
