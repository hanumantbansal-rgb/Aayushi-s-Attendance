const KEY="aayushi-attendance-v1";
const subjects=[
 ["FCMT0101","Mathematics-I"],
 ["FCEE0106","Fundamentals of Electrical Engineering"],
 ["FCEC0106","Basics of Electronics & Communication Engineering"],
 ["FCPH0114","Quantum Physics"],
 ["FCCS0102","Computer Programming"]
];
const seed=[
["2026-08-17","Monday","10:00-11:00","FCMT0101","Mathematics-I"],
["2026-08-17","Monday","11:00-12:00","FCEE0106","Fundamentals of Electrical Engineering"],
["2026-08-17","Monday","12:00-01:00","FCEE0106","Fundamentals of Electrical Engineering"],
["2026-08-17","Monday","02:00-03:00","FCPH0114","Quantum Physics"],
["2026-08-17","Monday","03:00-04:00","FCCS0102","Computer Programming"],
["2026-08-18","Tuesday","10:00-11:00","FCCS0102","Computer Programming"],
["2026-08-18","Tuesday","11:00-12:00","FCPH0114","Quantum Physics"],
["2026-08-18","Tuesday","12:00-01:00","FCEC0106","Basics of Electronics & Communication Engineering"],
["2026-08-18","Tuesday","01:00-02:00","FCEC0106","Basics of Electronics & Communication Engineering"],
["2026-08-18","Tuesday","03:00-04:00","FCEE0106","Fundamentals of Electrical Engineering"],
["2026-08-18","Tuesday","04:00-05:00","FCEC0106","Basics of Electronics & Communication Engineering"],
["2026-08-19","Wednesday","01:00-02:00","FCMT0101","Mathematics-I (Tutorial)"],
["2026-08-19","Wednesday","02:00-03:00","FCPH0114","Quantum Physics"],
["2026-08-19","Wednesday","03:00-04:00","FCPH0114","Quantum Physics"],
["2026-08-19","Wednesday","04:00-05:00","FCMT0101","Mathematics-I (Tutorial)"],
["2026-08-20","Thursday","10:00-11:00","FCEE0106","Fundamentals of Electrical Engineering"],
["2026-08-20","Thursday","11:00-12:00","FCEC0106","Basics of Electronics & Communication Engineering"],
["2026-08-20","Thursday","12:00-01:00","FCCS0102","Computer Programming"],
["2026-08-20","Thursday","01:00-02:00","FCPH0114","Quantum Physics"],
["2026-08-21","Friday","10:00-11:00","FCEC0106","Basics of Electronics & Communication Engineering"],
["2026-08-21","Friday","11:00-12:00","FCEE0106","Fundamentals of Electrical Engineering"],
["2026-08-21","Friday","01:00-02:00","FCMT0101","Mathematics-I"],
["2026-08-21","Friday","02:00-03:00","FCCS0102","Computer Programming"],
["2026-08-21","Friday","03:00-04:00","FCCS0102","Computer Programming"]
].map(x=>({date:x[0],day:x[1],time:x[2],code:x[3],subject:x[4],status:""}));

