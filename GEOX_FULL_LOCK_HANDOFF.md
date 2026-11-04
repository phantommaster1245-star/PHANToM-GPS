# GeoX — เอกสารส่งต่อทีม Full Lock

วันที่ 2026-11-04 · GeoX คือชื่อใหม่ของ PHANToM GPS · YOUR LOCATION. YOUR CONTROL.

## สรุปสำหรับทีม
เปลี่ยนชื่อที่ผู้ใช้เห็นเป็น **GeoX** และแอปแอดมินเป็น **GeoX Admin** โดยไม่เปลี่ยนตัวตน Android หรือ wire protocol ทีม Full Lock เปลี่ยนชื่อบนปุ่ม/Toast/คำแนะนำเป็น GeoX ได้เลย แต่ต้องใช้ package และ descriptor เดิมต่อไป ไม่ต้องย้ายบัญชี ไม่ต้องจับคู่ Binder ใหม่เพียงเพราะชื่อแอปเปลี่ยน

ไฟล์ซอร์สในชุดนี้เป็น reading subset พร้อม provenance/GPL ไม่ใช่โปรเจกต์ที่ build แยกได้ และไม่ใช่ patch สำหรับวางทับซอร์ส Full Lock

## ตารางความเข้ากันได้
| สิ่งที่เปลี่ยน | ชื่อใหม่ |
|---|---|
| ชื่อแอป / ชื่อใน LSPosed / ชื่อใน notification | GeoX |
| ชื่อเต็ม | GeoX Location Engine |
| แอปแอดมิน (module installer) | GeoX Admin |
| เว็บและหน้าสมาชิกใน working source | GeoX |

| สิ่งที่ต้องคงเดิม | ค่า |
|---|---|
| GPS package/applicationId | `io.github.phantom.gps` |
| Admin package | `io.github.phantom.gps.installer` |
| Signing certificate SHA-256 | `2b3d3efff71526168656b137a2df5625c08bf488a0656ddacfbd54a0ff286a74` |
| Service component | `io.github.phantom.gps/io.github.phantom.gps.utils.FullLockRelayService` |
| Gateway descriptor | `io.github.phantom.gps.FullLockRelay.v1` |
| Session descriptor | `io.github.phantom.gps.LocationSession.v1` |
| Intent component | `io.github.phantom.gps/io.github.phantom.gps.utils.DirectLocationReceiver` |
| Intent action | `io.github.phantom.gps.action.SET_LOCATION_DIRECT` |
| API version | `1` |
| Device-proof canonical prefix | `PHANTOM-DEVICE-PROOF` (ชื่อภายใน ไม่เปลี่ยน) |
| เว็บไซต์ / project Firebase | `https://geox-azure.vercel.app/` / `phantom-gps` |

คง Keystore aliases, preference keys, signed-lease audience, user IDs และ usernames เดิมด้วย ไฟล์ APK/download metadata ยังใช้ชื่อ `PHANToM-GPS-v<version>.apk` ตามสัญญาอัปเดตของ client เดิม; อย่าเดาชื่อไฟล์จากชื่อแบรนด์ใหม่

