document.addEventListener('DOMContentLoaded', () => {
    // Listen for the DOM to be fully loaded
    console.log('DOM fully loaded for scores.html'); // Debugging

    // --- Page Transition Effect ---
    // Get the container for the page content (the div with id="page-content")
    const pageContent = document.getElementById('page-content');
    console.log('Page transition: pageContent element found:', pageContent); // Debugging

    // Get all main navigation links within the nav bar
    const navLinks = document.querySelectorAll('nav a');
    console.log('Page transition: Navigation links found:', navLinks.length, navLinks); // Debugging

    // Define the fallback timeout duration (in milliseconds)
    const fallbackTimeout = 600; // Slightly longer than the CSS transition duration (0.5s)

    // Add click event listener to each main navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Check if the link is already the current page link
            if (this.classList.contains('active')) {
                console.log('Page transition: Link is already the active page, preventing navigation.'); // Debugging
                event.preventDefault(); // Prevent default behavior
                return; // Exit the function
            }

            console.log('Page transition: Link clicked:', this.href); // Debugging

            // Prevent the default link behavior (immediate navigation)
            event.preventDefault();

            // Get the URL of the page to navigate to
            const targetUrl = this.href;

            // Add the 'fade-out' class to the current page content
            if (pageContent) {
                 pageContent.classList.add('fade-out');
                 console.log('Page transition: Added fade-out class to pageContent'); // Debugging

                 // Add a listener for the transitionend event
                 const transitionEndHandler = () => {
                     console.log('Page transition: Fade-out transition ended, navigating to:', targetUrl); // Debugging
                     window.location.href = targetUrl;
                     // Clean up the event listener after it fires
                     pageContent.removeEventListener('transitionend', transitionEndHandler);
                 };

                 pageContent.addEventListener('transitionend', transitionEndHandler);

                 // Set a fallback timeout in case transitionend doesn't fire
                 setTimeout(() => {
                     // Check if the transitionend handler has already fired (by checking if the class is still there)
                     if (pageContent.classList.contains('fade-out')) {
                          console.log('Page transition: Fallback timeout triggered, navigating to:', targetUrl); // Debugging
                          window.location.href = targetUrl;
                          // Clean up the transitionend listener if the timeout handles navigation
                          pageContent.removeEventListener('transitionend', transitionEndHandler);
                     }
                 }, fallbackTimeout);

            } else {
                 // If pageContent doesn't exist, just navigate directly
                 console.log('Page transition: pageContent not found, navigating directly to:', targetUrl); // Debugging: Fallback navigation
                 window.location.href = targetUrl;
            }
        });
    });

    // Add the 'fade-in' class to the page content when the new page loads
    // This part runs immediately when the DOM is ready on the *new* page
    // The CSS transition will handle the fade-in animation
    // We add a small timeout to ensure the fade-out from the previous page has time to start
    // before the fade-in on the new page begins.
    if (pageContent) { // Check if pageContent element exists
        // Remove fade-out class if it exists (in case of back/forward navigation)
        pageContent.classList.remove('fade-out');
        // Add fade-in class after a short delay
        setTimeout(() => {
             pageContent.classList.add('fade-in');
             console.log('Page transition: Added fade-in class to pageContent'); // Debugging
        }, 50); // Adjust delay if needed
    }


    // --- Animation on Scroll (Fade-in) ---
    // Select elements with the 'fade-in-element' class for animation
    const fadeInElements = document.querySelectorAll('.fade-in-element');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Stop observing once the element has faded in
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    // Observe all elements selected by fadeInElements
    fadeInElements.forEach(element => {
        observer.observe(element);
    });


    // --- Table of Contents Scroll to Section ---

    // Get the TOC list element where we will display dynamic links
    const tocList = document.getElementById('toc-list');
    console.log('TOC List element found:', tocList); // Debugging

    // Store the original TOC list items before clearing the list
    // This is crucial for dynamically rebuilding the list later
    const originalTocListItems = Array.from(tocList.querySelectorAll('li'));
    console.log('Stored original TOC list items:', originalTocListItems.length, originalTocListItems); // Debugging

    // Add click event listener to the original TOC links initially
    // This listener will be re-attached to dynamic links later
    originalTocListItems.forEach(listItem => {
        const link = listItem.querySelector('a');
        if (link) {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    console.log('TOC link clicked: Scrolling to:', targetId); // Debugging
                } else {
                    console.log('TOC link clicked: Target element not found:', targetId); // Debugging
                }
            });
        }
    });


    // --- Dynamic Pagination ---

    const paginationContainer = document.querySelector('.pagination-container'); // Get the pagination container
    // Select score sections instead of project elements
    const scoreSections = document.querySelectorAll('.score-section'); // Get all score sections


    // Define how many sections per page
    const sectionsPerPage = 1; // You can change this number (e.g., 1 section per page)

    // Function to get the current page number from the URL
    function getCurrentPage() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('page')) || 1;
    }

    // Function to show/hide score sections based on the current page
    function displayScoreSectionsForPage(pageNumber) {
        scoreSections.forEach((section) => {
            // Check if the section's data-page matches the current page
            const sectionPage = parseInt(section.getAttribute('data-page')); // Get data-page attribute

            if (!isNaN(sectionPage) && sectionPage === pageNumber) {
                 section.style.display = 'block'; // Show the section
                 // Optional: Re-trigger fade-in animation for visible sections
                 section.classList.remove('is-visible');
                 setTimeout(() => {
                     section.classList.add('is-visible');
                 }, 10); // Small delay
            } else {
                section.style.display = 'none'; // Hide the section
                 section.classList.remove('is-visible'); // Remove animation class
            }
        });
    }

    // Function to update the TOC list to only show links for the current page's score sections
    function updateTocListForPage(pageNumber) {
        console.log('Updating TOC list for page:', pageNumber); // Debugging
        if (!tocList) {
             console.log('TOC list element not found.'); // Debugging
             return; // Exit if TOC list element not found
        }

        // Clear the current TOC list
        tocList.innerHTML = '';
        console.log('Cleared TOC list.'); // Debugging

        // Find all score sections for the current page
        const sectionsOnCurrentPage = document.querySelectorAll(`.score-section[data-page="${pageNumber}"]`);
        console.log('Score sections found on current page:', sectionsOnCurrentPage.length, sectionsOnCurrentPage); // Debugging


        // Add links for each score section on the current page
        sectionsOnCurrentPage.forEach(section => {
            const sectionId = section.id;
            console.log('Processing section with ID:', sectionId); // Debugging

             // Find the corresponding original TOC list item using the stored references
            const originalListItem = originalTocListItems.find(item => {
                 const link = item.querySelector('a');
                 return link && link.getAttribute('href') === `#${sectionId}`;
             });

            console.log('Original list item found for', sectionId, ':', originalListItem); // Debugging


            if (originalListItem) {
                // Clone the original list item and append it to the TOC list
                const listItem = originalListItem.cloneNode(true);
                tocList.appendChild(listItem);
                console.log('Added link for', sectionId, 'to TOC list.'); // Debugging
            } else {
                 console.log('Original TOC list item not found for section ID:', sectionId); // Debugging
            }
        });

        // NOTE: For the Scores page, we are NOT adding a static "Triết lý Thiết Kế" link.
        // If you have other static sections not part of pagination, you would add them here
        // using a similar approach as the philosophy link in the designer JS.


         console.log('Finished updating TOC list for page:', pageNumber); // Debugging

         // Re-attach click listeners to the newly added TOC links
         // We need to do this because cloning elements removes their event listeners
         const newTocLinks = tocList.querySelectorAll('a');
         console.log('Re-attaching click listeners to new TOC links:', newTocLinks.length); // Debugging
         newTocLinks.forEach(link => {
             link.addEventListener('click', function(event) {
                 event.preventDefault();
                 const targetId = this.getAttribute('href');
                 const targetElement = document.querySelector(targetId);
                 if (targetElement) {
                     targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     console.log('New TOC link clicked: Scrolling to:', targetId); // Debugging
                 } else {
                     console.log('New TOC link clicked: Target element not found:', targetId); // Debugging
                 }
             });
         });
    }


    // Function to get the total number of pages
    function getTotalPages() {
        // In this example, we determine total pages based on the highest data-page value
        let maxPageFromData = 0;
        scoreSections.forEach(section => { // Use scoreSections
            const page = parseInt(section.getAttribute('data-page'));
            if (!isNaN(page) && page > maxPageFromData) {
                maxPageFromData = page;
            }
        });
        // If no score sections with data-page found, assume 1 page
        return maxPageFromData > 0 ? maxPageFromData : 1;
    }


    // Function to generate and display pagination buttons
    function renderPagination(currentPage, totalPages) {
        if (!paginationContainer) return; // Exit if container not found

        paginationContainer.innerHTML = ''; // Clear existing buttons

        // Determine the range of buttons to show (e.g., current page and a few around it)
        const startButton = 1;
        const endButton = totalPages;

        // Create buttons for each page
        for (let i = startButton; i <= endButton; i++) {
            const button = document.createElement('a');
            // Use history.pushState for smoother URL update without full reload
            button.href = `scores.html?page=${i}`; // Link to the page number (updated file name)
            button.classList.add('pagination-button');
            if (i === currentPage) {
                button.classList.add('active'); // Add active class for the current page
            }
            button.textContent = i; // Button text is the page number

            // Add click listener to handle pagination button clicks
            button.addEventListener('click', function(event) {
                 event.preventDefault(); // Prevent default navigation

                 const targetPage = parseInt(this.textContent); // Get the page number from button text

                 if (targetPage !== currentPage) { // Only update if clicking a different page
                     console.log('Pagination button clicked, navigating to page:', targetPage); // Debugging

                     // Update URL without full page reload
                     history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);

                     // Update main content to display sections for the new page
                     displayScoreSectionsForPage(targetPage); // Use displayScoreSectionsForPage

                     // Update pagination buttons active state
                     renderPagination(targetPage, totalPages);

                     // Update the TOC list to show only links for the new page's sections
                     updateTocListForPage(targetPage); // Call the new function

                     // Optional: Scroll main content to top after changing page
                     if (mainContent) {
                         mainContent.scrollTop = 0;
                     }
                 } else {
                     console.log('Pagination button clicked for current page, no action needed.'); // Debugging
                 }
            });

            paginationContainer.appendChild(button); // Add button to the container
        }

        // Add the "Next >" button if not on the last page
         if (currentPage < totalPages) {
             const nextButton = document.createElement('a');
             // Use history.pushState for smoother URL update
             nextButton.href = `scores.html?page=${currentPage + 1}`; // Link to the next page (updated file name)
             nextButton.classList.add('pagination-button', 'next');
             nextButton.innerHTML = 'Next &gt;';

             // Add click listener for smooth transition
             nextButton.addEventListener('click', function(event) {
                  event.preventDefault(); // Prevent default navigation

                  const targetPage = currentPage + 1;

                  console.log('Next button clicked, navigating to page:', targetPage); // Debugging

                  // Update URL without full page reload
                  history.pushState({ page: targetPage }, `Page ${targetPage}`, `?page=${targetPage}`);

                  // Update main content to display sections for the new page
                  displayScoreSectionsForPage(targetPage); // Use displayScoreSectionsForPage

                  // Update pagination buttons active state
                  renderPagination(targetPage, totalPages);

                  // Update the TOC list to show only links for the new page's sections
                  updateTocListForPage(targetPage); // Call the new function

                   // Optional: Scroll main content to top after changing page
                  if (mainContent) {
                      mainContent.scrollTop = 0;
                  }
             });

             paginationContainer.appendChild(nextButton);
         }
    }

    // --- Initialize Pagination and Content on Load ---
    // This part needs to be called when the DOM is ready
    // Ensure this is within the DOMContentLoaded listener in your main JS file
    const currentPage = getCurrentPage(); // Get the current page number
    const totalPages = getTotalPages(); // Get the total number of pages
    displayScoreSectionsForPage(currentPage); // Display sections for the current page in main content
    renderPagination(currentPage, totalPages); // Render the pagination buttons
    updateTocListForPage(currentPage); // Initialize the TOC list for the current page


    // --- Handle Browser Back/Forward Button (Optional) ---
    // This allows the pagination and sidebar content to update if the user
    // uses the browser's back/forward buttons to navigate through pagination history.
    window.addEventListener('popstate', (event) => {
        console.log('Popstate event triggered.'); // Debugging
        const state = event.state;
        const pageFromState = state && state.page ? state.page : getCurrentPage(); // Get page from state or URL

        console.log('Navigating to page from history:', pageFromState); // Debugging

        // Update main content
        displayScoreSectionsForPage(pageFromState); // Use displayScoreSectionsForPage
        // Update pagination buttons
        renderPagination(pageFromState, totalPages);
        // Update the TOC list for the historical page
        updateTocListForPage(pageFromState); // Call the new function
    });


}); // End of DOMContentLoaded listener


