function loadImage(base64) {
  const img = new Image();

  img.src = base64;

  return new Promise(function(resolve, reject) {
    img.onload = function() {
      resolve(img);
    };
    img.onerror = function() {
      reject(undefined);
    };
  });
}

function fakeInput(input, fakeInput) {
  input.style.display = "none";
  fakeInput.addEventListener("click", function(event) {
    event = event || window.event;
    event.preventDefault();
    input.click();
  });
}

export { loadImage, fakeInput };
