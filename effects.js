(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-hover-text]").forEach((container) => {
    container.querySelectorAll("[data-lang]").forEach((label) => {
      const text = label.textContent || "";
      label.setAttribute("aria-label", text);
      label.textContent = "";
      Array.from(text).forEach((character, index) => {
        const span = document.createElement("span");
        span.className = character === " " ? "hover-letter hover-space" : "hover-letter";
        span.textContent = character === " " ? "\u00a0" : character;
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--letter-index", String(index));
        label.appendChild(span);
      });
    });
  });

  if (reducedMotion) return;

  const canvas = document.getElementById("particle-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const particles = [];
  let width = 0;
  let height = 0;
  let scale = 1;
  let dragging = false;
  let lastPoint = null;

  const resize = () => {
    scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
  };

  const addParticle = (x, y, intensity = 1) => {
    const violet = Math.random() > 0.25;
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.8 * intensity,
      vy: (Math.random() - 0.5) * 1.8 * intensity - 0.35,
      radius: 1.2 + Math.random() * 2.7,
      life: 1,
      decay: 0.018 + Math.random() * 0.025,
      color: violet ? "154,108,255" : "245,245,255",
    });
    if (particles.length > 260) particles.shift();
  };

  const emitTrail = (x, y) => {
    if (!lastPoint) lastPoint = { x, y };
    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.min(10, Math.ceil(distance / 8)));
    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const px = lastPoint.x + dx * progress;
      const py = lastPoint.y + dy * progress;
      addParticle(px, py, Math.min(2.2, 1 + distance / 45));
      if (Math.random() > 0.42) addParticle(px, py, 0.8);
    }
    lastPoint = { x, y };
  };

  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    document.body.classList.add("is-particle-dragging");
    lastPoint = { x: event.clientX, y: event.clientY };
    for (let index = 0; index < 8; index += 1) addParticle(event.clientX, event.clientY, 1.4);
  });
  window.addEventListener("pointermove", (event) => {
    if (dragging) emitTrail(event.clientX, event.clientY);
  }, { passive: true });
  const endDrag = () => {
    dragging = false;
    lastPoint = null;
    document.body.classList.remove("is-particle-dragging");
    window.getSelection()?.removeAllRanges();
  };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  window.addEventListener("blur", endDrag);
  window.addEventListener("resize", resize, { passive: true });

  const render = () => {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy = particle.vy * 0.985 + 0.012;
      particle.life -= particle.decay;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * particle.life, 0, Math.PI * 2);
      context.fillStyle = `rgba(${particle.color},${particle.life * 0.82})`;
      context.shadowColor = `rgba(${particle.color},${particle.life})`;
      context.shadowBlur = 12;
      context.fill();
    }
    context.shadowBlur = 0;
    context.globalCompositeOperation = "source-over";
    requestAnimationFrame(render);
  };

  resize();
  render();
})();
