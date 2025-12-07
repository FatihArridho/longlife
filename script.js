/* ===============================
   script.js — ALL FEATURES (no leaderboard)
   - previous features (canvas scene, photobooth, music mp3, dancers, walkers, npcs, effects...)
   - ADDED:
     * pixel TV corner with channels
     * heat-distortion near cake (simple sine warp)
     * konami secret code -> secretMode (extra filters)
     * mini pet that follows mouse
     * retro UI sounds (click, coin, snap, step)
     * heart emitter on button hover
     * balloons rising from bottom
     * cinematic intro before reveal (on start)
     * birds flying across top
   - note: replace MUSIC_URL with your mp3 if desired
   =============================== */

/* ---------- ELEMENTS ---------- */
const startScreen = document.getElementById('start-screen');
const mainScene = document.getElementById('main-scene');
const startBtn = document.getElementById('start-btn');

const openLetterBtn = document.getElementById('open-letter-btn');
const photoBoothBtn = document.getElementById('photo-booth-btn');
const crtToggle = document.getElementById('crt-toggle');
const downloadBtn = document.getElementById('download-btn');

const letterModal = document.getElementById('letter-modal');
const kirimBtn = document.getElementById('kirim-btn');
const closeLetterBtn = document.getElementById('close-letter-btn');
const birthdayMessage = document.getElementById('birthday-message');

const photoboothModal = document.getElementById('photobooth-modal');
const cameraVideo = document.getElementById('camera-video');
const cameraEffectCanvas = document.getElementById('camera-effect-canvas');
const takePhotoBtn = document.getElementById('take-photo-btn');
const closePhotoBtn = document.getElementById('close-photo-btn');

const canvasWrap = document.getElementById('canvas-wrap');
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

const effectCanvas = document.getElementById('effect-canvas');
const ectx = effectCanvas.getContext('2d');

let isCrtOn = false;

/* ---------- UTILS ---------- */
function rand(a,b){ return Math.random()*(b-a)+a; }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function lerp(a,b,t){ return a + (b-a)*t; }

