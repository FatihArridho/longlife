/* ========================
   script.js (full — include start screen fix + MP3 music)
   - clean photobooth capture (no sparkle/confetti in downloaded photo)
   - pixelate option, camera switch, face detection preview
   - main canvas: cake, smiley, "made with fatih"
   - effects: fireworks, confetti, snow (visual only)
   - walkers (right->left) under cake
   - dancers (top-left + top-right)
   - clouds background, npc cats/dogs
   - spotlight header
   - music via MP3 URL (play/pause/mute/volume)
   - photobooth frames + filters + polaroid printer animation + auto-download
   - NPC/dancer/walker chat bubbles
   ======================== */

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

/* ---------- UTIL ---------- */
function rand(a,b){ return Math.random()*(b-a)+a; }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

/* ---------- RESIZE FIX ---------- */
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

/* ---------- PIXEL ART (cake, smile, footer) ---------- */
function drawPixelSprite(data, x, y, scale = 1){
  const palette = ['#ff0000','#0000ff','#ffff00','#00ff00','#800080','#ffa500','#ffffff','#000000'];
  for(let r=0;r<data.length;r++){
    for(let c=0;c<data[r].length;c++){
      const v = data[r][c];
      if (v !== null && v !== undefined) {
        ctx.fillStyle = palette[v % palette.length];
        ctx.fillRect(x + c*scale, y + r*scale, scale, scale);
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

let lightBlink = 0;

/* ---------- CLOUDS (background, behind header) ---------- */
const clouds = [];
const CLOUD_COUNT = 4;
function initClouds(){
  clouds.length = 0;
  for (let i=0;i<CLOUD_COUNT;i++){
    clouds.push({
      x: rand(-200, 900),
      y: rand(20, 110),
      speed: rand(0.2, 0.6),
      scale: Math.floor(rand(1,2))
    });
  }
}
initClouds();
function drawCloud(ctx, x, y, s){
  const px = 6 * s;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(x, y+px, px*4, px*2);
  ctx.fillRect(x - px*1, y, px*3, px*2);
  ctx.fillRect(x + px*3, y, px*3, px*2);
}
function updateAndDrawClouds(){
  for (const c of clouds){
    c.x += c.speed;
    if (c.x > 900) c.x = -240 - rand(0,200);
    drawCloud(ctx, Math.round(c.x), Math.round(c.y), c.scale);
  }
}

/* ---------- SPOTLIGHT (header lampu panggung) ---------- */
const spotlight = { x: 0, y: 50, dir: 1, minX: 80, maxX: 720, speed: 1.0, hue: 200, hueDir: 1 };
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
  ctx.fillStyle = `hsla(${Math.floor(spotlight.hue)}, 100%, 75%, 0.12)`;
  ctx.beginPath();
  ctx.arc(spotlight.x, spotlight.y+30, 36, 0, Math.PI*2);
  ctx.fill();
}

/* ---------- DANCERS (top left + right) ---------- */
const dancers = [];
function initDancers() {
  dancers.length = 0;
  const leftX = 120, rightX = 630;
  const y = 62;
  const colors = ['#ff6b6b','#ffd166','#6bcB77','#7ec8ff','#d291ff'];
  for (let i=0;i<2;i++){
    dancers.push({ x: leftX + i*28, y: y + (i%2===0?0:2), originX: leftX + i*28, originY: y + (i%2===0?0:2), frame: Math.floor(Math.random()*4), timer: Math.floor(Math.random()*10), color: colors[i % colors.length], flip:false, jumpTimer:0, bubble:null });
  }
  for (let i=0;i<2;i++){
    dancers.push({ x: rightX + i*28, y: y + (i%2===0?0:2), originX: rightX + i*28, originY: y + (i%2===0?0:2), frame: Math.floor(Math.random()*4), timer: Math.floor(Math.random()*10), color: colors[(i+2) % colors.length], flip:true, jumpTimer:0, bubble:null });
  }
}
initDancers();

function drawDancerSmall(ctx, x, y, color, frame, flip=false, jump=0) {
  const px = 2;
  const jy = -Math.max(0, jump);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 2*px, y + 0*px + jy, 2*px, 2*px);
  ctx.fillStyle = color;
  ctx.fillRect(x + 2*px, y + 2*px + jy, 2*px, 3*px);
  ctx.fillStyle = color;
  if (frame === 0) { ctx.fillRect(x + px*1, y + 3*px + jy, px, 2*px); ctx.fillRect(x + px*4, y + 3*px + jy, px, 2*px); }
  else if (frame === 1) { ctx.fillRect(x + px*1, y + 1*px + jy, px, 2*px); ctx.fillRect(x + px*4, y + 1*px + jy, px, 2*px); }
  else if (frame === 2) { ctx.fillRect(x + px*1, y + 3*px + jy, px, 2*px); ctx.fillRect(x + px*4, y + 1*px + jy, px, 2*px); }
  else { ctx.fillRect(x + px*1, y + 1*px + jy, px, 2*px); ctx.fillRect(x + px*4, y + 3*px + jy, px, 2*px); }
  ctx.fillStyle = '#ffffff';
  if (frame % 2 === 0) { ctx.fillRect(x + 2*px, y + 5*px + jy, px, 2*px); ctx.fillRect(x + 3*px, y + 5*px + jy, px, 2*px); }
  else { ctx.fillRect(x + 1*px, y + 5*px + jy, px, 2*px); ctx.fillRect(x + 4*px, y + 5*px + jy, px, 2*px); }
  ctx.fillStyle = '#000000'; ctx.fillRect(x + 2*px, y + 1*px + jy, 1*px, 1*px);
}

function updateAndDrawDancers() {
  for (const d of dancers) {
    d.timer++;
    if (d.timer > 8) {
      d.timer = 0;
      d.frame = (d.frame + 1) % 4;
      if (Math.random() < 0.06 && d.jumpTimer <= 0) d.jumpTimer = 8 + Math.floor(Math.random()*12);
      if (!d.bubble && Math.random() < 0.03) {
        d.bubble = { text: randomBubbleText(), t: 130 };
      }
    }
    let jumpOffset = 0;
    if (d.jumpTimer > 0) {
      const progress = d.jumpTimer;
      jumpOffset = Math.sin((progress/ (8 + 6)) * Math.PI) * 6;
      d.jumpTimer--;
    }
    drawDancerSmall(ctx, Math.round(d.x), Math.round(d.y - jumpOffset), d.color, d.frame, d.flip, jumpOffset);
    if (d.bubble) {
      drawBubble(ctx, Math.round(d.x + 6), Math.round(d.y - 10), d.bubble.text, d.bubble.t);
      d.bubble.t--;
      if (d.bubble.t <= 0) d.bubble = null;
    }
  }
}

/* ---------- WALKER (people walking under cake) ---------- */
const walkers = [];
const WALKER_COUNT = 4;
function createWalker(startX, y, speed, scale=1.0) { return { x: startX, y, speed, scale, frameTimer: 0, frameIndex: 0, bubble:null }; }
function initWalkers() {
  walkers.length = 0;
  const baseY = 440;
  for (let i = 0; i < WALKER_COUNT; i++) {
    const gap = 140;
    const startX = 900 + i * gap + rand(0, 80);
    const speed = rand(0.6, 1.6);
    const scale = 2;
    walkers.push(createWalker(startX, baseY, speed, scale));
  }
}
initWalkers();

function drawWalker(ctx, x, y, scale, frameIndex) {
  const px = scale;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 2*px, y + 0*px, 2*px, 2*px);
  ctx.fillRect(x + 2*px, y + 2*px, 2*px, 3*px);
  ctx.fillRect(x + 1*px, y + 2*px, 1*px, 2*px);
  ctx.fillRect(x + 4*px, y + 2*px, 1*px, 2*px);
  if (frameIndex % 2 === 0) { ctx.fillRect(x + 2*px, y + 5*px, 1*px, 2*px); ctx.fillRect(x + 3*px, y + 5*px, 1*px, 2*px); }
  else { ctx.fillRect(x + 1*px, y + 5*px, 1*px, 2*px); ctx.fillRect(x + 4*px, y + 5*px, 1*px, 2*px); }
  ctx.fillStyle = '#000000'; ctx.fillRect(x + 2*px, y + 1*px, 1*px, 1*px);
}

function updateAndDrawWalkers() {
  for (const w of walkers) {
    w.x -= w.speed;
    w.frameTimer++;
    if (w.frameTimer > (12 - Math.floor(w.speed*4))) {
      w.frameTimer = 0;
      w.frameIndex = (w.frameIndex + 1) % 2;
      if (!w.bubble && Math.random() < 0.02) w.bubble = { text: randomBubbleText(), t: 80 };
    }
    if (w.x < -40) {
      w.x = 820 + rand(0, 240);
      w.speed = rand(0.6, 1.6);
      w.frameIndex = 0;
    }
    drawWalker(ctx, Math.round(w.x), Math.round(w.y), Math.round(w.scale * 2), w.frameIndex);
    if (w.bubble) {
      drawBubble(ctx, Math.round(w.x), Math.round(w.y - 18), w.bubble.text, w.bubble.t);
      w.bubble.t--;
      if (w.bubble.t <= 0) w.bubble = null;
    }
  }
}

/* ---------- NPC (cats & dogs) - appear, run, sometimes sit & blink ---------- */
const npcs = [];
const NPC_TYPES = ['cat','dog'];
function spawnNPC(type='cat') {
  const yBase = 470;
  const speed = rand(1.4, 3.0);
  const startX = -60;
  const npc = { type, x: startX, y: yBase + (type==='cat' ? rand(-6,6) : rand(-4,8)), speed, state: 'running', frame: 0, timer: 0, blinkTimer: Math.floor(rand(60,240)), bubble:null };
  npcs.push(npc);
}
function drawNPC(ctx, n) {
  const px = 2;
  const x = Math.round(n.x), y = Math.round(n.y);
  const bodyColor = (n.type === 'cat') ? '#cfcfcf' : '#d4a373';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 1*px, y + 0*px, 3*px, 2*px);
  if (n.type === 'cat') { ctx.fillRect(x + 1*px, y - 1*px, 1*px, 1*px); ctx.fillRect(x + 3*px, y - 1*px, 1*px, 1*px); }
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 1*px, y + 2*px, 3*px, 2*px);
  if (n.type === 'cat') ctx.fillRect(x - 1*px, y + 2*px, 1*px, 1*px); else ctx.fillRect(x + 4*px, y + 2*px, 1*px, 1*px);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 1*px, y + 1*px, 1*px, 1*px);
  ctx.fillRect(x + 3*px, y + 1*px, 1*px, 1*px);
}
function updateAndDrawNPCs(){
  for (let i = npcs.length - 1; i >= 0; i--) {
    const n = npcs[i];
    n.timer++;
    if (n.state === 'running') {
      n.x += n.speed;
      if (Math.random() < 0.003 && n.x > 120 && n.x < 680) { n.state = 'sitting'; n.sitDuration = 80 + Math.floor(rand(0,140)); if (Math.random()<0.3) n.bubble = { text: randomBubbleText(), t: 140 }; }
    } else if (n.state === 'sitting') {
      n.sitDuration--;
      if (n.sitDuration <= 0) { n.state = 'running'; if (Math.random()<0.4) n.bubble = { text: randomBubbleText(), t: 90 }; }
    }
    n.blinkTimer--;
    if (n.blinkTimer <= 0) n.blinkTimer = Math.floor(rand(60,240));
    drawNPC(ctx, n);
    if (n.bubble) {
      drawBubble(ctx, Math.round(n.x + 10), Math.round(n.y - 14), n.bubble.text, n.bubble.t);
      n.bubble.t--; if (n.bubble.t<=0) n.bubble=null;
    }
    if (n.x > 920) npcs.splice(i,1);
  }
}
setInterval(() => { if (Math.random() < 0.25) spawnNPC(NPC_TYPES[Math.floor(Math.random()*NPC_TYPES.length)]); }, 1600);

