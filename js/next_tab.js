document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Nếu là link ngoài file hiện tại và không phải anchor
        if (
            href &&
            !href.startsWith('#') &&
            !href.startsWith('javascript:') &&
            !href.endsWith('.html') // đừng mở .html trong tab mới nếu muốn scroll đúng
        ) {
            e.preventDefault();
            window.open(href, '_blank');
        }
    });
});
