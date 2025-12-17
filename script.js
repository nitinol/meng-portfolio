document.addEventListener('DOMContentLoaded', () => {
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

    // 5. Contact Form Validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const submitBtn = document.getElementById('submitBtn');
        const tooltip = document.getElementById('formTooltip');

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        // Define global callback for ReCaptcha
        window.recaptchaCallback = function () {
            checkValidity();
        };

        function validateName(name) {
            return name.trim().split(/\s+/).length >= 2;
        }

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function validateReCaptcha() {
            // Using reCAPTCHA Enterprise API
            if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.enterprise !== 'undefined') {
                try {
                    return grecaptcha.enterprise.getResponse().length !== 0;
                } catch (e) { return false; }
            }
            return false;
        }

        function checkValidity() {
            const isNameValid = validateName(nameInput.value);
            const isEmailValid = validateEmail(emailInput.value);
            const isMessageValid = messageInput.value.trim().length >= 35;
            const isReCaptchaValid = validateReCaptcha();

            if (isNameValid && isEmailValid && isMessageValid && isReCaptchaValid) {
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
                else if (!validateReCaptcha()) errorMsg = "Please complete the ReCaptcha verification.";

                tooltip.textContent = errorMsg;
                tooltip.classList.add('visible');

                // Auto hide after 3 seconds
                setTimeout(() => {
                    tooltip.classList.remove('visible');
                }, 3000);
            }
        });

        // Check validity periodically to catch ReCaptcha expiry or load
        setInterval(checkValidity, 1000);
    }

    console.log("Menguhan's Portfolio Loaded and Ready");
});
