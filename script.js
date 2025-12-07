// DOM Elements
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
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

// effect canvas (overlay)
const effectCanvas = document.getElementById('effect-canvas');
const ectx = effectCanvas.getContext('2d');

// Debug
console.log('Canvas initialized:', canvas, 'Effect canvas:', effectCanvas);

// Palette
const palette = ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#800080', '#ffa500'];

// Pixel sprite functions (sama seperti sebelumnya)
function drawPixelSprite(data, x, y, scale = 1) {
    for (let row = 0; row < data.length; row++) {
        for (let col = 0; col < data[row].length; col++) {
            if (data[row][col] !== null) {
                ctx.fillStyle = palette[data[row][col]];
                ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
            }
        }
    }
}

// sprite data (ambil ulang data yang sebelumnya)
const cakeData = [
    [null,null,null,null,null,null,null,null],
    [null,null,2,2,2,2,null,null],
    [null,2,1,1,1,1,2,null],
    [2,1,0,0,0,0,1,2],
    [2,1,0,3,3,0,1,2],
    [2,1,0,3,3,0,1,2],
    [null,2,1,1,1,1,2,null],
    [null,null,2,2,2,2,null,null]
];
const char1Data = [
    [null,null,1,null,null],
    [null,1,0,1,null],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [null,1,0,1,null],
    [null,null,1,null,null]
];
const char2Data = [
    [null,0,null,0,null],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [null,0,0,0,null],
    [null,null,0,null,null],
    [null,null,null,null,null]
];
const balloonData = [
    [null,4],
    [4,4]
];
const bannerData = [
    [5,5,5,5],
    [5,2,2,5],
    [5,2,2,5],
    [5,5,5,5]
];
const lightData = [
    [3,3],
    [3,3]
];
const fireworksData = [
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,0,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,0,1,0,null,null,null,null,null,null,null,null,null,null,null],
    [null,0,1,2,1,0,null,null,null,null,null,null,null,null,null,null],
    [null,0,2,3,2,0,null,null,null,null,null,null,null,null,null,null],
    [null,null,0,1,0,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,0,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
];

// Audio
let audioCtx;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playBirthdayMusic() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.8);
    setTimeout(playBirthdayMusic, 1800);
}
function playConfettiSound() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    osc.start(); osc.stop(audioCtx.currentTime + 0.12);
}

// Scene state
let isCrtOn = false;
let messageSaved = false;
let fireworksFrame = 0;
let lightBlink = 0;

// --- RESIZE FIX (pastikan intScale minimal 1) ---
function resizeCanvas() {
    const wrap = document.getElementById('canvas-wrap');
    // fit into window but keep aspect ratio 800x600
    const maxW = Math.min(window.innerWidth * 0.95, 800);
    const maxH = Math.min(window.innerHeight * 0.95, 600);
    const scale = Math.min(maxW / 800, maxH / 600);
    const intScale = Math.max(1, Math.floor(scale)); // <- penting: minimal 1
    // style size (CSS pixels)
    wrap.style.width = (800 * intScale) + 'px';
    wrap.style.height = (600 * intScale) + 'px';
    // set canvas internal resolution unchanged (we draw at logical 800x600)
    canvas.width = 800; canvas.height = 600;
    effectCanvas.width = 800; effectCanvas.height = 600;
    // ensure pixelated rendering for both
    ctx.imageSmoothingEnabled = false;
    ectx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Draw pixel scene
function drawScene() {
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 800, 600);

    drawPixelSprite(cakeData, 368, 268, 8);
    drawPixelSprite(char1Data, 300, 250, 8);
    drawPixelSprite(char2Data, 468, 250, 8);
    drawPixelSprite(balloonData, 200, 100, 8);
    drawPixelSprite(balloonData, 584, 100, 8);
    drawPixelSprite(bannerData, 350, 50, 8);
    if (lightBlink % 20 < 10) {
        drawPixelSprite(lightData, 100, 100, 8);
        drawPixelSprite(lightData, 684, 100, 8);
    }
    // simple pixel fireworks sprite (static frame)
    drawPixelSprite(fireworksData, 384, 0, 8);

    lightBlink++;
    requestAnimationFrame(drawScene);
}

// ---------- EFFECTS: fireworks (launchers), confetti, snow ----------
const fireworks = []; // launcher & explosion particles
const confetti = [];
const snow = [];

// helper random
const rand = (a,b)=> Math.random()*(b-a)+a;