## ช่องทาง Binder เดิม
`Probe ใน com.lalamove.global.driver.sea → LocalRelayMain (root) → GeoX`
- Full Lock owner ยังเป็น `com.fulllock.app`; Probe ยังเป็น `com.fulllock.driverprobe` แต่เมื่อทำงานใน Driver ต้องถือว่า UID ผู้ส่งคือ Driver
- Full Lock bind/open ล่วงหน้าจาก UID ของ Full Lock จริง แนบ lifetime Binder และส่ง private session Binder ให้ตัวกลาง root ผ่านช่องทางที่ยืนยัน UID อยู่แล้ว
- ห้ามเปิด gateway จาก Driver/Probe โดยตรง หรืออนุญาตเพียงเพราะ extra ระบุชื่อแพ็กเกจ; UID 0 อย่างเดียวไม่พอ ต้องมี private capability ด้วย
- OPEN=1; session SUBMIT=1, KEEP_ALIVE=2, CLOSE=3; KEEP_ALIVE ทุก 5 วินาที อายุ session 15 วินาที เมื่อหลุด/หมดอายุให้ OPEN ใหม่
- SUBMIT Parcel: interface token → int version → String request_id → double latitude → double longitude → String label → String target_package → platform ResultReceiver ไม่มี presence marker
- ใช้ double เต็มความละเอียดจาก model, UUID ใหม่ต่อการแตะ, ไม่ geocode/parse ข้อความ และไม่ใช้คลิปบอร์ดเป็นช่องทางสำรอง
- ส่งจาก worker, ห้าม block UI; ผลลัพธ์ต้องตรง request_id ล่าสุด ห้ามคำตอบเก่าทับการแตะใหม่
- อ่าน wire format/limits/reconnect เพิ่มใน BINDER_LOCATION_BRIDGE.md

## ผลตอบกลับและข้อความ UI
| Code / status | สิ่งที่ Full Lock ควรทำ |
|---|---|
| 100 APPLIED | แสดง “ตั้งพิกัดแล้ว” หมายถึง GeoX บันทึกพิกัดและส่ง refresh แล้ว |
| 101 HOOK_LOADED | Hook ของ target ยืนยัน request นี้แล้ว ต้องมี target_package ที่ถูกต้องและอยู่ใน LSPosed scope |
| 400 INVALID_REQUEST / REQUEST_ID_REUSED | ตรวจชนิด/range/UUID; ไม่ retry payload ที่ผิดโดยอัตโนมัติ |
| 401 UNAUTHORIZED | ตรวจ bootstrap/caller capability |
| 402 LICENSE_REQUIRED | “เปิด GeoX เพื่อเข้าสู่ระบบหรือตรวจสิทธิ์” |
| 403 LICENSE_LOCKED | “เปิด GeoX เพื่อตรวจสิทธิ์/ต่ออายุ” |
| 409 SUPERSEDED | มีคำขอใหม่กว่า ไม่แสดงผลเก่าทับล่าสุด |
| 503 BUSY | แจ้งให้แตะใหม่ภายหลัง โดยไม่ค้าง UI |

Binder transact/readException สำเร็จไม่ใช่ APPLIED ต้องรอ callback หาก catch exception ใน BridgeTransport/sendGps ให้แยกเป็นปัญหาการเชื่อมต่อ: เช่น “เชื่อมต่อ GeoX ไม่สำเร็จ” ไม่สรุปว่าใบอนุญาตเสียโดยไม่มี callback 402/403
Full Lock source ปัจจุบันส่ง target_package ว่าง จึงยังไม่ควรอ้างว่าได้รับ HOOK_LOADED เพียงเพราะได้ APPLIED หากต้องการยืนยัน Hook ให้ส่ง package จริงของเป้าหมายตามสัญญาเดิม

## บัญชีและสิทธิ์รุ่นใหม่
- สมัคร Google/Gmail ผ่านเว็บ แล้วใช้ **ชื่อผู้ใช้ GeoX + รหัสผ่านที่ตั้งเอง** เข้าสู่แอป GPS; แอป Admin ใช้ Gmail + รหัสผ่านเดียวกัน และตรวจ allowlist ฝั่งเซิร์ฟเวอร์
- 7 วันเริ่มจาก first successful app login; เว็บไม่เริ่ม trial/ไม่แทน device session แอดมินต่อเพิ่ม 7 วันได้ก่อนหมดอายุ
- Session เครื่องล่าสุดและ signed lease ยังบังคับใช้; foreground/heartbeat ต่อ lease ประมาณทุก 2 นาที ใบรับรองอยู่ได้สูงสุด 10 นาทีโดยไม่เกินวันหมดอายุสมาชิก ไม่ใช่การ revoke offline ทันที
- การแตะพิกัดตรวจ local integrity/lease ไม่มี network round trip ต่อการแตะ และไม่ข้ามสิทธิ์เมื่อใช้ root relay
- ตัวเลือกจดจำบัญชีเก็บแบบเข้ารหัสใน private storage ไม่อยู่ใน Hook-readable prefs; เมื่อ session หลุดจะกรอกให้ผู้ใช้กด login ไม่ล็อกอินเงียบเพื่อดึงสิทธิ์คืนจากเครื่องอื่น
- ผู้ใช้ 0.0.16 ยังเป็น legacy activation แยกจากบัญชีใหม่ ห้ามแก้คำแนะนำโดยบังคับให้รุ่นเก่าใช้หน้าบัญชีที่ยังไม่รองรับ

