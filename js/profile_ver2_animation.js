// Khởi tạo fullPage.js
let myFullpage; // Biến toàn cục để lưu trữ instance của fullPage.js

function initializeFullPage() {
  if (myFullpage) {
    myFullpage.destroy('all'); // Hủy instance cũ nếu có
  }
  myFullpage = new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    // Cập nhật mảng anchors để khớp với data-anchor trong HTML
    anchors: ['gioi-thieu', 'so-thich', 'ky-nang', 'san-pham', 'lien-he'],

    onLeave: function(origin, destination, direction) {
      const nav = document.getElementById('sideNav');
      const navItems = nav.querySelectorAll('ul li');
      const theme = destination.item.dataset.navTheme;
      const currentLogo = destination.item.dataset.logo;

      // Xử lý đổi theme cho nav
      nav.classList.remove('light', 'dark', 'green', 'blue', 'green-light');
      if (theme) {
        nav.classList.add(theme);
      } else {
        nav.classList.add('light'); // Mặc định là light nếu không có data-nav-theme
      }

      // Xử lý thay đổi logo
      const mainLogo = document.getElementById('logo-main');
      const defaultLogoSrc = 'img/logo_black.png'; // Logo mặc định (cho light theme)
      const darkLogoSrc = 'img/logo.png'; // Logo cho dark/colored themes

      if (currentLogo) {
        mainLogo.src = currentLogo;
        mainLogo.style.display = 'block';
      } else if (theme === 'dark' || theme === 'green' || theme === 'blue'|| theme === 'green-light') {
        mainLogo.src = darkLogoSrc;
        mainLogo.style.display = 'block';
      } else {
        mainLogo.src = defaultLogoSrc;
        mainLogo.style.display = 'block';
      }
      
      // Cập nhật lớp 'active' cho các mục điều hướng
      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('a').getAttribute('href') === `#${destination.anchor}`) {
          item.classList.add('active');
        }
      });

      // Carousel specific logic: Dừng tự động chuyển khi rời khỏi section "Sản Phẩm"
      if (origin.anchor === 'san-pham') {
          currentProductIndex = 0; // Đặt lại về thẻ đầu tiên khi rời đi
          stopAutoSlide(); // Dừng tự động chuyển
      }
      // Skill carousel logic: Dừng tự động chuyển khi rời khỏi section "Kỹ Năng"
      if (origin.anchor === 'ky-nang') {
          currentSkillIndex = 0; // Đặt lại về thẻ đầu tiên khi rời đi
          stopSkillAutoSlide(); // Dừng tự động chuyển
      }
    },

    afterLoad: function(origin, destination, direction) {
      // Carousel specific logic: Khởi tạo/khởi tạo lại và bắt đầu tự động chuyển khi vào section "Sản Phẩm"
      if (destination.anchor === 'san-pham') {
        initializeProductCarousel(); // Khởi tạo/re-initialize carousel
        startAutoSlide(); // Bắt đầu tự động chuyển
      }
      // Skill carousel logic: Khởi tạo/khởi tạo lại và bắt đầu tự động chuyển khi vào section "Kỹ Năng"
      if (destination.anchor === 'ky-nang') {
        initializeSkillCarousel(); // Khởi tạo/re-initialize skill carousel
        startSkillAutoSlide(); // Bắt đầu tự động chuyển
        // Animate skill bars when entering the section
        document.querySelectorAll('#section3 .skill-bar').forEach(bar => {
            const level = bar.dataset.level;
            // Using setTimeout to allow CSS transition to apply after layout render
            setTimeout(() => {
                bar.style.width = level;
            }, 100);
        });
      }
    }
  });
}


// ================= Product Carousel Logic =================

let currentProductIndex = 0; // Chỉ số của thẻ sản phẩm đầu tiên đang hiển thị
let productsWrapper; // Phần tử wrapper chứa tất cả các thẻ
let productCards; // NodeList của tất cả các thẻ sản phẩm
let totalProductCards; // Tổng số thẻ sản phẩm
let productsPerView; // Số lượng thẻ sản phẩm hiển thị trên màn hình

