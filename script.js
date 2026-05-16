function initPortfolio() {
    const shuffleLetters = document.querySelectorAll('.shuffle-letter');
    console.log(`[INIT] Found ${shuffleLetters.length} shuffle letters.`);

    shuffleLetters.forEach((el, index) => {
        const target = el.getAttribute('data-target');
        let currentCode = 65;

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
            }, 50 + (index * 15));
        }, index * 120);
    });

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

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5122'
        : 'https://api.intitech.dev';

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"]|'/g, (character) => {
        const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return replacements[character] || character;
    });

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    };

    const animateNodes = (nodes, delayStep = 45) => {
        nodes.forEach((node, index) => {
            node.style.opacity = '0';
            node.style.transform = 'translateY(12px)';
            node.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

            requestAnimationFrame(() => {
                setTimeout(() => {
                    node.style.opacity = '1';
                    node.style.transform = 'translateY(0)';
                }, index * delayStep);
            });
        });
    };

    const markSectionReady = (element) => {
        if (element) {
            element.dataset.state = 'ready';
        }
    };

    const renderMetrics = (data, latency) => {
        const projectCount = Array.isArray(data.projects) ? data.projects.length : 0;
        const repoCount = data.gitHub?.profile?.publicRepos;
        const requestsToday = data.system?.requestsToday;

        setText('repo-count', Number.isFinite(repoCount) ? String(repoCount) : '--');
        setText('active-projects-count-hero', Number.isFinite(projectCount) ? String(projectCount).padStart(2, '0') : '--');
        setText('active-projects-count', Number.isFinite(projectCount) ? String(projectCount) : '--');
        setText('latency', Number.isFinite(latency) ? `${latency}ms` : '--');
        setText('ticker-lat', Number.isFinite(latency) ? String(latency) : '--');
        setText('sys-requests', Number.isFinite(requestsToday) ? requestsToday.toLocaleString() : '--');

        const subtagEl = document.querySelector('.hero-subtag');
        if (subtagEl && data.about?.subtag) {
            subtagEl.textContent = data.about.subtag;
        }
    };

    const renderProjects = (projects) => {
        const projectGrid = document.getElementById('project-grid');
        if (!projectGrid) {
            return;
        }

        const fragment = document.createDocumentFragment();
        const projectList = Array.isArray(projects) ? projects : [];

        if (projectList.length === 0) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'pcard';
            emptyCard.innerHTML = `
                <div class="ptag">LIVE DATA PENDING</div>
                <h3 class="pname">Static shell active</h3>
                <p class="pdesc">The project rail is waiting for the next API snapshot. Placeholder content remains visible so the page never lands empty.</p>
                <div class="pstack">
                    <span class="spill">READY</span>
                    <span class="spill">HYDRATION</span>
                    <span class="spill">LIVE JSON</span>
                </div>
                <div class="pfooter">
                    <div class="pmet">↗ Awaiting data</div>
                    <div class="pwork mono">Refreshing...</div>
                </div>
            `;
            fragment.appendChild(emptyCard);
        } else {
            projectList.forEach((project, index) => {
                const card = document.createElement('article');
                card.className = 'pcard';
                card.innerHTML = `
                    <div class="ptag">${String(index + 1).padStart(2, '0')} · ${escapeHtml(project.tagline || 'PROJECT')}</div>
                    <h3 class="pname">${escapeHtml(project.name || 'Untitled Project')}</h3>
                    <p class="pdesc">${escapeHtml(project.description || 'No description provided.')}</p>
                    <div class="pstack">
                        ${(Array.isArray(project.stack) ? project.stack : []).map((stackItem) => `<span class="spill">${escapeHtml(stackItem)}</span>`).join('')}
                    </div>
                    <div class="pfooter">
                        <div class="pmet">${escapeHtml(project.metrics || '')}</div>
                        ${project.codingTime ? `<div class="pwork mono">Logged: ${escapeHtml(project.codingTime)}</div>` : '<div class="pwork mono">Live sync</div>'}
                    </div>
                `;

                if (project.link) {
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => window.open(project.link, '_blank', 'noopener,noreferrer'));
                    card.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            window.open(project.link, '_blank', 'noopener,noreferrer');
                        }
                    });
                    card.tabIndex = 0;
                    card.setAttribute('role', 'link');
                }

                fragment.appendChild(card);
            });
        }

        projectGrid.replaceChildren(fragment);
        markSectionReady(projectGrid);
        animateNodes(Array.from(projectGrid.querySelectorAll('.pcard')));
    };

    const renderSkills = (skills) => {
        const skillsWall = document.getElementById('skills-wall');
        if (!skillsWall) {
            return;
        }

        const skillList = Array.isArray(skills) ? skills : [];
        if (skillList.length === 0) {
            skillsWall.innerHTML = '<span class="sglyph">SYNCING</span><span class="sglyph">SKILLS</span><span class="sglyph">WALL</span>';
        } else {
            skillsWall.innerHTML = skillList.map((skill) => `<span class="sglyph tier-${escapeHtml(skill.tier ?? 2)}">${escapeHtml(skill.name || 'SKILL')}</span>`).join('');
        }

        markSectionReady(skillsWall);
        animateNodes(Array.from(skillsWall.querySelectorAll('.sglyph')));
    };

    const renderAbout = (about, gitHub) => {
        const aboutBio = document.getElementById('about-bio');
        const aboutMeta = document.getElementById('about-meta-list');

        if (aboutBio && about) {
            const opening = about.opening ? escapeHtml(about.opening).replace(/\n/g, '<br>') : '';
            aboutBio.innerHTML = `
                <p class="about-opening">"${opening || 'Builder mode active.'}"</p>
                <p>${escapeHtml(about.bio || 'Waiting on the latest biography snapshot.')}</p>
                <p>${escapeHtml(about.careerGoal || 'Shipping practical systems that solve real problems.')}</p>
                <p>${escapeHtml(about.affiliations || 'No affiliations loaded yet.')}</p>
            `;
            markSectionReady(aboutBio);
        }

        if (aboutMeta && about) {
            const languages = gitHub?.languages?.percentages || {};
            const langKeys = Object.keys(languages);
            const primaryStack = langKeys.length >= 2
                ? `${langKeys[0]} · ${langKeys[1]}`
                : (langKeys[0] || 'C# · ASP.NET');

            const metaRows = [
                ['Location', about.location || 'Akure, Nigeria'],
                ['Primary Stack', primaryStack],
                ['Status', about.status || 'Building'],
                ['Education', 'FUTA — Software Engineering'],
                ['Programme', 'MLSA Alpha'],
                ['Domain', 'intitech.dev']
            ];

            aboutMeta.innerHTML = metaRows.map(([label, value], index) => `
                <div class="ameta-row" ${index === metaRows.length - 1 ? 'style="border-bottom: none"' : ''}>
                    <span class="ameta-label">${escapeHtml(label)}</span>
                    <span class="ameta-val">${escapeHtml(value)}</span>
                </div>
            `).join('');

            markSectionReady(aboutMeta);
            animateNodes([aboutBio, aboutMeta].filter(Boolean));
        }
    };

    async function hydratePortfolio() {
        try {
            const start = performance.now();
            const response = await fetch(`${API_BASE}/portfolio/summary`, { cache: 'no-store' });
            const latency = Math.round(performance.now() - start);

            if (!response.ok) {
                throw new Error('API Sync Failed');
            }

            const data = await response.json();

            renderMetrics(data, latency);

            requestAnimationFrame(() => {
                renderProjects(data.projects);
                renderSkills(data.skills);
                renderAbout(data.about, data.gitHub);
            });

            document.documentElement.dataset.portfolioState = 'ready';
        } catch (error) {
            console.warn('Hydration Offline:', error.message);
            document.documentElement.dataset.portfolioState = 'offline';
            setText('latency', '--');
            setText('ticker-lat', '--');
        }
    }

    hydratePortfolio();

    console.log("%cINTITECH %c// I build what's needed.", "color: #c8612a; font-weight: bold; font-size: 20px;", "color: #6b6355; font-style: italic;");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    initPortfolio();
}