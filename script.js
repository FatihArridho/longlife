// ELEMENTS
const startScreen = document.getElementById("start-screen");
const mainScene = document.getElementById("main-scene");
const openLetterBtn = document.getElementById("open-letter-btn");
const photoBoothBtn = document.getElementById("photo-booth-btn");
const crtToggle = document.getElementById("crt-toggle");
const downloadBtn = document.getElementById("download-btn");
const letterModal = document.getElementById("letter-modal");
const kirimBtn = document.getElementById("kirim-btn");
const closeLetterBtn = document.getElementById("close-letter-btn");
const birthdayMessage = document.getElementById("birthday-message");

const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d");

const effectCanvas = document.getElementById("effect-canvas");
const ectx = effectCanvas.getContext("2d");

let isCrtOn = false;

/* -------------------- CANVAS RESIZE -------------------- */
function resizeCanvas() {
    const wrap = document.getElementById("canvas-wrap");

    const maxW = Math.min(window.innerWidth * 0.95, 800);
    const maxH = Math.min(window.innerHeight * 0.95, 600);
    const scale = Math.min(maxW / 800, maxH / 600);

    const intScale = Math.max(1, Math.floor(scale));

    wrap.style.width = `${800 * intScale}px`;
    wrap.style.height = `${600 * intScale}px`;

    canvas.width = 800;
    canvas.height = 600;

    effectCanvas.width = 800;
    effectCanvas.height = 600;

    ctx.imageSmoothingEnabled = false;
    ectx.imageSmoothingEnabled = false;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* -------------------- SCENE DRAW -------------------- */
function drawScene() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = "#fff";
    ctx.fillRect(390, 290, 20, 20);

    requestAnimationFrame(drawScene);
}

/* -------------------- SNOW -------------------- */
const snow = [];
function rand(a, b) { return Math.random() * (b - a) + a }

class SnowFlake {
    constructor() {
        this.x = rand(0, 800);
        this.y = rand(-500, 0);
        this.vx = rand(-0.5, 0.5);
        this.vy = rand(0.5, 1.5);
        this.size = rand(1, 3);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > 610) {
            this.x = rand(0, 800);
            this.y = rand(-50, 0);
        }
    }
    draw(g) {
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        g.fill();
    }
}

for (let i = 0; i < 120; i++) snow.push(new SnowFlake());

/* -------------------- FIREWORKS -------------------- */
const fireworks = [];

class Firework {
    constructor(x) {
        this.x = x ?? rand(100, 700);
        this.y = 600;
        this.vy = rand(-7, -5);
        this.color = "hsl(" + rand(0, 360) + ",100%,50%)";
        this.exploded = false;
        this.sparks = [];
    }
    update() {
        if (!this.exploded) {
            this.y += this.vy;
            this.vy += 0.15;

            if (this.vy >= -1) {
                this.exploded = true;
                for (let i = 0; i < 30; i++) {
                    const angle = rand(0, Math.PI * 2);
                    const speed = rand(1, 4);
                    this.sparks.push({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: rand(30, 60),
                        age: 0,
                        color: this.color
                    });
                }
            }
        } else {
            this.sparks.forEach(s => {
                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.05;
                s.age++;
            });
        }
    }
    draw(g) {
        if (!this.exploded) {
            g.fillStyle = this.color;
            g.fillRect(this.x - 2, this.y - 2, 4, 4);
        } else {
            this.sparks.forEach(s => {
                if (s.age < s.life) {
                    g.fillStyle = s.color;
                    g.globalAlpha = 1 - s.age / s.life;
                    g.fillRect(s.x, s.y, 3, 3);
                }
            });
            g.globalAlpha = 1;
        }
    }
}

function spawnFirework() {
    fireworks.push(new Firework());
}

/* -------------------- CONFETTI -------------------- */
const confetti = [];
class Confetti {
    constructor() {
        this.x = rand(350, 450);
        this.y = rand(350, 450);
        this.vx = rand(-2, 2);
        this.vy = rand(-5, -2);
        this.color = "hsl(" + rand(0, 360) + ",100%,50%)";
        this.life = 60;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life--;
    }
    draw(g) {
        g.fillStyle = this.color;
        g.fillRect(this.x, this.y, 4, 4);
    }
}

function burstConfetti() {
    for (let i = 0; i < 60; i++) confetti.push(new Confetti());
}

/* -------------------- EFFECT LOOP -------------------- */
function drawEffects() {
    ectx.clearRect(0, 0, 800, 600);

    if (Math.random() < 0.02) spawnFirework();

    fireworks.forEach((f, i) => {
        f.update();
        f.draw(ectx);
    });

    snow.forEach(s => { s.update(); s.draw(ectx); });

    confetti.forEach((c, i) => {
        c.update();
        c.draw(ectx);
        if (c.life <= 0) confetti.splice(i, 1);
    });

    requestAnimationFrame(drawEffects);
}

/* -------------------- EVENT -------------------- */
openLetterBtn.onclick = () => letterModal.classList.remove("hidden");
closeLetterBtn.onclick = () => letterModal.classList.add("hidden");

kirimBtn.onclick = () => {
    const msg = birthdayMessage.value.trim();
    if (!msg) return alert("pesan tidak boleh kosong");

    burstConfetti();
    spawnFirework();

    window.location.href =
        "https://wa.me/6281511118515?text=" + encodeURIComponent(msg);
};

crtToggle.onclick = () => {
    isCrtOn = !isCrtOn;
    document.body.classList.toggle("crt-on", isCrtOn);
};

photoBoothBtn.onclick = () => {
    canvas.toBlob(b => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = "pixel-photo.png";
        a.click();
    });
};

/* -------------------- AUTO‒START -------------------- */
document.addEventListener("DOMContentLoaded", () => {
    startScreen.classList.add("hidden");
    mainScene.classList.remove("hidden");

    resizeCanvas();
    drawScene();
    drawEffects();
});