// mail.js
// Khởi tạo EmailJS với Public Key của bạn.
// Đây là chìa khóa công khai (Public Key) của bạn.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const formModal = document.getElementById('form-modal');
    const formModalMessage = document.getElementById('form-modal-message');
    const formModalClose = document.getElementById('form-modal-close');

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

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        emailjs.sendForm('service_piwyyzm', 'template_t6ikeuu', form)
            .then(() => {
                showFormModal('Lời nhắn của bạn đã được gửi thành công!');
                form.reset();
                console.log('Thành công!');
            }, (error) => {
                console.error('Gửi thất bại:', error);
                // Thông báo lỗi chi tiết hơn từ EmailJS
                if (error.status === 400 && error.text.includes("Public Key is invalid")) {
                    showFormModal('Lỗi: Khóa công khai (Public Key) không hợp lệ. Vui lòng kiểm tra lại ID này trên EmailJS.');
                } else {
                    showFormModal('Gửi lời nhắn thất bại. Vui lòng thử lại sau.');
                }
            });
    });

    // Các logic modal welcome và nút cuộn trang
    const welcomeModal = document.getElementById('welcome-modal');
    const enableAdvancedViewButton = document.getElementById('enable-advanced-view');
    const laterAdvancedViewButton = document.getElementById('later-advanced-view');
    const backToTopButton = document.getElementById('back-to-top');
    const goToBottomButton = document.getElementById('go-to-bottom');
    const advancedViewToggle = document.getElementById('enable-advanced-view-button');

    const hideWelcomeModal = () => {
        welcomeModal.style.display = 'none';
    };

    if (!localStorage.getItem('advancedViewModalShown')) {
        welcomeModal.style.display = 'flex';
        localStorage.setItem('advancedViewModalShown', 'true');
    }

    enableAdvancedViewButton.addEventListener('click', () => {
        document.body.classList.add('advanced-view-mode');
        hideWelcomeModal();
    });

    laterAdvancedViewButton.addEventListener('click', () => {
        hideWelcomeModal();
    });

    welcomeModal.querySelector('.close-button').addEventListener('click', () => {
        hideWelcomeModal();
    });

    advancedViewToggle.addEventListener('click', () => {
        document.body.classList.toggle('advanced-view-mode');
    });

    // Scroll to top button
    window.onscroll = () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    };

    backToTopButton.addEventListener('click', () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    goToBottomButton.addEventListener('click', () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });

    // Giao diện người dùng
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Dropdowns
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });
});