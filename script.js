/* ========================
   script.js (capture clean: no sprinkle in photobooth capture)
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

const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

const effectCanvas = document.getElementById('effect-canvas');
const ectx = effectCanvas.getContext('2d');

let isCrtOn = false;

/* ---------- UTILS ---------- */
function rand(a,b){ return Math.random()*(b-a)+a; }

/* ---------- RESIZE FIX (prevent scale 0) ---------- */
function resizeCanvas(){
  const wrap = document.getElementById('canvas-wrap');
  const maxW = Math.min(window.innerWidth * 0.95, 800);
  const maxH = Math.min(window.innerHeight * 0.95, 600);
  const scale = Math.min(maxW / 800, maxH / 600);
  const intScale = Math.max(1, Math.floor(scale));
  wrap.style.width = (800 * intScale) + 'px';
  wrap.style.height = (600 * intScale) + 'px';
  canvas.width = 800; canvas.height = 600;
  effectCanvas.width = 800; effectCanvas.height = 600;
  ctx.imageSmoothingEnabled = false;
  ectx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ---------- PIXEL ART DRAW (cake + smile + footer text) ---------- */
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
function drawScene(){
  ctx.clearRect(0,0,800,600);
  // background
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,800,600);

  // banner text (pixel-like)
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText('HAPPY BIRTHDAY FATIH!', 280, 80);

  // cake sprite
  drawPixelSprite(cakeData, 360, 240, 12);

  // draw smiley ":)" below cake (centered)
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';
  const smile = ':)';
  const smileW = ctx.measureText(smile).width;
  ctx.fillText(smile, 400 - smileW/2, 360);

  // small "made with fatih" in pixel font below smile
  ctx.font = '9px "Press Start 2P", monospace';
  const footer = 'made with fatih';
  const fw = ctx.measureText(footer).width;
  ctx.fillText(footer, 400 - fw/2, 396);
  ctx.restore();

  // placeholder characters
  ctx.fillStyle = '#fff'; ctx.fillRect(250, 320, 28, 56); ctx.fillRect(520, 320, 28, 56);

  // blinking lights
  if (lightBlink % 40 < 20) {
    ctx.fillStyle = '#ff0'; ctx.fillRect(100,100,8,8); ctx.fillRect(692,100,8,8);
  }
  lightBlink++;
  requestAnimationFrame(drawScene);
}

/* ---------- EFFECTS (fireworks, confetti, snow) ---------- */
const snow = [];
class SnowFlake {
  constructor() { this.x = rand(0,800); this.y = rand(-600,0); this.vy = rand(0.4,1.2); this.vx = rand(-0.4,0.4); this.size = rand(1.2,3.2); }
  update(){ this.x += this.vx; this.y += this.vy; if (this.y > 620) { this.x = rand(0,800); this.y = rand(-80,-10); } }
  draw(g){ g.beginPath(); g.fillStyle='rgba(255,255,255,0.9)'; g.arc(this.x,this.y,this.size,0,Math.PI*2); g.fill(); }
}
for (let i=0;i<120;i++) snow.push(new SnowFlake());

const fw_launchers = [];
const fw_sparks = [];
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
    const L = fw_launchers[i];
    L.update();
    L.draw(ectx);
    if (L.exploded) {
      const sparks = 18 + Math.floor(rand(6,20));
      for (let k=0;k<sparks;k++){
        const angle = rand(0, Math.PI*2);
        const speed = rand(1.6,4.2);
        fw_sparks.push(new FireworkSpark(L.x, L.y, Math.cos(angle)*speed, Math.sin(angle)*speed, L.color));
      }
      fw_launchers.splice(i,1);
    }
  }

  for (let i = fw_sparks.length - 1; i >= 0; i--){
    const s = fw_sparks[i];
    s.update(); s.draw(ectx);
    if (s.age > s.life) fw_sparks.splice(i,1);
  }

  for (let i = confetti.length - 1; i >= 0; i--){
    const c = confetti[i];
    c.update(); c.draw(ectx);
    if (c.age > c.life || c.y > 700) confetti.splice(i,1);
  }

  for (let i=0;i<snow.length;i++){ snow[i].update(); snow[i].draw(ectx); }

  requestAnimationFrame(drawEffects);
}

/* ---------- BASIC INTERACTIONS ---------- */
startBtn?.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  mainScene.classList.remove('hidden');
  drawScene(); drawEffects();
});
startBtn?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), startBtn.click(); });

document.addEventListener('DOMContentLoaded', () => {
  startScreen.classList.add('hidden');
  mainScene.classList.remove('hidden');
  resizeCanvas();
  drawScene();
  drawEffects();
});

/* modal open/close */
openLetterBtn.addEventListener('click', () => letterModal.classList.remove('hidden'));
closeLetterBtn.addEventListener('click', () => letterModal.classList.add('hidden'));

