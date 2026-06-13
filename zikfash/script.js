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
    const phoneInput = document.getElementById('phoneInput');
    const phoneInputWrap = document.getElementById('phoneInputWrap');
    const phoneError = document.getElementById('phoneError');

    function cleanPhoneInput(val) {
        let cleaned = '';
        for (let i = 0; i < val.length; i++) {
            let char = val[i];
            if (i === 0 && char === '+') {
                cleaned += char;
            } else if (/[\d\s\-()]/.test(char)) {
                cleaned += char;
            }
        }
        return cleaned;
    }

    function validatePhone() {
        if (!phoneInput) return false;
        const val = phoneInput.value.trim();
        if (!val) {
            phoneInputWrap.classList.remove('invalid-input');
            phoneError.style.display = 'none';
            phoneError.textContent = '';
            return false;
        }

        const phoneRegex = /^\+?[0-9\s\-()]+$/;
        const digits = val.replace(/\D/g, '');
        const isValid = phoneRegex.test(val) && digits.length >= 7 && digits.length <= 15;

        if (!isValid) {
            phoneInputWrap.classList.add('invalid-input');
            phoneError.style.display = 'flex';
            phoneError.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.95rem">error</span> Invalid format (7-15 digits allowed)';
            return false;
        } else {
            phoneInputWrap.classList.remove('invalid-input');
            phoneError.style.display = 'none';
            phoneError.textContent = '';
            return true;
        }
    }

    if (phoneInput) {
        phoneInput.addEventListener('keypress', (e) => {
            if (!/[0-9\s\-()+]/.test(e.key)) {
                e.preventDefault();
            }
        });

        phoneInput.addEventListener('input', () => {
            const cleaned = cleanPhoneInput(phoneInput.value);
            if (phoneInput.value !== cleaned) {
                phoneInput.value = cleaned;
            }
            validatePhone();
        });

        phoneInput.addEventListener('blur', () => {
            validatePhone();
        });
    }

    if (onboardForm) {
        onboardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const shopName = document.getElementById('shopNameInput').value;
            const phone = phoneInput ? phoneInput.value : '';
            const currency = document.getElementById('currencySelect').value;
            
            const isPhoneValid = validatePhone();
            if (!isPhoneValid) {
                if (phoneInputWrap) {
                    phoneInputWrap.classList.add('shake-input');
                    setTimeout(() => {
                        phoneInputWrap.classList.remove('shake-input');
                    }, 400);
                }
                return;
            }

            if (shopName && phone && currency) {
                const baseUrl = 'https://zikfash.intitech.dev';
                const params = new URLSearchParams();
                params.set('ref', 'tailor');
                params.set('shop', shopName);
                params.set('phone', phone);
                params.set('currency', currency);
                window.location.href = `${baseUrl}?${params.toString()}`;
            } else {
                alert("Please provide Shop Name, Phone Number, and Currency.");
            }
        });
    }

    // ── Features Carousel for Mobile (max-width: 768px) ───────────────
    const anchors = document.querySelectorAll('.carousel-anchor');
    const track = document.querySelector('.feature-grid');
    
    if (anchors.length > 0 && track) {
        anchors.forEach(anchor => {
            anchor.addEventListener('click', () => {
                const index = parseInt(anchor.getAttribute('data-index'));
                
                // Update active class on anchors
                anchors.forEach(a => a.classList.remove('active'));
                anchor.classList.add('active');
                
                // Slide track
                const offset = -index * 100;
                track.style.transform = `translateX(${offset}%)`;
            });
        });

        // Touch support for swiping
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        const container = document.querySelector('.carousel-track-container');

        if (container) {
            container.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isSwiping = true;
            }, { passive: true });

            container.addEventListener('touchmove', (e) => {
                if (!isSwiping) return;
                currentX = e.touches[0].clientX;
            }, { passive: true });

            container.addEventListener('touchend', () => {
                if (!isSwiping) return;
                isSwiping = false;
                const diffX = startX - currentX;
                const activeAnchor = document.querySelector('.carousel-anchor.active');
                if (!activeAnchor) return;
                let currentIndex = parseInt(activeAnchor.getAttribute('data-index'));

                if (Math.abs(diffX) > 50) { // Swipe threshold
                    if (diffX > 0 && currentIndex < anchors.length - 1) {
                        // Swipe left -> next slide
                        anchors[currentIndex + 1].click();
                    } else if (diffX < 0 && currentIndex > 0) {
                        // Swipe right -> prev slide
                        anchors[currentIndex - 1].click();
                    }
                }
            });
        }
    }

    // Trigger the Z-logo transformation after the glide to top-left is done
    // Mobile: 5.5s animation + 2s delay + 0.5s buffer = 8s
    // Desktop: 7s animation + 2s delay + 0.5s buffer = 9.5s
    const isSmallMobile = window.matchMedia('(max-width: 480px)').matches;
    const transformationDelay = isSmallMobile ? 8000 : 9500;

    setTimeout(() => {
        const scissors = document.getElementById('scissors');
        const rig = document.getElementById('logo-rig');
        if (scissors) scissors.classList.add('transformed');
        if (rig) rig.classList.add('transformed');
    }, transformationDelay);
});