/* ---------- CHAT BUBBLE UTIL ---------- */
function drawBubble(ctx, x, y, text, life) {
  const alpha = clamp(life / 140, 0, 1);
  const pad = 6;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '10px monospace';
  const w = Math.min(160, ctx.measureText(text).width + pad*2);
  const h = 18;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillRect(x - w/2, y - h, w, h);
  ctx.fillRect(x - 6, y - 6, 6, 6);
  ctx.fillStyle = '#000';
  ctx.fillText(text, x - w/2 + pad, y - 6);
  ctx.restore();
}
function randomBubbleText(){
  const msgs = ['happy bday!', 'woof woof', 'meong~', 'cake time!', 'party!', 'keren nih', 'sini foto!', 'yeay!', 'lets dance', '🎉'];
  return msgs[Math.floor(Math.random()*msgs.length)];
}

/* ---------- EFFECTS (visual only) ---------- */
/* Snow */
const snow = [];
class SnowFlake { constructor() { this.x = rand(0,800); this.y = rand(-600,0); this.vy = rand(0.4,1.2); this.vx = rand(-0.4,0.4); this.size = rand(1.2,3.2); } update(){ this.x += this.vx; this.y += this.vy; if (this.y > 620) { this.x = rand(0,800); this.y = rand(-80,-10); } } draw(g){ g.beginPath(); g.fillStyle='rgba(255,255,255,0.9)'; g.arc(this.x,this.y,this.size,0,Math.PI*2); g.fill(); } }
for (let i=0;i<120;i++) snow.push(new SnowFlake());

