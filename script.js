document.addEventListener('DOMContentLoaded', () => {
    // ── Alphabet Shuffle Logic for Hero Title ────────────────────────────────────
    const shuffleLetters = document.querySelectorAll('.shuffle-letter');
    
    shuffleLetters.forEach((el, index) => {
        const target = el.getAttribute('data-target');
        let currentCode = 65; // 'A'
        
        setTimeout(() => {
            const interval = setInterval(() => {
                const currentLetter = String.fromCharCode(currentCode);
                el.innerText = currentLetter;
                
                if (currentLetter === target) {
                    clearInterval(interval);
                    el.style.color = 'inherit';
                } else {
                    currentCode++;
                    if (currentCode > 90) currentCode = 65;
                }
            }, 50 + (index * 10));
        }, index * 100);
    });

    // ── Phyllotaxis (Fibonacci Spiral) Background ───────────────────────────────
    const phyllotaxis = document.getElementById('phyllotaxis');
    if (phyllotaxis) {
        const dotCount = 200;
        const goldenAngle = 137.5 * (Math.PI / 180);

        for (let i = 0; i < dotCount; i++) {
            const r = 5 * Math.sqrt(i);
            const theta = i * goldenAngle;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);

            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.left = `calc(50% + ${x}px)`;
            dot.style.top = `calc(50% + ${y}px)`;
            dot.style.width = '2px';
            dot.style.height = '2px';
            dot.style.backgroundColor = 'var(--sediment)';
            dot.style.borderRadius = '50%';
            dot.style.opacity = Math.max(0, 1 - (r / 200));
            phyllotaxis.appendChild(dot);
        }
    }

    // ── Scroll Reveal Effect ───────────────────────────────────────────────────
    const setupReveal = () => {
        const reveals = document.querySelectorAll('.pcard, .about-text, .about-meta, .sinscription');
        reveals.forEach(el => {
            if (!el.dataset.revealSet) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'all 0.6s ease-out';
                el.dataset.revealSet = "true";
            }
        });

        const revealOnScroll = () => {
            for (let i = 0; i < reveals.length; i++) {
                const windowHeight = window.innerHeight;
                const elementTop = reveals[i].getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].style.opacity = '1';
                    reveals[i].style.transform = 'translateY(0)';
                }
            }
        };
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll();
    };

    // ── Portfolio Hydration Engine ─────────────────────────────────────────────
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5122' // Standard ASP.NET local port
        : 'https://api.intitech.dev';

    async function hydratePortfolio() {
        try {
            const start = performance.now();
            const response = await fetch(`${API_BASE}/portfolio/summary`);
            const end = performance.now();
            const latency = Math.round(end - start);

            if (!response.ok) throw new Error('API Sync Failed');
            
            const data = await response.json();
            
            // ── INSTANT METRIC UPDATES ──────────────────────────────────────────
            document.getElementById('repo-count').innerText = data.gitHub.profile.publicRepos;
            document.getElementById('active-projects-count-hero').innerText = data.projects.length.toString().padStart(2, '0');
            document.getElementById('active-projects-count').innerText = data.projects.length;
            
            // Real Response Time Update
            const latencyEl = document.getElementById('latency');
            if (latencyEl) latencyEl.innerText = `${latency}ms`;
            const tickerLatEl = document.getElementById('ticker-lat');
            if (tickerLatEl) tickerLatEl.innerText = latency;

            // Requests Today Update
            const requestsEl = document.getElementById('sys-requests');
            if (requestsEl) requestsEl.innerText = data.system.requestsToday.toLocaleString();
            
            const subtagEl = document.querySelector('.hero-subtag');
            if (subtagEl && data.about.subtag) subtagEl.innerText = data.about.subtag;

            // ── INSTANT PROJECT GRID SWAP ───────────────────────────────────────
            const projectGrid = document.getElementById('project-grid');
            
            // Create the new fragment for faster rendering
            const fragment = document.createDocumentFragment();
            
            data.projects.forEach((proj, idx) => {
                const card = document.createElement('div');
                card.className = 'pcard';
                card.style.opacity = '0'; // Prepare for fade-in
                card.style.transform = 'translateY(10px)';
                
                card.innerHTML = `
                    <div class="ptag">${(idx + 1).toString().padStart(2, '0')} · ${proj.tagline}</div>
                    <h3 class="pname">${proj.name}</h3>
                    <p class="pdesc">${proj.description}</p>
                    <div class="pstack">
                        ${proj.stack.map(s => `<span class="spill">${s}</span>`).join('')}
                    </div>
                    <div class="pfooter">
                        <div class="pmet">${proj.metrics}</div>
                        ${proj.codingTime ? `<div class="pwork mono">Logged: ${proj.codingTime}</div>` : ''}
                    </div>
                `;

                if (proj.link) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => window.open(proj.link, '_blank');
                }
                fragment.appendChild(card);
            });

            // Swap out the entire grid content at once for zero flicker
            projectGrid.style.opacity = '0.5';
            setTimeout(() => {
                projectGrid.innerHTML = '';
                projectGrid.appendChild(fragment);
                projectGrid.style.opacity = '1';
                
                // Trigger the reveal for new cards
                const newCards = projectGrid.querySelectorAll('.pcard');
                newCards.forEach((card, i) => {
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s ease-out';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, i * 50);
                });
            }, 50);

            // 3. System Panel
            document.getElementById('active-projects-count').innerText = data.projects.length;

            // 4. Skills Wall
            const skillsWall = document.getElementById('skills-wall');
            skillsWall.innerHTML = data.skills.map(skill => `
                <span class="sglyph tier-${skill.tier}">${skill.name}</span>
            `).join('');

            // 5. About Section
            const aboutBio = document.getElementById('about-bio');
            aboutBio.innerHTML = `
                <p class="about-opening">"${data.about.opening.replace('\n', '<br>')}"</p>
                <p>${data.about.bio}</p>
                <p>${data.about.careerGoal}</p>
                <p>${data.about.affiliations}</p>
            `;

            const aboutMeta = document.getElementById('about-meta-list');
            
            // Reverting to the exact JSON structure provided: gitHub.languages.percentages
            const languages = data.gitHub.languages?.percentages || {};
            const langKeys = Object.keys(languages);
            const primaryStack = langKeys.length >= 2 
                ? `${langKeys[0]} · ${langKeys[1]}` 
                : (langKeys[0] || 'C# · ASP.NET');

            const metaRows = [
                ['Location', data.about.location],
                ['Primary Stack', primaryStack],
                ['Status', data.about.status],
                ['Education', 'FUTA — Software Engineering'],
                ['Programme', 'MLSA Alpha'],
                ['Domain', 'intitech.dev']
            ];

            aboutMeta.innerHTML = metaRows.map(([label, val], idx) => `
                <div class="ameta-row" ${idx === metaRows.length - 1 ? 'style="border-bottom: none"' : ''}>
                    <span class="ameta-label">${label}</span>
                    <span class="ameta-val">${val}</span>
                </div>
            `).join('');

            // 6. Update Ticker
            const tickerLatEl = document.getElementById('ticker-lat');
            const latencyEl = document.getElementById('latency');
            
            const updateLatency = () => {
                const base = 20;
                const jitter = Math.floor(Math.random() * 15);
                const val = base + jitter;
                if (tickerLatEl) tickerLatEl.innerText = val;
                if (latencyEl) latencyEl.innerText = `${val}ms`;
            };
            setInterval(updateLatency, 3000);
            updateLatency();

            // Setup reveals for newly injected elements
            setupReveal();

        } catch (error) {
            console.warn('Hydration Offline:', error.message);
            // We keep the static backup projects visible in the DOM
        }
    }

    hydratePortfolio();

    // Console Signature
    console.log("%cINTITECH %c// I build what's needed.", "color: #c8612a; font-weight: bold; font-size: 20px;", "color: #6b6355; font-style: italic;");
});
