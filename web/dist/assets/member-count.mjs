export async function refreshMemberCount(){
 const elements=document.querySelectorAll('[data-member-count]');if(!elements.length)return;
 try{const response=await fetch('https://asia-southeast1-phantom-gps.cloudfunctions.net/memberPublicStats',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error();const data=await response.json();if(!Number.isSafeInteger(data.registeredAccounts)||data.registeredAccounts<0)throw Error();elements.forEach(e=>{e.textContent=data.registeredAccounts.toLocaleString('th-TH');e.removeAttribute('title');});}
 catch{elements.forEach(e=>{e.textContent='—';e.setAttribute('title','ยังโหลดจำนวนสมาชิกไม่ได้');});}
}
if(document.querySelector('[data-auto-member-count]'))refreshMemberCount();
