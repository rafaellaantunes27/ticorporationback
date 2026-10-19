import {timingSafeEqual} from 'node:crypto';
export const MAX_ACTIVE_LOANS=3;
export const allowedCategories=['Notebooks','Monitores','Tablets','Desktops','Acessórios','Projetores','Outros'];
export function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value))&&!Number.isNaN(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}
export function nonEmpty(value,max=160){return typeof value==='string'&&value.trim().length>0&&value.trim().length<=max}
export function isUuid(value){return typeof value==='string'&&/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(value)}
export function validateEquipment(v){return v&&nonEmpty(v.code,32)&&nonEmpty(v.name,120)&&nonEmpty(v.brand,80)&&nonEmpty(v.serial,100)&&nonEmpty(v.location,100)&&allowedCategories.includes(v.category)}
export function validatePerson(v){return v&&nonEmpty(v.name,120)&&nonEmpty(v.department,80)&&typeof v.email==='string'&&v.email.length<=200&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)}
export function validateLoan(v){return v&&isUuid(v.equipmentId)&&isUuid(v.personId)&&validDate(v.checkoutAt)&&validDate(v.dueAt)&&v.dueAt>=v.checkoutAt&&String(v.notes||'').length<=500}
export function sameSecret(a,b){if(!a||!b||typeof a!=='string'||typeof b!=='string')return false;const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}
export const DEMO={equipment:[
{id:'e01',code:'TI-001',name:'MacBook Pro 14”',brand:'Apple',category:'Notebooks',serial:'MBP14-001',location:'São Paulo',status:'available'},
{id:'e02',code:'TI-002',name:'Dell Latitude 5440',brand:'Dell',category:'Notebooks',serial:'DL5440-002',location:'São Paulo',status:'available'},
{id:'e03',code:'TI-003',name:'Monitor UltraSharp 27”',brand:'Dell',category:'Monitores',serial:'U2724-003',location:'São Paulo',status:'available'}],people:[
{id:'p01',name:'Mariana Costa',email:'mariana.costa@exemplo.com',department:'Design',initials:'MC'},
{id:'p02',name:'Lucas Ferreira',email:'lucas.ferreira@exemplo.com',department:'Engenharia',initials:'LF'}],loans:[]};
