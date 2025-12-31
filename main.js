let doneCalled = false;
let phase = "FORM_2025";
// FORM_2025 → CHAOS → FORM_2026 → DONE
const newYear = new Date('January 1, 2026 00:00:00').getTime();
const messageText = document.getElementById("text")
const container = document.querySelector('.fireworks')
const countdownElement = document.querySelector('.countdownElement')
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);


const fireworks = new Fireworks.default(container)

function main() {
  const countdownInterval = setInterval(() => {
  const now = new Date().getTime();
  const distance = newYear - now;
  if(distance < 0){
    countdownElement.style.display = "none"
    clearInterval(countdownInterval)
    MoveToNewYear()
  }
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  countdownElement.innerHTML = timeFormatted;
}, 1000);
}

function MoveToNewYear(){
  // =====================
// PARTICLE
// =====================
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    
    this.tx = this.x;
    this.ty = this.y;
    
    this.vx = 0;
    this.vy = 0;
    this.pull = 0; // 0 = chaos, 1 = tarik penuh
  }
  
  explode() {
    const a = Math.random() * Math.PI * 2;
    const f = Math.random() * 18 + 12; // 💥 KACAU
    this.vx += Math.cos(a) * f;
    this.vy += Math.sin(a) * f;
  }
  
  update() {
    // tarik target pelan2
    this.vx += (this.tx - this.x) * 0.002 * this.pull;
    this.vy += (this.ty - this.y) * 0.002 * this.pull;
    
    // friction
    this.vx *= 0.94;
    this.vy *= 0.94;
    
    this.x += this.vx;
    this.y += this.vy;
  }
  
  draw() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x, this.y, 2, 2);
  }
}

// =====================
// TEXT → TARGETS (SAFE SCALE)
// =====================
const off = document.createElement("canvas");
const offCtx = off.getContext("2d");

function createTargets(text) {
  off.width = canvas.width;
  off.height = canvas.height;
  
  offCtx.clearRect(0, 0, off.width, off.height);
  
  const padding = canvas.width * 0.1;
  const maxWidth = canvas.width - padding * 2;
  
  let fontSize = canvas.width * 0.45;
  offCtx.font = `bold ${fontSize}px sans-serif`;
  
  while (offCtx.measureText(text).width > maxWidth) {
    fontSize -= 10;
    offCtx.font = `bold ${fontSize}px sans-serif`;
  }
  
  offCtx.fillStyle = "white";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(text, off.width / 2, off.height / 2);
  
  const data = offCtx.getImageData(0, 0, off.width, off.height).data;
  const targets = [];
  
  for (let y = 0; y < off.height; y += 6) {
    for (let x = 0; x < off.width; x += 6) {
      if (data[(y * off.width + x) * 4 + 3] > 150) {
        targets.push({ x, y });
      }
    }
  }
  return targets;
}

// =====================
// INIT
// =====================
const COUNT = 7000;
const particles = [];
for (let i = 0; i < COUNT; i++) particles.push(new Particle());

let targets2025 = createTargets("2025");
let targets2026 = createTargets("2026");

function assignTargets(targets) {
  for (let i = 0; i < particles.length; i++) {
    const t = targets[i % targets.length];
    particles[i].tx = t.x;
    particles[i].ty = t.y;
  }
}

// start as 2025
assignTargets(targets2025);
particles.forEach(p => p.pull = 1);

// =====================
// TIMELINE
// =====================

// ⏱ DIAM SEBENTAR
setTimeout(() => {
  // 💥 HANCUR TOTAL
  phase = "CHAOS"
  particles.forEach(p => {
    p.pull = 0; // MATIIN TARGET
    p.explode();
  });
}, 7500);

// 🌪 CHAOS MURNI
setTimeout(() => {
  particles.forEach(p => {
    p.vx += Math.random() * 10 - 5;
    p.vy += Math.random() * 10 - 5;
  });
}, 5000);

// 🌱 PELAN-PELAN TARIK BALIK
setTimeout(() => {
  phase = "FORM_2026"
  assignTargets(targets2026);
  particles.forEach(p => p.pull = 0.2);
}, 7500);

// 🌿 TARIK MAKIN KUAT
let pullInterval = setInterval(() => {
  if (phase === "FORM_2026") {
  particles.forEach(p => {
    p.pull = Math.min(1, p.pull + 0.01);
  });
}
}, 300);

setTimeout(() => clearInterval(pullInterval), 11000);

// =====================
// LOOP
// =====================
let stableFrames = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  let totalSpeed = 0;
  
  for (const p of particles) {
    p.update();
    p.draw();
    totalSpeed += Math.abs(p.vx) + Math.abs(p.vy);
  }
  
  const avgSpeed = totalSpeed / particles.length;
  
  // ✅ DETEKSI STABIL BERTAHAN
  if (phase === "FORM_2026" && avgSpeed < 0.06) {
    stableFrames++;
    if (stableFrames > 60) { // ±1 detik
      phase = "DONE";
      fireworks.start()
      setTimeout(()=>{
        messageText.style.opacity = "90%"
      },1000)
    }
  } else {
    stableFrames = 0;
  }
  
  requestAnimationFrame(animate);
}

animate();

}

main()