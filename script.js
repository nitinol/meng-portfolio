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
        const inputs = contactForm.querySelectorAll('input, textarea');
        const messageInput = document.getElementById('message');

        function checkValidity() {
            let allFilled = true;
            inputs.forEach(input => {
                if (!input.value.trim()) allFilled = false;
            });

            const messageLength = messageInput.value.length;
            const isMsgValid = messageLength >= 41;

            if (allFilled && isMsgValid) {
                submitBtn.classList.remove('disabled');
                return true;
            } else {
                submitBtn.classList.add('disabled');
                return false;
            }
        }

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                checkValidity();
                // Hide tooltip if user is typing
                tooltip.classList.remove('visible');
            });
        });

        // Click handler for passive button
        submitBtn.addEventListener('click', (e) => {
            if (submitBtn.classList.contains('disabled')) {
                e.preventDefault();
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
