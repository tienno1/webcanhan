document.addEventListener('DOMContentLoaded', () => {
    // --- Page Transition Effect ---
    const pageContent = document.getElementById('page-content');
    const navLinks = document.querySelectorAll('nav a');
    const fallbackTimeout = 600;

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            if (this.classList.contains('active')) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            const targetUrl = this.href;
            if (pageContent) {
                pageContent.classList.add('fade-out');
                const transitionEndHandler = () => {
                    window.location.href = targetUrl;
                    pageContent.removeEventListener('transitionend', transitionEndHandler);
                };
                pageContent.addEventListener('transitionend', transitionEndHandler);
                setTimeout(() => {
                    if (pageContent.classList.contains('fade-out')) {
                        window.location.href = targetUrl;
                        pageContent.removeEventListener('transitionend', transitionEndHandler);
                    }
                }, fallbackTimeout);
            } else {
                window.location.href = targetUrl;
            }
        });
    });

    if (pageContent) {
        pageContent.classList.remove('fade-out');
        setTimeout(() => {
            pageContent.classList.add('fade-in');
        }, 500);
    }

    // --- Search Functionality ---
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const mainContent = document.querySelector('main');

    if (searchInput && searchButton && mainContent) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm === '') {
            removeHighlights();
            return;
        }
        removeHighlights();
        const elementsToSearch = mainContent.querySelectorAll('.project[style*="display: block"] p, .project[style*="display: block"] h3, #design-philosophy[style*="display: block"] p, #design-philosophy[style*="display: block"] h2');
        let firstFoundElement = null;
        let firstFoundPage = null;
        elementsToSearch.forEach(element => {
            const originalText = element.innerHTML;
            const lowerCaseText = originalText.toLowerCase();
            if (lowerCaseText.includes(searchTerm)) {
                if (!firstFoundElement) {
                    firstFoundElement = element;
                    const parentSection = element.closest('section[data-page]');
                    if (parentSection) {
                        firstFoundPage = parseInt(parentSection.getAttribute('data-page'));
                    } else {
                        firstFoundPage = 1;
                    }
                }
                const regex = new RegExp(searchTerm, 'gi');
                const highlightedText = originalText.replace(regex, match => `<span class="highlight">${match}</span>`);
                element.innerHTML = highlightedText;
            }
        });
        if (firstFoundElement) {
            const currentPage = getCurrentPage();
            const totalPages = getTotalPages();
            if (firstFoundPage && firstFoundPage !== currentPage) {
                history.pushState({ page: firstFoundPage }, `Page ${firstFoundPage}`, `?page=${firstFoundPage}`);
                displayProjectsForPage(firstFoundPage);
                renderPagination(firstFoundPage, totalPages);
                updateTocListForPage(firstFoundPage);
                setTimeout(() => {
                    const elementOnNewPage = document.querySelector(`main #${firstFoundElement.id}`);
                    if (elementOnNewPage) {
                        elementOnNewPage.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        displayContentInSidebar(`#${elementOnNewPage.id}`);
                    }
                }, 150);
            } else {
                firstFoundElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                const parentSection = firstFoundElement.closest('section[data-page]');
                if (parentSection) {
                    displayContentInSidebar(`#${parentSection.id}`);
                }
            }
        }
    }

    function removeHighlights() {
        if (!mainContent) return;
        const highlights = mainContent.querySelectorAll('.highlight');
        highlights.forEach(span => {
            const parent = span.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(span.textContent), span);
                parent.normalize();
            }
        });
    }

    // --- Animation on Scroll (Fade-in) ---
    const fadeInElements = document.querySelectorAll('.fade-in-element');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    fadeInElements.forEach(element => {
        observer.observe(element);
    });


    // --- Global state for visible images per section ---
    // Map để lưu trữ số lượng hình ảnh hiển thị hiện tại cho mỗi section (key: sectionId, value: số lượng hình ảnh)
    let visibleImageCounts = new Map();

    // --- Function to manage image display and "Load More" button ---
    // Hàm này kiểm soát việc hiển thị hình ảnh và nút "Xem thêm" trong một container cụ thể.
    // imageContainerElement: Phần tử chứa các hình ảnh (ví dụ: .project-content)
    // sectionId: ID của section cha (để theo dõi trạng thái hiển thị)
    function manageImageDisplay(imageContainerElement, sectionId) {
        if (!imageContainerElement) return;

        // Lấy tất cả image-wrapper bên trong container
        const allImageWrappers = Array.from(imageContainerElement.querySelectorAll('.image-wrapper'));
        const totalImages = allImageWrappers.length; // Đếm số lượng wrappers để biết tổng số hình ảnh

        let currentVisibleCount = visibleImageCounts.get(sectionId);

        // Khởi tạo số lượng hình ảnh hiển thị ban đầu là 5 nếu chưa được đặt
        // hoặc nếu nó bị reset về 0 (để tránh hiển thị quá nhiều khi tải lại trang hoặc chuyển trang)
        if (currentVisibleCount === undefined) {
            visibleImageCounts.set(sectionId, 5); // Mặc định hiển thị 5 hình ảnh đầu tiên
            currentVisibleCount = 5;
        }

        // Ẩn tất cả image-wrapper ban đầu
        allImageWrappers.forEach(wrapper => {
            wrapper.style.display = 'none';
        });

        // Hiển thị các image-wrapper lên đến số lượng hiện tại được phép
        for (let i = 0; i < currentVisibleCount; i++) {
            if (allImageWrappers[i]) {
                allImageWrappers[i].style.display = 'inline-block'; // Set to inline-block for horizontal
            }
        }

        // Quản lý nút "Xem thêm"
        // Nút "Xem thêm" chỉ xuất hiện ở khu vực nội dung chính, không phải trong mục lục sidebar
        const parentSection = imageContainerElement.closest('.project'); // Kiểm tra xem đây có phải là nội dung chính của một project không

        // Tìm nút "Xem thêm" hiện có trong section cha (để tránh tạo nhiều nút)
        let loadMoreButton = parentSection ? parentSection.querySelector('.load-more-btn') : null;

        if (totalImages > currentVisibleCount) { // Nếu còn hình ảnh để tải
            if (!loadMoreButton) {
                // Tạo nút "Xem thêm" nếu chưa có
                loadMoreButton = document.createElement('button');
                loadMoreButton.textContent = 'Xem thêm';
                loadMoreButton.classList.add('load-more-btn');
                // Chèn nút vào sau project-content nhưng vẫn trong section
                parentSection.appendChild(loadMoreButton);
            }
            loadMoreButton.style.display = 'block'; // Đảm bảo nút hiển thị

            // Gán lại sự kiện click (để tránh nhiều listener nếu hàm được gọi lại)
            loadMoreButton.onclick = null; // Xóa listener cũ
            loadMoreButton.onclick = () => {
                const currentVis = visibleImageCounts.get(sectionId);
                let newVisible = currentVis + 5; // Tải thêm 5 hình
                if (newVisible > totalImages) {
                    newVisible = totalImages; // Đảm bảo không vượt quá tổng số hình ảnh
                }
                visibleImageCounts.set(sectionId, newVisible); // Cập nhật số lượng hình ảnh hiển thị
                manageImageDisplay(imageContainerElement, sectionId); // Gọi lại hàm để cập nhật hiển thị
                // No need to call setupImageModalTriggers here, it's handled by modal-img.js
            };
        } else { // Nếu đã hiển thị tất cả hình ảnh
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none'; // Ẩn nút "Xem thêm"
            }
        }
    }


    // --- Table of Contents - Display Content in Sidebar and Scroll to Image ---
    const tocLinks = document.querySelectorAll('.toc ul li a');
    const tocContentDisplay = document.getElementById('toc-content-display');
    const tocList = document.getElementById('toc-list');
    const originalTocListItems = Array.from(tocList ? tocList.querySelectorAll('li') : []);

    function displayContentInSidebar(targetId) {
        const targetElement = document.querySelector(targetId); // Đây là section gốc (ví dụ: #design-Lookbook)
        if (targetElement && tocContentDisplay) {
            tocContentDisplay.innerHTML = ''; // Xóa nội dung cũ

            const contentToClone = targetElement.classList.contains('project') ?
                targetElement.querySelector('.project-content') :
                targetElement; // Lấy phần nội dung cụ thể để clone

            if (contentToClone) {
                const clonedContent = contentToClone.cloneNode(true); // Clone tất cả các phần tử con

                // Loại bỏ bất kỳ class fade-in/project nào từ các phần tử được clone để tránh xung đột
                clonedContent.classList.remove('fade-in-element', 'is-visible', 'project');
                clonedContent.querySelectorAll('.fade-in-element, .is-visible', '.project').forEach(el => {
                    el.classList.remove('fade-in-element', 'is-visible', 'project');
                });

                // Đảm bảo các hình ảnh trong nội dung được clone phản ánh trạng thái `visibleImageCounts`
                // Mục đích là sidebar sẽ hiển thị *số lượng hình ảnh hiện tại* mà người dùng đã tải trong nội dung chính,
                // không hiển thị nút "Xem thêm" riêng.
                const allClonedImageWrappers = Array.from(clonedContent.querySelectorAll('.image-wrapper'));
                const sectionId = targetId.substring(1); // Lấy ID section sạch (không có '#')
                // Lấy số lượng hình ảnh đang hiển thị trong nội dung chính, hoặc hiển thị tất cả nếu chưa có trạng thái
                const currentVisibleForMainContent = visibleImageCounts.get(sectionId) || allClonedImageWrappers.length; // Sidebar hiển thị tất cả ảnh theo mặc định


                allClonedImageWrappers.forEach((wrapper, index) => {
                    if (index < currentVisibleForMainContent) {
                        wrapper.style.display = 'block'; // Display block for sidebar for vertical stacking
                    } else {
                        wrapper.style.display = 'none';
                    }
                });

                // Xóa bất kỳ nút "Xem thêm" nào có thể đã được clone (vì sidebar không nên có nút này)
                let clonedLoadMoreButton = clonedContent.querySelector('.load-more-btn');
                if (clonedLoadMoreButton) {
                    clonedLoadMoreButton.remove();
                }

                tocContentDisplay.appendChild(clonedContent);

                // Gắn lại sự kiện click cho các hình ảnh trong khu vực hiển thị của sidebar
                const sidebarImages = tocContentDisplay.querySelectorAll('img:not(.image-logo-small)');
                sidebarImages.forEach(img => {
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', function() {
                        const imageUrl = this.getAttribute('src');
                        // Scroll to the corresponding image in main content
                        const mainContentImage = mainContent.querySelector(`img[src="${imageUrl}"]:not(.image-logo-small)`);
                        if (mainContentImage) {
                            // First, ensure the correct page is displayed if the image is on a different page
                            const parentSectionOfMainImage = mainContentImage.closest('section[data-page]');
                            if (parentSectionOfMainImage) {
                                const targetPage = parseInt(parentSectionOfMainImage.getAttribute('data-page'));
                                const currentPage = getCurrentPage();
                                if (!isNaN(targetPage) && targetPage !== currentPage) {
                                    history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                                    displayProjectsForPage(targetPage);
                                    renderPagination(targetPage, getTotalPages());
                                    updateTocListForPage(targetPage);
                                    setTimeout(() => {
                                        mainContentImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 150); // Small delay to allow page transition
                                    return; // Exit as page change will re-trigger
                                }
                            }
                            // If on the same page or after page change, scroll to image
                            mainContentImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                });
                const tocAside = document.querySelector('.toc');
                if (tocAside) {
                    tocAside.scrollTop = 0;
                }
            }
        }
    }

    tocLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const targetPage = parseInt(targetElement.getAttribute('data-page'));
                const currentPage = getCurrentPage();
                if (!isNaN(targetPage) && targetPage !== currentPage) {
                    history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                    displayProjectsForPage(targetPage);
                    renderPagination(targetPage, getTotalPages());
                    updateTocListForPage(targetPage);
                    setTimeout(() => {
                        displayContentInSidebar(targetId);
                        const elementOnNewPage = document.querySelector(targetId);
                        if (elementOnNewPage && mainContent) {
                            elementOnNewPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                } else {
                    displayContentInSidebar(targetId);
                    if (mainContent) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        });
    });

    // --- Dynamic Pagination ---
    const paginationContainer = document.querySelector('.pagination-container');
    const projectElements = document.querySelectorAll('.project');

    function getCurrentPage() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('page')) || 1;
    }

    function displayProjectsForPage(pageNumber) {
        projectElements.forEach((project) => {
            const projectPage = parseInt(project.getAttribute('data-page'));
            if (!isNaN(projectPage) && projectPage === pageNumber) {
                project.style.display = 'block';
                project.classList.remove('is-visible');
                setTimeout(() => {
                    project.classList.add('is-visible');
                    const projectContent = project.querySelector('.project-content');
                    if (projectContent) {
                        // Gọi manageImageDisplay cho nội dung chính của project
                        // Chỉ gọi manageImageDisplay nếu project có .image-wrapper (như page 1, 2)
                        if (projectContent.querySelector('.image-wrapper')) {
                            manageImageDisplay(projectContent, project.id);
                        }
                    }
                }, 10);
            } else {
                project.style.display = 'none';
                project.classList.remove('is-visible');
            }
        });
    }

    function updateTocListForPage(pageNumber) {
        if (!tocList) return;
        tocList.innerHTML = '';
        const projectsOnCurrentPage = document.querySelectorAll(`.project[data-page="${pageNumber}"]`);
        projectsOnCurrentPage.forEach(project => {
            const projectId = project.id;
            const originalListItem = originalTocListItems.find(item => {
                const link = item.querySelector('a');
                return link && link.getAttribute('href') === `#${projectId}`;
            });
            if (originalListItem) {
                const listItem = originalListItem.cloneNode(true);
                tocList.appendChild(listItem);
            }
        });
        const originalPhilosophyListItem = originalTocListItems.find(item => {
            const link = item.querySelector('a');
            return link && link.getAttribute('href') === '#design-philosophy';
        });
        if (originalPhilosophyListItem) {
            const philosophyListItem = originalPhilosophyListItem.cloneNode(true);
            tocList.appendChild(philosophyListItem);
        }
        // Re-attach click listeners to the newly added TOC links
        const newTocLinks = tocList.querySelectorAll('a');
        newTocLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPage = parseInt(targetElement.getAttribute('data-page'));
                    const currentPage = getCurrentPage();
                    const totalPages = getTotalPages();
                    if (!isNaN(targetPage) && targetPage !== currentPage) {
                        history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                        displayProjectsForPage(targetPage);
                        renderPagination(targetPage, totalPages);
                        updateTocListForPage(targetPage);
                        setTimeout(() => {
                            displayContentInSidebar(targetId);
                            const elementOnNewPage = document.querySelector(targetId);
                            if (elementOnNewPage && mainContent) {
                                elementOnNewPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 100);
                    } else {
                        displayContentInSidebar(targetId);
                        if (mainContent) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }
            });
        });
        // Gắn lại highlight TOC sau khi cập nhật TOC
        setupTocHighlight();
    }

    function getTotalPages() {
        let maxPageFromData = 0;
        projectElements.forEach(project => {
            const page = parseInt(project.getAttribute('data-page'));
            if (!isNaN(page) && page > maxPageFromData) {
                maxPageFromData = page;
            }
        });
        return maxPageFromData > 0 ? maxPageFromData : 1;
    }

    function renderPagination(currentPage, totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const maxVisibleButtons = 3;
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        if (endPage - startPage < maxVisibleButtons - 1) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        // Nút Back
        if (currentPage > 1) {
            const backButton = document.createElement('a');
            backButton.href = `designer.html?page=${currentPage - 1}`;
            backButton.classList.add('pagination-button', 'prev');
            backButton.innerHTML = '&lt; Back';
            backButton.addEventListener('click', function (event) {
                event.preventDefault();
                const targetPage = currentPage - 1;
                history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                displayProjectsForPage(targetPage);
                renderPagination(targetPage, totalPages);
                displayFirstProjectOfCurrentPageInSidebar(targetPage);
                updateTocListForPage(targetPage);
                const navHeight = document.querySelector('nav')?.offsetHeight || 0;
                window.scrollTo({ top: navHeight, behavior: 'auto' });
                if (mainContent) mainContent.scrollTop = 0;
            });
            paginationContainer.appendChild(backButton);
        }

        // Các nút số trang (giới hạn 3 số gần currentPage)
        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('a');
            button.href = `designer.html?page=${i}`;
            button.classList.add('pagination-button');
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.textContent = i;
            button.addEventListener('click', function (event) {
                event.preventDefault();
                const targetPage = parseInt(this.textContent);
                if (targetPage !== currentPage) {
                    history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                    displayProjectsForPage(targetPage);
                    renderPagination(targetPage, totalPages);
                    displayFirstProjectOfCurrentPageInSidebar(targetPage);
                    updateTocListForPage(targetPage);
                    const navHeight = document.querySelector('nav')?.offsetHeight || 0;
                    window.scrollTo({ top: navHeight, behavior: 'auto' });
                    if (mainContent) mainContent.scrollTop = 0;
                }
            });
            paginationContainer.appendChild(button);
        }

        // Nút Next
        if (currentPage < totalPages) {
            const nextButton = document.createElement('a');
            nextButton.href = `designer.html?page=${currentPage + 1}`;
            nextButton.classList.add('pagination-button', 'next');
            nextButton.innerHTML = 'Next &gt;';
            nextButton.addEventListener('click', function (event) {
                event.preventDefault();
                const targetPage = currentPage + 1;
                history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                displayProjectsForPage(targetPage);
                renderPagination(targetPage, totalPages);
                displayFirstProjectOfCurrentPageInSidebar(targetPage);
                updateTocListForPage(targetPage);
                const navHeight = document.querySelector('nav')?.offsetHeight || 0;
                    window.scrollTo({ top: navHeight, behavior: 'auto' });
                if (mainContent) mainContent.scrollTop = 0;
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    window.addEventListener('popstate', (event) => {
        const state = event.state;
        const pageFromState = state && state.page ? pageFromState : getCurrentPage();
        displayProjectsForPage(pageFromState);
        renderPagination(pageFromState, getTotalPages());
        setTimeout(() => {
            displayFirstProjectOfCurrentPageInSidebar(pageFromState);
        }, 50);
        updateTocListForPage(pageFromState);
    });

    function displayFirstProjectOfCurrentPageInSidebar(pageNumber) {
        const projectsOnCurrentPage = document.querySelectorAll(`.project[data-page="${pageNumber}"]`);
        if (projectsOnCurrentPage.length > 0 && tocContentDisplay) {
            const contentToClone = projectsOnCurrentPage[0].querySelector('.project-content') || projectsOnCurrentPage[0];
            if (contentToClone) {
                tocContentDisplay.innerHTML = '';
                const clonedContent = contentToClone.cloneNode(true);
                if (clonedContent.classList) {
                    clonedContent.classList.remove('fade-in-element', 'is-visible', 'project');
                }
                clonedContent.querySelectorAll('.fade-in-element, .is-visible', '.project').forEach(el => {
                    el.classList.remove('fade-in-element', 'is-visible', 'project');
                });
                tocContentDisplay.appendChild(clonedContent);
            }
        }
    }

    // --- Initial Setup ---
    const firstProjectSection = document.querySelector('main .project');
    if (firstProjectSection && tocContentDisplay) {
        const contentToClone = firstProjectSection.querySelector('.project-content') || firstProjectSection;
        if (contentToClone) {
            const clonedContent = contentToClone.cloneNode(true);
            if (clonedContent.classList) {
                clonedContent.classList.remove('fade-in-element', 'is-visible', 'project');
            }
            clonedContent.querySelectorAll('.fade-in-element, .is-visible', '.project').forEach(el => {
                el.classList.remove('fade-in-element', 'is-visible', 'project');
            });
            tocContentDisplay.appendChild(clonedContent);
        }
    }

    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    displayProjectsForPage(currentPage); // Hàm này bây giờ sẽ gọi manageImageDisplay cho các project hiển thị
    renderPagination(currentPage, totalPages);
    updateTocListForPage(currentPage); // setupTocHighlight sẽ được gọi trong đây

    // Khởi tạo hiển thị hình ảnh cho tất cả các project trên trang ban đầu.
    // Điều này đảm bảo rằng khi trang tải lần đầu, các hình ảnh được ẩn/hiện đúng cách
    // trước khi bất kỳ thao tác phân trang hoặc click mục lục nào xảy ra.
    projectElements.forEach(project => {
        // Khởi tạo visibleImageCounts cho từng project nếu chưa được đặt
        if (visibleImageCounts.get(project.id) === undefined) {
             visibleImageCounts.set(project.id, 5); // Mặc định hiển thị 5 hình ảnh đầu tiên cho mỗi section
        }
        // Sau đó, áp dụng logic hiển thị cho các project đang hiển thị trên trang hiện tại
        const projectPage = parseInt(project.getAttribute('data-page'));
        if (!isNaN(projectPage) && projectPage === currentPage) {
            const projectContent = project.querySelector('.project-content');
            if (projectContent && projectContent.querySelector('.image-wrapper')) {
                manageImageDisplay(projectContent, project.id);
            }
        }
    });

    // Highlight TOC link when scrolling
    function setupTocHighlight() {
        const tocLinks = document.querySelectorAll('.toc ul#toc-list a');
        const sections = Array.from(tocLinks)
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        function onScroll() {
            let scrollPos = window.scrollY || window.pageYOffset;
            let currentIndex = -1; // Khởi tạo với -1, nghĩa là không có section nào đang hoạt động

            // Lặp ngược để tìm section thấp nhất hiện đang hiển thị
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop - 120 <= scrollPos) {
                    currentIndex = i;
                    break; // Đã tìm thấy section hoạt động, thoát vòng lặp
                }
            }

            tocLinks.forEach((link, idx) => {
                if (idx === currentIndex) {
                    link.classList.add('active-toc');
                } else {
                    link.classList.remove('active-toc'); // Đảm bảo các liên kết không hoạt động loại bỏ class
                }
            });
        }

        window.removeEventListener('scroll', window._tocScrollHandler);
        window._tocScrollHandler = onScroll;
        window.addEventListener('scroll', onScroll);
        onScroll(); // Call once on load to set initial highlight
    }

    // Hàm gắn trình xử lý sự kiện click để mở modal cho tất cả các hình ảnh liên quan
    function setupImageModalTriggers() {
        // Lấy tất cả các hình ảnh trong .project-content mà không phải là logo nhỏ
        const imagesToMakeClickable = document.querySelectorAll('main .project-content img:not(.image-logo-small)');

        imagesToMakeClickable.forEach(img => {
            // Kiểm tra xem đã có sự kiện click được gắn vào chưa để tránh trùng lặp
            if (!img.dataset.hasModalListener) {
                img.style.cursor = 'pointer'; // Hiển thị con trỏ là dạng bàn tay để người dùng biết có thể nhấp
                img.addEventListener('click', function() {
                    // Gọi hàm showImageModal từ modal-img.js
                    if (typeof showImageModal === 'function') {
                        showImageModal(this);
                    }
                });
                img.dataset.hasModalListener = 'true'; // Đánh dấu đã gắn listener
            }
        });
    }

    // --- Flip Card Functionality ---
    const flipCards = document.querySelectorAll('.flip-card');

    flipCards.forEach(flipCard => {
        let timer;

        flipCard.addEventListener('touchstart', function(event) {
            event.preventDefault(); // Ngăn chặn hành vi mặc định
            const card = this;
            timer = setTimeout(() => {
                card.classList.add('hold');
            }, 500); // Thời gian giữ (500ms)
        });

        flipCard.addEventListener('touchend', function(event) {
            event.preventDefault(); // Ngăn chặn hành vi mặc định
            clearTimeout(timer);
            this.classList.remove('hold');
        });

        flipCard.addEventListener('touchcancel', function(event) {
            event.preventDefault(); // Ngăn chặn hành vi mặc định
            clearTimeout(timer);
            this.classList.remove('hold');
        });
        flipCard.addEventListener('mouseleave', function() { // Thêm sự kiện mouseleave
            clearTimeout(timer);
            this.classList.remove('hold');
        });
    });

    // Khởi tạo trình kích hoạt modal sau khi trang tải xong và nội dung được hiển thị
    // Chắc chắn rằng modal-img.js đã được tải trước đó
    setTimeout(setupImageModalTriggers, 0);

});