/* kirim */
kirimBtn.addEventListener('click', () => {
  const msg = birthdayMessage.value.trim();
  if (!msg) { alert('Pesan tidak boleh kosong!'); return; }
  window.location.href = `https://wa.me/6281511118515?text=${encodeURIComponent(msg)}`;
  spawnConfettiBurst(400, 120);
  for (let i=0;i<3;i++) spawnFirework(300 + i*80 + rand(-30,30));
  letterModal.classList.add('hidden');
  downloadBtn.classList.remove('hidden');
});

/* crt toggle */
crtToggle.addEventListener('click', () => { isCrtOn = !isCrtOn; document.body.classList.toggle('crt-on', isCrtOn); });

/* ---------- PHOTO BOOTH: camera + pixelate + switch camera + face detection ---------- */

let mediaStream = null;
let facingMode = 'user'; // 'user' or 'environment'
let pixelateEnabled = false;

// camera effect canvas logical size
cameraEffectCanvas.width = 800; cameraEffectCanvas.height = 600;
const camECTX = cameraEffectCanvas.getContext('2d');
camECTX.imageSmoothingEnabled = false;

/* dynamic UI controls inside photobooth modal */
function ensurePhotoUI(){
  const card = photoboothModal.querySelector('.pixel-card');
  if (!card) return;
  let extraRow = card.querySelector('.photobooth-extras');
  if (extraRow) return; // already added

  extraRow = document.createElement('div');
  extraRow.className = 'photobooth-extras';
  extraRow.style.marginTop = '10px';
  extraRow.style.display = 'flex';
  extraRow.style.gap = '8px';
  extraRow.style.justifyContent = 'center';
  extraRow.style.alignItems = 'center';

  // toggle camera button
  const toggleCameraBtn = document.createElement('button');
  toggleCameraBtn.className = 'pixel-btn';
  toggleCameraBtn.style.padding = '6px 10px';
  toggleCameraBtn.textContent = 'GANTI KAMERA';
  toggleCameraBtn.addEventListener('click', async () => {
    facingMode = (facingMode === 'user') ? 'environment' : 'user';
    await restartCamera();
  });

  // pixelate checkbox
  const pixelWrap = document.createElement('label');
  pixelWrap.style.display = 'flex';
  pixelWrap.style.alignItems = 'center';
  pixelWrap.style.gap = '6px';
  pixelWrap.style.fontSize = '10px';
  pixelWrap.style.userSelect = 'none';

  const pixelCheckbox = document.createElement('input');
  pixelCheckbox.type = 'checkbox';
  pixelCheckbox.style.width = '14px';
  pixelCheckbox.style.height = '14px';
  pixelCheckbox.addEventListener('change', (e) => {
    pixelateEnabled = e.target.checked;
  });

  const pixelLabel = document.createElement('span');
  pixelLabel.style.fontSize = '8px';
  pixelLabel.style.fontFamily = "'Press Start 2P', monospace";
  pixelLabel.textContent = 'pixelate';

  pixelWrap.appendChild(pixelCheckbox);
  pixelWrap.appendChild(pixelLabel);

  extraRow.appendChild(toggleCameraBtn);
  extraRow.appendChild(pixelWrap);

  // insert before modal actions row
  const actions = card.querySelector('.modal-actions');
  card.insertBefore(extraRow, actions);
}

/* Face detection: use FaceDetector API if available */
let faceDetector = null;
let faceDetectionEnabled = false;
if ('FaceDetector' in window) {
  try {
    faceDetector = new FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
    faceDetectionEnabled = true;
    console.log('FaceDetector available');
  } catch (e) {
    faceDetector = null;
    faceDetectionEnabled = false;
    console.warn('FaceDetector init failed', e);
  }
} else {
  faceDetector = null;
  faceDetectionEnabled = false;
  console.log('FaceDetector not supported in this browser');
}

