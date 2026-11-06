/** Gate estatico dos CAs locais. Nao substitui o subagente independente. */
import {readFileSync} from 'node:fs';
const tests = ["scripts/practice.test.mjs", "src/loan-policy.spec.ts", "tests-policy.test.mjs"];
const corpus = tests.map(p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')).join('\n');
const ids = ["EMP-CA-01", "EMP-CA-02", "EMP-CA-03", "EMP-CA-04", "EMP-CA-05", "EMP-CA-06", "EMP-CA-09", "EMP-CA-10", "EMP-CA-11"];
let ok=true;
for(const id of ids){const found=corpus.includes(id)||corpus.includes(id.replaceAll('-','_')); console.log(`${id}\t${found?'EVIDENCIA ENCONTRADA':'SEM TESTE'}`);if(!found)ok=false;}
if(!ok)process.exitCode=1;
