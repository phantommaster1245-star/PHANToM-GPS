package io.github.phantom.gps.installer

import android.app.Application
import android.content.Context
import androidx.lifecycle.*
import com.google.android.gms.tasks.Task
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.functions.FirebaseFunctionsException
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class AdminViewModel(app:Application):AndroidViewModel(app) {
    data class State(val busy:Boolean=false,val admin:String="",val member:Map<*, *>?=null,val message:String="")
    private val mutable=MutableLiveData(State())
    val state:LiveData<State> = mutable
    private val prefs=app.getSharedPreferences("admin_renewal",Context.MODE_PRIVATE)
    init {
        if(FirebaseApp.getApps(app).isEmpty())FirebaseApp.initializeApp(app,FirebaseOptions.Builder().setApiKey(BuildConfig.FIREBASE_API_KEY)
            .setApplicationId(BuildConfig.FIREBASE_APP_ID).setProjectId(BuildConfig.FIREBASE_PROJECT_ID).build())
        if(FirebaseAuth.getInstance().currentUser!=null)run { call("adminMemberIdentity",emptyMap()).let{mutable.value=State(admin=it["email"].toString())} }
    }
    fun login(email:String,password:String)=run {
        FirebaseAuth.getInstance().signInWithEmailAndPassword(email.trim(),password).waitFor()
        try{val who=call("adminMemberIdentity",emptyMap());mutable.value=State(admin=who["email"].toString())}
        catch(e:Exception){FirebaseAuth.getInstance().signOut();throw e}
    }
    fun find(email:String) {
        if(mutable.value?.busy==true)return
        mutable.value=(mutable.value?:State()).copy(member=null)
        run {
        val m=call("adminMemberFind",mapOf("email" to email.trim()))
        mutable.value=State(admin=FirebaseAuth.getInstance().currentUser?.email.orEmpty(),member=m)
        }
    }
    fun renew() {
        val current=mutable.value?:return;val member=current.member?:return
        val uid=member["uid"]?.toString()?:return
        val request=if(prefs.getString("uid","")==uid)prefs.getString("request",null)?:UUID.randomUUID().toString() else UUID.randomUUID().toString()
        prefs.edit().putString("uid",uid).putString("request",request).commit()
        run {
            val result=call("adminMemberRenew",mapOf("uid" to uid,"requestId" to request))
            val updated=member.entries.associate { it.key to it.value }.toMutableMap()
            updated["expiresAtMs"]=result["expiresAtMs"]
            updated["prepaidDays"]=result["prepaidDays"]
            mutable.value=State(admin=current.admin,member=updated,message="ต่ออายุเพิ่ม 7 วันสำเร็จ")
            prefs.edit().clear().commit()
        }
    }
    fun logout(){FirebaseAuth.getInstance().signOut();mutable.value=State()}
    private fun run(block:suspend()->Unit) {
        if(mutable.value?.busy==true)return
        mutable.value=(mutable.value?:State()).copy(busy=true,message="")
        viewModelScope.launch {
            try{block()}catch(e:Exception){if(e is kotlinx.coroutines.CancellationException)throw e
                val code=if(e is FirebaseFunctionsException)(e.details as? Map<*, *>)?.get("code")?.toString() else ""
                mutable.value=(mutable.value?:State()).copy(message=when(code){"ADMIN_REQUIRED"->"บัญชีนี้ไม่มีสิทธิ์แอดมิน";"MEMBER_NOT_FOUND"->"ไม่พบสมาชิกที่ลงทะเบียนเสร็จแล้ว";else->"ดำเนินการไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่"})
            }finally{mutable.value=(mutable.value?:State()).copy(busy=false)}
        }
    }
    private suspend fun call(name:String,data:Map<String,Any>):Map<*, *> = FirebaseFunctions.getInstance("asia-southeast1").getHttpsCallable(name).call(data).waitFor().data as? Map<*, *>?:error("INVALID_RESPONSE")
    private suspend fun <T> Task<T>.waitFor():T=suspendCancellableCoroutine {c->addOnSuccessListener{if(c.isActive)c.resume(it)};addOnFailureListener{if(c.isActive)c.resumeWithException(it)}}
}