let autoSlideInterval; // Biến để lưu trữ ID của setInterval

// Hàm bắt đầu tự động chuyển thẻ sản phẩm
function startAutoSlide() {
    // Chỉ khởi tạo nếu chưa có interval hoặc nếu carousel có thể cuộn
    if (autoSlideInterval || totalProductCards <= productsPerView) {
        return; // Đã chạy hoặc không cần tự động cuộn
    }
    autoSlideInterval = setInterval(() => {
        moveProductCarousel(1); // Tự động chuyển sang thẻ tiếp theo
    }, 5000); // Tự động chuyển sau mỗi 5 giây
}

// Hàm dừng tự động chuyển thẻ sản phẩm
function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Hàm xác định số lượng thẻ sản phẩm hiển thị dựa trên kích thước màn hình
function getProductsPerView() {
    if (window.innerWidth <= 768) { // Màn hình nhỏ (mobile)
        return 1;
    } else if (window.innerWidth <= 1024) { // Màn hình trung bình (tablet)
        return 2;
    } else { // Màn hình lớn (desktop)
        return 3;
    }
}

// Hàm khởi tạo và đặt lại carousel sản phẩm
function initializeProductCarousel() {
    productsWrapper = document.querySelector('.products-wrapper');
    if (!productsWrapper) {
        console.warn('products-wrapper element not found. Product carousel cannot be initialized.');
        return;
    }

    productCards = document.querySelectorAll('.product-card');
    if (productCards.length === 0) {
        console.warn('No product-card elements found. Product carousel will not function.');
        return;
    }

    totalProductCards = productCards.length;
    productsPerView = getProductsPerView(); // Xác định số thẻ hiển thị ban đầu

    // Lấy các nút điều hướng
    const prevButton = document.querySelector('.carousel-nav-button.prev-button');
    const nextButton = document.querySelector('.carousel-nav-button.next-button');

    // Chỉ thêm event listener một lần để tránh trùng lặp
    // Kiểm tra data-listenerAttached để đảm bảo event listener chỉ được thêm 1 lần
    if (prevButton && !prevButton.dataset.listenerAttached) {
        prevButton.addEventListener('click', () => {
            stopAutoSlide(); // Dừng tự động chuyển khi người dùng tương tác
            moveProductCarousel(-1); // Di chuyển lùi
            // Để trống để người dùng có thể kích hoạt lại tự động chuyển sau khi dừng
        });
        prevButton.dataset.listenerAttached = 'true';
    }
    if (nextButton && !nextButton.dataset.listenerAttached) {
        nextButton.addEventListener('click', () => {
            stopAutoSlide(); // Dừng tự động chuyển khi người dùng tương tác
            moveProductCarousel(1); // Di chuyển tiến
            // Để trống để người dùng có thể kích hoạt lại tự động chuyển sau khi dừng
        });
        nextButton.dataset.listenerAttached = 'true';
    }

    updateProductCarousel(); // Cập nhật hiển thị carousel ban đầu
}

// Hàm di chuyển carousel sản phẩm theo hướng
function moveProductCarousel(direction) {
    productsPerView = getProductsPerView();

    if (totalProductCards <= productsPerView) {
        currentProductIndex = 0;
        updateProductCarousel();
        return;
    }

    if (direction === -1) { // Move left
        currentProductIndex--;
        if (currentProductIndex < 0) {
            currentProductIndex = totalProductCards - productsPerView; // Loop to end
        }
    } else if (direction === 1) { // Move right
        currentProductIndex++;
        if (currentProductIndex > totalProductCards - productsPerView) {
            currentProductIndex = 0; // Loop to beginning
        }
    }
    updateProductCarousel();
}

