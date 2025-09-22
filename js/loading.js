// script.js

// Lắng nghe sự kiện khi toàn bộ trang đã tải xong
window.addEventListener('load', function() {
    const loaderOverlay = document.getElementById('loader-overlay');
    
    // Sử dụng setTimeout để hoãn việc ẩn loading
    // Thời gian hoãn được tính bằng mili giây (1000ms = 1s)
    setTimeout(function() {
        loaderOverlay.classList.add('hidden');
    }, 500); // Kéo dài thêm 1 giây
});