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

    // --- Global state for visible images per section ---
    // Map to store the current number of images displayed for each section (key: sectionId, value: number of images)
    let visibleImageCounts = new Map();

    // --- Function to manage image display and "Load More" button ---
    // This function controls the display of images and the "Load More" button within a specific container.
    // imageContainerElement: The element containing the images (e.g., .drawing-content)
    // sectionId: The ID of the parent section (to track display status)
    function manageImageDisplay(imageContainerElement, sectionId) {
        if (!imageContainerElement) return;

        // Get all image-wrappers inside the container
        const allImageWrappers = Array.from(imageContainerElement.querySelectorAll('.image-wrapper'));
        const totalImages = allImageWrappers.length; // Count the number of wrappers to know the total number of images

        let currentVisibleCount = visibleImageCounts.get(sectionId);

        // Initialize the initial number of displayed images to 5 if not set
        if (currentVisibleCount === undefined) {
            visibleImageCounts.set(sectionId, 5); // Default to displaying the first 5 images
            currentVisibleCount = 5;
        }

        // Hide all image-wrappers initially
        allImageWrappers.forEach(wrapper => {
            wrapper.style.display = 'none';
        });

        // Display image-wrappers up to the current allowed number
        for (let i = 0; i < currentVisibleCount; i++) {
            if (allImageWrappers[i]) {
                allImageWrappers[i].style.display = 'inline-block'; // Set to inline-block for horizontal
            }
        }

        // Manage the "Load More" button
        // The "Load More" button only appears in the main content area, not in the sidebar table of contents
        const parentSection = imageContainerElement.closest('.drawing'); // Check if this is the main content of a drawing

        // Find an existing "Load More" button in the parent section (to avoid creating multiple buttons)
        let loadMoreButton = parentSection ? parentSection.querySelector('.load-more-btn') : null;

        if (totalImages > currentVisibleCount) { // If there are more images to load
            if (!loadMoreButton) {
                // Create "Load More" button if it doesn't exist
                loadMoreButton = document.createElement('button');
                loadMoreButton.textContent = 'Xem thêm';
                loadMoreButton.classList.add('load-more-btn');
                // Insert the button after drawing-content but still within the section
                parentSection.appendChild(loadMoreButton);
            }
            loadMoreButton.style.display = 'block'; // Ensure the button is visible

            // Reassign the click event (to avoid multiple listeners if the function is called again)
            loadMoreButton.onclick = null; // Clear old listener
            loadMoreButton.onclick = () => {
                const currentVis = visibleImageCounts.get(sectionId);
                let newVisible = currentVis + 5; // Load 5 more images
                if (newVisible > totalImages) {
                    newVisible = totalImages; // Ensure it does not exceed the total number of images
                }
                visibleImageCounts.set(sectionId, newVisible); // Update the number of displayed images
                manageImageDisplay(imageContainerElement, sectionId); // Call the function again to update the display
            };
        } else { // If all images have been displayed
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none'; // Hide the "Load More" button
            }
        }
    }

    // --- Table of Contents - Display Content in Sidebar and Scroll to Image ---
    const tocLinks = document.querySelectorAll('.toc ul li a');
    const tocContentDisplay = document.getElementById('toc-content-display');
    const tocList = document.getElementById('toc-list');
    const originalTocListItems = Array.from(tocList ? tocList.querySelectorAll('li') : []);

    function displayContentInSidebar(targetId) {
        const targetElement = document.querySelector(`main ${targetId}`); // This is the original section (e.g., #drawing-1)
        if (targetElement && tocContentDisplay) {
            tocContentDisplay.innerHTML = ''; // Clear old content

            const contentToClone = targetElement.classList.contains('drawing') ?
                targetElement.querySelector('.drawing-content') :
                targetElement; // Get the specific content part to clone

            if (contentToClone) {
                const clonedContent = contentToClone.cloneNode(true); // Clone all child elements

                // Remove any fade-in/drawing classes from cloned elements to avoid conflicts
                clonedContent.classList.remove('fade-in-element', 'is-visible', 'drawing');
                clonedContent.querySelectorAll('.fade-in-element, .is-visible', '.drawing').forEach(el => {
                    el.classList.remove('fade-in-element', 'is-visible', 'drawing');
                });
                clonedContent.querySelectorAll('.highlight').forEach(span => {
                    const parent = span.parentNode;
                    if (parent) {
                        parent.replaceChild(document.createTextNode(span.textContent), span);
                        parent.normalize();
                    }
                });

                // Ensure image-wrappers in cloned content reflect `visibleImageCounts` status
                const allClonedImageWrappers = Array.from(clonedContent.querySelectorAll('.image-wrapper'));
                const sectionId = targetId.substring(1); // Get clean section ID (without '#')
                // Get the number of images currently displayed in the main content, or display all if no status
                const currentVisibleForMainContent = visibleImageCounts.get(sectionId) || allClonedImageWrappers.length; // Sidebar displays all images by default

                allClonedImageWrappers.forEach((wrapper, index) => {
                    if (index < currentVisibleForMainContent) {
                        wrapper.style.display = 'block'; // Display block for sidebar for vertical stacking
                    } else {
                        wrapper.style.display = 'none';
                    }
                });

                // Remove any "Load More" buttons that might have been cloned (because sidebar shouldn't have this button)
                let clonedLoadMoreButton = clonedContent.querySelector('.load-more-btn');
                if (clonedLoadMoreButton) {
                    clonedLoadMoreButton.remove();
                }

                tocContentDisplay.appendChild(clonedContent);

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

    tocLinks.forEach(link => {
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

    // --- Dynamic Pagination ---
    const paginationContainer = document.querySelector('.pagination-container');
    const drawingElements = document.querySelectorAll('.drawing, #drawing-philosophy'); // All sections that represent content
    const itemsPerPage = 2; // This variable seems unused now with data-page

    function getCurrentPage() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('page')) || 1;
    }

    function displayContentForPage(pageNumber) {
        drawingElements.forEach((section) => {
            const sectionPage = parseInt(section.getAttribute('data-page'));
            if (!isNaN(sectionPage) && sectionPage === pageNumber) {
                section.style.display = 'block';
                section.classList.remove('is-visible');
                setTimeout(() => {
                    section.classList.add('is-visible');
                    const drawingContent = section.querySelector('.drawing-content');
                    if (drawingContent) {
                        // Call manageImageDisplay for the main content of the drawing section
                        manageImageDisplay(drawingContent, section.id);
                    }
                }, 10);
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
        // Re-attach TOC highlight after updating TOC
        setupTocHighlight();
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

    const maxVisibleButtons = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Back button
    if (currentPage > 1) {
        const backButton = document.createElement('a');
        backButton.href = `drawings.html?page=${currentPage - 1}`;
        backButton.classList.add('pagination-button', 'prev');
        backButton.innerHTML = '&lt; Back';
        backButton.addEventListener('click', function (event) {
            event.preventDefault();
            const targetPage = currentPage - 1;
            history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);
            displayContentForPage(targetPage);
            renderPagination(targetPage, totalPages);
            displayFirstContentOfCurrentPageInSidebar(targetPage);
            updateTocListForPage(targetPage);
            const navHeight = document.querySelector('nav')?.offsetHeight || 0;
                    window.scrollTo({ top: navHeight, behavior: 'auto' });
        });
        paginationContainer.appendChild(backButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('a');
        button.href = `drawings.html?page=${i}`;
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
                displayContentForPage(targetPage);
                renderPagination(targetPage, totalPages);
                displayFirstContentOfCurrentPageInSidebar(targetPage);
                updateTocListForPage(targetPage);
                const navHeight = document.querySelector('nav')?.offsetHeight || 0;
                    window.scrollTo({ top: navHeight, behavior: 'auto' });
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
            displayFirstContentOfCurrentPageInSidebar(targetPage);
            updateTocListForPage(targetPage);
            const navHeight = document.querySelector('nav')?.offsetHeight || 0;
                    window.scrollTo({ top: navHeight, behavior: 'auto' });
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
                        // Keep active if it's the last one scrolled past or only one active
                        // tocLink.classList.remove('active-toc');
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

    // Highlight TOC link when scrolling
    function setupTocHighlight() {
        const tocLinks = document.querySelectorAll('.toc ul#toc-list a');
        const sections = Array.from(tocLinks)
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        function onScroll() {
            let scrollPos = window.scrollY || window.pageYOffset;
            let currentIndex = -1; // Initialize with -1, meaning no section is currently active

            // Iterate backwards to find the lowest section currently in view
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                // Check if the section is currently displayed (not hidden by manageImageDisplay)
                const isSectionDisplayed = section.style.display !== 'none';

                if (isSectionDisplayed && section.offsetTop - 120 <= scrollPos) {
                    currentIndex = i;
                    break; // Found the active section, break the loop
                }
            }

            tocLinks.forEach((link, idx) => {
                if (idx === currentIndex) {
                    link.classList.add('active-toc');
                } else {
                    link.classList.remove('active-toc'); // Ensure inactive links remove the class
                }
            });
        }

        window.removeEventListener('scroll', window._tocScrollHandler);
        window._tocScrollHandler = onScroll;
        window.addEventListener('scroll', onScroll);
        onScroll(); // Call once on load to set initial highlight
    }

    // --- Mobile TOC Toggle ---
    const tocToggleButton = document.querySelector('.menu-toggle'); // Changed selector to match the actual menu button
    const tocWrapper = document.querySelector('.toc'); // Changed to .toc as it's the main sidebar container
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

    // --- Image Info Modal Functionality ---
    const appInfoModal = document.querySelector('.app-info-modal');
    const appInfoCloseBtn = document.querySelector('.app-info-close-btn');

    // Function to show the app info modal
    function showAppInfoModal() {
        if (appInfoModal) {
            appInfoModal.classList.add('active');
            appInfoModal.classList.remove('closing');
        }
    }

    // Function to hide the app info modal
    function hideAppInfoModal() {
        if (appInfoModal) {
            appInfoModal.classList.add('closing');
            appInfoModal.classList.remove('active');
            // Remove 'closing' class after transition to ensure it can be reopened
            appInfoModal.addEventListener('transitionend', function handler() {
                appInfoModal.classList.remove('closing');
                appInfoModal.removeEventListener('transitionend', handler);
            }, { once: true });
        }
    }

    // Event listener for the close button
    if (appInfoCloseBtn) {
        appInfoCloseBtn.addEventListener('click', hideAppInfoModal);
    }

    // Event listener to close modal when clicking outside content
    if (appInfoModal) {
        appInfoModal.addEventListener('click', (event) => {
            if (event.target === appInfoModal) {
                hideAppInfoModal();
            }
        });
    }
    
    // --- NEW: Add a button to open the info modal for each image ---
    // You will need to add a button next to each image (or where appropriate in your HTML)
    // with a class like 'open-info-modal-btn' and a data-attribute like data-image-id="[image_id]"
    // Example HTML for the button:
    // <button class="open-info-modal-btn" data-image-id="[image_id]">Xem thông tin</button>

    document.querySelectorAll('.open-info-modal-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Here you would fetch or populate the modal content based on the data-image-id
            // For now, we just show the modal.
            showAppInfoModal();
            // You might want to update the content of the modal here based on the specific image clicked
            // For example: populateModalContent(this.dataset.imageId);
        });
    });


    // --- Initial Setup ---
    const currentPageOnLoad = getCurrentPage();
    const totalPagesOnLoad = getTotalPages();
    displayContentForPage(currentPageOnLoad);
    renderPagination(currentPageOnLoad, totalPagesOnLoad);
    updateTocListForPage(currentPageOnLoad);
    setTimeout(() => {
        displayFirstContentOfCurrentPageInSidebar(currentPageOnLoad);
    }, 100);

    // Initialize image display for all drawing sections on the initial page.
    drawingElements.forEach(section => {
        // Initialize visibleImageCounts for each section if not set
        if (section.classList.contains('drawing')) { // Only for drawing sections
            if (visibleImageCounts.get(section.id) === undefined) {
                 visibleImageCounts.set(section.id, 5); // Default to displaying the first 5 images for each section
            }
            // Then, apply display logic to sections currently displayed on the current page
            const sectionPage = parseInt(section.getAttribute('data-page'));
            if (!isNaN(sectionPage) && sectionPage === currentPageOnLoad) {
                const drawingContent = section.querySelector('.drawing-content');
                if (drawingContent) {
                    manageImageDisplay(drawingContent, section.id);
                }
            }
        }
    });

    // Back to Top & Go to Bottom Buttons
    const backToTopBtn = document.getElementById('back-to-top');
    const goToBottomBtn = document.getElementById('go-to-bottom');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.body.scrollHeight;

        // Show back to top button when scrolled down
        if (scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Hide go to bottom button if near the end of the page
        if (scrollY + windowHeight >= docHeight - 100) {
            goToBottomBtn.style.display = 'none';
        } else {
            goToBottomBtn.style.display = 'block';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    goToBottomBtn.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // JavaScript for sticky navigation bar
    const nav = document.querySelector('.main-nav');
    const header = document.querySelector('header');
    let stickyOffset = 0; // Khởi tạo stickyOffset

    // Hàm để cập nhật stickyOffset
    const updateStickyOffset = () => {
        // Đảm bảo header đã được render và có offsetHeight
        if (header) {
            stickyOffset = header.offsetHeight; // Lấy chiều cao của header
        } else if (nav) { // Nếu không có header, lấy vị trí ban đầu của nav
            stickyOffset = nav.offsetTop;
        }
    };

    // Gọi lần đầu khi DOM đã tải xong
    updateStickyOffset();

    // Cập nhật stickyOffset khi cửa sổ thay đổi kích thước (ví dụ: xoay màn hình mobile)
    window.addEventListener('resize', updateStickyOffset);

    window.addEventListener('scroll', () => {
        if (nav) { // Đảm bảo nav tồn tại
            if (window.innerWidth >= 768) { // Chỉ áp dụng sticky cho desktop (màn hình >= 768px)
                if (window.pageYOffset > stickyOffset) {
                    nav.classList.add('sticky-nav');
                    // Thêm padding-top vào body để nội dung không bị ẩn bởi nav cố định
                    document.body.style.paddingTop = nav.offsetHeight + 'px';
                } else {
                    nav.classList.remove('sticky-nav');
                    // Xóa padding-top khi nav không còn dính
                    document.body.style.paddingTop = '0';
                }
            } else { // Đối với mobile (màn hình < 768px)
                // Trên mobile, loại bỏ hoàn toàn tính năng sticky và hiệu ứng trong suốt khi cuộn.
                // Thanh nav sẽ luôn giữ nguyên trạng thái mặc định của nó.
                nav.classList.remove('sticky-nav'); 
                document.body.style.paddingTop = '0'; 
            }
        }
    });

    // NEW: Close mobile nav when clicking outside
    const menuToggle = document.querySelector('.menu-toggle'); // Nút 3 gạch
    // nav đã được khai báo ở trên
    if (nav && menuToggle) {
        document.addEventListener('click', (event) => {
            // Kiểm tra nếu nav đang mở và click không phải trên nav hoặc nút toggle
            if (nav.classList.contains('open') && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
                nav.classList.remove('open'); // Đóng nav
                document.body.classList.remove('toc-open'); // Thêm dòng này để loại bỏ overflow: hidden
            }
        });
    }
});
