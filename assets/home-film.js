(()=>{
 const main=document.querySelector('main');if(!main)return;
 function mount(){
  const route=location.hash.slice(1).split('?')[0]||'home';
  if(route!=='home'||!main.children.length||main.querySelector('.home-film'))return;
  const section=document.createElement('section');section.className='home-film';section.setAttribute('aria-labelledby','home-film-title');
  section.innerHTML='<div class="home-film-head"><div><p>GUANGFU COMMUNITY · 2.0</p><h1 id="home-film-title">校园生活，一个入口。</h1></div><span>154 秒，认识广附社区</span></div><video controls playsinline preload="none" poster="assets/promo/cover.jpg" aria-label="广附社区2.0网站宣传片"><source src="assets/promo/guangfu-2.mp4" type="video/mp4"><track kind="captions" src="assets/promo/captions.vtt" srclang="zh" label="中文字幕"><p>浏览器无法播放？<a href="assets/promo/guangfu-2.mp4">打开视频</a></p></video><div class="home-film-foot"><span>学习 · 表达 · 回忆 · 一路走来的开发故事</span><a href="assets/promo/guangfu-2.mp4" download>下载宣传片 ↗</a></div>';
  main.prepend(section);
 }
 let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})}).observe(main,{childList:true});
 window.addEventListener('hashchange',mount);mount();
})();
