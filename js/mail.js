// mail.js

// 1. Khởi tạo EmailJS ngay bên ngoài để đảm bảo nó sẵn sàng
// Đảm bảo bạn đã cài đặt đúng Service ID và Template ID của chính mình
const PUBLIC_KEY = "X0dHr4HpO2r71CjtJ"; // Public Key của bạn
const SERVICE_ID = "service_piwyyzm";   // Service ID của bạn
const TEMPLATE_ID = "template_t6ikeuu"; // Template ID của bạn

(function() {
    // Kiểm tra xem thư viện đã load chưa
    if (typeof emailjs === "undefined") {
        console.error("Lỗi: Thư viện EmailJS chưa được tải. Hãy kiểm tra lại kết mạng hoặc AdBlock.");
        return;
    }
    emailjs.init({
        publicKey: PUBLIC_KEY,
    });
    console.log("EmailJS đã được khởi tạo!");
})();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const formModal = document.getElementById('form-modal');
    const formModalMessage = document.getElementById('form-modal-message');
    const formModalClose = document.getElementById('form-modal-close');
    const submitButton = form.querySelector('button[type="submit"]'); // Lấy nút gửi

    // Chức năng hiển thị modal
    const showFormModal = (message, isError = false) => {
        formModalMessage.textContent = message;
        formModalMessage.style.color = isError ? 'red' : 'green'; // Đổi màu chữ tùy trạng thái
        formModal.style.display = 'flex';
    };

    const closeFormModal = () => {
        formModal.style.display = 'none';
    };

    if (formModalClose) formModalClose.onclick = closeFormModal;

    window.onclick = (event) => {
        if (event.target === formModal) {
            closeFormModal();
        }
    };

    // Lắng nghe sự kiện gửi form
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Ngăn form load lại trang

            // Đổi trạng thái nút để người dùng biết đang gửi
            const originalBtnText = submitButton.innerText;
            submitButton.innerText = "Đang gửi...";
            submitButton.disabled = true;

            // Gửi email
            emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form)
                .then(() => {
                    showFormModal('✅ Lời nhắn của bạn đã được gửi thành công!');
                    form.reset(); // Xóa dữ liệu trong form
                    console.log('Gửi mail thành công!');
                })
                .catch((error) => {
                    console.error('Gửi thất bại. Chi tiết lỗi:', error);
                    // Hiển thị lỗi chi tiết hơn nếu có (thường là lỗi 400 hoặc 412)
                    let errorMsg = 'Rất tiếc, đã có lỗi xảy ra. ';
                    if (error.status === 412) {
                        errorMsg += 'Sai Public Key hoặc chưa lưu thay đổi trên Dashboard.';
                    } else if (error.text) {
                        errorMsg += error.text;
                    }
                    showFormModal(errorMsg, true);
                })
                .finally(() => {
                    // Khôi phục nút gửi dù thành công hay thất bại
                    submitButton.innerText = originalBtnText;
                    submitButton.disabled = false;
                });
        });
    } else {
        console.error("Không tìm thấy form có id='contactForm'");
    }

    // --- Phần code cũ của bạn (giữ nguyên) ---
    
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

    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            if (backToTopButton) {
                backToTopButton.style.opacity = "1";
                backToTopButton.style.visibility = "visible";
            }
        } else {
            if (backToTopButton) {
                backToTopButton.style.opacity = "0";
                backToTopButton.style.visibility = "hidden";
            }
        }
    });

    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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