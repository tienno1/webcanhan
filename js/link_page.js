document.addEventListener('DOMContentLoaded', function() {
    // Lấy tham số hash từ URL (ví dụ: #design-Website4)
    const hash = window.location.hash;

    // Kiểm tra xem có hash không
    if (hash) {
        // Loại bỏ ký tự '#' để lấy tên class
        const className = hash.substring(1); // Lấy "design-Website4" từ "#design-Website4"

        // Tìm phần tử đầu tiên có class tương ứng
        const targetElement = document.querySelector('.' + className); // Thêm dấu chấm để tìm class

        if (targetElement) {
            // Cuộn mượt mà đến phần tử đích
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});