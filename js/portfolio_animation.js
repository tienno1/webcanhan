new fullpage('#fullpage', {
  autoScrolling: true,
  navigation: true,
  // Cập nhật mảng anchors để khớp với data-anchor trong HTML
  anchors: ['about-me', 'so-thich', 'ky-nang', 'San-Pham', 'lien-he'],

  onLeave: function(origin, destination, direction) {
    const nav = document.getElementById('sideNav');
    const navItems = nav.querySelectorAll('ul li'); // Lấy tất cả các mục li trong nav
    const theme = destination.item.dataset.navTheme;
    const currentLogo = destination.item.dataset.logo; // Lấy đường dẫn logo từ data-logo của section hiện tại

    // Xử lý đổi theme
    if (theme === 'dark') {
      nav.classList.remove('light', 'green', 'blue'); // Đảm bảo loại bỏ tất cả các lớp theme khác
      nav.classList.add('dark');
    } else if (theme === 'green') {
      nav.classList.remove('light', 'dark', 'blue'); // Đảm bảo loại bỏ tất cả các lớp theme khác
      nav.classList.add('green');
    } else if (theme === 'blue') {
      nav.classList.remove('light', 'dark', 'green'); // Đảm bảo loại bỏ tất cả các lớp theme khác
      nav.classList.add('blue');
    } else { // light theme (mặc định)
      nav.classList.remove('dark', 'green', 'blue'); // Đảm bảo loại bỏ tất cả các lớp theme khác
      nav.classList.add('light');
    }

    // ===============================================
    // LOGIC THAY ĐỔI LOGO ĐÃ CẬP NHẬT
    // ===============================================
    const mainLogo = document.getElementById('logo-main'); // Lấy phần tử logo chính
    const defaultLogoSrc = '/img/logo_black.png'; // Logo mặc định (cho section đầu tiên)
    const scrollLogoSrc = '/img/logo.png'; // Logo khi cuộn (màu trắng, cho các section không phải đầu tiên và không có data-logo)

    // Nếu section có data-logo, sử dụng nó
    if (currentLogo) {
      mainLogo.src = currentLogo;
      mainLogo.style.display = 'block'; // Đảm bảo logo được hiển thị
    } else if (destination.index !== 0) {
      // Nếu không có data-logo và không phải section đầu tiên, dùng logo màu trắng
      mainLogo.src = scrollLogoSrc;
      mainLogo.style.display = 'block';
    } else {
      // Nếu là section đầu tiên và không có data-logo, dùng logo màu đen
      mainLogo.src = defaultLogoSrc;
      mainLogo.style.display = 'block';
    }
    // ===============================================

    // Cập nhật lớp 'active' cho các mục điều hướng
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.querySelector('a').getAttribute('href') === `#${destination.anchor}`) {
        item.classList.add('active');
      }
    });

    // Reset carousel index khi rời khỏi section "khach-hang" (section4)
    if (origin.anchor === 'San-Pham') {
        currentProductIndex = 0; // Đặt lại về thẻ đầu tiên khi rời đi
        // Không cần gọi updateProductCarousel() ở đây vì nó sẽ được gọi trong afterLoad khi quay lại
    }
  },

  // ===============================================
  // THÊM afterLoad ĐỂ XỬ LÝ KHI VÀO SECTION
  // ===============================================
  afterLoad: function(origin, destination, direction) {
    // Kiểm tra nếu section hiện tại là section "khach-hang" (section4)
    if (destination.anchor === 'San-Pham') {
      initializeProductCarousel(); // Khởi tạo/khởi tạo lại carousel khi section này được tải
    }
  }
});
// ... (các biến và hàm đã có) ...

// ================= Product Carousel Logic =================

let currentProductIndex = 0; // Chỉ số của thẻ sản phẩm đầu tiên đang hiển thị
let productsWrapper; // Phần tử wrapper chứa tất cả các thẻ
let productCards; // NodeList của tất cả các thẻ sản phẩm
let totalProductCards; // Tổng số thẻ sản phẩm
let productsPerView; // Số lượng thẻ sản phẩm hiển thị trên màn hình

let autoSlideInterval; // Biến để lưu trữ ID của setInterval

// Hàm bắt đầu tự động chuyển thẻ
function startAutoSlide() {
    // Chỉ khởi tạo nếu chưa có interval hoặc nếu carousel có thể cuộn
    if (autoSlideInterval || totalProductCards <= productsPerView) {
        return; // Đã chạy hoặc không cần tự động cuộn
    }
    autoSlideInterval = setInterval(() => {
        moveProductCarousel(1); // Tự động chuyển sang thẻ tiếp theo
    }, 10000); // 1000ms = 1 giây
}

// Hàm dừng tự động chuyển thẻ
function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Hàm xác định số lượng thẻ hiển thị dựa trên kích thước màn hình
function getProductsPerView() {
    if (window.innerWidth <= 768) { // Màn hình nhỏ (mobile)
        return 1;
    } else if (window.innerWidth <= 1024) { // Màn hình trung bình (tablet)
        return 2;
    } else { // Màn hình lớn (desktop)
        return 3;
    }
}

