const intro = document.getElementById("intro");
const openCurtain = document.getElementById("openCurtain");

function revealInvitation() {
  intro.classList.add("opened");
  document.body.classList.add("invitation-open");

  setTimeout(() => {
    const saveDate = document.getElementById("save-the-date");
    saveDate?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 1450);
}

openCurtain.addEventListener("click", revealInvitation);
openCurtain.addEventListener("touchend", (event) => {
  event.preventDefault();
  revealInvitation();
}, { passive: false });

/* =======================
   Scratch card
   ======================= */

const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const scratchHint = document.getElementById("scratchHint");
const revealedMessage = document.getElementById("revealedMessage");

let scratching = false;
let hasRevealed = false;
let scratchChecks = 0;

function sizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(window.devicePixelRatio || 1, 1);

  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // Soft maroon-purple foil layer
  const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
  gradient.addColorStop(0, "#6f1839");
  gradient.addColorStop(0.5, "#8b4564");
  gradient.addColorStop(1, "#6f4a8e");

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Decorative shimmer
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    const size = Math.random() * 1.6 + 0.4;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.22})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.font = `600 13px Montserrat, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCRATCH TO REVEAL OUR DATE", rect.width / 2, rect.height / 2 - 10);

  ctx.font = `500 28px Cormorant Garamond, serif`;
  ctx.fillText("♥", rect.width / 2, rect.height / 2 + 28);
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function scratchAt(event) {
  if (!scratching || hasRevealed) return;

  const { x, y } = pointerPosition(event);
  const rect = canvas.getBoundingClientRect();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, Math.max(24, rect.width * 0.055), 0, Math.PI * 2);
  ctx.fill();

  scratchHint.style.opacity = "0";

  scratchChecks++;
  if (scratchChecks % 8 === 0) {
    checkScratchPercentage();
  }
}

function checkScratchPercentage() {
  if (hasRevealed) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let transparentPixels = 0;
  const totalPixels = imageData.data.length / 4;

  // Sample pixels for better mobile performance.
  const step = 20;
  for (let i = 3; i < imageData.data.length; i += 4 * step) {
    if (imageData.data[i] < 40) transparentPixels++;
  }

  const sampledTotal = Math.ceil(totalPixels / step);
  const percent = transparentPixels / sampledTotal;

  if (percent >= 0.34) {
    revealDate();
  }
}

function revealDate() {
  if (hasRevealed) return;
  hasRevealed = true;

  canvas.style.transition = "opacity .65s ease";
  canvas.style.opacity = "0";
  scratchHint.style.display = "none";
  revealedMessage.classList.add("show");

  setTimeout(() => {
    canvas.style.pointerEvents = "none";
  }, 700);

  launchPetals();
}

canvas.addEventListener("pointerdown", (event) => {
  scratching = true;
  canvas.setPointerCapture?.(event.pointerId);
  scratchAt(event);
});

canvas.addEventListener("pointermove", scratchAt);

["pointerup", "pointercancel", "pointerleave"].forEach(type => {
  canvas.addEventListener(type, () => {
    scratching = false;
    checkScratchPercentage();
  });
});

window.addEventListener("resize", () => {
  if (!hasRevealed) sizeCanvas();
});

document.fonts?.ready.then(sizeCanvas);
if (!document.fonts) sizeCanvas();

/* =======================
   Falling flower petals
   ======================= */

function launchPetals() {
  const layer = document.getElementById("petalLayer");

  for (let i = 0; i < 58; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";

    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.animationDuration = `${4.5 + Math.random() * 4.5}s`;
    petal.style.animationDelay = `${Math.random() * 2.2}s`;
    petal.style.setProperty("--drift", `${-100 + Math.random() * 200}px`);
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;
    petal.style.opacity = `${0.5 + Math.random() * 0.45}`;

    const scale = 0.65 + Math.random() * 0.9;
    petal.style.width = `${12 * scale}px`;
    petal.style.height = `${19 * scale}px`;

    layer.appendChild(petal);

    setTimeout(() => petal.remove(), 10000);
  }
}
