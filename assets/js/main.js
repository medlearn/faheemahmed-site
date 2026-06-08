const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));
  const toggle=document.getElementById('toggle'),links=document.getElementById('navlinks'),backdrop=document.getElementById('backdrop');
  function setMenu(open){
    links.classList.toggle('open',open);
    toggle.classList.toggle('open',open);
    document.body.classList.toggle('menu-open',open);
    if(backdrop)backdrop.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',open?'true':'false');
    toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
  }
  toggle.addEventListener('click',()=>setMenu(!links.classList.contains('open')));
  if(backdrop)backdrop.addEventListener('click',()=>setMenu(false));
  addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  const io=new IntersectionObserver((es)=>es.forEach((e)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),(e.target.dataset.d||0));io.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach((el,i)=>{el.dataset.d=(i%4)*90;io.observe(el);});
  // Lazy-load YouTube: only build the player iframe when a card is activated
  document.querySelectorAll('.vcard[data-yt]').forEach(card=>{
    const playVideo=()=>{
      const thumb=card.querySelector('.vthumb');
      if(!thumb||thumb.querySelector('iframe'))return;
      const id=card.getAttribute('data-yt');
      const f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';
      f.title=card.getAttribute('aria-label')||'YouTube video';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen=true;
      thumb.innerHTML='';
      thumb.appendChild(f);
    };
    card.addEventListener('click',playVideo);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();playVideo();}});
  });
  // Lazy-load TikTok: build the embed iframe only when a card is activated
  document.querySelectorAll('.tkcard[data-tt]').forEach(card=>{
    const playTT=()=>{
      if(card.querySelector('iframe'))return;
      const id=card.getAttribute('data-tt');
      const f=document.createElement('iframe');
      f.src='https://www.tiktok.com/player/v1/'+id+'?rel=0&autoplay=1&controls=1&description=0&music_info=0';
      f.title=card.getAttribute('aria-label')||'TikTok video';
      f.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';
      f.allowFullscreen=true;
      f.scrolling='no';
      card.appendChild(f);
    };
    card.addEventListener('click',playTT);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();playTT();}});
  });
