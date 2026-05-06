document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1
    };

    const reveals = document.querySelectorAll('.reveal, .reveal-up');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
        reveals.forEach(el => el.classList.add('active'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        reveals.forEach(el => observer.observe(el));
    }

    // Smooth hover effect for hero image
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = heroVisual.getBoundingClientRect();
            
            const x = (clientX - left) / width - 0.5;
            const y = (clientY - top) / height - 0.5;

            const img = heroVisual.querySelector('img');
            if (img) {
                img.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
            }
        });

        heroVisual.addEventListener('mouseleave', () => {
            const img = heroVisual.querySelector('img');
            if (img) {
                img.style.transform = `perspective(1000px) rotateY(0) rotateX(0) scale(1)`;
            }
        });
    }

    // ── Onboarding Form Logic ──────────────────────────────────────────
    const onboardForm = document.getElementById('onboardForm');
    if (onboardForm) {
        onboardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const shopName = document.getElementById('shopNameInput').value;
            const currency = document.getElementById('currencySelect').value;
            
            if (shopName) {
                const baseUrl = 'https://zikfash.intitech.dev';
                const params = new URLSearchParams();
                params.set('ref', 'tailor');
                params.set('shop', shopName);
                params.set('currency', currency);
                window.location.href = `${baseUrl}?${params.toString()}`;
            }
        });
    }

    // Trigger the Z-logo transformation after the glide to top-left is done
    // Mobile: 8s animation + 2s delay + 0.5s buffer = 10.5s
    // Desktop: 10s animation + 2s delay + 0.5s buffer = 12.5s
    const isSmallMobile = window.matchMedia('(max-width: 480px)').matches;
    const transformationDelay = isSmallMobile ? 10500 : 12500;

    setTimeout(() => {
        const scissors = document.getElementById('scissors');
        const rig = document.getElementById('logo-rig');
        if (scissors) scissors.classList.add('transformed');
        if (rig) rig.classList.add('transformed');
    }, transformationDelay);
});