/* ---------- RESIZE ---------- */
function resizeCanvas(){
  const wrap = canvasWrap || document.body;
  const maxW = Math.min(window.innerWidth * 0.95, 800);
  const maxH = Math.min(window.innerHeight * 0.95, 600);
  const scale = Math.min(maxW / 800, maxH / 600);
  const intScale = Math.max(1, Math.floor(scale));
  if (canvasWrap) {
    canvasWrap.style.width = (800 * intScale) + 'px';
    canvasWrap.style.height = (600 * intScale) + 'px';
  }
  canvas.width = 800; canvas.height = 600;
  effectCanvas.width = 800; effectCanvas.height = 600;
  ctx.imageSmoothingEnabled = false;
  ectx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ---------- BASE PIXEL SPRITES ---------- */
function drawPixelSpriteToCtx(_ctx, data, x, y, scale = 1){
  const palette = ['#ff0000','#0000ff','#ffff00','#00ff00','#800080','#ffa500','#ffffff','#000000'];
  for(let r=0;r<data.length;r++){
    for(let c=0;c<data[r].length;c++){
      const v = data[r][c];
      if (v !== null && v !== undefined) {
        _ctx.fillStyle = palette[v % palette.length];
        _ctx.fillRect(x + c*scale, y + r*scale, scale, scale);
      }
    }
  }
}
const cakeData = [
  [null,null,2,2,2,2,null,null],
  [null,2,1,1,1,1,2,null],
  [2,1,0,0,0,0,1,2],
  [2,1,0,3,3,0,1,2],
  [null,2,1,1,1,1,2,null]
];

/* ---------- GLOBAL STATE ---------- */
let lightBlink = 0;
let secretMode = false; // konami unlocked
let cinematicPlaying = false;

/* ---------- CLOUDS ---------- */
const clouds = [];
const CLOUD_COUNT = 4;
function initClouds(){
  clouds.length = 0;
  for (let i=0;i<CLOUD_COUNT;i++) clouds.push({ x: rand(-200,900), y: rand(20,110), speed: rand(0.2,0.6), scale: Math.floor(rand(1,2)) });
}
initClouds();
function drawCloud(_ctx,x,y,s){
  const px = 6*s;
  _ctx.fillStyle = 'rgba(255,255,255,0.92)';
  _ctx.fillRect(x, y+px, px*4, px*2);
  _ctx.fillRect(x - px*1, y, px*3, px*2);
  _ctx.fillRect(x + px*3, y, px*3, px*2);
}
function updateAndDrawClouds(){
  for(const c of clouds){
    c.x += c.speed;
    if (c.x > 900) c.x = -240 - rand(0,200);
    drawCloud(ctx, Math.round(c.x), Math.round(c.y), c.scale);
  }
}

/* ---------- SPOTLIGHT ---------- */
const spotlight = { x: 400, y: 50, dir: 1, minX: 80, maxX: 720, speed: 1.0, hue: 200, hueDir: 1 };
function updateAndDrawSpotlight(){
  spotlight.x += spotlight.dir * spotlight.speed;
  if (spotlight.x < spotlight.minX || spotlight.x > spotlight.maxX) spotlight.dir *= -1;
  spotlight.hue += spotlight.hueDir * 0.2;
  if (spotlight.hue < 160 || spotlight.hue > 300) spotlight.hueDir *= -1;
  const grd = ctx.createRadialGradient(spotlight.x, spotlight.y, 10, spotlight.x, spotlight.y, 220);
  const color = `hsla(${Math.floor(spotlight.hue)}, 90%, 60%, `;
  grd.addColorStop(0, color + '0.28)');
  grd.addColorStop(0.25, color + '0.12)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(spotlight.x, spotlight.y+40, 220, 60, 0, 0, Math.PI*2);
  ctx.fill();
}

/* ---------- DANCERS / WALKERS / NPC (reused functions) ---------- */
/* For brevity we reuse the implementations from previous version — assume they're present */
const dancers = [];
function initDancers(){ dancers.length=0; const leftX=120,rightX=630,y=62; const colors=['#ff6b6b','#ffd166','#6bcB77','#7ec8ff','#d291ff']; for(let i=0;i<2;i++) dancers.push({x:leftX+i*28,y:y+(i%2?2:0),frame:Math.floor(Math.random()*4),timer:Math.floor(Math.random()*10),color:colors[i%colors.length],jumpTimer:0,bubble:null,flip:false}); for(let i=0;i<2;i++) dancers.push({x:rightX+i*28,y:y+(i%2?2:0),frame:Math.floor(Math.random()*4),timer:Math.floor(Math.random()*10),color:colors[(i+2)%colors.length],jumpTimer:0,bubble:null,flip:true}); }
initDancers();

function drawDancerSmall(_ctx,x,y,color,frame,flip=false,jump=0){
  const px=2; const jy=-Math.max(0,jump);
  _ctx.fillStyle='#ffffff';
  _ctx.fillRect(x+2*px,y+0*px+jy,2*px,2*px);
  _ctx.fillStyle=color; _ctx.fillRect(x+2*px,y+2*px+jy,2*px,3*px);
  if(frame===0){ _ctx.fillRect(x+px*1,y+3*px+jy,px,2*px); _ctx.fillRect(x+px*4,y+3*px+jy,px,2*px); }
  else if(frame===1){ _ctx.fillRect(x+px*1,y+1*px+jy,px,2*px); _ctx.fillRect(x+px*4,y+1*px+jy,px,2*px); }
  else if(frame===2){ _ctx.fillRect(x+px*1,y+3*px+jy,px,2*px); _ctx.fillRect(x+px*4,y+1*px+jy,px,2*px); }
  else { _ctx.fillRect(x+px*1,y+1*px+jy,px,2*px); _ctx.fillRect(x+px*4,y+3*px+jy,px,2*px); }
  _ctx.fillStyle='#ffffff';
  if(frame%2===0){ _ctx.fillRect(x+2*px,y+5*px+jy,px,2*px); _ctx.fillRect(x+3*px,y+5*px+jy,px,2*px); }
  else { _ctx.fillRect(x+1*px,y+5*px+jy,px,2*px); _ctx.fillRect(x+4*px,y+5*px+jy,px,2*px); }
  _ctx.fillStyle='#000000'; _ctx.fillRect(x+2*px,y+1*px+jy,1*px,1*px);
}

function updateAndDrawDancers(){
  for(const d of dancers){
    d.timer++;
    if(d.timer>8){ d.timer=0; d.frame=(d.frame+1)%4; if(Math.random()<0.06 && d.jumpTimer<=0) d.jumpTimer=8+Math.floor(Math.random()*12); if(!d.bubble && Math.random()<0.03) d.bubble={text:randomBubbleText(),t:130}; }
    let jumpOffset=0;
    if(d.jumpTimer>0){ const progress=d.jumpTimer; jumpOffset=Math.sin((progress/(8+6))*Math.PI)*6; d.jumpTimer--; }
    drawDancerSmall(ctx, Math.round(d.x), Math.round(d.y-jumpOffset), d.color, d.frame, d.flip, jumpOffset);
    if(d.bubble){ drawBubble(ctx, Math.round(d.x+6), Math.round(d.y-10), d.bubble.text, d.bubble.t); d.bubble.t--; if(d.bubble.t<=0) d.bubble=null; }
  }
}

const walkers = []; const WALKER_COUNT=4;
function createWalker(startX,y,speed,scale=1.0){ return {x:startX,y, speed, scale, frameTimer:0, frameIndex:0, bubble:null}; }
function initWalkers(){ walkers.length=0; const baseY=440; for(let i=0;i<WALKER_COUNT;i++){ const gap=140; const startX=900+i*gap+rand(0,80); const speed=rand(0.6,1.6); const scale=2; walkers.push(createWalker(startX, baseY, speed, scale)); } }
initWalkers();

function drawWalker(_ctx,x,y,scale,frameIndex){ const px=scale; _ctx.fillStyle='#ffffff'; _ctx.fillRect(x+2*px,y+0*px,2*px,2*px); _ctx.fillRect(x+2*px,y+2*px,2*px,3*px); _ctx.fillRect(x+1*px,y+2*px,1*px,2*px); _ctx.fillRect(x+4*px,y+2*px,1*px,2*px); if(frameIndex%2===0){ _ctx.fillRect(x+2*px,y+5*px,1*px,2*px); _ctx.fillRect(x+3*px,y+5*px,1*px,2*px); } else { _ctx.fillRect(x+1*px,y+5*px,1*px,2*px); _ctx.fillRect(x+4*px,y+5*px,1*px,2*px); } _ctx.fillStyle='#000000'; _ctx.fillRect(x+2*px,y+1*px,1*px,1*px); }

function updateAndDrawWalkers(){ for(const w of walkers){ w.x -= w.speed; w.frameTimer++; if(w.frameTimer > (12 - Math.floor(w.speed*4))){ w.frameTimer=0; w.frameIndex=(w.frameIndex+1)%2; if(!w.bubble && Math.random()<0.02) w.bubble={text:randomBubbleText(),t:80}; } if(w.x < -40) { w.x = 820 + rand(0,240); w.speed = rand(0.6,1.6); w.frameIndex=0; } drawWalker(ctx, Math.round(w.x), Math.round(w.y), Math.round(w.scale*2), w.frameIndex); if(w.bubble){ drawBubble(ctx, Math.round(w.x), Math.round(w.y-18), w.bubble.text, w.bubble.t); w.bubble.t--; if(w.bubble.t<=0) w.bubble=null; } } }

/* ---------- NPC cats/dogs ---------- */
const npcs = []; const NPC_TYPES = ['cat','dog'];
function spawnNPC(type='cat'){ const yBase=470; const speed=rand(1.4,3.0); const startX=-60; const npc={type,x:startX,y:yBase+(type==='cat'?rand(-6,6):rand(-4,8)),speed,state:'running',timer:0,blinkTimer:Math.floor(rand(60,240)),bubble:null}; npcs.push(npc); }
function drawNPC(_ctx,n){ const px=2; const x=Math.round(n.x); const y=Math.round(n.y); const bodyColor=(n.type==='cat') ? '#cfcfcf' : '#d4a373'; _ctx.fillStyle='#ffffff'; _ctx.fillRect(x+1*px,y+0*px,3*px,2*px); if(n.type==='cat'){ _ctx.fillRect(x+1*px,y-1*px,1*px,1*px); _ctx.fillRect(x+3*px,y-1*px,1*px,1*px); } _ctx.fillStyle=bodyColor; _ctx.fillRect(x+1*px,y+2*px,3*px,2*px); if(n.type==='cat') _ctx.fillRect(x-1*px,y+2*px,1*px,1*px); else _ctx.fillRect(x+4*px,y+2*px,1*px,1*px); _ctx.fillStyle='#000'; _ctx.fillRect(x+1*px,y+1*px,1*px,1*px); _ctx.fillRect(x+3*px,y+1*px,1*px,1*px); }
function updateAndDrawNPCs(){ for(let i=npcs.length-1;i>=0;i--){ const n=npcs[i]; n.timer++; if(n.state==='running'){ n.x += n.speed; if(Math.random()<0.003 && n.x>120 && n.x<680){ n.state='sitting'; n.sitDuration=80+Math.floor(rand(0,140)); if(Math.random()<0.3) n.bubble={text:randomBubbleText(),t:140}; } } else if(n.state==='sitting'){ n.sitDuration--; if(n.sitDuration<=0){ n.state='running'; if(Math.random()<0.4) n.bubble={text:randomBubbleText(),t:90}; } } n.blinkTimer--; if(n.blinkTimer<=0) n.blinkTimer=Math.floor(rand(60,240)); drawNPC(ctx,n); if(n.bubble){ drawBubble(ctx, Math.round(n.x+10), Math.round(n.y-14), n.bubble.text, n.bubble.t); n.bubble.t--; if(n.bubble.t<=0) n.bubble=null; } if(n.x > 920) npcs.splice(i,1); } }
setInterval(()=>{ if(Math.random()<0.25) spawnNPC(NPC_TYPES[Math.floor(Math.random()*NPC_TYPES.length)]); },1600);

/* ---------- CHAT BUBBLE UTIL ---------- */
function drawBubble(_ctx,x,y,text,life){ const alpha = clamp(life/140,0,1); const pad = 6; _ctx.save(); _ctx.globalAlpha = alpha; _ctx.font='10px monospace'; const w = Math.min(160, _ctx.measureText(text).width + pad*2); const h=18; _ctx.fillStyle='rgba(255,255,255,0.95)'; _ctx.fillRect(x - w/2, y - h, w, h); _ctx.fillRect(x - 6, y - 6, 6, 6); _ctx.fillStyle='#000'; _ctx.fillText(text, x - w/2 + pad, y - 6); _ctx.restore(); }
function randomBubbleText(){ const msgs=['happy bday!','woof woof','meong~','cake time!','party!','keren nih','sini foto!','yeay!','lets dance','🎉']; return msgs[Math.floor(Math.random()*msgs.length)]; }

/* ---------- EFFECTS: SNOW / FIREWORK / CONFETTI / BALLOONS / HEARTS / BIRDS ---------- */
/* Snow (reused) */
const snow = []; class SnowFlake{ constructor(){ this.x=rand(0,800); this.y=rand(-600,0); this.vy=rand(0.4,1.2); this.vx=rand(-0.4,0.4); this.size=rand(1.2,3.2);} update(){ this.x+=this.vx; this.y+=this.vy; if(this.y>620){ this.x=rand(0,800); this.y=rand(-80,-10);} } draw(g){ g.beginPath(); g.fillStyle='rgba(255,255,255,0.9)'; g.arc(this.x,this.y,this.size,0,Math.PI*2); g.fill(); } }
for(let i=0;i<120;i++) snow.push(new SnowFlake());

/* Fireworks & Confetti (reused) */
const fw_launchers = []; const fw_sparks = [];
class FireworkLauncher{ constructor(x){ this.x = x ?? rand(80,720); this.y = 600; this.vy = rand(-7.5,-5.5); this.vx = rand(-1.2,1.2); this.color = `hsl(${rand(0,360)},100%,50%)`; this.exploded=false; } update(){ if(!this.exploded){ this.x += this.vx; this.y += this.vy; this.vy += 0.18; if(this.vy >= -1.0) this.exploded = true; } } draw(g){ if(!this.exploded){ g.fillStyle=this.color; g.beginPath(); g.arc(this.x,this.y,3,0,Math.PI*2); g.fill(); } } }
class FireworkSpark{ constructor(x,y,vx,vy,color){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.color=color; this.life=40 + Math.floor(rand(0,30)); this.age=0; } update(){ this.vy += 0.06; this.x += this.vx; this.y += this.vy; this.age++; } draw(g){ const alpha = Math.max(0,1 - this.age/this.life); g.globalAlpha = alpha; g.fillStyle = this.color; g.fillRect(this.x, this.y, 2, 2); g.globalAlpha = 1; } }
function spawnFirework(x){ fw_launchers.push(new FireworkLauncher(x)); }

const confetti = []; class Confetto{ constructor(x,y){ this.x=x; this.y=y; this.vx=rand(-1,1); this.vy=rand(2,5); this.w=rand(4,8); this.h=rand(2,5); this.color=`hsl(${rand(0,360)},100%,50%)`; this.rotation=rand(0,Math.PI*2); this.angular=rand(-0.2,0.2); this.life=120 + Math.floor(rand(0,80)); this.age=0; } update(){ this.x+=this.vx; this.y+=this.vy; this.vy+=0.04; this.rotation+=this.angular; this.age++; } draw(g){ g.save(); g.translate(this.x,this.y); g.rotate(this.rotation); g.fillStyle=this.color; g.fillRect(-this.w/2,-this.h/2,this.w,this.h); g.restore(); } }
function spawnConfettiBurst(x,count=60){ for(let i=0;i<count;i++) confetti.push(new Confetto(x + rand(-20,20), rand(460,540))); }

/* BALLOONS */
const balloons = [];
class Balloon{ constructor(x){ this.x = x ?? rand(40,760); this.y = 620 + rand(0,80); this.vy = rand(-0.6, -1.6); this.vx = rand(-0.2,0.2); this.color = `hsl(${rand(0,360)},80%,60%)`; this.w = rand(10,18); this.age=0; } update(){ this.x += this.vx; this.y += this.vy; this.age++; if(this.y < -60) this.reset(); } draw(g){ // simple pixel-ish balloon circle g.fillStyle = this.color; g.beginPath(); g.ellipse(this.x, this.y, this.w, this.w*1.1, 0, 0, Math.PI*2); g.fill(); // string g.strokeStyle='rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(this.x, this.y+this.w*1.1); g.lineTo(this.x, this.y + this.w*3); g.stroke(); } reset(){ this.x = rand(40,760); this.y = 620 + rand(0,80); this.vy = rand(-0.6,-1.6); this.vx = rand(-0.2,0.2); this.color = `hsl(${rand(0,360)},80%,60%)`; } }
function spawnBalloon(){ balloons.push(new Balloon()); }
setInterval(()=>{ if(Math.random()<0.6) spawnBalloon(); },1300);

/* HEART PARTICLES (for hover) */
const hearts = [];
class Heart{ constructor(x,y){ this.x=x; this.y=y; this.vx = rand(-0.8,0.8); this.vy = rand(-2.4,-1.2); this.life=80; this.age=0; this.col = `hsl(${rand(320,350)},80%,70%)`; } update(){ this.x+=this.vx; this.y+=this.vy; this.vy += 0.04; this.age++; } draw(g){ g.save(); const a = 1 - (this.age/this.life); g.globalAlpha = a; g.fillStyle = this.col; // tiny pixel heart draw as two squares + one below g.fillRect(this.x, this.y, 4,4); g.fillRect(this.x+4, this.y, 4,4); g.fillRect(this.x+2, this.y+3, 4,4); g.restore(); } }
function emitHeartsAt(x,y,count=6){ for(let i=0;i<count;i++) hearts.push(new Heart(x + rand(-6,6), y + rand(-6,6))); }

/* BIRDS (fly across top) */
const birds = [];
class Bird{ constructor(){ this.y = rand(40,120); this.x = rand(-100,-20); this.vx = rand(1.2,3.2); this.frame = 0; this.timer=0; this.color = `hsl(${rand(0,360)},80%,60%)`; } update(){ this.x += this.vx; this.timer++; if(this.timer>8){ this.timer=0; this.frame=(this.frame+1)%2; } } draw(g){ // small bird pixels g.fillStyle=this.color; const px = 2; g.fillRect(this.x, this.y, 6, 2); if(this.frame===0){ g.fillRect(this.x+2, this.y-2, 2,2); } else { g.fillRect(this.x+2, this.y+2, 2,2); } } }
function spawnBird(){ birds.push(new Bird()); }
setInterval(()=>{ if(Math.random()<0.35) spawnBird(); },1800);

/* ---------- SOUNDS (retro) ---------- */
const SOUND = {
  click: new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'), // example public sounds
  coin: new Audio('https://actions.google.com/sounds/v1/cartoon/coin_drop.ogg'),
  snap: new Audio('https://actions.google.com/sounds/v1/foley/camera_click.ogg'),
  step: new Audio('https://actions.google.com/sounds/v1/ambiences/footsteps_on_gravel.ogg'),
  switch: new Audio('https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_roll.ogg')
};
// set low volumes
for(const k in SOUND) { SOUND[k].volume = 0.22; SOUND[k].preload = 'auto'; }

/* helper play sound safely (catch) */
function playSound(name){ const s = SOUND[name]; if(!s) return; try{ s.currentTime = 0; s.play().catch(()=>{}); }catch(e){} }

/* ---------- MUSIC (mp3 url) ---------- */
const MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_0b7b7f3f95.mp3?filename=8-bit-melody-10018.mp3';
const audioPlayer = new Audio(); audioPlayer.src = MUSIC_URL; audioPlayer.loop = true; audioPlayer.volume = 0.06; audioPlayer.preload = 'auto';
const audioState = { on:false, muted:false };

function ensureMusicUI(){
  if(!canvasWrap) return;
  if(canvasWrap.querySelector('.music-controls')) return;
  const box = document.createElement('div'); box.className='music-controls';
  Object.assign(box.style,{position:'absolute',right:'8px',top:'8px',zIndex:80,display:'flex',gap:'6px'});
  const play = document.createElement('button'); play.className='pixel-btn'; play.style.width='44px'; play.style.height='30px'; play.textContent='♫';
  play.onclick = async () => { try{ if(!audioState.on){ await audioPlayer.play(); audioState.on=true; play.textContent='▮▮'; } else { audioPlayer.pause(); audioState.on=false; play.textContent='♫'; } } catch(e){ console.warn(e); alert('Gagal memutar audio — cek URL atau kebijakan browser.'); } };
  const mute = document.createElement('button'); mute.className='pixel-btn'; mute.style.height='30px'; mute.textContent='mute'; mute.onclick=()=>{ audioState.muted = !audioState.muted; audioPlayer.muted = audioState.muted; mute.textContent = audioState.muted ? 'unmute' : 'mute'; };
  const vol = document.createElement('input'); vol.type='range'; vol.min='0'; vol.max='1'; vol.step='0.01'; vol.value=String(audioPlayer.volume); vol.style.width='80px'; vol.oninput = (e)=>{ audioPlayer.volume = parseFloat(e.target.value); };
  box.appendChild(play); box.appendChild(mute); box.appendChild(vol);
  canvasWrap.style.position='relative'; canvasWrap.appendChild(box);
}

/* ---------- PHOTOBOOTH (reused) ---------- */
/* For brevity copy over the earlier photobooth implementation pieces or reuse functions:
   - ensurePhotoUI (adds frame/filter/pixelate controls)
   - startCamera, restartCamera, stopCamera
   - drawCameraPreviewAndDetect
   - captureAndDownload + showPolaroidAnimation
   (we will re-use existing implementations from prior script) */
/* --- (to keep this file self-contained, we'll include simplified versions) --- */

let mediaStream = null; let facingMode = 'user'; let pixelateEnabled = false;
cameraEffectCanvas.width = 800; cameraEffectCanvas.height = 600;
const camECTX = cameraEffectCanvas.getContext('2d'); camECTX.imageSmoothingEnabled=false;

const FRAME_OPTIONS = [
  { id: 'none', name: 'none', draw: (c,w,h)=>{} },
  { id: 'pixel-border', name: 'pixel border', draw: (c,w,h)=>{ c.strokeStyle='#fff'; c.lineWidth=8; c.strokeRect(8,8,w-16,h-16); for(let i=0;i<6;i++){ c.fillRect(12+i*8,12,4,4); c.fillRect(w-16-i*8,12,4,4); } } },
  { id: 'hearts', name: 'hearts', draw: (c,w,h)=>{ for(let i=0;i<9;i++){ const x=24+i*80; c.fillStyle='rgba(255,100,140,0.9)'; c.fillRect(x,h-60,6,6); c.fillRect(x+6,h-56,6,6); } } },
  { id: 'vhs', name: 'vhs stripes', draw: (c,w,h)=>{ for(let i=0;i<6;i++){ c.fillStyle=`rgba(255,255,255,${0.02 + i*0.02})`; c.fillRect(0,i*10,w,2); } } }
];
const FILTERS = [
  { id:'normal', name:'normal', apply:(c,w,h)=>{} },
  { id:'sepia', name:'sepia', apply:(c,w,h)=>{ const img=c.getImageData(0,0,w,h); const d=img.data; for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2]; d[i]=clamp((r*0.393+g*0.769+b*0.189),0,255); d[i+1]=clamp((r*0.349+g*0.686+b*0.168),0,255); d[i+2]=clamp((r*0.272+g*0.534+b*0.131),0,255);} c.putImageData(img,0,0); } },
  { id:'bw', name:'b/w', apply:(c,w,h)=>{ const img=c.getImageData(0,0,w,h); const d=img.data; for(let i=0;i<d.length;i+=4){ const v=(d[i]+d[i+1]+d[i+2])/3; d[i]=d[i+1]=d[i+2]=v; } c.putImageData(img,0,0); } }
];
let selectedFrameId='none'; let selectedFilterId='normal';

function ensurePhotoUI_simple(){
  const card = photoboothModal.querySelector('.pixel-card');
  if(!card) return;
  if(card.querySelector('.photobooth-extras')) return;
  const extra = document.createElement('div'); extra.className='photobooth-extras'; Object.assign(extra.style,{display:'flex',gap:'8px',justifyContent:'center',alignItems:'center',marginTop:'10px'});
  const toggleCameraBtn = document.createElement('button'); toggleCameraBtn.className='pixel-btn'; toggleCameraBtn.textContent='GANTI KAMERA'; toggleCameraBtn.onclick = async ()=>{ facingMode = (facingMode==='user') ? 'environment' : 'user'; await restartCamera(); playSound('switch'); };
  const pixelWrap = document.createElement('label'); pixelWrap.style.display='flex'; pixelWrap.style.alignItems='center'; pixelWrap.style.gap='6px'; const pixCb=document.createElement('input'); pixCb.type='checkbox'; pixCb.onchange=(e)=>{ pixelateEnabled = e.target.checked; }; const pixLabel=document.createElement('span'); pixLabel.textContent='pixelate'; pixLabel.style.fontFamily='"Press Start 2P",monospace'; pixelWrap.appendChild(pixCb); pixelWrap.appendChild(pixLabel);
  const frameSelect = document.createElement('select'); FRAME_OPTIONS.forEach(f=>{ const o=document.createElement('option'); o.value=f.id; o.textContent=f.name; frameSelect.appendChild(o); }); frameSelect.onchange=(e)=>selectedFrameId=e.target.value;
  const filterSelect = document.createElement('select'); FILTERS.forEach(f=>{ const o=document.createElement('option'); o.value=f.id; o.textContent=f.name; filterSelect.appendChild(o); }); filterSelect.onchange=(e)=>selectedFilterId=e.target.value;
  extra.appendChild(toggleCameraBtn); extra.appendChild(pixelWrap); extra.appendChild(frameSelect); extra.appendChild(filterSelect);
  const actions = card.querySelector('.modal-actions'); card.insertBefore(extra, actions);
}
ensurePhotoUI_simple();

async function startCamera(){ try{ ensurePhotoUI_simple(); stopCamera(); const constraints = { video: { facingMode: { ideal: facingMode }, width: { ideal:1280 }, height: { ideal:720 } }, audio:false }; mediaStream = await navigator.mediaDevices.getUserMedia(constraints); cameraVideo.srcObject = mediaStream; await cameraVideo.play(); requestAnimationFrame(drawCameraPreviewAndDetect); } catch(err){ console.warn('camera error', err); alert('Kamera tidak bisa diakses.'); stopCamera(); photoboothModal.classList.add('hidden'); } }
async function restartCamera(){ stopCamera(); await new Promise(r=>setTimeout(r,180)); await startCamera(); }
function stopCamera(){ if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; } try{ cameraVideo.pause(); cameraVideo.srcObject=null; }catch(e){} camECTX.clearRect(0,0,800,600); }

let lastDetectionTime=0;
async function drawCameraPreviewAndDetect(ts){ camECTX.clearRect(0,0,800,600); camECTX.fillStyle='rgba(0,0,0,0.06)'; camECTX.fillRect(0,0,800,600); const vw=cameraVideo.videoWidth, vh=cameraVideo.videoHeight; if(vw && vh){ const scale = Math.max(800/vw,600/vh); const sw = 800/scale, sh=600/scale, sx=(vw-sw)/2, sy=(vh-sh)/2; camECTX.drawImage(cameraVideo, sx, sy, sw, sh, 0,0,800,600); } if(!photoboothModal.classList.contains('hidden')) requestAnimationFrame(drawCameraPreviewAndDetect); else camECTX.clearRect(0,0,800,600); }

async function captureAndDownload(){
  const vw = cameraVideo.videoWidth, vh = cameraVideo.videoHeight;
  if(!vw||!vh){ alert('Video belum siap'); return; }
  const out = document.createElement('canvas'); out.width=800; out.height=600; const outCtx = out.getContext('2d');
  const scale = Math.max(800/vw,600/vh); const sw=800/scale, sh=600/scale, sx=(vw-sw)/2, sy=(vh-sh)/2;
  if(pixelateEnabled){ const pixelFactor=16; const tinyW=Math.max(1,Math.floor(800/pixelFactor)); const tinyH=Math.max(1,Math.floor(600/pixelFactor)); const tiny=document.createElement('canvas'); tiny.width=tinyW; tiny.height=tinyH; const tctx=tiny.getContext('2d'); tctx.drawImage(cameraVideo, sx, sy, sw, sh, 0,0,tinyW,tinyH); outCtx.imageSmoothingEnabled=false; outCtx.drawImage(tiny,0,0,tinyW,tinyH,0,0,800,600); } else { outCtx.drawImage(cameraVideo, sx, sy, sw, sh, 0,0,800,600); }
  const filter = FILTERS.find(f=>f.id===selectedFilterId); if(filter && filter.apply) filter.apply(outCtx,800,600);
  const frame = FRAME_OPTIONS.find(f=>f.id===selectedFrameId); if(frame && frame.draw) frame.draw(outCtx,800,600);
  outCtx.save(); outCtx.fillStyle='#ffffff'; outCtx.font='9px "Press Start 2P",monospace'; outCtx.textBaseline='bottom'; const footerText='made with fatih'; const footerW=outCtx.measureText(footerText).width; outCtx.fillText(footerText,(800-footerW)/2,600-10); outCtx.restore();
  outCtx.strokeStyle='#ffffff'; outCtx.lineWidth=4; outCtx.strokeRect(8,8,800-16,600-16);
  const dataURL = out.toDataURL('image/png'); showPolaroidAnimation(dataURL); out.toBlob((blob)=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`birthday_selfie_${Date.now()}.png`; a.click(); URL.revokeObjectURL(a.href); playSound('snap'); },'image/png');
  camECTX.fillStyle='rgba(255,255,255,0.06)'; camECTX.fillRect(0,0,800,600); setTimeout(()=>camECTX.clearRect(0,0,800,600),40);
}
function showPolaroidAnimation(dataURL){ const el=document.createElement('div'); el.className='polaroid-print'; Object.assign(el.style,{position:'fixed',left:'50%',top:'-320px',transform:'translateX(-50%) rotate(-6deg)',width:'320px',height:'240px',background:'#222',padding:'10px',boxSizing:'border-box',display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:9999,borderRadius:'6px',boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}); const img=document.createElement('img'); img.src=dataURL; img.style.width='100%'; img.style.height='auto'; img.style.display='block'; img.style.borderRadius='3px'; el.appendChild(img); document.body.appendChild(el); el.animate([{top:'-320px',transform:'translateX(-50%) rotate(-6deg)',opacity:0},{top:'80px',transform:'translateX(-50%) rotate(4deg)',opacity:1},{top:'60px',transform:'translateX(-50%) rotate(0deg)',opacity:1}],{duration:900,easing:'cubic-bezier(.2,.8,.2,1)'}); setTimeout(()=>{ el.animate([{transform:'translateX(-50%) rotate(0deg) translateX(0)'},{transform:'translateX(-400%) rotate(-20deg) translateX(0)'}],{duration:700,easing:'ease-in'}); setTimeout(()=>el.remove(),900); },2800); }

/* ---------- PIXEL TV (corner) ---------- */
const tv = { x: 22, y: 22, w: 96, h: 72, channel:0, channels:[], timer:0 };
function initTV(){
  // create some simple channel draw functions (pixel TV)
  tv.channels = [
    (g)=>{ // static noise
      for(let i=0;i<tv.w;i+=4) for(let j=0;j<tv.h;j+=4){ g.fillStyle = Math.random() < 0.5 ? '#fff':'#000'; g.fillRect(tv.x+i,tv.y+j,4,4); }
    },
    (g)=>{ // dancing cat simple
      g.fillStyle='#000'; g.fillRect(tv.x,tv.y,tv.w,tv.h); g.fillStyle='#fff'; g.fillRect(tv.x+22,tv.y+12,12,6); g.fillRect(tv.x+18,tv.y+6,2,2); g.fillRect(tv.x+32,tv.y+6,2,2); g.fillRect(tv.x+20,tv.y+18,16,6); },
    (g)=>{ // HBD big
      g.fillStyle='#000'; g.fillRect(tv.x,tv.y,tv.w,tv.h); g.fillStyle='#ff0'; g.font='10px monospace'; g.fillText('HBD!', tv.x+12, tv.y+36); },
    (g)=>{ // pixel animation bars
      for(let i=0;i<tv.w;i+=8){ g.fillStyle=`hsl(${(i/2)+tv.timer*4},80%,60%)`; g.fillRect(tv.x+i,tv.y+Math.sin((i+tv.timer)/10)*6 + 20,6,10); }
    }
  ];
}
initTV();
function drawTV(g){
  // tv body
  g.fillStyle='#111'; g.fillRect(tv.x-6,tv.y-8,tv.w+12,tv.h+18);
  g.strokeStyle='#fff'; g.strokeRect(tv.x-6,tv.y-8,tv.w+12,tv.h+18);
  // screen
  g.fillStyle='#000'; g.fillRect(tv.x,tv.y,tv.w,tv.h);
  // draw current channel
  const ch = tv.channels[tv.channel%tv.channels.length];
  if(ch) ch(g);
  // small antenna
  g.strokeStyle='#fff'; g.beginPath(); g.moveTo(tv.x + tv.w - 12, tv.y - 6); g.lineTo(tv.x + tv.w + 6, tv.y - 24); g.stroke();
  // channel timer update
  tv.timer++;
  if(tv.timer % 180 === 0) tv.channel = (tv.channel + 1) % tv.channels.length;
}

/* allow clicking TV to change channel */
if(canvasWrap){
  canvasWrap.addEventListener('click', (e)=>{
    const r = canvasWrap.getBoundingClientRect();
    const mx = e.clientX - r.left; const my = e.clientY - r.top;
    // scale detection: canvasWrap might be scaled; map to 800x600
    const scaleX = canvas.width / r.width; const scaleY = canvas.height / r.height;
    const cx = mx * scaleX; const cy = my * scaleY;
    if(cx >= tv.x-6 && cx <= tv.x-6+tv.w+12 && cy >= tv.y-8 && cy <= tv.y-8+tv.h+18){
      tv.channel = (tv.channel+1) % tv.channels.length;
      playSound('click');
    }
  });
}

/* ---------- HEAT DISTORTION AROUND CAKE ---------- */
/* Simple approach: when secretMode off -> small ripple; when secretMode on -> stronger warp */
function applyHeatWarp(srcCtx, destCtx, warpStrength=6, area={x:360,y:240,w:96,h:72}){
  // crude vertical offsets using sine waves for pixels within area: draw src into temp and sample rows
  const sx = area.x, sy = area.y, sw = area.w, sh = area.h;
  const img = srcCtx.getImageData(sx,sy,sw,sh);
  const out = destCtx.createImageData(sw,sh);
  for(let y=0;y<sh;y++){
    const offset = Math.round(Math.sin((y/6) + (lightBlink/10)) * (warpStrength * Math.sin(y/8)));
    for(let x=0;x<sw;x++){
      const sxp = clamp(x + offset, 0, sw-1);
      const si = (y*sw + x)*4;
      const ssi = (y*sw + sxp)*4;
      out.data[si] = img.data[ssi];
      out.data[si+1] = img.data[ssi+1];
      out.data[si+2] = img.data[ssi+2];
      out.data[si+3] = img.data[ssi+3];
    }
  }
  destCtx.putImageData(out, sx, sy);
}

/* ---------- MINI PET (follow mouse) ---------- */
const pet = { x: 420, y: 380, tx:420, ty:380, vx:0, vy:0, frame:0, timer:0, state:'idle' };
let mousePos = { x:400, y:300 };
if(canvasWrap){
  canvasWrap.addEventListener('mousemove',(e)=>{
    const r=canvasWrap.getBoundingClientRect();
    const mx = e.clientX - r.left; const my = e.clientY - r.top;
    const scaleX = canvas.width / r.width; const scaleY = canvas.height / r.height;
    mousePos.x = mx * scaleX; mousePos.y = my * scaleY;
  });
}
function updateAndDrawPet(){
  // pet follows mouse slowly
  pet.tx = lerp(pet.tx, mousePos.x, 0.06);
  pet.ty = lerp(pet.ty, mousePos.y, 0.06);
  pet.x = lerp(pet.x, pet.tx, 0.12);
  pet.y = lerp(pet.y, pet.ty, 0.12);
  pet.timer++; if(pet.timer>10){ pet.timer=0; pet.frame=(pet.frame+1)%2; }
  // draw simple pet pixel (slime)
  const x = Math.round(pet.x), y = Math.round(pet.y);
  const px = 3;
  ctx.fillStyle = '#8ee48e';
  ctx.fillRect(x, y, px*6, px*4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x+px, y+px, px, px);
  ctx.fillRect(x+px*4, y+px, px, px);
}

/* ---------- KONAMI SECRET CODE ---------- */
const konami = [38,38,40,40,37,39,37,39,66,65];
let konamiProgress = 0;
window.addEventListener('keydown', (e)=>{
  if(cinematicPlaying) return;
  if(e.keyCode === konami[konamiProgress]){ konamiProgress++; if(konamiProgress === konami.length){ konamiProgress=0; secretMode = !secretMode; playSound('coin'); alert('secret mode ' + (secretMode ? 'activated' : 'deactivated')); } } else konamiProgress = 0;
});

/* ---------- PIXELATED "HEARTS ON HOVER" hookup ---------- */
function wireHoverHearts(){
  const buttons = document.querySelectorAll('button, .pixel-btn, .pixel-select');
  buttons.forEach(b=>{
    if(b._heartWired) return; b._heartWired=true;
    b.addEventListener('mouseenter',(ev)=>{ const r=b.getBoundingClientRect(); const cx = r.left + r.width/2; const cy = r.top + r.height/2; // map to canvas coords if inside canvasWrap
      const cr = canvasWrap.getBoundingClientRect(); const scaleX = canvas.width / cr.width; const scaleY = canvas.height / cr.height; const tx = (cx - cr.left) * scaleX; const ty = (cy - cr.top) * scaleY; emitHeartsAt(tx,ty,8); });
  });
}
document.addEventListener('DOMContentLoaded',()=> setTimeout(wireHoverHearts,400));

/* ---------- PIXEL WALKERS STEPS SOUND ---------- */
let stepTimer=0;

/* ---------- DRAW SCENE MAIN LOOP ---------- */
function drawScene(){
  if(cinematicPlaying) return; // cinematic handles reveal
  // clear
  ctx.clearRect(0,0,800,600);
  // background
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,800,600);

  // clouds (behind)
  updateAndDrawClouds();

  // tv (behind header)
  drawTV(ctx);

  // spotlight
  updateAndDrawSpotlight();

  // header text
  ctx.fillStyle = '#fff'; ctx.font = '18px monospace'; ctx.fillText('HAPPY BIRTHDAY FATIH!', 280, 80);

  // dancers
  updateAndDrawDancers();

  // cake (draw on an offscreen temporary for possible warp)
  const tmp = document.createElement('canvas'); tmp.width = 800; tmp.height = 600; const tctx = tmp.getContext('2d'); tctx.imageSmoothingEnabled = false;
  // draw cake into tctx
  drawPixelSpriteToCtx(tctx, cakeData, 360, 240, 12);
  // draw other persistent shapes around cake on tctx if desired
  // copy tctx into main ctx and apply warp locally
  ctx.drawImage(tmp,0,0);

  // APPLY HEAT WARP around cake area (if secretMode stronger)
  const warpStrength = secretMode ? 12 : 6;
  // We'll sample cake rectangle and re-put; a simplified method: get cake area from ctx and write warped version
  try{
    const area = { x: 360, y: 240, w: 96, h: 60 };
    applyHeatWarp(ctx, ctx, warpStrength, area);
  }catch(e){ /* ignore if cross-origin or any issues */ }

  // smiley and made with fatih footer below cake
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';
  const smile = ':)';
  const smileW = ctx.measureText(smile).width;
  ctx.fillText(smile, 400 - smileW/2, 360);
  ctx.font = '9px "Press Start 2P", monospace';
  const footer = 'made with fatih';
  const fw = ctx.measureText(footer).width;
  ctx.fillText(footer, 400 - fw/2, 396);
  ctx.restore();

  // placeholder characters
  ctx.fillStyle = '#fff'; ctx.fillRect(250,320,28,56); ctx.fillRect(520,320,28,56);

  // walkers + npcs
  updateAndDrawWalkers();
  updateAndDrawNPCs();

  // pet
  updateAndDrawPet();

  // birds
  for(let i=birds.length-1;i>=0;i--){ const b=birds[i]; b.update(); b.draw(ctx); if(b.x > 920) birds.splice(i,1); }

  // handle small step sound: play occasionally if walkers on screen
  stepTimer++; if(stepTimer > 90){ stepTimer = 0; playSound('step'); }

  // hearts drawing (effectCanvas draws particles)
  lightBlink++;
  requestAnimationFrame(drawScene);
}

/* ---------- EFFECTS DRAW LOOP (ectx) ---------- */
function drawEffects(){
  ectx.clearRect(0,0,800,600);

  // fireworks
  if (Math.random() < 0.02) spawnFirework();
  for(let i=fw_launchers.length-1;i>=0;i--){ const L=fw_launchers[i]; L.update(); L.draw(ectx); if(L.exploded){ const sparks=18+Math.floor(rand(6,20)); for(let k=0;k<sparks;k++){ const angle = rand(0,Math.PI*2); const speed = rand(1.6,4.2); fw_sparks.push(new FireworkSpark(L.x, L.y, Math.cos(angle)*speed, Math.sin(angle)*speed, L.color)); } fw_launchers.splice(i,1); } }
  for(let i=fw_sparks.length-1;i>=0;i--){ const s=fw_sparks[i]; s.update(); s.draw(ectx); if(s.age > s.life) fw_sparks.splice(i,1); }

  // confetti
  for(let i=confetti.length-1;i>=0;i--){ const c=confetti[i]; c.update(); c.draw(ectx); if(c.age > c.life || c.y > 700) confetti.splice(i,1); }

  // balloons
  for(let i=balloons.length-1;i>=0;i--){ const b=balloons[i]; b.update(); b.draw(ectx); if(b.y < -80) balloons.splice(i,1); }

  // hearts
  for(let i=hearts.length-1;i>=0;i--){ const h=hearts[i]; h.update(); h.draw(ectx); if(h.age > h.life) hearts.splice(i,1); }

  // snow
  for(let i=0;i<snow.length;i++){ snow[i].update(); snow[i].draw(ectx); }

  requestAnimationFrame(drawEffects);
}

/* ---------- START / CINEMATIC INTRO ---------- */
function playCinematicThenStart(){
  if(cinematicPlaying) return;
  cinematicPlaying = true;
  // hide start screen, show black overlay, play quick intro text sequence
  const overlay = document.createElement('div'); overlay.className='cine-overlay'; Object.assign(overlay.style,{position:'fixed',left:0,top:0,width:'100%',height:'100%',background:'#000',color:'#fff',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',fontFamily:'monospace'}); document.body.appendChild(overlay);
  const lines = ['loading scene...','booting birthday engine...','press any key to continue'];
  let idx=0;
  const txt = document.createElement('div'); txt.style.fontSize='20px'; txt.style.letterSpacing='2px'; txt.textContent=lines[idx]; overlay.appendChild(txt);
  playSound('switch');
  const step = ()=>{ idx++; if(idx<lines.length){ txt.textContent = lines[idx]; playSound('click'); setTimeout(step, 900); } else { // wait for key or click
      txt.textContent = 'press any key'; const done = ()=>{ window.removeEventListener('keydown',done); overlay.remove(); cinematicPlaying=false; // start main loops
        startScreen.classList.add('hidden'); mainScene.classList.remove('hidden'); drawScene(); drawEffects(); playSound('coin'); }; window.addEventListener('keydown', done); overlay.addEventListener('click', done); } };
  setTimeout(step, 900);
}

/* ---------- UI HOOKS ---------- */
startBtn?.addEventListener('click', () => {
  playSound('click');
  // cinematic intro enabled: if user holds shift -> skip cinematic
  if(!window.event || !window.event.shiftKey) playCinematicThenStart(); else { startScreen.classList.add('hidden'); mainScene.classList.remove('hidden'); drawScene(); drawEffects(); }
});
startBtn?.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') e.preventDefault(), startBtn.click(); });

openLetterBtn.addEventListener('click', ()=>{ letterModal.classList.remove('hidden'); playSound('click'); });
closeLetterBtn.addEventListener('click', ()=>{ letterModal.classList.add('hidden'); playSound('click'); });
kirimBtn.addEventListener('click', ()=>{ const msg=birthdayMessage.value.trim(); if(!msg){ alert('Pesan kosong'); return; } window.location.href = `https://wa.me/6281511118515?text=${encodeURIComponent(msg)}`; spawnConfettiBurst(400,120); for(let i=0;i<3;i++) spawnFirework(300+i*80 + rand(-30,30)); letterModal.classList.add('hidden'); downloadBtn.classList.remove('hidden'); playSound('coin'); });

crtToggle.addEventListener('click', ()=>{ isCrtOn = !isCrtOn; document.body.classList.toggle('crt-on', isCrtOn); playSound('click'); });

photoBoothBtn.addEventListener('click', async ()=>{ photoboothModal.classList.remove('hidden'); ensurePhotoUI_simple(); await startCamera(); playSound('click'); });
closePhotoBtn.addEventListener('click', ()=>{ photoboothModal.classList.add('hidden'); stopCamera(); playSound('click'); });
takePhotoBtn.addEventListener('click', async ()=>{ takePhotoBtn.disabled=true; await captureAndDownload(); setTimeout(()=>{ photoboothModal.classList.add('hidden'); stopCamera(); takePhotoBtn.disabled=false; },700); playSound('snap'); });

/* double-click fallback snapshot */
document.getElementById('photo-booth-btn')?.addEventListener('dblclick', ()=>{
  canvas.toBlob(b=>{ const a=document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'snapshot.png'; a.click(); URL.revokeObjectURL(a.href); playSound('snap'); });
});

/* ---------- INITIALIZATION ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // do NOT auto-hide start screen; prepare background loops and UI
  resizeCanvas();
  initWalkers(); initDancers(); initClouds();
  drawEffects();
  ensureMusicUI();
  wireHoverHearts();
});

/* ---------- STYLE INJECTION (some CSS for cinematic, polaroid, buttons) ---------- */
(function injectStyles(){
  const s = document.createElement('style');
  s.textContent = `
    .pixel-btn { background:#111;border:1px solid #fff;color:#fff;padding:6px 8px;font-family:monospace;border-radius:6px;cursor:pointer }
    .pixel-select { background:#111;color:#fff;border:1px solid #fff;padding:6px;font-family:monospace;border-radius:6px }
    .polaroid-print img { image-rendering: pixelated; }
    .music-controls .pixel-btn { font-size:14px; width:44px; height:30px; display:inline-flex; align-items:center; justify-content:center; }
    .polaroid-print { image-rendering: pixelated; }
    .cine-overlay { backdrop-filter: blur(0.8px); }
  `;
  document.head.appendChild(s);
})();

/* ---------- NOTES ----------
 - This file is purposely self-contained and uses simple public sound URLs.
 - If audio fails due to CORS/autoplay, user interaction (press start) usually enables it.
 - If performance issues on low-end devices: reduce SNOW count, reduce fireworks spawn, or reduce NPCs/balloons.
 - To change music: replace MUSIC_URL at top.
--------------------------------- */