/* Fireworks & confetti (visual only) */
const fw_launchers = []; const fw_sparks = [];
class FireworkLauncher { constructor(x){ this.x = x ?? rand(80,720); this.y=600; this.vy=rand(-7.5,-5.5); this.vx=rand(-1.2,1.2); this.color = `hsl(${rand(0,360)},100%,50%)`; this.exploded=false; } update(){ if (!this.exploded){ this.x += this.vx; this.y += this.vy; this.vy += 0.18; if (this.vy >= -1.0) this.exploded = true; } } draw(g){ if (!this.exploded){ g.fillStyle = this.color; g.beginPath(); g.arc(this.x,this.y,3,0,Math.PI*2); g.fill(); } } }
class FireworkSpark { constructor(x,y,vx,vy,color){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.color=color; this.life=40 + Math.floor(rand(0,30)); this.age=0; } update(){ this.vy += 0.06; this.x += this.vx; this.y += this.vy; this.age++; } draw(g){ const alpha = Math.max(0,1 - this.age/this.life); g.globalAlpha = alpha; g.fillStyle = this.color; g.fillRect(this.x, this.y, 2, 2); g.globalAlpha = 1; } }
function spawnFirework(x){ fw_launchers.push(new FireworkLauncher(x)); }

const confetti = [];
class Confetto { constructor(x,y){ this.x=x; this.y=y; this.vx=rand(-1,1); this.vy=rand(2,5); this.w=rand(4,8); this.h=rand(2,5); this.color = `hsl(${rand(0,360)},100%,50%)`; this.rotation = rand(0,Math.PI*2); this.angular = rand(-0.2,0.2); this.life=120 + Math.floor(rand(0,80)); this.age=0; } update(){ this.x+=this.vx; this.y+=this.vy; this.vy+=0.04; this.rotation += this.angular; this.age++; } draw(g){ g.save(); g.translate(this.x,this.y); g.rotate(this.rotation); g.fillStyle=this.color; g.fillRect(-this.w/2,-this.h/2,this.w,this.h); g.restore(); } }
function spawnConfettiBurst(x,count=60){ for (let i=0;i<count;i++) confetti.push(new Confetto(x + rand(-20,20), rand(460,540))); }

