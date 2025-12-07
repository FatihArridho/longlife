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
const bgMusic = document.getElementById('bg-music');
const confettiSound = document.getElementById('confetti-sound');
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

// Pixel Art Setup: Palet Warna Terbatas (Maks 6: Merah, Biru, Kuning, Hijau, Ungu, Oranye)
const palette = ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#800080', '#ffa500'];

// Placeholder Sprites (Ganti dengan file PNG Anda)
const sprites = {
    cake: new Image(), // cake.png - 64x64 px
    character1: new Image(), // character1.png - 32x48 px
    character2: new Image(), // character2.png - 32x48 px
    balloon: new Image(), // balloon.png - 16x16 px
    banner: new Image(), // banner.png - 32x32 px
    light: new Image(), // light.png - 16x16 px
    fireworks: new Image() // fireworks.png - Sprite-sheet 128x128 px, 4 frame
};
sprites.cake.src = 'cake.png'; // Ganti path
sprites.character1.src = 'character1.png';
sprites.character2.src = 'character2.png';
sprites.balloon.src = 'balloon.png';
sprites.banner.src = 'banner.png';
sprites.light.src = 'light.png';
sprites.fireworks.src = 'fireworks.png';

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
    if (sprites.cake.complete) {
        ctx.drawImage(sprites.cake, 368, 268, 64, 64); // Tengah bawah
    }
    
    // Karakter (32x48)
    if (sprites.character1.complete) {
        ctx.drawImage(sprites.character1, 300, 250, 32, 48);
    }
    if (sprites.character2.complete) {
        ctx.drawImage(sprites.character2, 468, 250, 32, 48);
    }
    
    // Dekorasi: Balon, Banner, Lampu Berkedip
    if (sprites.balloon.complete) {
        ctx.drawImage(sprites.balloon, 200, 100, 16, 16);
        ctx.drawImage(sprites.balloon, 584, 100, 16, 16);
    }
    if (sprites.banner.complete) {
        ctx.drawImage(sprites.banner, 350, 50, 100, 32);
    }
    if (sprites.light.complete && lightBlink % 20 < 10) { // Kedip pola 8-bit
        ctx.drawImage(sprites.light, 100, 100, 16, 16);
        ctx.drawImage(sprites.light, 684, 100, 16, 16);
    }
    
    // Efek Kembang Api Pixel (Sprite-sheet animation)
    if (sprites.fireworks.complete) {
        const frameWidth = 32; // 128/4
        ctx.drawImage(sprites.fireworks, fireworksFrame * frameWidth, 0, frameWidth, 128, 384, 0, 32, 128);
        fireworksFrame = (fireworksFrame + 1) % 4; // 4 frame loop
    }
    
    lightBlink++;
    requestAnimationFrame(drawScene);
}

// Start Button: Klik untuk Mulai
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    mainScene.classList.remove('hidden');
    bgMusic.play(); // Mulai musik setelah interaksi klik
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
        confettiSound.play(); // Suara konfeti
        // Konfeti Pixel Sederhana (Opsional: Tambah partikel canvas)
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