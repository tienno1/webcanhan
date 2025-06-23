    // Mở tất cả các link <a> trong tab mới
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (
                href && 
                !href.startsWith('javascript:') &&
                !href.startsWith('#')
            ) {
                e.preventDefault();
                window.open(href, '_blank');
            }
        });
    });
