new fullpage('#fullpage', {
  autoScrolling: true,
  navigation: true,
  anchors: ['About-me', 'so-Thich', 'Ky-nang1', 'Ky-nang2'],
  onLeave: function(origin, destination, direction) {
    const nav = document.getElementById('sideNav');
    const theme = destination.item.dataset.navTheme;
    const newLogoSrc = destination.item.dataset.logo; // Get the logo path from data-logo attribute

    // Đổi theme sáng/tối
    // This block can be refactored for cleaner theme switching if needed
    if (theme === 'dark') {
      nav.classList.remove('light', 'green'); // Remove other themes
      nav.classList.add('dark');
    } else if (theme === 'green') { // Use else if for distinct themes
      nav.classList.remove('light', 'dark');
      nav.classList.add('green');
    } else { // Default to light if no specific theme or 'light'
      nav.classList.remove('dark', 'green');
      nav.classList.add('light');
    }

    // Đổi logo
    const logoDefault = document.getElementById('logo-default');
    const logoScroll = document.getElementById('logo-scroll');

    if (newLogoSrc) { // If a data-logo is specified for the section
      logoScroll.src = newLogoSrc; // Set the new logo source
      logoDefault.style.display = 'none'; // Hide the default logo
      logoScroll.style.display = 'block'; // Show the dynamic logo
    } else { // If no specific logo for the section, revert to default or handle as needed
      logoDefault.style.display = 'block';
      logoScroll.style.display = 'none';
      // Optionally, set logoScroll.src to a default value here if logoDefault is hidden always
    }
  }
});