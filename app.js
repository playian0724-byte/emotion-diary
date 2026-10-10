
'use strict';
const BASE=[
{id:'joy',name:'기쁨',color:'#EAC874'},
{id:'calm',name:'평온',color:'#98B9AA'},
{id:'sad',name:'슬픔',color:'#90AAD1'},
{id:'anxious',name:'불안',color:'#B5A0C6'},
{id:'anger',name:'분노',color:'#D69B92'},
{id:'surprise',name:'놀람',color:'#D5B88D'},
{id:'disgust',name:'혐오',color:'#9EAB88'},
{id:'expectation',name:'기대',color:'#E0B89E'}];
const SAMPLES=[
{id:'sample-a',name:'여운',color:'#C6ACC5',definition:'마음에 남아 오래 이어지는 느낌.',sample:true},
{id:'sample-b',name:'후련함',color:'#A9C9C0',definition:'무거운 마음이 풀린 느낌.',sample:true},
{id:'sample-c',name:'아련함',color:'#B4A1BF',definition:'지나간 것을 조용히 떠올리는 마음.',sample:true}];
const KEY='gyeol-v2';const $=id=>document.getElementById(id);
let db={records:{},custom:[]},selection=[],month=new Date(new Date().getFullYear(),new Date().getMonth(),1),saving=false;
let drops=[],amounts={},mixed=null,droppingTimer=null,repeatTimer=null,raf=0,mixBusy=false,toastTimer=0;
let nextUnnamed=1;
const orbCache=new Map();
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isoDay=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const allEmotions=()=>[...BASE,...SAMPLES,...db.custom];
const byId=id=>allEmotions().find(e=>e.id===id);
function saveDB(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){console.warn('Storage unavailable',e)}}
function loadDB(){
try{const raw=localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw);if(v&&typeof v==='object'){db={records:v.records||{},custom:Array.isArray(v.custom)?v.custom:[]};return}}}
catch(e){console.warn(e)}
try{const legacy=JSON.parse(localStorage.getItem('gyeolRecords')||'{}');const keys=[...BASE,...SAMPLES].map(x=>x.id);
for(const [day,record] of Object.entries(legacy)){if(record&&Array.isArray(record.ids)){db.records[day]={emotions:record.ids.map(i=>keys[i]).filter(Boolean).slice(0,4),note:String(record.note||'')}}}
saveDB()}catch(e){}
}
function toast(t){const v=$('toast');v.textContent=t;v.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>v.classList.remove('visible'),2200)}
function clamp(v,min=0,max=1){return Math.max(min,Math.min(max,v))}
function hexRgb(hex){const h=hex.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)}
function rgbToLab(hex){const v=hexRgb(hex).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
const l=Math.cbrt(.4122214708*v[0]+.5363325363*v[1]+.0514459929*v[2]);
const m=Math.cbrt(.2119034982*v[0]+.6806995451*v[1]+.1073969566*v[2]);
const s=Math.cbrt(.0883024619*v[0]+.2817188376*v[1]+.6299787005*v[2]);
return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s]}
function labRgb(l,a,b){const ll=Math.pow(l+.3963377774*a+.2158037573*b,3),mm=Math.pow(l-.1055613458*a-.0638541728*b,3),ss=Math.pow(l-.0894841775*a-1.291485548*b,3);
const rgb=[4.0767416621*ll-3.3077115913*mm+.2309699292*ss,-1.2684380046*ll+2.6097574011*mm-.3413193965*ss,-.0041960863*ll-.7034186147*mm+1.707614701*ss];
return rgb.map(x=>Math.round(255*clamp(x<=.0031308?12.92*x:1.055*Math.pow(Math.max(0,x),1/2.4)-.055)))}
function toHex(rgb){return '#'+rgb.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase()}
function blendColors(colors,weights){const sum=weights.reduce((a,b)=>a+b,0)||1;const labs=colors.map(rgbToLab);const val=[0,1,2].map(j=>labs.reduce((a,c,i)=>a+c[j]*weights[i]/sum,0));return toHex(labRgb(...val))}
function hue(hex){const [r,g,b]=hexRgb(hex),hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;if(!d)return 0;let h=hi===r?((g-b)/d)%6:hi===g?(b-r)/d+2:(r-g)/d+4;return (h*60+360)%360}
function orbStyle(ids){
const key=ids.filter(id=>byId(id)).slice(0,4).sort((a,b)=>hue(byId(a).color)-hue(byId(b).color)).join('|');
if(orbCache.has(key))return orbCache.get(key);
const cs=key?key.split('|').map(id=>byId(id).color):[];
if(cs.length<2){const result=cs[0]||'#ECEEEB';orbCache.set(key,result);return result}
const labs=cs.map(rgbToLab),size=150,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');if(!ctx)return '#D4D4D4';
const im=ctx.createImageData(size,size),px=im.data;
for(let y=0;y<size;y++){const yy=2*y/(size-1)-1;for(let x=0;x<size;x++){
const xx=2*x/(size-1)-1;let w;
if(cs.length===2){let t=clamp((xx+yy+2)/4);w=[1-t,t]}
else if(cs.length===3){let wa=(1-yy)/3;w=[wa,(1-wa-xx/Math.sqrt(3))/2,(1-wa+xx/Math.sqrt(3))/2]}
else{const u=(xx+1)/2,v=(yy+1)/2;w=[(1-u)*(1-v),u*(1-v),u*v,(1-u)*v]}
const lab=[0,1,2].map(i=>labs.reduce((s,p,j)=>s+p[i]*w[j],0));const [r,g,b]=labRgb(...lab),idx=(y*size+x)*4;px[idx]=r;px[idx+1]=g;px[idx+2]=b;px[idx+3]=255;
}}
ctx.putImageData(im,0,0);const url='url("'+canvas.toDataURL('image/png')+'") center/cover no-repeat';orbCache.set(key,url);return url}
function paintOrb(node,ids){node.style.background=orbStyle(ids)}
function renderChoices(){
const selected=new Set(selection);
$('base-emotions').innerHTML=BASE.map(e=>'<button type="button" class="emotion '+(selected.has(e.id)?'active':'')+'" data-select="'+e.id+'"><span class="swatch" style="background:'+e.color+'"></span>'+e.name+(selected.has(e.id)?'<span class="checkmark">✓</span>':'')+'</button>').join('');
const mine=[...SAMPLES,...db.custom];
$('my-emotions').innerHTML=mine.map(e=>'<button type="button" class="emotion '+(selected.has(e.id)?'active':'')+'" data-select="'+e.id+'"><span class="swatch" style="background:'+e.color+'"></span>'+escapeHTML(e.name||'이름 미정')+(selected.has(e.id)?'<span class="checkmark">✓</span>':'')+'</button>').join('');
document.querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.select;if(selection.includes(id))selection=selection.filter(x=>x!==id);else if(selection.length<4)selection.push(id);else toast('감정은 최대 4개까지 선택할 수 있어요.');renderChoices();renderPreview()}))
}
function renderPreview(){paintOrb($('today-orb'),selection);$('today-orb').classList.toggle('empty',selection.length===0);$('selected-label').textContent=selection.length?selection.map(id=>byId(id)?.name||'이름 미정').join(' · '):'하나만 선택해도 충분해요.';$('save-day').disabled=selection.length===0||saving}
function setScreen(id){document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('nav button').forEach(el=>el.classList.toggle('active',el.dataset.open===id));if(id==='archive')renderCalendar();if(id==='dictionary')renderDictionary();if(id==='create')startWater();else stopWater();window.scrollTo(0,0)}
function shiftMonth(delta){month=new Date(month.getFullYear(),month.getMonth()+delta,1);renderCalendar()}
function renderCalendar(){
const y=month.getFullYear(),m=month.getMonth(),n=new Date(y,m+1,0).getDate(),leading=new Date(y,m,1).getDay();
$('month-label').textContent=y+'년 '+String(m+1)+'월';
$('calendar').innerHTML='<div class="calendar-week">'+['일','월','화','수','목','금','토'].map(d=>'<span>'+d+'</span>').join('')+'</div><div class="calendar-grid">'+Array.from({length:leading},()=>'<span></span>').join('')+Array.from({length:n},(_,i)=>{
const key=[y,String(m+1).padStart(2,'0'),String(i+1).padStart(2,'0')].join('-'),rec=db.records[key],cls=(rec?' recorded':'')+(key===isoDay()?' today':'');
return '<button type="button" class="cal-day'+cls+'" data-date="'+key+'"><span class="daynum">'+(i+1)+'</span><span class="mini"></span></button>'}).join('')+'</div>';
document.querySelectorAll('[data-date]').forEach(el=>{const entry=db.records[el.dataset.date];if(entry)paintOrb(el.querySelector('.mini'),entry.emotions);el.addEventListener('click',()=>showDate(el.dataset.date))});
showDate(isoDay())}
function showDate(day){const e=db.records[day];const detail=$('record-detail');detail.replaceChildren();const title=document.createElement('strong');title.textContent=day;detail.append(title);const p=document.createElement('p');p.textContent=e?(e.emotions.map(id=>byId(id)?.name||'이름 미정').join(' · ')+(e.note?'\n'+e.note:'')):'이 날짜에는 기록이 없어요.';detail.append(p)}
function renderDictionary(){const data=[...db.custom];const host=$('dictionary-list');if(!data.length){host.innerHTML='<div class="empty-state">아직 직접 만든 감정이 없어요.<br>필요한 날, 나만의 색을 만들어보세요.</div>';return}
host.innerHTML=data.slice().reverse().map(e=>'<div class="dictionary-item"><span class="swatch" style="background:'+e.color+'"></span><div class="copy"><strong>'+escapeHTML(e.name||'이름 미정')+'</strong><p>'+escapeHTML(e.definition||e.components.map(c=>byId(c.id)?.name+' '+Math.round(c.ratio*100)+'%').join(' · '))+'</p></div><span class="privacy">Private</span><button type="button" class="subtle-button" data-use="'+escapeHTML(e.id)+'">사용</button></div>').join('');
host.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{useEmotion(b.dataset.use)})}
function useEmotion(id){if(!selection.includes(id)){if(selection.length>=4){toast('감정 4개를 선택했어요. 하나를 해제해 주세요.');setScreen('today');return}selection.push(id)}renderChoices();renderPreview();setScreen('today');toast('오늘의 감정에 추가했어요.')}
function positionFlightStart(rect){const w=168,h=168;return rect.top>=10&&rect.bottom<window.innerHeight-10?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:{left:(innerWidth-w)/2,top:Math.max(70,(innerHeight-h)/2-40),width:w,height:h}}
async function saveDay(){
if(saving||!selection.length)return;saving=true;$('save-day').disabled=true;
const keys=[...selection],note=$('memo').value;db.records[isoDay()]={emotions:keys,note,createdAt:new Date().toISOString()};saveDB();month=new Date(new Date().getFullYear(),new Date().getMonth(),1);
const start=positionFlightStart($('today-orb').getBoundingClientRect()),ghost=document.createElement('div');ghost.className='flying-orb';ghost.style.cssText='left:'+start.left+'px;top:'+start.top+'px;width:'+start.width+'px;height:'+start.height+'px;';
const inner=document.createElement('div');inner.className='orb';paintOrb(inner,keys);ghost.append(inner);document.body.append(ghost);
setScreen('archive');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
const dest=document.querySelector('[data-date="'+isoDay()+'"] .mini');if(dest){dest.classList.add('arriving');
const rect=dest.getBoundingClientRect(),dx=rect.left+rect.width/2-start.left-start.width/2,dy=rect.top+rect.height/2-start.top-start.height/2,scale=rect.width/start.width;
try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&ghost.animate){const ani=ghost.animate([
{transform:'translate(0,0) scale(1) rotate(0deg)',offset:0},
{transform:'translate('+dx*.23+'px,'+(dy*.24-29)+'px) scale(.93) rotate(130deg)',offset:.25},
{transform:'translate('+dx*.76+'px,'+(dy*.67-13)+'px) scale(.47) rotate(330deg)',offset:.75},
{transform:'translate('+dx+'px,'+dy+'px) scale('+scale+') rotate(440deg)',offset:1}
],{duration:1050,easing:'cubic-bezier(.22,.71,.19,1)',fill:'forwards'});await ani.finished}}
catch(e){}
dest.classList.remove('arriving');dest.classList.add('landed');setTimeout(()=>dest.classList.remove('landed'),450)}
ghost.remove();saving=false;renderPreview();try{navigator.vibrate?.(12)}catch(e){}toast('오늘의 구슬을 남겼어요.')
}
function resetMix(){amounts={};drops=[];mixed=null;mixBusy=false;$('water').style.display='block';$('water').classList.remove('mixing');$('mixresult').classList.remove('visible');$('blend-panel').hidden=true;$('mix-button').disabled=true;$('mix-name').value='';$('mix-definition').value='';$('mix-summary').textContent='감정을 탭하거나 길게 눌러 떨어뜨려 보세요.';renderMixButtons();drawWater()}
function renderMixButtons(){$('drop-emotions').innerHTML=BASE.map(e=>'<button type="button" class="emotion" data-drop="'+e.id+'"><span class="swatch" style="background:'+e.color+'"></span>'+e.name+(amounts[e.id]?'<span class="drop-count">×'+amounts[e.id]+'</span>':'')+'</button>').join('');
document.querySelectorAll('[data-drop]').forEach(btn=>{
const id=btn.dataset.drop;let pointerHandled=false;
btn.addEventListener('pointerdown',ev=>{if(ev.button!==0&&ev.pointerType==='mouse')return;ev.preventDefault();pointerHandled=true;addDrop(id);clearTimeout(droppingTimer);clearInterval(repeatTimer);droppingTimer=setTimeout(()=>{repeatTimer=setInterval(()=>addDrop(id),230)},470)});
const finish=()=>{clearTimeout(droppingTimer);clearInterval(repeatTimer);droppingTimer=repeatTimer=null};
btn.addEventListener('pointerup',finish);btn.addEventListener('pointercancel',finish);btn.addEventListener('pointerleave',finish);btn.addEventListener('contextmenu',e=>e.preventDefault());
btn.addEventListener('click',ev=>{if(ev.detail===0)addDrop(id);else if(!pointerHandled)addDrop(id);pointerHandled=false})});
}
function addDrop(id){
if(mixed||mixBusy){toast('다시 만들기를 누른 뒤 추가할 수 있어요.');return}
const num=Object.values(amounts).reduce((a,b)=>a+b,0);if(num>=36){toast('최대 36방울까지 추가할 수 있어요.');return}
amounts[id]=(amounts[id]||0)+1;
const e=byId(id),t=num+1,theta=t*2.3999632297;
drops.push({id,x:.5+.24*Math.cos(theta),y:.5+.24*Math.sin(theta),time:performance.now(),color:e.color});
$('mix-button').disabled=false;$('mix-summary').textContent='총 '+(num+1)+'방울 · 섞기 전에는 비율을 표시하지 않아요.';const btn=document.querySelector('[data-drop="'+id+'"]');if(btn){let badge=btn.querySelector('.drop-count');if(!badge){badge=document.createElement('span');badge.className='drop-count';btn.append(badge)}badge.textContent='×'+amounts[id]}startWater();
}
function undoDrop(){if(mixed)return;const d=drops.pop();if(d){amounts[d.id]--;if(!amounts[d.id])delete amounts[d.id]}$('mix-button').disabled=!drops.length;$('mix-summary').textContent=drops.length?'총 '+drops.length+'방울':'감정을 탭하거나 길게 눌러 떨어뜨려 보세요.';renderMixButtons();drawWater()}
function startWater(){if(raf)return;function loop(t){raf=0;if(!$('create').classList.contains('active'))return;drawWater(t);raf=requestAnimationFrame(loop)}raf=requestAnimationFrame(loop)}
function stopWater(){if(raf){cancelAnimationFrame(raf);raf=0}clearInterval(repeatTimer);clearTimeout(droppingTimer)}
function drawWater(now=performance.now()){
const node=$('water-canvas'),parent=$('water');if(!node||!parent)return;const dpr=Math.min(devicePixelRatio||1,2),w=parent.clientWidth,h=parent.clientHeight;if(w<1||h<1)return;
if(node.width!==Math.round(w*dpr)||node.height!==Math.round(h*dpr)){node.width=Math.round(w*dpr);node.height=Math.round(h*dpr)}const ctx=node.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
ctx.save();ctx.globalCompositeOperation='source-over';
drops.forEach((d,i)=>{const age=(now-d.time)/1000,r=Math.min(w*.49,11+Math.max(0,age)*56),x=d.x*w+Math.sin(now/2200+i)*2,y=d.y*h+Math.cos(now/2500+i)*2;
const col=d.color;const rgb=[0,2,4].map(j=>parseInt(col.slice(j+1,j+3),16));const g=ctx.createRadialGradient(x,y,0,x,y,r);
g.addColorStop(0,'rgba('+rgb.join(',')+',.30)');g.addColorStop(.50,'rgba('+rgb.join(',')+',.19)');g.addColorStop(1,'rgba('+rgb.join(',')+',0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
if(age<1.2&&age>=0){ctx.strokeStyle='rgba('+rgb.join(',')+','+(0.18*(1-age/1.2))+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,Math.max(3,age*23),0,Math.PI*2);ctx.stroke()}
});ctx.restore()}
function blendMix(){if(mixBusy||mixed)return;const components=BASE.filter(e=>amounts[e.id]>0).map(e=>({id:e.id,n:amounts[e.id]}));const sum=components.reduce((s,e)=>s+e.n,0);if(!sum)return;
mixBusy=true;const color=blendColors(components.map(e=>byId(e.id).color),components.map(e=>e.n));mixed={color,components:components.map(e=>({id:e.id,ratio:e.n/sum}))};
$('water').classList.add('mixing');$('mix-button').disabled=true;setTimeout(()=>{$('water').style.display='none';$('mixresult').classList.add('visible');$('mixed-orb').style.background=color;$('mix-stats').textContent=mixed.components.map(c=>byId(c.id).name+' '+Math.round(c.ratio*100)+'%').join(' · ');$('blend-panel').hidden=false;mixBusy=false;stopWater()},690)}
function createEmotion(addToDay){
if(!mixed)return;const name=$('mix-name').value.trim(),definition=$('mix-definition').value.trim(),id='custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
const e={id,name,color:mixed.color,definition,components:mixed.components,visibility:'private',createdAt:new Date().toISOString()};
db.custom.push(e);saveDB();orbCache.clear();if(addToDay){if(selection.length>=4)selection.pop();selection.push(id)}
renderChoices();renderPreview();resetMix();setScreen(addToDay?'today':'dictionary');toast(addToDay?'새 감정을 오늘에 추가했어요.':'내 감정 사전에 저장했어요.')}
function init(){
loadDB();const old=db.records[isoDay()];if(old){selection=old.emotions.filter(id=>byId(id)).slice(0,4);$('memo').value=old.note||''}
$('today-date').textContent=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'long'}).format(new Date());
document.querySelectorAll('[data-open]').forEach(btn=>btn.onclick=()=>setScreen(btn.dataset.open));
$('reset-select').onclick=()=>{selection=[];renderChoices();renderPreview()};
$('add-custom').onclick=()=>{resetMix();setScreen('create')};$('start-create').onclick=()=>{resetMix();setScreen('create')};
$('create-back').onclick=()=>setScreen('today');
$('save-day').onclick=saveDay;
$('month-prev').onclick=()=>shiftMonth(-1);$('month-next').onclick=()=>shiftMonth(1);
$('mix-button').onclick=blendMix;$('mix-undo').onclick=undoDrop;$('mix-reset').onclick=resetMix;
$('save-word').onclick=()=>createEmotion(false);$('use-word').onclick=()=>createEmotion(true);
window.addEventListener('resize',()=>drawWater());
renderChoices();renderPreview();renderCalendar();renderDictionary();renderMixButtons()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
