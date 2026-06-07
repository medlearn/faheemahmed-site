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