// particle classes
class FireworkLauncher {
    constructor(x) {
        this.x = x;
        this.y = 600;
        this.vy = rand(-7.5, -5.5); // upward velocity
        this.vx = rand(-1.2, 1.2);
        this.color = palette[Math.floor(Math.random()*palette.length)];
        this.exploded = false;
    }
    update() {
        if (!this.exploded) {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.18; // gravity
            if (this.vy >= -1.0) { // apex reached -> explode
                this.exploded = true;
                // create explosion particles
                const sparks = 18 + Math.floor(rand(6,20));
                for (let i=0;i<sparks;i++){
                    const angle = rand(0, Math.PI*2);
                    const speed = rand(1.6, 4.2);
                    fireworks.push(new FireworkSpark(this.x, this.y, Math.cos(angle)*speed, Math.sin(angle)*speed, this.color));
                }
            }
        }
    }
    draw(g) {
        if (!this.exploded) {
            g.fillStyle = this.color;
            g.beginPath();
            g.arc(this.x, this.y, 3, 0, Math.PI*2);
            g.fill();
        }
    }
}

class FireworkSpark {
    constructor(x,y,vx,vy,color){
        this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.color=color;
        this.life = 40 + Math.floor(rand(0,30));
        this.age = 0;
    }
    update(){
        this.vy += 0.06; // gravity
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
    }
    draw(g){
        const alpha = Math.max(0, 1 - this.age / this.life);
        g.globalAlpha = alpha;
        g.fillStyle = this.color;
        g.fillRect(this.x, this.y, 2, 2);
        g.globalAlpha = 1;
    }
}

class Confetto {
    constructor(x,y){
        this.x=x; this.y=y; this.vx=rand(-1,1); this.vy=rand(2,5);
        this.w=rand(4,8); this.h=rand(2,5);
        this.color = palette[Math.floor(Math.random()*palette.length)];
        this.rotation = rand(0,Math.PI*2);
        this.angular = rand(-0.2,0.2);
        this.life = 120 + Math.floor(rand(0,80));
        this.age = 0;
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.04;
        this.rotation += this.angular;
        this.age++;
    }
    draw(g){
        g.save();
        g.translate(this.x, this.y);
        g.rotate(this.rotation);
        g.fillStyle = this.color;
        g.fillRect(-this.w/2, -this.h/2, this.w, this.h);
        g.restore();
    }
}

class SnowFlake {
    constructor(){
        this.x = rand(0, 800);
        this.y = rand(-600, 0);
        this.vy = rand(0.4, 1.2);
        this.vx = rand(-0.4, 0.4);
        this.size = rand(1.2, 3.2);
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > 620) { // recycle
            this.x = rand(0,800);
            this.y = rand(-80, -10);
            this.vy = rand(0.4,1.2);
        }
    }
    draw(g){
        g.beginPath();
        g.fillStyle = 'rgba(255,255,255,0.9)';
        g.arc(this.x, this.y, this.size, 0, Math.PI*2);
        g.fill();
    }
}

// spawn routines
function spawnFirework(x) {
    fireworks.push(new FireworkLauncher(x ?? rand(80, 720)));
}

function spawnConfettiBurst(x, count=60) {
    for (let i=0;i<count;i++){
        confetti.push(new Confetto(x + rand(-20,20), rand(460,540)));
    }
}

function initSnow(n=120) {
    for (let i=0;i<n;i++) snow.push(new SnowFlake());
}
initSnow();

// animation loop for effects
function drawEffects() {
    ectx.clearRect(0,0,800,600);

    // occasionally launch fireworks
    if (Math.random() < 0.015) spawnFirework();

    // update + draw fireworks (launchers + sparks)
    for (let i=fireworks.length-1;i>=0;i--){
        const p = fireworks[i];
        p.update();
        p.draw(ectx);
        // remove aged sparks (FireworkSpark instances share same array)
        if (p instanceof FireworkSpark) {
            if (p.age > p.life) fireworks.splice(i,1);
        } else if (p.exploded && !(p instanceof FireworkSpark)) {
            // a launcher -> after explosion we still want to remove the launcher object
            fireworks.splice(i,1);
        }
    }
    // But sparks were pushed into fireworks array too. We need to draw/update those:
    // Above loop attempted to handle both, but it's better to separate: let's process all as two lists.
    // To keep simple and safe, rework: rebuild temp lists
    const sparks = [];
    const launchers = [];
    for (const f of fireworks) {
        if (f instanceof FireworkSpark) sparks.push(f);
        else launchers.push(f);
    }
    // process launchers
    for (let i=launchers.length-1;i>=0;i--){
        const L = launchers[i];
        L.update();
        L.draw(ectx);
    }
    // process sparks
    for (let i=sparks.length-1;i>=0;i--){
        const s = sparks[i];
        s.update();
        s.draw(ectx);
        if (s.age > s.life) {
            const idx = fireworks.indexOf(s);
            if (idx>=0) fireworks.splice(idx,1);
        }
    }

    // confetti
    for (let i=confetti.length-1;i>=0;i--){
        const c = confetti[i];
        c.update();
        c.draw(ectx);
        if (c.age > c.life || c.y > 680) confetti.splice(i,1);
    }

    // snow
    for (let i=0;i<snow.length;i++){
        snow[i].update();
        snow[i].draw(ectx);
    }

    requestAnimationFrame(drawEffects);
}

