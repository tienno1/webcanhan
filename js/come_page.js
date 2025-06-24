window.addEventListener('load', () => {
  const hash = window.location.hash;

  // Ẩn tất cả các .project
  document.querySelectorAll('.project').forEach(section => {
    section.style.display = 'none';
  });

  if (hash) {
    const target = document.querySelector(hash);

    if (target) {
      // Lấy đúng data-page từ phần tử hoặc cha
      const page = target.getAttribute('data-page') || target.closest('.project')?.getAttribute('data-page');

      // Hiện đúng section
      const sectionToShow = document.querySelector(`.project[data-page="${page}"]`);
      if (sectionToShow) {
        sectionToShow.style.display = 'block';

        // Scroll sau 1 chút để đảm bảo layout render
        setTimeout(() => {
          const offset = window.innerHeight / 2 - target.offsetHeight / 2;
          const scrollTo = target.getBoundingClientRect().top + window.scrollY - offset;

          window.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  } else {
    // Nếu không có hash, hiện mặc định trang 1
    const first = document.querySelector('.project[data-page="1"]');
    if (first) first.style.display = 'block';
  }
});