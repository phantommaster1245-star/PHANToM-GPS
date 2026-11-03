const form=document.querySelector('#coordinate-demo');
form.addEventListener('submit',event=>{
 event.preventDefault();const input=document.querySelector('#coordinate-input'),status=document.querySelector('#demo-status');
 const match=input.value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
 if(!match||Math.abs(Number(match[1]))>90||Math.abs(Number(match[2]))>180){status.textContent='กรอกละติจูด −90 ถึง 90 และลองจิจูด −180 ถึง 180 คั่นด้วยจุลภาค';input.setAttribute('aria-invalid','true');return;}
 input.removeAttribute('aria-invalid');const lat=Number(match[1]),lon=Number(match[2]);
 document.querySelector('#map-coordinates').textContent=`${lat.toFixed(5)}, ${lon.toFixed(5)}`;
 const marker=document.querySelector('#map-marker');marker.style.left=`${30+(lon+180)/360*40}%`;marker.style.top=`${25+(90-lat)/180*22}%`;
 status.textContent='อัปเดตพรีวิวแล้ว · เป็นภาพประกอบ ไม่ได้เปลี่ยนตำแหน่งของอุปกรณ์';
});