// small utility to separate fireworks arrays properly
// we will use a combined approach: push launchers to 'launchers' list, and sparks to 'sparks' list
const fw_launchers = [];
const fw_sparks = [];

// adapt spawn functions to use separate arrays for clarity (override earlier push)
function spawnFirework(x) {
    fw_launchers.push(new FireworkLauncher(x ?? rand(80,720)));
}
function spawnSpark(x,y,vx,vy,color){
    fw_sparks.push(new FireworkSpark(x,y,vx,vy,color));
}
function spawnConfettiBurst(x, count=60) {
    for (let i=0;i<count;i++){
        confetti.push(new Confetto(x + rand(-20,20), rand(460,540)));
    }
}

// rework drawEffects using the two arrays for correctness
function drawEffects() {
    ectx.clearRect(0,0,800,600);

    if (Math.random() < 0.02) spawnFirework();

    // launchers
    for (let i=fw_launchers.length-1;i>=0;i--){
        const L = fw_launchers[i];
        if (!L.exploded) {
            L.update();
            L.draw(ectx);
        } else {
            // when launcher explodes, move to sparks array
            const sparksCount = 18 + Math.floor(rand(6,20));
            for (let k=0;k<sparksCount;k++){
                const angle = rand(0, Math.PI*2);
                const speed = rand(1.6, 4.2);
                fw_sparks.push(new FireworkSpark(L.x, L.y, Math.cos(angle)*speed, Math.sin(angle)*speed, L.color));
            }
            fw_launchers.splice(i,1);
        }
    }

    // sparks
    for (let i=fw_sparks.length-1;i>=0;i--){
        const s = fw_sparks[i];
        s.update();
        s.draw(ectx);
        if (s.age > s.life) fw_sparks.splice(i,1);
    }

    // confetti
    for (let i=confetti.length-1;i>=0;i--){
        const c = confetti[i];
        c.update();
        c.draw(ectx);
        if (c.age > c.life || c.y > 700) confetti.splice(i,1);
    }

    // snow
    for (let i=0;i<snow.length;i++){
        snow[i].update();
        snow[i].draw(ectx);
    }

    requestAnimationFrame(drawEffects);
}

// Start button
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    mainScene.classList.remove('hidden');
    playBirthdayMusic();
    drawScene();
    drawEffects();
});
startBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), startBtn.click();
});

// modal open/close
openLetterBtn.addEventListener('click', ()=> letterModal.classList.remove('hidden'));
closeLetterBtn.addEventListener('click', ()=> letterModal.classList.add('hidden'));
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / 800);
    const y = (e.clientY - rect.top) / (rect.height / 600);
    if (x >= 368 && x <= 432 && y >= 268 && y <= 332) {
        letterModal.classList.remove('hidden');
    }
});

// kirim button: buka whatsapp + konfeti + sound
kirimBtn.addEventListener('click', () => {
    const msg = birthdayMessage.value.trim();
    if (msg) {
        window.location.href = `https://wa.me/6281511118515?text=${encodeURIComponent(msg)}`;
        messageSaved = true;
        downloadBtn.classList.remove('hidden');
        letterModal.classList.add('hidden');
        playConfettiSound();
        // spawn confetti burst at center
        spawnConfettiBurst(400, 120);
        // spawn a few fireworks near center
        for (let i=0;i<3;i++) spawnFirework(300 + i*80 + rand(-30,30));
    } else {
        alert('Pesan tidak boleh kosong!');
    }
});
kirimBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), kirimBtn.click();
});

// CRT toggle
crtToggle.addEventListener('click', () => {
    isCrtOn = !isCrtOn;
    document.body.classList.toggle('crt-on', isCrtOn);
});

// photo booth
photoBoothBtn.addEventListener('click', () => {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'birthday_snapshot.png';
        a.click();
        URL.revokeObjectURL(url);
    });
});

// download html
downloadBtn.addEventListener('click', () => {
    if (messageSaved) {
        const html = document.documentElement.outerHTML;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'birthday_card.html';
        a.click();
        URL.revokeObjectURL(url);
    }
});