/* Accessible route navigation; keeps the selected destination visible on narrow screens. */
(()=>{
 const main=document.getElementById('main');
 const skip=document.createElement('button');skip.className='site-skip';skip.textContent='跳到主要内容';skip.type='button';skip.onclick=()=>{main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant',block:'start'})};document.body.prepend(skip);
 const nav=document.querySelector('header nav');
 function sync(){const page=location.hash.slice(1).split('?')[0]||'home';const active=[...nav.querySelectorAll('a')].find(a=>a.hash==='#'+page);if(!active)return;const left=active.offsetLeft-nav.offsetLeft;const start=active.getBoundingClientRect().left-nav.getBoundingClientRect().left;const end=start+active.offsetWidth;if(start<8||end>nav.clientWidth-8)nav.scrollTo({left:nav.scrollLeft+start-(nav.clientWidth-active.offsetWidth)/2,behavior:'instant'});}
 window.addEventListener('hashchange',()=>requestAnimationFrame(sync));window.addEventListener('resize',sync);requestAnimationFrame(sync);
 nav.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey)return;const links=[...nav.querySelectorAll('a')];const index=links.indexOf(document.activeElement);if(index<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?links.length-1:(index+(e.key==='ArrowRight'?1:-1)+links.length)%links.length;links[next].focus();});
 document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('site-idle',document.hidden)});
})();