function drawEffects(){
  ectx.clearRect(0,0,800,600);
  if (Math.random() < 0.02) spawnFirework();
  for (let i = fw_launchers.length - 1; i >= 0; i--){
    const L = fw_launchers[i]; L.update(); L.draw(ectx);
    if (L.exploded) { const sparks = 18 + Math.floor(rand(6,20)); for (let k=0;k<sparks;k++){ const angle = rand(0, Math.PI*2); const speed = rand(1.6,4.2); fw_sparks.push(new FireworkSpark(L.x, L.y, Math.cos(angle)*speed, Math.sin(angle)*speed, L.color)); } fw_launchers.splice(i,1); }
  }
  for (let i = fw_sparks.length - 1; i >= 0; i--){ const s = fw_sparks[i]; s.update(); s.draw(ectx); if (s.age > s.life) fw_sparks.splice(i,1); }
  for (let i = confetti.length - 1; i >= 0; i--){ const c = confetti[i]; c.update(); c.draw(ectx); if (c.age > c.life || c.y > 700) confetti.splice(i,1); }
  for (let i=0;i<snow.length;i++){ snow[i].update(); snow[i].draw(ectx); }
  requestAnimationFrame(drawEffects);
}

/* ---------- MUSIC: play mp3 URL (HTMLAudioElement) ---------- */
/* ganti MUSIC_URL dengan link mp3 kamu */
const MUSIC_URL = 'https://k.top4top.io/m_3628wytop1.mp3'; // contoh gratis
const audioPlayer = new Audio();
audioPlayer.src = MUSIC_URL;
audioPlayer.loop = true;
audioPlayer.volume = 0.06; // default low volume
audioPlayer.preload = 'auto';
const audioState = { on: false, muted: false };

