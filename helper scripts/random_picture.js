function setRandomImage() {
  const randomIndex = Math.floor(Math.random() * 12) + 1;
  const randomImageSrc = randomIndex + ".jpg";
  document.getElementById("randomImage").src = randomImageSrc;
}
// Call the function to set a random image when the page loads
window.addEventListener("load", setRandomImage);