document.addEventListener('DOMContentLoaded', () => {
    // Alphabet Shuffle Logic for Hero Title
    const shuffleLetters = document.querySelectorAll('.shuffle-letter');
    
    shuffleLetters.forEach((el, index) => {
        const target = el.getAttribute('data-target');
        let currentCode = 65; // 'A'
        
        // Add a small delay for each letter to make it staggered
        setTimeout(() => {
            const interval = setInterval(() => {
                const currentLetter = String.fromCharCode(currentCode);
                el.innerText = currentLetter;
                
                if (currentLetter === target) {
                    clearInterval(interval);
                    el.style.color = 'inherit'; // Reset to CSS color
                } else {
                    currentCode++;
                    if (currentCode > 90) currentCode = 65; // Loop A-Z if target not found (fallback)
                }
            }, 50 + (index * 10)); // Staggered speed
        }, index * 100);
    });

    // Live Latency Simulation
    const latencyEl = document.getElementById('latency');
    const tickerLatEl = document.getElementById('ticker-lat');

    function updateLatency() {
        const baseLatency = 20;
        const jitter = Math.floor(Math.random() * 15);
        const currentLatency = baseLatency + jitter;
        
        if (latencyEl) latencyEl.innerText = `${currentLatency}ms`;
        if (tickerLatEl) tickerLatEl.innerText = currentLatency;
    }

    setInterval(updateLatency, 3000);

    // Phyllotaxis (Fibonacci Spiral) Background
    const phyllotaxis = document.getElementById('phyllotaxis');
    if (phyllotaxis) {
        const dotCount = 200;
        const goldenAngle = 137.5 * (Math.PI / 180);
        const radius = 2;

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

    // Scroll Reveal Effect
    const reveals = document.querySelectorAll('.pcard, .about-text, .about-meta, .sinscription');
    
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

    // Set initial styles for reveal
    reveals.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Fetch GitHub Data
    async function fetchGitHubStats() {
        try {
            // User stats
            const userResponse = await fetch('https://api.github.com/users/intisor');
            if (userResponse.ok) {
                const userData = await userResponse.json();
                const repoCountEl = document.getElementById('repo-count');
                if (repoCountEl) repoCountEl.innerText = userData.public_repos;
            }

            // Recent events for latest hash
            const eventsResponse = await fetch('https://api.github.com/users/intisor/events/public');
            if (eventsResponse.ok) {
                const events = await eventsResponse.json();
                const pushEvent = events.find(e => e.type === 'PushEvent');
                if (pushEvent && pushEvent.payload.commits.length > 0) {
                    const hash = pushEvent.payload.commits[0].sha.substring(0, 7);
                    const hashEl = document.getElementById('latest-hash');
                    if (hashEl) hashEl.innerText = hash.toUpperCase();
                }
            }
        } catch (error) {
            console.error('GitHub Sync Error:', error);
            const hashEl = document.getElementById('latest-hash');
            if (hashEl) hashEl.innerText = 'OFFLINE';
        }
    }

    fetchGitHubStats();

    // Console Signature
    console.log("%cINTITECH %c// I build what's needed.", "color: #c8612a; font-weight: bold; font-size: 20px;", "color: #6b6355; font-style: italic;");
});
