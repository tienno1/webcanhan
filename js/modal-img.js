document.addEventListener('DOMContentLoaded', () => {
  const appModal = document.getElementById('app-info-modal');
  const name = document.getElementById('app-name');
  const desc = document.getElementById('app-desc');
  const style = document.getElementById('app-style');
  const date = document.getElementById('app-date');
  const size = document.getElementById('app-size');
  const format = document.getElementById('app-format');
  const soft = document.getElementById('app-soft');

  const toggleBtn = document.getElementById('toggle-app-info');
  const showBtn = document.getElementById('show-app-info');
  const fullscreenBtn = document.querySelector('.image-modal-fullscreen');
  const modalImg = document.getElementById('image-modal-img');
  const imageModal = document.getElementById('image-modal');
  const nextBtn = document.querySelector('.image-modal-next');
  const prevBtn = document.querySelector('.image-modal-prev');
  const closeBtn = document.querySelector('.image-modal-close');

  let autoCloseTimer;
  let isZoomed = false;
  let currentImgEl = null;

  // Lấy tất cả hình ảnh chính trong main, loại trừ các logo nhỏ
  // Lựa chọn các thẻ img không có class 'image-logo-small' và là con của main
  const allImages = Array.from(document.querySelectorAll('main img:not(.image-logo-small)'));
  // Danh sách hình ảnh chỉ thuộc data-page hiện tại của modal
  let currentPagedImages = [];
  // Index của hình ảnh hiện tại trong currentPagedImages
  let currentImgIndex = 0;
  // data-page của hình ảnh đã mở modal
  let currentPageOfModal = null;

  // Các phần tử của modal thông báo
  const messageModal = document.getElementById('message-modal');
  const messageModalText = document.getElementById('message-modal-text');
  const messageModalCloseBtn = document.querySelector('.message-modal-close-btn');
  const messageModalOkBtn = document.getElementById('message-modal-ok-btn');

  // Đảm bảo cả hai nút đều ẩn khi khởi tạo
  if (showBtn) showBtn.style.display = 'none';
  if (toggleBtn) toggleBtn.style.display = 'none';

  function setAppLogos(srcList = []) {
    const container = document.querySelector('.app-logos');
    if (!container) return;
    container.innerHTML = '';

    const validSrcs = srcList.filter(src => src.trim() !== '');

    if (validSrcs.length > 0) {
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center'; // Đã thay đổi từ 'flex-start' sang 'center'
      container.style.margin = '0';
      container.style.padding = '0';

      validSrcs.forEach((src, index) => {
        const img = document.createElement('img');
        img.className = 'app-logo';
        img.src = src.trim();
        img.alt = 'Logo App';
        img.width = 60;
        // Thêm margin cho tất cả các logo, trừ logo cuối cùng
        if (index < validSrcs.length - 1) {
          img.style.marginRight = '10px';
        } else {
          img.style.marginRight = '0';
        }
        container.appendChild(img);
      });
    } else {
      container.style.display = 'none';
    }
  }

  // Hàm cập nhật nội dung modal thông tin dựa trên data-* của ảnh
  function updateModalContent(img) {
    if (!img || !img.dataset) return;
    if (name) name.textContent = img.dataset.name || '';
    if (desc) desc.textContent = img.dataset.description || '';
    if (style) style.textContent = img.dataset.style || '';
    if (date) date.textContent = img.dataset.date || '';
    if (size) size.textContent = img.dataset.size || '';
    if (format) format.textContent = img.dataset.format || '';
    if (soft) soft.textContent = img.dataset.software || '';
    const logosAttr = img.dataset.logos;
    const logos = logosAttr ? logosAttr.split(',') : [];
    setAppLogos(logos);
  }

  function openAppModal() {
    if (appModal) {
        appModal.classList.remove('closing');
        appModal.classList.add('active');
        clearTimeout(autoCloseTimer);
        autoCloseTimer = setTimeout(() => closeAppModal(), 100000); // Tự động đóng sau 100 giây
        if (toggleBtn) toggleBtn.style.display = 'block'; // Hiện nút toggle (đóng)
        if (showBtn) showBtn.style.display = 'none'; // Ẩn nút show (mở)
    }
  }

  function closeAppModal() {
    if (appModal) {
        appModal.classList.remove('active');
        appModal.classList.add('closing');
        clearTimeout(autoCloseTimer);
        setTimeout(() => {
            if (appModal) appModal.classList.remove('closing');
            if (toggleBtn) toggleBtn.style.display = 'none'; // Luôn ẩn toggleBtn khi appModal đóng
            // Chỉ hiển thị showBtn nếu imageModal vẫn đang hoạt động
            if (showBtn) {
                if (imageModal && imageModal.classList.contains('active')) {
                    showBtn.style.display = 'block';
                } else {
                    showBtn.style.display = 'none';
                }
            }
        }, 600); // Thời gian khớp với transition của CSS
    }
  }

  // Hàm hiển thị modal thông báo
  function showMessageModal(message, pageNum) {
    if (messageModal && messageModalText) {
      messageModalText.textContent = `${message} trang số ${pageNum}.`;
      messageModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Ngăn cuộn trang chính
    }
  }

  // Hàm đóng modal thông báo
  function closeMessageModal() {
    if (messageModal) {
      messageModal.classList.remove('active');
      document.body.style.overflow = ''; // Cho phép cuộn lại
    }
  }

  // Gắn sự kiện đóng cho modal thông báo
  if (messageModalCloseBtn) {
    messageModalCloseBtn.addEventListener('click', closeMessageModal);
  }
  if (messageModalOkBtn) {
    messageModalOkBtn.addEventListener('click', closeMessageModal);
  }
  if (messageModal) {
    messageModal.addEventListener('click', function(e) {
      if (e.target === messageModal) closeMessageModal();
    });
  }

  function hideAllModals() {
    if (appModal) {
        appModal.classList.remove('active');
        appModal.classList.remove('closing');
    }
    if (imageModal) {
        imageModal.classList.remove('active', 'fullscreen'); // Đảm bảo modal hình ảnh cũng đóng
    }
    document.body.style.overflow = ''; // Cho phép cuộn lại
    closeMessageModal(); // Đảm bảo modal thông báo cũng đóng

    // Ẩn cả hai nút khi tất cả các modal đều đóng
    if (showBtn) showBtn.style.display = 'none';
    if (toggleBtn) toggleBtn.style.display = 'none';
  }

  // Mở modal hình ảnh (chỉ modal hình ảnh) khi click ảnh
  allImages.forEach((img) => {
    // Only attach click listener to main images, not small logos
    if (!img.classList.contains('image-logo-small')) {
        img.addEventListener('click', function() {
            // Lấy data-page của hình ảnh được click
            currentPageOfModal = this.closest('[data-page]') ?
                                parseInt(this.closest('[data-page]').getAttribute('data-page')) :
                                null;

            // Lọc ra các hình ảnh chính cùng data-page
            if (currentPageOfModal !== null) {
                currentPagedImages = allImages.filter(image => {
                    const imageParentSection = image.closest('[data-page]');
                    return imageParentSection && parseInt(imageParentSection.getAttribute('data-page')) === currentPageOfModal;
                });
            } else {
                // Nếu không có data-page, hiển thị tất cả ảnh chính
                currentPagedImages = allImages;
            }

            // Tìm index của hình ảnh được click trong danh sách đã lọc
            currentImgIndex = currentPagedImages.findIndex(image => image.src === this.src);

            currentImgEl = currentPagedImages[currentImgIndex]; // Cập nhật currentImgEl
            if (modalImg) modalImg.src = currentImgEl.src; // Cập nhật ảnh trong modal
            if (imageModal) imageModal.classList.add('active'); // Mở modal hình ảnh
            document.body.style.overflow = 'hidden'; // Ngăn cuộn trang chính

            // Hiển thị nút 'showBtn' khi modal hình ảnh được mở
            if (showBtn) showBtn.style.display = 'block';
        });
    }
  });

  // Chức năng chuyển ảnh: Next
  function showNextImg() {
    if (currentPagedImages.length < 1) return;

    currentImgIndex++;
    if (currentImgIndex >= currentPagedImages.length) {
      // Hiển thị thông báo và quay lại hình đầu tiên
      showMessageModal('Đã hết hình ảnh', currentPageOfModal);
      currentImgIndex = 0;
    }
    currentImgEl = currentPagedImages[currentImgIndex];
    if (modalImg) modalImg.src = currentImgEl.src;
    updateModalContent(currentImgEl); // Đảm bảo nội dung thông tin được cập nhật cho ảnh mới
    resetZoom(); // Reset zoom khi chuyển ảnh mới
  }

  // Chức năng chuyển ảnh: Previous
  function showPrevImg() {
    if (currentPagedImages.length < 1) return;

    currentImgIndex--;
    if (currentImgIndex < 0) {
      // Quay lại hình cuối cùng nếu đã ở hình đầu tiên
      currentImgIndex = currentPagedImages.length - 1;
    }
    currentImgEl = currentPagedImages[currentImgIndex];
    if (modalImg) modalImg.src = currentImgEl.src;
    updateModalContent(currentImgEl); // Đảm bảo nội dung thông tin được cập nhật cho ảnh mới
    resetZoom(); // Reset zoom khi chuyển ảnh mới
  }

  // Gắn sự kiện cho các nút điều hướng trong modal hình ảnh
  if (nextBtn) nextBtn.addEventListener('click', showNextImg);
  if (prevBtn) prevBtn.addEventListener('click', showPrevImg);

  // Gắn sự kiện cho các nút điều khiển modal thông tin
  if (showBtn) {
    showBtn.addEventListener('click', () => {
      // Tìm lại ảnh hiện tại trong modal ảnh để hiển thị thông tin
      const shownSrc = modalImg?.src;
      const foundImg = currentPagedImages.find(img => img.src === shownSrc);
      if (foundImg) {
        currentImgEl = foundImg;
        updateModalContent(currentImgEl);
        openAppModal();
      }
    });
  }

  // Nút toggleBtn sẽ đóng modal thông tin
  if (toggleBtn) toggleBtn.addEventListener('click', closeAppModal);


  // Logic phóng to/thu nhỏ và kéo
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  function resetZoom() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
  }

  function updateTransform() {
      if (modalImg) {
          modalImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
          // Cập nhật cursor dựa trên trạng thái scale
          modalImg.style.cursor = (scale > 1) ? 'grab' : 'zoom-in';
      }
  }

  // Zoom in/out bằng nút fullscreen và double-click
  if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (scale === 1) { // Nếu chưa zoom, phóng to
              scale = 1.5; // Phóng to 1.5 lần
          } else { // Nếu đã zoom, reset về ban đầu
              resetZoom();
          }
          updateTransform();
      });
  }

  // Zoom bằng double-click
  if (modalImg) {
      modalImg.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          if (scale === 1) {
              scale = 1.5; // Phóng to 1.5 lần khi double-click
          } else {
              resetZoom(); // Reset về 100% khi double-click lần nữa
          }
          updateTransform();
      });
  }

  // Kéo modal (drag)
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let initialTranslateX = 0;
  let initialTranslateY = 0;

  if (modalImg) {
      modalImg.addEventListener('mousedown', (e) => {
          // Chỉ kéo khi đang zoom (scale > 1) và click chuột trái
          if (scale === 1 || e.button !== 0) return;
          isDragging = true;
          startPointerX = e.clientX;
          startPointerY = e.clientY;
          initialTranslateX = translateX;
          initialTranslateY = translateY;
          modalImg.style.cursor = 'grabbing';
          e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          // Tính toán sự thay đổi vị trí dựa trên chuyển động của chuột và tỷ lệ zoom
          const dx = (e.clientX - startPointerX) / scale;
          const dy = (e.clientY - startPointerY) / scale;
          translateX = initialTranslateX + dx;
          translateY = initialTranslateY + dy;
          updateTransform();
      });

      document.addEventListener('mouseup', () => {
          if (!isDragging) return;
          isDragging = false;
          modalImg.style.cursor = (scale > 1) ? 'grab' : 'zoom-in'; // Cập nhật lại cursor
      });

      // Reset vị trí và zoom khi ảnh mới được tải vào modal hoặc modal đóng
      modalImg.addEventListener('load', function() {
          resetZoom(); // Đảm bảo reset zoom khi ảnh mới được tải
      });
      imageModal.addEventListener('transitionend', function() {
          // Reset zoom khi modal đóng (dựa vào class 'active' của imageModal)
          if (!imageModal.classList.contains('active')) {
              resetZoom();
          }
      });
  }

  // Đóng tất cả modal khi nhấn nút đóng hoặc click ra ngoài modal ảnh
  if (closeBtn) closeBtn.addEventListener('click', hideAllModals);
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        hideAllModals();
      }
    });
  }

  // Xử lý phím tắt
  window.addEventListener('keydown', (e) => {
    if (imageModal && imageModal.classList.contains('active')) { // Chỉ xử lý khi modal hình ảnh đang mở
      if (e.key === 'Escape') {
        hideAllModals();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); // Ngăn cuộn trang
        showPrevImg();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); // Ngăn cuộn trang
        showNextImg();
      }
    }
  });

  // Gắn sự kiện cho nút đóng của modal thông tin
  const appInfoCloseBtn = document.querySelector('#app-info-modal .app-info-close-btn');
    if (appInfoCloseBtn) {
        appInfoCloseBtn.addEventListener('click', closeAppModal);
    }
});
