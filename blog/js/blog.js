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

    // Function to reveal elements on scroll for skill and contact items
    function revealOnScroll() {
        document.querySelectorAll('.skill-item img, .contact-item img, .timeline-item, .education-item, .contact-item').forEach(el => {
            const rect = el.getBoundingClientRect();
            // Check if element is within viewport with a small offset
            if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }
    // Add event listeners for scroll and initial load
    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('DOMContentLoaded', revealOnScroll);

     // --- Dropdown Menu Functionality (for navigation) ---
    document.querySelectorAll('.dropdown-toggle').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent document click from closing immediately

            // Close other open dropdowns
            document.querySelectorAll('.dropdown-menu.open').forEach(menu => {
                if (menu.parentElement !== this.parentElement) { // Only close if not the current dropdown
                    menu.classList.remove('open');
                    menu.previousElementSibling.classList.remove('open'); // Also remove 'open' from its button
                }
            });

            // Toggle current dropdown
            const dropdownMenu = this.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                dropdownMenu.classList.toggle('open');
                this.classList.toggle('open'); // Toggle 'open' class on the button itself
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-toggle')) {
            const dropdowns = document.querySelectorAll('.dropdown-menu');
            dropdowns.forEach(openDropdown => {
                if (openDropdown.classList.contains('open')) {
                    openDropdown.classList.remove('open');
                    openDropdown.previousElementSibling.classList.remove('open'); // Remove 'open' from button
                }
            });
        }
    });

    // --- Script for smooth page transitions on navigation links ---
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Check for external links or dropdown toggles
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

    // Add fade-in class on page load for initial content
    window.addEventListener('load', function() {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.classList.remove('fade-out');
            pageContent.classList.add('fade-in'); // Ensure it fades in if not already
        }
    });

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

    // NEW: Close mobile nav when clicking outside
    const menuToggle = document.querySelector('.menu-toggle'); // Nút 3 gạch
    // nav đã được khai báo ở trên
    if (nav && menuToggle) {
        document.addEventListener('click', (event) => {
            // Kiểm tra nếu nav đang mở và click không phải trên nav hoặc nút toggle
            if (nav.classList.contains('open') && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
                nav.classList.remove('open'); // Đóng nav
            }
        });
    }
});
