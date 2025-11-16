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

    // --- 3. Logic cho nút Lên/Xuống ---
            const backToTopBtn = document.getElementById('back-to-top');
            const goToBottomBtn = document.getElementById('go-to-bottom');

            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const docHeight = document.body.scrollHeight;

                // Nút Lên đầu trang
                if (scrollY > 300) {
                    backToTopBtn.classList.remove('opacity-0', 'invisible');
                } else {
                    backToTopBtn.classList.add('opacity-0', 'invisible');
                }

                // Nút Xuống cuối trang
                if (scrollY + windowHeight >= docHeight - 100) {
                    goToBottomBtn.style.display = 'none'; // Ẩn khi ở gần cuối
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
            
    // --- 4. Logic cho Background Slideshow ---
            const backgroundSlideshow = document.getElementById('background-slideshow');
            const prevBackgroundBtn = document.getElementById('prev-background');
            const nextBackgroundBtn = document.getElementById('next-background');

            // THAY THẾ bằng ảnh placeholder. Bạn có thể đổi lại link ảnh của mình.
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
            const slideshowIntervalTime = 5000; // 5 giây
            let slideshowInterval;

            function updateBackgroundImage() {
                const nextImageUrl = backgroundImages[currentImageIndex];
                backgroundSlideshow.style.backgroundImage = `url('${nextImageUrl}')`;
            }

            function startSlideshow() {
                clearInterval(slideshowInterval); // Xóa interval cũ
                slideshowInterval = setInterval(() => {
                    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
                    updateBackgroundImage();
                }, slideshowIntervalTime);
            }

            prevBackgroundBtn.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + backgroundImages.length) % backgroundImages.length;
                updateBackgroundImage();
                startSlideshow(); // Khởi động lại timer
            });

            nextBackgroundBtn.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
                updateBackgroundImage();
                startSlideshow(); // Khởi động lại timer
            });

            // Khởi động slideshow
            updateBackgroundImage();
            startSlideshow();

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
