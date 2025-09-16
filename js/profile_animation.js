// Listen for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
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


    // Function to reveal elements on scroll for skill and contact items
    function revealOnScroll() {
        // Now apply to all .skill-item and .contact-item, not just img
        document.querySelectorAll('.skill-item, .contact-item, .education-item, .timeline-item').forEach(item => {
            const rect = item.getBoundingClientRect();
            if (rect.top < window.innerHeight - 80) { // Adjust offset if needed
                item.classList.add('visible'); // Add 'visible' class to trigger new CSS effects
            }
        });
    }
    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('DOMContentLoaded', revealOnScroll);


    // Back to Top & Go to Bottom Buttons
    const backToTopBtn = document.getElementById('back-to-top');
    const goToBottomBtn = document.getElementById('go-to-bottom');

    if (backToTopBtn && goToBottomBtn) { // Ensure buttons exist
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.body.scrollHeight;

            // Show back to top button when scrolled down
            if (scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }

            // Hide go to bottom button if near the end of the page
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
    } else {
        console.warn('Warning: "Back to Top" or "Go to Bottom" buttons not found.');
    }


    // --- Modal for advanced view on Profile page ---
    const welcomeModal = document.getElementById('welcome-modal');
    const closeButton = welcomeModal ? welcomeModal.querySelector('.close-button') : null;
    const enableAdvancedViewButton = document.getElementById('enable-advanced-view');
    const laterAdvancedViewButton = document.getElementById('later-advanced-view');
    const toggleAdvancedViewButton = document.getElementById('enable-advanced-view-button');

    const hasShownWelcomeModal = sessionStorage.getItem('hasShownWelcomeModal_profile');

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (welcomeModal) {
                welcomeModal.classList.remove('active');
                document.body.style.overflow = '';
                sessionStorage.setItem('hasShownWelcomeModal_profile', 'true');
            }
        });
    }

    if (enableAdvancedViewButton) {
        enableAdvancedViewButton.addEventListener('click', () => {
            if (welcomeModal) {
                welcomeModal.classList.remove('active');
                document.body.style.overflow = '';
                sessionStorage.setItem('hasShownWelcomeModal_profile', 'true');
                window.location.href = 'profile_ver2.html'; // Redirect to portfolio.html (if exists)
            }
        });
    }

    if (laterAdvancedViewButton) {
        laterAdvancedViewButton.addEventListener('click', () => {
            if (welcomeModal) {
                welcomeModal.classList.remove('active');
                document.body.style.overflow = '';
                sessionStorage.setItem('hasShownWelcomeModal_profile', 'true');
            }
        });
    }

    if (welcomeModal) {
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) {
                welcomeModal.classList.remove('active');
                document.body.style.overflow = '';
                sessionStorage.setItem('hasShownWelcomeModal_profile', 'true');
            }
        });
    }

    // --- New functionality for mobile button animation and modal logic ---
    const isMobile = () => window.matchMedia("(max-width: 992px)").matches;

    if (toggleAdvancedViewButton) {
        // Function to expand the button
        const expandButton = () => {
            if (isMobile()) {
                toggleAdvancedViewButton.classList.add('expanded');
            }
        };

        // Function to collapse the button
        const collapseButton = () => {
            if (isMobile()) {
                toggleAdvancedViewButton.classList.remove('expanded');
            }
        };

        // Initial check and apply collapsed state if on mobile
        if (isMobile()) {
            collapseButton(); // Ensure it starts collapsed on mobile
        }

        // Modified click listener for the button itself
        toggleAdvancedViewButton.addEventListener('click', (event) => {
            if (isMobile()) {
                event.stopPropagation(); // Prevent document click from immediately collapsing
                if (!toggleAdvancedViewButton.classList.contains('expanded')) {
                    // First click on mobile: expand the button
                    expandButton();
                } else {
                    // Second click on mobile (or already expanded): show the modal
                    if (welcomeModal) {
                        welcomeModal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            } else {
                // On desktop, always show modal on click
                if (welcomeModal) {
                    welcomeModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });

        // Add click listener to the document to collapse the button when clicking elsewhere
        document.addEventListener('click', (event) => {
            if (isMobile() && toggleAdvancedViewButton.classList.contains('expanded')) {
                // Collapse if click is outside the button and not the modal
                if (!toggleAdvancedViewButton.contains(event.target) && (!welcomeModal || !welcomeModal.contains(event.target))) {
                    collapseButton();
                }
            }
        });

        // Add scroll listener to collapse the button when scrolling
        window.addEventListener('scroll', () => {
            if (isMobile() && toggleAdvancedViewButton.classList.contains('expanded')) {
                collapseButton();
            }
        });

        // Handle resize to adjust button state based on screen size
        window.addEventListener('resize', () => {
            if (isMobile()) {
                // If resized to mobile, ensure it's collapsed unless modal is active
                if (!welcomeModal.classList.contains('active')) {
                    collapseButton();
                }
            } else {
                // If resized to desktop, remove mobile-specific styles and ensure button is fully visible
                toggleAdvancedViewButton.classList.remove('expanded');
                toggleAdvancedViewButton.style.width = ''; // Reset width/height/padding
                toggleAdvancedViewButton.style.height = '';
                toggleAdvancedViewButton.style.padding = '';
                toggleAdvancedViewButton.style.borderRadius = '';
                toggleAdvancedViewButton.style.textIndent = '';
                // Ensure the ::before pseudo-element is removed for desktop view
                toggleAdvancedViewButton.classList.remove('expanded'); // Re-apply to make sure ::before is gone
            }
        });
    }
    // End of new functionality

    // JavaScript for sticky navigation bar
    const nav = document.querySelector('.main-nav');
    const header = document.querySelector('header');
    let stickyOffset = 0; // Khởi tạo stickyOffset

    // Hàm để cập nhật stickyOffset
    const updateStickyOffset = () => {
        // Đảm bảo header đã được render và có offsetHeight
        if (header) {
            stickyOffset = header.offsetHeight; // Lấy chiều cao của header
        } else if (nav) { // Nếu không có header, lấy vị trí ban đầu của nav
            stickyOffset = nav.offsetTop;
        }
    };

    // Gọi lần đầu khi DOM đã tải xong
    updateStickyOffset();

    // Cập nhật stickyOffset khi cửa sổ thay đổi kích thước (ví dụ: xoay màn hình mobile)
    window.addEventListener('resize', updateStickyOffset);

    window.addEventListener('scroll', () => {
        if (nav) { // Đảm bảo nav tồn tại
            if (window.innerWidth >= 768) { // Chỉ áp dụng sticky cho desktop (màn hình >= 768px)
                if (window.pageYOffset > stickyOffset) {
                    nav.classList.add('sticky-nav');
                    // Thêm padding-top vào body để nội dung không bị ẩn bởi nav cố định
                    document.body.style.paddingTop = nav.offsetHeight + 'px';
                } else {
                    nav.classList.remove('sticky-nav');
                    // Xóa padding-top khi nav không còn dính
                    document.body.style.paddingTop = '0';
                }
            } else { // Đối với mobile (màn hình < 768px)
                // Trên mobile, loại bỏ hoàn toàn tính năng sticky và hiệu ứng trong suốt khi cuộn.
                // Thanh nav sẽ luôn giữ nguyên trạng thái mặc định của nó.
                nav.classList.remove('sticky-nav');
                document.body.style.paddingTop = '0';
            }
        }
    });

    // Script for smooth page transitions on navigation links (kept here as it's page-specific content transition)
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.target === '_blank' || this.href.startsWith('http') || this.classList.contains('dropdown-toggle')) {
                return; // Do not apply transition to external links or dropdown toggles
            }
            e.preventDefault(); // Prevent default link behavior
            const targetUrl = this.href;
            const pageContent = document.getElementById('page-content');
            if (pageContent) {
                pageContent.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 400); // Match with CSS transition time
            } else {
                window.location.href = targetUrl;
            }
        });
    });

    window.addEventListener('DOMContentLoaded', function () {
        const pageContent = document.getElementById('page-content');
        if (pageContent) pageContent.classList.add('fade-in');
    });

    // NEW: Close mobile nav when clicking outside
    const menuToggle = document.querySelector('.menu-toggle'); // Nút 3 gạch
    // nav đã được khai báo ở trên
    if (nav && menuToggle) {
        document.addEventListener('click', (event) => {
            // Kiểm tra nếu nav đang mở và click không phải trên nav hoặc nút toggle
            if (nav.classList.contains('open') && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
                nav.classList.remove('open'); // Đóng nav
                // Đảm bảo loại bỏ class 'toc-open' khỏi body để khôi phục cuộn
                document.body.classList.remove('toc-open');
            }
        });
    }
});
