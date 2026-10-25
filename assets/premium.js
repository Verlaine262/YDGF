window.Premium=(()=>{
  const H='originals/Home-2/image/',C='originals/ydgf1.0.0.02/WebApplication1/mainwork/Homepage/Images/';
  let galleryFilter='all',galleryQuery='',viewerIndex=0,observer;
  const media=window.ORIGINAL_MEDIA.gallery;
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const section=(n,en,title,link)=>'<div class="collection-heading"><div><span class="chapter">'+n+' / '+en+'</span><h2>'+title+'</h2></div>'+link+'</div>';
  function home(state){
    const tasks=state.tasks.filter(t=>!t.done).length;
    return '<section class="cinema"><div class="cinema-title"><div><span class="chapter">GUANGFU COMMUNITY — EST. 2020</span><h1>做最好的自己<span class="title-dot">。</span></h1></div><div class="cinema-intro"><p>在广附相遇，<br>让每一份热爱，自成天地。</p><span>学习 · 交流 · 分享</span></div></div><figure class="hero-original"><img src="'+H+'107957401_p0.jpg" alt="原首页图片：雪地中的角色与橙色雨伞" fetchpriority="high"><figcaption><span>01 / 原神</span><span>GUANGFU · ORIGINAL COLLECTION</span><button class="text-btn" data-view-media="'+media.findIndex(m=>m.src.endsWith('107957401_p0.jpg'))+'">查看完整原图 ↗</button></figcaption></figure><div class="cinema-bottom"><a href="#community">走进社区 <span>↗</span></a><a href="#learn">学习乐园 <span>↗</span></a><a href="#resources">打开网盘 <span>↗</span></a><a href="#about">了解更多 <span>↗</span></a></div></section><div class="editorial-wrap">'+section('01','A PLACE FOR EVERY PASSION','你的热爱，值得被看见。','<a class="section-link" href="#gallery">浏览全部原图 ↗</a>')+'<div class="feature-pair"><article class="image-feature"><button class="image-open" data-view-media="'+media.findIndex(m=>m.src.endsWith('107090500_p0.jpg'))+'" aria-label="查看原神角色原图"><img src="'+H+'107090500_p0.jpg" alt="原有角色图片：绿色背景中的角色" loading="lazy"></button><div class="feature-caption"><span>INTEREST & INSPIRATION</span><h3>原神 · 热爱有回响</h3><a href="#community">一起聊聊喜欢的事 ↗</a></div></article><article class="image-feature school-feature"><button class="image-open" data-view-media="'+media.findIndex(m=>m.src.endsWith('1_1440x8103.png'))+'" aria-label="查看原学校实景"><img src="'+C+'1_1440x8103.png" alt="原学校实景：广大附中英德实验学校教学楼" loading="lazy"></button><div class="feature-caption"><span>OUR SCHOOL, OUR STORY</span><h3>在广附，写下自己的故事。</h3><p>广州大学附属中学英德实验学校学生校园网</p><a href="#about">阅读完整学校简介 ↗</a></div><a class="school-archive-link" href="originals/ydgf1.0.0.02/WebApplication1/mainwork/Homepage/Homepage.html">查看原学校首页 ↗</a></article></div>'+section('02','CAMPUS ESSENTIALS','把每一天，过得更有章法。','<button class="section-link text-btn" data-open-settings>个人数据与备份 ↗</button>')+'<div class="atelier-grid">'+[
      ['01','学习自习室','专注眼前，积累成长。','learn','◷',tasks?tasks+' 项待办':'25 / 50 分钟专注'],
      ['02','校园日历','重要的日子，认真收藏。','calendar','▦',state.events.length+' 项个人日程'],
      ['03','资源与网盘','让每一份好资料，各得其所。','resources','☷',state.links.length+' 个个人书签'],
      ['04','我的手帐','为转瞬即逝的灵感，留一页。','notebook','✎',state.notes.length+' 页随手记']
    ].map(([n,title,desc,path,icon,count])=>'<a class="atelier" href="#'+path+'"><span class="atelier-top">'+n+' <span>'+icon+'</span></span><h3>'+title+'</h3><p>'+desc+'</p><div class="atelier-bottom"><small>'+count+'</small><span>↗</span></div></a>').join('')+'</div>'+section('03','THE COMMUNITY JOURNAL','让不同的声音，在这里相遇。','<a class="section-link" href="#community">查看全部动态 ↗</a>')+'<div class="home-feed">'+cards(data.posts.slice(0,2))+'</div><section class="closing-frame"><div><span class="chapter">KEEP YOUR ORIGINAL SPARK</span><h2>世界很大，<br>热爱与你，都在这里。</h2><a class="btn primary" href="#community">回到我们的社区 ↗</a></div><img src="'+C+'2_1920x1080.png" alt="原学校首页保留的深色主视觉" loading="lazy"></section><div class="original-access"><span>从第一版，到每一个新的可能。</span><a href="#archive">所有原版网页 ↗</a><a href="#login">登录 / 注册 ↗</a><a href="https://bilibili.com" target="_blank" rel="noopener">原社区创作入口 ↗</a></div></div>';
  }
  function galleryCards(){
    return media.map((m,i)=>({m,i})).filter(({m})=>(galleryFilter==='all'||m.type===galleryFilter)&&(m.name+' '+m.sources.join(' ')).toLowerCase().includes(galleryQuery.toLowerCase())).map(({m,i})=>'<article class="gallery-card '+(m.type==='图标'?'is-icon':'')+'"><button class="image-open" data-view-media="'+i+'" aria-label="查看 '+escape(m.name)+'"><img loading="lazy" src="'+escape(m.src)+'" alt="'+escape(m.name)+'"></button><div class="gallery-caption"><span>'+String(i+1).padStart(2,'0')+' / '+m.type+'</span><h3>'+escape(m.name)+'</h3><small>'+m.sources.length+' 处原始引用</small></div></article>').join('')||'<p class="empty-state">没有匹配的图片，换一个关键词试试。</p>';
  }
  function gallery(){return '<div class="studio-wrap gallery-page"><div class="page-heading"><div><span class="chapter">THE ORIGINAL COLLECTION</span><h1>每一张，都还是最初的模样。</h1><p>所有原始图片与图标，按原比例展示。相同文件合并展示，所有原始路径仍保留。</p></div><a class="btn" href="#archive">查看页面存档 ↗</a></div><div class="toolbar"><input type="search" id="gallery-search" value="'+escape(galleryQuery)+'" placeholder="搜索图片文件名或来源…" aria-label="搜索原始图片"><select id="gallery-filter" aria-label="图片分类"><option value="all">全部原图</option><option>图片</option><option>图标</option></select><span id="gallery-total" class="helper">'+media.length+' 份独立原始素材</span></div><div class="gallery-grid" id="gallery-grid">'+galleryCards()+'</div></div>'}
  function view(index){
    viewerIndex=(index+media.length)%media.length;const m=media[viewerIndex],d=document.getElementById('image-dialog');
    d.innerHTML='<div class="dialog-inner"><div class="dialog-head"><div><span class="chapter">ORIGINAL / '+String(viewerIndex+1).padStart(2,'0')+' OF '+media.length+'</span><h2>'+escape(m.name)+'</h2></div><button class="icon-btn" data-close aria-label="关闭原图">×</button></div><img class="media-viewer-image" src="'+escape(m.src)+'" alt="'+escape(m.name)+'"><div class="viewer-tools"><button class="btn" data-media-step="-1">← 上一张</button><a class="btn" href="'+escape(m.src)+'" target="_blank" rel="noopener">打开原始文件 ↗</a><button class="btn" data-media-step="1">下一张 →</button></div><details><summary>查看原始文件来源</summary>'+m.sources.map(s=>'<p class="helper">'+escape(s)+'</p>').join('')+'</details></div>';
    d.dataset.gallery='true';if(!d.open)d.showModal();
  }
  function enhance(page){
    document.body.dataset.page=page;
    if(page==='gallery')document.getElementById('gallery-filter').value=galleryFilter;
    if(page==='community'){
      const side=document.querySelector('.side');if(side)side.insertAdjacentHTML('beforeend','<a href="https://bilibili.com" target="_blank" rel="noopener">原社区创作入口 ↗</a><a href="#gallery">全部原始图片 ↗</a>');
    }
    if(page==='login'||page==='register'){
      const box=document.querySelector('.auth');if(box){box.insertAdjacentHTML('afterbegin','<img class="auth-original-avatar" src="'+H+'104696295_p0.png" alt="原版用户头像">');box.insertAdjacentHTML('beforeend','<div class="auth-original-links"><a href="originals/New/index.html">原登录页面 ↗</a><a href="originals/Register.html">原注册页面 ↗</a></div>')}
    }
    observer?.disconnect();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      observer=new IntersectionObserver(items=>items.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target)}}),{threshold:.05});
      document.querySelectorAll('.collection-heading,.feature-pair,.atelier-grid,.closing-frame').forEach(el=>{el.classList.add('reveal');observer.observe(el)});
    }
    if(page==='about'){const button=document.createElement('a');button.href='#gallery';button.className='btn';button.textContent='查看全部原始影像 ↗';document.querySelector('main .wrap').append(button)}
  }
  const oldCards=cards;
  cards=function(posts){let html=oldCards(posts);for(const post of posts){const avatar=ORIGINAL_MEDIA.avatars[post.id];if(avatar)html=html.replace('<span class="avatar">'+esc(post.author.slice(0,1))+'</span>','<span class="avatar"><img src="'+escape(avatar)+'" alt="'+esc(post.author)+'的原头像" loading="lazy"></span>');}return html.replaceAll('原始点赞 ','<img class="original-action-icon" src="originals/community/image/点赞.png" alt=""> 原始点赞 ').replaceAll('原始评论 ','<img class="original-action-icon" src="originals/community/image/信息.png" alt=""> 原始评论 ').replaceAll('原始收藏 ','<img class="original-action-icon" src="originals/community/image/收藏.png" alt=""> 原始收藏 ')};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-view-media],[data-media-step]');if(!b)return;if(b.dataset.viewMedia!==undefined)view(Number(b.dataset.viewMedia));if(b.dataset.mediaStep)view(viewerIndex+Number(b.dataset.mediaStep))});
  document.addEventListener('input',e=>{if(e.target.id==='gallery-search'){galleryQuery=e.target.value;document.getElementById('gallery-grid').innerHTML=galleryCards()}});
  document.addEventListener('change',e=>{if(e.target.id==='gallery-filter'){galleryFilter=e.target.value;document.getElementById('gallery-grid').innerHTML=galleryCards()}});
  document.addEventListener('keydown',e=>{const d=document.getElementById('image-dialog');if(d.open&&d.dataset.gallery==='true'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){if(e.key==='ArrowRight'){e.preventDefault();view(viewerIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();view(viewerIndex-1)}}});
  document.getElementById('image-dialog').addEventListener('close',e=>delete e.target.dataset.gallery);
  return {home,gallery,enhance};
})();
