const S=[...document.querySelectorAll('.scene')],hint=document.getElementById('hint'),song=document.getElementById('song');
const MAX=[1,1,1,2,0];let cur=0,step=0,last=0;
document.querySelectorAll('.pn').forEach(p=>[...p.children].forEach((e,i)=>e.style.setProperty('--i',i)));
const mob=()=>innerWidth<=820;
function show(el){el.classList.add('vis');if(mob()&&+el.dataset.at>0)setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),400)}
function upd(){hint.style.opacity=(cur==0&&step>=1)||cur==4?0:1}
function enter(n){S[cur].classList.remove('on');cur=n;step=0;last=Date.now();const s=S[n];s.classList.add('on');s.scrollTop=0;
 s.querySelectorAll('.rev').forEach(e=>e.classList.remove('vis'));s.querySelectorAll('[data-at="0"]').forEach(e=>setTimeout(()=>show(e),700));
 if(n==4)song.play().catch(()=>{});upd()}
document.getElementById('start').onclick=e=>{e.stopPropagation();enter(1)};
document.addEventListener('click',e=>{if(e.target.closest('button')||Date.now()-last<900)return;last=Date.now();
 if(step<MAX[cur]){step++;S[cur].querySelectorAll(`[data-at="${step}"]`).forEach(show);upd()}
 else if(cur>0&&cur<4)enter(cur+1)});
function tg(){song.muted=!song.muted;document.querySelector('.mute').textContent=song.muted?'🔇':'🔊'}

// Previous-page navigation: Left Arrow or swipe right.
function goPrev(){if(cur>0){enter(cur-1)}}
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();goPrev()}});
let touchX=null;
document.addEventListener('touchstart',e=>{if(e.target.closest('.music-card')){touchX=null;return}touchX=e.changedTouches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;touchX=null;if(dx>70)goPrev()},{passive:true});
// aurora curtains (page 1)
const au=document.getElementById('au'),a=au.getContext('2d');let W,H;
function rz(){W=au.width=innerWidth;H=au.height=innerHeight}rz();addEventListener('resize',rz);
(function f(t){if(cur==0){a.clearRect(0,0,W,H);a.globalCompositeOperation='screen';
 for(let i=0;i<46;i++){const x=i/45*W,p=i*.35,y=H*.1+Math.sin(t/5200+p)*H*.05+Math.sin(i*.2+t/9000)*H*.06,h=H*(.3+.1*Math.sin(t/4000+p*1.7)),w=W/38,hue=(i%9<5)?140:285+Math.sin(t/7000+i)*20,g=a.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,`hsla(${hue},90%,60%,0)`);g.addColorStop(.35,`hsla(${hue},95%,62%,${.15+.08*Math.sin(t/3000+p)})`);g.addColorStop(1,`hsla(${hue},90%,60%,0)`);a.fillStyle=g;a.fillRect(x-w/2+Math.sin(t/6000+p)*14,y,w,h)}}
 requestAnimationFrame(f)})(0);
// petals and fireflies
const mk=(id,cls,n,fn)=>{const c=document.getElementById(id);for(let i=0;i<n;i++){const e=document.createElement('i');e.className=cls;e.style.cssText=fn();c.appendChild(e)}};
mk('petals','pt',16,()=>{const z=8+Math.random()*9;return`left:${Math.random()*100}vw;width:${z}px;height:${z}px;animation-duration:${9+Math.random()*9}s;animation-delay:-${Math.random()*14}s`});
mk('flies','ff',26,()=>`left:${Math.random()*100}vw;animation-duration:${8+Math.random()*10}s;animation-delay:-${Math.random()*14}s`);

// Robust last-page music controls (autoplay may be blocked by the browser).
const playSong=document.getElementById('playSong'),progress=document.getElementById('progress'),volume=document.getElementById('volume'),currentTimeEl=document.getElementById('currentTime'),durationEl=document.getElementById('duration'),musicStatus=document.getElementById('musicStatus');
const fmt=t=>{if(!Number.isFinite(t))return'0:00';const m=Math.floor(t/60),s=Math.floor(t%60).toString().padStart(2,'0');return`${m}:${s}`};
function syncMusic(){
 if(!song)return;
 playSong.textContent=song.paused?'▶':'❚❚';
 playSong.setAttribute('aria-label',song.paused?'Play song':'Pause song');
 volume.textContent=song.muted?'🔇':'🔊';
 volume.setAttribute('aria-label',song.muted?'Unmute song':'Mute song');
 currentTimeEl.textContent=fmt(song.currentTime); durationEl.textContent=fmt(song.duration);
 progress.value=Number.isFinite(song.duration)&&song.duration>0?(song.currentTime/song.duration)*100:0;
}
async function playMusic(){
 try{await song.play();musicStatus.textContent='Playing';}
 catch(err){musicStatus.textContent='Tap the play button to start the music.';}
 syncMusic();
}
playSong.addEventListener('click',()=>song.paused?playMusic():song.pause());
volume.addEventListener('click',()=>{song.muted=!song.muted;syncMusic()});
progress.addEventListener('input',()=>{if(Number.isFinite(song.duration))song.currentTime=(Number(progress.value)/100)*song.duration});
['loadedmetadata','timeupdate','play','pause','volumechange','ended','canplay'].forEach(ev=>song.addEventListener(ev,syncMusic));

// Replace the silent autoplay attempt with a visible fallback.
const originalEnter=enter;
enter=function(n){
 originalEnter(n);
 if(n===4){
   song.currentTime=0;
   setTimeout(()=>playMusic(),350);
 } else if(song && !song.paused){
   song.pause();
 }
};
syncMusic();
