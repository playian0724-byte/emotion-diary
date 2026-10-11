
'use strict';
const BASE=[
{id:'joy',name:'기쁨',color:'#FFD02F'},
{id:'calm',name:'평온',color:'#20C4AD'},
{id:'sad',name:'슬픔',color:'#3389EF'},
{id:'anxious',name:'불안',color:'#9557E6'},
{id:'anger',name:'분노',color:'#F15C63'},
{id:'surprise',name:'놀람',color:'#FB9B2D'},
{id:'disgust',name:'혐오',color:'#62C44B'},
{id:'expectation',name:'기대',color:'#F36E9D'}];
const SAMPLES=[
{id:'sample-a',name:'여운',color:'#B795DC',definition:'마음에 남아 오래 이어지는 느낌.',sample:true},
{id:'sample-b',name:'후련함',color:'#65C9B5',definition:'무거운 마음이 풀린 느낌.',sample:true},
{id:'sample-c',name:'아련함',color:'#AC91D2',definition:'지나간 것을 조용히 떠올리는 마음.',sample:true}];
const KEY='gyeol-v2';const $=id=>document.getElementById(id);
let db={records:{},custom:[]},selection=[],month=new Date(new Date().getFullYear(),new Date().getMonth(),1),saving=false;
let drops=[],amounts={},mixed=null,droppingTimer=null,repeatTimer=null,raf=0,mixBusy=false,toastTimer=0;
let nextUnnamed=1,mixStartedAt=0,mixDuration=1900,lastWaterFrame=0;
let mixRaster=null;
// Long press is for small ratio adjustments, not fast continuous pouring.
const HOLD_START_MS=780,HOLD_REPEAT_MS=850,INK_BLOOM_SECONDS=2.8;
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
function blendColors(colors,weights){
 if(colors.length===1)return colors[0];
 const labs=colors.map(rgbToLab),sum=weights.reduce((a,b)=>a+b,0)||1;
 const lightness=labs.reduce((s,p,i)=>s+p[0]*weights[i]/sum,0);
 let targetC=0,sx=0,sy=0;
 labs.forEach((p,i)=>{
   const c=Math.hypot(p[1],p[2]),angle=Math.atan2(p[2],p[1]),w=weights[i]/sum;
   targetC+=c*w; sx+=Math.cos(angle)*w; sy+=Math.sin(angle)*w
 });
 // Circular hue interpolation keeps mixtures colorful rather than averaging opposite
 // OKLab components into gray. This is a deliberately artistic, not physical, paint model.
 let angle=Math.atan2(sy,sx);
 if(Math.hypot(sx,sy)<.025){
   const strongest=weights.indexOf(Math.max(...weights));angle=Math.atan2(labs[strongest][2],labs[strongest][1])
 }
 let lo=0,hi=targetC*.88;
 const inGamut=(C)=>{
   const a=C*Math.cos(angle),b=C*Math.sin(angle);
   const L=Math.pow(lightness+.3963377774*a+.2158037573*b,3);
   const M=Math.pow(lightness-.1055613458*a-.0638541728*b,3);
   const S=Math.pow(lightness-.0894841775*a-1.291485548*b,3);
   return [
      4.0767416621*L-3.3077115913*M+.2309699292*S,
      -1.2684380046*L+2.6097574011*M-.3413193965*S,
      -.0041960863*L-.7034186147*M+1.707614701*S
   ].every(v=>v>=0&&v<=1)
 };
 if(!inGamut(hi)){for(let i=0;i<11;i++){const mid=(lo+hi)/2;if(inGamut(mid))lo=mid;else hi=mid}hi=lo}
 return toHex(labRgb(lightness,hi*Math.cos(angle),hi*Math.sin(angle)));
}
function hue(hex){const [r,g,b]=hexRgb(hex),hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;if(!d)return 0;let h=hi===r?((g-b)/d)%6:hi===g?(b-r)/d+2:(r-g)/d+4;return (h*60+360)%360}

/* V9 — Color first.
   Flat pigment only: no directional light, glass reflection, halo or shimmer.
   One emotion stays its exact hex; 2–4 emotions form a softly joined color field. */