## HMA / clipboard / รายการที่ต้องแก้ใน Full Lock
1. เปลี่ยนข้อความที่ผู้ใช้เห็นจาก PHANToM GPS เป็น GeoX เช่น Toast ใน PickupGpsSender โดยคงชื่อคลาสภายใน PhantomGpsConnection ได้
2. คง package queries/LSPosed scope/HMA package configuration เดิม อย่าเปลี่ยนเป็น package ชื่อ GeoX ที่ไม่มีจริง
3. Probe ส่งตรงผ่านตัวกลางที่เตรียมไว้ เมื่อใช้ช่องทางนี้ให้ปิด Clipboard monitor และไม่คัดลอก lat/lng ซ้ำเพื่อหลีกเลี่ยงคำขอซ้อน
4. ไม่ส่งรหัสผ่าน/Firebase token/ข้อมูลส่วนตัวลง relay log, callback, clipboard หรือ reading kit
5. ทดสอบ reconnect หลัง GeoX/Full Lock/root relay ตาย และป้องกันผลเก่าทับคำขอใหม่

## สถานะที่ยืนยันแล้ว / ยังต้องทดสอบร่วมกัน
ยืนยันบน vivo Android 15: release เปิดหลัง reboot ได้, Android แสดง Full Lock bind service ได้, Binder จากแอปคนละ UID ถูกปฏิเสธ OPEN จริง; บัญชี/lease/admin ผ่าน instrumentation กับ Emulator Suite; ทดสอบ encrypted remember/force-stop restore ผ่าน
ยังไม่ถือว่าผ่าน end-to-end ทั้งเส้นทาง: Probe ใน Driver → root relay → APPLIED → HOOK_LOADED ภายใต้ HMA, lifecycle ระยะยาว, offline/heartbeat และสองเครื่องจริง ต้องทดสอบร่วมกับ Full Lock ต่อ
การเผยแพร่ชุดนี้: เว็บใช้ชื่อ GeoX และ GitHub 0.0.18 เป็น pre-release สำหรับทดสอบ ไม่แทน latest; APK และ downloads/version.json สำหรับผู้ใช้ทั่วไปบนเว็บไซต์ยังคงเป็น 0.0.16

## Checklist ก่อนแจก
- ติดตั้ง APK เซ็นเดิมทับของเดิม แล้วตรวจชื่อ GeoX / บัญชีและ settings ยังอยู่
- ยืนยันจุดด้วย Double เต็มความละเอียด, UUID ใหม่, callback ตรง request ล่าสุด
- แยกการทดสอบ APPLIED กับ HOOK_LOADED และวัด latency ตามช่วงเวลาเดียวกัน
- ทดสอบสิทธิ์หมดอายุ/เครื่องอื่น login แล้วไม่ส่งพิกัดต่อ; หลัง admin renew กลับมาใช้งานได้
- ทดสอบ HMA ซ่อน Full Lock จาก Driver แล้ว Binder ยังทำงานผ่านตัวกลาง
- ตรวจ SHA256SUMS.txt ของชุดนี้ก่อนใช้ ข้อมูลลับ/บัญชีจริง/กุญแจเซ็นไม่อยู่ใน ZIP
