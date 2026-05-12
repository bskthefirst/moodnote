const MOOD_EMOJIS = {1:'😢',2:'🙁',3:'😐',4:'🙂',5:'😄'};
const MOOD_LABELS = {1:'Awful',2:'Bad',3:'Okay',4:'Good',5:'Great'};
const DAY_NAMES = ['S','M','T','W','T','F','S'];

let entries = [];
let isPro = false;
let selectedMood = null;

function $(id){return document.getElementById(id);}
function localDateStr(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function haptic(ms=5){if(navigator.vibrate)navigator.vibrate(ms);}

function load(){try{entries=JSON.parse(localStorage.getItem('moodnote_entries')||'[]');isPro=localStorage.getItem('moodnote_pro')==='true';}catch(e){entries=[];}render();}
function save(){localStorage.setItem('moodnote_entries',JSON.stringify(entries));localStorage.setItem('moodnote_pro',isPro?'true':'false');render();}

function getStreak(){let s=0;for(let i=0;i<365;i++){let d=new Date();d.setDate(d.getDate()-i);let ds=localDateStr(d);if(entries.find(e=>e.date===ds))s++;else break;}return s;}

function render(){
  $('date').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const streak=getStreak();$('streakText').textContent=streak>0?streak+' day streak':'Start your streak today';
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.toggle('selected',parseInt(b.dataset.mood)===selectedMood));
  const wb=$('weekBar');wb.innerHTML='';
  for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let ds=localDateStr(d);let e=entries.find(x=>x.date===ds);let pill=document.createElement('div');pill.className='day-pill'+(i===0?' today':'');pill.innerHTML=e?`<div class="mood-emoji">${MOOD_EMOJIS[e.mood]}</div><div>${DAY_NAMES[d.getDay()]}</div>`:`<div class="mood-emoji">-</div><div>${DAY_NAMES[d.getDay()]}</div>`;wb.appendChild(pill);}
  const list=$('entriesList');const show=entries.slice().reverse().slice(0,isPro?50:7);
  if(!show.length){list.innerHTML='<div style="text-align:center;padding:30px 0;color:#999;font-weight:500">No entries yet</div>';}
  else{list.innerHTML=show.map(e=>`<div class="entry-card"><div class="entry-emoji">${MOOD_EMOJIS[e.mood]}</div><div class="entry-info"><div class="entry-note">${e.note||MOOD_LABELS[e.mood]}</div><div class="entry-date">${e.date}</div></div></div>`).join('');}
  $('upgradeBanner').classList.toggle('hidden',isPro);
}

document.querySelectorAll('.mood-btn').forEach(btn=>{btn.onclick=()=>{selectedMood=parseInt(btn.dataset.mood);haptic(4);render();};});
$('saveBtn').onclick=()=>{if(!selectedMood){alert('Select a mood first');return;}const note=$('noteInput').value.trim();const today=localDateStr();const idx=entries.findIndex(e=>e.date===today);if(idx>=0)entries[idx]={date:today,mood:selectedMood,note:note||MOOD_LABELS[selectedMood]};else entries.push({date:today,mood:selectedMood,note:note||MOOD_LABELS[selectedMood]});if(!isPro&&entries.length>30)entries=entries.slice(-30);save();$('noteInput').value='';selectedMood=null;haptic([10,30,10]);render();};
$('upgradeBtn').onclick=()=>{$('upgradeModal').classList.add('open');};
$('buyPro').onclick=()=>{isPro=true;save();$('upgradeModal').classList.remove('open');haptic([10,30,10]);};
$('closeUpgrade').onclick=()=>{$('upgradeModal').classList.remove('open');};
document.querySelectorAll('.modal-backdrop').forEach(el=>{el.onclick=()=>el.closest('.modal').classList.remove('open');});
load();
