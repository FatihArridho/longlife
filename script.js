// DOM Elements
const startScreen = document.getElementById('start-screen');
const mainScene = document.getElementById('main-scene');
const startBtn = document.getElementById('start-btn');
const openLetterBtn = document.getElementById('open-letter-btn');
const photoBoothBtn = document.getElementById('photo-booth-btn');
const crtToggle = document.getElementById('crt-toggle');
const downloadBtn = document.getElementById('download-btn');
const letterModal = document.getElementById('letter-modal');
const saveBtn = document.getElementById('save-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const birthdayMessage = document.getElementById('birthday-message');
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

// Pixel Art Setup: Palet Warna Terbatas (Maks 6: Merah, Biru, Kuning, Hijau, Ungu, Oranye)
const palette = ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#800080', '#ffa500'];

// Fungsi untuk Menggambar Sprite Pixel Art Secara Procedural
function drawPixelSprite(data, x, y, scale = 1) {
    // data: Array 2D [row][col] dengan indeks palet (0-5) atau null untuk transparan
    for (let row = 0; row < data.length; row++) {
        for (let col = 0; col < data[row].length; col++) {
            if (data[row][col] !== null) {
                ctx.fillStyle = palette[data[row][col]];
                ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
            }
        }
    }
}

// Definisi Sprite Data (Pixel Art 8-bit)
// Cake: 64x64 (8x8 grid, scale 8)
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

// Character1 (Smiley): 32x48 (4x6 grid, scale 8)
const char1Data = [
    [null,null,1,null,null],
    [null,1,0,1,null],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [null,1,0,1,null],
    [null,null,1,null,null]
];

// Character2 (Heart): 32x48 (4x6 grid, scale 8)
const char2Data = [
    [null,0,null,0,null],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [null,0,0,0,null],
    [null,null,0,null,null],
    [null,null,null,null,null]
];

// Balloon: 16x16 (2x2 grid, scale 8)
const balloonData = [
    [null,4],
    [4,4]
];

// Banner: 32x32 (4x4 grid, scale 8)
const bannerData = [
    [5,5,5,5],
    [5,2,2,5],
    [5,2,2,5],
    [5,5,5,5]
];

// Light: 16x16 (2x2 grid, scale 8)
const lightData = [
    [3,3],
    [3,3]
];

// Fireworks Sprite-Sheet: 128x128 (16x16 grid, 4 frame, scale 8) - Data untuk 1 frame saja, loop di kode
const fireworksData = [
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,0,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,0,1,0,null,null,null,null,null,null,null,null,null,null,null],
    [null,0,1,2,1,0,null,null,null,null,null,null,null,null,null,null],
    [null,0,2,3,2,0,null,null,null,null,null,null,null,null,null,null],
    [null,null,0,1,0,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,0,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    // Tambah frame lain jika perlu, tapi untuk sederhana pakai 1 frame loop
];

// Audio: Web Audio API untuk Musik 8-bit dan Suara Konfeti
let audioCtx;
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

// Musik Ulang Tahun: Chiptune Melody (Looping)
function playBirthdayMusic() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    osc.frequency.setValueAtTime(494, audioCtx.currentTime + 0.5); // B4
    osc.frequency.setValueAtTime(523, audioCtx.currentTime + 1); // C5
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 2); // Loop sederhana (ulangi di event loop)
    setInterval(() => playBirthdayMusic(), 2000); // Loop setiap 2 detik
}

// Suara Konfeti: Pop Sound
function playConfettiSound() {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Scene State
let isCrtOn = false;
let messageSaved = false;
let fireworksFrame = 0;
let lightBlink = 0;

// Canvas Scaling: Integer Scaling untuk Pixel Tajam
function resizeCanvas() {
    const scale = Math.min(window.innerWidth / 800, window.innerHeight / 600);
    const intScale = Math.floor(scale);
    canvas.style.width = (800 * intScale) + 'px';
    canvas.style.height = (600 * intScale) + 'px';
    ctx.imageSmoothingEnabled = false; // Nearest-neighbor
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Draw Pixel Scene
function drawScene() {
    ctx.clearRect(0, 0, 800, 600);
    
    // Background: Hitam
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 800, 600);
    
    // Kue Besar di Tengah (64x64)
    drawPixelSprite(cakeData, 368, 268, 8);
    
    // Karakter (32x48)
    drawPixelSprite(char1Data, 300, 250, 8);
    drawPixelSprite(char2Data, 468, 250, 8);
    
    // Dekorasi: Balon, Banner, Lampu Berkedip
    drawPixelSprite(balloonData, 200, 100, 8);
    drawPixelSprite(balloonData, 584, 100, 8);
    drawPixelSprite(bannerData, 350, 50, 8);
    if (lightBlink % 20 < 10) { // Kedip pola 8-bit
        drawPixelSprite(lightData, 100, 100, 8);
        drawPixelSprite(lightData, 684, 100, 8);
    }
    
    // Efek Kembang Api Pixel (Sprite animation)
    drawPixelSprite(fireworksData, 384, 0, 8);
    fireworksFrame = (fireworksFrame + 1) % 4; // Loop frame (meski data statis, bisa diperluas)
    
    lightBlink++;
    requestAnimationFrame(drawScene);
}

// Start Button: Klik untuk Mulai
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    mainScene.classList.remove('hidden');
    playBirthdayMusic(); // Mulai musik procedural
    drawScene(); // Mulai animasi scene
});
startBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), startBtn.click();
});

// Open Letter: Klik Kue atau Tombol
openLetterBtn.addEventListener('click', () => {
    letterModal.classList.remove('hidden');
});
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / 800);
    const y = (e.clientY - rect.top) / (rect.height / 600);
    if (x >= 368 && x <= 432 && y >= 268 && y <= 332) { // Area kue
        letterModal.classList.remove('hidden');
    }
});
openLetterBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), openLetterBtn.click();
});

// Save Message
saveBtn.addEventListener('click', () => {
    const msg = birthdayMessage.value.trim();
    if (msg) {
        // Tampil Pesan di Layar (Teks Pixel Besar)
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Press Start 2P';
        ctx.fillText(msg.toUpperCase(), 50, 550); // White-on-black
        messageSaved = true;
        downloadBtn.classList.remove('hidden');
        letterModal.classList.add('hidden');
        playConfettiSound(); // Suara konfeti procedural
        // Konfeti Pixel Sederhana
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
            ctx.fillRect(Math.random() * 800, Math.random() * 600, 4, 4);
        }
    }
});
saveBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), saveBtn.click();
});

// Close Modal
closeModalBtn.addEventListener('click', () => {
    letterModal.classList.add('hidden');
});
closeModalBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), closeModalBtn.click();
});

// CRT Toggle
crtToggle.addEventListener('click', () => {
    isCrtOn = !isCrtOn;
    document.body.classList.toggle('crt-on', isCrtOn);
});
crtToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), crtToggle.click();
});

// Photo Booth: Klik Karakter untuk Snapshot Pixel
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
photoBoothBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), photoBoothBtn.click();
});

// Download HTML Statis
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
downloadBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), downloadBtn.click();
});
