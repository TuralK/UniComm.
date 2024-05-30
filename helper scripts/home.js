document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const universityList = document.getElementById('university-list');
  const universities = universityList.getElementsByClassName('university');

  searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    Array.from(universities).forEach(university => {
      const universityName = university.getAttribute('data-name').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      if (universityName.includes(filter)) {
        university.style.display = '';
      } else {
        university.style.display = 'none';
      }
    });
  });
});

window.addEventListener('scroll', function() {
  const nav = document.querySelector('.nav');
  if (window.scrollY > 0) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

