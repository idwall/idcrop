function loadImage(src) {
  var img = new Image();
  /* eslint-disable */
  img.src = src.substring(0, 1) === "\"" ? src.substring(1, src.length - 1) : src;
  // This enables CORS in case the image is from a diferent domain.
  img.crossOrigin = "anonymous";  
  /* eslint-enable */
  return new Promise(function(resolve, reject) {
    img.onload = function() {
      resolve(img);
    };
    img.onerror = function(error) {
      reject(error);
    };
  });
}

function dataURIFromSrc(src) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  return loadImage(src).then(function(img) {
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
  });
}

function getBgSource(element) {
  var style = element.currentStyle || window.getComputedStyle(element, false);
  return style.backgroundImage.slice(4, -1);
}

function fakeInput(input, fakeInput) {
  input.style.display = "none";
  fakeInput.addEventListener("click", function(event) {
    event = event || window.event;
    event.preventDefault();
    input.click();
  });
}

module.exports = exports = { loadImage, dataURIFromSrc, getBgSource, fakeInput };