function emotionGlow(inputColors,opacity=.11){
 const colors=inputColors.filter(Boolean);
 if(!colors.length)return 'rgba(0,0,0,0)';
 const color=blendColors(colors,colors.map(()=>1));
 const rgb=[0,2,4].map(i=>parseInt(color.slice(i+1,i+3),16));
 return 'rgba('+rgb.join(',')+','+opacity+')'
}
function orbStyleForColors(inputColors){
 const cs=inputColors.filter(Boolean).slice(0,4).map(c=>c.toUpperCase()).sort((a,b)=>hue(a)-hue(b));
 if(!cs.length)return '#EDF0EB';
 const key='v9-flat|'+cs.join('|');
 if(orbCache.has(key))return orbCache.get(key);
 const size=224,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
 const ctx=canvas.getContext('2d');if(!ctx)return cs[0];
 const image=ctx.createImageData(size,size),px=image.data;
 const labs=cs.map(rgbToLab),num=cs.length,pigments=cs.map(hexRgb);
 const center=(size-1)/2,rad=size*.495,sqrt3=Math.sqrt(3);
 for(let y=0;y<size;y++){
   const yy=(y-center)/rad;
   for(let x=0;x<size;x++){
     const xx=(x-center)/rad,d=Math.hypot(xx,yy);
     if(d>=1.008)continue;
     const idx=(y*size+x)*4;
     let rgb;
     if(num===1)rgb=pigments[0].map(v=>v*255);
     else{
       let w;
       if(num===2){
         const t=smoothstep(clamp(.5+(xx+yy)*.46));
         w=[1-t,t]
       }else if(num===3){
         const top=(1-yy)/3;
         w=[top,(1-top-xx/sqrt3)/2,(1-top+xx/sqrt3)/2]
       }else{
         const u=(xx+1)/2,v=(yy+1)/2;
         w=[(1-u)*(1-v),u*(1-v),u*v,(1-u)*v]
       }
       if(num>=3){
         const shaped=w.map(v=>Math.pow(Math.max(v,0),1.9));
         const sum=shaped.reduce((a,b)=>a+b,0)||1;
         w=shaped.map(v=>v/sum)
       }
       const lab=[0,1,2].map(k=>labs.reduce((sum,p,j)=>sum+p[k]*w[j],0));
       const chroma=Math.hypot(lab[1],lab[2]);
       const expected=labs.reduce((sum,p,j)=>sum+Math.hypot(p[1],p[2])*w[j],0);
       if(chroma>.015&&chroma<expected*.82){
         const scale=Math.min(1.25,expected*.82/chroma);
         lab[1]*=scale;lab[2]*=scale
       }
       rgb=labRgb(...lab)
     }
     px[idx]=Math.round(clamp(rgb[0],0,255));
     px[idx+1]=Math.round(clamp(rgb[1],0,255));
     px[idx+2]=Math.round(clamp(rgb[2],0,255));
     // 1–2px antialiasing; the edge itself never glows.
     px[idx+3]=Math.round(255*clamp((1.005-d)*rad));
   }
 }
 ctx.putImageData(image,0,0);
 const bg='url("'+canvas.toDataURL('image/png')+'") center/100% 100% no-repeat';
 orbCache.set(key,bg);
 return bg
}
function orbStyle(ids){
 return orbStyleForColors(ids.filter(id=>byId(id)).slice(0,4).map(id=>byId(id).color))
}
function paintOrb(node,ids){
 const colors=ids.filter(id=>byId(id)).slice(0,4).map(id=>byId(id).color);
 node.style.background=orbStyleForColors(colors);
 node.style.removeProperty('--orb-halo');
 node.style.removeProperty('--orb-halo-strong');
 node.style.removeProperty('--orb-mini-halo');
}
function renderChoices(){
const selected=new Set(selection);
$('base-emotions').innerHTML=BASE.map(e=>'<button type="button" class="emotion '+(selected.has(e.id)?'active':'')+'" data-select="'+e.id+'"><span class="swatch" style="background:'+e.color+'"></span>'+e.name+(selected.has(e.id)?'<span class="checkmark">✓</span>':'')+'</button>').join('');
const mine=[...SAMPLES,...db.custom];
$('my-emotions').innerHTML=mine.map(e=>'<button type="button" class="emotion '+(selected.has(e.id)?'active':'')+'" data-select="'+e.id+'"><span class="swatch" style="background:'+e.color+'"></span>'+escapeHTML(e.name||'이름 미정')+(selected.has(e.id)?'<span class="checkmark">✓</span>':'')+'</button>').join('');
document.querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.select;if(selection.includes(id))selection=selection.filter(x=>x!==id);else if(selection.length<4)selection.push(id);else toast('최대 4개까지 선택할 수 있습니다.');renderChoices();renderPreview()}))
}
// The luminous WebGL V8.2 experiment is preserved behind ?renderer=webgl.
// Default is the flat, color-first V9 material.
const WEBGL_EXPERIMENT=new URLSearchParams(window.location.search).get('renderer')==='webgl';
let v8Shader=null,v8Failed=false;
function syncOrbShader(){
 if(!WEBGL_EXPERIMENT||v8Failed||!window.GyeolShader)return;
 const active=document.querySelector('.screen.active')?.id;
 let node=null,colors=[];
 if(active==='today'&&selection.length){
   node=$('today-orb');colors=selection.filter(id=>byId(id)).map(id=>byId(id).color);
 }
 if(!node){v8Shader?.detach();return}
 colors.sort((a,b)=>hue(a)-hue(b));
 if(!v8Shader){v8Shader=window.GyeolShader.create();if(!v8Shader){v8Failed=true;return}}
 try{v8Shader.mount(node,colors)}catch(e){
   console.warn('V8 shader unavailable, V7 fallback is active',e);
   v8Shader.detach();v8Failed=true;
 }
}
function renderPreview(){paintOrb($('today-orb'),selection);$('today-orb').classList.toggle('empty',selection.length===0);$('selected-label').textContent=selection.length?selection.map(id=>byId(id)?.name||'이름 미정').join(' · '):'감정을 선택하세요.';$('save-day').disabled=selection.length===0||saving;syncOrbShader()}
function setScreen(id){document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('nav button').forEach(el=>el.classList.toggle('active',el.dataset.open===id));if(id==='archive')renderCalendar();if(id==='dictionary')renderDictionary();if(id==='create')startWater();else stopWater();syncOrbShader();window.scrollTo(0,0)}
/* V16 — one staggered bead-poster grammar at every timescale.
   Zoom uses 7/3/2/1 bead-columns PER month for 1/3/6/12 month views. */
