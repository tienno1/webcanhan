document.addEventListener('DOMContentLoaded', () => {
    // Listen for the DOM to be fully loaded

    // --- Animation on Scroll (Fade-in) ---

    // Get all elements with the 'fade-in-element' class
    const fadeInElements = document.querySelectorAll('.fade-in-element');

    // Create an Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the element is currently in the viewport
            if (entry.isIntersecting) {
                // Add the 'is-visible' class to trigger CSS animations
                entry.target.classList.add('is-visible');
                // Stop observing the element after it has become visible
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Observer configuration
        threshold: 0.1 // Trigger when 10% of the element is in the viewport
    });

    // Start observing each element that needs the fade-in effect
    fadeInElements.forEach(element => {
        observer.observe(element);
    });

    // Note: The gentle text movement effect (.animated-text) is handled entirely by CSS animation (@keyframes)
    // and does not require JavaScript to be triggered based on scrolling in this example.
});


function revealOnScroll() {
    document.querySelectorAll('.skill-item img, .contact-item img').forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight - 40) {
            img.classList.add('visible');
        }
    });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('DOMContentLoaded', revealOnScroll);

// Back to Top & Go to Bottom Buttons
    const backToTopBtn = document.getElementById('back-to-top');
    const goToBottomBtn = document.getElementById('go-to-bottom');

    window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.body.scrollHeight;

    // Hiện nút lên đầu khi cuộn xuống
    if (scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
        }

    // Ẩn nút xuống nếu gần cuối trang
    if (scrollY + windowHeight >= docHeight - 100) {
        goToBottomBtn.style.display = 'none';
        } else {
        goToBottomBtn.style.display = 'block';
    }
    });

    backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    goToBottomBtn.addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});