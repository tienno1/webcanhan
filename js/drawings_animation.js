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
        const elementsToSearch = mainContent.querySelectorAll('.drawing[style*="display: block"] p, .drawing[style*="display: block"] h3, #drawing-philosophy[style*="display: block"] p, #drawing-philosophy[style*="display: block"] h2');
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
                displayContentForPage(firstFoundPage);
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
        const targetElement = document.querySelector(`main ${targetId}`);
        if (targetElement && tocContentDisplay) {
            tocContentDisplay.innerHTML = '';
            const contentToClone = targetElement.classList.contains('drawing') ?
                targetElement.querySelector('.drawing-content') :
                targetElement;
            if (contentToClone) {
                const clonedContent = contentToClone.cloneNode(true);
                if (clonedContent.classList) {
                    clonedContent.classList.remove('fade-in-element', 'is-visible', 'drawing');
                }
                clonedContent.querySelectorAll('.fade-in-element, .is-visible, .drawing').forEach(el => {
                    el.classList.remove('fade-in-element', 'is-visible', 'drawing');
                });
                clonedContent.querySelectorAll('.highlight').forEach(span => {
                    const parent = span.parentNode;
                    if (parent) {
                        parent.replaceChild(document.createTextNode(span.textContent), span);
                        parent.normalize();
                    }
                });
                tocContentDisplay.appendChild(clonedContent);
                const sidebarImages = tocContentDisplay.querySelectorAll('img');
                sidebarImages.forEach(img => {
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', function() {
                        const imageUrl = this.getAttribute('src');
                        const mainContentImage = mainContent.querySelector(`main img[src="${imageUrl}"]`);
                        if (mainContentImage) {
                            mainContentImage.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
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

    function displayFirstContentOfCurrentPageInSidebar(pageNumber) {
        const firstContentOnPage = document.querySelector(`main .drawing[data-page="${pageNumber}"][style*="display: block"], main #drawing-philosophy[data-page="${pageNumber}"][style*="display: block"]`);
        if (firstContentOnPage) {
            const firstContentId = `#${firstContentOnPage.id}`;
            displayContentInSidebar(firstContentId);
        } else {
            if (tocContentDisplay) {
                tocContentDisplay.innerHTML = '<p>Chọn một mục từ mục lục để xem chi tiết tại đây.</p>';
            }
        }
    }

    // --- Dynamic Pagination ---
    const paginationContainer = document.querySelector('.pagination-container');
    const itemsPerPage = 2;

    function getCurrentPage() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('page')) || 1;
    }

    function displayContentForPage(pageNumber) {
        const allContentSections = document.querySelectorAll('main section[data-page]');
        allContentSections.forEach((section) => {
            const sectionPage = parseInt(section.getAttribute('data-page'));
            if (!isNaN(sectionPage) && sectionPage === pageNumber) {
                section.style.display = 'block';
                section.classList.remove('is-visible');
                setTimeout(() => {
                    section.classList.add('is-visible');
                }, 50);
            } else {
                section.style.display = 'none';
                section.classList.remove('is-visible');
            }
        });
    }

    function updateTocListForPage(pageNumber) {
        if (!tocList) return;
        tocList.innerHTML = '';
        const contentOnCurrentPage = document.querySelectorAll(`main .drawing[data-page="${pageNumber}"], main #drawing-philosophy[data-page="${pageNumber}"]`);
        contentOnCurrentPage.forEach(section => {
            const sectionId = section.id;
            const originalListItem = originalTocListItems.find(item => {
                const link = item.querySelector('a');
                return link && link.getAttribute('href') === `#${sectionId}`;
            });
            if (originalListItem) {
                const listItem = originalListItem.cloneNode(true);
                tocList.appendChild(listItem);
            }
        });
        const newTocLinks = tocList.querySelectorAll('a');
        newTocLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(`main ${targetId}`);
                if (targetElement) {
                    const targetPage = parseInt(targetElement.getAttribute('data-page'));
                    const currentPage = getCurrentPage();
                    const totalPages = getTotalPages();
                    if (!isNaN(targetPage) && targetPage !== currentPage) {
                        history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                        displayContentForPage(targetPage);
                        renderPagination(targetPage, totalPages);
                        updateTocListForPage(targetPage);
                        setTimeout(() => {
                            displayContentInSidebar(targetId);
                            const elementOnNewPage = document.querySelector(`main ${targetId}`);
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
    }

    function getTotalPages() {
        let maxPage = 0;
        const allContentSections = document.querySelectorAll('main section[data-page]');
        allContentSections.forEach(section => {
            const page = parseInt(section.getAttribute('data-page'));
            if (!isNaN(page) && page > maxPage) {
                maxPage = page;
            }
        });
        return maxPage > 0 ? maxPage : 1;
    }

    function renderPagination(currentPage, totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const startButton = 1;
        const endButton = totalPages;
        for (let i = startButton; i <= endButton; i++) {
            const button = document.createElement('a');
            button.href = `drawings.html?page=${i}`;
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
                    displayContentForPage(targetPage);
                    renderPagination(targetPage, totalPages);
                    setTimeout(() => {
                        displayFirstContentOfCurrentPageInSidebar(targetPage);
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
            nextButton.href = `drawings.html?page=${currentPage + 1}`;
            nextButton.classList.add('pagination-button', 'next');
            nextButton.innerHTML = 'Next &gt;';
            nextButton.addEventListener('click', function(event) {
                event.preventDefault();
                const targetPage = currentPage + 1;
                history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
                displayContentForPage(targetPage);
                renderPagination(targetPage, totalPages);
                setTimeout(() => {
                    displayFirstContentOfCurrentPageInSidebar(targetPage);
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
        const totalPages = getTotalPages();
        displayContentForPage(pageFromState);
        renderPagination(pageFromState, totalPages);
        setTimeout(() => {
            displayFirstContentOfCurrentPageInSidebar(pageFromState);
        }, 50);
        updateTocListForPage(pageFromState);
    });

    // --- TOC Scroll Synchronization ---
    const sections = document.querySelectorAll('main section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const currentTocList = document.getElementById('toc-list');
            if (currentTocList) {
                const tocLink = currentTocList.querySelector(`a[href="#${id}"]`);
                if (tocLink) {
                    if (entry.isIntersecting) {
                        const currentlyVisibleTocLinks = currentTocList.querySelectorAll('a');
                        currentlyVisibleTocLinks.forEach(link => link.classList.remove('active-toc'));
                        tocLink.classList.add('active-toc');
                    } else {
                        tocLink.classList.remove('active-toc');
                    }
                }
            }
        });
    }, {
        threshold: 0.5
    });
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Mobile TOC Toggle ---
    const tocToggleButton = document.querySelector('.toc-toggle-button');
    const tocWrapper = document.querySelector('.toc-wrapper');
    if (tocToggleButton && tocWrapper) {
        tocToggleButton.addEventListener('click', () => {
            tocWrapper.classList.toggle('is-visible');
            document.body.classList.toggle('toc-open');
        });
        const mobileTocLinks = tocWrapper.querySelectorAll('a');
        mobileTocLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (tocWrapper.classList.contains('is-visible')) {
                    tocWrapper.classList.remove('is-visible');
                    document.body.classList.remove('toc-open');
                }
            });
        });
    }

    // --- Initial Setup ---
    const currentPageOnLoad = getCurrentPage();
    const totalPagesOnLoad = getTotalPages();
    displayContentForPage(currentPageOnLoad);
    renderPagination(currentPageOnLoad, totalPagesOnLoad);
    updateTocListForPage(currentPageOnLoad);
    setTimeout(() => {
        displayFirstContentOfCurrentPageInSidebar(currentPageOnLoad);
    }, 100);

    // --- Modal Image Viewer NÂNG CAO ---
    const images = Array.from(document.querySelectorAll('main img'));
    let currentImgIndex = 0;
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const btnClose = document.querySelector('.image-modal-close');
    const btnFullscreen = document.querySelector('.image-modal-fullscreen');
    const btnPrev = document.querySelector('.image-modal-prev');
    const btnNext = document.querySelector('.image-modal-next');

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

    btnFullscreen && btnFullscreen.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.toggle('fullscreen');
    });

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
});