function ensureMusicUI(){
  if (!canvasWrap) return;
  if (canvasWrap.querySelector('.music-controls')) return;
  const box = document.createElement('div');
  box.className = 'music-controls';
  box.style.position = 'absolute';
  box.style.right = '8px';
  box.style.top = '8px';
  box.style.zIndex = '60';
  box.style.display = 'flex';
  box.style.gap = '6px';

  const play = document.createElement('button');
  play.className = 'pixel-btn';
  play.title = 'play/pause music';
  play.style.width = '44px';
  play.style.height = '30px';
  play.textContent = '♫';
  play.onclick = async () => {
    try {
      if (!audioState.on) {
        await audioPlayer.play();
        audioState.on = true;
        play.textContent = '▮▮';
      } else {
        audioPlayer.pause();
        audioState.on = false;
        play.textContent = '♫';
      }
    } catch (err) {
      console.warn('audio play failed', err);
      alert('Gagal memutar audio — cek URL mp3 atau blokir autoplay browser.');
    }
  };

  const mute = document.createElement('button');
  mute.className = 'pixel-btn';
  mute.textContent = 'mute';
  mute.style.height = '30px';
  mute.onclick = () => {
    audioState.muted = !audioState.muted;
    audioPlayer.muted = audioState.muted;
    mute.textContent = audioState.muted ? 'unmute' : 'mute';
  };

  const vol = document.createElement('input');
  vol.type = 'range'; vol.min = '0'; vol.max = '1'; vol.step = '0.01'; vol.value = String(audioPlayer.volume);
  vol.style.width = '80px';
  vol.oninput = (e) => { audioPlayer.volume = parseFloat(e.target.value); };

  box.appendChild(play);
  box.appendChild(mute);
  box.appendChild(vol);

  canvasWrap.style.position = 'relative';
  canvasWrap.appendChild(box);
}

/* ---------- PHOTO BOOTH: camera + pixelate + switch camera + face detection + frames/filters + polaroid ---------- */
let mediaStream = null;
let facingMode = 'user';
let pixelateEnabled = false;

cameraEffectCanvas.width = 800; cameraEffectCanvas.height = 600;
const camECTX = cameraEffectCanvas.getContext('2d');
camECTX.imageSmoothingEnabled = false;

/* photobooth frames & filters */
const FRAME_OPTIONS = [
  { id: 'none', name: 'none', draw: (ctx,w,h)=>{} },
  { id: 'pixel-border', name: 'pixel border', draw: (ctx,w,h)=> {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.strokeRect(8,8,w-16,h-16);
      for (let i=0;i<6;i++){ ctx.fillRect(12 + i*8, 12, 4,4); ctx.fillRect(w - 16 - i*8, 12, 4,4); }
    } },
  { id: 'hearts', name: 'hearts', draw: (ctx,w,h)=> {
      for (let i=0;i<9;i++){ const x = 24 + i*80; ctx.fillStyle = 'rgba(255,100,140,0.9)'; ctx.fillRect(x, h-60, 6,6); ctx.fillRect(x+6, h-56, 6,6); }
    } },
  { id: 'vhs', name: 'vhs stripes', draw: (ctx,w,h)=> {
      for (let i=0;i<6;i++){ ctx.fillStyle = `rgba(255,255,255,${0.02 + i*0.02})`; ctx.fillRect(0, i*10, w, 2); }
    } }
];

const FILTERS = [
  { id:'normal', name:'normal', apply: (ctx,w,h)=>{} },
  { id:'sepia', name:'sepia', apply: (ctx,w,h)=> {
      const imgData = ctx.getImageData(0,0,w,h); const d = imgData.data;
      for (let i=0;i<d.length;i+=4){ const r=d[i], g=d[i+1], b=d[i+2];
        d[i] = clamp((r*0.393 + g*0.769 + b*0.189),0,255);
        d[i+1] = clamp((r*0.349 + g*0.686 + b*0.168),0,255);
        d[i+2] = clamp((r*0.272 + g*0.534 + b*0.131),0,255);
      } ctx.putImageData(imgData,0,0);
    } },
  { id:'bw', name:'b/w', apply: (ctx,w,h)=> {
      const imgData = ctx.getImageData(0,0,w,h); const d = imgData.data;
      for (let i=0;i<d.length;i+=4){ const v = (d[i]+d[i+1]+d[i+2])/3; d[i]=d[i+1]=d[i+2]=v; } ctx.putImageData(imgData,0,0);
    } }
];

let selectedFrameId = 'none';
let selectedFilterId = 'normal';