let data=JSON.parse(localStorage.getItem(KEY)||"null")||{classes:seed};
function save(){localStorage.setItem(KEY,JSON.stringify(data));render();}
function pct(p,a){let n=p+a;return n?Math.round(p/n*1000)/10:null}
function stats(){
 let p=data.classes.filter(x=>x.status==="P").length,a=data.classes.filter(x=>x.status==="A").length,c=data.classes.filter(x=>x.status==="C").length,l=data.classes.filter(x=>x.status==="L").length;
 return {p,a,c,l,n:p+a,pc:pct(p,a)};
}
function render(){
 renderDash();renderWeek();renderAttendance();
}
function renderDash(){
 const s=stats(), val=s.pc==null?"—":s.pc+"%";
 document.querySelector("#overallPct").textContent=val;
 document.querySelector("#ringPct").textContent=s.pc==null?"0%":s.pc+"%";
 document.querySelector(".ring").style.setProperty("--deg",(s.pc||0)*3.6+"deg");
 ["counted","present","absent","cancelled"].forEach((id,i)=>document.getElementById(id).textContent=[s.n,s.p,s.a,s.c][i]);
 let html="";
 subjects.forEach(([code,name])=>{
   let p=data.classes.filter(x=>x.code===code&&x.status==="P").length;
   let a=data.classes.filter(x=>x.code===code&&x.status==="A").length;
   let q=pct(p,a);
   html+=`<div class="subject"><div class="subjectline"><b>${name}</b><b class="${q!==null&&q<75?'warn':'good'}">${q===null?'—':q+'%'}</b></div><div class="bar"><i style="width:${q||0}%"></i></div><div class="classmeta">${p} present • ${a} absent • ${data.classes.filter(x=>x.code===code&&x.status==="C").length} cancelled</div></div>`;
 });
 document.querySelector("#subjectList").innerHTML=html||'<div class="hint">No attendance recorded yet.</div>';
 let adv="";
 subjects.forEach(([code,name])=>{
   let p=data.classes.filter(x=>x.code===code&&x.status==="P").length,a=data.classes.filter(x=>x.code===code&&x.status==="A").length;
   if(p+a===0)return;
   let q=pct(p,a);
   if(q>=75){
     let miss=Math.floor(p/0.75-p);
     adv+=`<div class="subject"><b>${name}</b><div class="classmeta good">At ${q}%: can miss about ${miss} more class${miss===1?'':'es'} and remain at/above 75%.</div></div>`;
   }else{
     let need=Math.ceil((0.75*(p+a)-p)/0.25);
     adv+=`<div class="subject"><b>${name}</b><div class="classmeta warn">At ${q}%: needs about ${need} consecutive attended class${need===1?'':'es'} (with no further absence) to reach 75%.</div></div>`;
   }
 });
 document.querySelector("#advisor").innerHTML=adv||'<div class="hint">Record some classes to see advice.</div>';
}
function renderWeek(){
 const wk=document.getElementById("weekStart").value||"2026-08-17";
 const list=data.classes.filter(x=>x.date>=wk&&x.date<=addDays(wk,6)).sort(sortClass);
 document.querySelector("#weekClasses").innerHTML=list.length?list.map((x,i)=>classHTML(x,i,false)).join(""):'<div class="hint">No classes entered for this week. Tap + Class.</div>';
}
function renderAttendance(){
 const list=[...data.classes].sort((a,b)=>b.date.localeCompare(a.date)||a.time.localeCompare(b.time));
 document.querySelector("#attendanceList").innerHTML=list.length?list.map((x,i)=>classHTML(x,i,true)).join(""):'<div class="hint">No classes.</div>';
}
function classHTML(x,i,att){
 return `<div class="classrow"><div class="classmeta">${fmtDate(x.date)} • ${x.day||dayName(x.date)} • ${x.time}</div><div class="classname">${x.subject} <span class="classmeta">${x.code}</span></div><div class="pills">
 ${["P","A","L","C"].map(s=>`<button class="pill ${s==="C"?"cancel":""} ${x.status===s?"selected":""}" onclick="setStatus(${data.classes.indexOf(x)},'${s}')">${s==="P"?"Present":s==="A"?"Absent":s==="L"?"Leave":"Cancelled"}</button>`).join("")}</div></div>`;
}
window.setStatus=(idx,status)=>{data.classes[idx].status=data.classes[idx].status===status?"":status;save()};
function sortClass(a,b){return a.date.localeCompare(b.date)||a.time.localeCompare(b.time)}
function addDays(s,n){let d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function dayName(s){return new Date(s+"T12:00:00").toLocaleDateString("en-US",{weekday:"long"})}
function fmtDate(s){return new Date(s+"T12:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}

document.querySelectorAll(".bottomnav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".bottomnav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(b.dataset.page).classList.add("active");});
document.getElementById("weekStart").value="2026-08-17";
document.getElementById("weekStart").onchange=renderWeek;

const modal=document.getElementById("modal");
document.getElementById("addClass").onclick=()=>{document.getElementById("mDate").value=document.getElementById("weekStart").value;modal.hidden=false};
document.getElementById("closeModal").onclick=()=>modal.hidden=true;
document.getElementById("saveClass").onclick=()=>{
 let d=document.getElementById("mDate").value, t=document.getElementById("mTime").value.trim(), c=document.getElementById("mCode").value.trim(), s=document.getElementById("mSubject").value.trim(), r=document.getElementById("mRoom").value.trim();
 if(!d||!t||!s){alert("Please enter date, time and subject.");return}
 data.classes.push({date:d,day:dayName(d),time:t,code:c||"—",subject:s,status:"",room:r});
 document.getElementById("weekStart").value=d;
 modal.hidden=true;save();
};
document.getElementById("todayBtn").onclick=()=>{
 const t=new Date().toISOString().slice(0,10);
 data.classes=data.classes.filter(x=>true);
 document.getElementById("attendance").scrollTop=0;
 renderAttendance();
};
document.getElementById("exportBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Aayushi_Attendance_Backup.json";a.click();
};
document.getElementById("importFile").onchange=e=>{
 const f=e.target.files[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!d.classes)throw Error();data=d;save();alert("Backup imported.");}catch{alert("Invalid backup file.");}};r.readAsText(f);
};
document.getElementById("clearBtn").onclick=()=>{if(confirm("Delete all attendance and timetable data?")){data={classes:[]};save()}};

let deferred;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;document.getElementById("installBtn").hidden=false});
document.getElementById("installBtn").onclick=async()=>{if(deferred){deferred.prompt();deferred=null}};

if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
render();
