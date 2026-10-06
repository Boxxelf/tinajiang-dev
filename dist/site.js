(() => {
 const menu=document.querySelector('.studio-menu'),panel=document.querySelector('#site-menu');
 const close=()=>{panel.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.textContent='+';};
 menu?.addEventListener('click',()=>{const opening=panel.hidden;panel.hidden=!opening;menu.setAttribute('aria-expanded',String(opening));menu.setAttribute('aria-label',opening?'Close navigation':'Open navigation');menu.textContent=opening?'×':'+';});
 if(document.body.classList.contains('creative-home'))matchMedia('(min-width:901px)').addEventListener('change',event=>{if(event.matches)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();menu.focus()}});
 document.addEventListener('pointerdown',e=>{if(!panel.contains(e.target)&&!menu.contains(e.target)&&!panel.hidden)close()});
 try{const theme=localStorage.getItem('tina-theme');if(theme)document.documentElement.dataset.theme=theme}catch{}
 document.querySelector('.theme-toggle')?.addEventListener('click',()=>{const current=document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');const theme=current==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('tina-theme',theme)}catch{}});
 document.querySelector('#copy-email')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('yutongj@usc.edu');document.querySelector('#copy-status').textContent='Email copied';}catch{document.querySelector('#copy-status').textContent='Please copy the email address above.'}});
 if(!matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(items=>items.forEach(i=>{if(i.isIntersecting){i.target.classList.add('revealed');observer.unobserve(i.target)}}),{threshold:.08});document.querySelectorAll('.case-section,.art-item,.work-card').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el)});}
})();

// Keep the optional live project out of the initial page load on mobile.
document.querySelector('#load-explorer')?.addEventListener('click',event=>{
 const host=document.querySelector('#explorer-frame');
 const frame=document.createElement('iframe');
 frame.src='https://boxxelf.github.io/STEM-Math-Connections-Explorer/';
 frame.title='Current STEM Math Connections Explorer';
 frame.loading='lazy';
 frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups');
 host.replaceChildren(frame);host.hidden=false;event.currentTarget.hidden=true;
});
