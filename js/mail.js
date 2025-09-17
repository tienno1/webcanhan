// mail.js
// Khởi tạo EmailJS với Public Key của bạn.
// Đây là chìa khóa công khai (Public Key) của bạn.
// VUI LÒNG THAY THẾ "YOUR_PUBLIC_KEY" BẰNG KHÓA CÔNG KHAI THỰC TẾ CỦA BẠN TỪ BẢNG ĐIỀU KHIỂN EMAILJS.
// Public Key mới của bạn là "X0dHr4HpO2r71CjtJ".
// Vui lòng truy cập https://dashboard.emailjs.com/admin/account để lấy khóa chính xác.
document.addEventListener('DOMContentLoaded', () => {

    // Khởi tạo EmailJS với Public Key của bạn.
    emailjs.init({
        publicKey: "X0dHr4HpO2r71CjtJ", 
    });

    const form = document.getElementById('contactForm');
    const formModal = document.getElementById('form-modal');
    const formModalMessage = document.getElementById('form-modal-message');
    const formModalClose = document.getElementById('form-modal-close');

    // Chức năng hiển thị và ẩn modal
    const showFormModal = (message) => {
        formModalMessage.textContent = message;
        formModal.style.display = 'flex';
    };

    const closeFormModal = () => {
        formModal.style.display = 'none';
    };

    formModalClose.onclick = closeFormModal;

    window.onclick = (event) => {
        if (event.target === formModal) {
            closeFormModal();
        }
    };

    // Lắng nghe sự kiện gửi form
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Ngăn form gửi đi theo cách truyền thống

        // Gửi email bằng EmailJS, sử dụng sendForm để gửi toàn bộ dữ liệu form
        emailjs.sendForm("service_piwyyzm", "template_t6ikeuu", form)
        .then(() => {
            showFormModal('Lời nhắn của bạn đã được gửi thành công!');
            form.reset();
            console.log('Thành công!');
        }, (error) => {
            console.error('Gửi thất bại:', error);
            showFormModal('Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.');
        });
    });

    // Các phần code khác...
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
        welcomeModal.querySelector('.close-button').addEventListener('click', () => {
            welcomeModal.style.display = 'none';
        });
    }

    const advancedViewToggle = document.querySelector('.advanced-view-toggle');
    if (advancedViewToggle) {
        advancedViewToggle.addEventListener('click', () => {
            document.body.classList.toggle('advanced-view-mode');
        });
    }

    const backToTopButton = document.getElementById('back-to-top');
    const goToBottomButton = document.getElementById('go-to-bottom');

    window.onscroll = () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            if (backToTopButton) backToTopButton.style.display = "block";
        } else {
            if (backToTopButton) backToTopButton.style.display = "none";
        }
    };

    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }

    if (goToBottomButton) {
        goToBottomButton.addEventListener('click', () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            const parent = this.closest('li');
            parent.classList.toggle('open');
        });
    });
});
