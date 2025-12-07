// DOM Elements
const app = document.getElementById('app');
const themeToggle = document.getElementById('theme-toggle');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const slides = document.getElementById('slides');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const messageList = document.getElementById('message-list');
const messageInput = document.getElementById('message-input');
const addBtn = document.getElementById('add-btn');
const bgMusic = document.getElementById('bg-music');
const volumeControl = document.getElementById('volume');
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

// Target Birthday Date (Change to actual date)
const targetDate = new Date('2024-12-25T00:00:00'); // Example: Christmas Day

// Particles Setup (Simple floating particles)
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
for (let i = 0; i < 100; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 5 + 1,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });
    requestAnimationFrame(drawParticles);
}
drawParticles();

// Theme Toggle
let isDark = false;
themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    app.className = isDark ? 'app dark' : 'app light';
    themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Countdown Timer
function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        daysEl.textContent = `${days} Days`;
        hoursEl.textContent = `${hours} Hours`;
        minutesEl.textContent = `${minutes} Minutes`;
        secondsEl.textContent = `${seconds} Seconds`;
    } else {
        daysEl.textContent = '0 Days';
        hoursEl.textContent = '0 Hours';
        minutesEl.textContent = '0 Minutes';
        secondsEl.textContent = '0 Seconds';
        confetti(); // Trigger confetti when countdown ends
    }
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Gallery Slider
let currentSlide = 0;
const totalSlides = slides.children.length;

function showSlide(index) {
    slides.style.transform = `translateX(-${index * 100}%)`;
}

prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
});

nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
});

// Auto-slide every 3 seconds
setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}, 3000);

// Messages
let messages = JSON.parse(localStorage.getItem('birthdayMessages')) || [];

function renderMessages() {
    messageList.innerHTML = '';
    messages.forEach((msg, index) => {
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = msg;
        messageList.appendChild(div);
    });
}

addBtn.addEventListener('click', () => {
    const newMsg = messageInput.value.trim();
    if (newMsg) {
        messages.push(newMsg);
        localStorage.setItem('birthdayMessages', JSON.stringify(messages));
        renderMessages();
        messageInput.value = '';
        confetti(); // Trigger confetti on add
    }
});

renderMessages();

// Background Music
bgMusic.volume = 0.5;
bgMusic.play();

volumeControl.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});

// Resize Canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});