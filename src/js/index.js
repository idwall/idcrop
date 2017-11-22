// Import SCSS files.
import "../scss/main.scss"

var IS_MOVING = false;
var IS_RESIZING = false;

function previewFile(e) {
  e.preventDefault();
  var display = document.getElementById("file-display");
  display.className = "";

  // Get the file object and start the reader.
  var file = typeof e.target.files === "undefined" ?
             e.dataTransfer.files[0] :
             e.target.files[0],
      reader = new FileReader();

  if (typeof file === "undefined") {
    return;
  } else {
    // Give feedback about filename.
    var filename = document.getElementById("file-name");
    filename.innerHTML = file.name;

    // Display the image, hide the label and start cropping area.
    reader.onload = function(e) {
      var output = document.getElementById("file-display");
      output.style.backgroundImage = "url(" + e.target.result + ")";
      var label = document.querySelector("#file-display p");
      label.style.display = "none";

      var overlays = document.querySelectorAll("[class^='overlay-']");
      var crop_area = document.getElementById("crop-area");
      sizeOverlays(overlays, crop_area)
    }

    reader.readAsDataURL(file);
  }
}

function previewCrop(image_container, screenshot_area, preview_area) {
  var cropped = "";

  var base64 = image_container.style.backgroundImage.slice(5, -2);

  var screenshot_bounds = screenshot_area.getBoundingClientRect();
  var container_bounds = image_container.getBoundingClientRect();
  var preview_bounds = preview_area.getBoundingClientRect();

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var image = new Image();
  image.onload = function() {
    // Check image orientation.
    var orientation = image.width > image.height ? "horizontal" : "vertical";
    // Get background image size.
    var bg_width = 0,
        bg_height = 0,
        border_top = 0,
        border_left = 0;
    if (orientation === "horizontal") {
      // Width of the image will be the same as the container.
      bg_width = container_bounds.width;
      bg_height = (image.height * container_bounds.width) / image.width;
      border_top = (container_bounds.height - bg_height) / 2;
    } else if (orientation === "vertical"){
      // Height of the image will be the same as the container.
      bg_height = container_bounds.height;
      bg_width = (image.width * container_bounds.height) / image.height;
      border_left = (container_bounds.width - bg_width) / 2;
    }
    var resize_ratio = image.height / bg_height;

    // Get crop area position relative to container.
    var relTop = screenshot_bounds.top - container_bounds.top;
    var relLeft = screenshot_bounds.left - container_bounds.left;

    // Get the crop area position relative to the real image.
    var top = (relTop - border_top) * resize_ratio;
    var left = (relLeft - border_left) * resize_ratio;
    // Get width and height of crop relative to real image.
    var width = screenshot_bounds.width * resize_ratio;
    var height = screenshot_bounds.height * resize_ratio;

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, preview_bounds.width, preview_bounds.height);
    context.drawImage(image, left, top, width, height, 0, 0, width, height);

    cropped = canvas.toDataURL();
    preview_area.style.backgroundImage = "url(" + cropped + ")";
  }
  image.src = base64;
}

function sizeOverlays(overlays, crop_area) {
  // 0. overlay-top
  // 1. overlay-bottom
  // 2. overlay-left
  // 3. overlay-right
  for (var i = 0; i < overlays.length; i++) {
    overlays[i].style.display = "block";
  }
  crop_area.style.display = "block";
  var container = crop_area.offsetParent;

  var top_height = crop_area.offsetTop;
  var bottom_height = (container.offsetHeight - (crop_area.offsetHeight + crop_area.offsetTop + 4))
  overlays[0].style.height = top_height + 'px';
  overlays[1].style.height = bottom_height + 'px';

  var middle_height = container.offsetHeight - (top_height + bottom_height + 4);
  overlays[2].style.height = middle_height + 'px';
  overlays[3].style.height = middle_height + 'px';

  overlays[2].style.top = top_height + 'px';
  overlays[3].style.top = top_height + 'px';

  overlays[2].style.width = crop_area.offsetLeft + 'px';
  overlays[3].style.width = (container.offsetWidth - (crop_area.offsetLeft + crop_area.offsetWidth + 4)) + 'px';
}