// Hàm cập nhật trạng thái hiển thị của carousel sản phẩm
function updateProductCarousel() {
    if (!productsWrapper || !productCards || productCards.length === 0) return;

    productsPerView = getProductsPerView();

    // Disable buttons if not enough cards to scroll
    if (totalProductCards <= productsPerView) {
        productsWrapper.style.transform = `translateX(0px)`; // Reset position
        document.querySelector('.carousel-nav-button.prev-button')?.setAttribute('disabled', 'true');
        document.querySelector('.carousel-nav-button.next-button')?.setAttribute('disabled', 'true');
        stopAutoSlide(); // Stop auto-slide if not scrollable
        return;
    } else {
        document.querySelector('.carousel-nav-button.prev-button')?.removeAttribute('disabled');
        document.querySelector('.carousel-nav-button.next-button')?.removeAttribute('disabled');
    }

    const cardWidth = productCards[0].offsetWidth;
    const containerStyle = getComputedStyle(productsWrapper);
    // Parse gap value, handle cases where it might be 'normal' or not a number
    const gap = parseFloat(containerStyle.gap) || 0;

    const offset = -currentProductIndex * (cardWidth + gap);
    productsWrapper.style.transform = `translateX(${offset}px)`;
}


// ================= Skill Carousel Logic =================

let currentSkillIndex = 0; // Chỉ số của thẻ kỹ năng đầu tiên đang hiển thị
let skillWrapper; // Phần tử wrapper chứa tất cả các thẻ kỹ năng
let skillCards; // NodeList của tất cả các thẻ kỹ năng
let totalSkillCards; // Tổng số thẻ kỹ năng
let skillsPerView; // Số lượng thẻ kỹ năng hiển thị trên màn hình

let skillAutoSlideInterval; // Biến để lưu trữ ID của setInterval cho kỹ năng

// Hàm bắt đầu tự động chuyển thẻ kỹ năng
function startSkillAutoSlide() {
    // Chỉ khởi tạo nếu chưa có interval hoặc nếu carousel có thể cuộn
    if (skillAutoSlideInterval || totalSkillCards <= skillsPerView) {
        return; // Đã chạy hoặc không cần tự động cuộn
    }
    skillAutoSlideInterval = setInterval(() => {
        moveSkillCarousel(1); // Tự động chuyển sang thẻ tiếp theo
    }, 5000); // Tự động chuyển sau mỗi 5 giây
}

// Hàm dừng tự động chuyển thẻ kỹ năng
function stopSkillAutoSlide() {
    if (skillAutoSlideInterval) {
        clearInterval(skillAutoSlideInterval);
        skillAutoSlideInterval = null;
    }
}

// Hàm xác định số lượng thẻ kỹ năng hiển thị dựa trên kích thước màn hình
function getSkillsPerView() {
    if (window.innerWidth <= 768) { // Màn hình nhỏ (mobile)
        return 1;
    } else if (window.innerWidth <= 1024) { // Màn hình trung bình (tablet)
        return 2;
    } else { // Màn hình lớn (desktop)
        return 3;
    }
}

// Hàm khởi tạo và đặt lại carousel kỹ năng
function initializeSkillCarousel() {
    skillWrapper = document.querySelector('.skill-grid'); // .skill-grid giờ là wrapper
    if (!skillWrapper) {
        console.warn('skill-grid element not found. Skill carousel cannot be initialized.');
        return;
    }

    skillCards = document.querySelectorAll('.skill-item');
    if (skillCards.length === 0) {
        console.warn('No skill-item elements found. Skill carousel will not function.');
        return;
    }

    totalSkillCards = skillCards.length;
    skillsPerView = getSkillsPerView(); // Xác định số thẻ hiển thị ban đầu

    // Lấy các nút điều hướng
    const prevButton = document.querySelector('.skill-nav-button.skill-prev-button');
    const nextButton = document.querySelector('.skill-nav-button.skill-next-button');

    // Chỉ thêm event listener một lần để tránh trùng lặp
    if (prevButton && !prevButton.dataset.listenerAttached) {
        prevButton.addEventListener('click', () => {
            stopSkillAutoSlide(); // Dừng tự động chuyển khi người dùng tương tác
            moveSkillCarousel(-1); // Di chuyển lùi
        });
        prevButton.dataset.listenerAttached = 'true';
    }
    if (nextButton && !nextButton.dataset.listenerAttached) {
        nextButton.addEventListener('click', () => {
            stopSkillAutoSlide(); // Dừng tự động chuyển khi người dùng tương tác
            moveSkillCarousel(1); // Di chuyển tiến
        });
        nextButton.dataset.listenerAttached = 'true';
    }

    updateSkillCarousel(); // Cập nhật hiển thị carousel ban đầu
}

