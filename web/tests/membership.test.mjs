import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {dirname,resolve} from 'node:path';
const dist=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
test('membership pages reference local assets and expose no activation-code flow',async()=>{
 for(const page of ['register.html','account.html']){
  const html=await readFile(resolve(dist,page),'utf8');
  for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){if(!/^(https?:|mailto:|tel:)/.test(m[1]))await access(resolve(dist,m[1].split('?')[0]));}
  assert.match(html,/type="password"/);assert.match(html,/autocomplete="new-password"/);assert.match(html,/minlength="6"/);assert.doesNotMatch(html,/activationCode|issueTemporaryActivationCode/);
 }
});
test('web account management cannot start the trial or a device session',async()=>{
 const js=await readFile(resolve(dist,'assets/member.mjs'),'utf8');assert.doesNotMatch(js,/memberOpenSession|memberRenewLease/);assert.match(js,/memberRegister/);assert.match(js,/adminMemberManage/);assert.doesNotMatch(js,/innerHTML|console\.log|localStorage/);assert.match(js,/sessionStorage.*phantom_pending_renewal/);
});
test('counter shows unavailable state instead of invented counts',async()=>{
 const js=await readFile(resolve(dist,'assets/member-count.mjs'),'utf8');assert.match(js,/Number\.isSafeInteger/);assert.match(js,/memberPublicStats/);assert.match(js,/textContent='—'/);
});
test('client configuration contains only public Firebase SDK fields',async()=>{
 const {firebaseConfig}=await import('../dist/assets/firebase-config.mjs');assert.equal(firebaseConfig.projectId,'phantom-gps');assert(firebaseConfig.appId.includes(':web:'));assert.doesNotMatch(JSON.stringify(firebaseConfig),/private_key|client_email|refresh_token|service_account/);
});
test('admin roster uses authenticated APIs and safe text rendering without starting device sessions',async()=>{
 const html=await readFile(resolve(dist,'admin.html'),'utf8'),js=await readFile(resolve(dist,'assets/admin.mjs'),'utf8');
 for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g))if(!/^(https?:|mailto:|tel:)/.test(m[1]))await access(resolve(dist,m[1].split('?')[0]));
 assert.match(html,/id="dashboard" hidden/);assert.match(html,/id="members"/);
 for(const name of ['adminMemberIdentity','adminMemberList','adminMemberFind','adminMemberManage'])assert(js.includes(name));
 assert.doesNotMatch(js,/innerHTML|memberOpenSession|memberRenewLease|console\.log/);
 assert.match(js,/generation!==epoch/);assert.match(js,/nextCursor/);
});
