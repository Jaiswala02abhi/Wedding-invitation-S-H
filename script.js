const body=document.body;
const openBtn=document.getElementById('openInvitation');
const music=document.getElementById('bgMusic');
const opening=document.querySelector('.opening');
const musicToggle=document.getElementById('musicToggle');
const musicLabel=musicToggle.querySelector('span');
try{history.scrollRestoration='manual'}catch(e){}

function forceTop(){
  window.scrollTo({top:0,left:0,behavior:'auto'});
  setTimeout(()=>window.scrollTo(0,0),0);
  setTimeout(()=>window.scrollTo(0,0),120);
}

function resetToOpening(){
  body.classList.add('locked');
  opening.classList.remove('hidden');
  opening.style.display='flex';
  opening.style.position='relative';
  opening.style.zIndex='auto';
  music.pause();
  music.currentTime=0;
  musicToggle.classList.remove('active');
  musicLabel.textContent='OFF';
  musicToggle.setAttribute('aria-pressed','false');
  musicToggle.setAttribute('aria-label','Turn music on');
  forceTop();
}

window.addEventListener('load',()=>{
  resetToOpening();
  setupScratch();
});
window.addEventListener('pageshow',()=>{
  const nav=performance.getEntriesByType('navigation')[0];
  const legacyReload=(performance.navigation && performance.navigation.type===1);
  if((nav && nav.type==='reload') || legacyReload) resetToOpening();
  else forceTop();
});

function setMusicUI(isOn){
  musicToggle.classList.add('active');
  musicToggle.setAttribute('aria-pressed',String(isOn));
  musicToggle.setAttribute('aria-label',isOn?'Turn music off':'Turn music on');
  musicLabel.textContent=isOn?'ON':'OFF';
}

openBtn.addEventListener('click',async()=>{
  body.classList.remove('locked');
  opening.classList.add('hidden');
  musicToggle.classList.add('active');
  try{
    music.currentTime=0;
    await music.play();
    setMusicUI(true);
  }catch(e){
    setMusicUI(false);
  }
  setTimeout(()=>{
    opening.style.display='none';
    document.querySelector('.couple').scrollIntoView({behavior:'smooth',block:'start'});
  },850);
});

musicToggle.addEventListener('click',async()=>{
  if(music.paused){
    try{await music.play();setMusicUI(true);}catch(e){setMusicUI(false);}
  }else{
    music.pause();
    setMusicUI(false);
  }
});

// Scratch-to-reveal date
const canvas=document.getElementById('scratchCanvas');
const ctx=canvas.getContext('2d');
let drawing=false, erased=0, revealed=false;
function setupScratch(){
  const r=canvas.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.round(r.width*dpr));
  canvas.height=Math.max(1,Math.round(r.height*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const g=ctx.createLinearGradient(0,0,r.width,r.height);
  g.addColorStop(0,'#d8a8b5');g.addColorStop(.5,'#efd2da');g.addColorStop(1,'#bd8598');
  ctx.globalCompositeOperation='source-over';ctx.fillStyle=g;ctx.fillRect(0,0,r.width,r.height);
  ctx.fillStyle='#7c5867';ctx.textAlign='center';ctx.font='600 11px Montserrat';ctx.fillText('SCRATCH TO REVEAL',r.width/2,r.height/2-5);
  ctx.font='21px serif';ctx.fillText('✧  ♡  ✧',r.width/2,r.height/2+26);
  ctx.globalCompositeOperation='destination-out';
  erased=0;revealed=false;
}
function scratch(e){
  if(!drawing||revealed)return;
  const r=canvas.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  ctx.beginPath();ctx.arc(x,y,19,0,Math.PI*2);ctx.fill();
  erased++;
  if(erased>65){
    revealed=true;
    canvas.style.transition='opacity .45s';canvas.style.opacity='0';
    setTimeout(()=>canvas.style.display='none',480);
    startRosePetals();
  }
}
canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture(e.pointerId);scratch(e)});
canvas.addEventListener('pointermove',scratch);
['pointerup','pointercancel'].forEach(ev=>canvas.addEventListener(ev,()=>drawing=false));
window.addEventListener('resize',()=>{if(canvas.style.display!=='none')setupScratch()});

function startRosePetals(){
  const layer=document.getElementById('petalLayer');
  if(!layer||layer.dataset.started==='1')return;
  layer.dataset.started='1';
  layer.classList.add('active');
  void layer.offsetWidth;
  const count=44;
  for(let i=0;i<count;i++){
    const petal=document.createElement('span');
    petal.className='rose-petal';
    const left=Math.random()*104-2;
    const size=8+Math.random()*11;
    const dur=3.8+Math.random()*2.8;
    const delay=Math.random()*0.18;
    const rot=-40+Math.random()*100;
    const drift=(-55+Math.random()*110)+'px';
    const drift2=(-70+Math.random()*140)+'px';
    petal.style.setProperty('--left',left+'%');
    petal.style.setProperty('--size',size+'px');
    petal.style.setProperty('--dur',dur+'s');
    petal.style.setProperty('--delay',delay+'s');
    petal.style.setProperty('--rot',rot+'deg');
    petal.style.setProperty('--drift',drift);
    petal.style.setProperty('--drift2',drift2);
    layer.appendChild(petal);
  }
  setTimeout(()=>layer.classList.remove('active'),8500);
}

// Countdown to Friday, 30 October 2026, 4:30 PM local device time
function updateCountdown(){
  const target=new Date(2027,1,29,16,30,0).getTime();
  const diff=Math.max(0,target-Date.now());
  const vals={days:Math.floor(diff/86400000),hours:Math.floor(diff%86400000/3600000),minutes:Math.floor(diff%3600000/60000),seconds:Math.floor(diff%60000/1000)};
  Object.entries(vals).forEach(([id,v])=>document.getElementById(id).textContent=String(v).padStart(2,'0'));
}
updateCountdown();setInterval(updateCountdown,1000);

// One-photo-at-a-time gallery with quote in the lower white print area
const photos=['couple-1.jpg','couple-2.jpg','couple-3.jpg'];
const quotes=[
  '“Two hearts, one beautiful beginning.”',
  '“In every moment, I choose you.”',
  '“And so our forever begins.”'
];
const galleryPhoto=document.getElementById('galleryPhoto');
const galleryQuote=document.getElementById('galleryQuote');
const dots=[...document.querySelectorAll('#galleryDots span')];
let photoIndex=0;
function showPhoto(i){
  photoIndex=(i+photos.length)%photos.length;
  galleryPhoto.src=photos[photoIndex];
  galleryQuote.textContent=quotes[photoIndex];
  dots.forEach((d,n)=>d.classList.toggle('active',n===photoIndex));
}
document.getElementById('prevPhoto').addEventListener('click',()=>showPhoto(photoIndex-1));
document.getElementById('nextPhoto').addEventListener('click',()=>showPhoto(photoIndex+1));