/* dynamic UI controls inside photobooth modal (frame/filter/pixelate/camera flip) */
function ensurePhotoUI(){
  const card = photoboothModal.querySelector('.pixel-card');
  if (!card) return;
  let extraRow = card.querySelector('.photobooth-extras');
  if (extraRow) return;
  extraRow = document.createElement('div');
  extraRow.className = 'photobooth-extras';
  extraRow.style.marginTop = '10px';
  extraRow.style.display = 'flex';
  extraRow.style.gap = '8px';
  extraRow.style.justifyContent = 'center';
  extraRow.style.alignItems = 'center';

  const toggleCameraBtn = document.createElement('button');
  toggleCameraBtn.className = 'pixel-btn';
  toggleCameraBtn.style.padding = '6px 10px';
  toggleCameraBtn.textContent = 'GANTI KAMERA';
  toggleCameraBtn.addEventListener('click', async () => { facingMode = (facingMode === 'user') ? 'environment' : 'user'; await restartCamera(); });

  const pixelWrap = document.createElement('label');
  pixelWrap.style.display='flex'; pixelWrap.style.alignItems='center'; pixelWrap.style.gap='6px'; pixelWrap.style.fontSize='10px';
  const pixelCheckbox = document.createElement('input'); pixelCheckbox.type='checkbox'; pixelCheckbox.style.width='14px'; pixelCheckbox.style.height='14px';
  pixelCheckbox.addEventListener('change', (e)=>{ pixelateEnabled = e.target.checked; });
  const pixelLabel = document.createElement('span'); pixelLabel.style.fontSize='8px'; pixelLabel.style.fontFamily="'Press Start 2P', monospace"; pixelLabel.textContent='pixelate';
  pixelWrap.appendChild(pixelCheckbox); pixelWrap.appendChild(pixelLabel);

  const frameSelect = document.createElement('select');
  frameSelect.className = 'pixel-select';
  FRAME_OPTIONS.forEach(f => { const o = document.createElement('option'); o.value = f.id; o.textContent = f.name; frameSelect.appendChild(o); });
  frameSelect.value = selectedFrameId;
  frameSelect.addEventListener('change', e => { selectedFrameId = e.target.value; });

  const filterSelect = document.createElement('select');
  filterSelect.className = 'pixel-select';
  FILTERS.forEach(f => { const o = document.createElement('option'); o.value = f.id; o.textContent = f.name; filterSelect.appendChild(o); });
  filterSelect.value = selectedFilterId;
  filterSelect.addEventListener('change', e => { selectedFilterId = e.target.value; });

  extraRow.appendChild(toggleCameraBtn);
  extraRow.appendChild(pixelWrap);
  extraRow.appendChild(frameSelect);
  extraRow.appendChild(filterSelect);

  const actions = card.querySelector('.modal-actions');
  card.insertBefore(extraRow, actions);
}

/* FaceDetector usage if available */
let faceDetector = null, faceDetectionEnabled = false;
if ('FaceDetector' in window) {
  try { faceDetector = new FaceDetector({ fastMode: true, maxDetectedFaces: 5 }); faceDetectionEnabled = true; } catch(e){ faceDetector=null; faceDetectionEnabled=false; console.warn(e); }
}

/* start / restart / stop camera */
async function startCamera(){
  try {
    ensurePhotoUI();
    stopCamera();
    const constraints = { video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraVideo.srcObject = mediaStream;
    await cameraVideo.play();
    requestAnimationFrame(drawCameraPreviewAndDetect);
  } catch (err) {
    console.warn('camera error', err);
    alert('Tidak bisa mengakses kamera. Pastikan izin kamera diberikan dan perangkat mendukung.');
    stopCamera();
    photoboothModal.classList.add('hidden');
  }
}
async function restartCamera(){ stopCamera(); await new Promise(r=>setTimeout(r,180)); await startCamera(); }
function stopCamera(){ if (mediaStream) { mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; } cameraVideo.pause(); cameraVideo.srcObject=null; camECTX.clearRect(0,0,800,600); }

/* preview + face detect loop */
let lastDetectionTime = 0;
async function drawCameraPreviewAndDetect(timestamp){
  camECTX.clearRect(0,0,800,600);
  camECTX.fillStyle = 'rgba(0,0,0,0.06)'; camECTX.fillRect(0,0,800,600);
  const vw = cameraVideo.videoWidth, vh = cameraVideo.videoHeight;
  if (vw && vh) {
    const scale = Math.max(800 / vw, 600 / vh);
    const sw = 800 / scale, sh = 600 / scale, sx = (vw - sw)/2, sy = (vh - sh)/2;
    camECTX.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, 800, 600);
  }
  if (faceDetectionEnabled && faceDetector && (timestamp - lastDetectionTime > 150)) {
    try {
      const detectCanvas = document.createElement('canvas');
      detectCanvas.width = 320;
      detectCanvas.height = Math.floor((cameraVideo.videoHeight / cameraVideo.videoWidth) * 320) || 240;
      const dctx = detectCanvas.getContext('2d');
      const vw2 = cameraVideo.videoWidth, vh2 = cameraVideo.videoHeight;
      const scale2 = Math.max(320 / vw2, detectCanvas.height / vh2);
      const sw = 320 / scale2; const sh = detectCanvas.height / scale2;
      const sx = Math.max(0, (vw2 - sw) / 2); const sy = Math.max(0, (vh2 - sh) / 2);
      dctx.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, 320, detectCanvas.height);
      const faces = await faceDetector.detect(detectCanvas);
      lastDetectionTime = timestamp;
      const scaleX = 800 / 320; const scaleY = 600 / detectCanvas.height;
      camECTX.lineWidth = 2; camECTX.strokeStyle = 'rgba(0,255,128,0.9)'; camECTX.fillStyle = 'rgba(0,255,128,0.9)';
      faces.forEach((f,i)=>{ const b=f.boundingBox; const x=b.x*scaleX, y=b.y*scaleY, w=b.width*scaleX, h=b.height*scaleY; camECTX.strokeRect(x,y,w,h); camECTX.font='12px monospace'; camECTX.fillText(`face ${i+1}`, x+4,y+14); });
    } catch (err) { console.warn('face detection error', err); faceDetectionEnabled=false; }
  }
  if (!photoboothModal.classList.contains('hidden')) requestAnimationFrame(drawCameraPreviewAndDetect);
  else camECTX.clearRect(0,0,800,600);
}

