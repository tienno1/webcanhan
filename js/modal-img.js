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
  // Lựa chọn các thẻ img không có class 'image-logo-small' và không phải là con của .app-logos
  const allImages = Array.from(document.querySelectorAll('main .image-wrapper img:first-of-type'));
  // Danh sách hình ảnh chỉ thuộc data-page hiện tại của modal
  let currentPagedImages = [];
  // Index của hình ảnh hiện tại trong currentPagedImages
  let currentImgIndex = 0;
  // data-page của hình ảnh đã mở modal
  let currentPageOfModal = null;

  // Các phần tử của modal thông báo (đảm bảo rằng HTML cho modal này đã tồn tại)
  const messageModal = document.getElementById('message-modal');
  const messageModalText = document.getElementById('message-modal-text');
  const messageModalCloseBtn = document.querySelector('.message-modal-close-btn');
  const messageModalOkBtn = document.getElementById('message-modal-ok-btn');

  // Ẩn hai nút khi mới vào
  if (toggleBtn) toggleBtn.style.display = 'none';
  if (showBtn) showBtn.style.display = 'none';

  function setAppLogos(srcList = []) {
    const container = document.querySelector('.app-logos');
    if (!container) return;
    container.innerHTML = '';
    srcList.forEach(src => {
      const img = document.createElement('img');
      img.className = 'app-logo';
      img.src = src.trim();
      img.alt = 'Logo App';
      img.width = 60;
      container.appendChild(img);
    });
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
        if (toggleBtn) toggleBtn.style.display = 'block';
        if (showBtn) showBtn.style.display = 'none';
    }
  }

  function closeAppModal() {
    if (appModal) {
        appModal.classList.remove('active');
        appModal.classList.add('closing');
        clearTimeout(autoCloseTimer);
        // Sau khi animation đóng hoàn tất, đảm bảo nút show xuất hiện
        appModal.addEventListener('transitionend', function handler() {
            if (!appModal.classList.contains('active')) { // Chỉ xử lý khi modal thực sự đã đóng
                if (toggleBtn) toggleBtn.style.display = 'none';
                if (showBtn) showBtn.style.display = 'block';
                appModal.removeEventListener('transitionend', handler); // Xóa listener để tránh chạy nhiều lần
            }
        });
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

  // Hàm ẩn tất cả modals
  function hideAllModals() {
    if (appModal) {
        appModal.classList.remove('active');
        appModal.classList.remove('closing');
        if (toggleBtn) toggleBtn.style.display = 'none';
        if (showBtn) showBtn.style.display = 'none';
    }
    if (imageModal) {
        imageModal.classList.remove('active', 'fullscreen'); // Đảm bảo modal hình ảnh cũng đóng
    }
    document.body.style.overflow = ''; // Cho phép cuộn lại
    closeMessageModal(); // Đảm bảo modal thông báo cũng đóng
  }

  // Hàm hiển thị modal hình ảnh và điền thông tin (hàm này được gọi từ designer_animation.js)
  window.showImageModal = function(imgElement) {
    if (!imageModal || !modalImg || !appModal) return;

    imageModal.classList.add('active');
    modalImg.src = imgElement.src;

    // Cập nhật thông tin vào modal thông tin ứng dụng
    updateModalContent(imgElement);

    // Hiển thị nút toggle thông tin và ẩn nút show (vì thông tin đã hiển thị)
    if (toggleBtn) toggleBtn.style.display = 'block';
    if (showBtn) showBtn.style.display = 'none';
    openAppModal(); // Mặc định hiển thị modal thông tin khi modal hình ảnh mở

    // Lấy tất cả hình ảnh liên quan trong CÙNG một section .project
    const parentProjectSection = imgElement.closest('.project');
    if (parentProjectSection) {
        // Lọc ra tất cả các hình ảnh chính (không phải logo nhỏ)
        currentPagedImages = Array.from(parentProjectSection.querySelectorAll('img:not(.image-logo-small)'))
            .filter(img => !img.src.includes('logo.png')); // Loại trừ logo.png nếu có
        currentImgIndex = currentPagedImages.indexOf(imgElement);
    } else {
        // Trường hợp dự phòng nếu hình ảnh không nằm trong .project
        currentPagedImages = [imgElement];
        currentImgIndex = 0;
    }

    updateModalNavigation();
  };

  // Hàm cập nhật trạng thái các nút điều hướng (Ảnh trước/Ảnh sau)
  function updateModalNavigation() {
    if (prevBtn) {
        prevBtn.style.display = currentImgIndex > 0 ? 'block' : 'none';
    }
    if (nextBtn) {
        nextBtn.style.display = currentImgIndex < currentPagedImages.length - 1 ? 'block' : 'none';
    }
  }


  // Gắn sự kiện cho nút đóng modal
  if (closeBtn) {
      closeBtn.addEventListener('click', hideAllModals);
  }

  // Gắn sự kiện cho nút chuyển ảnh trước
  if (prevBtn) {
      prevBtn.addEventListener('click', () => {
          if (currentImgIndex > 0) {
              currentImgIndex--;
              window.showImageModal(currentPagedImages[currentImgIndex]); // Hiển thị hình ảnh mới và cập nhật thông tin
          }
      });
  }

  // Gắn sự kiện cho nút chuyển ảnh sau
  if (nextBtn) {
      nextBtn.addEventListener('click', () => {
          if (currentImgIndex < currentPagedImages.length - 1) {
              currentImgIndex++;
              window.showImageModal(currentPagedImages[currentImgIndex]); // Hiển thị hình ảnh mới và cập nhật thông tin
          }
      });
  }

  // Gắn sự kiện cho nút toàn màn hình
  if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
          if (modalImg.requestFullscreen) {
              modalImg.requestFullscreen();
          } else if (modalImg.webkitRequestFullscreen) { /* Safari */
              modalImg.webkitRequestFullscreen();
          } else if (modalImg.msRequestFullscreen) { /* IE11 */
              modalImg.msRequestFullscreen();
          }
      });
  }

  // Gắn sự kiện cho nút toggle thông tin (Ẩn/Hiện)
  if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
          if (appModal.classList.contains('active')) {
              closeAppModal();
          } else {
              openAppModal();
          }
      });
  }

  // Gắn sự kiện cho nút "Hiện Thông Tin Hình Ảnh" (chỉ xuất hiện khi toggle ẩn thông tin)
  if (showBtn) {
      showBtn.addEventListener('click', () => {
          openAppModal();
      });
  }

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
        prevBtn.click(); // Kích hoạt sự kiện click của nút prev
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); // Ngăn cuộn trang
        nextBtn.click(); // Kích hoạt sự kiện click của nút next
      }
    }
  });

  // Gắn sự kiện cho nút đóng của modal thông tin
  const appInfoCloseBtn = document.querySelector('#app-info-modal .app-info-close-btn');
    if (appInfoCloseBtn) {
        appInfoCloseBtn.addEventListener('click', closeAppModal);
    }
});
