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
