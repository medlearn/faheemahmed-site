const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));
  const toggle=document.getElementById('toggle'),links=document.getElementById('navlinks');
  toggle.addEventListener('click',()=>links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
  const io=new IntersectionObserver((es)=>es.forEach((e)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),(e.target.dataset.d||0));io.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach((el,i)=>{el.dataset.d=(i%4)*90;io.observe(el);});