// Hàm di chuyển carousel kỹ năng theo hướng
function moveSkillCarousel(direction) {
    skillsPerView = getSkillsPerView();

    if (totalSkillCards <= skillsPerView) {
        currentSkillIndex = 0;
        updateSkillCarousel();
        return;
    }

    if (direction === -1) { // Move left
        currentSkillIndex--;
        if (currentSkillIndex < 0) {
            currentSkillIndex = totalSkillCards - skillsPerView; // Loop to end
        }
    } else if (direction === 1) { // Move right
        currentSkillIndex++;
        if (currentSkillIndex > totalSkillCards - skillsPerView) {
            currentSkillIndex = 0; // Loop to beginning
        }
        }
    updateSkillCarousel();
}

// Hàm cập nhật trạng thái hiển thị của carousel kỹ năng
function updateSkillCarousel() {
    if (!skillWrapper || !skillCards || skillCards.length === 0) return;

    skillsPerView = getSkillsPerView();

    // Disable buttons if not enough cards to scroll
    if (totalSkillCards <= skillsPerView) {
        skillWrapper.style.transform = `translateX(0px)`; // Reset position
        document.querySelector('.skill-nav-button.skill-prev-button')?.setAttribute('disabled', 'true');
        document.querySelector('.skill-nav-button.skill-next-button')?.setAttribute('disabled', 'true');
        stopSkillAutoSlide(); // Stop auto-slide if not scrollable
        return;
    } else {
        document.querySelector('.skill-nav-button.skill-prev-button')?.removeAttribute('disabled');
        document.querySelector('.skill-nav-button.skill-next-button')?.removeAttribute('disabled');
    }

    const cardWidth = skillCards[0].offsetWidth;
    const containerStyle = getComputedStyle(skillWrapper);
    const gap = parseFloat(containerStyle.gap) || 0; // Lấy giá trị gap từ CSS

    const offset = -currentSkillIndex * (cardWidth + gap);
    skillWrapper.style.transform = `translateX(${offset}px)`;
}

// Lắng nghe sự kiện thay đổi kích thước cửa sổ để cập nhật carousel responsive
window.addEventListener('resize', () => {
    // Chỉ cập nhật carousel nếu đang ở section sản phẩm
    const productCarouselSection = document.getElementById('section4');
    if (productCarouselSection && myFullpage && myFullpage.getActiveSection().anchor === 'san-pham') {
        updateProductCarousel();
        // Khi resize, có thể thay đổi productsPerView, nên cần điều chỉnh lại auto-slide
        stopAutoSlide();
        startAutoSlide(); // Khởi động lại sau khi cập nhật layout
    }

    // Cập nhật skill carousel nếu đang ở section kỹ năng
    const skillCarouselSection = document.getElementById('section3');
    if (skillCarouselSection && myFullpage && myFullpage.getActiveSection().anchor === 'ky-nang') {
        updateSkillCarousel();
        stopSkillAutoSlide();
        startSkillAutoSlide(); // Khởi động lại sau khi cập nhật layout
    }
    
    // Kiểm tra và hiển thị/ẩn thông báo di động
    checkMobileView();
});

