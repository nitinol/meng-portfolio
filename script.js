document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    // LANGUAGE SELECTOR FUNCTIONALITY
    // =============================================

    // Current language (default: English)
    let currentLanguage = localStorage.getItem('portfolioLanguage') || 'en';

    // Initialize language on page load
    function initLanguage() {
        // Set initial language
        setLanguage(currentLanguage, false);

        // Update current language display
        const currentLangSpan = document.getElementById('currentLang');
        if (currentLangSpan) {
            currentLangSpan.textContent = currentLanguage.toUpperCase();
        }

        // Mark active language option
        updateActiveLanguageOption();
    }

    // Toggle language dropdown
    function toggleLanguageDropdown() {
        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.classList.toggle('open');
        }
    }
    // Attach to window for onclick/accessibility
    window.toggleLanguageDropdown = toggleLanguageDropdown;

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const selector = document.getElementById('langSelector');
        if (selector && !selector.contains(e.target)) {
            selector.classList.remove('open');
        }
    });

    // Set language function
    function setLanguage(lang, save = true) {
        currentLanguage = lang;

        // Save to localStorage
        if (save) {
            localStorage.setItem('portfolioLanguage', lang);
        }

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update current language display
        const currentLangSpan = document.getElementById('currentLang');
        if (currentLangSpan) {
            currentLangSpan.textContent = lang.toUpperCase();
        }

        // Apply translations
        applyTranslations(lang);

        // Update active option
        updateActiveLanguageOption();

        // Close dropdown
        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.classList.remove('open');
        }
    }
    // Attach to window for onclick
    window.setLanguage = setLanguage;

    function updateActiveLanguageOption() {
        const options = document.querySelectorAll('.lang-option');
        options.forEach(opt => {
            if (opt.dataset.lang === currentLanguage) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    function applyTranslations(lang) {
        // If English, restore original content
        if (lang === 'en') {
            // For English, we restore the original text stored in data attributes
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const originalText = el.dataset.originalText;
                if (originalText) {
                    el.innerHTML = originalText;
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const originalPlaceholder = el.dataset.originalPlaceholder;
                if (originalPlaceholder) {
                    el.placeholder = originalPlaceholder;
                }
            });
            return;
        }

        // For other languages, apply translations
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;

            // Store original text if not already stored
            if (!el.dataset.originalText) {
                el.dataset.originalText = el.innerHTML;
            }

            const translation = getTranslation(key, lang);
            if (translation) {
                el.innerHTML = translation;
            }
        });

        // Handle placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;

            // Store original placeholder if not already stored
            if (!el.dataset.originalPlaceholder) {
                el.dataset.originalPlaceholder = el.placeholder;
            }

            const translation = getTranslation(key, lang);
            if (translation) {
                el.placeholder = translation;
            }
        });
    }

    function getTranslation(key, lang) {
        // Check if translations object exists
        if (typeof translations === 'undefined') {
            console.warn('Translations object not found');
            return null;
        }

        // Parse nested keys like "hero.title" or "skills.skills.agile"
        const keys = key.split('.');
        let result = translations;

        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                return null;
            }
        }

        // Return the translation for the specified language
        if (result && result[lang] !== undefined) {
            return result[lang];
        }

        return null;
    }

    // Call init after all definitions
    initLanguage();

    // =============================================
    // END LANGUAGE SELECTOR
    // =============================================

    // 1. Dynamic Cursor Glow
    const cursorGlow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        // Lagged subtle movement for the big background glow
        const bgGlow = document.querySelector('.background-glow');
        if (bgGlow) {
            const moveX = (x / window.innerWidth) * 20;
            const moveY = (y / window.innerHeight) * 20;
            bgGlow.style.transform = `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`;
        }

        // Direct follow for the cursor highlighter
        if (cursorGlow) {
            cursorGlow.style.left = x + 'px';
            cursorGlow.style.top = y + 'px';
        }
    });

    // 2. Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optional: Stop observing once shown
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    // 3. Smooth Scroll for Nav Links (Optional, standard CSS works but this is robust)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Modal Logic
    window.openModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }
    };

    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    };

    // Close modal when clicking outside content
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
            document.body.style.overflow = "auto";
        }
    };

    // 5. Principle Cards Toggle
    window.togglePrinciple = function (card) {
        // Close other expanded cards (optional: remove if you want multiple open)
        const allCards = document.querySelectorAll('.principle-card');
        allCards.forEach(c => {
            if (c !== card && c.classList.contains('expanded')) {
                c.classList.remove('expanded');
            }
        });

        // Toggle the clicked card
        card.classList.toggle('expanded');

        // Smooth scroll to keep card in view when expanding
        if (card.classList.contains('expanded')) {
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    };

    // 6. Mobile Menu Toggle
    window.toggleMobileMenu = function () {
        const nav = document.getElementById('mainNav');
        const menuBtn = document.querySelector('.mobile-menu-btn');

        if (nav && menuBtn) {
            nav.classList.toggle('active');
            menuBtn.classList.toggle('active');
        }
    };

    // Close mobile menu when clicking a nav link
    document.querySelectorAll('#mainNav a').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('mainNav');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (nav && menuBtn) {
                nav.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    });

    // 7. Contact Form Validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const submitBtn = document.getElementById('submitBtn');
        const tooltip = document.getElementById('formTooltip');

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        function validateName(name) {
            return name.trim().split(/\s+/).length >= 2;
        }

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function checkValidity() {
            const isNameValid = validateName(nameInput.value);
            const isEmailValid = validateEmail(emailInput.value);
            const isMessageValid = messageInput.value.trim().length >= 35;

            if (isNameValid && isEmailValid && isMessageValid) {
                submitBtn.classList.remove('disabled');
                return true;
            } else {
                submitBtn.classList.add('disabled');
                return false;
            }
        }

        // Real-time validation
        [nameInput, emailInput, messageInput].forEach(input => {
            if (!input) return;
            input.addEventListener('input', () => {
                checkValidity();
                tooltip.classList.remove('visible');
            });
        });

        // Click handler for passive button with specific feedback
        submitBtn.addEventListener('click', (e) => {
            if (submitBtn.classList.contains('disabled')) {
                e.preventDefault();

                // Determine specific error message
                let errorMsg = "Please fill all required fields.";
                if (!validateName(nameInput.value)) errorMsg = "Name must include First and Last name.";
                else if (!validateEmail(emailInput.value)) errorMsg = "Please enter a valid email address.";
                else if (messageInput.value.trim().length < 35) errorMsg = "Reason for connecting must be at least 35 chars.";

                tooltip.textContent = errorMsg;
                tooltip.classList.add('visible');

                // Auto hide after 3 seconds
                setTimeout(() => {
                    tooltip.classList.remove('visible');
                }, 3000);
            }
        });
    }

    console.log("Menguhan's Portfolio Loaded and Ready");
});
