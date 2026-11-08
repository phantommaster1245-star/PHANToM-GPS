import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,setPersistence,inMemoryPersistence,updatePassword,reload,getIdToken} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-functions.js';
import {firebaseConfig} from './firebase-config.mjs';

const app = initializeApp(firebaseConfig, 'geox-password-recovery');
const auth = getAuth(app);
const functions = getFunctions(app, 'asia-southeast1');
const $ = id => document.getElementById(id);
const call = async (name, data = {}) => (await httpsCallable(functions, name, {timeout: 15000})(data)).data;
const form = $('password-form');
let authorizedUser = null;

function message(text, error = false) {
  $('message').textContent = text;
  $('message').classList.toggle('member-error', error);
}
function resetForm() {
  authorizedUser = null;
  form.reset();
  form.hidden = true;
  $('username').textContent = '';
  $('email').textContent = '';
}

$('google').addEventListener('click', async () => {
  $('google').disabled = true;
  resetForm();
  message('กำลังเปิด Google…');
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({prompt: 'select_account'});
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (!user.emailVerified) {
      const token = GoogleAuthProvider.credentialFromResult(result)?.idToken;
      if (!token) throw Error('GOOGLE_PROOF_REQUIRED');
      await call('memberConfirmGoogle', {googleIdToken: token});
      await reload(user);
      await getIdToken(user, true);
    }
    const profile = await call('memberProfile');
    if (auth.currentUser?.uid !== user.uid || !user.emailVerified ||
        profile.email !== user.email?.toLowerCase() ||
        !user.providerData.some(item => item.providerId === 'google.com')) throw Error('ACCOUNT_CHANGED');
    authorizedUser = user;
    $('username').textContent = profile.username;
    $('email').textContent = user.email;
    form.hidden = false;
    message('');
  } catch (error) {
    await signOut(auth).catch(() => {});
    const code = error?.details?.code || error?.code;
    message(code === 'MEMBER_NOT_FOUND' ? 'ไม่พบบัญชี GeoX ที่สมัครด้วย Gmail นี้ กรุณาเลือกบัญชีเดิม' :
      code === 'MEMBER_DISABLED' ? 'บัญชีนี้ถูกระงับ กรุณาติดต่อแอดมิน' :
      'ยืนยันบัญชีไม่สำเร็จ กรุณาลองใหม่ด้วย Gmail ที่สมัคร GeoX', true);
  } finally {
    $('google').disabled = false;
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const user = authorizedUser;
  if (!user || auth.currentUser?.uid !== user.uid || $('google').disabled) return;
  const password = $('password').value;
  if (password.length < 6 || password.length > 128 || password !== $('confirm-password').value) {
    message('กรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร และยืนยันให้ตรงกัน', true);
    return;
  }
  $('google').disabled = true;
  const controls = Array.from(form.elements);
  controls.forEach(control => control.disabled = true);
  try {
    await updatePassword(user, password);
    resetForm();
    await signOut(auth).catch(() => {});
    message('เปลี่ยนรหัสผ่านแล้ว กลับเข้าแอป GeoX ด้วยรหัสใหม่ได้เลย');
  } catch (error) {
    form.reset();
    if (error?.code === 'auth/requires-recent-login') {
      resetForm();
      message('กรุณายืนยันบัญชี Google อีกครั้ง แล้วตั้งรหัสผ่านใหม่', true);
    } else message('เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่', true);
  } finally {
    controls.forEach(control => control.disabled = false);
    $('google').disabled = false;
  }
});

try {
  await setPersistence(auth, inMemoryPersistence);
  $('google').disabled = false;
} catch {
  message('เปิดหน้าตั้งรหัสผ่านไม่สำเร็จ กรุณาลองใหม่ในเบราว์เซอร์', true);
}