// Animate skill bars when the DOM is fully loaded.
// This ensures that the elements are available before attempting to animate.
document.addEventListener('DOMContentLoaded', () => {
    // Find all skill bars within the skill section
    // Use an Intersection Observer for a more robust animation when elements come into view
    const skillSection = document.getElementById('section3');
    if (skillSection) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.id === 'section3') {
                    // Start animation for skill bars when section 3 is visible
                    document.querySelectorAll('#section3 .skill-bar').forEach(bar => {
                        const level = bar.dataset.level;
                        setTimeout(() => {
                            bar.style.width = level;
                        }, 100); // Small delay to ensure CSS transition applies
                    });
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the section is visible

        observer.observe(skillSection);
    }

    // Khởi tạo fullPage.js và kiểm tra chế độ xem di động khi DOM được tải
    initializeFullPage();
    checkMobileView();

    // Lắng nghe sự kiện click cho các nút thông báo di động
    const mobileSwitchToNormal = document.getElementById('mobileSwitchToNormal');
    const mobileBackToIntro = document.getElementById('mobileBackToIntro');

    if (mobileSwitchToNormal) {
        mobileSwitchToNormal.addEventListener('click', () => {
            hideMobileWarning();
            // Có thể thêm logic để điều chỉnh hiển thị nếu "chế độ thường" là một phần của fullPage
            // Hiện tại, fullPage sẽ được kích hoạt lại khi ẩn warning
        });
    }

    if (mobileBackToIntro) {
        mobileBackToIntro.addEventListener('click', () => {
            // Chuyển hướng về trang giới thiệu (index.html hoặc section 1 của fullPage)
            if (myFullpage) {
                myFullpage.moveTo(1); // Quay về section đầu tiên
                hideMobileWarning();
            } else {
                window.location.href = 'index.html'; // Fallback nếu fullPage chưa được khởi tạo
            }
        });
    }
});


// ================= Mobile Warning Logic =================

const MOBILE_BREAKPOINT = 768; // Định nghĩa breakpoint cho thiết bị di động

function showMobileWarning() {
    const overlay = document.getElementById('mobileOverlay');
    const warningBox = document.getElementById('mobileWarningBox');
    const fullpageElement = document.getElementById('fullpage');

    if (overlay && warningBox) {
        overlay.style.display = 'block';
        warningBox.style.display = 'flex'; // Dùng flex để căn giữa nội dung
        
        // Vô hiệu hóa fullPage.js khi thông báo hiển thị
        if (myFullpage) {
            myFullpage.destroy('all'); // Tắt fullPage.js
            fullpageElement.classList.add('mobile-fallback-scroll'); // Cho phép cuộn trên mobile
        }
        document.body.style.overflow = 'hidden'; // Ngăn cuộn trang chính
    }
}

function hideMobileWarning() {
    const overlay = document.getElementById('mobileOverlay');
    const warningBox = document.getElementById('mobileWarningBox');
    const fullpageElement = document.getElementById('fullpage');

    if (overlay && warningBox) {
        overlay.style.display = 'none';
        warningBox.style.display = 'none';
        
        // Kích hoạt lại fullPage.js khi thông báo ẩn
        if (!myFullpage) { // Chỉ khởi tạo lại nếu nó đã bị hủy
            initializeFullPage();
            fullpageElement.classList.remove('mobile-fallback-scroll'); // Xóa cuộn fallback
        }
        document.body.style.overflow = ''; // Cho phép cuộn trang trở lại
    }
}

function checkMobileView() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        // Nếu là mobile và fullPage đang hoạt động, hiển thị cảnh báo
        if (myFullpage) { // Kiểm tra myFullpage để đảm bảo nó đã được khởi tạo
            showMobileWarning();
        }
    } else {
        // Nếu không phải mobile, ẩn cảnh báo
        hideMobileWarning();
    }
}
