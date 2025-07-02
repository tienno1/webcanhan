// index_animation.js

document.addEventListener('DOMContentLoaded', () => {
    // Listen for the DOM to be fully loaded

    // --- Animation on Scroll (Fade-in) ---
    const fadeInElements = document.querySelectorAll('.fade-in-element');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeInElements.forEach(element => {
        observer.observe(element);
    });

    // Back to Top & Go to Bottom Buttons
    const backToTopBtn = document.getElementById('back-to-top');
    const goToBottomBtn = document.getElementById('go-to-bottom');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.body.scrollHeight;

        if (scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

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

    // --- Background Image Slideshow ---
    const backgroundSlideshow = document.getElementById('background-slideshow');
    const prevBackgroundBtn = document.getElementById('prev-background');
    const nextBackgroundBtn = document.getElementById('next-background');

    const backgroundImages = [
        'img/nền.jpg',
        'img/hồng.jpg',
        'img/hồng x2.jpg',
        'img/hinh nen chi trinh.jpg',
        'img/hinh nen chi trinh 2.jpg',
        'img/tím.png',
        'img/thiên thần ác ma.jpg',
        'img/phong cách.jpg',
        'img/cổ trang.jpg',
        'img/biển.jpg'
    ];

    let currentImageIndex = 0;
    const slideshowIntervalTime = 5000; // 5 giây (5000 milliseconds) cho mỗi lần chuyển đổi tự động

    let slideshowInterval; // Biến để lưu trữ ID của interval

    // Hàm để cập nhật ảnh nền một cách mượt mà bằng CSS transition
    function updateBackgroundImage() {
        const nextImageUrl = backgroundImages[currentImageIndex];
        backgroundSlideshow.style.backgroundImage = `url('${nextImageUrl}')`;
        // CSS transition trên .background sẽ tự động xử lý hiệu ứng fade
    }

    // Hàm để khởi động lại interval
    function startSlideshow() {
        clearInterval(slideshowInterval);
        slideshowInterval = setInterval(() => {
            nextImageAuto();
        }, slideshowIntervalTime);
    }

    // Hàm chuyển ảnh tự động
    function nextImageAuto() {
        currentImageIndex++;
        if (currentImageIndex >= backgroundImages.length) {
            currentImageIndex = 0;
        }
        updateBackgroundImage(); // Gọi hàm cập nhật ảnh nền
    }

    // Initial background image
    updateBackgroundImage(); // Đặt ảnh đầu tiên

    // Khởi động slideshow lần đầu
    startSlideshow();

    prevBackgroundBtn.addEventListener('click', () => {
        clearInterval(slideshowInterval); // Dừng ngay lập tức
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = backgroundImages.length - 1;
        }
        updateBackgroundImage(); // Cập nhật ảnh nền
        startSlideshow(); // Bắt đầu lại slideshow sau 5 giây
    });

    nextBackgroundBtn.addEventListener('click', () => {
        clearInterval(slideshowInterval); // Dừng ngay lập tức
        currentImageIndex++; // Tăng index trước khi gọi update
        if (currentImageIndex >= backgroundImages.length) {
            currentImageIndex = 0;
        }
        updateBackgroundImage(); // Cập nhật ảnh nền
        startSlideshow(); // Bắt đầu lại slideshow sau 5 giây
    });

    // Note: The gentle text movement effect (.animated-text) is handled entirely by CSS animation (@keyframes)
    // and does not require JavaScript to be triggered based on scrolling in this example.

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
                nav.classList.remove('sticky-nav'); // Đảm bảo không có class sticky-nav trên mobile
                document.body.style.paddingTop = '0'; // Đảm bảo không có padding-top
            }
        }
    });

    // NEW: Close mobile nav when clicking outside
    const menuToggle = document.querySelector('.menu-toggle'); // Nút 3 gạch
    if (nav && menuToggle) {
        document.addEventListener('click', (event) => {
            // Kiểm tra nếu nav đang mở và click không phải trên nav hoặc nút toggle
            if (nav.classList.contains('open') && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
                nav.classList.remove('open'); // Đóng nav
            }
        });
    }
});