function dragOver(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

function dragAreas(areas) {
  var display = document.getElementById("file-display");
  for (var i = 0; i < areas.length; i++) {
    areas[i].addEventListener("dragenter", (e) => display.className = "hovered");
    areas[i].addEventListener("dragover", dragOver, false);
    areas[i].addEventListener("dragleave", (e) => display.className = "");
    areas[i].addEventListener("drop", previewFile, false);
  }
}

function move(div, xpos, ypos) {
  div.style.left = xpos + 'px';
  div.style.top = ypos + 'px';
  var overlays = document.querySelectorAll("[class^='overlay-']");
  var crop_area = document.getElementById("crop-area");
  sizeOverlays(overlays, crop_area);
}

function startMoving (e, container) {
  if(!IS_RESIZING) {
    IS_MOVING = true;
    e = e || window.event;

    var div = document.getElementById("crop-area");
    var posX = e.clientX,
        posY = e.clientY,
        divTop = div.style.top,
        divLeft = div.style.left,
        eWi = div.offsetWidth,
        eHe = div.offsetHeight,
        cWi = container.offsetWidth,
        cHe = container.offsetHeight;

    divTop = divTop.replace('px', '');
    divLeft = divLeft.replace('px', '');

    var diffX = posX - divLeft,
        diffY = posY - divTop;

    document.onmousemove = function(e){
      e = e || window.event;

      var posX = e.clientX,
          posY = e.clientY,
          aX = posX - diffX,
          aY = posY - diffY;
          if (aX < 0) aX = 0;
          if (aY < 0) aY = 0;
          if (aX + eWi > cWi) aX = cWi - eWi;
          if (aY + eHe > cHe) aY = cHe -eHe;

      move(div, aX, aY);
    }
  }
}

function startResizing(e, container) {
  IS_RESIZING = true;

  var div = e.target;
  var direction = e.target.className;
  var containerBounds = container.getBoundingClientRect();
  var toResize = document.getElementById('crop-area'),
      initSize = toResize.getBoundingClientRect();

  var initPosX = e.clientX,
      initPosY = e.clientY;

  document.onmousemove = function(e) {
    e = e || window.event;

    var posX = e.clientX,
        posY = e.clientY;

    var x = posX - initSize.left,
        y = posY - initSize.top;

    if (direction == 'resize-e') toResize.style.width = x + 'px';
    if (direction == 'resize-s') toResize.style.height = y + 'px';
    if (direction == 'resize-w') {
      var reverseX = initPosX - posX  + initSize.width;
      var relPosX = posX - containerBounds.left;
      toResize.style.width = reverseX + 'px';
      toResize.style.left = relPosX + 'px';
    }
    if (direction == 'resize-n') {
      var reverseY = initPosY - posY  + initSize.height;
      var relPosY = posY - containerBounds.top;
      toResize.style.height = reverseY + 'px';
      toResize.style.top = relPosY + 'px';
    }

    if (direction == 'resize-nw') {
      var reverseX = initPosX - posX  + initSize.width;
      var relPosX = posX - containerBounds.left;
      toResize.style.width = reverseX + 'px';
      toResize.style.left = relPosX + 'px';
      var reverseY = initPosY - posY  + initSize.height;
      var relPosY = posY - containerBounds.top;
      toResize.style.height = reverseY + 'px';
      toResize.style.top = relPosY + 'px';
    }
    if (direction == 'resize-ne') {
      toResize.style.width = x + 'px';
      var reverseY = initPosY - posY  + initSize.height;
      var relPosY = posY - containerBounds.top;
      toResize.style.height = reverseY + 'px';
      toResize.style.top = relPosY + 'px';
    }
    if (direction == 'resize-se') {
      toResize.style.width = x + 'px';
      toResize.style.height = y + 'px';
    }
    if (direction == 'resize-sw') {
      var reverseX = initPosX - posX  + initSize.width;
      var relPosX = posX - containerBounds.left;
      toResize.style.width = reverseX + 'px';
      toResize.style.left = relPosX + 'px';
      toResize.style.height = y + 'px'
    }

    var overlays = document.querySelectorAll("[class^='overlay-']");
    var crop_area = document.getElementById("crop-area");
    sizeOverlays(overlays, crop_area);
  }
}

function clear() {
  IS_MOVING = false;
  IS_RESIZING = false;
  document.onmousemove = function(){}
}

document.addEventListener("DOMContentLoaded", function() {
  // Hide real file input for better style handling.
  var input = document.getElementById("file-upload");
  input.addEventListener("change", previewFile);
  var fake_input = document.getElementById("file-upload-fake");
  fake_input.addEventListener("click", () => input.click());

  var container = document.getElementById("file-display");

  // Event listener for dragging files to field.
  var drag_areas = document.querySelectorAll("#file-display, [class^='overlay-']");
  container.addEventListener("dragenter", function (e) {
    // Check that it's actually a file that is being dragged,
    // or that one of our drag events is happening.
    if (e.dataTransfer || IS_MOVING || IS_RESIZING) {
      dragAreas(drag_areas);
    }
  });

  // Moving functions.
  var crop_area = document.getElementById("crop-area");
  crop_area.addEventListener('mousedown', (e) => startMoving(e, container));

  // Resizing functions.
  var resize_handles = document.querySelectorAll("div[class^='resize-']");
  for (var i = 0; i < resize_handles.length; i++) {
    resize_handles[i].addEventListener('mousedown', (e) => startResizing(e, container));
  }

  // Crop preview button.
  var preview_button = document.getElementById("crop-preview-button");
  var preview_area = document.getElementById("crop-preview");
  preview_button.addEventListener('click', function(e) {
    previewCrop(container, crop_area, preview_area);
  });

  // Clear resize and move events.
  window.addEventListener('mouseup', clear, false);
});