const CAL_SPANS=[1,3,6,12];
let calendarZoom=0,calendarSelected=isoDay();
function shiftMonth(delta){
 month=new Date(month.getFullYear(),month.getMonth()+delta*CAL_SPANS[calendarZoom],1);
 if(calendarZoom===3)month=new Date(month.getFullYear(),0,1);
 renderCalendar()
}
/* V17 — interactive scale follows the fingers; after release, each visible
   date keeps its identity and travels into its new grid position (FLIP). */
let calendarMotion=[],calendarIgnoreClickUntil=0;
const calendarReducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function stopCalendarMotion(){
 calendarMotion.forEach(animation=>{try{animation.cancel()}catch(e){}});
 calendarMotion=[];
}
function calendarFocusPoint(point){
 const rect=$('calendar').getBoundingClientRect();
 return point||{x:rect.left+rect.width/2,y:Math.max(rect.top+55,Math.min(rect.bottom-50,window.innerHeight*.49))}
}
function snapshotCalendar(point){
 const rects=new Map(),focal=calendarFocusPoint(point);
 const height=window.innerHeight||document.documentElement.clientHeight;
 let nearest=null,best=Infinity;
 const nodes=$('calendar').querySelectorAll('[data-date]');
 for(const button of nodes){
   const circle=button.querySelector('.mini');if(!circle)continue;
   const b=circle.getBoundingClientRect();
   if(b.bottom< -140||b.top>height+140||b.right<0||b.left>window.innerWidth)continue;
   const centerX=b.left+b.width/2,centerY=b.top+b.height/2;
   const d=Math.hypot((centerX-focal.x)*.8,centerY-focal.y);
   if(d<best){best=d;nearest=button.dataset.date}
   rects.set(button.dataset.date,{x:centerX,y:centerY,w:b.width,h:b.height})
 }
 return {rects,nearest,focus:focal}
}
function animateCalendarLayout(before,next,zoomDelta){
 const target=$('calendar');
 const height=window.innerHeight||document.documentElement.clientHeight;
 // Keep the bead nearest the midpoint of the gesture at the same screen spot.
 const oldAnchor=before.nearest&&before.rects.get(before.nearest);
 const newButton=before.nearest&&target.querySelector('[data-date="'+before.nearest+'"]');
 if(oldAnchor&&newButton){
   const dest=newButton.querySelector('.mini')?.getBoundingClientRect();
   if(dest){
     const dy=dest.top+dest.height/2-oldAnchor.y;
     if(Math.abs(dy)>3&&Number.isFinite(dy))window.scrollBy(0,dy);
   }
 }
 if(calendarReducedMotion())return;
 stopCalendarMotion();
 const active=[...target.querySelectorAll('[data-date]')].map(button=>({button,
   circle:button.querySelector('.mini')})).filter(item=>{
     if(!item.circle)return false;
     const rect=item.circle.getBoundingClientRect();
     return rect.bottom>=-130&&rect.top<=height+130
   });
 // In a year poster, months are DOM-ordered by column: animate the cells
 // closest to the pinch FIRST, not only January through April.
 active.sort((a,b)=>{
   const ra=a.circle.getBoundingClientRect(),rb=b.circle.getBoundingClientRect();
   const score=r=>Math.hypot((r.left+r.width/2-before.focus.x)*.8,r.top+r.height/2-before.focus.y);
   return score(ra)-score(rb)
 });
 let animated=0;
 for(const {button,circle} of active){
   if(!circle.animate)continue;
   const end=circle.getBoundingClientRect();
   const old=before.rects.get(button.dataset.date);
   if(old&&animated<105){
     const dx=old.x-(end.left+end.width/2),dy=old.y-(end.top+end.height/2);
     const scaleX=Math.max(.14,Math.min(7,old.w/end.width));
     const scaleY=Math.max(.14,Math.min(7,old.h/end.height));
     const animation=circle.animate([
       {transform:'translate('+dx+'px,'+dy+'px) scale('+scaleX+','+scaleY+')',opacity:1},
       {transform:'translate(0px,0px) scale(1,1)',opacity:1}
     ],{duration:480,easing:'cubic-bezier(.19,1,.26,1)'});
     calendarMotion.push(animation);animated++;
   }else if(animated<105){
     const animation=circle.animate([
       {opacity:0,transform:'scale('+(zoomDelta<0?'.85':'1.15')+')'},
       {opacity:1,transform:'scale(1)'}
     ],{duration:290,delay:65,easing:'cubic-bezier(.22,1,.36,1)'});
     calendarMotion.push(animation);animated++
   }
 }
 const heading=$('month-label');
 if(heading.animate){
   calendarMotion.push(heading.animate([
     {opacity:.6,transform:'translateY('+(zoomDelta<0?'9':'-9')+'px)'},
     {opacity:1,transform:'translateY(0px)'}
   ],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'}))
 }
}
function changeCalendarZoom(delta,point){
 const next=Math.max(0,Math.min(CAL_SPANS.length-1,calendarZoom+delta));
 if(next===calendarZoom)return false;
 const before=snapshotCalendar(point);
 stopCalendarMotion();
 calendarZoom=next;
 const size=CAL_SPANS[next];
 // A zoom stays anchored to the month underneath the user's fingers.
 const focusMonth=before.nearest?new Date(before.nearest+'T12:00:00'):month;
 month=new Date(focusMonth.getFullYear(),Math.floor(focusMonth.getMonth()/size)*size,1);
 renderCalendar();
 animateCalendarLayout(before,next,delta);
 calendarIgnoreClickUntil=performance.now()+620;
 return true
}
function numericMonth(date){return String(date.getMonth()+1).padStart(2,'0')}
function dateInk(rec){
 if(!rec)return '#969A93';
 const colors=(rec.emotions||[]).map(id=>byId(id)?.color).filter(Boolean);
 if(!colors.length)return '#343A36';
 let mean=0;
 for(const color of colors){
   const rgb=hexRgb(color).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
   mean+=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722
 }
 return mean/colors.length>.39?'#232925':'#FFFFFF'
}
function calendarDayMarkup(y,m,day){
 const key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 const rec=db.records[key];
 const cls=(rec?' recorded':'')+(key===isoDay()?' today':'')+(key===calendarSelected?' selected':'');
 return '<button type="button" class="cal-day'+cls+'" data-date="'+key+'" aria-label="'+key+(rec?' 감정 기록':' 기록 없음')+'"><span class="mini"><span class="daynum" style="color:'+dateInk(rec)+'">'+day+'</span></span></button>'
}
function calendarMonthMarkup(date,span){
 const y=date.getFullYear(),m=date.getMonth(),n=new Date(y,m+1,0).getDate();
 // Each zoom step divides a month's dates into more/fewer adjacent bead stacks.
 const cols=span===1?7:span===3?3:span===6?2:1;
 const dates=Array.from({length:n},(_,i)=>{
  const col=i%cols;
  return calendarDayMarkup(y,m,i+1).replace('class="cal-day','class="cal-day'+(col%2?' bead-offset':''))
 }).join('');
 return '<section class="poster-month" aria-label="'+y+' '+numericMonth(date)+'">'+
  (span===1?'':'<h3 class="poster-month-label">'+numericMonth(date)+'</h3>')+
  '<div class="poster-days" style="--bead-cols:'+cols+'">'+dates+'</div></section>'
}
function calendarYearPoster(year){
 const columns=Array.from({length:12},(_,m)=>{
  const n=new Date(year,m+1,0).getDate();
  const dates=Array.from({length:n},(_,i)=>calendarDayMarkup(year,m,i+1)).join('');
  return '<section class="poster-month" aria-label="'+year+' / '+String(m+1).padStart(2,'0')+'">'+
   '<h3 class="poster-month-label">'+String(m+1).padStart(2,'0')+'</h3>'+
   '<div class="poster-days">'+dates+'</div></section>'
 }).join('');
 return '<div class="poster-months" role="group" aria-label="'+year+' 감정 연감">'+columns+'</div>'
}
function renderCalendar(){
 const span=CAL_SPANS[calendarZoom];
 if(span===12)month=new Date(month.getFullYear(),0,1);
 const last=new Date(month.getFullYear(),month.getMonth()+span-1,1);
 const yr=month.getFullYear();
 const startNumber=numericMonth(month),endNumber=numericMonth(last);
 // Typography replaces slash punctuation with clear size and weight hierarchy.
 const headerYear='<span class="period-year">'+yr+'</span>';
 const headerMonth='<span class="period-month">'+startNumber+(span===1?'':'–'+endNumber)+'</span>';
 $('month-label').innerHTML=span===12?headerYear:headerYear+headerMonth;
 $('month-label').setAttribute('aria-label',span===12?yr+'년':
  (yr+'년 '+(month.getMonth()+1)+'월'+(span>1?'부터 '+(last.getMonth()+1)+'월까지':'')));
 const archive=$('archive');
 archive.classList.toggle('poster-year',span===12);
 archive.classList.toggle('poster-month-view',span!==12);
 const target=$('calendar');
 target.className='calendar-archive zoom-'+span;
 target.innerHTML=span===12?calendarYearPoster(yr):
  '<div class="poster-months" role="group" aria-label="'+yr+'년 '+span+'개월 감정 기록">'+
  Array.from({length:span},(_,i)=>calendarMonthMarkup(new Date(yr,month.getMonth()+i,1),span)).join('')+'</div>';
 target.querySelectorAll('[data-date]').forEach(el=>{
   const rec=db.records[el.dataset.date];
   if(rec)paintOrb(el.querySelector('.mini'),rec.emotions);
   el.addEventListener('click',()=>showDate(el.dataset.date))
 });
 showDate(calendarSelected,false)
}
function showDate(day,rerender=true){
 calendarSelected=day;
 if(rerender){
  $('calendar').querySelectorAll('.cal-day.selected').forEach(el=>el.classList.remove('selected'));
  const selected=$('calendar').querySelector('[data-date="'+day+'"]');
  if(selected)selected.classList.add('selected')
 }
 const e=db.records[day],detail=$('record-detail');
 detail.replaceChildren();
 const title=document.createElement('strong');title.textContent=day;detail.append(title);
 const p=document.createElement('p');
 p.textContent=e?(e.emotions.map(id=>byId(id)?.name||'이름 미정').join(' · ')+(e.note?'\n'+e.note:'')):'기록 없음';
 detail.append(p)
}
function setupCalendarGestures(){
 const el=$('calendar'),reduced=calendarReducedMotion;
 let pinch=null,touchSingle=null,mouseDrag=null,wheelScale=1,wheelTimer=0;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const dist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
 const midpoint=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
 function preview(scale,focus,dx=0,dy=0){
   if(reduced())return;
   const group=el.querySelector('.poster-months');if(!group)return;
   const area=group.getBoundingClientRect();
   if(!group.dataset.previewOrigin){
     group.style.transformOrigin=(focus.x-area.left)+'px '+(focus.y-area.top)+'px';
     group.dataset.previewOrigin='yes'
   }
   group.style.transform='translate('+dx+'px,'+dy+'px) scale('+clamp(scale,.68,1.5)+')'
   group.classList.add('calendar-previewing')
 }
 function resetPreview(){
   const group=el.querySelector('.poster-months');
   if(!group)return;
   const from=group.style.transform;
   group.style.removeProperty('transform');
   group.style.removeProperty('transform-origin');
   delete group.dataset.previewOrigin;
   group.classList.remove('calendar-previewing');
   if(from&&!reduced()&&group.animate){
     calendarMotion.push(group.animate([{transform:from},{transform:'none'}],
       {duration:270,easing:'cubic-bezier(.2,.85,.25,1)'}))
   }
 }
 function finishPinch(scale,point){
   const magnitude=Math.abs(Math.log(Math.max(.1,scale)));
   const threshold=Math.log(1.16);
   if(magnitude<threshold){resetPreview();return}
   const delta=scale>1?-1:1;
   const changed=changeCalendarZoom(delta,point);
   if(!changed)resetPreview()
 }
 // Use Safari touch events for the pinch. Do not rerender on every move.
 el.addEventListener('touchstart',e=>{
   if(e.touches.length===2){
     const a=e.touches[0],b=e.touches[1];
     const point=midpoint(a,b);
     pinch={distance:dist(a,b),point,lastPoint:point,scale:1};
     touchSingle=null
   }else if(e.touches.length===1&&!pinch){
     const t=e.touches[0];
     touchSingle={x:t.clientX,y:t.clientY}
   }
 },{passive:true});
 el.addEventListener('touchmove',e=>{
   if(!pinch||e.touches.length!==2)return;
   if(e.cancelable)e.preventDefault();
   const a=e.touches[0],b=e.touches[1],p=midpoint(a,b);
   pinch.scale=clamp(dist(a,b)/Math.max(1,pinch.distance),.66,1.55);
   pinch.lastPoint=p;
   preview(pinch.scale,p,p.x-pinch.point.x,p.y-pinch.point.y)
 },{passive:false});
 el.addEventListener('touchend',e=>{
   if(pinch){
     if(e.touches.length<2){
       const data=pinch;pinch=null;
       touchSingle=null;
       calendarIgnoreClickUntil=performance.now()+500;
       finishPinch(data.scale,data.lastPoint);
     }
     return
   }
   if(touchSingle&&e.touches.length===0){
     const a=touchSingle,b=e.changedTouches[0];touchSingle=null;
     if(!b)return;
     const dx=b.clientX-a.x,dy=b.clientY-a.y;
     if(Math.abs(dy)>105&&Math.abs(dy)>Math.abs(dx)*1.3){
       calendarIgnoreClickUntil=performance.now()+350;
       changeCalendarZoom(dy>0?-1:1,{x:b.clientX,y:b.clientY})
     }else if(Math.abs(dx)>95&&Math.abs(dx)>Math.abs(dy)*1.3){
       calendarIgnoreClickUntil=performance.now()+350;
       shiftMonth(dx>0?-1:1)
     }
   }
 },{passive:true});
 el.addEventListener('touchcancel',()=>{
   pinch=null;touchSingle=null;resetPreview()
 },{passive:true});
 // Mouse users can drag dates left/right or up/down; touch is handled above.
 el.addEventListener('pointerdown',e=>{
   if(e.pointerType==='touch'||e.button!==0)return;
   mouseDrag={x:e.clientX,y:e.clientY,id:e.pointerId};
 });
 el.addEventListener('pointerup',e=>{
   if(!mouseDrag||e.pointerId!==mouseDrag.id)return;
   const dx=e.clientX-mouseDrag.x,dy=e.clientY-mouseDrag.y;
   mouseDrag=null;
   if(Math.abs(dy)>85&&Math.abs(dy)>Math.abs(dx)*1.2){
     calendarIgnoreClickUntil=performance.now()+350;
     changeCalendarZoom(dy>0?-1:1,{x:e.clientX,y:e.clientY})
   }else if(Math.abs(dx)>95&&Math.abs(dx)>Math.abs(dy)*1.2){
     calendarIgnoreClickUntil=performance.now()+350;
     shiftMonth(dx>0?-1:1)
   }
 });
 el.addEventListener('pointercancel',()=>{mouseDrag=null});
 // Trackpad pinch on desktop is Ctrl+wheel. Preview follows the movement,
 // then settles to the next density when the gesture goes idle.
 el.addEventListener('wheel',e=>{
   if(!e.ctrlKey)return;
   if(e.cancelable)e.preventDefault();
   wheelScale=clamp(wheelScale*Math.exp(-e.deltaY*.012),.65,1.55);
   const point={x:e.clientX,y:e.clientY};
   preview(wheelScale,point);
   clearTimeout(wheelTimer);
   wheelTimer=setTimeout(()=>{
     finishPinch(wheelScale,point);
     wheelScale=1
   },140)
 },{passive:false});
 el.addEventListener('click',e=>{
   if(performance.now()<calendarIgnoreClickUntil){
     e.preventDefault();e.stopImmediatePropagation()
   }
 },true)
}
function renderDictionary(){const data=[...db.custom];const host=$('dictionary-list');if(!data.length){host.innerHTML='<div class="empty-state">저장된 감정이 없습니다.</div>';return}
host.innerHTML=data.slice().reverse().map(e=>'<div class="dictionary-item"><span class="swatch" style="background:'+e.color+'"></span><div class="copy"><strong>'+escapeHTML(e.name||'이름 미정')+'</strong><p>'+escapeHTML(e.definition||e.components.map(c=>byId(c.id)?.name+' '+Math.round(c.ratio*100)+'%').join(' · '))+'</p></div><span class="privacy">Private</span><button type="button" class="subtle-button" data-use="'+escapeHTML(e.id)+'">사용</button></div>').join('');
host.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{useEmotion(b.dataset.use)})}
function useEmotion(id){if(!selection.includes(id)){if(selection.length>=4){toast('감정 하나를 해제하세요.');setScreen('today');return}selection.push(id)}renderChoices();renderPreview();setScreen('today');toast('오늘에 추가됨')}
function positionFlightStart(rect){const w=168,h=168;return rect.top>=10&&rect.bottom<window.innerHeight-10?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:{left:(innerWidth-w)/2,top:Math.max(70,(innerHeight-h)/2-40),width:w,height:h}}
async function saveDay(){
if(saving||!selection.length)return;saving=true;$('save-day').disabled=true;
const keys=[...selection],note=$('memo').value;db.records[isoDay()]={emotions:keys,note,createdAt:new Date().toISOString()};saveDB();month=new Date(new Date().getFullYear(),calendarZoom===3?0:new Date().getMonth(),1);calendarSelected=isoDay();
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
ghost.remove();saving=false;renderPreview();try{navigator.vibrate?.(12)}catch(e){}toast('저장됨')
}
function resetMix(){if(v8Shader)v8Shader.detach();amounts={};drops=[];mixed=null;mixBusy=false;mixStartedAt=0;lastWaterFrame=0;$('water').style.opacity='1';$('mix-stats').style.opacity='0';$('blend-panel').hidden=true;$('mix-button').disabled=true;$('mix-undo').disabled=false;$('mix-name').value='';$('mix-definition').value='';$('mix-summary').textContent='감정을 떨어뜨려 보세요.';renderMixButtons();drawWater();startWater()}
function renderMixButtons(){$('drop-emotions').innerHTML=BASE.map(e=>'<button type="button" class="emotion" data-drop="'+e.id+'"><span class="swatch" style="background:'+e.color+'"></span>'+e.name+(amounts[e.id]?'<span class="drop-count">×'+amounts[e.id]+'</span>':'')+'</button>').join('');
document.querySelectorAll('[data-drop]').forEach(btn=>{
const id=btn.dataset.drop;let pointerHandled=false;
btn.addEventListener('pointerdown',ev=>{if(ev.button!==0&&ev.pointerType==='mouse')return;ev.preventDefault();pointerHandled=true;addDrop(id);clearTimeout(droppingTimer);clearInterval(repeatTimer);droppingTimer=setTimeout(()=>{addDrop(id);repeatTimer=setInterval(()=>addDrop(id),HOLD_REPEAT_MS)},HOLD_START_MS)});
const finish=()=>{clearTimeout(droppingTimer);clearInterval(repeatTimer);droppingTimer=repeatTimer=null};
btn.addEventListener('pointerup',finish);btn.addEventListener('pointercancel',finish);btn.addEventListener('pointerleave',finish);btn.addEventListener('contextmenu',e=>e.preventDefault());
btn.addEventListener('click',ev=>{if(ev.detail===0)addDrop(id);else if(!pointerHandled)addDrop(id);pointerHandled=false})});
}
function addDrop(id){
if(mixed||mixBusy){toast('다시 만들기를 선택하세요.');return}
const num=Object.values(amounts).reduce((a,b)=>a+b,0);if(num>=36){toast('최대 36방울까지 가능합니다.');return}
amounts[id]=(amounts[id]||0)+1;
const e=byId(id),t=num+1,theta=t*2.3999632297;
drops.push({id,x:.5+.24*Math.cos(theta),y:.5+.24*Math.sin(theta),time:performance.now(),color:e.color});
$('mix-button').disabled=false;$('mix-summary').textContent='총 '+(num+1)+'방울';const btn=document.querySelector('[data-drop="'+id+'"]');if(btn){let badge=btn.querySelector('.drop-count');if(!badge){badge=document.createElement('span');badge.className='drop-count';btn.append(badge)}badge.textContent='×'+amounts[id]}startWater();
}
function undoDrop(){if(mixed)return;const d=drops.pop();if(d){amounts[d.id]--;if(!amounts[d.id])delete amounts[d.id]}$('mix-button').disabled=!drops.length;$('mix-summary').textContent=drops.length?'총 '+drops.length+'방울':'감정을 떨어뜨려 보세요.';renderMixButtons();drawWater()}
/* V10 — One water canvas carries the actual pigment from diffuse drops
   into a single solid circle. No DOM marble, crossfade, or scale-in layer. */
function startWater(){
 if(raf)return;
 function frame(t){
   raf=0;
   if(!$('create').classList.contains('active'))return;
   const fresh=drops.length&&t-drops[drops.length-1].time<INK_BLOOM_SECONDS*1000+200;
   if(t-lastWaterFrame>(mixBusy?33:fresh?(drops.length>18?65:45):120)){
     drawWater(t);lastWaterFrame=t
   }
   if(!mixed||mixBusy)raf=requestAnimationFrame(frame)
 }
 raf=requestAnimationFrame(frame)
}
function stopWater(){
 if(raf){cancelAnimationFrame(raf);raf=0}
 clearInterval(repeatTimer);clearTimeout(droppingTimer)
}
function smoothstep(v){v=clamp(v);return v*v*(3-2*v)}
function lerp(a,b,t){return a+(b-a)*t}
/* V13 — slower, wider individual dye diffusion with V8 circular swatch controls.
   The original multi-drop water experience flows into V10's continuous
   single-Canvas coagulation, rather than a second fade-in marble. */
function drawWater(now=performance.now()){
 const canvas=$('water-canvas'),host=$('water');
 if(!canvas||!host)return;
 const w=host.clientWidth,h=host.clientHeight;
 if(w<1||h<1)return;
 const dpr=Math.min(window.devicePixelRatio||1,1.5);
 const width=Math.round(w*dpr),height=Math.round(h*dpr);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.clearRect(0,0,w,h);
 if(!drops.length)return;

 // One visible Canvas, and one smaller OFFSCREEN calculation buffer for
 // the same continuous color/opacity field. No crossfaded result layer.
 const scale=Math.min(1,225/w);
 const rw=Math.max(1,Math.round(w*scale)),rh=Math.max(1,Math.round(h*scale));
 if(!mixRaster||mixRaster.width!==rw||mixRaster.height!==rh){
   const buffer=document.createElement('canvas');
   buffer.width=rw;buffer.height=rh;
   const bctx=buffer.getContext('2d');
   if(!bctx)return;
   mixRaster={buffer,ctx:bctx,width:rw,height:rh,image:bctx.createImageData(rw,rh)}
 }
 const data=mixRaster.image.data;
 const p=mixBusy?clamp((now-mixStartedAt)/mixDuration):mixed?1:0;
 const move=smoothstep(p),shape=smoothstep((p-.40)/.57);
 const merge=smoothstep((p-.13)/.84);
 const cx=w*.5,cy=h*.5,turn=move*Math.PI*.85;
 const co=Math.cos(turn),si=Math.sin(turn);
 const sources=drops.map((d,i)=>{
   const age=Math.max(0,((mixBusy||mixed?mixStartedAt:now)-d.time)/1000);
   const opening=smoothstep(age/INK_BLOOM_SECONDS);
   // An individual ink drop starts compact, then blooms outward in water.
   // Previous V10 grouped all same-color drops and erased this behavior.
   const bloomRadius=lerp(9,Math.min(195,Math.max(w*.48,h*.67)),opening);
   const radius=lerp(bloomRadius,69,move);
   const dx=(d.x-.5)*w,dy=(d.y-.5)*h;
   const drift=(!mixBusy&&!mixed)?Math.sin(now/2100+i*1.7)*1.4:0;
   return {
     x:cx+(dx*co-dy*si)*(1-move)+drift,
     y:cy+(dx*si+dy*co)*(1-move),
     r2:radius*radius,
     strength:.66,
     rgb:hexRgb(d.color).map(v=>Math.round(v*255)),
     age,
     opening
   }
 });
 const finishRgb=mixed?hexRgb(mixed.color).map(v=>Math.round(v*255)):null;
 const sphereRadius=Math.min(73,h*.34,w*.27);
 // Each source contributes its original ink hue. As the field contracts
 // it becomes the ONE final solid-color circle in this very same Canvas.
 for(let y=0;y<rh;y++){
   const py=(y+.5)*h/rh,dy=py-cy;
   for(let x=0;x<rw;x++){
     const px=(x+.5)*w/rw,dx=px-cx;
     const i=(y*rw+x)*4;
     let density=0,red=0,green=0,blue=0;
     for(const ink of sources){
       const xx=px-ink.x,yy=py-ink.y,dist2=xx*xx+yy*yy;
       if(dist2>ink.r2*5.2)continue;
       const weight=Math.exp(-1.68*dist2/ink.r2)*ink.strength;
       density+=weight;
       red+=weight*ink.rgb[0];green+=weight*ink.rgb[1];blue+=weight*ink.rgb[2]
     }
     const dyeAlpha=(1-Math.exp(-1.65*density))*.72;
     const discAlpha=clamp((sphereRadius+.65-Math.hypot(dx,dy))/1.3);
     const alpha=lerp(dyeAlpha,discAlpha,shape);
     if(alpha<.003){
       data[i]=data[i+1]=data[i+2]=data[i+3]=0;
       continue
     }
     const inv=density>.00001?1/density:0;
     const color=finishRgb||[0,0,0];
     data[i]=Math.round(clamp(lerp(red*inv,color[0],merge),0,255));
     data[i+1]=Math.round(clamp(lerp(green*inv,color[1],merge),0,255));
     data[i+2]=Math.round(clamp(lerp(blue*inv,color[2],merge),0,255));
     data[i+3]=Math.round(255*clamp(alpha))
   }
 }
 mixRaster.ctx.putImageData(mixRaster.image,0,0);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(mixRaster.buffer,0,0,w,h);

 // The original soft concentric splash on each new ink drop.
 // It belongs to the same Canvas, and is gone before condensation begins.
 if(!mixBusy&&!mixed){
   sources.forEach(ink=>{
     if(ink.age>=2.2)return;
     const q=smoothstep(ink.age/2.2);
     const r=lerp(3,74,q);
     const opacity=.24*(1-q);
     ctx.beginPath();ctx.arc(ink.x,ink.y,r,0,Math.PI*2);
     ctx.lineWidth=1.1;
     ctx.strokeStyle='rgba('+ink.rgb.join(',')+','+opacity.toFixed(3)+')';
     ctx.stroke();
     if(ink.age<.22){
       const fade=1-smoothstep(ink.age/.22);
       ctx.beginPath();ctx.arc(ink.x,ink.y,lerp(5,3,q),0,Math.PI*2);
       ctx.fillStyle='rgba('+ink.rgb.join(',')+','+(.44*fade).toFixed(3)+')';
       ctx.fill()
     }
   })
 }

 if(mixBusy&&p>=1){
   mixBusy=false;
   $('mix-stats').style.opacity='1';
   $('blend-panel').hidden=false;
   $('mix-undo').disabled=true;
   $('mix-summary').textContent='완성';
   try{navigator.vibrate?.(8)}catch(e){}
 }
}
function blendMix(){
 if(mixBusy||mixed)return;
 const components=BASE.filter(e=>amounts[e.id]>0).map(e=>({id:e.id,n:amounts[e.id]}));
 const sum=components.reduce((s,e)=>s+e.n,0);if(!sum)return;
 const color=blendColors(components.map(e=>byId(e.id).color),components.map(e=>e.n));
 mixed={color,components:components.map(e=>({id:e.id,ratio:e.n/sum}))};
 $('mix-stats').textContent=mixed.components.map(c=>byId(c.id).name+' '+Math.round(c.ratio*100)+'%').join(' · ');
 $('mix-stats').style.opacity='0';
 $('mix-button').disabled=true;
 mixBusy=true;
 mixStartedAt=performance.now();
 lastWaterFrame=0;
 $('mix-summary').textContent='섞는 중';
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
   mixStartedAt-=mixDuration;
   drawWater(performance.now());
 }else startWater();
}
function createEmotion(addToDay){
if(!mixed)return;const name=$('mix-name').value.trim(),definition=$('mix-definition').value.trim(),id='custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
const e={id,name,color:mixed.color,definition,components:mixed.components,visibility:'private',createdAt:new Date().toISOString()};
db.custom.push(e);saveDB();orbCache.clear();if(addToDay){if(selection.length>=4)selection.pop();selection.push(id)}
renderChoices();renderPreview();resetMix();setScreen(addToDay?'today':'dictionary');toast(addToDay?'오늘에 추가됨':'사전에 저장됨')}
function init(){
loadDB();const old=db.records[isoDay()];if(old){selection=old.emotions.filter(id=>byId(id)).slice(0,4);$('memo').value=old.note||''}
$('today-date').textContent=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'long'}).format(new Date());
document.querySelectorAll('[data-open]').forEach(btn=>btn.onclick=()=>setScreen(btn.dataset.open));
$('reset-select').onclick=()=>{selection=[];renderChoices();renderPreview()};
$('add-custom').onclick=()=>{resetMix();setScreen('create')};$('start-create').onclick=()=>{resetMix();setScreen('create')};
$('create-back').onclick=()=>setScreen('today');
$('save-day').onclick=saveDay;
$('month-prev').onclick=()=>shiftMonth(-1);$('month-next').onclick=()=>shiftMonth(1);setupCalendarGestures();
$('mix-button').onclick=blendMix;$('mix-undo').onclick=undoDrop;$('mix-reset').onclick=resetMix;
$('save-word').onclick=()=>createEmotion(false);$('use-word').onclick=()=>createEmotion(true);
window.addEventListener('resize',()=>drawWater());
renderChoices();renderPreview();renderCalendar();renderDictionary();renderMixButtons();
const viewName=new URLSearchParams(window.location.search).get('view');
const zoomForView={month:0,quarter:1,half:2,year:3};
if(Object.prototype.hasOwnProperty.call(zoomForView,viewName)){
 calendarZoom=zoomForView[viewName];
 const now=new Date(),step=CAL_SPANS[calendarZoom];
 month=new Date(now.getFullYear(),Math.floor(now.getMonth()/step)*step,1);
 setScreen('archive')
}
}
window.GyeolPreview={orbStyleForColors,emotionGlow,hue};
if(document.body.dataset.page!=='compare'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
