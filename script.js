(function(){
  'use strict';

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  if(toggle && nav){
    toggle.addEventListener('click',()=>{
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',open);
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }));
  }

  // Scroll progress bar
  const progress = document.querySelector('.scroll-progress');
  function updateProgress(){
    if(!progress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }
  window.addEventListener('scroll',updateProgress,{passive:true});
  updateProgress();

  // Back to top
  const btt = document.querySelector('.back-to-top');
  if(btt){
    window.addEventListener('scroll',()=>{
      if(window.scrollY > 500) btt.classList.add('show');
      else btt.classList.remove('show');
    },{passive:true});
    btt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }

  // Scroll reveal
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.08,rootMargin:'0px 0px -40px 0px'});

  document.querySelectorAll('.reveal, .load-in').forEach(el=>revealObserver.observe(el));

  // Copy to clipboard
  const toast = document.querySelector('.toast');
  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),2200);
  }

  document.querySelectorAll('.copy-btn').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const text = btn.dataset.copy || btn.textContent.trim();
      try{
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        showToast('Copied to clipboard');
        setTimeout(()=>{btn.textContent = original;btn.classList.remove('copied');},1800);
      }catch(err){
        showToast('Copy failed');
      }
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id = a.getAttribute('href');
      if(id === '#') return;
      const target = document.querySelector(id);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // FAQ enhancement (keep semantic details, add smooth height feel)
  document.querySelectorAll('details').forEach(d=>{
    d.addEventListener('toggle',()=>{
      if(d.open){
        const content = d.querySelector('.details-content');
        if(content) content.style.animation = 'fadeIn .25s ease';
      }
    });
  });
})();

