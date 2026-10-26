/* Guangfu Campus · browser-local personal tools. No accounts or remote writes. */
const Studio = (() => {
  const key='aweb-studio-v2', $=s=>document.querySelector(s);
  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
  const dateKey=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const empty=()=>({version:2,tasks:[],events:[],links:[],notes:[],sessions:[],courses:[],exams:[],cards:[],theme:'auto',timer:{mode:25,remaining:1500,end:null}});
  const safeUrl=u=>{try{const x=new URL(u);return ['https:','http:'].includes(x.protocol)?x.href:null}catch{return null}};
  const text=(x,max)=>typeof x==='string'?x.slice(0,max):'';
  function validate(raw){
    if(!raw||raw.version!==2)throw Error('不是广附社区的有效备份');
    const s=empty(), list=n=>{if(!Array.isArray(raw[n]))return [];if(raw[n].length>5000)throw Error('单个分类超过 5,000 条，无法导入');return raw[n]};
    s.tasks=list('tasks').filter(x=>x&&typeof x.title==='string').map(x=>({id:text(x.id,100)||uid(),title:text(x.title,160),done:!!x.done}));
    s.events=list('events').filter(x=>x&&typeof x.title==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).map(x=>({id:text(x.id,100)||uid(),title:text(x.title,160),date:x.date,time:/^\d{2}:\d{2}$/.test(x.time)?x.time:''}));
    s.links=list('links').filter(x=>x&&safeUrl(x.url)&&typeof x.title==='string').map(x=>({id:text(x.id,100)||uid(),title:text(x.title,100),url:safeUrl(x.url),category:text(x.category,30)||'其他',description:text(x.description,240)}));
    s.notes=list('notes').filter(x=>x&&typeof x.body==='string').map(x=>({id:text(x.id,100)||uid(),body:text(x.body,3000),date:text(x.date,10)}));
    s.sessions=list('sessions').filter(x=>x&&typeof x.date==='string'&&Number.isFinite(x.minutes)&&x.minutes>0&&x.minutes<=60).map(x=>({id:text(x.id,100)||uid(),date:text(x.date,10),minutes:x.minutes}));
    const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
    const validTime=t=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t);
    const safeId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(id)?id:uid();
    s.courses=list('courses').filter(x=>x&&typeof x.title==='string'&&Number.isInteger(x.weekday)&&x.weekday>=1&&x.weekday<=7&&validTime(x.start)&&validTime(x.end)&&x.start<x.end).map(x=>({id:safeId(x.id),title:text(x.title,160),weekday:x.weekday,start:x.start,end:x.end,location:text(x.location,160)}));
    s.exams=list('exams').filter(x=>x&&typeof x.title==='string'&&validDate(x.date)).map(x=>({id:safeId(x.id),title:text(x.title,160),date:x.date,subject:text(x.subject,40),note:text(x.note,500)}));
    s.cards=list('cards').filter(x=>x&&typeof x.front==='string'&&typeof x.back==='string').map(x=>({id:safeId(x.id),front:text(x.front,1500),back:text(x.back,3000),subject:text(x.subject,40),due:validDate(x.due)?x.due:dateKey(),reviews:Number.isFinite(x.reviews)?Math.max(0,Math.min(1000000,Math.floor(x.reviews))):0,lastReviewed:validDate(x.lastReviewed)?x.lastReviewed:''}));
    s.theme=['light','dark','auto'].includes(raw.theme)?raw.theme:'auto';
    if(raw.timer&&[5,25,50].includes(raw.timer.mode)){const t=raw.timer;s.timer={mode:t.mode,remaining:Math.max(0,Math.min(t.mode*60,Number(t.remaining)||0)),end:Number.isFinite(t.end)&&t.end>0&&t.end<Date.now()+3600000?t.end:null}}
    return s;
  }
  let state=empty();try{const raw=localStorage.getItem(key);if(raw)state=validate(JSON.parse(raw))}catch{}
  function toast(message){const n=$('#notice');n.textContent=message;n.style.display='block';clearTimeout(window.noticeTimer);window.noticeTimer=setTimeout(()=>n.style.display='none',3500)}
  function save(){try{localStorage.setItem(key,JSON.stringify(state));return true}catch{toast('浏览器存储不可用。请导出备份，避免关闭后丢失。');return false}}
  function backupFile(name,body,type){const u=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
  function emptyBox(symbol,message){return '<div class="empty-state"><b>'+symbol+'</b>'+message+'</div>'}
  const heading=(en,title,description,action='')=>'<div class="page-heading"><div><span class="eyebrow muted">'+en+'</span><h1>'+title+'</h1><p>'+description+'</p></div>'+action+'</div>';
  const panel=(title,body)=>'<section class="panel"><h3>'+title+'</h3>'+body+'</section>';
  const today=()=>dateKey();
  let selectedDate=today(),month=new Date().getMonth(),year=new Date().getFullYear(),editNote=null;
  function theme(){const dark=state.theme==='dark'||state.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches;document.body.dataset.theme=dark?'dark':'light';$('#theme-button').textContent=dark?'☀':'☾';$('#theme-button').setAttribute('aria-label',dark?'切换为浅色模式':'切换为深色模式')}
  function home(){
    if(window.Premium)return window.Premium.home(state);
    const upcoming=state.events.filter(e=>e.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,3);
    const quotes=['慢慢来，每一点进步都算数。','把今天的一小步，走成明天的底气。','给好奇心一点时间，让热爱慢慢生长。','认真生活，也记得抬头看看天空。','今天，也做自己喜欢的那个自己。','所有的出发，都可以从现在开始。','在平凡的日子里，收集一点闪光。'];
    const q=quotes[new Date().getDay()];
    const quick=(symbol,title,desc,path)=>'<a class="quick" href="#'+path+'"><span class="go">↗</span><span class="quick-icon">'+symbol+'</span><h3>'+title+'</h3><p>'+desc+'</p></a>';
    return '<div class="studio-wrap"><div class="welcome-line"><span>'+new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date())+' · 欢迎回到广附</span><span>一个属于我们的校园角落</span></div><section class="garden-hero"><div class="garden-copy"><span class="eyebrow">A LITTLE CAMPUS, A BIG WORLD</span><h1>把校园的每一天，<br>过成<span> </span><em>喜欢的模样。</em></h1><p>学习有节奏，生活有热爱。<br>在广附社区，记录成长的足迹，遇见同频的伙伴。</p><div class="actions"><a class="btn primary" href="#learn">开始今日学习 ↗</a><a class="btn" href="#community">逛逛社区</a></div><p class="tiny-note"><b>英德广附</b> &nbsp; / &nbsp; 学生校园网 · 做最好的自己</p></div><div class="garden-art"><img src="assets/campus-garden.svg" alt="树木、教学楼与步道组成的校园主题插画，并非学校实景"><div class="art-caption"><span><strong>让每一份热爱，都有生长的地方。</strong><small class="muted">GROW AT YOUR OWN PACE</small></span><span class="seal" aria-hidden="true">青</span></div></div></section><div class="section-top"><div><span class="eyebrow muted">YOUR EVERYDAY COMPANIONS</span><h2>今天，想从哪里开始？</h2></div><a class="section-link" href="#notebook">我的手帐 ↗</a></div><div class="quick-grid">'+quick('◷','学习自习室','专注一会儿，完成一件小事。','learn')+quick('▦','校园日历','把重要的日子，好好记下来。','calendar')+quick('☷','资源书架','整理资料，也整理新的灵感。','resources')+quick('☏','社区日常','分享热爱，看看大家在聊什么。','community')+'</div><div class="daily-layout"><section class="panel quote-card"><span class="eyebrow">A NOTE FOR TODAY / 今日寄语</span><blockquote>“'+q+'”</blockquote><small>广附手帐 · 给认真生活的你</small></section><section class="panel"><div class="section-top" style="margin:0 0 10px"><h3>接下来的小计划</h3><a class="section-link" href="#calendar">管理日程 ↗</a></div>'+(upcoming.length?upcoming.map(e=>'<div class="agenda-mini"><span class="day-chip">'+esc(e.date.slice(5))+'</span><span style="flex:1">'+esc(e.title)+'</span><small>'+esc(e.time)+'</small></div>').join(''):emptyBox('☀','日程还是空白的。<br>为自己安排一件期待的小事吧。'))+'</section></div><div class="section-top"><div><span class="eyebrow muted">COMMUNITY JOURNAL</span><h2>社区里的声音</h2></div><a class="section-link" href="#community">查看全部 ↗</a></div><p class="helper">以下为原稿保留的示例动态。</p>'+cards(data.posts.slice(0,2))+'<section class="intro-band"><span class="symbol" aria-hidden="true">广</span><div style="flex:1"><h2>从广附出发，向更好的自己靠近。</h2><p>广州大学附属中学英德实验学校学生校园网。这里存放校园记忆，也陪伴每一个正在成长的你。</p></div><a class="btn" href="#about">认识我们的学校 ↗</a></section></div>';
  }
  function tasksHtml(){return state.tasks.length?state.tasks.map(t=>'<div class="todo-item '+(t.done?'done':'')+'"><label><input type="checkbox" data-task="'+esc(t.id)+'" '+(t.done?'checked':'')+'>'+esc(t.title)+'</label><button class="text-btn" data-delete-task="'+esc(t.id)+'" aria-label="删除任务 '+esc(t.title)+'">移除</button></div>').join(''):emptyBox('✓','把大目标拆成小步骤。<br>写下今天想完成的第一件事。')}
  function learn(){
    return '<div class="studio-wrap">'+heading('THE STUDY ROOM','给专注一点时间。','一个安静的自习角落。计时、任务与学习记录，都留在你的浏览器里。')+'<div class="tools-grid"><section class="panel focus-panel"><span class="eyebrow muted">ONE THING AT A TIME</span><h2>专注自习室</h2><div class="mode-tabs">'+[[25,'专注 25 分钟'],[50,'深度 50 分钟'],[5,'休息 5 分钟']].map(([m,t])=>'<button data-mode="'+m+'" class="'+(state.timer.mode===m?'selected':'')+'" aria-pressed="'+(state.timer.mode===m)+'">'+t+'</button>').join('')+'</div><div class="timer-face"><div class="timer-inside"><div class="timer-digits" id="timer-digits">25:00</div><span id="timer-label">留一点时间，给现在的自己</span></div></div><div class="timer-actions"><button class="btn primary" id="timer-toggle">'+(state.timer.end?'暂停计时':'开始专注')+'</button><button class="btn" id="timer-reset">重置</button></div><div class="stats-row"><div><strong id="session-minutes">0</strong><span>今日专注 / 分钟</span></div><div><strong id="session-count">0</strong><span>今日完成 / 次</span></div></div><p class="helper">计时会跨页面继续；到时后返回网站可看到完成提示。</p></section><section class="panel"><span class="eyebrow muted">SMALL STEPS, REAL PROGRESS</span><h2>今天的小目标</h2><form class="inline-form" id="task-form"><input name="title" maxlength="160" required aria-label="新学习任务" placeholder="例如：完成两道数学错题"><button class="btn primary">添加</button></form><div id="task-list">'+tasksHtml()+'</div><div class="section-top"><span class="helper" id="task-count">'+state.tasks.filter(t=>t.done).length+' / '+state.tasks.length+' 已完成</span><button class="text-btn" id="clear-done">清理已完成</button></div></section></div><div class="tip-grid">'+panel('01 / 先选一件事','<p>开始计时前，写下一个具体、能完成的小任务，让这一段专注有清晰的终点。</p>')+panel('02 / 给自己留白','<p>完成一轮后，起身活动、喝一点水。休息也是学习节奏的一部分。</p>')+panel('03 / 记住灵光一闪','<p>突然想到的点子，先记到手帐里，再回到眼前的任务。</p><a class="section-link" href="#notebook">打开我的手帐 ↗</a>')+'</div></div>';
  }
  function calendar(){
    let first=new Date(year,month,1),days=new Date(year,month+1,0).getDate(),pad=(first.getDay()+6)%7,cells='';
    for(let i=0;i<pad;i++)cells+='<span></span>';
    for(let i=1;i<=days;i++){const d=dateKey(new Date(year,month,i)),count=state.events.filter(e=>e.date===d).length;cells+='<button class="calendar-day '+(d===today()?'today ':'')+(d===selectedDate?'selected':'')+'" data-date="'+d+'" aria-label="'+d+(count?'，'+count+'项日程':'')+'" aria-pressed="'+(d===selectedDate)+'">'+i+(count?'<span class="dot"></span>':'')+'</button>'}
    const events=state.events.filter(e=>e.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time));
    const future=state.events.filter(e=>e.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
    return '<div class="studio-wrap">'+heading('DAYS WORTH REMEMBERING','把期待，写进日历。','记录自己的考试、活动和小约定。这是个人日程，不是学校官方通知。','<button class="btn" id="export-calendar">导出日历 .ics ↗</button>')+'<div class="calendar-layout"><section class="panel"><div class="calendar-head"><button class="icon-btn" data-month="-1" aria-label="上个月">‹</button><h2>'+year+' 年 '+(month+1)+' 月</h2><div style="display:flex;gap:8px"><button class="text-btn" id="today-button">今天</button><button class="icon-btn" data-month="1" aria-label="下个月">›</button></div></div><div class="calendar-week">'+['一','二','三','四','五','六','日'].map(d=>'<span>'+d+'</span>').join('')+'</div><div class="calendar-days">'+cells+'</div><div style="margin-top:30px"><h3>'+selectedDate+' 的计划</h3>'+(events.length?events.map(e=>'<div class="event-line"><div><strong>'+esc(e.title)+'</strong><small>'+esc(e.time||'全天')+'</small></div><button class="text-btn" data-delete-event="'+esc(e.id)+'">移除</button></div>').join(''):emptyBox('☀','这一天，等你来安排。'))+'</div></section><div><section class="panel"><h3>添加一个期待</h3><form id="event-form"><label class="field">日程名称<input name="title" maxlength="160" required placeholder="考试、阅读、运动或一次见面"></label><label class="field">日期<input type="date" name="date" required value="'+selectedDate+'"></label><label class="field">时间（可选）<input type="time" name="time"></label><button class="btn primary">保存日程</button></form></section><section class="panel" style="margin-top:20px"><h3>未来的日子</h3>'+(future.length?future.map(e=>'<div class="agenda-mini"><span>'+esc(e.title)+'</span><small>'+esc(e.date.slice(5))+'</small></div>').join(''):emptyBox('○','暂时没有未来日程'))+'</section></div></div></div>';
  }
  const builtins=()=>[
    {id:'community',title:'广附社区',url:'#community',category:'校园',description:'原有社区动态、全文搜索与本机收藏。',builtin:true},
    {id:'tieba',title:'学校百度贴吧',url:tieba,category:'校园',description:'原稿保留的学校交流入口，前往百度贴吧。',builtin:true},
    {id:'archive',title:'原版网页资料库',url:'#archive',category:'资料',description:'每一个原始页面和设计版本，都完整保存在这里。',builtin:true}
  ];
  function linkCards(q='',category='all'){
    const items=[...builtins(),...state.links].filter(l=>(l.title+' '+l.description).toLowerCase().includes(q.toLowerCase())&&(category==='all'||l.category===category));
    return items.length?items.map(l=>'<article class="panel resource-card"><span class="tag">'+esc(l.category)+(l.builtin?' · 站内精选':' · 我的书签')+'</span><h3>'+esc(l.title)+'</h3><p>'+esc(l.description||new URL(l.url).hostname)+'</p><div class="resource-actions"><a href="'+esc(l.url)+'" '+(l.url.startsWith('#')?'':'target="_blank" rel="noopener noreferrer"')+'>打开资源 ↗</a>'+(l.builtin?'':'<button class="text-btn" data-delete-link="'+esc(l.id)+'">移除</button>')+'</div></article>').join(''):emptyBox('☷','没有找到匹配的书签。');
  }
  function resources(){
    return '<div class="studio-wrap">'+heading('A SHELF FOR YOUR CURIOSITY','好资料，值得好好收藏。','把网盘链接、学习资料与常用网站整理在一起。书签仅保存在本机。','<button class="btn primary" id="add-link">＋ 添加书签</button>')+'<div class="toolbar"><input id="resource-search" type="search" placeholder="搜索资源名称或描述…" aria-label="搜索资源"><select id="resource-category" aria-label="资源分类"><option value="all">全部分类</option>'+['校园','学习','资料','网盘','其他'].map(x=>'<option>'+x+'</option>').join('')+'</select></div><div class="resource-grid" id="resource-list">'+linkCards()+'</div><div class="intro-band"><div><h3>让下一次寻找，变得更轻松。</h3><p>支持 HTTP / HTTPS 链接。此处整理书签，不上传或托管网盘文件。换设备前，记得导出个人数据。</p><button class="text-btn" data-open-settings>备份我的数据 ↗</button></div></div></div>';
  }
  function notes(){
    const current=state.notes.find(n=>n.id===editNote);
    return '<div class="studio-wrap">'+heading('A LITTLE NOTEBOOK','把灵感和心事，轻轻放下。','随手记下一段想法、一次收获，或一个还没长大的点子。内容仅保存在本机。')+'<div class="notebook-layout"><section class="panel" style="align-self:start"><h3>'+(current?'编辑这页手帐':'今天，想记下什么？')+'</h3><form id="note-form"><label class="field">我的随手记<textarea name="body" required maxlength="3000" rows="8" placeholder="今天学到了什么？有什么值得记住的小事？">'+esc(current?.body||'')+'</textarea></label><button class="btn primary">'+(current?'保存修改':'收进手帐')+'</button>'+(current?'<button type="button" class="text-btn" id="cancel-note">取消编辑</button>':'')+'</form><p class="helper">在自己的节奏里，慢慢生长。<br>每条最多 3,000 字。</p></section><section class="notes-grid">'+(state.notes.length?state.notes.map(n=>'<article class="panel"><p class="note-body">'+esc(n.body)+'</p><div class="note-footer"><span>'+esc(n.date)+'</span><span><button class="text-btn" data-edit-note="'+esc(n.id)+'">编辑</button><button class="text-btn" data-delete-note="'+esc(n.id)+'">移除</button></span></div></article>').join(''):emptyBox('✎','手帐还没有内容。<br>第一句话，不需要很完美。'))+'</section></div></div>';
  }
  function dialog(id,title,body){
    const d=$('#'+id);d.innerHTML='<div class="dialog-inner"><div class="dialog-head"><h2>'+title+'</h2><button class="icon-btn" data-close aria-label="关闭">×</button></div>'+body+'</div>';d.showModal();
  }
  function settings(){
    dialog('settings-dialog','留住你的校园手帐','<p class="helper">任务、日程、书签、手帐、专注记录、课程表、考试目标和复习卡片保存在当前浏览器。清理浏览器数据会删除它们；网站不会自动同步到云端或 GitHub。</p><div class="stats-row"><div><strong>'+state.tasks.length+'</strong><span>学习任务</span></div><div><strong>'+state.notes.length+'</strong><span>手帐条目</span></div></div><div class="storage-actions"><button class="btn primary" id="export-data">导出备份</button><button class="btn" id="import-data">导入备份</button><input id="import-file" type="file" accept=".json,application/json" hidden></div><p class="helper">导入会合并新增条目，相同编号不会重复添加。</p><hr style="border:0;border-top:1px solid var(--line);margin:24px 0"><h3>显示偏好</h3><label class="field">页面主题<select id="theme-select"><option value="auto">跟随系统</option><option value="light">浅色 · 晴日</option><option value="dark">深色 · 夜读</option></select></label><p class="helper">快捷键 Ctrl / ⌘ + K：全站查找。Esc：关闭弹窗。</p><a class="section-link" href="#login" data-dialog-link>原版账户入口 ↗</a>');$('#theme-select').value=state.theme;
  }
  const pages=[['home','首页','校园入口'],['dashboard','学习工作台','统计与今日课程'],['timetable','课程表','每周安排与冲突检查'],['countdown','考试倒计时','目标与剩余天数'],['flashcards','复习卡片','问答与间隔复习'],['gallery','原图影像','全部原始图片与图标'],['learn','学习自习室','专注计时、任务'],['calendar','校园日历','个人日程'],['resources','资源书架','网盘与书签'],['community','社区','动态与收藏'],['notebook','我的手帐','随手记录'],['about','关于学校','完整历史简介'],['archive','原版网页存档','全部版本'],['login','登录注册','账户界面']];
  function commandResults(q){
    q=q.toLowerCase().trim();
    const results=pages.filter(p=>(p[1]+p[2]).includes(q)).map(p=>({title:p[1],label:p[2],href:'#'+p[0]}));
    if(q)for(const p of data.posts.filter(p=>(p.title+p.text+p.author).toLowerCase().includes(q)).slice(0,6))results.push({title:p.title,label:'社区 · '+p.author,href:'#community?post='+p.id});
    $('#command-results').innerHTML=results.length?results.map(r=>'<a href="'+r.href+'" data-dialog-link><span>'+esc(r.title)+'</span><small>'+esc(r.label)+'</small></a>').join(''):emptyBox('⌕','没有找到，换个关键词试试。');
  }
  function command(){dialog('command-dialog','想去哪里？','<input id="command-input" type="search" autocomplete="off" aria-label="搜索页面或社区内容" placeholder="搜索功能、标题或作者…"><div class="command-list" id="command-results"></div>');commandResults('');$('#command-input').focus()}
  function resetTimer(mode=state.timer.mode){state.timer={mode,remaining:mode*60,end:null};save()}
  function tick(){
    const t=state.timer;
    let seconds=t.end?Math.max(0,Math.ceil((t.end-Date.now())/1000)):t.remaining;
    if(t.end&&seconds===0){t.end=null;t.remaining=0;if(t.mode!==5)state.sessions.push({id:uid(),date:today(),minutes:t.mode});save();toast(t.mode===5?'休息结束，准备开始下一段专注吧。':'这一轮专注完成了，给自己一个小小的肯定。')}
    if($('#timer-digits')){
      $('#timer-digits').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
      $('.timer-face').style.setProperty('--progress',((t.mode*60-seconds)/(t.mode*60)*100)+'%');
      $('#timer-toggle').textContent=t.end?'暂停计时':seconds===0?'再来一轮':'开始'+(t.mode===5?'休息':'专注');
      $('#timer-label').textContent=t.end?(t.mode===5?'放松一下，照顾好自己':'只做眼前这一件小事'):seconds===0?'这一轮，完成了':'留一点时间，给现在的自己';
      const sessions=state.sessions.filter(s=>s.date===today());$('#session-minutes').textContent=sessions.reduce((a,s)=>a+s.minutes,0);$('#session-count').textContent=sessions.length;
    }
  }
  function route(){
    const [page,query]=location.hash.slice(1).split('?'),p=page||'home';
    const views={home,learn,calendar,resources,notebook:notes,gallery:()=>Premium.gallery(),...Workspace.views};
    if(views[p])main.innerHTML=views[p]();else render();
    document.title=(pages.find(x=>x[0]===p)?.[1]||'广附社区')+' · 广附社区';
    document.querySelectorAll('header nav a').forEach(a=>{a.removeAttribute('aria-current');if(a.hash==='#'+p)a.setAttribute('aria-current','page')});
    if(p==='community'&&query){const id=new URLSearchParams(query).get('post');const post=data.posts.find(x=>String(x.id)===id);if(post){$('#search').value=post.title;$('#search').dispatchEvent(new Event('input'));setTimeout(()=>document.getElementById('post-'+id)?.scrollIntoView({block:'center'}),50)}}
    if(p==='community'){const sidebar=$('.side');if(sidebar)sidebar.insertAdjacentHTML('beforeend','<a href="#notebook">写一页自己的手帐 ↗</a>')}
    if(p==='about')main.querySelector('.wrap').insertAdjacentHTML('beforeend','<section class="banner"><h3>广附社区 · 校园手帐版</h3><p>自习室、个人日程、资源书架和随手记，让校园网陪伴每天的成长。个人工具无需登录，数据保存在本机。</p><button class="btn" data-open-settings>个人数据与备份</button></section>');
    window.scrollTo(0,0);tick();window.Premium?.enhance(p);window.Workspace?.enhance(p);
  }
  function refreshTasks(){ $('#task-list').innerHTML=tasksHtml();$('#task-count').textContent=state.tasks.filter(t=>t.done).length+' / '+state.tasks.length+' 已完成'}
  function refreshResources(){ $('#resource-list').innerHTML=linkCards($('#resource-search').value,$('#resource-category').value)}
  function remove(collection,id){const item=state[collection].find(x=>x.id===id);if(!item)return;state[collection]=state[collection].filter(x=>x.id!==id);save();toast('已移除');if(collection==='tasks')refreshTasks();else if(collection==='links')refreshResources();else route()}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.matches('[data-close]'))b.closest('dialog').close();
    if(b.matches('[data-dialog-link]'))b.closest('dialog').close();
    if(b.matches('[data-open-settings]'))settings();
    if(b.id==='command-button')command();
    if(b.id==='theme-button'){state.theme=document.body.dataset.theme==='dark'?'light':'dark';save();theme()}
    if(b.id==='back-top')window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if(b.dataset.mode){const m=Number(b.dataset.mode);if(m!==state.timer.mode){resetTimer(m);route()}}
    if(b.id==='timer-toggle'){const t=state.timer;if(t.end){t.remaining=Math.max(0,Math.ceil((t.end-Date.now())/1000));t.end=null}else{if(t.remaining===0)t.remaining=t.mode*60;t.end=Date.now()+t.remaining*1000}save();tick()}
    if(b.id==='timer-reset'){resetTimer();tick()}
    if(b.id==='clear-done'){state.tasks=state.tasks.filter(t=>!t.done);save();refreshTasks()}
    if(b.dataset.deleteTask)remove('tasks',b.dataset.deleteTask);
    if(b.dataset.deleteEvent)remove('events',b.dataset.deleteEvent);
    if(b.dataset.deleteLink)remove('links',b.dataset.deleteLink);
    if(b.dataset.deleteNote){if(confirm('移除这条手帐？建议先导出备份。'))remove('notes',b.dataset.deleteNote)}
    if(b.dataset.editNote){editNote=b.dataset.editNote;route();$('#note-form textarea').focus()}
    if(b.id==='cancel-note'){editNote=null;route()}
    if(b.dataset.month){let d=new Date(year,month+Number(b.dataset.month),1);year=d.getFullYear();month=d.getMonth();route()}
    if(b.dataset.date){selectedDate=b.dataset.date;route()}
    if(b.id==='today-button'){selectedDate=today();month=new Date().getMonth();year=new Date().getFullYear();route()}
    if(b.id==='add-link')dialog('link-dialog','为书架添一本新书','<form id="link-form"><label class="field">名称<input name="title" required maxlength="100" placeholder="这份资料叫什么？"></label><label class="field">链接<input name="url" type="url" required maxlength="2000" placeholder="https://…"></label><label class="field">分类<select name="category">'+['学习','资料','网盘','校园','其他'].map(c=>'<option>'+c+'</option>').join('')+'</select></label><label class="field">一句话描述<input name="description" maxlength="240" placeholder="下次找它时，给自己一点提示"></label><button class="btn primary">加入书架</button></form>');
    if(b.id==='export-data')backupFile('广附社区-个人备份-'+today()+'.json',JSON.stringify({...state,favorites:saves},null,2),'application/json');
    if(b.id==='import-data')$('#import-file').click();
    if(b.id==='export-calendar'){
      if(!state.events.length){toast('先添加一个日程，再导出日历。');return}
      const clean=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
      const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Guangfu//Campus Journal//ZH','CALSCALE:GREGORIAN'];
      const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
      for(const ev of state.events){const day=ev.date.replaceAll('-','');lines.push('BEGIN:VEVENT','UID:'+clean(ev.id)+'@guangfu.local','DTSTAMP:'+stamp,ev.time?'DTSTART:'+day+'T'+ev.time.replace(':','')+'00':'DTSTART;VALUE=DATE:'+day,'SUMMARY:'+clean(ev.title),'END:VEVENT')}
      lines.push('END:VCALENDAR');backupFile('广附社区-个人日程.ics',lines.join('\r\n')+'\r\n','text/calendar;charset=utf-8');
    }
    if(b.matches('.post-image')||b.querySelector('.post-image')){const img=b.querySelector('.post-image');if(img){e.preventDefault();dialog('image-dialog','原帖图片','<img src="'+esc(img.getAttribute('src'))+'" alt="'+esc(img.alt)+'">')}}
    if(b.dataset.save&&$('#filter')?.value==='saved')setTimeout(()=>$('#filter').dispatchEvent(new Event('change')),0);
  });
  document.addEventListener('submit',e=>{
    const f=e.target,fd=new FormData(f);if(!['task-form','event-form','link-form','note-form'].includes(f.id))return;e.preventDefault();
    if(f.id==='task-form'){const title=fd.get('title').trim();if(!title)return;state.tasks.push({id:uid(),title,done:false});save();f.reset();refreshTasks();return}
    if(f.id==='event-form'){const title=fd.get('title').trim();if(!title)return;state.events.push({id:uid(),title,date:fd.get('date'),time:fd.get('time')});selectedDate=fd.get('date');const d=new Date(selectedDate+'T12:00:00');month=d.getMonth();year=d.getFullYear();save();route();toast('日程已记下');return}
    if(f.id==='link-form'){const url=safeUrl(fd.get('url'));if(!url){toast('请输入有效的 HTTP 或 HTTPS 链接');return}const title=fd.get('title').trim();if(!title)return;state.links.push({id:uid(),title,url,category:fd.get('category'),description:fd.get('description').trim()});save();$('#link-dialog').close();refreshResources();toast('已加入资源书架');return}
    if(f.id==='note-form'){const body=fd.get('body').trim();if(!body)return;const note=state.notes.find(n=>n.id===editNote);if(note)note.body=body;else state.notes.unshift({id:uid(),body,date:today()});editNote=null;save();route();toast('手帐已保存')}
  });
  document.addEventListener('input',e=>{if(e.target.id==='command-input')commandResults(e.target.value);if(e.target.id==='resource-search')refreshResources()});
  document.addEventListener('change',async e=>{
    if(e.target.dataset.task){const t=state.tasks.find(t=>t.id===e.target.dataset.task);if(t){t.done=e.target.checked;save();refreshTasks()}}
    if(e.target.id==='resource-category')refreshResources();
    if(e.target.id==='theme-select'){state.theme=e.target.value;save();theme()}
    if(e.target.id==='import-file'){
      const file=e.target.files[0];if(!file)return;
      try{
        if(file.size>2000000)throw Error('备份文件不能超过 2 MB');
        const raw=JSON.parse(await file.text()),incoming=validate(raw);
        const merged={...state};for(const name of ['tasks','events','links','notes','sessions','courses','exams','cards']){const ids=new Set(state[name].map(x=>x.id));const additions=incoming[name].filter(x=>{if(ids.has(x.id))return false;ids.add(x.id);return true});merged[name]=[...state[name],...additions];if(merged[name].length>5000)throw Error('合并后单个分类超过 5,000 条');}state=merged;
        if(Array.isArray(raw.favorites)){saves=[...new Set([...saves,...raw.favorites.filter(id=>data.posts.some(p=>p.id===id))])];try{localStorage.setItem('aweb-saves',JSON.stringify(saves))}catch{}}
        save();$('#settings-dialog').close();route();toast('备份已合并，原有内容保留');
      }catch(err){toast('导入失败：'+err.message)}e.target.value='';
    }
  });
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!document.querySelector('dialog[open]'))command()}});
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(state.theme==='auto')theme()});
  window.addEventListener('hashchange',()=>{route();main.focus({preventScroll:true})});
  document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus();main.scrollIntoView()});
  Workspace.init({getState:()=>state,save,route,toast});
  setInterval(tick,500);theme();route();
  return {route,validate,safeUrl};
})();
