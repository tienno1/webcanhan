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
            }
        });
    }, {
        threshold: 0.1
    });
    fadeInElements.forEach(element => {
        observer.observe(element);
    });


    // --- Global state for visible images per section ---
    // Map to store the current number of visible images for each section (key: sectionId, value: number of images)
    let visibleImageCounts = new Map();

    // --- Function to manage image display and "Load More" button ---
    // This function controls the display of images and the "Load More" button within a specific container.
    // imageContainerElement: The element containing the images (e.g., .project-content)
    // sectionId: The ID of the parent section (to track display state)
    function manageImageDisplay(imageContainerElement, sectionId) {
        if (!imageContainerElement) return;

        // Get all image-wrappers within the container
        const allImageWrappers = Array.from(imageContainerElement.querySelectorAll('.image-wrapper'));
        const totalImages = allImageWrappers.length; // Count the number of wrappers to know the total number of images

        let currentVisibleCount = visibleImageCounts.get(sectionId);

        // Initialize the number of initially displayed images to 5 if not already set
        // or if it's reset to 0 (to avoid displaying too many when reloading or changing pages)
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
        // The "Load More" button only appears in the main content area, not in the sidebar TOC
        const parentSection = imageContainerElement.closest('.project'); // Check if this is the main content of a project

        // Find the existing "Load More" button in the parent section (to avoid creating multiple buttons)
        let loadMoreButton = parentSection ? parentSection.querySelector('.load-more-btn') : null;

        if (totalImages > currentVisibleCount) { // If there are still images to load
            if (!loadMoreButton) {
                // Create the "Load More" button if it doesn't exist
                loadMoreButton = document.createElement('button');
                loadMoreButton.textContent = 'Xem thêm';
                loadMoreButton.classList.add('load-more-btn');
                // Insert the button after project-content but still within the section
                parentSection.appendChild(loadMoreButton);
            }
            loadMoreButton.style.display = 'block'; // Ensure the button is visible

            // Re-assign the click event (to avoid multiple listeners if the function is called again)
            loadMoreButton.onclick = null; // Clear old listener
            loadMoreButton.onclick = () => {
                const currentVis = visibleImageCounts.get(sectionId);
                let newVisible = currentVis + 5; // Load 5 more images
                if (newVisible > totalImages) {
                    newVisible = totalImages; // Ensure not to exceed the total number of images
                }
                visibleImageCounts.set(sectionId, newVisible); // Update the number of visible images
                manageImageDisplay(imageContainerElement, sectionId); // Call the function again to update display
                // No need to call setupImageModalTriggers here, it's handled by modal-img.js
            };
        } else { // If all images are already displayed
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
        const targetElement = document.querySelector(targetId); // This is the original section (e.g., #design-Lookbook)
        if (targetElement && tocContentDisplay) {
            tocContentDisplay.innerHTML = ''; // Clear old content

            const contentToClone = targetElement.classList.contains('project') ?
                targetElement.querySelector('.project-content') :
                targetElement; // Get the specific content part to clone

            if (contentToClone) {
                const clonedContent = contentToClone.cloneNode(true); // Clone all child elements

                // Remove any fade-in/project classes from cloned elements to avoid conflicts
                clonedContent.classList.remove('fade-in-element', 'is-visible', 'project');
                clonedContent.querySelectorAll('.fade-in-element, .is-visible', '.project').forEach(el => {
                    el.classList.remove('fade-in-element', 'is-visible', 'project');
                });

                // Ensure images in cloned content reflect the `visibleImageCounts` state
                // The purpose is for the sidebar to display the *current number of images* that the user has loaded in the main content,
                // without its own "Load More" button.
                const allClonedImageWrappers = Array.from(clonedContent.querySelectorAll('.image-wrapper'));
                const sectionId = targetId.substring(1); // Get clean section ID (without '#')
                // Get the number of images currently visible in the main content, or display all if no state
                const currentVisibleForMainContent = visibleImageCounts.get(sectionId) || allClonedImageWrappers.length; // Sidebar displays all images by default


                allClonedImageWrappers.forEach((wrapper, index) => {
                    if (index < currentVisibleForMainContent) {
                        wrapper.style.display = 'block'; // Display block for sidebar for vertical stacking
                    } else {
                        wrapper.style.display = 'none';
                    }
                });

                // Remove any "Load More" button that might have been cloned (since the sidebar should not have this button)
                let clonedLoadMoreButton = clonedContent.querySelector('.load-more-btn');
                if (clonedLoadMoreButton) {
                    clonedLoadMoreButton.remove();
                }

                tocContentDisplay.appendChild(clonedContent);

                // Re-attach click events for images in the sidebar display area
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
                        // Call manageImageDisplay for the main content of the project
                        // Only call manageImageDisplay if the project has .image-wrapper (like page 1, 2)
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
        // Re-attach TOC highlight after updating TOC
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

        // Back button
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

        // Page number buttons (limited to 3 numbers near currentPage)
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

        // Next button
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
    displayProjectsForPage(currentPage); // This function will now call manageImageDisplay for displayed projects
    renderPagination(currentPage, totalPages);
    updateTocListForPage(currentPage); // setupTocHighlight will be called here

    // Initialize image display for all projects on the initial page.
    // This ensures that when the page first loads, images are hidden/shown correctly
    // before any pagination or TOC clicks occur.
    projectElements.forEach(project => {
        // Initialize visibleImageCounts for each project if not already set
        if (visibleImageCounts.get(project.id) === undefined) {
             visibleImageCounts.set(project.id, 5); // Default to displaying the first 5 images for each section
        }
        // Then, apply display logic to projects currently visible on the current page
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
            let currentIndex = -1; // Initialize with -1, meaning no active section

            // Loop backward to find the lowest section currently visible
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                // Điều chỉnh offset để tính cả chiều cao của nav khi dính
                const navHeight = document.querySelector('.main-nav.sticky-nav')?.offsetHeight || 0;
                if (section && section.offsetTop - navHeight - 20 <= scrollPos) { // Thêm 20px để tạo khoảng đệm
                    currentIndex = i;
                    break; // Found active section, exit loop
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

    // Function to attach click event handlers to open the modal for all relevant images
    function setupImageModalTriggers() {
        // Get all images within .project-content that are not small logos
        const imagesToMakeClickable = document.querySelectorAll('main .project-content img:not(.image-logo-small)');

        imagesToMakeClickable.forEach(img => {
            // Check if a click event has already been attached to avoid duplicates
            if (!img.dataset.hasModalListener) {
                img.style.cursor = 'pointer'; // Display hand cursor to indicate clickability
                img.addEventListener('click', function() {
                    // Call the showImageModal function from modal-img.js
                    if (typeof showImageModal === 'function') {
                        showImageModal(this);
                    }
                });
                img.dataset.hasModalListener = 'true'; // Mark listener as attached
            }
        });
    }

    // --- Flip Card Functionality ---
    const flipCards = document.querySelectorAll('.flip-card');

    flipCards.forEach(flipCard => {
        let timer;

        flipCard.addEventListener('touchstart', function(event) {
            event.preventDefault(); // Prevent default behavior
            const card = this;
            timer = setTimeout(() => {
                card.classList.add('hold');
            }, 500); // Hold time (500ms)
        });

        flipCard.addEventListener('touchend', function(event) {
            event.preventDefault(); // Prevent default behavior
            clearTimeout(timer);
            this.classList.remove('hold');
        });

        flipCard.addEventListener('touchcancel', function(event) {
            event.preventDefault(); // Prevent default behavior
            clearTimeout(timer);
            this.classList.remove('hold');
        });
        flipCard.addEventListener('mouseleave', function() { // Add mouseleave event
            clearTimeout(timer);
            this.classList.remove('hold');
        });
    });

    // Initialize modal triggers after page load and content display
    // Ensure modal-img.js has been loaded beforehand
    setTimeout(setupImageModalTriggers, 0);

    // JavaScript for sticky navigation bar
    const nav = document.querySelector('.main-nav');
    const header = document.querySelector('header');
    let stickyOffset = 0; // Khởi tạo stickyOffset

    // Hàm để cập nhật stickyOffset và biến CSS --nav-height
    const updateStickyOffset = () => {
        if (header) {
            stickyOffset = header.offsetHeight; // Lấy chiều cao của header
        } else if (nav) { // Nếu không có header, lấy vị trí ban đầu của nav
            stickyOffset = nav.offsetTop;
        }
        // Cập nhật biến CSS --nav-height
        if (nav) {
            document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight}px`);
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
                    // Cập nhật lại --nav-height khi nav dính (nếu có thay đổi chiều cao)
                    document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight}px`);
                } else {
                    nav.classList.remove('sticky-nav');
                    // Xóa padding-top khi nav không còn dính
                    document.body.style.paddingTop = '0';
                    // Đặt lại --nav-height về 0 hoặc chiều cao ban đầu của nav
                    document.documentElement.style.setProperty('--nav-height', `0px`); // Hoặc `nav.offsetHeight` nếu bạn muốn nó luôn có giá trị
                }
            } else { // Đối với mobile (màn hình < 768px)
                nav.classList.remove('sticky-nav'); // Đảm bảo không có class sticky-nav trên mobile
                document.body.style.paddingTop = '0'; // Đảm bảo không có padding-top
                document.documentElement.style.setProperty('--nav-height', `0px`); // Trên mobile, nav không sticky nên set về 0
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
            }
        });
    }

});
