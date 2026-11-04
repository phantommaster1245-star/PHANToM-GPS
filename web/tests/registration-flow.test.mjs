import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRegistrationFlow} from '../dist/assets/member-registration.mjs';
function fixture(){
 const user={uid:'fixture',emailVerified:true};let current='fixture',writes=0,registered=[],confirmations=0;
 const api={currentUid:()=>current,setPassword:async u=>{writes++;u.emailVerified=false;},reload:async()=>{},refreshToken:async()=>{},register:async d=>registered.push(d.username),reauthenticate:async u=>{confirmations++;u.emailVerified=true;}};
 return {user,api,get writes(){return writes;},get registered(){return registered;},get confirmations(){return confirmations;},switchUser:()=>{current='another-user';}};
}
test('password linking resets email verification: registration waits for explicit Google confirmation',async()=>{
 const f=fixture(),flow=createRegistrationFlow(f.api);
 assert.equal(await flow.start(f.user,'fixture-only-password','phantom_master'),'google-required');
 assert.deepEqual(f.registered,[]);assert.equal(f.writes,1);
 assert.equal(await flow.confirm(f.user),'registered');
 assert.deepEqual(f.registered,['phantom_master']);assert.equal(f.writes,1);assert.equal(f.confirmations,1);
});
test('closing Google popup keeps the pending registration without setting the password again',async()=>{
 const f=fixture();let closed=true;f.api.reauthenticate=async u=>{if(closed)throw Object.assign(Error('closed'),{code:'auth/popup-closed-by-user'});u.emailVerified=true;};
 const flow=createRegistrationFlow(f.api);await flow.start(f.user,'fixture-only-password','fixture_name');
 await assert.rejects(flow.confirm(f.user),{code:'auth/popup-closed-by-user'});assert.deepEqual(f.registered,[]);
 closed=false;assert.equal(await flow.confirm(f.user),'registered');assert.equal(f.writes,1);
});
test('Google confirmation must actually restore verification before registering',async()=>{
 const f=fixture();f.api.reauthenticate=async()=>{};const flow=createRegistrationFlow(f.api);
 await flow.start(f.user,'fixture-only-password','fixture_name');assert.equal(await flow.confirm(f.user),'google-required');assert.deepEqual(f.registered,[]);
});
test('a changed account cannot finish the pending registration',async()=>{
 const f=fixture();f.api.reauthenticate=async u=>{u.emailVerified=true;f.switchUser();};const flow=createRegistrationFlow(f.api);await flow.start(f.user,'fixture-only-password','fixture_name');
 await assert.rejects(flow.confirm(f.user),{code:'LOGIN_CHANGED'});assert.deepEqual(f.registered,[]);
});
test('username collision can be corrected without changing the saved password again',async()=>{
 const f=fixture();f.api.register=async d=>{if(d.username==='taken')throw {details:{code:'USERNAME_TAKEN'}};f.registered.push(d.username);};const flow=createRegistrationFlow(f.api);
 await flow.start(f.user,'fixture-only-password','taken');await assert.rejects(flow.confirm(f.user));
 assert.equal(flow.canResume(f.user),true);assert.equal(await flow.start(f.user,'','available'),'registered');assert.equal(f.writes,1);assert.deepEqual(f.registered,['available']);
});
test('a returning unverified session can confirm Google without silently registering a username',async()=>{
 const f=fixture(),flow=createRegistrationFlow(f.api);f.user.emailVerified=false;
 assert.equal(await flow.confirm(f.user),'verified');assert.deepEqual(f.registered,[]);assert.equal(f.writes,0);
});

test('returning Google user with a linked password can finish signup without resetting that password',async()=>{
 const f=fixture(),flow=createRegistrationFlow(f.api);flow.useExistingPassword(f.user);
 assert.equal(await flow.start(f.user,'','returning_name'),'registered');assert.equal(f.writes,0);assert.deepEqual(f.registered,['returning_name']);
});

test('Google confirmation finishes signup only after the backend restores verification and the user is reloaded',async()=>{
 const f=fixture();let serverVerified=false,confirmCalls=0;
 f.api.setPassword=async()=>{serverVerified=false;};f.api.reload=async u=>{u.emailVerified=serverVerified;};
 f.api.reauthenticate=async()=>{confirmCalls++;serverVerified=true;};
 const flow=createRegistrationFlow(f.api);assert.equal(await flow.start(f.user,'fixture-only-password','verified_name'),'google-required');
 assert.equal(await flow.confirm(f.user),'registered');assert.equal(confirmCalls,1);assert.equal(f.user.emailVerified,true);assert.deepEqual(f.registered,['verified_name']);
});
