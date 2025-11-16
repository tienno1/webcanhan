document.addEventListener('DOMContentLoaded', () => {

            // --- 1. Logic cho Loader ---
            const loaderOverlay = document.getElementById('loader-overlay');
            // Ẩn loader sau khi trang tải xong
            window.addEventListener('load', () => {
                loaderOverlay.classList.add('opacity-0');
                // Xóa khỏi DOM sau khi hiệu ứng kết thúc
                setTimeout(() => {
                    loaderOverlay.style.display = 'none';
                }, 500);
            });
        })