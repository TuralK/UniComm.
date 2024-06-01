document.addEventListener("DOMContentLoaded", function() {
    // Retrieve the element with data-uni-id or data-profile-id
    const idElement = document.querySelector('[data-uni-id]');
    
    if (idElement) {
      const uniId = idElement.getAttribute('data-uni-id');
      const profileId = idElement.getAttribute('data-profile-id');
      const id = uniId || profileId;
      const backgroundUrl = `${id}.jpg`;
      
      // Set the background image of the body
      document.body.style.backgroundImage = `url(/${backgroundUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
});
