/* Personal campus workspace. Records stay inside Studio's versioned backup. */
window.Workspace=(()=>{
  let api,editing=null,reviewId=null,showAnswer=false,reviewed=new Set(),courseDay=0;
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const days=['周一','周二','周三','周四','周五','周六','周日'],nowDay=()=>((new Date().getDay()+6)%7)+1;
  const day=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const plusDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return day(d)};
  const distance=d=>Math.round((Date.parse(d+'T00:00:00Z')-Date.parse(day()+'T00:00:00Z'))/86400000);
  const uid=()=>crypto.randomUUID(),get=()=>api.getState(),save=()=>api.save();
  const empty=(icon,text)=>'<div class="empty-state"><b>'+icon+'</b>'+text+'</div>';
  const heading=(tag,title,desc,action='')=>'<div class="page-heading"><div><span class="chapter">'+tag+'</span><h1>'+title+'</h1><p>'+desc+'</p></div>'+action+'</div>';
  const tabs=()=>'<nav class="workspace-tabs" aria-label="学习工作台"><a href="#dashboard">总览</a><a href="#timetable">课程表</a><a href="#countdown">考试倒计时</a><a href="#flashcards">复习卡片</a><a href="#learn">专注自习室 ↗</a></nav>';
  const shell=(body)=>'<div class="studio-wrap workspace">'+tabs()+body+'</div>';
  const link=(url,label)=>'<a class="section-link" href="'+url+'">'+label+' ↗</a>';
  function dateBadge(exam){const n=distance(exam.date);return n>0?'<strong>'+n+'</strong><span>天后</span>':n===0?'<strong>今天</strong><span>从容上场</span>':'<strong>'+Math.abs(n)+'</strong><span>天前 · 已结束</span>'}
  function activity(){
    const state=get();let values=[];for(let i=6;i>=0;i--){const d=plusDays(-i);values.push({date:d,total:state.sessions.filter(s=>s.date===d).reduce((n,s)=>n+s.minutes,0)})}
    const max=Math.max(25,...values.map(v=>v.total));
    return '<div class="activity-chart" role="img" aria-label="'+esc(values.map(v=>v.date+'专注'+v.total+'分钟').join('，'))+'">'+values.map(v=>'<div class="activity-column"><span>'+v.total+'</span><div class="bar-track"><div class="bar-fill" style="height:'+(v.total/max*100)+'%"></div></div><small>'+v.date.slice(5).replace('-','/')+'</small></div>').join('')+'</div><p class="helper">仅统计已完成的专注轮次；没有记录的日期显示 0。</p>';
  }
  function dashboard(){
    const s=get(),todays=s.courses.filter(c=>c.weekday===nowDay()).sort((a,b)=>a.start.localeCompare(b.start)),future=s.exams.filter(x=>distance(x.date)>=0).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
    const due=s.cards.filter(c=>c.due<=day()).length,minutes=s.sessions.filter(x=>x.date===day()).reduce((n,x)=>n+x.minutes,0),done=s.tasks.filter(t=>t.done).length;
    return shell(heading('YOUR PERSONAL CAMPUS OS','今天的节奏，由你掌握。','课程、目标与复习，在一个工作台里安排。所有数据仅保存在当前浏览器。','<button class="btn" data-open-settings>备份我的工作台 ↗</button>')+
      '<div class="metric-grid">'+[['今日专注',minutes,'分钟','#learn'],['任务完成',done+' / '+s.tasks.length,'项','#learn'],['今日课程',todays.length,'门','#timetable'],['待复习',due,'张','#flashcards']].map(([t,n,u,h])=>'<a class="metric-card" href="'+h+'"><span>'+t+'</span><div><strong>'+n+'</strong><small>'+u+'</small></div><span class="metric-arrow">↗</span></a>').join('')+'</div>'+
      '<div class="dashboard-grid"><section class="panel"><div class="widget-heading"><h2>让专注，看得见。</h2><span class="pill">近 7 天</span></div>'+activity()+'</section><section class="panel"><div class="widget-heading"><h2>下一站，准备好。</h2>'+link('#countdown','管理目标')+'</div>'+(future.length?future.map(x=>'<a class="deadline-row" href="#countdown"><span><strong>'+esc(x.title)+'</strong><small>'+esc(x.date)+' · '+esc(x.subject||'个人目标')+'</small></span><b>'+(distance(x.date)||'今')+'<small>'+(distance(x.date)?'天':'天')+'</small></b></a>').join(''):empty('◎','还没有考试目标。<br>为下一次进步，定一个日期。'))+'</section>'+
      '<section class="panel"><div class="widget-heading"><h2>今天的课程</h2>'+link('#timetable','查看课表')+'</div>'+(todays.length?todays.map(c=>'<div class="schedule-row"><span class="time-chip">'+c.start+'<small>'+c.end+'</small></span><span><strong>'+esc(c.title)+'</strong><small>'+esc(c.location||'未填写地点')+'</small></span></div>').join(''):empty('▦','今天没有安排课程。<br>留一点空间，给自己的计划。'))+'</section>'+
      '<section class="panel launchpad"><div class="widget-heading"><h2>继续你的探索</h2></div><a href="#flashcards"><span>↻</span><div><strong>复习卡片</strong><small>一问一答，让知识留得更久。</small></div><b>↗</b></a><a href="#notebook"><span>✎</span><div><strong>我的手帐</strong><small>记下想法和今天的收获。</small></div><b>↗</b></a><a href="#resources"><span>☷</span><div><strong>资源书架</strong><small>打开收藏的资料与网盘。</small></div><b>↗</b></a></section></div>');
  }
  function timetable(){
    const state=get(),filtered=courseDay?state.courses.filter(c=>c.weekday===courseDay):state.courses;
    return shell(heading('YOUR WEEK, WELL PLANNED','把一周，安排得刚刚好。','自定义每周课程与地点。此课表是你的个人安排，不是学校官方课表。','<button class="btn primary" data-workspace-add="course">＋ 添加课程</button>')+
      '<div class="timetable-toolbar"><div class="day-tabs"><button data-day="0" class="'+(!courseDay?'selected':'')+'">整周</button>'+days.map((d,i)=>'<button data-day="'+(i+1)+'" class="'+(courseDay===i+1?'selected':'')+'">'+d+'</button>').join('')+'</div><button class="text-btn" id="print-schedule">打印 / 保存 PDF ↗</button></div>'+
      '<div class="week-scroll"><div class="week-board '+(courseDay?'single-day':'')+'">'+days.map((label,i)=>({label,n:i+1})).filter(d=>!courseDay||d.n===courseDay).map(d=>'<section class="week-column '+(d.n===nowDay()?'today-column':'')+'"><div class="week-title"><h2>'+d.label+'</h2>'+(d.n===nowDay()?'<span>今天</span>':'')+'</div>'+filtered.filter(c=>c.weekday===d.n).sort((a,b)=>a.start.localeCompare(b.start)).map(c=>'<article class="course-card"><div class="course-time">'+c.start+' — '+c.end+'</div><h3>'+esc(c.title)+'</h3><p>'+esc(c.location||'未填写地点')+'</p><div><button class="text-btn" data-course-edit="'+c.id+'">编辑</button><button class="text-btn" data-workspace-delete="courses" data-record="'+c.id+'">移除</button></div></article>').join('')+'<button class="add-day-course" data-add-day="'+d.n+'">＋ 添加</button></section>').join('')+'</div></div><p class="helper">按周重复；相同时段的课程会提示冲突。打印时只保留课程表内容。</p>');
  }
  function countdown(){
    const exams=[...get().exams].sort((a,b)=>a.date.localeCompare(b.date));
    return shell(heading('MAKE ROOM FOR YOUR NEXT MILESTONE','把目标，变成可以抵达的远方。','记录考试与个人目标，用剩余天数安排自己的学习节奏。','<button class="btn primary" data-workspace-add="exam">＋ 添加目标</button>')+
      '<div class="exam-grid">'+(exams.length?exams.map(x=>'<article class="panel exam-card '+(distance(x.date)<0?'past-exam':'')+'"><div class="widget-heading"><span class="pill">'+esc(x.subject||'个人目标')+'</span><span class="quiet-label">'+esc(x.date)+'</span></div><h2>'+esc(x.title)+'</h2><div class="countdown-number">'+dateBadge(x)+'</div><p>'+esc(x.note||'按自己的节奏，走好眼前每一步。')+'</p><div class="exam-actions"><a class="section-link" href="#learn">现在开始专注 ↗</a><span><button class="text-btn" data-exam-edit="'+x.id+'">编辑</button><button class="text-btn" data-workspace-delete="exams" data-record="'+x.id+'">移除</button></span></div></article>').join(''):empty('◎','还没有目标。<br>添加一个日期，让期待有了坐标。'))+'</div>');
  }
  function cardList(){
    const q=($('#card-search')?.value||'').toLowerCase(),items=get().cards.filter(c=>(c.front+c.back+c.subject).toLowerCase().includes(q));
    return items.length?items.map(c=>'<article class="panel knowledge-card"><div class="widget-heading"><span class="pill">'+esc(c.subject||'未分类')+'</span><span class="quiet-label">'+(c.due<=day()?'待复习':esc(c.due)+' 再复习')+'</span></div><h3>'+esc(c.front)+'</h3><details><summary>查看答案</summary><p>'+esc(c.back)+'</p></details><div class="knowledge-actions"><small>已复习 '+c.reviews+' 次</small><span><button class="text-btn" data-card-edit="'+c.id+'">编辑</button><button class="text-btn" data-workspace-delete="cards" data-record="'+c.id+'">移除</button></span></div></article>').join(''):empty('↻','还没有匹配的卡片。<br>从一道错题或一个概念开始。');
  }
  function flashcards(){
    const cards=get().cards,due=cards.filter(c=>c.due<=day());
    return shell(heading('BUILD KNOWLEDGE THAT STAYS','理解一次，再记牢一点。','把错题和知识点做成问答卡片，按自己的掌握程度安排下一次复习。','<button class="btn primary" data-workspace-add="card">＋ 新建卡片</button>')+
      '<section class="review-banner"><div><span class="chapter">SPACED PRACTICE</span><h2>'+(due.length?'有 '+due.length+' 张卡片，等你温故知新。':'今日的复习，已经安排妥当。')+'</h2><p>先尝试回忆，再看答案。选择「还不熟」今天再练，「记住了」3 天后，「很熟悉」7 天后复习。</p></div><button class="btn primary" id="start-review" '+(!due.length?'disabled':'')+'>开始复习 ↗</button></section>'+
      '<div class="toolbar"><input type="search" id="card-search" aria-label="搜索复习卡片" placeholder="搜索问题、答案或科目…"><span class="helper">'+cards.length+' 张卡片 · '+due.length+' 张待复习</span></div><div class="knowledge-grid" id="knowledge-grid">'+cardList()+'</div>');
  }
  function openDialog(title,html){
    let d=$('#workspace-dialog');d.innerHTML='<div class="dialog-inner"><div class="dialog-head"><h2>'+title+'</h2><button class="icon-btn" data-workspace-close aria-label="关闭">×</button></div>'+html+'</div>';if(!d.open)d.showModal();
  }
  const field=(label,name,value='',type='text',required=true,max=160)=>'<label class="field">'+label+'<input name="'+name+'" type="'+type+'" '+(required?'required':'')+' maxlength="'+max+'" value="'+esc(value)+'"></label>';
  function courseForm(id=null,weekday=nowDay()){
    editing=id;const c=get().courses.find(x=>x.id===id)||{weekday,start:'08:00',end:'08:45'};
    openDialog(id?'编辑课程':'添加每周课程','<form id="course-form">'+field('课程名称','title',c.title)+
      '<label class="field">星期<select name="weekday">'+days.map((d,i)=>'<option value="'+(i+1)+'" '+(c.weekday===i+1?'selected':'')+'>'+d+'</option>').join('')+'</select></label><div class="form-pair">'+field('开始时间','start',c.start,'time')+field('结束时间','end',c.end,'time')+'</div>'+field('地点（可选）','location',c.location,'text',false)+'<p class="helper">时间按本地时区解释，课程每周重复。</p><button class="btn primary">保存课程</button></form>');
  }
  function examForm(id=null){
    editing=id;const x=get().exams.find(x=>x.id===id)||{};
    openDialog(id?'编辑目标':'添加考试或目标','<form id="exam-form">'+field('目标名称','title',x.title)+field('日期','date',x.date||plusDays(7),'date')+field('科目 / 分类（可选）','subject',x.subject,'text',false,40)+'<label class="field">给自己的备注<textarea name="note" maxlength="500" placeholder="准备做些什么？">'+esc(x.note||'')+'</textarea></label><button class="btn primary">保存目标</button></form>');
  }
  function cardForm(id=null){
    editing=id;const c=get().cards.find(x=>x.id===id)||{};
    openDialog(id?'编辑复习卡片':'新建复习卡片','<form id="card-form">'+field('科目 / 标签（可选）','subject',c.subject,'text',false,40)+'<label class="field">问题 / 正面<textarea name="front" required maxlength="1500" placeholder="例如：二次函数顶点坐标是什么？">'+esc(c.front||'')+'</textarea></label><label class="field">答案 / 背面<textarea name="back" required maxlength="3000" placeholder="用自己的话写下答案…">'+esc(c.back||'')+'</textarea></label><button class="btn primary">保存卡片</button></form>');
  }
  function review(){
    const c=get().cards.find(x=>x.id===reviewId);
    if(!c){openDialog('这一轮，完成了。','<div class="empty-state"><b>✓</b>已复习 '+reviewed.size+' 张卡片。<br>还不熟的知识点可以今天再次练习。</div><button class="btn primary" data-workspace-close>结束复习</button>');return}
    openDialog('复习 · '+(reviewed.size+1),' <div class="review-card"><span class="pill">'+esc(c.subject||'未分类')+'</span><span class="quiet-label">先回忆，再揭晓</span><h3>'+esc(c.front)+'</h3>'+(showAnswer?'<div class="revealed-answer">'+esc(c.back)+'</div><div class="review-rating"><button class="btn" data-rating="0">还不熟 · 今天</button><button class="btn" data-rating="3">记住了 · 3 天</button><button class="btn primary" data-rating="7">很熟悉 · 7 天</button></div>':'<button class="btn primary" id="show-answer">揭晓答案</button>')+'</div>');
  }
  function startReview(){reviewed=new Set();reviewId=get().cards.find(c=>c.due<=day())?.id;showAnswer=false;review()}
  const views={dashboard,timetable,countdown,flashcards};
  function route(){api.route()}
  function remove(collection,id){
    if(!confirm('确定移除这条记录？'))return;get()[collection]=get()[collection].filter(x=>x.id!==id);save();route();api.toast('已移除');
  }
  function setup(){
    const d=document.createElement('dialog');d.id='workspace-dialog';d.setAttribute('aria-label','学习工作台编辑与复习');document.body.append(d);
    d.addEventListener('close',()=>{editing=null;showAnswer=false;reviewId=null;route()});
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.matches('[data-workspace-close]'))d.close();
      if(b.dataset.workspaceAdd==='course')courseForm();
      if(b.dataset.workspaceAdd==='exam')examForm();
      if(b.dataset.workspaceAdd==='card')cardForm();
      if(b.dataset.courseEdit)courseForm(b.dataset.courseEdit);
      if(b.dataset.examEdit)examForm(b.dataset.examEdit);
      if(b.dataset.cardEdit)cardForm(b.dataset.cardEdit);
      if(b.dataset.addDay)courseForm(null,Number(b.dataset.addDay));
      if(b.dataset.workspaceDelete)remove(b.dataset.workspaceDelete,b.dataset.record);
      if(b.dataset.day!==undefined){courseDay=Number(b.dataset.day);route()}
      if(b.id==='print-schedule')window.print();
      if(b.id==='start-review')startReview();
      if(b.id==='show-answer'){showAnswer=true;review()}
      if(b.dataset.rating!==undefined&&showAnswer&&reviewId){
        const c=get().cards.find(x=>x.id===reviewId);if(!c)return;
        c.reviews++;c.due=plusDays(Number(b.dataset.rating));c.lastReviewed=day();save();reviewed.add(c.id);
        reviewId=get().cards.find(x=>x.due<=day()&&!reviewed.has(x.id))?.id;showAnswer=false;review();
      }
    });
    document.addEventListener('input',e=>{if(e.target.id==='card-search')$('#knowledge-grid').innerHTML=cardList()});
    document.addEventListener('submit',e=>{
      const form=e.target;if(!['course-form','exam-form','card-form'].includes(form.id))return;e.preventDefault();const f=new FormData(form),v=n=>String(f.get(n)||'').trim();
      let collection,item;
      if(form.id==='course-form'){
        if(!v('title'))return;const weekday=Number(v('weekday')),start=v('start'),end=v('end');
        if(start>=end){api.toast('结束时间需要晚于开始时间');return}
        const collision=get().courses.find(c=>c.id!==editing&&c.weekday===weekday&&start<c.end&&end>c.start);
        if(collision){api.toast('与「'+collision.title+'」时间重叠，请调整');return}
        collection='courses';item={id:editing||uid(),title:v('title'),weekday,start,end,location:v('location')};
      }else if(form.id==='exam-form'){
        if(!v('title'))return;collection='exams';item={id:editing||uid(),title:v('title'),date:v('date'),subject:v('subject'),note:v('note')};
      }else{
        if(!v('front')||!v('back'))return;const old=get().cards.find(c=>c.id===editing);
        collection='cards';item={id:editing||uid(),front:v('front'),back:v('back'),subject:v('subject'),due:old?.due||day(),reviews:old?.reviews||0,lastReviewed:old?.lastReviewed||''};
      }
      if(get()[collection].length>=5000&&!editing){api.toast('记录已达 5,000 条，请先整理或导出');return}
      if(editing)get()[collection]=get()[collection].map(x=>x.id===editing?item:x);else get()[collection].push(item);
      save();d.close();api.toast('已保存');
    });
  }
  function enhance(page){document.querySelectorAll('.workspace-tabs a').forEach(a=>{if(a.hash==='#'+page)a.setAttribute('aria-current','page')});if(page==='learn'&&!$('#workspace-shortcut')){const el=document.createElement('div');el.id='workspace-shortcut';el.className='workspace-shortcut';el.innerHTML='<a href="#dashboard">学习工作台 ↗</a><a href="#timetable">课程表</a><a href="#countdown">考试倒计时</a><a href="#flashcards">复习卡片</a>';document.querySelector('main .studio-wrap').prepend(el)}}
  return {views,init(adapter){api=adapter;setup()},enhance,distance};
})();
