/* Fixed, site-owner-designated schedule. Never stored in editable personal data. */
window.OfficialSchedule=(()=>{
  const freeze=o=>{Object.values(o).forEach(v=>{if(v&&typeof v==='object')freeze(v)});return Object.freeze(o)};
  const source=freeze(window.OFFICIAL_SCHEDULE),times=JSON.parse(source.tableInfo.time),max=source.tableInfo.maxWeek;
  const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const weekdays=['周一','周二','周三','周四','周五','周六','周日'];
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const midnight=s=>Date.parse(s+'T00:00:00Z'),start=midnight(source.startDate);
  const weekFor=date=>Math.floor((midnight(date)-start)/604800000)+1;
  const dateAt=(week,offset=0)=>new Date(start+(week-1)*604800000+offset*86400000).toISOString().slice(0,10);
  const occurs=(c,w)=>w>=1&&w<=max&&w>=c.startWeek&&w<=c.endWeek&&(c.type===0||c.type===1&&w%2===1||c.type===2&&w%2===0);
  const rows=freeze(source.courses.map((c,i)=>({...c,id:'official-'+i,title:c.name,weekday:c.day,location:c.position,start:times.find(t=>t.node===c.startNode).start,end:times.find(t=>t.node===c.startNode+c.step-1).end,official:true})));
  let selected=Math.max(1,Math.min(max,weekFor(today())));
  const coursesForDate=date=>{const w=weekFor(date),d=(new Date(midnight(date)).getUTCDay()+6)%7+1;return rows.filter(c=>c.weekday===d&&occurs(c,w))};
  const weekLabel=c=>'第 '+c.startWeek+(c.endWeek===c.startWeek?'':'–'+c.endWeek)+' 周'+(['',' · 单周',' · 双周'][c.type]);
  function render(){const current=weekFor(today()),items=selected?rows.filter(c=>occurs(c,selected)):rows;
    return '<section class="official-schedule" aria-labelledby="official-title"><div class="official-heading"><div><span class="chapter">OFFICIAL SCHEDULE / 固定课程表</span><h2 id="official-title">'+esc(source.name)+' 官方课程表</h2><p>站长指定 · '+esc(source.startDate)+' 开学 · '+max+' 周 · '+rows.length+' 条原始安排</p></div><span class="official-lock">固定 · 不可编辑</span></div><div class="official-toolbar"><div><button type="button" class="btn" data-official-step="-1" '+(selected<=1?'disabled':'')+' aria-label="上一教学周">‹</button><label>教学周 <select id="official-week" aria-label="选择官方课程教学周"><option value="0" '+(!selected?'selected':'')+'>全部安排</option>'+Array.from({length:max},(_,i)=>'<option value="'+(i+1)+'" '+(selected===i+1?'selected':'')+'>第 '+(i+1)+' 周'+(current===i+1?' · 本周':'')+'</option>').join('')+'</select></label><button type="button" class="btn" data-official-step="1" '+(selected===0||selected>=max?'disabled':'')+' aria-label="下一教学周">›</button><button class="text-btn" data-official-current>回到当前周</button></div><a href="data/official-GDPU2.json" download="sleepy_GDPU2_20261026_224122.json">下载原始课表 ↗</a></div><p class="official-range" role="status">'+(selected?'第 '+selected+' 周 · '+dateAt(selected)+' — '+dateAt(selected,6):'全部 '+rows.length+' 条安排 · 含不同教师、地点及周次')+(current<1?' · 当前学期尚未开始':current>max?' · 当前学期已结束':'')+'</p><div class="week-scroll"><div class="week-board official-board">'+weekdays.map((d,i)=>'<section class="week-column"><div class="week-title"><h3>'+d+'</h3>'+(selected?'<small>'+dateAt(selected,i).slice(5)+'</small>':'')+'</div>'+items.filter(c=>c.day===i+1).sort((a,b)=>a.start.localeCompare(b.start)||a.startWeek-b.startWeek).map(c=>'<article class="official-course" data-official-id="'+c.id+'"><span class="official-time">'+c.start+' — '+c.end+'</span><h4>'+esc(c.title)+'</h4><p>'+esc(c.teacher)+'<br>'+esc(c.location)+'</p><small>第 '+c.startNode+'–'+(c.startNode+c.step-1)+' 节<br>'+weekLabel(c)+'</small></article>').join('')+(!items.some(c=>c.day===i+1)?'<p class="helper">'+(selected?'本周无官方课程':'无官方课程安排')+'</p>':'')+'</section>').join('')+'</div></div><p class="helper">按原文件的节次、周次和单双周规则展示，日期使用北京时间。个人课程及备份导入不会修改这份固定课表。</p></section>';
  }
  function refresh(){const el=document.querySelector('.official-schedule');if(el)el.outerHTML=render()}
  document.addEventListener('change',e=>{if(e.target.id==='official-week'){const n=Number(e.target.value);if(Number.isInteger(n)&&n>=0&&n<=max){selected=n;refresh()}}});
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-official-current')){selected=Math.max(1,Math.min(max,weekFor(today())));refresh()}if(b.dataset.officialStep&&!b.disabled){selected=Math.max(1,Math.min(max,selected+Number(b.dataset.officialStep)));refresh()}});
  return Object.freeze({render,coursesForDate,today,weekFor,occurs,dateAt});
})();