/* start camera with given facingMode */
async function startCamera(){
  try {
    ensurePhotoUI();
    stopCamera();
    const constraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
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

/* restart camera (used for switching facingMode) */
async function restartCamera(){
  stopCamera();
  await new Promise(r => setTimeout(r, 180));
  await startCamera();
}

function stopCamera(){
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  cameraVideo.pause();
  cameraVideo.srcObject = null;
  camECTX.clearRect(0,0,cameraEffectCanvas.width,cameraEffectCanvas.height);
}

/* draw preview + face detection boxes (no sparkles) */
let lastDetectionTime = 0;
async function drawCameraPreviewAndDetect(timestamp){
  camECTX.clearRect(0,0,800,600);
  camECTX.fillStyle = 'rgba(0,0,0,0.06)';
  camECTX.fillRect(0,0,800,600);

  if (faceDetectionEnabled && faceDetector && (timestamp - lastDetectionTime > 150)) {
    try {
      const detectCanvas = document.createElement('canvas');
      detectCanvas.width = 320;
      detectCanvas.height = Math.floor((cameraVideo.videoHeight / cameraVideo.videoWidth) * 320) || 240;
      const dctx = detectCanvas.getContext('2d');
      const vw = cameraVideo.videoWidth, vh = cameraVideo.videoHeight;
      const scale = Math.max(320 / vw, detectCanvas.height / vh);
      const sw = 320 / scale;
      const sh = detectCanvas.height / scale;
      const sx = Math.max(0, (vw - sw) / 2);
      const sy = Math.max(0, (vh - sh) / 2);
      dctx.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, 320, detectCanvas.height);

      const faces = await faceDetector.detect(detectCanvas);
      lastDetectionTime = timestamp;
      const scaleX = 800 / 320;
      const scaleY = 600 / detectCanvas.height;
      camECTX.lineWidth = 2;
      camECTX.strokeStyle = 'rgba(0,255,128,0.9)';
      camECTX.fillStyle = 'rgba(0,255,128,0.9)';
      faces.forEach((f, i) => {
        const b = f.boundingBox;
        const x = b.x * scaleX;
        const y = b.y * scaleY;
        const w = b.width * scaleX;
        const h = b.height * scaleY;
        camECTX.strokeRect(x, y, w, h);
        camECTX.font = '12px monospace';
        camECTX.fillText(`face ${i+1}`, x + 4, y + 14);
      });
    } catch (err) {
      console.warn('face detection error', err);
      faceDetectionEnabled = false;
    }
  }

  if (!photoboothModal.classList.contains('hidden')) {
    requestAnimationFrame(drawCameraPreviewAndDetect);
  } else {
    camECTX.clearRect(0,0,800,600);
  }
}

/* capture frame -> optional pixelate -> add footer -> download
   IMPORTANT: no confetti, no fireworks, no sparkle in capture */
async function captureAndDownload(){
  const vw = cameraVideo.videoWidth, vh = cameraVideo.videoHeight;
  if (!vw || !vh) { alert('Video belum siap, coba lagi'); return; }

  // out canvas 800x600
  const out = document.createElement('canvas'); out.width = 800; out.height = 600;
  const outCtx = out.getContext('2d');

  // compute cover scaling
  const scale = Math.max(800 / vw, 600 / vh);
  const sw = 800 / scale; const sh = 600 / scale; const sx = (vw - sw) / 2; const sy = (vh - sh) / 2;

  if (pixelateEnabled) {
    const pixelFactor = 16;
    const tinyW = Math.max(1, Math.floor(800 / pixelFactor));
    const tinyH = Math.max(1, Math.floor(600 / pixelFactor));
    const tiny = document.createElement('canvas'); tiny.width = tinyW; tiny.height = tinyH;
    const tinyCtx = tiny.getContext('2d');
    tinyCtx.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, tinyW, tinyH);
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(tiny, 0, 0, tinyW, tinyH, 0, 0, 800, 600);
  } else {
    outCtx.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, 800, 600);
  }

  // small "made with fatih" footer (pixel font) centered near bottom
  outCtx.save();
  outCtx.fillStyle = '#ffffff';
  outCtx.font = '9px "Press Start 2P", monospace';
  outCtx.textBaseline = 'bottom';
  const footerText = 'made with fatih';
  const footerW = outCtx.measureText(footerText).width;
  const footerX = (800 - footerW) / 2;
  const footerY = 600 - 10; // 10px from bottom edge
  outCtx.fillText(footerText, footerX, footerY);
  outCtx.restore();

  // border (pixel aesthetic)
  outCtx.strokeStyle = '#ffffff'; outCtx.lineWidth = 4; outCtx.strokeRect(8,8,800-16,600-16);

  // download
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `birthday_selfie_${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');

  // small flash on preview canvas (short)
  camECTX.fillStyle = 'rgba(255,255,255,0.06)';
  camECTX.fillRect(0,0,800,600);
  setTimeout(()=> camECTX.clearRect(0,0,800,600), 40);
}

/* open camera modal -> ensure UI -> start camera */
photoBoothBtn.addEventListener('click', async () => {
  photoboothModal.classList.remove('hidden');
  ensurePhotoUI();
  await startCamera();
});

/* close camera modal */
closePhotoBtn.addEventListener('click', () => {
  photoboothModal.classList.add('hidden');
  stopCamera();
});

/* take photo handler (no main-screen effects after capture) */
takePhotoBtn.addEventListener('click', async () => {
  takePhotoBtn.disabled = true;
  await captureAndDownload();
  setTimeout(()=> {
    photoboothModal.classList.add('hidden');
    stopCamera();
    takePhotoBtn.disabled = false;
  }, 700);
});

/* fallback if camera not supported */
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  photoBoothBtn.addEventListener('click', () => {
    alert('Kamera tidak tersedia di perangkat ini.');
  });
}

/* double-click fallback snapshot of main canvas */
document.getElementById('photo-booth-btn')?.addEventListener('dblclick', () => {
  canvas.toBlob(b => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'snapshot.png';
    a.click();
    URL.revokeObjectURL(a.href);
  });
});

/* helper wrappers used above */
function spawnConfettiBurst(x,count=60){ for (let i=0;i<count;i++) confetti.push(new Confetto(x + rand(-20,20), rand(460,540))); }
function spawnFirework(x){ fw_launchers.push(new FireworkLauncher(x ?? rand(80,720))); }