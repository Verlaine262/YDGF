/* Progressive motion. Content is always visible without JS or animation support. */
window.CampusMotion=(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let enabled=true,frame=0,routeFrame=0,lastPage='',observer,ambientObserver;
  const seen=new WeakSet(),running=new Set(),pending=new Set(),channels=new WeakMap(),watchedDialogs=new WeakSet();
  const ease="cubic-bezier(.16,1,.3,1)";
  const targets='.support-panel,.story-hero,.story-person,.story-timeline li,.story-principles,.cm-editorial-grid>button,.cm-related,.plus-lab-hero,.plus-tool-index,.plus-work,.resource-card,.todo-item,.event-line,.note-card,.archive-list>a,.journal-colophon,.journal-note,.journal-hero,.journal-photo-grid figure,.letters-hero,.letters-chapter,.letters-home-banner,.page-heading,.cm-hero,.cm-pinned,.cm-side-card,.post,.cm-card,.panel,.gallery-card,.atelier,.image-feature,.collection-heading,.closing-frame,.workspace-home-banner,.course-card,.exam-card,.flashcard,.cinema-title,.hero-original,.cm-toolbar,.workspace-tabs';
  try{enabled=localStorage.getItem('aweb-motion')!=='off'}catch{}
  const allowed=()=>enabled&&!reduced.matches&&!document.body.classList.contains("support-reduced");
  function animate(el,frames,options){if(!allowed()||!el.animate||!el.isConnected)return;channels.get(el)?.cancel();const animation=el.animate(frames,options);channels.set(el,animation);running.add(animation);animation.finished.catch(()=>{}).finally(()=>running.delete(animation));return animation;}
  function reveal(elements){let index=0;for(const el of elements){if(seen.has(el))continue;seen.add(el);const box=el.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight+30)continue;const nested=el.parentElement?.closest(targets);if(nested&&running.size&&channels.get(nested)?.playState==='running')continue;const hero=el.matches('.journal-hero,.cm-hero,.plus-lab-hero,.hero-original');animate(el,[{opacity:hero?.45:.12,translate:'0 '+(innerWidth<700?12:20)+'px',scale:hero?'.994':'1'},{opacity:1,translate:'0 0',scale:'1'}],{duration:hero?850:620,delay:Math.min(index++,5)*42,easing:ease,fill:'backwards'});}}
  function register(root){if(!(root instanceof Element))return;const list=[...(root.matches(targets)?[root]:[]),...root.querySelectorAll(targets)];for(const el of list){if(seen.has(el))continue;observer?.observe(el)}for(const el of root.querySelectorAll('.cinema,.cm-hero,.garden-hero'))ambientObserver?.observe(el);}
  function scan(){frame=0;for(const root of pending)if(root.isConnected)register(root);pending.clear();updateChrome();}
  function queue(root){pending.add(root);if(!frame)frame=requestAnimationFrame(scan);}
  function updateChrome(){const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--reading-progress',max>0?Math.min(1,Math.max(0,scrollY/max)):0);const nav=document.querySelector('header nav'),a=nav?.querySelector('[aria-current="page"]'),marker=document.querySelector('.motion-nav-marker');if(a&&marker){marker.style.width=a.offsetWidth+'px';marker.style.transform='translateX('+a.offsetLeft+'px)';marker.style.opacity='1'}else if(marker)marker.style.opacity='0';document.body.classList.toggle('motion-scrolled',scrollY>16);}
  let scrollFrame=0;
  function scheduleChrome(){if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateChrome()})}
  function apply(){const on=allowed();document.body.classList.toggle('motion-off',!on);const b=document.querySelector('#motion-button');if(b){b.textContent=on?'◌':'○';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',reduced.matches?'系统已启用减少动态效果':on?'关闭页面动效':'开启页面动效');b.title=reduced.matches?'跟随系统：减少动态效果':on?'动效已开启 · 点击关闭':'动效已关闭 · 点击开启'}if(!on){for(const a of running)a.cancel();running.clear()}updateChrome();}
  function enter(page){for(const a of running)if(!a.effect?.target?.isConnected){a.cancel();running.delete(a)}cancelAnimationFrame(routeFrame);routeFrame=requestAnimationFrame(()=>{const changed=page!==lastPage;lastPage=page;register(document.querySelector('main'));if(changed&&allowed()){const title=document.querySelector('main h1');if(title&&!title.closest(targets))animate(title,[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:680,easing:ease});}updateChrome()});}
  function init(){
    document.body.classList.add('motion-ready');
    const bar=document.createElement('div');bar.className='motion-reading-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);
    const nav=document.querySelector('header nav');if(nav){const marker=document.createElement('span');marker.className='motion-nav-marker';marker.setAttribute('aria-hidden','true');nav.append(marker);nav.addEventListener('scroll',scheduleChrome,{passive:true})}
    const controls=document.querySelector('.header-tools');if(controls){const b=document.createElement('button');b.id='motion-button';b.className='icon-btn';b.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('aweb-motion',enabled?'on':'off')}catch{}apply()});controls.append(b)}
    observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).map(e=>e.target);reveal(visible);for(const el of visible)observer.unobserve(el)},{threshold:.025,rootMargin:'0px 0px -12px 0px'});
    ambientObserver=new IntersectionObserver(entries=>{for(const e of entries)e.target.classList.toggle('motion-in-view',e.isIntersecting)},{threshold:0});
    new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n instanceof Element)queue(n)}).observe(document.querySelector('main'),{childList:true,subtree:true});
    const dialogEntry=d=>{if(d.open)animate(d,[{opacity:0,translate:'0 22px',scale:'.975'},{opacity:1,translate:'0 0',scale:'1'}],{duration:420,easing:ease});};
    const dialogs=new MutationObserver(records=>{for(const r of records)if(r.attributeName==='open'){if(r.target.open)dialogEntry(r.target);else channels.get(r.target)?.cancel();}});
    const watchDialog=d=>{if(watchedDialogs.has(d))return;watchedDialogs.add(d);dialogs.observe(d,{attributes:true,attributeFilter:['open']});if(d.open)dialogEntry(d)};
    document.querySelectorAll('dialog').forEach(watchDialog);
    new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n instanceof Element){if(n.matches('dialog'))watchDialog(n);n.querySelectorAll('dialog').forEach(watchDialog);}}).observe(document.body,{childList:true,subtree:true});
    const feedback=new MutationObserver(records=>{const updates=new Set;for(const r of records){const el=r.target instanceof Element?r.target:r.target.parentElement;const target=el?.closest('#plus-tool-result,#journal-count,#cm-count,#task-count,#plus-results');if(target)updates.add(target)}for(const el of updates)animate(el,[{opacity:.35,translate:'0 5px'},{opacity:1,translate:'0 0'}],{duration:300,easing:ease});});
    feedback.observe(document.body,{childList:true,characterData:true,subtree:true});
    document.addEventListener('toggle',e=>{const d=e.target;if(d instanceof HTMLDetailsElement&&d.open){for(const child of [...d.children].filter(x=>x.tagName!=='SUMMARY'))animate(child,[{opacity:0,translate:'0 -5px'},{opacity:1,translate:'0 0'}],{duration:320,easing:ease})}},true);
    const notice=document.querySelector('#notice');if(notice)new MutationObserver(()=>{if(notice.style.display==='block')animate(notice,[{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:220,easing:'ease-out'})}).observe(notice,{attributes:true,attributeFilter:['style']});
    document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('motion-background',document.hidden);for(const a of running){if(document.hidden)a.pause();else a.play()}});
    window.addEventListener('scroll',scheduleChrome,{passive:true});window.addEventListener('resize',scheduleChrome,{passive:true});
    window.addEventListener('support-motion-change',apply);reduced.addEventListener('change',apply);apply();register(document.querySelector('main'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  return {enter,enabled:allowed};
})();
