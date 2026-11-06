package io.github.phantom.gps.installer

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import java.text.SimpleDateFormat
import java.util.*

class MainActivity:AppCompatActivity() {
    private val model:AdminViewModel by viewModels()
    override fun onCreate(savedInstanceState:Bundle?) {
        super.onCreate(savedInstanceState);setContentView(R.layout.activity_main)
        val email=findViewById<EditText>(R.id.adminEmail);val password=findViewById<EditText>(R.id.adminPassword)
        val search=findViewById<EditText>(R.id.memberEmail)
        findViewById<Button>(R.id.adminSignIn).setOnClickListener{model.login(email.text.toString(),password.text.toString());password.text?.clear()}
        findViewById<Button>(R.id.adminFind).setOnClickListener{model.find(search.text.toString())}
        findViewById<Button>(R.id.adminRenew).setOnClickListener {
            MaterialAlertDialogBuilder(this).setTitle("เลือกวันต่ออายุ").setItems(arrayOf("1 วัน","7 วัน","30 วัน")){_,index->
                val days=listOf(1,7,30)[index]
                MaterialAlertDialogBuilder(this).setTitle("ต่ออายุ $days วัน?").setMessage("บวกจากสิทธิ์ที่เหลือ หรือเก็บเป็นวันรอเริ่มหากยังไม่เข้าแอป")
                    .setPositiveButton("ยืนยัน"){_,_->model.renew(days)}.setNegativeButton("ยกเลิก",null).show()
            }.show()
        }
        findViewById<Button>(R.id.adminReduce).setOnClickListener {
            val input=EditText(this).apply { hint="จำนวนวัน 1–36500";inputType=android.text.InputType.TYPE_CLASS_NUMBER }
            val d=MaterialAlertDialogBuilder(this).setTitle("ลดเวลาสมาชิก").setMessage("สิทธิ์ที่เริ่มแล้วจะเหลืออย่างน้อย 1 ชั่วโมง หากยังไม่เข้าแอปจะลดเฉพาะวันสะสม")
                .setView(input).setPositiveButton("ยืนยัน",null).setNegativeButton("ยกเลิก",null).create()
            d.setOnShowListener { d.getButton(androidx.appcompat.app.AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val days=input.text.toString().toIntOrNull()
                if(days==null||days !in 1..36500)input.error="กรอกจำนวนวัน 1–36500" else { d.dismiss();model.manage("reduce",days) }
            } };d.show()
        }
        findViewById<Button>(R.id.adminBan).setOnClickListener {
            val banned=model.state.value?.member?.get("disabled")==true
            val reason=EditText(this).apply { hint="เหตุผล (ไม่เกิน 500 ตัว)";filters=arrayOf(android.text.InputFilter.LengthFilter(500)) }
            MaterialAlertDialogBuilder(this).setTitle(if(banned)"ปลดแบนบัญชี?" else "แบนบัญชี?")
                .setMessage("เก็บบัญชีและประวัติไว้ การแบนไม่หยุดนับเวลาสิทธิ์").setView(reason)
                .setPositiveButton("ยืนยัน"){_,_->model.manage(if(banned)"unban" else "ban",reason=reason.text.toString())}.setNegativeButton("ยกเลิก",null).show()
        }
        findViewById<Button>(R.id.adminLogout).setOnClickListener{model.logout()}
        findViewById<Button>(R.id.adminWebsite).setOnClickListener{startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://geox-azure.vercel.app/")))}
        model.state.observe(this){s->
            findViewById<View>(R.id.adminLoginForm).visibility=if(s.admin.isBlank())View.VISIBLE else View.GONE
            findViewById<View>(R.id.adminMemberForm).visibility=if(s.admin.isNotBlank())View.VISIBLE else View.GONE
            findViewById<TextView>(R.id.adminIdentity).text=s.admin
            findViewById<TextView>(R.id.adminMessage).text=s.message
            findViewById<View>(R.id.adminProgress).visibility=if(s.busy)View.VISIBLE else View.GONE
            listOf(R.id.adminSignIn,R.id.adminFind,R.id.adminLogout).forEach{findViewById<View>(it).isEnabled=!s.busy}
            findViewById<Button>(R.id.adminRenew).isEnabled=!s.busy&&s.member!=null&&s.member["disabled"]!=true
            findViewById<Button>(R.id.adminReduce).isEnabled=!s.busy&&s.member!=null
            findViewById<Button>(R.id.adminBan).isEnabled=!s.busy&&s.member!=null
            findViewById<Button>(R.id.adminBan).text=if(s.member?.get("disabled")==true)"ปลดแบนบัญชี" else "แบนบัญชี"
            val m=s.member
            fun date(value:Any?)=(value as? Number)?.toLong()?.let{SimpleDateFormat("d MMM yyyy HH:mm",Locale("th","TH")).format(Date(it))}?:"ยังไม่เริ่มนับสิทธิ์"
            findViewById<TextView>(R.id.adminMemberDetails).text=if(m==null)"ค้นหาด้วยชื่อผู้ใช้หรือ Gmail ก่อนต่ออายุ" else "${m["username"]}\n${m["email"]}\nหมดอายุ: ${date(m["expiresAtMs"])}\nสถานะ: ${if(m["disabled"]==true)"ถูกแบน" else "ปกติ"}\nเหตุผล: ${m["banReason"]?:"—"}\nวันต่ออายุที่รอเริ่ม: ${m["prepaidDays"]?:0} วัน"
        }
    }
}
