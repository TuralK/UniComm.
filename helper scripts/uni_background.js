document.addEventListener("DOMContentLoaded", function() {
    // Retrieve the hidden input field value containing the university ID
    const uniIdElement = document.querySelector('input[name="uni_id"]');
    
    if (uniIdElement) {
      const uniId = uniIdElement.value;
      const backgroundUrl = `${uniId}.jpg`;
      
      // Set the background image of the body
      document.body.style.backgroundImage = `url(/${backgroundUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
  });
  