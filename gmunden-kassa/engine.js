(function(root){
'use strict';
const titles={panorama:'PANORAMAFAHRT',castle:'SCHLÖSSERFAHRT',schloss:'SCHLÖSSERFAHRT',seerundfahrt:'SEERUNDFAHRT'};
function localClock(date){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));return{date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}:${p.second}`,minutes:Number(p.hour)*60+Number(p.minute)};}
function addDays(iso,n){const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function validTime(t){return typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t);}
function planFor(iso,data,config){
 if(Object.prototype.hasOwnProperty.call(config.overrides,iso))return config.overrides[iso];
 if(data.plans&&Object.prototype.hasOwnProperty.call(data.plans,iso)){
  const p=data.plans[iso];if(!Array.isArray(p.trips))return null;
  const trips=p.trips.filter(t=>!t.cancelled&&!t.provisional).map(t=>{const s=t.stops||[],first=s[0],last=s[s.length-1];if(!first||!last||first.station!=='gm'||last.station!=='gm'||!validTime(first.time)||!validTime(last.time))return null;return{departure:first.time,arrival:last.time,title:titles[t.kind]||t.name||'RUNDFAHRT',via:s.slice(1,-1).map(x=>data.stations.find(y=>y.id===x.station)?.name||x.station)};}).filter(Boolean);return{trips};
 }
 const season=config.advent;if(iso>=season.start&&iso<=season.end){const day=new Date(iso+'T12:00:00Z').getUTCDay();if(day===0||day===6||season.holidays.includes(iso))return{trips:season.weekend};if(day===1||day===5)return{trips:season.weekday};return{trips:[]};}
 return null;
}
function select(clock,data,config){let date=clock.date,plan=planFor(date,data,config),tomorrow=false;const trips=plan?.trips||[];const finished=trips.every(t=>t.departure<=clock.time.slice(0,5));if((clock.date==='2026-11-08'?clock.minutes>=900:clock.minutes>=config.eveningHour*60)&&finished){date=addDays(date,1);plan=planFor(date,data,config);tomorrow=true;}const upcoming=(plan?.trips||[]).filter(t=>tomorrow||t.departure>clock.time.slice(0,5)).sort((a,b)=>a.departure.localeCompare(b.departure));return{date,plan,tomorrow,upcoming,completed:!!plan&&plan.trips.length>0&&!upcoming.length};}
root.KassaEngine={localClock,planFor,select,addDays};if(typeof module!=='undefined')module.exports=root.KassaEngine;
})(typeof window==='undefined'?globalThis:window);
