function getRandomIndex(max) {
    return Math.floor(Math.random() * max);
  }

  // Function to set a random image
  function setRandomImage() {
    const randomIndex = getRandomIndex(9) + 1;
    const randomImageSrc = randomIndex + ".jpg";
    document.getElementById("randomImage").src = randomImageSrc;
  }

  // Call the function to set a random image when the page loads
  window.addEventListener("load", setRandomImage);