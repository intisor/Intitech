/* ============================================
   CHATLASSO — Landing Page Script
   Features:
   - Interactive Lasso Canvas (draw to select platforms)
   - Navbar scroll state
   - Scroll reveal
   - Orbit chip cycling
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── NAVBAR ─────────────────────────────────
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });


    // ── SCROLL REVEAL ───────────────────────────
    const revealEls = document.querySelectorAll('.step, .bento-card, .section-label, .final-cta h2, .final-cta .btn-solid');
    const ro = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                e.target.style.transitionDelay = `${(i % 4) * 80}ms`;
                e.target.classList.add('visible', 'reveal');
                ro.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => { el.classList.add('reveal'); ro.observe(el); });


    // ── PLATFORM ORBIT ANIMATION ─────────────
    const platforms = ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Grok', 'NotebookLM', 'Mistral', 'Perplexity', 'Copilot'];
    const orbitVis = document.getElementById('orbitVis');
    if (orbitVis) {
        platforms.forEach(p => {
            const chip = document.createElement('div');
            chip.className = 'orbit-chip';
            chip.textContent = p;
            orbitVis.appendChild(chip);
        });

        let idx = 0;
        setInterval(() => {
            const chips = orbitVis.querySelectorAll('.orbit-chip');
            chips.forEach(c => c.classList.remove('lit'));
            chips[idx % chips.length].classList.add('lit');
            idx++;
        }, 900);
    }


    // ── LASSO CANVAS ────────────────────────────
    const canvas = document.getElementById('lassoCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const demoArea = document.querySelector('.hero-demo');
    const capturedList = document.getElementById('capturedList');
    const capturedItemsEl = document.getElementById('capturedItems');
    const demoHint = document.getElementById('demoHint');

    const PLATFORMS = [
        'ChatGPT', 'Claude', 'Gemini', 'DeepSeek',
        'Grok', 'NotebookLM', 'Mistral', 'Perplexity', 'Copilot'
    ];

    // Chip state
    let chips = [];
    let captured = new Set();
    let drawing = false;
    let path = [];
    let animFrameId;

    function resize() {
        const rect = demoArea.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        placeChips();
    }

    function placeChips() {
        const w = canvas.width;
        const h = canvas.height;
        const margin = 60;
        chips = PLATFORMS.map((name, i) => ({
            name,
            x: margin + Math.random() * (w - margin * 2),
            y: margin + Math.random() * (h - margin * 2),
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            w: name.length * 8 + 28,
            h: 28,
        }));
    }

    function chipCenterInPath(chip, pathPoints) {
        if (pathPoints.length < 3) return false;
        const cx = chip.x;
        const cy = chip.y;
        let inside = false;
        for (let i = 0, j = pathPoints.length - 1; i < pathPoints.length; j = i++) {
            const xi = pathPoints[i].x, yi = pathPoints[i].y;
            const xj = pathPoints[j].x, yj = pathPoints[j].y;
            const intersect = ((yi > cy) !== (yj > cy)) &&
                (cx < (xj - xi) * (cy - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function drawChip(chip) {
        const isCaptured = captured.has(chip.name);

        ctx.save();
        ctx.strokeStyle = isCaptured ? '#d4541a' : '#333330';
        ctx.fillStyle   = isCaptured ? 'rgba(212,84,26,0.08)' : 'rgba(0,0,0,0)';
        ctx.lineWidth   = isCaptured ? 1.5 : 1;

        if (isCaptured) {
            ctx.setLineDash([4, 3]);
        } else {
            ctx.setLineDash([]);
        }

        const x = chip.x - chip.w / 2;
        const y = chip.y - chip.h / 2;
        ctx.fillRect(x, y, chip.w, chip.h);
        ctx.strokeRect(x, y, chip.w, chip.h);

        ctx.setLineDash([]);
        ctx.fillStyle = isCaptured ? '#d4541a' : '#6b6660';
        ctx.font = '500 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(chip.name, chip.x, chip.y);
        ctx.restore();
    }

    function drawLasso() {
        if (path.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            // Slight smoothing via midpoints
            const mx = (path[i - 1].x + path[i].x) / 2;
            const my = (path[i - 1].y + path[i].y) / 2;
            ctx.quadraticCurveTo(path[i - 1].x, path[i - 1].y, mx, my);
        }
        ctx.closePath();
        ctx.strokeStyle = '#d4541a';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -performance.now() / 50;
        ctx.stroke();
        ctx.fillStyle = 'rgba(212, 84, 26, 0.05)';
        ctx.fill();
        ctx.restore();
    }

    function tick() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Subtle grid
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        const gs = 40;
        for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.restore();

        // Move chips (only uncaptured drift slightly)
        chips.forEach(chip => {
            if (captured.has(chip.name)) return;
            chip.x += chip.vx;
            chip.y += chip.vy;
            if (chip.x - chip.w / 2 < 0 || chip.x + chip.w / 2 > w) chip.vx *= -1;
            if (chip.y - chip.h / 2 < 0 || chip.y + chip.h / 2 > h) chip.vy *= -1;
        });

        chips.forEach(drawChip);
        if (drawing) drawLasso();

        animFrameId = requestAnimationFrame(tick);
    }

    // Pointer events
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    }

    function onStart(e) {
        e.preventDefault();
        drawing = true;
        path = [getPos(e)];
        demoHint.style.opacity = '0';
        // Reset captures
        captured.clear();
        capturedList.classList.remove('visible');
        capturedItemsEl.innerHTML = '';
    }

    function onMove(e) {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        const last = path[path.length - 1];
        const dist = Math.hypot(pos.x - last.x, pos.y - last.y);
        if (dist > 6) path.push(pos); // Thin path — only add points with gap
    }

    function onEnd(e) {
        e.preventDefault();
        if (!drawing || path.length < 3) { drawing = false; path = []; return; }
        drawing = false;

        // Detect captures
        chips.forEach(chip => {
            if (chipCenterInPath(chip, path)) {
                captured.add(chip.name);
            }
        });

        path = [];

        if (captured.size > 0) {
            capturedItemsEl.innerHTML = '';
            captured.forEach(name => {
                const el = document.createElement('div');
                el.className = 'captured-chip';
                el.textContent = name;
                capturedItemsEl.appendChild(el);
            });
            capturedList.classList.add('visible');
        }
    }

    canvas.addEventListener('mousedown',  onStart, { passive: false });
    canvas.addEventListener('mousemove',  onMove,  { passive: false });
    canvas.addEventListener('mouseup',    onEnd,   { passive: false });
    canvas.addEventListener('mouseleave', onEnd,   { passive: false });
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove',  onMove,  { passive: false });
    canvas.addEventListener('touchend',   onEnd,   { passive: false });

    window.addEventListener('resize', resize, { passive: true });
    resize();
    tick();

});