// Hàm khởi tạo và đặt lại carousel
function initializeProductCarousel() {
    productsWrapper = document.querySelector('.products-wrapper');
    if (!productsWrapper) {
        console.warn('products-wrapper element not found. Carousel cannot be initialized.');
        return;
    }

    productCards = document.querySelectorAll('.product-card');
    if (productCards.length === 0) {
        console.warn('No product-card elements found. Carousel will not function.');
        return;
    }

    totalProductCards = productCards.length;
    productsPerView = getProductsPerView(); // Xác định số thẻ hiển thị ban đầu

    // Lấy các nút điều hướng
    const prevButton = document.querySelector('.carousel-nav-button.prev-button');
    const nextButton = document.querySelector('.carousel-nav-button.next-button');

    // Chỉ thêm event listener một lần để tránh trùng lặp
    if (prevButton && !prevButton.dataset.listenerAttached) {
        prevButton.addEventListener('click', () => {
            stopAutoSlide(); // Dừng tự động chuyển khi người dùng tương tác
            moveProductCarousel(-1); // Di chuyển lùi
            startAutoSlide(); // Khởi động lại tự động chuyển sau một thời gian ngắn nếu muốn
        });
        prevButton.dataset.listenerAttached = 'true';
    }
    if (nextButton && !nextButton.dataset.listenerAttached) {
        nextButton.addEventListener('click', () => {
            stopAutoSlide(); // Dừng tự động chuyển khi người dùng tương tác
            moveProductCarousel(1); // Di chuyển tiến
            startAutoSlide(); // Khởi động lại tự động chuyển sau một thời gian ngắn nếu muốn
        });
        nextButton.dataset.listenerAttached = 'true';
    }

    updateProductCarousel(); // Cập nhật hiển thị carousel ban đầu

    // Bắt đầu tự động chuyển khi carousel được khởi tạo
    startAutoSlide();
}

// Hàm di chuyển carousel theo hướng (không thay đổi so với lần trước)
function moveProductCarousel(direction) {
    productsPerView = getProductsPerView();

    if (totalProductCards <= productsPerView) {
        currentProductIndex = 0;
        updateProductCarousel();
        return;
    }

    if (direction === -1) {
        currentProductIndex--;
        if (currentProductIndex < 0) {
            currentProductIndex = totalProductCards - productsPerView;
        }
    } else if (direction === 1) {
        currentProductIndex++;
        if (currentProductIndex > totalProductCards - productsPerView) {
            currentProductIndex = 0;
        }
    }
    updateProductCarousel();
}

// Hàm cập nhật trạng thái hiển thị của carousel (không thay đổi so với lần trước)
function updateProductCarousel() {
    if (!productsWrapper || !productCards || productCards.length === 0) return;

    productsPerView = getProductsPerView();

    if (totalProductCards <= productsPerView) {
        productsWrapper.style.transform = `translateX(0px)`;
        document.querySelector('.carousel-nav-button.prev-button')?.setAttribute('disabled', 'true');
        document.querySelector('.carousel-nav-button.next-button')?.setAttribute('disabled', 'true');
        // Dừng tự động chuyển nếu không cần cuộn
        stopAutoSlide();
        return;
    }

    const cardWidth = productCards[0].offsetWidth;
    const containerStyle = getComputedStyle(productsWrapper);
    const gap = parseFloat(containerStyle.gap) || 0;

    const offset = -currentProductIndex * (cardWidth + gap);
    productsWrapper.style.transform = `translateX(${offset}px)`;

    document.querySelector('.carousel-nav-button.prev-button')?.removeAttribute('disabled');
    document.querySelector('.carousel-nav-button.next-button')?.removeAttribute('disabled');

    // Nếu các nút được kích hoạt, đảm bảo tự động chuyển đang chạy
    // (Đây là một biện pháp an toàn, nhưng logic start/stop rõ ràng hơn)
    // startAutoSlide();
}

// Lắng nghe sự kiện thay đổi kích thước cửa sổ để cập nhật carousel responsive
window.addEventListener('resize', () => {
    const carouselSection = document.getElementById('section4');
    if (carouselSection && carouselSection.classList.contains('active')) {
        updateProductCarousel();
        // Khi resize, có thể thay đổi productsPerView, nên cần điều chỉnh lại auto-slide
        stopAutoSlide();
        startAutoSlide(); // Khởi động lại sau khi cập nhật layout
    }
});

// Điều khiển tự động chuyển thẻ khi vào/rời section Carousel của fullPage.js
// Thêm stopAutoSlide khi rời section và startAutoSlide khi vào section
new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    anchors: ['about-me', 'so-thich', 'ky-nang', 'khach-hang', 'lien-he'],

    onLeave: function(origin, destination, direction) {
        // ... (Logic theme và logo không thay đổi) ...

        // Reset carousel index khi rời khỏi section "khach-hang" (section4)
        if (origin.anchor === 'khach-hang') {
            currentProductIndex = 0; // Đặt lại về thẻ đầu tiên khi rời đi
            stopAutoSlide(); // Dừng tự động chuyển khi rời khỏi section
        }

        // ... (Logic cập nhật lớp 'active' cho navItems không thay đổi) ...
    },

    afterLoad: function(origin, destination, direction) {
        // Khởi tạo/khởi tạo lại carousel khi section "khach-hang" được tải
        if (destination.anchor === 'khach-hang') {
            initializeProductCarousel();
            startAutoSlide(); // Bắt đầu tự động chuyển khi vào section
        }
    }
});