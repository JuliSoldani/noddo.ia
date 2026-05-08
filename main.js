document.addEventListener('DOMContentLoaded', () => {

    /* --- Theme Toggle Logic --- */
    const themeToggleBtn = document.getElementById('themeToggle');
    const root = document.documentElement;
    const THEME_STORAGE_KEY = 'noddoThemeV4';

    // Check for saved theme
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        root.setAttribute('data-theme', savedTheme);
        updateToggleIcon(savedTheme);
    } else if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
        updateToggleIcon('dark');
    }

    function updateToggleIcon(theme) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀' : '☾';
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        root.setAttribute('data-theme', newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        updateToggleIcon(newTheme);
    });

    /* --- FAQ Accordion --- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-a');
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-a').style.maxHeight = null;
            });

            // Open clicked
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    /* --- Smooth Scroll --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetNode = document.querySelector(targetId);
            if (targetNode) {
                window.scrollTo({
                    top: targetNode.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* --- Mouse Glow Tracking (Hero) --- */
    const heroSection = document.getElementById('hero-section');
    const pointerGlow = document.getElementById('pointer-glow');

    if (heroSection && pointerGlow) {
        let mouseX = 0;
        let mouseY = 0;
        let glowX = 0;
        let glowY = 0;
        // Interpolation factor for smoothness (0.05 is very subtle and delicate)
        const ease = 0.05;

        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            // Calculate mouse position relative to the hero section
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        // Initialize positions if needed
        heroSection.addEventListener('mouseenter', (e) => {
            const rect = heroSection.getBoundingClientRect();
            glowX = mouseX = e.clientX - rect.left;
            glowY = mouseY = e.clientY - rect.top;
            pointerGlow.style.opacity = '1';
        });

        heroSection.addEventListener('mouseleave', () => {
            pointerGlow.style.opacity = '0';
        });

        function animateGlow() {
            // Linear interpolation (Lerp) for smooth following
            glowX += (mouseX - glowX) * ease;
            glowY += (mouseY - glowY) * ease;

            // Apply transform
            pointerGlow.style.left = `${glowX}px`;
            pointerGlow.style.top = `${glowY}px`;

            requestAnimationFrame(animateGlow);
        }

        animateGlow();
    }

    /* --- Contact Modal Logic --- */
    const modal = document.getElementById('contactModal');
    const openModalBtns = document.querySelectorAll('.open-contact-modal');
    const closeModalBtn = document.getElementById('closeModal');
    const contactForm = document.getElementById('contactForm');

    // Open modal
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle form submit (Formspree Integration)
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Feedback visual: Estado de carga
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('https://formspree.io/f/xzdojeqy', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Éxito
                    submitBtn.textContent = '¡Mensaje Enviado!';
                    submitBtn.style.backgroundColor = '#10b981'; // Verde de éxito
                    
                    setTimeout(() => {
                        closeModal();
                        contactForm.reset();
                        // Restaurar el botón para futuros usos
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.style.backgroundColor = '';
                    }, 2000);
                } else {
                    // Error de Formspree (ej. validación)
                    submitBtn.textContent = 'Error al enviar';
                    submitBtn.style.backgroundColor = '#F95046'; // Rojo
                    setTimeout(() => {
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.style.backgroundColor = '';
                    }, 3000);
                }
            } catch (error) {
                // Error de red
                console.error('Error enviando el formulario:', error);
                submitBtn.textContent = 'Error de conexión';
                submitBtn.style.backgroundColor = '#F95046'; // Rojo
                setTimeout(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }
        });
    }

    /* --- Cookie Consent Logic --- */
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    const rejectCookiesBtn = document.getElementById('rejectCookies');
    const COOKIE_STORAGE_KEY = 'noddoCookieConsent';

    // Función para inyectar scripts de validación (Ej. Google Analytics)
    function loadValidationScripts() {
        // ATENCIÓN: Reemplaza 'G-XXXXXXXXXX' por tu ID de medición real de Analytics
        const TRACKING_ID = 'G-XXXXXXXXXX'; 

        // Evitar cargar múltiples veces si ya existe
        if (document.getElementById('google-analytics')) return;

        const script = document.createElement('script');
        script.id = 'google-analytics';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', TRACKING_ID);

        console.log('✅ Scripts de validación cargados (Google Analytics).');
    }

    if (cookieBanner) {
        const currentConsent = localStorage.getItem(COOKIE_STORAGE_KEY);

        // Si no hay decisión, mostramos el banner
        if (!currentConsent) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 1000);
        } else if (currentConsent === 'accepted') {
            // Si ya había aceptado antes, cargamos los scripts de una
            loadValidationScripts();
        }

        const hideBanner = () => {
            cookieBanner.classList.remove('show');
        };

        if (acceptCookiesBtn) {
            acceptCookiesBtn.addEventListener('click', () => {
                localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
                hideBanner();
                loadValidationScripts();
            });
        }

        if (rejectCookiesBtn) {
            rejectCookiesBtn.addEventListener('click', () => {
                localStorage.setItem(COOKIE_STORAGE_KEY, 'rejected');
                hideBanner();
                console.log('❌ Cookies rechazadas. Los scripts de validación no se cargarán.');
            });
        }
    }

});