/* photobooth capture pipeline */
async function captureAndDownload(){
  const vw = cameraVideo.videoWidth, vh = cameraVideo.videoHeight;
  if (!vw || !vh) { alert('Video belum siap, coba lagi'); return; }
  const out = document.createElement('canvas'); out.width = 800; out.height = 600;
  const outCtx = out.getContext('2d');
  const scale = Math.max(800 / vw, 600 / vh);
  const sw = 800 / scale; const sh = 600 / scale; const sx = (vw - sw) / 2; const sy = (vh - sh) / 2;
  if (pixelateEnabled) {
    const pixelFactor = 16;
    const tinyW = Math.max(1, Math.floor(800 / pixelFactor));
    const tinyH = Math.max(1, Math.floor(600 / pixelFactor));
    const tiny = document.createElement('canvas'); tiny.width = tinyW; tiny.height = tinyH;
    const tctx = tiny.getContext('2d');
    tctx.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, tinyW, tinyH);
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(tiny, 0, 0, tinyW, tinyH, 0, 0, 800, 600);
  } else {
    outCtx.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, 800, 600);
  }

  // apply filter
  const filter = FILTERS.find(f => f.id === selectedFilterId);
  if (filter && filter.apply) filter.apply(outCtx, 800, 600);

  // draw selected frame
  const frame = FRAME_OPTIONS.find(f => f.id === selectedFrameId);
  if (frame && frame.draw) frame.draw(outCtx, 800, 600);

  // add footer
  outCtx.save();
  outCtx.fillStyle = '#ffffff';
  outCtx.font = '9px "Press Start 2P", monospace';
  outCtx.textBaseline = 'bottom';
  const footerText = 'made with fatih';
  const footerW = outCtx.measureText(footerText).width;
  outCtx.fillText(footerText, (800 - footerW) / 2, 600 - 10);
  outCtx.restore();

  // border
  outCtx.strokeStyle = '#ffffff'; outCtx.lineWidth = 4; outCtx.strokeRect(8,8,800-16,600-16);

  // create image data url
  const dataURL = out.toDataURL('image/png');

  // show polaroid animation (visual) then download
  showPolaroidAnimation(dataURL);

  // auto-download
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `birthday_selfie_${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');

  // small camera flash
  camECTX.fillStyle = 'rgba(255,255,255,0.06)';
  camECTX.fillRect(0,0,800,600);
  setTimeout(()=> camECTX.clearRect(0,0,800,600), 40);
}

/* polaroid animation */
function showPolaroidAnimation(dataURL){
  const el = document.createElement('div');
  el.className = 'polaroid-print';
  Object.assign(el.style, {
    position: 'fixed', left: '50%', top: '-320px', transform: 'translateX(-50%) rotate(-6deg)',
    width: '320px', height: '240px', background:'#222', padding: '10px', boxSizing:'border-box',
    display:'flex', alignItems:'flex-start', justifyContent:'center', zIndex:9999, borderRadius:'6px', boxShadow:'0 10px 30px rgba(0,0,0,0.6)'
  });
  const img = document.createElement('img');
  img.src = dataURL;
  img.style.width = '100%'; img.style.height = 'auto'; img.style.display='block'; img.style.borderRadius='3px';
  el.appendChild(img);
  document.body.appendChild(el);
  el.animate([
    { top: '-320px', transform: 'translateX(-50%) rotate(-6deg)', opacity: 0 },
    { top: '80px', transform: 'translateX(-50%) rotate(4deg)', opacity: 1 },
    { top: '60px', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 }
  ], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)' });
  setTimeout(()=> {
    el.animate([{ transform:'translateX(-50%) rotate(0deg) translateX(0)' }, { transform:'translateX(-400%) rotate(-20deg) translateX(0)' }], { duration: 700, easing: 'ease-in' });
    setTimeout(()=> el.remove(), 900);
  }, 2800);
}

/* ---------- MAIN DRAW LOOP ---------- */
function drawScene(){
  ctx.clearRect(0,0,800,600);
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,800,600);

  // clouds
  updateAndDrawClouds();

  // spotlight + header
  updateAndDrawSpotlight();
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText('HAPPY BIRTHDAY FATIH!', 280, 80);

  // dancers (top)
  updateAndDrawDancers();

  // cake sprite
  drawPixelSprite(cakeData, 360, 240, 12);

  // smiley + footer
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
  ctx.fillStyle = '#fff'; ctx.fillRect(250, 320, 28, 56); ctx.fillRect(520, 320, 28, 56);

  // walkers & npcs
  updateAndDrawWalkers();
  updateAndDrawNPCs();

  // small blinking lights
  if (lightBlink % 40 < 20) { ctx.fillStyle = '#ff0'; ctx.fillRect(100,100,8,8); ctx.fillRect(692,100,8,8); }

  lightBlink++;
  requestAnimationFrame(drawScene);
}

/* ---------- BASIC INTERACTIONS ---------- */
startBtn?.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  mainScene.classList.remove('hidden');
  // start main loop
  drawScene();
  drawEffects();
});

startBtn?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), startBtn.click(); });

/* modal open/close */
openLetterBtn.addEventListener('click', () => letterModal.classList.remove('hidden'));
closeLetterBtn.addEventListener('click', () => letterModal.classList.add('hidden'));

/* kirim (WA) */
kirimBtn.addEventListener('click', () => {
  const msg = birthdayMessage.value.trim();
  if (!msg) { alert('Pesan tidak boleh kosong!'); return; }
  window.location.href = `https://wa.me/6281511118515?text=${encodeURIComponent(msg)}`;
  spawnConfettiBurst(400, 120);
  for (let i=0;i<3;i++) spawnFirework(300 + i*80 + rand(-30,30));
  letterModal.classList.add('hidden');
  downloadBtn.classList.remove('hidden');
});

