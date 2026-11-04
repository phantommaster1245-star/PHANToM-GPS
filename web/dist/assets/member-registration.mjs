// Password linking can reset Firebase emailVerified. Keep registration pending until fresh Google verification.
export function createRegistrationFlow({setPassword,reload,refreshToken,register,reauthenticate,currentUid}){
 let pending=null;
 function ensureUser(user){if(!user||currentUid()!==user.uid)throw Object.assign(Error('LOGIN_CHANGED'),{code:'LOGIN_CHANGED'});}
 async function finish(user,username){
  ensureUser(user);await reload(user);ensureUser(user);
  if(!user.emailVerified)return 'google-required';
  await refreshToken(user);ensureUser(user);
  try{await register({username});}catch(e){if(e?.details?.code==='GOOGLE_PASSWORD_REQUIRED')return 'google-required';throw e;}
  pending=null;return 'registered';
 }
 return {
  async start(user,password,username){
   ensureUser(user);if(password||pending?.uid!==user.uid)await setPassword(user,password);ensureUser(user);
   pending={uid:user.uid,username};return finish(user,username);
  },
  async confirm(user){
   ensureUser(user);await reauthenticate(user);ensureUser(user);
   if(pending?.username&&pending.uid===user.uid)return finish(user,pending.username);
   await reload(user);ensureUser(user);
   if(!user.emailVerified)return 'google-required';
   await refreshToken(user);return 'verified';
  },
  useExistingPassword(user){ensureUser(user);pending={uid:user.uid,username:null};},
  canResume(user){return Boolean(user&&pending?.uid===user.uid);},
  reset(){pending=null;}
 };
}
