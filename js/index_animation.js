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
    const slideAnimationDuration = 0; // Thời gian hiệu ứng trượt (0.5 giây = 500ms)

    let slideshowInterval; // Biến để lưu trữ ID của interval

    function updateBackgroundImage(direction = 'fade') {
        const nextImageUrl = backgroundImages[currentImageIndex];

        // Xóa tất cả các lớp animation trước đó để tránh xung đột
        backgroundSlideshow.classList.remove('slide-out-left', 'slide-out-right', 'fade-in-bg');
        // Force reflow/repaint to ensure animations restart
        void backgroundSlideshow.offsetWidth; 

        if (direction === 'slide-left' || direction === 'slide-right') {
            // Khi chuyển bằng tay, chúng ta sẽ tạo hiệu ứng trượt cho ảnh cũ,
            // sau đó cập nhật ảnh mới sau khi animation trượt xong.

            // Đầu tiên, set ảnh mới vào background-image, nhưng nó sẽ bị ẩn đi bởi opacity của animation
            // Hoặc, giữ ảnh cũ và chỉ thay ảnh mới SAU animation
            
            // Cách đơn giản hóa: Ảnh cũ trượt đi, sau đó ảnh mới hiện ra (có thể là fade hoặc ngay lập tức)
            
            // Bước 1: Kích hoạt animation trượt cho ảnh HIỆN TẠI
            if (direction === 'slide-left') {
                backgroundSlideshow.classList.add('slide-out-left');
            } else {
                backgroundSlideshow.classList.add('slide-out-right');
            }

            // Bước 2: Sau khi animation trượt kết thúc, cập nhật ảnh mới và làm nó hiện lên
            setTimeout(() => {
                // Xóa lớp animation trượt
                backgroundSlideshow.classList.remove('slide-out-left', 'slide-out-right');
                // Cập nhật ảnh nền thành ảnh mới
                backgroundSlideshow.style.backgroundImage = `url('${nextImageUrl}')`;
                // Kích hoạt animation fade-in cho ảnh mới
                backgroundSlideshow.classList.add('fade-in-bg');

                // Sau khi animation fade-in kết thúc, xóa lớp fade-in-bg
                setTimeout(() => {
                    backgroundSlideshow.classList.remove('fade-in-bg');
                }, 0); // Thời gian fade-in-bg là 1s
            }, slideAnimationDuration); // Chờ animation trượt xong (0.5s)
            
        } else {
            // Chế độ fade mặc định (tự động chuyển)
            backgroundSlideshow.style.backgroundImage = `url('${nextImageUrl}')`;
            // CSS transition mặc định trên .background sẽ xử lý fade ở đây
            // background-image transition 2s ease-in-out trên .background là đủ cho fade tự động
        }
    }

    // Hàm để khởi động lại interval
    function startSlideshow() {
        clearInterval(slideshowInterval);
        slideshowInterval = setInterval(() => {
            nextImageAuto();
        }, slideshowIntervalTime);
    }

    // Hàm chuyển ảnh tự động (kiểu fade)
    function nextImageAuto() {
        currentImageIndex++;
        if (currentImageIndex >= backgroundImages.length) {
            currentImageIndex = 0;
        }
        // Gọi updateBackgroundImage mà không truyền direction để nó dùng default 'fade'
        backgroundSlideshow.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
        // Không cần thêm class 'fade-in-bg' ở đây nữa vì đã có transition trên .background
    }

    // Initial background image (fade-in ngay từ đầu)
    updateBackgroundImage('fade'); // Đặt ảnh đầu tiên kiểu fade

    // Khởi động slideshow lần đầu
    startSlideshow();

    prevBackgroundBtn.addEventListener('click', () => {
        clearInterval(slideshowInterval); // Dừng ngay lập tức
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = backgroundImages.length - 1;
        }
        updateBackgroundImage('slide-right'); // Chuyển ảnh kiểu slide từ phải
        startSlideshow(); // Bắt đầu lại slideshow sau 5 giây
    });

    nextBackgroundBtn.addEventListener('click', () => {
        clearInterval(slideshowInterval); // Dừng ngay lập tức
        currentImageIndex++; // Tăng index trước khi gọi update
        if (currentImageIndex >= backgroundImages.length) {
            currentImageIndex = 0;
        }
        updateBackgroundImage('slide-left'); // Chuyển ảnh kiểu slide từ trái
        startSlideshow(); // Bắt đầu lại slideshow sau 5 giây
    });

    // Note: The gentle text movement effect (.animated-text) is handled entirely by CSS animation (@keyframes)
    // and does not require JavaScript to be triggered based on scrolling in this example.
});