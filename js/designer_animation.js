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
        }, 50);
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
        const elementsToSearch = mainContent.querySelectorAll('p, h2, h3, li');
        let foundElements = [];
        elementsToSearch.forEach(element => {
            const originalText = element.innerHTML;
            const lowerCaseText = originalText.toLowerCase();
            if (lowerCaseText.includes(searchTerm)) {
                foundElements.push(element);
                const regex = new RegExp(searchTerm, 'gi');
                const highlightedText = originalText.replace(regex, match => `<span class="highlight">${match}</span>`);
                element.innerHTML = highlightedText;
            }
        });
        if (foundElements.length > 0) {
            foundElements[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
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

    // --- Table of Contents - Display Content in Sidebar and Scroll to Image ---
    const tocLinks = document.querySelectorAll('.toc ul li a');
    const tocContentDisplay = document.getElementById('toc-content-display');
    const tocList = document.getElementById('toc-list');
    const originalTocListItems = Array.from(tocList ? tocList.querySelectorAll('li') : []);

    function displayContentInSidebar(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement && tocContentDisplay) {
            tocContentDisplay.innerHTML = '';
            const contentToClone = targetElement.classList.contains('project') ?
                targetElement.querySelector('.project-content') :
                targetElement;
            if (contentToClone) {
                const clonedContent = contentToClone.cloneNode(true);
                if (clonedContent.classList) {
                    clonedContent.classList.remove('fade-in-element', 'is-visible', 'project');
                }
                clonedContent.querySelectorAll('.fade-in-element, .is-visible, .project').forEach(el => {
                    el.classList.remove('fade-in-element', 'is-visible', 'project');
                });
                tocContentDisplay.appendChild(clonedContent);
                const sidebarImages = tocContentDisplay.querySelectorAll('img');
                sidebarImages.forEach(img => {
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', function() {
                        const imageUrl = this.getAttribute('src');
                        const mainContentImage = mainContent.querySelector(`img[src="${imageUrl}"]`);
                        if (mainContentImage) {
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
        const startButton = 1;
        const endButton = totalPages;
        for (let i = startButton; i <= endButton; i++) {
            const button = document.createElement('a');
            button.href = `designer.html?page=${i}`;
            button.classList.add('pagination-button');
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.textContent = i;
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const targetPage = parseInt(this.textContent);
                if (targetPage !== currentPage) {
                    history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                    displayProjectsForPage(targetPage);
                    renderPagination(targetPage, totalPages);
                    setTimeout(() => {
                        displayFirstProjectOfCurrentPageInSidebar(targetPage);
                    }, 50);
                    updateTocListForPage(targetPage);
                    if (mainContent) {
                        mainContent.scrollTop = 0;
                    }
                }
            });
            paginationContainer.appendChild(button);
        }
        if (currentPage < totalPages) {
            const nextButton = document.createElement('a');
            nextButton.href = `designer.html?page=${currentPage + 1}`;
            nextButton.classList.add('pagination-button', 'next');
            nextButton.innerHTML = 'Next &gt;';
            nextButton.addEventListener('click', function(event) {
                event.preventDefault();
                const targetPage = currentPage + 1;
                history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                displayProjectsForPage(targetPage);
                renderPagination(targetPage, totalPages);
                setTimeout(() => {
                    displayFirstProjectOfCurrentPageInSidebar(targetPage);
                }, 50);
                updateTocListForPage(targetPage);
                if (mainContent) {
                    mainContent.scrollTop = 0;
                }
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    window.addEventListener('popstate', (event) => {
        const state = event.state;
        const pageFromState = state && state.page ? state.page : getCurrentPage();
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
                clonedContent.querySelectorAll('.fade-in-element, .is-visible, .project').forEach(el => {
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
            clonedContent.querySelectorAll('.fade-in-element, .is-visible, .project').forEach(el => {
                el.classList.remove('fade-in-element', 'is-visible', 'project');
            });
            tocContentDisplay.appendChild(clonedContent);
        }
    }

    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    displayProjectsForPage(currentPage);
    renderPagination(currentPage, totalPages);
    updateTocListForPage(currentPage); // setupTocHighlight sẽ được gọi trong đây

    // --- Modal Image Viewer NÂNG CAO ---
    const images = Array.from(document.querySelectorAll('main img'));
    let currentImgIndex = 0;
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const btnClose = document.querySelector('.image-modal-close');
    const btnFullscreen = document.querySelector('.image-modal-fullscreen');
    const btnPrev = document.querySelector('.image-modal-prev');
    const btnNext = document.querySelector('.image-modal-next');

    // Mở modal khi click ảnh
    images.forEach((img, idx) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function () {
            currentImgIndex = idx;
            showModalWithImage(images[currentImgIndex].src);
        });
    });

    function showModalWithImage(src) {
        if (modal && modalImg) {
            modalImg.src = src;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Đóng modal
    function closeModal() {
        modal.classList.remove('active', 'fullscreen');
        document.body.style.overflow = '';
    }
    btnClose && btnClose.addEventListener('click', closeModal);
    modal && modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') showPrevImg();
        if (e.key === 'ArrowRight') showNextImg();
    });

    // Fullscreen toggle
    btnFullscreen && btnFullscreen.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.toggle('fullscreen');
    });

    // Next/Prev
    function showPrevImg() {
        if (images.length < 2) return;
        currentImgIndex = (currentImgIndex - 1 + images.length) % images.length;
        showModalWithImage(images[currentImgIndex].src);
    }
    function showNextImg() {
        if (images.length < 2) return;
        currentImgIndex = (currentImgIndex + 1) % images.length;
        showModalWithImage(images[currentImgIndex].src);
    }
    btnPrev && btnPrev.addEventListener('click', function(e) {
        e.stopPropagation();
        showPrevImg();
    });
    btnNext && btnNext.addEventListener('click', function(e) {
        e.stopPropagation();
        showNextImg();
    });

    // Kéo modal (drag)
    let isDragging = false, startX = 0, startY = 0, imgX = 0, imgY = 0;
    if (modalImg) {
        modalImg.addEventListener('mousedown', function(e) {
            if (!modal.classList.contains('active') || modal.classList.contains('fullscreen')) return;
            isDragging = true;
            startX = e.clientX - imgX;
            startY = e.clientY - imgY;
            modalImg.style.cursor = 'grabbing';
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            imgX = e.clientX - startX;
            imgY = e.clientY - startY;
            modalImg.style.transform = `translate(${imgX}px, ${imgY}px)`;
        });
        document.addEventListener('mouseup', function() {
            if (!isDragging) return;
            isDragging = false;
            modalImg.style.cursor = 'grab';
        });
        // Reset vị trí khi đổi ảnh hoặc đóng modal
        modalImg.addEventListener('load', function() {
            imgX = 0; imgY = 0;
            modalImg.style.transform = '';
        });
        modal.addEventListener('transitionend', function() {
            if (!modal.classList.contains('active')) {
                imgX = 0; imgY = 0;
                modalImg.style.transform = '';
            }
        });
    }

// Highlight TOC link when scrolling
function setupTocHighlight() {
    const tocLinks = document.querySelectorAll('.toc ul#toc-list a');
    const sections = Array.from(tocLinks)
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    function onScroll() {
        let scrollPos = window.scrollY || window.pageYOffset;
        let currentIndex = 0;
        sections.forEach((section, idx) => {
            if (section && section.offsetTop - 120 <= scrollPos) {
                currentIndex = idx;
            }
        });
        tocLinks.forEach((link, idx) => {
            if (idx === currentIndex) {
                link.classList.add('active-toc');
            } else {
                link.classList.remove('active-toc');
            }
        });
    }

    window.removeEventListener('scroll', window._tocScrollHandler);
    window._tocScrollHandler = onScroll;
    window.addEventListener('scroll', onScroll);
    onScroll();
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
});