/* CRT toggle */
crtToggle.addEventListener('click', () => { isCrtOn = !isCrtOn; document.body.classList.toggle('crt-on', isCrtOn); });

/* ---------- PHOTO BOOTH UI hooks ---------- */
photoBoothBtn.addEventListener('click', async () => { photoboothModal.classList.remove('hidden'); ensurePhotoUI(); await startCamera(); });
closePhotoBtn.addEventListener('click', () => { photoboothModal.classList.add('hidden'); stopCamera(); });
takePhotoBtn.addEventListener('click', async () => { takePhotoBtn.disabled=true; await captureAndDownload(); setTimeout(()=>{ photoboothModal.classList.add('hidden'); stopCamera(); takePhotoBtn.disabled=false; },700); });

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  photoBoothBtn.addEventListener('click', () => alert('Kamera tidak tersedia di perangkat ini.'));
}

/* double-click snapshot fallback */
document.getElementById('photo-booth-btn')?.addEventListener('dblclick', () => {
  canvas.toBlob(b => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'snapshot.png';
    a.click();
    URL.revokeObjectURL(a.href);
  });
});

/* helper wrappers */
function spawnConfettiBurst(x,count=60){ for (let i=0;i<count;i++) confetti.push(new Confetto(x + rand(-20,20), rand(460,540))); }
function spawnFirework(x){ fw_launchers.push(new FireworkLauncher(x ?? rand(80,720))); }

/* ---------- STARTUP (do NOT auto-hide start screen) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // tetap tunjukkan startScreen; pengguna harus klik start
  resizeCanvas();
  initWalkers();
  initDancers();
  initClouds();
  drawEffects(); // background effects can run
  ensureMusicUI(); // music controls ready (manual play)
  // drawScene will be started when user klik start (handler di atas)
});

/* ---------- EXTRA: small CSS insert for polaroid & music UI (inject) ---------- */
(function injectStyles(){
  const s = document.createElement('style');
  s.textContent = `
    .pixel-btn { background:#111;border:1px solid #fff;color:#fff;padding:6px 8px;font-family:monospace;border-radius:6px;cursor:pointer }
    .pixel-select { background:#111;color:#fff;border:1px solid #fff;padding:6px;font-family:monospace;border-radius:6px }
    .polaroid-print img { image-rendering: pixelated; }
    .music-controls .pixel-btn { font-size:14px; width:44px; height:30px; display:inline-flex; align-items:center; justify-content:center; }
    .polaroid-print { image-rendering: pixelated; }
  `;
  document.head.appendChild(s);
})();