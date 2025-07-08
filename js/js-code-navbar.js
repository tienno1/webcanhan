document.addEventListener('DOMContentLoaded', function () {
  const dropdowns = document.querySelectorAll('.dropdown');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav.main-nav');

  dropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('.dropdown-toggle');

    // Sử dụng sự kiện click để mở/đóng dropdown trên cả mobile và desktop
    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền lên document
      dropdown.classList.toggle('open');

      // Đóng các dropdown khác khi một dropdown được mở
      dropdowns.forEach(otherDropdown => {
        if (otherDropdown !== dropdown && otherDropdown.classList.contains('open')) {
          otherDropdown.classList.remove('open');
        }
      });
    });

    // Đóng dropdown khi click ra ngoài (chỉ áp dụng cho desktop nếu không phải mobile menu đang mở)
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && !nav.classList.contains('open')) {
        dropdown.classList.remove('open');
      }
    });
  });

  // Chuyển đổi menu di động
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      // Chuyển đổi lớp 'nav-open' trên menuToggle để thay đổi màu biểu tượng
      menuToggle.classList.toggle('nav-open');
      // Chuyển đổi lớp 'rotated' để thêm hiệu ứng xoay
      menuToggle.classList.toggle('rotated');

      // Nếu nav đóng, đánh giá lại vị trí cuộn để thay đổi màu
      if (!nav.classList.contains('open')) {
        updateMenuToggleColor(); // Gọi hàm để đặt màu dựa trên cuộn
        // Đảm bảo tất cả các dropdown đóng khi menu mobile đóng
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('open');
        });
      }
    });
  }

  // Nút Lên đầu trang & Xuống cuối trang
  const backToTopBtn = document.getElementById('back-to-top');
  const goToBottomBtn = document.getElementById('go-to-bottom');

  function updateMenuToggleColor() {
    const scrollY = window.scrollY;
    const scrollThreshold = 200; // Điều chỉnh giá trị này nếu cần

    // Nếu nav đang mở, biểu tượng luôn có màu trắng và xoay
    if (nav.classList.contains('open')) {
      menuToggle.classList.add('nav-open');
      menuToggle.classList.remove('scrolled');
      menuToggle.classList.add('rotated'); // Giữ xoay khi nav mở
      return;
    }

    // Nếu nav đóng, áp dụng màu dựa trên vị trí cuộn và loại bỏ xoay
    if (scrollY > scrollThreshold) {
      menuToggle.classList.add('scrolled'); // Chuyển sang màu đen
      menuToggle.classList.remove('nav-open');
    } else {
      menuToggle.classList.remove('scrolled'); // Chuyển sang màu trắng
      menuToggle.classList.remove('nav-open');
    }
    menuToggle.classList.remove('rotated'); // Loại bỏ xoay khi nav đóng
  }

  window.addEventListener('scroll', updateMenuToggleColor);
  window.addEventListener('resize', updateMenuToggleColor);
  // Kiểm tra ban đầu khi tải trang
  updateMenuToggleColor();

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
});
