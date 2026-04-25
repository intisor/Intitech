document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const reveals = document.querySelectorAll('.reveal, .reveal-up');
    reveals.forEach(el => observer.observe(el));

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

    // Trigger the Z-logo transformation after the glide to top-left is done (10.5s)
    setTimeout(() => {
        const scissors = document.getElementById('scissors');
        if (scissors) {
            scissors.classList.add('transformed');
        }
    }, 10500);
});
