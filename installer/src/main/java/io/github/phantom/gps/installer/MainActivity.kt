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
        findViewById<Button>(R.id.adminRenew).setOnClickListener{
            MaterialAlertDialogBuilder(this).setTitle("ต่ออายุสมาชิกเพิ่ม 7 วัน").setMessage("หากยังเหลือสิทธิ์ จะบวกจากวันหมดอายุเดิม หากยังไม่เข้าแอป จะเก็บเป็นวันต่ออายุรอไว้")
                .setPositiveButton("ต่ออายุ"){_,_->model.renew()}.setNegativeButton("ยกเลิก",null).show()
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
            findViewById<Button>(R.id.adminRenew).isEnabled=!s.busy&&s.member!=null
            val m=s.member
            fun date(value:Any?)=(value as? Number)?.toLong()?.let{SimpleDateFormat("d MMM yyyy HH:mm",Locale("th","TH")).format(Date(it))}?:"ยังไม่เริ่มนับสิทธิ์"
            findViewById<TextView>(R.id.adminMemberDetails).text=if(m==null)"ค้นหาสมาชิกด้วย Gmail ก่อนต่ออายุ" else "${m["username"]}\n${m["email"]}\nหมดอายุ: ${date(m["expiresAtMs"])}\nวันต่ออายุที่รอเริ่ม: ${m["prepaidDays"]?:0} วัน"
        }
    }
}
