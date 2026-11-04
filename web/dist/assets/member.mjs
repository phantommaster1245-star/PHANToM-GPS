import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,EmailAuthProvider,linkWithCredential,updatePassword,reauthenticateWithPopup,reload,getIdToken,sendPasswordResetEmail,setPersistence,browserSessionPersistence} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-functions.js';
import {firebaseConfig} from './firebase-config.mjs';
import {refreshMemberCount} from './member-count.mjs';
import {createRegistrationFlow} from './member-registration.mjs';
const app=initializeApp(firebaseConfig),auth=getAuth(app),functions=getFunctions(app,'asia-southeast1');
await setPersistence(auth,browserSessionPersistence);
const $=id=>document.getElementById(id),call=async(name,data={})=>(await httpsCallable(functions,name)(data)).data;
let busy=false,currentMember=null,pendingRenewal=null;
const registration=createRegistrationFlow({
 currentUid:()=>auth.currentUser?.uid,
 setPassword:async(user,password)=>{if(!user.providerData.some(p=>p.providerId==='password'))await linkWithCredential(user,EmailAuthProvider.credential(user.email,password));else await updatePassword(user,password);},
 reload,refreshToken:user=>getIdToken(user,true),register:data=>call('memberRegister',data),
 reauthenticate:user=>{const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account',login_hint:user.email});return reauthenticateWithPopup(user,provider);}
});
function requireGoogleConfirmation(){
 $('signup-form').hidden=true;$('google-verify').hidden=false;
 message('กรุณากดยืนยัน Google อีกครั้งเพื่อสมัครต่อ หากตั้งรหัสผ่านแล้วไม่ต้องตั้งซ้ำ');
}
$('google-verify').addEventListener('click',async()=>{
 if(busy)return;setBusy(true);
 try{const result=await registration.confirm(auth.currentUser);
  if(result==='registered'){location.assign('account.html');return;}
  if(result==='google-required'){requireGoogleConfirmation();return;}
  await renderAccount(auth.currentUser);
 }catch(e){if(e?.details?.code==='USERNAME_TAKEN'){$('signup-form').hidden=false;$('google-verify').hidden=true;}message(errorText(e),true);}finally{setBusy(false);}
});
function message(text,error=false,target='member-message'){const el=$(target);el.textContent=text;el.classList.toggle('member-error',error);}
function setBusy(value){busy=value;document.querySelectorAll('button').forEach(el=>el.disabled=value);$('admin-renew').disabled=value||!currentMember;}
function errorText(e){const code=e?.details?.code||e?.code;return ({USERNAME_TAKEN:'ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น',USERNAME_INVALID:'ชื่อผู้ใช้ต้องเป็นอักษรอังกฤษ ตัวเลข หรือ _ รวม 4–24 ตัว',GOOGLE_PASSWORD_REQUIRED:'กรุณายืนยัน Google และตั้งรหัสผ่านให้ครบ',ADMIN_REQUIRED:'บัญชีนี้ไม่มีสิทธิ์แอดมิน',MEMBER_NOT_FOUND:'ไม่พบสมาชิกที่ลงทะเบียนเสร็จแล้ว','auth/popup-blocked':'เบราว์เซอร์บล็อกหน้าต่าง Google กรุณาอนุญาตแล้วลองอีกครั้ง','auth/popup-closed-by-user':'ยังไม่ได้ลงชื่อเข้าใช้ Google','auth/unauthorized-domain':'โดเมนนี้ยังไม่ได้ตั้งค่า Google Sign-in','auth/operation-not-allowed':'ระบบ Google Sign-in ยังไม่ได้เปิดใช้งาน','auth/weak-password':'รหัสผ่านยังไม่ผ่านเงื่อนไขความปลอดภัย','auth/user-mismatch':'กรุณาเลือกบัญชี Google เดิมที่ใช้สมัคร','auth/requires-recent-login':'กรุณาออกจากระบบเว็บแล้วลงชื่อเข้าใช้ Google ใหม่','LOGIN_CHANGED':'บัญชีที่เข้าสู่ระบบเปลี่ยนไป กรุณาเริ่มใหม่'})[code]||'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง';}
$('google-login').addEventListener('click',async()=>{if(busy)return;setBusy(true);try{const p=new GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});await signInWithPopup(auth,p);}catch(e){message(errorText(e),true);}finally{setBusy(false);}});
async function renderAccount(user){
 currentMember=null;pendingRenewal=null;$('admin-panel').hidden=true;$('profile').hidden=true;$('signup-form').hidden=true;$('logout').hidden=!user;
 $('google-verify').hidden=true;$('google-login').hidden=Boolean(user);if(!user){registration.reset();$('auth-summary').textContent='ลงชื่อเข้าใช้ด้วย Google เพื่อสมัคร หรือกลับเข้าบัญชีเดิม';return;}
 if(!user.email?.toLowerCase().endsWith('@gmail.com')||!user.providerData.some(p=>p.providerId==='google.com')){message('กรุณาใช้บัญชี Gmail ที่ยืนยันแล้ว',true);await signOut(auth);return;}
 $('auth-summary').textContent=user.email;
 if(!user.emailVerified){requireGoogleConfirmation();return;}
 try{const p=await call('memberProfile');$('profile').hidden=false;$('profile-username').textContent=p.username;
  $('profile-expiry').textContent=p.firstLoginAtMs==null?'ยังไม่เริ่มนับสิทธิ์ — เริ่มเมื่อเข้าแอปครั้งแรก':(p.expiresAtMs>p.serverNowMs?'ใช้ได้ถึง ':'หมดอายุเมื่อ ')+new Date(p.expiresAtMs).toLocaleString('th-TH');
  if(p.isAdmin){try{await call('adminMemberIdentity');$('admin-panel').hidden=false;}catch{}}
  message(p.firstLoginAtMs==null?'เข้าสู่บัญชีบนเว็บแล้ว การนับ 7 วันยังไม่เริ่มจนกว่าจะเข้าแอป':'เข้าสู่บัญชีบนเว็บแล้ว ดูสถานะสิทธิ์ด้านบนได้เลย');
 }catch(e){if(e?.details?.code==='MEMBER_NOT_FOUND'){
  $('signup-form').hidden=false;
  const savedPassword=user.providerData.some(p=>p.providerId==='password');
  if(savedPassword)registration.useExistingPassword(user);
  for(const id of ['new-password','confirm-password']){$(id).disabled=savedPassword;$(id).required=!savedPassword;$(id).value='';$(id).placeholder=savedPassword?'ตั้งรหัสผ่านไว้แล้ว':'';}
  message(savedPassword?'รหัสผ่านที่ตั้งไว้ถูกบันทึกแล้ว กรอกชื่อผู้ใช้เพื่อสมัครต่อ และใช้รหัสผ่านเดิมเข้าสู่แอปได้เลย':'ยืนยัน Google แล้ว ตั้งบัญชี PHANToM ต่อได้เลย');
 }else message(errorText(e),true);}
}
onAuthStateChanged(auth,renderAccount);
$('signup-form').addEventListener('submit',async event=>{event.preventDefault();if(busy)return;
 const password=$('new-password').value,username=$('username').value.trim();if(password!==$('confirm-password').value){message('รหัสผ่านทั้งสองช่องไม่ตรงกัน',true);return;}
 if((password||!registration.canResume(auth.currentUser))&&password.length<12){message('ใช้รหัสผ่านอย่างน้อย 12 ตัว',true);return;}
 setBusy(true);try{
  const user=auth.currentUser;if(!user)throw Error('LOGIN_REQUIRED');
  const result=await registration.start(user,password,username);$('new-password').value='';$('confirm-password').value='';$('new-password').required=false;$('confirm-password').required=false;
  if(result==='google-required'){requireGoogleConfirmation();return;}
  location.assign('account.html');
 }catch(e){message(errorText(e),true);}finally{setBusy(false);}
});
$('logout').addEventListener('click',async()=>{if(!busy)await signOut(auth);});
$('reset-password').addEventListener('click',async()=>{if(busy||!auth.currentUser?.email)return;setBusy(true);try{await sendPasswordResetEmail(auth,auth.currentUser.email);message('ส่งอีเมลตั้งรหัสผ่านใหม่แล้ว กรุณาตรวจกล่องจดหมาย');}catch(e){message(errorText(e),true);}finally{setBusy(false);}});
$('admin-search').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;currentMember=null;pendingRenewal=null;$('admin-result').hidden=true;setBusy(true);try{currentMember=await call('adminMemberFind',{email:$('member-email').value.trim()});$('admin-result').hidden=false;$('admin-result').textContent=currentMember.username+'\n'+currentMember.email+'\n'+(currentMember.firstLoginAtMs==null?'ยังไม่เข้าแอป มีวันต่ออายุรอ '+currentMember.prepaidDays+' วัน':'หมดอายุ: '+new Date(currentMember.expiresAtMs).toLocaleString('th-TH'));message('',false,'admin-message');}catch(e){message(errorText(e),true,'admin-message');}finally{setBusy(false);}});
$('admin-renew').addEventListener('click',async()=>{if(busy||!currentMember)return;if(!window.confirm('ต่ออายุให้ '+currentMember.email+' เพิ่ม 7 วัน?'))return;
 if(!pendingRenewal){try{const stored=JSON.parse(sessionStorage.getItem('phantom_pending_renewal')||'null');if(stored?.uid===currentMember.uid&&stored?.adminUid===auth.currentUser?.uid)pendingRenewal=stored;}catch{}} pendingRenewal??={uid:currentMember.uid,requestId:crypto.randomUUID(),adminUid:auth.currentUser.uid};sessionStorage.setItem('phantom_pending_renewal',JSON.stringify(pendingRenewal));setBusy(true);try{const p=await call('adminMemberRenew',pendingRenewal);pendingRenewal=null;sessionStorage.removeItem('phantom_pending_renewal');message(p.expiresAtMs?'ต่ออายุสำเร็จ ใช้ได้ถึง '+new Date(p.expiresAtMs).toLocaleString('th-TH'):'เพิ่มวันต่ออายุรอเริ่มแล้ว รวม '+p.prepaidDays+' วัน',false,'admin-message');}catch(e){message(errorText(e)+' หากการเชื่อมต่อขาด กดซ้ำเพื่อตรวจรายการเดิมได้',true,'admin-message');}finally{setBusy(false);}});
refreshMemberCount();
