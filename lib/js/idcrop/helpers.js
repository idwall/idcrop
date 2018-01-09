function loadImage(src) {
  var img = new Image();
  /* eslint-disable */
  img.src = src.substring(0, 1) === "\"" ? src.substring(1, src.length - 1) : src;
  /* eslint-enable */
  return new Promise(function(resolve, reject) {
    img.onload = () => resolve(img);
    img.onerror = error => reject(error);
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
  const style = element.currentStyle || window.getComputedStyle(element, false);
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

function dragDropInput(input, dragArea, filenameArea, self) {
  dragArea.addEventListener("dragenter", function() {
    dragArea.classList.add("hovered");
  });
  dragArea.addEventListener("dragleave", function() {
    dragArea.classList.remove("hovered");
  });
  dragArea.addEventListener("dragover", function(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  });
  dragArea.addEventListener("drop", function(event) {
    event.preventDefault();
    dragArea.classList.remove("hovered");
    getFile(event).then(data => {
      filenameArea.innerHTML = data.filename;
      self.startCroppingArea(data.base64, self);
    });
  });
  input.addEventListener("change", function(event) {
    getFile(event).then(data => {
      filenameArea.innerHTML = data.filename;
      self.startCroppingArea(data.base64, self);
    });
  });
}

function getFile(event) {
  event.preventDefault();
  const file =
    typeof event.target.files !== "undefined"
      ? event.target.files[0]
      : event.dataTransfer.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise(function(resolve, reject) {
    reader.onload = event =>
      resolve({
        filename: file.name,
        base64: event.target.result
      });
    reader.onerror = error => reject(error);
  });
}

module.exports = exports = {
  loadImage,
  dataURIFromSrc,
  getBgSource,
  fakeInput,
  dragDropInput,
  getFile
};
