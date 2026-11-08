import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,setPersistence,browserSessionPersistence,reload,getIdToken} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-functions.js';
import {firebaseConfig} from './firebase-config.mjs';
const app=initializeApp(firebaseConfig),auth=getAuth(app),functions=getFunctions(app,'asia-southeast1');
const $=id=>document.getElementById(id),call=async(name,data={})=>(await httpsCallable(functions,name,{timeout:20000})(data)).data;
let rows=[],cursor=null,selected=null,busy=false,epoch=0,serverOffset=0,pending=null,authorized=false;
const now=()=>Date.now()+serverOffset,date=t=>t?new Date(t).toLocaleString('th-TH'):'ยังไม่เริ่มสิทธิ์';
function remaining(m){if(m.firstLoginAtMs==null)return `ยังไม่เริ่ม / สะสม ${m.prepaidDays||0} วัน`;const minutes=Math.max(0,Math.ceil((m.expiresAtMs-now())/60000));return minutes?`${Math.floor(minutes/1440)} วัน ${Math.floor(minutes%1440/60)} ชม. ${minutes%60} นาที`:'หมดอายุ';}
function status(m){return m.disabled?'ถูกแบน':m.firstLoginAtMs==null?'ยังไม่เริ่มสิทธิ์':m.expiresAtMs>now()?'ใช้งานได้':'หมดอายุ';}
function message(text,error=false,target='message'){$(target).textContent=text;$(target).classList.toggle('admin-error',error);}
function errorText(e){return ({ADMIN_REQUIRED:'บัญชีนี้ไม่มีสิทธิ์แอดมิน',MEMBER_NOT_FOUND:'ไม่พบสมาชิก ตรวจชื่อผู้ใช้หรือ Gmail ให้ครบ',USERNAME_INVALID:'ชื่อผู้ใช้ไม่ถูกต้อง',EMAIL_INVALID:'Gmail ไม่ถูกต้อง',MEMBER_DISABLED:'บัญชีถูกแบน กรุณาปลดแบนก่อนเพิ่มเวลา',TIME_REDUCTION_LIMIT:'ลดเวลาไม่ได้ เพราะเหลือไม่เกิน 1 ชั่วโมงหรือไม่มีวันสะสม',DAYS_INVALID:'จำนวนวันไม่ถูกต้อง',REQUEST_ID_REUSED:'ข้อมูลคำขอเปลี่ยนไป กรุณาเปิดรายละเอียดใหม่'})[e?.details?.code]||'ดำเนินการไม่สำเร็จ กรุณาลองใหม่';}
function setBusy(value){busy=value;document.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=value);$('extend').disabled=value||!selected||selected.disabled;}
function detail(){if(!selected)return;$('detail-title').textContent=selected.username;$('detail').textContent=`${selected.email}\nสถานะ: ${status(selected)}\nคงเหลือ: ${remaining(selected)}\nสิ้นสุด: ${date(selected.expiresAtMs)}\nเหตุผลแบน: ${selected.banReason||'—'}`;$('ban').textContent=selected.disabled?'ปลดแบนบัญชี':'แบนบัญชี';}
function render(){const body=$('members');body.replaceChildren();for(const m of rows){const tr=document.createElement('tr'),account=document.createElement('td'),name=document.createElement('strong'),email=document.createElement('small');name.textContent=m.username;email.textContent=m.email;account.append(name,email);tr.append(account);for(const value of [status(m),remaining(m),date(m.expiresAtMs)]){const td=document.createElement('td');td.textContent=value;tr.append(td);}const td=document.createElement('td'),button=document.createElement('button');button.type='button';button.textContent='จัดการ';button.disabled=busy;button.addEventListener('click',()=>{selected=m;pending=null;$('reason').value='';message('',false,'action-message');detail();setBusy(false);$('member-dialog').showModal();});td.append(button);tr.append(td);body.append(tr);}$('count').textContent=rows.length?`แสดง ${rows.length} บัญชี${cursor?' — ยังมีหน้าถัดไป':''}`:'ไม่พบสมาชิก';$('more').hidden=!cursor;}
async function load(append=false){if(busy||!authorized)return;const generation=epoch;setBusy(true);message('กำลังโหลดสมาชิก…');try{const r=await call('adminMemberList',{limit:50,...(append&&cursor?{cursor}:{})});if(generation!==epoch)return;serverOffset=r.serverNowMs-Date.now();rows=append?[...rows,...r.members]:r.members;cursor=r.nextCursor;render();message('');}catch(e){if(generation===epoch)message(errorText(e),true);}finally{setBusy(false);}}
$('login').addEventListener('click',async()=>{if(busy)return;setBusy(true);try{const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});const result=await signInWithPopup(auth,provider);if(!result.user.emailVerified){const token=GoogleAuthProvider.credentialFromResult(result)?.idToken;if(token){await call('memberConfirmGoogle',{googleIdToken:token});await reload(result.user);await getIdToken(result.user,true);await checkAdmin(result.user);}}}catch(e){message(errorText(e),true);}finally{setBusy(false);}});
$('logout').addEventListener('click',async()=>{if(!busy)await signOut(auth);});
$('refresh').addEventListener('click',()=>{$('query').value='';load();});$('more').addEventListener('click',()=>load(true));
$('search').addEventListener('submit',async event=>{event.preventDefault();if(busy||!authorized)return;const query=$('query').value.trim();if(!query){load();return;}const generation=epoch;setBusy(true);message('กำลังค้นหา…');try{const m=await call('adminMemberFind',{query});if(generation!==epoch)return;serverOffset=m.serverNowMs-Date.now();rows=[m];cursor=null;render();message('');}catch(e){if(generation===epoch){rows=[];cursor=null;render();message(errorText(e),true);}}finally{setBusy(false);}});
async function manage(action,days){if(busy||!selected||!authorized)return;const request={uid:selected.uid,action,days,reason:$('reason').value.trim()},fingerprint=JSON.stringify(request);if(!pending||pending.fingerprint!==fingerprint)pending={fingerprint,requestId:crypto.randomUUID()};const generation=epoch;setBusy(true);message('กำลังบันทึก…',false,'action-message');try{const r=await call('adminMemberManage',{...request,requestId:pending.requestId});if(generation!==epoch)return;serverOffset=r.serverNowMs-Date.now();Object.assign(selected,r);detail();render();pending=null;message('บันทึกแล้ว',false,'action-message');}catch(e){if(generation===epoch)message(errorText(e),true,'action-message');}finally{setBusy(false);}}
$('extend').addEventListener('click',()=>manage('extend',Number($('days').value)));$('reduce').addEventListener('click',()=>{const n=Number($('reduce-days').value);if(!Number.isInteger(n)||n<1||n>36500){message('กรอกจำนวนวันเต็ม 1–36500',true,'action-message');return;}manage('reduce',n);});$('ban').addEventListener('click',()=>manage(selected?.disabled?'unban':'ban',0));
let policyRevision = null;
function renderPolicy({ policy, releases }) {
 const select = $('minimum-version');
 select.replaceChildren(new Option('ไม่กำหนดขั้นต่ำ', '0'));
 for (const release of [...releases].sort((a, b) => b.versionCode - a.versionCode)) {
  select.add(new Option(release.version, String(release.versionCode)));
 }
 if (!Array.from(select.options).some(option => Number(option.value) === policy.minimumVersionCode)) {
  select.add(new Option('รุ่นที่ตั้งไว้ (' + policy.minimumVersionCode + ')', String(policy.minimumVersionCode)));
 }
 select.value = String(policy.minimumVersionCode);
 $('block-unreported').checked = policy.blockUnreported;
 policyRevision = policy.revision;
}
async function loadPolicy(generation) {
 const controls = $('version-policy-controls'), status = $('version-policy-status');
 controls.disabled = true;
 status.textContent = 'กำลังโหลดนโยบาย…';
 try {
  const result = await call('adminAppVersionPolicy', { action: 'read' });
  if (generation !== epoch || !authorized) return;
  renderPolicy(result);
  status.textContent = '';
  controls.disabled = false;
 } catch {
  if (generation === epoch) status.textContent = 'โหลดนโยบายไม่สำเร็จ กรุณาโหลดหน้าใหม่';
 }
}
$('version-policy').addEventListener('submit', async event => {
 event.preventDefault();
 const controls = $('version-policy-controls'), status = $('version-policy-status');
 if (!authorized || policyRevision === null || controls.disabled) return;
 const generation = epoch;
 controls.disabled = true;
 status.textContent = 'กำลังบันทึก…';
 try {
  const result = await call('adminAppVersionPolicy', {
   action: 'save', revision: policyRevision, minimumVersionCode: Number($('minimum-version').value),
   blockUnreported: $('block-unreported').checked
  });
  if (generation !== epoch) return;
  renderPolicy(result);
  status.textContent = 'บันทึกนโยบายแล้ว';
 } catch (error) {
  if (generation !== epoch) return;
  if (error?.details?.code === 'POLICY_CHANGED') {
   await loadPolicy(generation);
   if (generation === epoch) status.textContent = 'นโยบายถูกแก้ไขจากอีกหน้าต่าง ตรวจค่าล่าสุดก่อนบันทึกใหม่';
  } else status.textContent = 'บันทึกไม่สำเร็จ กรุณาตรวจสอบรุ่นที่เลือกและลองใหม่';
 } finally {
  if (generation === epoch && authorized) controls.disabled = false;
 }
});
async function checkAdmin(user){const generation=++epoch;authorized=false;rows=[];cursor=null;selected=null;pending=null;$('dashboard').hidden=true;$('member-dialog').close();render();$('logout').hidden=!user;$('login').hidden=!!user?.emailVerified;$('identity').textContent=user?.email||'เข้าสู่ระบบด้วย Google สำหรับแอดมินที่ได้รับอนุญาต';if(!user)return;try{await call('adminMemberIdentity');if(generation!==epoch)return;authorized=true;$('dashboard').hidden=false;busy=false;await Promise.all([load(),loadPolicy(generation)]);}catch(e){if(generation===epoch)message(errorText(e),true);}}
try{await setPersistence(auth,browserSessionPersistence);onAuthStateChanged(auth,checkAdmin);}catch(e){message('เปิดสถานะเข้าสู่ระบบไม่ได้ กรุณาใช้ Chrome หรือ Safari',true);}
