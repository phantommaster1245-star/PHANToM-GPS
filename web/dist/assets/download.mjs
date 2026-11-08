import {validateRelease} from './release.mjs';
const $=id=>document.getElementById(id);let release=null;
const button=$('apk-download');
async function load(){
 button.removeAttribute('href');button.setAttribute('aria-disabled','true');button.textContent='กำลังเตรียมดาวน์โหลด ↓';$('retry-release').hidden=true;
 try{
  const response=await fetch('downloads/version.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Unavailable');
  const data=validateRelease(await response.json());release=data;
  const downloadName=`GeoX-${data.version}.apk`;
  $('release-version').textContent=`เวอร์ชัน ${data.version.replace(/^v/,'')}`;
  $('release-date').textContent=`อัปเดต ${new Intl.DateTimeFormat('th-TH',{dateStyle:'long',timeZone:'Asia/Bangkok'}).format(new Date(data.publishedAt))}`;
  $('release-changes').replaceChildren(...data.changes.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  $('download-info').textContent=`${(data.bytes/1024/1024).toFixed(2)} MB · ${downloadName}`;
  $('file-name').textContent=downloadName;$('file-size').textContent=`${data.bytes.toLocaleString('th-TH')} bytes`;$('file-hash').textContent=data.sha256;$('copy-hash').disabled=false;
  button.href=`downloads/${data.filename}`;button.download=downloadName;button.replaceChildren(document.createTextNode('ดาวน์โหลดแอป'),Object.assign(document.createElement('span'),{textContent:'↓'}));button.removeAttribute('aria-disabled');
 }catch{
  release=null;$('release-version').textContent='ตรวจรุ่นล่าสุดไม่ได้';button.textContent='ยังไม่พร้อมดาวน์โหลด';$('download-info').textContent='ตรวจการเชื่อมต่อ แล้วกดลองอีกครั้ง';$('release-date').textContent='';$('release-changes').replaceChildren();$('retry-release').hidden=false;$('copy-hash').disabled=true;
 }
}
$('retry-release').addEventListener('click',load);
button.addEventListener('click',event=>{if(!release){event.preventDefault();return;}$('download-status').textContent='เมื่อดาวน์โหลดเสร็จ ให้เปิดไฟล์ APK เพื่อติดตั้ง';});
$('copy-hash').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(release.sha256);$('hash-status').textContent='คัดลอกแล้ว';}catch{$('hash-status').textContent='คัดลอกอัตโนมัติไม่ได้ เลือกข้อความ SHA-256 ด้านบนเพื่อคัดลอก';}});
load();
